import { WebClient } from "@slack/web-api";
import { KPTData, KPTKind } from "./KPTData";
import { kptLabeler } from "./kpt-labeler";

export interface SlackMessage {
  user: string;
  text: string;
  createdAt: Date;
}

/**
 * 指定したSlackチャンネルの全メッセージをKPTDataとして順次生成するAsyncGenerator
 * @param channelId チャンネルID
 * @param token Slack Bot User OAuth Token
 * @param before 取得するメッセージの上限時刻（この時刻より古いもののみ）。未指定なら最新から。
 */
export async function* generateKPTDataFromChannel(
  channelId: string,
  token: string,
  before?: Date
): AsyncGenerator<SlackMessage> {
  const client = new WebClient(token);
  let hasMore = true;
  let cursor: string | undefined = undefined;
  let latest: string | undefined = before
    ? Math.floor(before.getTime() / 1000).toString()
    : undefined;

  // userId→表示名のキャッシュ
  const userCache: Map<string, string> = new Map();
  async function getUserName(userId: string): Promise<string> {
    if (userCache.has(userId)) return userCache.get(userId)!;
    try {
      const userInfo = await client.users.info({ user: userId });
      console.log(`${userId}: Fetching user info for ${userId}`);
      const name =
        (userInfo.user &&
          (userInfo.user.profile?.display_name || userInfo.user.real_name)) ||
        userId;
      userCache.set(userId, name);
      return name;
    } catch (e) {
      throw e;
      // return userId;
    }
  }

  while (hasMore) {
    const response = await client.conversations.history({
      channel: channelId,
      cursor,
      limit: 100,
      ...(latest ? { latest } : {}),
    });
    if (response.messages) {
      for (const msg of response.messages) {
        if (msg.user && msg.text && msg.ts) {
          const text = msg.text.trim();
          const userName = await getUserName(msg.user);
          yield {
            user: userName,
            text,
            createdAt: new Date(Number(msg.ts.split(".")[0]) * 1000),
          };
        }
      }
    }
    hasMore = !!response.has_more;
    cursor = response.response_metadata?.next_cursor;
    // 2ページ目以降はlatestを指定しない（Slack API仕様）
    latest = undefined;
  }
}
