# マイグレーション手順

## ローカル（Docker Postgres）

```bash
pnpm drizzle-kit generate   # スキーマ変更を SQL ファイルに書き出す
pnpm drizzle-kit migrate    # SQL ファイルを適用する
```

## Aurora（dev ステージ）

Aurora は VPC 内にあるため、SST の bastion（踏み台）経由でトンネルを張ってから接続する。

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
