// Rebuilds the photos, then commits only the photo outputs, folding them into the latest commit that has the message.
// Usage: npm run photos:commit [-- --push] [-- -m "other message"] [-- --skip-photos]
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const photoPaths = ["public/photos/board", "src/content/gallery.json"];

export function parseOptions(args) {
    const options = { message: "update gallery", push: false, skipPhotos: false };
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === "--push") {
            options.push = true;
        } else if (arg === "--skip-photos") {
            options.skipPhotos = true;
        } else if (arg === "-m" || arg === "--message") {
            options.message = args[++index];
        } else if (arg.startsWith("--message=")) {
            options.message = arg.slice("--message=".length);
        }
    }
    return options;
}

// commits are newest first: [{ hash, subject }].
export function chooseFold(commits, message) {
    const index = commits.findIndex((commit) => commit.subject === message);
    if (index === -1) {
        return { action: "new" };
    }
    return { action: index === 0 ? "amend" : "fixup", target: commits[index].hash };
}

export function stagedOutsidePhotos(stagedFiles) {
    return stagedFiles.filter((file) => !photoPaths.some((photoPath) => file === photoPath || file.startsWith(`${photoPath}/`)));
}

function run(command, args, { env, input, quiet = false } = {}) {
    const result = spawnSync(command, args, {
        encoding: "utf8",
        env: { ...process.env, ...env },
        input,
        shell: process.platform === "win32" && command === "npm",
        stdio: quiet ? ["pipe", "pipe", "pipe"] : "inherit",
    });
    if (result.status !== 0) {
        const detail = quiet ? `\n${result.stderr || result.stdout}` : "";
        throw new Error(`${command} ${args.join(" ")} failed.${detail}`);
    }
    return quiet ? result.stdout.trim() : "";
}

function git(...args) {
    return run("git", args, { quiet: true });
}

function lines(text) {
    return text ? text.split("\n").filter(Boolean) : [];
}

function stop(message) {
    console.error(`\n${message}`);
    process.exit(1);
}

function rebaseInProgress() {
    const gitDirectory = git("rev-parse", "--git-dir");
    return ["rebase-merge", "rebase-apply"].some((name) => existsSync(path.join(gitDirectory, name)));
}

function tryGit(...args) {
    return spawnSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).status === 0;
}

// Rebuilds `target` and every commit after it straight from git's object store, swapping in the staged photos.
// Nothing is checked out, so untracked or locked files and line-ending conversion can't interrupt it.
function foldInto(target) {
    const later = lines(git("rev-list", "--reverse", `${target}..HEAD`));
    const stagedPhotos = git("ls-files", "--stage", "--", ...photoPaths);
    const scratchIndex = path.join(git("rev-parse", "--git-dir"), "photo-commit-index");
    const env = { GIT_INDEX_FILE: scratchIndex };

    function rebuild(commit, parent) {
        run("git", ["read-tree", commit], { env, quiet: true });
        run("git", ["rm", "-r", "-q", "--cached", "--ignore-unmatch", "--", ...photoPaths], { env, quiet: true });
        run("git", ["update-index", "--index-info"], { env, input: `${stagedPhotos}\n`, quiet: true });
        const tree = run("git", ["write-tree"], { env, quiet: true });
        const [name, email, date] = git("log", "-1", "--format=%an%x00%ae%x00%aD", commit).split("\0");
        const message = git("log", "-1", "--format=%B", commit);
        return run("git", ["commit-tree", tree, "-p", parent, "-F", "-"], {
            env: { GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_AUTHOR_DATE: date },
            input: `${message}\n`,
            quiet: true,
        });
    }

    try {
        let head = rebuild(target, git("rev-parse", `${target}^`));
        for (const commit of later) {
            head = rebuild(commit, head);
        }
        git("update-ref", "-m", "photos:commit: fold photos", "HEAD", head, git("rev-parse", "HEAD"));
        // The real index already holds the photos; this just lines it up with the rewritten HEAD.
        git("reset", "-q");
    } finally {
        rmSync(scratchIndex, { force: true });
    }
}

// True when the branch has replaced commits the remote already has, so a plain push would be rejected.
function needsForcePush() {
    return tryGit("rev-parse", "--abbrev-ref", "@{u}") && !tryGit("merge-base", "--is-ancestor", "@{u}", "HEAD");
}

function main() {
    const options = parseOptions(process.argv.slice(2));

    if (rebaseInProgress()) {
        stop("A rebase is already in progress. Finish it (git rebase --continue) or cancel it (git rebase --abort) first.");
    }

    const otherStaged = stagedOutsidePhotos(lines(git("diff", "--cached", "--name-only")));
    if (otherStaged.length > 0) {
        stop(`Other files are staged, and this script only commits photos. Unstage them first (git restore --staged <file>):\n  ${otherStaged.join("\n  ")}`);
    }

    if (!options.skipPhotos) {
        run("npm", ["run", "photos"]);
    }

    git("add", "-A", "--", ...photoPaths);
    if (lines(git("diff", "--cached", "--name-only")).length === 0) {
        console.log("\nNo photo changes to commit.");
        return;
    }

    const commits = lines(git("log", "-200", "--format=%H%x09%s")).map((line) => {
        const [hash, ...subject] = line.split("\t");
        return { hash, subject: subject.join("\t") };
    });
    const fold = chooseFold(commits, options.message);

    if (fold.action === "new") {
        git("commit", "-m", options.message);
        console.log(`\nMade a new "${options.message}" commit.`);
    } else if (fold.action === "amend") {
        git("commit", "--amend", "--no-edit");
        console.log(`\nFolded the photos into the latest commit, "${options.message}".`);
    } else {
        // Folding past a later commit that also changed the photos would silently drop its photo changes.
        const photoCommits = lines(git("log", "--format=%h %s", `${fold.target}..HEAD`, "--", ...photoPaths));
        if (photoCommits.length > 0) {
            stop([
                `Nothing changed: a later commit also changes the photos, so folding into "${options.message}" would undo it.`,
                `  ${photoCommits.join("\n  ")}`,
                "Your photo changes are staged. Run this again with -m set to that later commit's message to fold into it,",
                "or commit them on their own.",
            ].join("\n"));
        }
        foldInto(fold.target);
        console.log(`\nFolded the photos into "${options.message}" (${fold.target.slice(0, 7)}), keeping the commits after it.`);
    }

    console.log(git("log", "--oneline", "-3"));

    const pushCommand = needsForcePush() ? ["push", "--force-with-lease"] : ["push"];
    if (options.push) {
        run("git", pushCommand);
        console.log("\nPushed.");
    } else {
        console.log(`\nNot pushed. When it looks right: git ${pushCommand.join(" ")}`);
    }
}

// Only when run directly; importing the file (tests, other scripts, `node -e`) just loads its functions.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        main();
    } catch (error) {
        stop(error.message);
    }
}
