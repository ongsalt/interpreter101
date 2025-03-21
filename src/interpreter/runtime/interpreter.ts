import { unimplemented } from "../../utils";
import { RuntimeError } from "../error";
import type { Expr, Program, Statement } from "../grammar";
import { Builtin } from "./builtin";
import { isCallable, ObjectRegistry } from "./object";
import { Scope } from "./scope";
import { LoxValue, type LoxCallable, type LoxObject } from "./value";

export class Interpreter {
    scope = new Scope()
    currentScope = this.scope
    registry = new ObjectRegistry()

    constructor(
        public program: Program
    ) {
        const builtin = new Builtin(this)
        builtin.setup()
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
                const { operator } = expression
                // short circuiting when there is AND or OR
                const left = this.evaluate(expression.left)
                const l = LoxValue.isTruthy(left)
                if (operator.type === "OR" && l || operator.type === "AND" && !l) {
                    return left
                }
                const right = this.evaluate(expression.right)
                if (operator.type === "OR" || operator.type === "AND") {
                    return right
                }

                // math
                if (right.kind !== "number" || left.kind !== "number") {
                    unimplemented(`both side of ${operator.lexeme} must be a number`)
                }
                switch (operator.type) {
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
                const { condition, else: _else, then } = expression
                const isOk = this.evaluate(condition);
                // this does not behave the same as in rust
                // TODO: i will change this later
                if (LoxValue.isTruthy(isOk)) {
                    return this.evaluate(then)
                } else if (_else) {
                    return this.evaluate(_else);
                } else {
                    return LoxValue.nil()
                }

            case "while":
                while (LoxValue.isTruthy(this.evaluate(expression.condition))) {
                    this.evaluate(expression.block)
                }
                return LoxValue.nil() // should be unit but whatever
            case "for":
                // TODO: implement an iterator
                this.evaluate(expression.range)
                return LoxValue.nil()
            case "range":
                // should i merge this with other binary expression???
                const from = this.evaluate(expression.from)
                const to = this.evaluate(expression.to)
                if (from.kind !== "number" || to.kind !== "number") {
                    unimplemented(`both side of range operator (../..=) must be a number`)
                }

                unimplemented("this wont work until we have an iterator")

            case "call":
                const { target, arguments: _arguments } = expression
                const fn = this.evaluate(target)

                if (isCallable(fn, this)) {
                    const values = _arguments.map(it => this.evaluate(it))
                    return this.callFn(fn as LoxObject, values)
                }
                throw new RuntimeError("type", "")
        }
        unimplemented(`expression: ${expression.kind}`)
    }

    callFn(fn: LoxObject, args: LoxValue[]): LoxValue {
        const impl = this.registry.get(fn.id)!.properties.get('__call__')! as LoxCallable
        if (impl.arity !== args.length) {
            throw new RuntimeError("type", `this funtion take only ${impl.arity} arguments, ${args.length} were supplied`)
        }

        return impl.call(this, args)
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
