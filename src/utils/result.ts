export type Ok<T> = {
    ok: true,
    value: T
    error?: undefined
}

export type Err<E> = {
    ok: false
    value?: undefined,
    error: E
}

export type Result<T = void, E = undefined> = Ok<T> | Err<E>

export function ok<T>(value: T): Ok<T> {
    return {
        ok: true,
        value
    }
}

export function err<E>(error: E): Err<E> {
    return {
        ok: false,
        error
    }
}

export function wrap<T>(fn: () => T): Result<T> {
    try {
        return ok(fn())
    } catch (e) {
        return err(undefined)
    }
}

