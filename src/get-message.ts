import { appendToCsv, getLastRowTimestamp } from "./append-csv";
import { kptLabeler } from "./kpt-labeler";
import { generateKPTDataFromChannel } from "./slack-get-messases-in-a-channel";
import * as dotenv from "dotenv";

const CSVName = "output/kpt-list.csv";

const main = async () => {
  dotenv.config();
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  const latestTimestamp = getLastRowTimestamp(CSVName);

  if (!slackToken) {
    console.error("SLACK_BOT_TOKENが設定されていません");
    process.exit(1);
  }

  if (!channelId) {
    console.error("SLACK_CHANNEL_IDが設定されていません");
    process.exit(1);
  }

  for await (const message of generateKPTDataFromChannel(
    channelId,
    slackToken,
    latestTimestamp
  )) {
    const msg = await message;
    console.log("Processing " + msg.text.substring(0, 20) + "...");
    const kind = await kptLabeler(msg.text);
    appendToCsv(CSVName, {
      user: msg.user,
      kind: kind,
      text: msg.text,
      timestamp: msg.createdAt,
    });
  }
};

main();
