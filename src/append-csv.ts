import fs from "fs";
import Papa from "papaparse";

/**
 * 指定したCSVファイルに1行追記する関数（papaparse使用）
 * @param filePath 追記するCSVファイルのパス
 * @param row 追記するデータ（オブジェクト）
 */
export function appendToCsv(filePath: string, row: Record<string, any>) {
  // papaparseで1行分のCSV文字列を生成
  const csvLine = Papa.unparse([row], { header: false }) + "\n";
  fs.appendFileSync(filePath, csvLine, "utf-8");
}

export const getLastRowTimestamp = (filePath: string): Date | undefined => {
  // 4th column is Date
  const csvContent = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<string[]>(csvContent, { header: false });
  const data = parsed.data as string[][];
  const filtered = data.filter(
    (row) => row.length > 0 && row.some((cell) => cell !== "")
  );
  if (filtered.length < 2) return undefined; // no data rows

  const lastRow = filtered[filtered.length - 1];
  const dateStr = lastRow[3];
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
};
