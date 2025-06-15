import { kptLabeler } from "./kpt-labeler";
import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import dotenv from "dotenv";

describe("kptLabeler", () => {
  dotenv.config();
  const csvPath = path.join(__dirname, "kpt-data.csv");
  const csv = fs.readFileSync(csvPath, "utf-8");
  const { data } = Papa.parse<{ text: string; kind: string }>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  for (const row of data) {
    if (!row.text || !row.kind) continue;
    row.kind = row.kind.trim();
    it(`text: ${row.text.slice(0, 20)}... → kind: ${row.kind}`, async () => {
      const kind = await kptLabeler(row.text);
      expect(kind).toBe(row.kind);
    });
  }
});
