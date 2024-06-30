export async function runFile(path: string) {
    const content = await Bun.file(path).text()
    run(content)
}

export function run(code: string) {

}

export async function startRepl() {
    for await (const line of console) {
        console.log(line);
        run(line)
    }
}
