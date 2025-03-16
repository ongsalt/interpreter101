import { unimplemented, unreachable } from "../../utils";
import { RuntimeError } from "../error";
import type { Expr, Program, Statement } from "../grammar";
import { Scope } from "./scope";
import { LoxValue } from "./value";

export class Interpreter {
    scope = new Scope()
    currentScope = this.scope

    constructor(
        public program: Program
    ) {

    }

    run() {
        try {
            for (const statement of this.program.statements) {
                this.evaluateStatement(statement)
            }
        } catch (e) {
            console.log(e)
        }
    }

    // we dont do visitor here. lets gooooo discriminated union, 
    evaluate(expression: Expr): LoxValue {
        switch (expression.kind) {
            case "binary":
                const right = this.evaluate(expression.right)
                const left = this.evaluate(expression.left)
                if (right.kind !== "number" || left.kind !== "number") {
                    throw new Error("Unimplemented")
                }
                switch (expression.operator.type) {
                    case "PLUS":
                        return LoxValue.of(left.value + right.value)
                    case "MINUS":
                        return LoxValue.of(left.value - right.value)
                    case "STAR":
                        return LoxValue.of(left.value * right.value)
                    case "SLASH":
                        return LoxValue.of(left.value / right.value)
                    case "EQUAL_EQUAL":
                        return LoxValue.of(left.value === right.value)
                    case "BANG_EQUAL":
                        return LoxValue.of(left.value !== right.value)
                    case "LESS":
                        return LoxValue.of(left.value < right.value)
                    case "LESS_EQUAL":
                        return LoxValue.of(left.value <= right.value)
                    case "GREATER":
                        return LoxValue.of(left.value > right.value)
                    case "GREATER_EQUAL":
                        return LoxValue.of(left.value >= right.value)

                }
                unimplemented(expression.operator.lexeme)
            case "grouping":
                return this.evaluate(expression.expression)
            case "literal":
                return LoxValue.fromLiteral(expression.value)
            case "unary":
                if (expression.operator.type === "MINUS") {
                    const res = this.evaluate(expression.right)
                    if (res.kind !== "number") {
                        throw new RuntimeError("unsupported-operation", `cant do - on a ${res.kind}`)
                    }
                    return LoxValue.of(-res.value)
                }
                unimplemented(expression.operator.lexeme)
            case "identifier":
                const value = this.currentScope.get(expression.name)
                if (!value) {
                    throw new RuntimeError("identifier-not-found", `${expression.name}`)
                }
                return value
            case "block":
                const previous = this.currentScope;
                this.currentScope = new Scope(this.currentScope)
                try {
                    for (const statement of expression.statements) {
                        this.evaluateStatement(statement)
                    }
                    if (expression.last) {
                        return this.evaluate(expression.last)
                    }
                    return LoxValue.nil()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.currentScope = previous;
                }
                // TODO: think about what this should return
                // we should not use js error for lox error
                break
            case "assignment":
                // fuck js switch case
                const value_ = this.evaluate(expression.value)
                this.scope.set(expression.to.name, value_)
                return value_

            case "if":
                const { condition, else: _else, kind, then } = expression
                const isOk = this.evaluate(condition);
                if (LoxValue.isTruthy(isOk)) {
                    return this.evaluate(then)
                } else if (_else) {
                    return this.evaluate(_else);
                } else {
                    return LoxValue.nil()
                }
        }
        unreachable(`Unimplemented expression: ${expression.kind}`)
    }

    evaluateStatement(statement: Statement) {
        switch (statement.kind) {
            case "expression":
                this.evaluate(statement.expression)
                break
            case "print":
                this.printLoxValue(this.evaluate(statement.expression))
                break
            case "variable-declaration":
                // current scope.set
                if (statement.value) {
                    this.currentScope.define(statement.name, this.evaluate(statement.value))
                } else {
                    this.currentScope.define(statement.name, LoxValue.nil())
                }
                break
        }
    }

    printLoxValue(value: LoxValue) {
        switch (value.kind) {
            case "boolean":
            case "number":
            case "string":
            case "boolean":
                console.log(value.value)
                break
            case "unit":
                console.log(value.type)
                break
            case "object":
                console.log(`Object ${value.id}`)
        }
    }

}
