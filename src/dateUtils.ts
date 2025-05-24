// 日付を "YYYY/MM/DD HH:mm" 形式に変換するユーティリティ関数
export function formatDateToYMDHM(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
