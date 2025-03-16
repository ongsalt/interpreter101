import { err, ok, type Result } from "../utils/result";
import { ParserError } from "./error";
import type { AssignmentExpression, BinaryExpr, BlockExpression, Expr, ExpressionStatement, Identifier, PrintStatement, Program, Statement, Unary, VariableDeclarationStatement } from "./grammar";
import type { IdentifierToken, LiteralToken, NonUnitLiteralToken, Token } from "./token";

// mostly copied from Sway compiler
export class Parser {
    private current = 0
    constructor(public tokens: Token[]) { }

    private get isAtEnd() {
        return this.current >= this.tokens.length;
    }

    private next() {
        return this.tokens[this.current++] // yield current and move the pointer to next one
    }

    private peek() {
        if (this.isAtEnd) return undefined;
        return this.tokens.at(this.current)!;
    }

    get line() {
        return this.peek()?.line
    }

    // TODO: keep stack trace
    private safe<T>(fn: () => T): Result<T> { // auto unwinding
        const position = this.current
        // BRUH
        try {
            return ok(fn())
        } catch (error) {
            if (!(error instanceof ParserError)) {
                throw error;
            }
            // console.log('[unwinding] ',error)
            this.current = position
            return err(error as any)
        }
    }

    private consume<T = Token>(type: Token["type"], message?: string): T { // TODO: im too lazy to make the type
        const token = this.peek()!

        if (token.type != type) {
            const errorMessage = message ?? `Expecting ${type}`
            throw new ParserError("expected", `${errorMessage} at line ${token.line}`) // TODO: make error enum
        }

        this.next()
        return token as unknown as T
    }

    private repeat<T>(fn: () => T) {
        while (true) {
            const { ok } = this.safe(fn)
            if (!ok) {
                return
            }
        }
    }

    // private consumeReduce<T, U = T[]>(consume: () => T, reducer: (acc: U, value: T) => U, initial: U): U {
    //     let acc = initial
    //     this.repeat(() => {
    //         const value = consume()
    //         acc = reducer(acc, value)
    //     })
    //     return acc
    // }

    // private consumeAll<T>(consume: () => T): T[] {
    //     return this.consumeReduce(consume, (acc, value) => [...acc, value], [] as T[])
    // }

    private consumeAll<T>(consume: () => T): T[] {
        const out: T[] = []
        this.repeat(() => out.push(consume()))
        return out
    }

    private safeOneOf<T>(fns: (() => T)[]): Result<T> {
        for (const fn of fns) {
            const res = this.safe(() => fn())
            if (res.ok) {
                return ok(res.value)
            }
        }

        return err(undefined)
    }

    private oneOf<T, E extends Error = ParserError>(
        fns: (() => T)[],
        errorBuilder: (e: any) => E = (() => new ParserError("expected", "not exist") as Error as E)
    ): T {
        const res = this.safeOneOf(fns)
        if (!res.ok) {
            throw errorBuilder(res.error)
        }

        return res.value
    }

    // shorthand for oneOf for token
    private match<const T extends Token["type"][]>(...types: T) {
        return this.oneOf(types.map(it => () => this.consume(it)))
    }

    // ignore every token untill reach next statement 
    private synchronize() {
        while (!this.isAtEnd) {
            const current = this.next()
            const t: Token["type"][] = ["CLASS", "FUN", "VAR", "FOR", "IF", "WHILE", "PRINT", "RETURN"]
            if (t.includes(current.type)) {
                return
            }
        }
    }

    parse() {
        // console.log(this.tokens)
        return this.program()
    }

    program(): Program {
        const statements = this.consumeAll(() => this.statement())
        // console.log(this.peek())
        this.consume("EOF")
        return {
            kind: "program",
            statements
        }
    }

    block(): BlockExpression {
        this.consume("LEFT_BRACE")
        const statements = this.consumeAll(() => this.statement())
        this.consume("RIGHT_BRACE")
        return {
            kind: "block",
            statements
        }
    }

    statement(): Statement {
        return this.oneOf<Statement>([
            () => ({
                kind: "expression",
                expression: this.block()
            }),
            () => this.variableDeclaration(),
            () => this.expressionStatement(),
            () => this.printStatement(),
        ])
    }

    variableDeclaration(): VariableDeclarationStatement {
        this.consume("VAR")
        const name = this.consume("IDENTIFIER").lexeme
        const value = this.safe(() => {
            this.consume("EQUAL")
            return this.expression()
        })
        this.consume("SEMICOLON")
        return {
            kind: "variable-declaration",
            constant: false, // TODO: think about this,
            name,
            value: value.value ?? null
        }
    }

    expressionStatement(): ExpressionStatement {
        const expression = this.expression()
        this.consume("SEMICOLON")
        return {
            kind: "expression",
            expression
        }
    }

    printStatement(): PrintStatement {
        this.consume("PRINT")
        const expression = this.expression()
        this.consume("SEMICOLON")
        return {
            kind: "print",
            expression
        }
    }

    expression(): Expr {
        return this.oneOf<Expr>([
            () => this.equality(),
            () => this.assignment(),
            () => this.block()
        ])
    }

    assignment(): AssignmentExpression {
        // this should accept thing like `object.value`
        const to = this.consume<IdentifierToken>("IDENTIFIER")
        this.consume("EQUAL")
        const value = this.expression()
        return {
            kind: "assignment",
            to: {
                kind: "identifier",
                name: to.value
            },
            value
        }
    }

    equality(): Expr {
        let expr = this.comparison()
        this.repeat(() => {
            const operator = this.match("BANG_EQUAL", "EQUAL_EQUAL");
            const right = this.comparison();
            expr = {
                kind: "binary",
                left: expr,
                operator,
                right
            }
        })

        return expr
    }

    comparison(): Expr {
        let expr = this.term()
        this.repeat(() => {
            const operator = this.match("LESS", "LESS_EQUAL", "GREATER", "GREATER_EQUAL");
            const right = this.term();
            expr = {
                kind: "binary",
                left: expr,
                operator,
                right
            }
        })
        return expr
    }

    term(): Expr {
        let expr = this.factor()
        this.repeat(() => {
            const operator = this.match("MINUS", "PLUS");
            const right = this.factor();
            expr = {
                kind: "binary",
                left: expr,
                operator,
                right
            }
        })
        return expr
    }

    factor(): Expr {
        let expr = this.unary()
        this.repeat(() => {
            const operator = this.match("SLASH", "STAR");
            const right = this.unary();
            expr = {
                kind: "binary",
                left: expr,
                operator,
                right
            }
        })
        return expr
    }

    unary(): Expr {
        return this.oneOf([
            () => {
                const operator = this.match("BANG", "MINUS")
                const right = this.unary()
                return {
                    kind: "unary",
                    operator,
                    right,
                }
            },
            () => this.primary(),
        ])
    }

    primary(): Expr {
        return this.oneOf<Expr>([
            () => {
                const value = this.match("NUMBER", "STRING", "TRUE", "FALSE", "NIL") as LiteralToken
                return {
                    kind: "literal",
                    value
                }
            },
            () => {
                const name = this.consume<IdentifierToken>("IDENTIFIER").value
                return {
                    kind: "identifier",
                    name
                }
            },
            () => {
                this.consume("LEFT_PAREN")
                const expression = this.expression()
                this.consume("RIGHT_PAREN")
                return {
                    kind: "grouping",
                    expression
                }
            },
        ])
    }
}