import { constants } from "node:fs";
import { copyFile, readdir, rmdir, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

async function flattenSegments(directory, destination, prefix) {
    let count = 0;

    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const source = join(directory, entry.name);
        const filename = `${prefix}.${entry.name}`;

        if (entry.isDirectory()) {
            count += await flattenSegments(source, destination, filename);
        } else if (entry.isFile() && entry.name.endsWith(".txt")) {
            await copyFile(source, join(destination, filename), constants.COPYFILE_EXCL);
            await unlink(source);
            count += 1;
        } else {
            throw new Error(`Unexpected segment export: ${source}`);
        }
    }

    await rmdir(directory);
    return count;
}

export async function fixExportPaths(directory) {
    let count = 0;

    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === "_next") {
            continue;
        }

        const child = join(directory, entry.name);

        if (entry.name.startsWith("__next.")) {
            count += await flattenSegments(child, directory, entry.name);
        } else {
            count += await fixExportPaths(child);
        }
    }

    return count;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const count = await fixExportPaths(resolve("out"));
    console.log(`Fixed ${count} static export prefetch paths.`);
}
