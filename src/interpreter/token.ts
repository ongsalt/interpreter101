export type KeywordTokenType = "AND" | "CLASS" | "ELSE" | "FALSE" | "FUN" | "FOR" | "IF" | "NIL" | "OR" |
    "PRINT" | "RETURN" | "SUPER" | "THIS" | "TRUE" | "VAR" | "WHILE"

export type LiteralTokenType = "IDENTIFIER" | "STRING"
export type NumberLiteralTokenType = "NUMBER"

export type SymbolTokenType = "LEFT_PAREN" | "RIGHT_PAREN" | "LEFT_BRACE" | "RIGHT_BRACE" |
    "COMMA" | "DOT" | "MINUS" | "PLUS" | "SEMICOLON" | "SLASH" | "STAR" | "NEW_LINE"

export type TwoCharacterSymbolTokenType = "BANG" | "BANG_EQUAL" |
    "EQUAL" | "EQUAL_EQUAL" |
    "GREATER" | "GREATER_EQUAL" |
    "LESS" | "LESS_EQUAL"

export type SpecialTokenType = "EOF"


export type NumericLiteralToken = {
    type: NumberLiteralTokenType,
    value: number
}

export type LiteralToken = {
    type: LiteralTokenType,
    value: string
}

export type Token = {
    line: number,
    lexeme: string
} & (
        {
            type: KeywordTokenType | SymbolTokenType | TwoCharacterSymbolTokenType | SpecialTokenType
        } | NumericLiteralToken | LiteralToken
    )

export type TokenType = Token['type']