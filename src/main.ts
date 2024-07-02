/**
 *  
 */

import { runFile, startRepl } from "./entry";


if (process.argv.length > 3) {
    console.log(`usage: bun src/main.ts {file}`)

} else if (process.argv.length === 3) {
    // run file
    runFile(process.argv[2])
} else {
    console.log("Starting repl")
    // start repl mode
    startRepl()
}
