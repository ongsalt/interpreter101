export type Ok<T> = {
    ok: true,
    value: T 
}

export type Err<E> = {
    ok: false 
    error: E
}

export type Result<T = void, E = string> = Ok<T> | Err<E>

export function Ok<T>(value: T): Ok<T> {
    return {
        ok: true,
        value
    }
} 

export function Err<E>(error: E): Err<E> {
    return {
        ok: false,
        error
    }
} 

export function wrap<T>(fn: () => T): Result<T> {
    try {
        return Ok(fn())
    } catch (e) {
        return Err((e as Error).message)
    }
}

