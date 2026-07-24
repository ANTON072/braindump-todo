import { describe, expect, it } from "vitest";
import { normalizeTagNames } from "./upsert-tags";

describe("normalizeTagNames", () => {
  it("前後の空白をtrimする", () => {
    expect(normalizeTagNames(" 買い物 , 仕事 ")).toEqual(["買い物", "仕事"]);
  });
  it("英字は小文字化する", () => {
    expect(normalizeTagNames("Work, HOME")).toEqual(["work", "home"]);
  });
  it("trim・小文字化した後に重複を除去する", () => {
    expect(normalizeTagNames("Work, work,  Work   ")).toEqual(["work"]);
  });
  it("空要素は落とす", () => {
    expect(normalizeTagNames("買い物,,,仕事,")).toEqual(["買い物", "仕事"]);
  });
  it("空文字は空配列を返す（空配列ガードの前提）", () => {
    expect(normalizeTagNames("")).toEqual([]);
  });
});
