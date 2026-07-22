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
