import type { LiteralToken, NumericLiteralToken, Token } from "./token"

export type Expr = BinaryExpr | Grouping | Literal | Unary

export type SyntaxKind =
    "binary" |
    "grouping" |
    "literal" |
    "numeric-iteral" |
    "unary"

export type BinaryExpr = {
    kind: "binary",
    left: Expr,
    operator: Token
    rigth: Expr
}

export type Grouping = {
    kind: "grouping",
    expression: Expr,
}

export type Literal = {
    kind: "literal",
    value: LiteralToken | NumericLiteralToken,
}

export type NumericLiteral = {
    kind: "numeric-iteral",
    value: NumericLiteralToken,
}

export type Unary = {
    kind: "unary",
    operator: Token,
    right: Expr,
}