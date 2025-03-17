import { err, ok, type Result as NormalResult } from "../utils/result";
import { ParserError } from "./error";
import type { AssignmentExpression, BlockExpression, CallExpression, Expr, ExpressionStatement, ForExpression, Identifier, IfExpression, PrintStatement, Program, RangeExpression, Statement, VariableDeclarationStatement, WhileExpression } from "./grammar";
import type { IdentifierToken, LiteralToken, Token } from "./token";

type Result<T> = NormalResult<T, ParserError>

// mostly copied from Sway compiler
export class Parser {
    private current = 0
    lastError: ParserError | null = null
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


    // use this when we think the programmer is making some silly error
    private must<T>(message: string, fn: () => T): T {
        try {
            return fn()
        } catch (e) {
            const error = e as ParserError;
            if (error.kind === "invalid") {
                // this.lastError = error
                throw this.lastError
            }
            this.lastError = new ParserError("invalid", message, this.peek())
            throw this.lastError
        }
    }

    // we will do auto unwinding for expression
    private safe<T>(fn: () => T): Result<T> { // auto unwinding
        const position = this.current
        // BRUH
        try {
            return ok(fn())
        } catch (e) {
            const error = e as ParserError
            // if (error.kind === "invalid") {
            //     throw error;
            // }
            // console.log('[unwinding] ',error)
            this.current = position
            return err(error as any)
        }
    }

    private consume<T = Token>(type: Token["type"], message?: string): T { // TODO: im too lazy to make the type
        const token = this.peek()!

        if (token.type != type) {
            const errorMessage = message ?? `Expecting ${type}`
            throw new ParserError("expected", `${errorMessage}`, this.peek()) // TODO: make error enum
        }

        this.next()
        return token as unknown as T
    }

