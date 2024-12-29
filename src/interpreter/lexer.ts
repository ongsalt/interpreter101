import { Logger } from "../logger"
import { keywords } from "./keyword"
import type { KeywordTokenType, SpecialTokenType, SymbolTokenType, Token, TwoCharacterSymbolTokenType } from "./token"

export class Lexer {
    private hasError = false
    tokens: Token[] = []

    private start = 0
    private current = 0
    private line = 1

    constructor(private source: string) { }

    isAtEnd() {
        return this.current >= this.source.length
    }

    scan() {
        while (!this.isAtEnd()) {
            // Starting of new token
            this.start = this.current
            const c = this.next()

            // For everything that is not sepearated by 
            switch (c) {
                case '(': this.addNonLiteralToken("LEFT_PAREN"); break;
                case ')': this.addNonLiteralToken("RIGHT_PAREN"); break;
                case '{': this.addNonLiteralToken("LEFT_BRACE"); break;
                case '}': this.addNonLiteralToken("RIGHT_BRACE"); break;
                case ',': this.addNonLiteralToken("COMMA"); break;
                case '.': this.addNonLiteralToken("DOT"); break;
                case '-': this.addNonLiteralToken("MINUS"); break;
                case '+': this.addNonLiteralToken("PLUS"); break;
                case ';': this.addNonLiteralToken("SEMICOLON"); break;
                case '*': this.addNonLiteralToken("STAR"); break;

                case '!':
                    this.addNonLiteralToken(this.match('=') ? "BANG_EQUAL" : "BANG");
                    break;
                case '=':
                    this.addNonLiteralToken(this.match('=') ? "EQUAL_EQUAL" : "EQUAL");
                    break;
                case '<':
                    this.addNonLiteralToken(this.match('=') ? "LESS_EQUAL" : "LESS");
                    break;
                case '>':
                    this.addNonLiteralToken(this.match('=') ? "GREATER_EQUAL" : "GREATER");
                    break;
                case '/':
                    // if it is not comment
                    if (!this.match('/')) {
                        this.addNonLiteralToken('SLASH')
                        break
                    }
                    // skip until endline
                    while (!this.isAtEnd() && this.peek() != '\n') this.next()
                    break
                case ' ':
                case '\r':
                case '\t':
                    // Ignore whitespace.
                    break;
                case '\n':
                    this.addNonLiteralToken("NEW_LINE")
                    this.line++;
                    break;
                case '"':
                    this.string();
                    break;

                default:
                    // Number literal
                    if (this.isDigit(c)) {
                        this.number();
                    } else if (this.isValidIdentifierStaringCharacter(c)) { // Identifier
                        this.identifier();
                    } else {
                        Logger.error({
                            kind: "parsing-error",
                            line: this.line,
                            message: "Unexpected character"
                        })
                    }


                    // or found something that is not support 
                    // But what we support the entire unicode range
                    break;
            }
        }
    }

    match(expected: string) {
        if (this.isAtEnd()) {
            return false
        }

        if (this.source.at(this.current) !== expected) {
            return false
        }

        // Consume it
        this.current++
        return true
    }

    next() {
        return this.source[this.current++] // consume
    }

    // Not gonna consume
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    peekNext() {
        if (this.current === this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private string() {
        // current is "
        // allow multiline string
        // capture everything until another " 
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.next();
        }

        if (this.isAtEnd()) {
            Logger.error({
                kind: "parsing-error",
                line: this.line,
                message: "Unterminated string"
            })
            return;
        }

        // consume the closing "
        this.next();

        // Trim the surrounding quotes
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.tokens.push({
            type: "STRING",
            value,
            lexeme: this.currentWord(),
            line: this.line
        });
    }

    private number() {
        // consume number before . 
        while (this.isDigit(this.peek())) {
            this.next()
        }

        // Look for a fractional part.
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.next();

            // consume number after . 
            while (this.isDigit(this.peek())) {
                this.next()
            }
        }

        const lexeme = this.currentWord()
        this.tokens.push({
            type: "NUMBER",
            lexeme,
            line: this.line,
            value: parseFloat(lexeme)
        })
    }

    private isDigit(str: string) {
        return (str.length === 1) && !Number.isNaN(parseInt(str))
    }

    private identifier() {
        while (this.isValidIdentifierCharacter(this.peek())) {
            this.next()
        }

        const lexeme = this.currentWord()
        const type = keywords.get(lexeme) ?? "IDENTIFIER"

        this.tokens.push({
            type,
            lexeme,
            value: lexeme,
            line: this.line
        })
    }

    private isValidIdentifierCharacter(c: string) {
        // every thing that is alpahabet, number or is after basic latin block 
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_' || c.charCodeAt(0) > 0x007F

    }

    private isValidIdentifierStaringCharacter(c: string) {
        return !this.isDigit(c)
    }

    private addNonLiteralToken(tokenType: KeywordTokenType | SymbolTokenType | TwoCharacterSymbolTokenType | SpecialTokenType) {
        this.tokens.push({ type: tokenType, lexeme: this.currentWord(), line: this.line })
    }

    private currentWord() {
        return this.source.substring(this.start, this.current)
    }

}
