import { google, sheets_v4 } from "googleapis";
import { KPTData } from "./KPTData";
import { formatDateToYMDHM } from "./dateUtils";

/**
 * 指定したスプレッドシートIDにKPTData配列を書き込む
 * @param spreadsheetId スプレッドシートID
 * @param kptDataArray 書き込むKPTData配列
 * @param auth Google認証クライアント（JWTやOAuth2）
 * @param sheetName シート名（省略時は1番目のシート）
 */
export async function writeKPTDataToSpreadsheet(
  spreadsheetId: string,
  kptDataArray: KPTData[],
  auth: sheets_v4.Options["auth"],
  sheetName?: string
): Promise<void> {
  const sheets = google.sheets({ version: "v4", auth });
  // ヘッダー行
  const header = [
    "投稿者",
    "カテゴリー",
    "kind",
    "text",
    "当日のメモ",
    "投稿日時",
  ];
  // データ行
  const values = [
    header,
    ...kptDataArray.map((kpt) => [
      kpt.postUser,
      "", // カテゴリーは空文字列
      kpt.kind,
      kpt.text,
      "", // 当日のメモは空文字列
      formatDateToYMDHM(kpt.createdAt),
    ]),
  ];
  // 書き込む範囲
  const range = sheetName ? `${sheetName}!A1` : "A1";
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
