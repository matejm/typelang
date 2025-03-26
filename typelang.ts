export namespace Instruction {
  export type SetValue<Value extends string> = { type: "set"; value: Value };

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
  export type MoveFirstCharToEnd = { type: "circ" };

  // True if current value is equal to the given string
  export type If<
    Condition extends Check.AvailableChecks,
    IfTrue extends AvailableInstructions[],
    IfFalse extends AvailableInstructions[]
  > = { type: "if"; condition: Condition; ifTrue: IfTrue; ifFalse: IfFalse };

  export type While<
    Condition extends Check.AvailableChecks,
    Instructions extends AvailableInstructions[]
  > = { type: "while"; condition: Condition; instructions: Instructions };

  export type Try<
    Instructions extends AvailableInstructions[],
    Catch extends AvailableInstructions[]
  > = { type: "try"; instructions: Instructions; catch: Catch };

  // Derived methods

  // Set value to empty string
  export type ClearValue = SetValue<"">;
  // Keep value as is, return current value
  export type CurrentValue = Extend<"">;

  export type NonControlFlow =
    | SetValue<string>
    | Extend<string>
    | Uppercase
    | Lowercase
    | FirstChar
    | RemoveFirstChar
    | MoveFirstCharToEnd
    | ClearValue
    | CurrentValue;

  // All control flow instructions
  export type ControlFlow =
    | If<
        Check.AvailableChecks,
        AvailableInstructions[],
        AvailableInstructions[]
      >
    | While<Check.AvailableChecks, AvailableInstructions[]>
    | Try<AvailableInstructions[], AvailableInstructions[]>;

  export type AvailableInstructions = NonControlFlow | ControlFlow;
}

// Even if our memory is string, we still need bools for control flow
// (how some expression evaluates)
export namespace Check {
  export type Equal<
    Left extends Instruction.NonControlFlow,
    Right extends Instruction.NonControlFlow
  > = {
    left: Left;
    right: Right;
  };

  export type Not<Check extends AvailableChecks> = {
    check: Check;
  };

  // Derived checks
  export type NotEqual<
    Left extends Instruction.NonControlFlow,
    Right extends Instruction.NonControlFlow
  > = Not<Equal<Left, Right>>;

  export type AvailableChecks = Equal<any, any> | Not<any> | NotEqual<any, any>;
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
    Instruction extends Instruction.SetValue<infer ToSet>
    ? ToSet
    : Instruction extends Instruction.Extend<infer ToExtend>
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
    : Instruction extends Instruction.MoveFirstCharToEnd
    ? Value extends `${infer First}${infer Rest}`
      ? `${Rest}${First}`
      : Exception<
          "Empty string, cannot move first character to end",
          Instruction
        >
    : Exception<"Unknown instruction", Instruction>
  : // Value is exception, pass it through
    Value;

export type EvaluateCheck<
  Check extends Check.AvailableChecks,
  Value extends
    | string
    | Exception<string, Instruction.AvailableInstructions> = ""
> = Check extends Check.Equal<infer Left, infer Right>
  ? // Check equality by checking subtype in both sides
    // Note: if exception is raised in check it won't be raised here, simply returned as false
    Evaluate<Left, Value> extends Evaluate<Right, Value>
    ? Evaluate<Right, Value> extends Evaluate<Left, Value>
      ? true
      : false
    : false
  : Check extends Check.Not<infer InnerCheck>
  ? EvaluateCheck<InnerCheck, Value> extends true
    ? false
    : true
  : false;

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
      First extends Instruction.If<infer Condition, infer IfTrue, infer IfFalse>
      ? // If control flow
        EvaluateCheck<Condition, Value> extends true
        ? // TODO: We have to limit recursion on control flow types
          // @ts-expect-error
          Execute<Rest, Execute<IfTrue, Value>>
        : Execute<Rest, Execute<IfFalse, Value>>
      : First extends Instruction.While<
          infer Condition,
          infer WhileInstructions
        >
      ? // While control flow
        EvaluateCheck<Condition, Value> extends true
        ? Execute<
            [Instruction.While<Condition, WhileInstructions>, ...Rest],
            Execute<WhileInstructions, Value>
          >
        : Execute<Rest, Value>
      : First extends Instruction.Try<
          infer TryInstructions extends Instruction.AvailableInstructions[],
          infer CatchInstructions
        >
      ? // Check if try block throws an exception
        Execute<TryInstructions, Value> extends Exception<
          string,
          Instruction.AvailableInstructions
        >
        ? // Catch block doesn't have access to value generated by try block as we only get the exception back
          Execute<CatchInstructions, Value>
        : Execute<TryInstructions, Value>
      : Exception<"Unknown control flow instruction", First>
    : // Normal instructions
      Execute<Rest, Evaluate<First, Value>>
  : Value;
