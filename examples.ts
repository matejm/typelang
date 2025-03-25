import { Execute, Instruction } from "./typelang";

type addStrings = Execute<
  [
    Instruction.Extend<"a">,
    Instruction.Extend<"b">,
    Instruction.Extend<"c">,
    Instruction.Extend<"d">
  ]
>;
// type addStrings = "abcd"

type getThirdCharUppercase = Execute<
  [
    Instruction.Extend<"abcd">,
    Instruction.RemoveFirstChar,
    Instruction.RemoveFirstChar,
    Instruction.Uppercase,
    Instruction.FirstChar
  ]
>;
// type getThirdCharUppercase = "C"

type exception = Execute<
  [
    Instruction.Extend<"ab">,
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
    Instruction.Extend<"a">,
    Instruction.If<"a", [Instruction.Extend<"b">], [Instruction.Extend<"x">]>,
    Instruction.If<"b", [Instruction.Extend<"x">], [Instruction.Extend<"c">]>
  ]
>;
// type ifElse = "abc"
