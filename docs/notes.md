# 学習メモ

## Aurora Serverless v2 vs RDS（2026-07-22）

### なぜ RDS ではなく Aurora Serverless v2 なのか

- Aurora が高いのは**プロビジョンドクラスター（常時起動）**の話。最低でも月数千円〜かかる
- Serverless v2 は `scaling.min: "0 ACU"` + auto-pause で**非アクティブ時の計算コストがゼロ**になる
- ストレージ課金は継続するが月 $1〜数ドル程度。Neon・Supabase の無料枠と大差ないコスト感

### SST との相性が選定理由の核心

- `sst.aws.Aurora` コンポーネントが VPC・セキュリティグループ・クラスターをまとめて数行で構築できる
- Lambda / CloudFront との `link` も自動で通る

### PostgreSQL 互換でローカルと差し替え容易

- ローカル：Docker PostgreSQL / 本番：Aurora Serverless v2
- `DATABASE_URL` を差し替えるだけで同じ Drizzle コードが動く

### RDS が向いているケース

- 常時高負荷なサービス → コスト予測が安定する
- コールドスタート（auto-pause からの復帰で数秒）が許容できない本番サービス → auto-pause をオフにするか RDS を選ぶ

## サービス層とは（Day 14）

「ビジネスの判断を、HTTP の都合から切り離して独立させた層」。

### 典型的な3層構造

```
プレゼンテーション層  ← Next.js Route Handler / Server Action（HTTP を扱う）
サービス層           ← service.ts（所有者チェックなどビジネスロジック）
データ層             ← Drizzle ORM（SQL 発行）
```

### なぜ分けるのか

Route Handler にロジックを直書きすると：

- **テストしづらい** — HTTP リクエストを作らないとテストできない
- **再利用できない** — WebSocket や cron job から同じロジックを呼べない
- **next/* に依存** — Next.js を替えたら全部書き直し

### サービス層のルール

- `next/*` を一切 import しない
- 引数で `db`・`userId`・対象 id を受け取る
- 所有者チェック（`todo.userId !== userId`）はここに置く

### `next/*` に依存しないとは

`revalidatePath()` や `redirect()` など Next.js 固有の関数をサービス層に書かない、ということ。

```ts
// Server Action（next/* を使う側）
async function deleteTodoAction(id: string) {
  await deleteTodo(db, userId, id)  // サービス層に委譲
  revalidatePath("/todos")          // next/* はここに残す
}

// service.ts（next/* を import しない）
export async function deleteTodo(db, userId, id) {
  // DB操作と所有者チェックだけ
}
```

サービス層が `revalidatePath` を知っていると Next.js なしでは動かない関数になるため分離する。
