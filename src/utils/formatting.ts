import type { Expr } from "../interpreter/expression";

export function printExpression(expression: Expr) {
    const { kind } = expression
    if (kind === "grouping") {
        console.log("(")
        printExpression(expression.expression)
        console.log(")")
    } else if (kind === "binary") {
        printExpression(expression.left)
        console.log(expression.operator.lexeme)
        printExpression(expression.right)
    } else if (kind === "literal") {
        const { type } = expression.value
        if (type === "IDENTIFIER" || type === "NUMBER") {
            console.log(expression.value.value)
        } else if (type === "STRING") {
            console.log(`"${expression.value.value}"`)
        } else {
            console.log(expression.value.type.toLowerCase())
        }
    } else if (kind === "unary") {
        console.log(expression.operator.lexeme)
        printExpression(expression.right)
    }
}