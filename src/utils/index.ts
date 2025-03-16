export function unreachable(message?: string): never {
    throw new Error(`Didn't expect to get here: ${message}`);
}


export function unimplemented(message: string): never {
    throw new Error(`Unimplemented: ${message}`);
}
