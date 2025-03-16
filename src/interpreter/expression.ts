import type { LiteralToken, Token } from "./token"

export type Expr = BinaryExpr | Grouping | Literal | Unary

export type SyntaxKind =
    "binary" |
    "grouping" |
    "literal" |
    "numeric-literal" |
    "unary"

export type BinaryExpr = {
    kind: "binary",
    left: Expr,
    operator: Token
    right: Expr
}

export type Grouping = {
    kind: "grouping",
    expression: Expr,
}

export type Literal = {
    kind: "literal",
    value: LiteralToken,
}

export type Unary = {
    kind: "unary",
    operator: Token,
    right: Expr,
}