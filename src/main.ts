/**
 *  
 */

import { runFile, startRepl } from "./entry";


if (process.argv.length > 3) {
    console.log(`usage: bun src/main.ts {file}`)

} else if (process.argv.length === 3) {
    // run file
    console.log(`Running ${process.argv[2]}`)
    runFile(process.argv[2])
} else {
    console.log("Starting repl")
    // start repl mode
    startRepl()
}
