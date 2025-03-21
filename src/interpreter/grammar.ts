import type { LiteralToken, Token } from "./token"

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

export type Identifier = {
    kind: "identifier",
    name: string
}

export type CallExpression = {
    kind: "call",
    target: Expr,
    arguments: Expr[]
}

// will this make thing complicate 
export type BlockExpression = {
    kind: "block",
    statements: Statement[],
    last: Expr | null
}

export type IfExpression = {
    kind: "if",
    condition: Expr,
    then: BlockExpression,
    else: BlockExpression | IfExpression | null
}

export type ForExpression = {
    kind: "for",
    loopVariable: Identifier,
    range: RangeExpression,
    block: BlockExpression
}

export type RangeExpression = {
    kind: "range"
    inclusive: boolean,
    from: Expr,
    to: Expr
}

export type WhileExpression = {
    kind: "while",
    condition: Expr,
    block: BlockExpression,
}

export type AssignmentExpression = {
    kind: "assignment",
    to: Identifier,
    value: Expr
}

export type Expr = BinaryExpr | Grouping | Literal | Unary | Identifier | BlockExpression | AssignmentExpression
    | IfExpression | ForExpression | WhileExpression | RangeExpression | CallExpression

        
export type ExpressionStatement = {
    kind: "expression",
    expression: Expr
}

export type PrintStatement = {
    kind: "print",
    expression: Expr
}

export type VariableDeclarationStatement = {
    kind: "variable-declaration",
    name: string,
    constant: boolean,
    value: Expr | null
}

export type Statement = ExpressionStatement | PrintStatement | VariableDeclarationStatement;

export type Program = {
    kind: "program",
    statements: Statement[]
}
