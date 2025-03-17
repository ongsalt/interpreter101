import { test } from "bun:test"
import { Lexer } from "../src/interpreter/lexer"
import { Parser } from "../src/interpreter/parser"
import { Interpreter } from "../src/interpreter/runtime"


test("function call", async () => {
    const input = await Bun.file("testcases/statement/function.bs").text()

    const lexer = new Lexer(input)
    const tokens = lexer.scan()
    const parser = new Parser(tokens);
    const program = parser.parse()
    const interpreter = new Interpreter(program)

    
    // console.dir(program, {
    //     depth: null
    // })
    
    interpreter.run()
})

// test("builtin function call", async () => {
//     const input = await Bun.file("testcases/statement/function.bs").text()

//     const lexer = new Lexer(input)
//     const tokens = lexer.scan()
//     const parser = new Parser(tokens);
//     const program = parser.parse()
//     const interpreter = new Interpreter(program)

    
//     // console.dir(program, {
//     //     depth: null
//     // })
    
//     // interpreter.run()
// })