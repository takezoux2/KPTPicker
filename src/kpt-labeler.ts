import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { KPTKind } from "./KPTData";
import fs from "fs";

const kptRules = fs.readFileSync("rules/KPTRules.md", "utf-8");

export const kptLabeler = async (text: string): Promise<KPTKind> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

  const model = new ChatGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
    model: "gemini-2.5-flash-preview-05-20",
  });

  const prompt = `次の分類ルールに従って、与えられたテキストがKeep, Problem, Tryのどれに該当するかを判定してください。どれにも該当しない場合はOtherとしてください。\n\n分類ルール:\n${kptRules}\n\nテキスト:\n${text}\n\n判定結果のみを1語で出力してください（Keep, Problem, Try, Otherのいずれか）。`;

  const result = await model.invoke([{ role: "user", content: prompt }]);
  let output = "";
  if (typeof result.content === "string") {
    output = result.content.trim();
  } else if (Array.isArray(result.content)) {
    output = result.content
      .map((c) => (typeof c === "string" ? c : ""))
      .join("")
      .trim();
  } else if (
    result.content &&
    typeof result.content === "object" &&
    "toString" in result.content
  ) {
    output = String(result.content).trim();
  }
  if (output === "Keep" || output === "Problem" || output === "Try")
    return output;
  return "Other";
};
