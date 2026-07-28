# マイグレーション手順

## ローカル（Docker Postgres）

```bash
pnpm drizzle-kit generate   # スキーマ変更を SQL ファイルに書き出す
pnpm drizzle-kit migrate    # SQL ファイルを適用する
```

## Aurora（dev / staging / production）

Aurora は VPC 内にあるため、SST の bastion（踏み台）経由でトンネルを張ってから接続する。以下は `dev` の例。`staging` / `production` に対して実行する場合は、**すべてのコマンドの `--stage` と DATABASE_URL のホスト名を対象ステージのものに揃える**こと（`--stage staging` のトンネルに `dev` の URL で繋ぐ、といった不一致が接続失敗の典型原因）。

### 1. SSO ログイン（セッション切れの場合）

```bash
aws sso login --profile braindump
```

### 2. トンネルを開く（ターミナル 1）

```bash
pnpm dlx sst tunnel --stage dev
```

`Waiting for connections...` と表示されるまで待つ。初回は先に以下のインストールが必要：

```bash
sudo pnpm dlx sst tunnel install
```

### 3. 接続情報を取得する（ターミナル 2）

```bash
pnpm dlx sst shell --stage dev node -e "const {Resource}=require('sst');const d=Resource.Database;console.log('postgres://'+d.username+':'+d.password+'@'+d.host+':'+d.port+'/'+d.database)"
```

### 4. マイグレーションを実行する（ターミナル 2）

Aurora は SSL 必須のため `NODE_TLS_REJECT_UNAUTHORIZED=0` と `?sslmode=require` を付ける：

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 \
DATABASE_URL="postgres://postgres:パスワード@ホスト:5432/braindump_todo?sslmode=require" \
pnpm exec drizzle-kit migrate
```

### 5. トンネルを閉じる

ターミナル 1 で `Ctrl+C`。

## seed スクリプト（初回ユーザー登録）

マイグレーション完了後、トンネルを開いたまま実行する。`scripts/seed-users.ts` のメールアドレスとパスワードを事前に書き換えておくこと。

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 \
BETTER_AUTH_DISABLE_SIGNUP=false \
DATABASE_URL="postgres://postgres:パスワード@ホスト:5432/braindump_todo?sslmode=require" \
pnpm exec tsx scripts/seed-users.ts
```

`Registered: メールアドレス` と表示されれば成功。

## トラブルシューティング

### `drizzle-kit migrate` が「applying migrations...」で止まる／何も起きずに終わる

原因は **SSL 未指定**。Aurora は SSL 必須（`pg_hba.conf` で暗号化なし接続を拒否）だが、`drizzle-kit` が使う `pg` ドライバはデフォルトで暗号化なしで接続するため弾かれる。`pg` ドライバに直接接続すると次のエラーで確認できる：

```
no pg_hba.conf entry for host "10.0.x.x", user "postgres", database "braindump_todo", no encryption
```

**紛らわしい点**：TablePlus など DB クライアントは SSL mode が `PREFERRED` なので普通に繋がる。そのため「クライアントでは中身が見えているのに migrate だけ通らない」という状態になり、原因が DB ではなく SSL 設定にあることに気づきにくい。

**対処**：DATABASE_URL に SSL パラメータを付ける。この手順書の Aurora セクションのコマンド（`NODE_TLS_REJECT_UNAUTHORIZED=0` + `?sslmode=require`）を使えば回避できる。URL 末尾に `?sslmode=no-verify` を付けるだけでも可（この場合 `NODE_TLS_REJECT_UNAUTHORIZED=0` は不要）。

なお、ローカルの Docker Postgres は SSL 不要なので、ローカルでは付けなくても通る。この差分がリモートで初めて露呈する。
