export interface InterpreterError {
    line: number,
    message: string,
    kind: string
}

export class ParsingError implements InterpreterError {
    kind = "ParsingError"
    constructor(
        public line: number,
        public message: string,
    ) { }
}