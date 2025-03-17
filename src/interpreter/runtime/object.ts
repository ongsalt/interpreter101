import type { Interpreter } from "./interpreter"
import type { LoxCallable, LoxValue } from "./value"

type LoxObjectMeta = {
    id: string,
    strongReference: number
    value: LoxObjectImpl
}

// __call__
type LoxObjectImpl = {
    properties: Map<string, LoxValue>
}

export class ObjectRegistry {
    pool: Map<number, LoxObjectImpl> = new Map()

    get(id: number): LoxObjectImpl | null {
        return this.pool.get(id) ?? null
    }

    set(id: number, obj: LoxObjectImpl) {
        this.pool.set(id, obj)
    }

    createId() {
        const create = () => Math.round(Math.random() * 10000000)
        let id = create()
        while (this.pool.has(id)) {
            id = create()
        }
        return id;
    }

    alloc() {
        const id = this.createId();
        const obj: LoxObjectImpl = {
            properties: new Map()
        }
        this.pool.set(id, obj)
        return { id, obj }
    }
}

export function isCallable(value: LoxValue, interpreter: Interpreter): boolean {
    if (value.kind !== "object") {
        return false
    }

    return interpreter.registry.get(value.id)!.properties.has('__call__')
}