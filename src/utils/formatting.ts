import type { Expr } from "../interpreter/expression";

export function printExpression(expression: Expr) {
    console.log(stringify(expression))
}

function stringify(expression: Expr): string {
    switch (expression.kind) {
        case "binary":
            return `${stringify(expression.left)} ${expression.operator.lexeme} ${stringify(expression.right)}`
        case "grouping":
            return `(${stringify(expression.expression)})`
        case "literal":
            const { type, } = expression.value
            if (type === "IDENTIFIER" || type === "NUMBER") {
                return `${expression.value.value}`
            } else if (type === "STRING") {
                return `"${expression.value.value}"`
            } else {
                return expression.value.type.toLowerCase()
            }
        case "unary":
            return `${expression.operator.lexeme}${stringify(expression.right)}`
    }
}

export {
    stringify as stringifyExpression
}