import { test } from "bun:test"
import { Lexer } from "../src/interpreter/lexer"
import { Parser } from "../src/interpreter/parser"
import { Interpreter } from "../src/interpreter/runtime"


test("Basic statement parsing", async () => {
    const input = await Bun.file("testcases/statement/basic.bs").text()

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

test("nested scope", async () => {
    const input = await Bun.file("testcases/statement/nested-scope.bs").text()

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


test("scope expression", async () => {
    const input = await Bun.file("testcases/statement/scope-expression.bs").text()

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