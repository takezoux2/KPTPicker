import { WebClient } from "@slack/web-api";
import { KPTData, KPTKind } from "./KPTData";

export interface SlackMessage {
  user: string;
  text: string;
  createdAt: string;
}

/**
 * 指定したSlackチャンネルの全メッセージをKPTData配列で取得します。
 * @param channelId チャンネルID
 * @param token Slack Bot User OAuth Token
 * @returns KPTData配列
 */
export async function getAllMessagesInChannel(
  channelId: string,
  token: string
): Promise<KPTData[]> {
  const client = new WebClient(token);
  let messages: KPTData[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const response = await client.conversations.history({
      channel: channelId,
      cursor,
      limit: 200,
    });
    if (response.messages) {
      for (const msg of response.messages) {
        if (msg.user && msg.text && msg.ts) {
          // KPTの種別を判定（例: 先頭にK: P: T: などがあればそれをkindにする。なければ"K"）
          let kind: KPTKind = "K";
          let text = msg.text.trim();
          const kindMatch = text.match(/^(K:|P:|T:)(.*)$/i);
          if (kindMatch) {
            kind = kindMatch[1].replace(":", "").toUpperCase() as KPTKind;
            text = kindMatch[2].trim();
          }
          messages.push({
            postUser: msg.user,
            kind,
            text,
            createdAt: new Date(Number(msg.ts.split(".")[0]) * 1000),
          });
        }
      }
    }
    hasMore = !!response.has_more;
    cursor = response.response_metadata?.next_cursor;
  }
  return messages;
}
