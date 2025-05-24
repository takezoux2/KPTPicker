import { WebClient } from "@slack/web-api";

export interface SlackMessage {
  user: string;
  text: string;
  createdAt: string;
}

/**
 * 指定したSlackチャンネルの全メッセージを取得します。
 * @param channelId チャンネルID
 * @param token Slack Bot User OAuth Token
 * @returns メッセージ配列（投稿ユーザー、メッセージ、作成日時）
 */
export async function getAllMessagesInChannel(
  channelId: string,
  token: string
): Promise<SlackMessage[]> {
  const client = new WebClient(token);
  let messages: SlackMessage[] = [];
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
          messages.push({
            user: msg.user,
            text: msg.text,
            createdAt: new Date(
              Number(msg.ts.split(".")[0]) * 1000
            ).toISOString(),
          });
        }
      }
    }
    hasMore = !!response.has_more;
    cursor = response.response_metadata?.next_cursor;
  }
  return messages;
}
