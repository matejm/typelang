export namespace Instruction {
  // String concatenation
  export type Extend<Value extends string> = { type: "extend"; value: Value };

  // Convert string to uppercase / lowercase
  export type Uppercase = { type: "uppercase" };
  export type Lowercase = { type: "lowercase" };

  // Get first character / remove first character
  export type FirstChar = { type: "car" };
  export type RemoveFirstChar = {
    type: "cdr";
  };

  // True if current value is equal to the given string
  export type If<
    Expect extends string,
    IfTrue extends AvailableInstructions[],
    IfFalse extends AvailableInstructions[]
  > = { type: "if"; expect: Expect; ifTrue: IfTrue; ifFalse: IfFalse };

  export type AvailableInstructions =
    | Extend<string>
    | Uppercase
    | Lowercase
    | FirstChar
    | RemoveFirstChar
    | If<string, Array<any>, Array<any>>;

  export type ControlFlow = If<
    string,
    AvailableInstructions[],
    AvailableInstructions[]
  >;
}

export type Exception<
  Message extends string,
  Instruction extends Instruction.AvailableInstructions
> = {
  // Error message
  message: Message;

  // Where the exception occurred.
  instruction: Instruction;
};

// Evaluate single instruction
export type Evaluate<
  Instruction extends Instruction.AvailableInstructions,
  Value extends string | Exception<string, Instruction.AvailableInstructions>
> = Value extends string
  ? // Instructions
    Instruction extends Instruction.Extend<infer ToExtend>
    ? `${Value}${ToExtend}`
    : Instruction extends Instruction.Uppercase
    ? Uppercase<Value>
    : Instruction extends Instruction.Lowercase
    ? Lowercase<Value>
    : Instruction extends Instruction.FirstChar
    ? Value extends `${infer First}${infer Rest}`
      ? First
      : Exception<"Empty string, cannot get first character", Instruction>
    : Instruction extends Instruction.RemoveFirstChar
    ? Value extends `${infer First}${infer Rest}`
      ? Rest
      : Exception<"Empty string, cannot remove first character", Instruction>
    : Exception<"Unknown instruction", Instruction>
  : // Value is exception, pass it through
    Value;

// Execute program
// (a list of instructions)
export type Execute<
  Instructions extends Instruction.AvailableInstructions[],
  Value extends
    | string
    | Exception<string, Instruction.AvailableInstructions> = ""
> = Instructions extends [
  infer First extends Instruction.AvailableInstructions,
  ...infer Rest extends Instruction.AvailableInstructions[]
]
  ? First extends Instruction.ControlFlow
    ? // Control flow statements
      First extends Instruction.If<
        infer Expect extends string,
        infer IfTrue,
        infer IfFalse
      >
      ? // If control flow
        Value extends Expect
        ? Execute<Rest, Execute<IfTrue, Value>>
        : Execute<Rest, Execute<IfFalse, Value>>
      : Exception<"Unknown control flow instruction", First>
    : // Normal instructions
      Execute<Rest, Evaluate<First, Value>>
  : Value;
