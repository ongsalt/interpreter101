import { unreachable } from "../../utils"
import type { LiteralToken } from "../token"
import type { Interpreter } from "./interpreter"

export type LoxValue = LoxString | LoxNumber | LoxBoolean | LoxObject | LoxUnit | LoxCallable

export type LoxString = {
    kind: "string",
    value: string
}

export type LoxUnit = {
    kind: "unit",
    type: "nil" | "unit"
}

export type LoxNumber = {
    kind: "number",
    value: number,
}

export type LoxBoolean = {
    kind: "boolean",
    value: boolean
}

export type LoxObject = {
    kind: "object",
    id: number // object id
}

export type LoxCallable = {
    kind: "callable",
    arity: number,
    call: (interpreter: Interpreter, args: LoxValue[]) => LoxValue
}

function of<T>(value: T):
    T extends null ? LoxUnit :
    T extends number ? LoxNumber :
    T extends boolean ? LoxBoolean :
    T extends string ? LoxString : never;
function of(value: any): LoxUnit | LoxNumber | LoxBoolean | LoxString | never {
    if (value === null) {
        return {
            kind: "unit",
            type: "nil"
        };
    }
    if (typeof value === "number") {
        return {
            kind: "number",
            value
        };
    }
    if (typeof value === "boolean") {
        return {
            kind: "boolean",
            value
        };
    }
    if (typeof value === "string") {
        return {
            kind: "string",
            value
        };
    }

    throw new Error("Unsupported value type");
}

function nil(): LoxUnit {
    return {
        kind: "unit",
        type: "nil"
    }
}

function fromLiteral(token: LiteralToken) {
    switch (token.type) {
        case "FALSE":
            return of(false)
        case "TRUE":
            return of(true)
        case "NIL":
            return nil()
        case "NUMBER":
            return of(token.value)
        case "STRING":
            return of(token.value)
    }
    unreachable("invalid literal, wtf")
}

function isTruthy(value: LoxValue) {
    if (value.kind === "unit") {
        return false
    }
    if (value.kind === "object") {
        return true
    }
    return !!value.value // js
}


export const LoxValue = {
    of,
    nil,
    true: () => ({ kind: "boolean", value: true }) satisfies LoxBoolean,
    false: () => ({ kind: "boolean", value: true }) satisfies LoxBoolean,
    fromLiteral,
    isTruthy
}  