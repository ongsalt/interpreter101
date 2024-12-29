import type { Token } from "./token";

export type InterpreterError = {
    line: number,
    message: string,
    kind: "parsing-error"
}


export function reportError(token: Token, message: string) {
    if (token.type == "EOF") {
        console.log(`${token.line} at end ${message}`);
    } else {
        console.log(`${token.line} at '${token.lexeme}': ${message}`);
    }
}