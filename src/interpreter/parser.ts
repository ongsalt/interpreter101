import { err, ok, type Result } from "../utils/result";
import { ParserError } from "./error";
import type { Token } from "./token";

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

    private consume<T extends Token>(type: T["type"]): T { // TODO: im too lazy to make the type
        const token = this.peek()!

        if (token.type != type) {
            throw new ParserError("expected", `Expecting ${type} at line ${token.line}`) // TODO: make error enum
        }

        this.next()
        return token as unknown as T
    }

    private consumeAll<T>(consume: () => T): T[] {
        const results: T[] = []
        while (true) {
            const res = this.safe(() => consume())
            if (!res.ok) {
                // console.log(`[consumeAll] stoping ${res.ok}`)
                break
            }
            results.push(res.value)
        }

        return results
    }

    private oneOf<T>(fns: (() => T)[]): Result<T> {
        for (const fn of fns) {
            const res = this.safe(() => fn())
            if (res.ok) {
                return ok(res.value)
            }
        }

        return err(undefined)
    }

    private oneOfOrThrow<T, E extends Error = ParserError>(
        fns: (() => T)[],
        errorBuilder: (e: any) => E = (() => new ParserError("expected", "not exist") as Error as E)
    ): T {
        const res = this.oneOf(fns)
        if (!res.ok) {
            throw errorBuilder(res.error)
        }

        return res.value
    }

    // ignore every token untill reach next statement 
    private synchronize()  {
        while (!this.isAtEnd) {
            const current = this.next()       
            const t: Token["type"][] = ["CLASS", "FUN", "VAR", "FOR", "IF", "WHILE", "PRINT", "RETURN"]
            if (t.includes(current.type)) {
                return
            }
        }
    }

    parse() {

    }
}