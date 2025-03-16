import { evaluate } from "./interpreter/runtime/interpreter";
import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";

export async function runFile(path: string) {
    const file = Bun.file(path)
    if (!await file.exists()) {
        console.log(`File not found: ${process.argv[2]}`)
        return
    }
    console.log(`Running ${process.argv[2]}`)
    const content = await file.text()
    run(content)
}

export function run(code: string) {
    const lexer = new Lexer(code)
    lexer.scan()
    const { tokens } = lexer
    console.log(tokens)
    const expression = new Parser(tokens).parse()

    if (expression === null) {
        return
    }

    console.dir(expression, {
        depth: null
    })

    evaluate(expression)
}

export async function startRepl() {
    for await (const line of console) {
        console.log(line);
        run(line)
    }
}
