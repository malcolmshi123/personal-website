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
