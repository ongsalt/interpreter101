program        → statement* EOF ;

block          → "{" statement* "}" ;

statement      →  exprStmt;
               | printStmt 
               | declaration 
               | topLevelExpression

topLevelExpression → ifExpression | block

exprStmt       → expression ";" ;
printStmt      → "print" expression ";" ;

declaration    → varDecl;

varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

<!-- bruh -->
expression     → assignment | equality | block | ifExpression | forExpression | whileExpression | range;

ifExpression   → "if" expression block
               ( "else" (block | ifExpression) )? ;
whileExpression→ "while" "expression block ;
forExpression  → "for" range block ;

<!-- match ??? -->

assignment     → IDENTIFIER "=" assignment
               | logic_or ;

logic_or       → logic_and ( "or" logic_and )* ;
logic_and      → equality ( "and" equality )* ;

range          → factor ".." factor

equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | call ;

call           → primary ( "(" arguments? ")" )* ;
<!-- call           → expression ( "(" arguments? ")" ) ; -->
arguments      → expression ( "," expression )* ;

primary        → "true" | "false" | "nil"
               | NUMBER | STRING
               | "(" expression ")"
               | IDENTIFIER ;
