import type { Token } from "./token";

export type InterpreterError = {
    line: number,
    message: string,
    kind: "parsing-error"
}

export type ParserErrorKind = "expected" | "invalid" | "stop-signal"
export type RuntimeErrorKind = "identifier-not-found" | "unsupported-operation"

export class ParserError extends Error {
    constructor(public kind: ParserErrorKind, message: string = "") {
        super(`${kind}: ${message}`);
    }
}

export class RuntimeError extends Error {
    constructor(public kind: RuntimeErrorKind, message: string = "") {
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