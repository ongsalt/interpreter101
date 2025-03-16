export function unreachable(): never {
    throw new Error("Didn't expect to get here");
}
