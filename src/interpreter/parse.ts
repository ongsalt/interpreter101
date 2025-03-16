// i want to do functional parsing, will implement next time

import { reportError, type InterpreterError } from "./error";
import type { Expr } from "./expression";
import type { NonUnitLiteralToken, Token, TokenType } from "./token";

export function parse(tokens: Token[]) {
    let index = 0

    function current(): Token {
        return tokens[index]
    }

    function previous(): Token {
        return tokens[index - 1]
    }

    function isAtEnd() {
        return current().type == "EOF";
    }


    function advance() {
        if (!isAtEnd()) {
            index += 1
        }
        return previous()
    }

    function check(tokenTypes: TokenType): boolean {
        if (isAtEnd()) {
            return false
        }
        return current().type == tokenTypes;
    }

    function match(...tokenTypes: TokenType[]) {
        for (const tokenType of tokenTypes) {
            if (check(tokenType)) {
                advance();
                return true;
            }
        }
        return false
    }

    function consume(tokenType: TokenType, message: string) {
        if (check(tokenType)) {
            return advance()
        }

        throw error(current(), message);
    }

    function synchronize() {
        advance();

        while (!isAtEnd()) {
            // skip until endline
            if (previous().type == "SEMICOLON") return;

            // or until detect a (likely) new statement
            const target: TokenType[] = ["CLASS", "FUN", "VAR", "FOR", "IF", "WHILE", "PRINT", "RETURN"]
            if (target.includes(current().type)) {
                return
            }

            advance();
        }
    }

    function error(token: Token, message: string): InterpreterError {
        // Logger.error(token, message);
        reportError(token, message)
        return {
            kind: "parsing-error",
            line: token.line,
            message
        }
    }

    // Rule ---

    function expression(): Expr {
        return equality()
    }

    function equality(): Expr {
        let expr = comparison()

        while (match("BANG_EQUAL", "EQUAL_EQUAL")) {
            const operator = previous();
            const right = comparison();
            expr = {
                kind: "binary",
                left: expr,
                operator: operator,
                right
            }
        }

        return expr
    }

    function comparison(): Expr {
        let expr = term()

        while (match("LESS", "LESS_EQUAL", "GREATER", "GREATER_EQUAL")) {
            const operator = previous();
            const right = term();
            expr = {
                kind: "binary",
                left: expr,
                operator: operator,
                right
            }
        }

        return expr

    }

    function term(): Expr {
        let expr = factor()

        while (match("MINUS", "PLUS")) {
            const operator = previous();
            const right = factor();
            expr = {
                kind: "binary",
                left: expr,
                operator: operator,
                right
            }
        }

        return expr
    }

    function factor(): Expr {
        let expr = unary()

        while (match("STAR", "SLASH")) {
            const operator = previous();
            const right = unary();
            expr = {
                kind: "binary",
                left: expr,
                operator: operator,
                right
            }
        }

        return expr
    }

    function unary(): Expr {
        if (match("BANG", "MINUS")) {
            const operator = previous();
            const right = unary();
            return {
                kind: "unary",
                operator,
                right
            }
        }
        return primary()
    }

    function primary(): Expr {
        if (match("FALSE")) {
            return {
                kind: "literal",
                value: {
                    type: "FALSE",
                }
            }
        }

        if (match("TRUE")) {
            return {
                kind: "literal",
                value: {
                    type: "TRUE",
                }
            }
        }

        if (match("FALSE")) {
            return {
                kind: "literal",
                value: {
                    type: "FALSE",
                }
            }
        }

        if (match("FALSE")) {
            return {
                kind: "literal",
                value: {
                    type: "NIL",
                }
            }
        }

        if (match("NUMBER")) {
            return {
                kind: "literal",
                value: {
                    type: "NUMBER",
                    value: (previous() as NonUnitLiteralToken).value as number
                }
            }
        }

        if (match("LEFT_PAREN")) {
            const expr = expression();
            consume("RIGHT_PAREN", "Expect ')' after expression.");
            return {
                kind: "grouping",
                expression: expr
            }
        }

        throw error(current(), "Expect expression.");

    }



    // Body --- 
    
    try {
        return expression();
    } catch (error) {
        console.error(error)
        return null;
    }

}

