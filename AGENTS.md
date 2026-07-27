<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

このプロジェクトは研修用です。AIは質問に答えるのみでプログラムの実装までは原則やらない。ユーザーから実装の要求があった場合にのみ実装すること。ただしdocsの内容は原則AIが更新する。

# Zod

このプロジェクトは Zod v4 を使用する。v3 との破壊的変更に注意すること。

- `z.string().date()` → `z.iso.date()`
- `z.string().datetime()` → `z.iso.datetime()`
- `z.string().email()` など文字列フォーマット系も同様に `z.email()` など独立した型に移行済みの場合がある
- 不明な場合は `node_modules/zod/` 配下のソースまたは型定義を確認する
