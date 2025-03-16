// how do we do gc then???

import { RuntimeError } from "../error";
import type { LoxValue } from "./value";

export class Scope {
    identifiers: Map<string, LoxValue> = new Map()
    parent: Scope | null

    constructor(parent: Scope | null = null) {
        this.parent = parent
    }

    get(name: string): LoxValue | null {
        return this.identifiers.get(name) ?? this.parent?.get(name) ?? null
    }

    set(name: string, value: LoxValue) {
        // const object = this.get(name)
        // if (!object) {
        //     throw new RuntimeError("identifier-not-found", `Name "${name}" is not in scope`)
        // }
        // object.notify or something

        if (this.identifiers.has(name)) {
            this.identifiers.set(name, value)
        } else if (this.parent) {
            this.parent.set(name, value)
        } else {
            throw new RuntimeError("identifier-not-found", `Name "${name}" is not in scope`)
        }
    }

    define(name: string, value: LoxValue) {
        // we allow redeclaration
        this.identifiers.set(name, value)
    }
}