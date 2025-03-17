export type KeywordTokenType = "AND" | "CLASS" | "ELSE" | "FUN" | "FOR" | "IF" | "OR" |
    "PRINT" | "RETURN" | "SUPER" | "THIS" | "VAR" | "WHILE" | "IN"

export type LiteralTokenType =  "STRING" | "TRUE" | "FALSE" | "NUMBER" | "NIL"
export type IdentifierTokenType = "IDENTIFIER"

export type SymbolTokenType = "LEFT_PAREN" | "RIGHT_PAREN" | "LEFT_BRACE" | "RIGHT_BRACE" |
    "COMMA" | "DOT" | "MINUS" | "PLUS" | "SEMICOLON" | "SLASH" | "STAR" | "NEW_LINE" | "DOT_DOT" | "DOT_DOT_EQUAL"

export type TwoCharacterSymbolTokenType = "BANG" | "BANG_EQUAL" |
    "EQUAL" | "EQUAL_EQUAL" |
    "GREATER" | "GREATER_EQUAL" |
    "LESS" | "LESS_EQUAL"

export type SpecialTokenType = "EOF"

export type LiteralToken = NonUnitLiteralToken | UnitLiteralToken

export type IdentifierToken = {
    type: IdentifierTokenType,
    value: string
}

export type NonUnitLiteralToken = {
    type: "STRING",
    value: string
} | {
    type: "NUMBER",
    value: number
}

export type UnitLiteralToken = {
    type: "TRUE",
} | {
    type: "FALSE",
} | {
    type: "NIL",
}

export type Token = {
    line: number,
    lexeme: string
} & (
        {
            type: KeywordTokenType | SymbolTokenType | TwoCharacterSymbolTokenType | SpecialTokenType
        } | LiteralToken | IdentifierToken
    )

export type TokenType = Token['type']