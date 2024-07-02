import { Lexer } from "./interpreter/lexer";

export async function runFile(path: string) {
    const content = await Bun.file(path).text()
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
