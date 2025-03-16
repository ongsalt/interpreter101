import { test } from "bun:test"
import { Lexer } from "../src/interpreter/lexer"
import { Parser } from "../src/interpreter/parser"
import { Interpreter } from "../src/interpreter/runtime"

test("if", async () => {
    const code = await Bun.file("./testcases/statement/if.bs").text()

    const lexer = new Lexer(code)
    const tokens = lexer.scan()
    const parser = new Parser(tokens);
    const program = parser.parse()
    const interpreter = new Interpreter(program)


    // console.dir(program, {
    //     depth: null
    // })


    interpreter.run()

})