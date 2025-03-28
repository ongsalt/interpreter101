import { expect, test } from "bun:test"
import { Lexer } from "../src/interpreter/lexer"
import { Parser } from "../src/interpreter/parser"


test("Basic expression parsing", async () => {
    const input = await Bun.file("testcases/expression.bs").text()

    const lexer = new Lexer(input)
    const tokens = lexer.scan()
    const parser = new Parser(tokens);
    const expression = parser.parse()
    
    // expect(evaluate(expression)).toBe(3084)
})