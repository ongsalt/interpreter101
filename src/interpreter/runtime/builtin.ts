import type { Interpreter } from "./interpreter";
import { LoxValue, type LoxCallable } from "./value";

export class Builtin {
    constructor(public interpreter: Interpreter) { }

    setup() {
        this.defineNativeFn("now", {
            arity: 0,
            call(interpreter, args) {
                return LoxValue.of(Date.now())
            },
        })
    }

    defineNativeFn(name: string, fn: Omit<LoxCallable, "kind">) {
        const { id, obj } = this.interpreter.registry.alloc()
        obj.properties.set('__call__', {
            kind: "callable",
            ...fn
        })

        this.interpreter.scope.define(name, {
            kind: "object",
            id
        })
    }
}