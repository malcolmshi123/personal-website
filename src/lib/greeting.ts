export const greetingTokens: readonly string[] = ["Hi", ",", " I", "’m", " Mal", "colm", "."];

export const greetingAccentFrom = 4;

export function shouldStreamGreeting(alreadyPlayed: boolean, reducedMotion: boolean): boolean {
    return !alreadyPlayed && !reducedMotion;
}

export function formatStreamReadout(shown: number, total: number, elapsedMs: number): string {
    if (shown >= total) {
        return `${total} tokens · done`;
    }

    const rate = Math.round((shown / Math.max(elapsedMs, 1)) * 1000);
    return `${shown} tokens · ${rate} tok/s`;
}

export function initialReadout(flag: string | undefined): string {
    return flag === "done" ? formatStreamReadout(greetingTokens.length, greetingTokens.length, 0) : "";
}

// React's development double-mount unmounts before the first token, so only a started stream counts as seen.
export function greetingFlagAfterUnmount(shown: number): "stream" | "done" {
    return shown > 0 ? "done" : "stream";
}
