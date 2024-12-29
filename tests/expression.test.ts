import { expect, test } from "bun:test"
import { Lexer } from "../src/interpreter/lexer"
import { parse } from "../src/interpreter/parser"
import { printExpression } from "../src/utils/formatting"


test("Basic expression parsing", async () => {
    const input = await Bun.file("testcase/expression.bs").text()
    
    const lexer = new Lexer(input)
    const tokens = lexer.scan()
    const expression = parse(tokens)

    expect(expression).not.toBe(null)

    printExpression(expression!)
})