import type { Token } from "./token";

export type InterpreterError = {
    line: number,
    message: string,
    kind: "parsing-error"
}

export type ErrorKind = "expected" | "invalid" | "stop-signal"

export class ParserError extends Error {
    constructor(public kind: ErrorKind,message: string) {
        super(`${kind}: ${message}`);
    }
}

export function reportError(token: Token, message: string) {
    if (token.type == "EOF") {
        console.log(`${token.line} at end ${message}`);
    } else {
        console.log(`${token.line} at '${token.lexeme}': ${message}`);
    }
}