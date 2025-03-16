export function unreachable(message?: string): never {
    throw new Error(`Didn't expect to get here: ${message}`);
}
