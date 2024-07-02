import type { InterpreterError } from "./interpreter/error"

export class Logger {
    static log(...params: any) {
        console.log(...params)
    }
    
    static error(error: InterpreterError) {
        console.error(`[]`)
    }
}