export type InterpreterError = {
    line: number,
    message: string,
    kind: "parsing-error"
}
