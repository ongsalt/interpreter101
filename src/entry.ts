import { Lexer } from "./interpreter/lexer";

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
    console.log(lexer.tokens)
}

export async function startRepl() {
    for await (const line of console) {
        console.log(line);
        run(line)
    }
}
