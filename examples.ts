import { Check, Execute, Instruction } from "./typelang";

type addStrings = Execute<
  [
    Instruction.SetValue<"a">,
    Instruction.Extend<"b">,
    Instruction.Extend<"c">,
    Instruction.Extend<"d">
  ]
>;
// type addStrings = "abcd"

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

type exception = Execute<
  [
    Instruction.SetValue<"ab">,
    Instruction.RemoveFirstChar,
    Instruction.RemoveFirstChar,
    Instruction.RemoveFirstChar
  ]
>;
// type exception = {
//     message: "Empty string, cannot remove first character";
//     instruction: Instruction.RemoveFirstChar;
// }

type ifElse = Execute<
  [
    Instruction.SetValue<"a">,
    Instruction.If<
      Check.Equal<Instruction.CurrentValue, Instruction.SetValue<"a">>,
      [Instruction.Extend<"b">],
      [Instruction.Extend<"x">]
    >,
    Instruction.If<
      Check.Equal<Instruction.CurrentValue, Instruction.SetValue<"b">>,
      [Instruction.Extend<"x">],
      [Instruction.Extend<"c">]
    >
  ]
>;
// type ifElse = "abc"

type whileLoop = Execute<
  [
    Instruction.ClearValue,
    Instruction.While<
      Check.NotEqual<
        Instruction.CurrentValue,
        Instruction.SetValue<"aaaaaaaaa">
      >,
      [Instruction.Extend<"a">]
    >,
    Instruction.Extend<"b">
  ]
>;
// type whileLoop = "aaaaaaaaab"

type stripSpacesFromStart = Execute<
  [
    Instruction.SetValue<"    test test">,
    Instruction.While<
      Check.Equal<Instruction.FirstChar, Instruction.SetValue<" ">>,
      [Instruction.RemoveFirstChar]
    >
  ]
>;

type replaceSpacesWithUnderscores = Execute<
  [
    Instruction.SetValue<"This is example text.">,
    // add end of line character (go until that)
    Instruction.Extend<"\n">,
    Instruction.While<
      Check.NotEqual<Instruction.FirstChar, Instruction.SetValue<"\n">>,
      [
        // Move first character at the end. If it's space, replace it with underscore
        Instruction.If<
          Check.Equal<Instruction.FirstChar, Instruction.SetValue<" ">>,
          [Instruction.RemoveFirstChar, Instruction.Extend<"_">],
          [Instruction.MoveFirstCharToEnd]
        >
      ]
    >,
    // Remove neLwline
    Instruction.RemoveFirstChar
  ]
>;
// type replaceSpacesWithUnderscores = "This_is_example_text."

type tryBlock = Execute<
  [
    Instruction.SetValue<"a">,
    Instruction.Try<
      [Instruction.RemoveFirstChar, Instruction.RemoveFirstChar],
      [Instruction.SetValue<"Exception!">]
    >
  ]
>;
// type tryBlock = "Exception!"
