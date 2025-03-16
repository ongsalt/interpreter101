program        → statement* EOF ;

block          → "{" statement* "}" ;

statement      →  exprStmt;
               | printStmt 
               | declaration 

exprStmt       → expression ";" ;
printStmt      → "print" expression ";" ;
<!-- implicit return??? -->

declaration    → varDecl;

varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

expression     → assignment | equality | block;

assignment     → IDENTIFIER "=" assignment
               | equality ;

equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | primary ;
primary        → "true" | "false" | "nil"
               | NUMBER | STRING
               | "(" expression ")"
               | IDENTIFIER ;
