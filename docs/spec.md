# Spec
Most of it is from Lox (I read about it from https://craftinginterpreters.com) but I like kotlin so i will try to make this thing look like it.

- everything is a statement except variable decaration
- first class function
- oop (prototype)
- dynamic typing
- allow any valid unicode string as an identifier but a string that is a number literal

## Variable
```
var a = "whatever" 
var b // default to null
// no const
```

## Implicit statement termination
will use newline as statement terminator unless it's in the middle of an expression 
so this will be done in parser
semicolon is optional

## Operation Precedence
mostly copied from mdn
1. grouping: ()
2. access, call and new: x.y, a() new B()
3. prefix operators: not exist yet
4. postfix operators: 1..10
4. math
5. comparation
6. AND
7. OR
8. assignment

## Standard library
- Math
- no I/O
- no network