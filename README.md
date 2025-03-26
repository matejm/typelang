# TypeLang

TypeLang is a proof-of-concept programming language implemented entirely using TypeScript types. Motivated by the video ["TypeScript types can run DOOM"](https://www.youtube.com/watch?v=0mCsluv5FXA), I wanted to test my understanding of TypeScript's type system.

## Features

- Implemented purely with TypeScript types.
- Uses a single string as memory and supports basic string manipulation operations.
- Implements control flow with `If` and `While` constructs.
- Returns exceptions when errors are encountered.

## Installation

No installation is required beyond TypeScript. Simply import the `typelang.ts` module in your TypeScript project and start experimenting.

## Usage Examples

If you want to see more examples, check out the [examples.ts](./examples.ts) file in the repository.

### String manipulation

TypeLang memory consists of a single string. All operations are performed on that string which is returned at the end of the program.

```ts
type getThirdCharUppercase = Execute<
  [
    Instruction.SetValue<"abcd">,
    Instruction.RemoveFirstChar,
    Instruction.RemoveFirstChar,
    Instruction.Uppercase,
    Instruction.FirstChar
  ]
>;
// type getThirdCharUppercase = "C"
```

### Handling Errors

```ts
type exception = Execute<
  [
    Instruction.SetValue<"ab">,
    Instruction.RemoveFirstChar,
    Instruction.RemoveFirstChar,
    Instruction.RemoveFirstChar
  ]
>;
/* type exception = {
  message: "Empty string, cannot remove first character";
  instruction: Instruction.RemoveFirstChar;
} */
```

You can also use `Try` to catch exceptions:

```ts
type tryBlock = Execute<
  [
    Instruction.SetValue<"ab">,
    Instruction.Try<
      [
        Instruction.RemoveFirstChar,
        Instruction.RemoveFirstChar,
        Instruction.RemoveFirstChar
      ],
      [Instruction.SetValue<"Exception!">]
    >
  ]
>;
// type tryBlock = "Exception!"
```

### Conditional Logic

```ts
type ifElse = Execute<
  [
    Instruction.SetValue<"a">,
    Instruction.If<
      Check.Equal<Instruction.CurrentValue, Instruction.SetValue<"a">>,
      [Instruction.Extend<"b">],
      [Instruction.Extend<"x">]
    >
  ]
>;
// type ifElse = "ab"
```

### Loops

```ts
type whileLoop = Execute<
  [
    Instruction.ClearValue,
    Instruction.While<
      Check.NotEqual<
        Instruction.CurrentValue,
        Instruction.SetValue<"aaaaaaaaa">
      >,
      [Instruction.Extend<"a">]
    >
  ]
>;
// type whileLoop = "aaaaaaaaa"
```