    // this is hell for error message
    private repeat<T>(fn: () => T): ParserError {
        while (true) {
            const { ok, error } = this.safe(fn)
            if (!ok) {
                return error
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

    private consumeAll<T>(consume: () => T) {
        const out: T[] = []
        const terminatingError = this.repeat(() => out.push(consume()))
        return { out, terminatingError }
    }

    // todo: think of error message for this
    private safeOneOf<T>(fns: (() => T)[]): Result<T> {
        for (const fn of fns) {
            const res = this.safe(() => fn())
            // check if it critical or not
            if (res.ok) {
                return ok(res.value)
            } else if (res.error.kind === "invalid") {
                return err(res.error)
            }
        }

        return err(new ParserError("expected", "one of", this.peek()))
    }

    private oneOf<T>(
        fns: (() => T)[],
    ): T {
        const res = this.safeOneOf(fns)
        if (!res.ok) {
            throw res.error
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
        try {
            return this.program()
        } catch {
            throw this.lastError
        }
    }

    program(): Program {
        const { out: statements, terminatingError } = this.consumeAll(() => this.statement())
        if (terminatingError.kind === "invalid") {
            // console.log(this.peek())
            console.error(terminatingError)
        }
        this.consume("EOF")
        return {
            kind: "program",
            statements
        }
    }

    statement(): Statement {
        return this.oneOf<Statement>([
            () => this.variableDeclaration(),
            () => this.expressionStatement(),
            () => this.printStatement(),
            () => this.topLevelExpression()
        ])
    }

    variableDeclaration(): VariableDeclarationStatement {
        this.consume("VAR")
        const name = this.must("this must be a valid identifier", () => this.consume("IDENTIFIER").lexeme)
        const value = this.safe(() => {
            this.consume("EQUAL")
            return this.expression()
        })

        this.must("missing semicolon", () => this.consume("SEMICOLON"))
        return {
            kind: "variable-declaration",
            constant: false, // TODO: think about this,
            name,
            value: value?.value ?? null
        }
    }

    expressionStatement(): ExpressionStatement {
        const expression = this.expression()
        this.consume("SEMICOLON", "statement must end with a ;")
        return {
            kind: "expression",
            expression
        }
    }

    printStatement(): PrintStatement {
        this.consume("PRINT")
        const expression = this.must("There is nothing to print", () => this.expression())
        this.must("missing semicolon", () => this.consume("SEMICOLON"))
        return {
            kind: "print",
            expression
        }
    }

    topLevelExpression(): Statement {
        const expression = this.oneOf<Expr>([
            () => this.if(),
            () => this.while(),
            () => this.for(),
            () => this.block(),
        ])

        return {
            kind: "expression",
            expression
        }
    }

    expression(): Expr {
        return this.oneOf<Expr>([
            () => this.block(),
            () => this.if(),
            () => this.assignment(),
            () => this.logicalOr(),
        ])
    }

    block(): BlockExpression {
        this.consume("LEFT_BRACE")
        const { out: statements, terminatingError } = this.consumeAll(() => this.statement())
        if (terminatingError.kind === "invalid") {
            throw terminatingError
        }
        const last = this.safe(() => this.expression())
        // console.log(last.ok)
        this.must("block must have closing brace", () => this.consume("RIGHT_BRACE"))
        return {
            kind: "block",
            statements,
            last: last?.value ?? null
        }
    }

    // this is the wonder of js
    if(): IfExpression {
        this.consume("IF")
        const condition = this.expression()
        const then = this.must("There must be a block after an if condition", () => this.block());
        const _else = this.safe(() => {
            this.consume("ELSE")
            return this.must("There must be a block or another condition after an else", () => this.oneOf<IfExpression | BlockExpression>([
                () => this.block(),
                () => this.if(),
            ]))
        })

        return {
            kind: "if",
            condition,
            then,
            else: _else.value ?? null
        }
    }

    // this too
    for(): ForExpression {
        this.consume("FOR")
        const loopVariable = this.must("variable name please", () => this.consume<IdentifierToken>("IDENTIFIER"))
        this.consume("IN")
        const range = this.must("must be a range", () => this.range())
        const block = this.must("must be a block", () => this.block())

        return {
            kind: "for",
            loopVariable: {
                kind: "identifier",
                name: loopVariable.value
            },
            range,
            block
        }
    }

    while(): WhileExpression {
        this.consume("WHILE")
        const condition = this.must("while must have a condition", () => this.expression())
        const block = this.must("must be a block", () => this.block())

        return {
            kind: "while",
            condition,
            block
        }
    }

    range(): RangeExpression {
        const from = this.factor();
        const op = this.oneOf([
            () => this.consume("DOT_DOT"),
            () => this.consume("DOT_DOT_EQUAL"),
        ])
        const to = this.factor();

        return {
            kind: "range",
            from,
            to,
            inclusive: op.type === "DOT_DOT_EQUAL"
        }
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


    // TODOL: refactor these into a hof

    logicalOr(): Expr {
        let expr = this.logicalAnd()
        this.repeat(() => {
            const operator = this.match("OR");
            const right = this.logicalAnd();
            expr = {
                kind: "binary",
                left: expr,
                operator,
                right
            }
        })

        return expr
    }

    logicalAnd(): Expr {
        let expr = this.equality()
        this.repeat(() => {
            const operator = this.match("AND");
            const right = this.equality();
            expr = {
                kind: "binary",
                left: expr,
                operator,
                right
            }
        })

        return expr
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
            () => this.call(),
        ])
    }

    call(): Expr {
        const expression = this.primary()
        
        const args = this.safe(() => {
            this.consume("LEFT_PAREN")
            const { error, value } = this.safe(() => {
                const first = this.expression();
                const { out: rest, terminatingError } = this.consumeAll(() => {
                    this.consume("COMMA")
                    return this.expression()
                })
                if (terminatingError.kind === 'invalid') {
                    throw terminatingError
                }
                return [first, ...rest]
            })

            if (error?.kind === "invalid") {
                throw error
            }
        
            // trailing comma
            this.safe(() => this.consume("COMMA"))
            this.consume("RIGHT_PAREN")
            return value
        })

        if (args.ok) {
            return {
                kind: "call",
                target: expression,
                arguments: []
            }
        } 

        return expression;
    }

    primary(): Expr {
        // console.log("jashdugy")
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
            // why tf this take like 2 hour to run
            // () => this.expression(),
            // So, it becuase of or???
            () => this.block(),
            () => this.if(),
            () => this.assignment(),
        ])
    }
}