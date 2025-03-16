import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";
import { Interpreter } from "./interpreter/runtime";

export async function runFile(path: string, showAST = false) {
    const file = Bun.file(path)
    if (!await file.exists()) {
        console.log(`File not found: ${path}`)
        return
    }
    console.log(`Running ${path}`)
    const content = await file.text()
    run(content, showAST)
}

export function run(code: string, showAST = false) {
    const lexer = new Lexer(code)
    const tokens = lexer.scan()
    const parser = new Parser(tokens);
    const program = parser.parse()
    const interpreter = new Interpreter(program)

    if (showAST) {
        console.dir(program, {
            depth: null
        })
    }

    interpreter.run()
}

export async function startRepl() {
    for await (const line of console) {
        console.log(line);
        run(line)
    }
}
