import { getAllMessagesInChannel } from "./slack-get-messases-in-a-channel";
import { writeKPTDataToSpreadsheet } from "./write-to-spreadsheet";
import { config } from "dotenv";

config();

async function main() {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetName = process.env.SHEET_NAME;

  if (
    !slackToken ||
    !channelId ||
    !spreadsheetId ||
    !googleClientEmail ||
    !googlePrivateKey
  ) {
    console.error("必要な環境変数が不足しています");
    process.exit(1);
  }

  // SlackからKPTメッセージ取得
  const kptDataArray = await getAllMessagesInChannel(channelId, slackToken);

  // Google認証
  const { google } = await import("googleapis");
  const auth = new google.auth.JWT(
    googleClientEmail,
    undefined,
    googlePrivateKey.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  // スプレッドシートへ書き込み
  await writeKPTDataToSpreadsheet(spreadsheetId, kptDataArray, auth, sheetName);
  console.log("完了しました");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
