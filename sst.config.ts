/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "braindump-todo",
      // スタック削除時の挙動
      removal: input?.stage === "production" ? "retain" : "remove",
      // trueにすると削除できなくなる
      protect: ["production"].includes(input?.stage),
      // デプロイ先クラウド
      home: "aws",
      providers: {
        // CIではOIDCで取得した環境変数の認証情報を使うため、ローカル専用のプロファイル指定は外す
        aws: { profile: process.env.CI ? undefined : "braindump" },
      },
    };
  },
  // AWSリソースの定義
  // VPC内にDBを置いてNext.jsからのみアクセスが可能
  async run() {
    // bastion: 踏み台サーバーを有効化
    // nat: NATゲートウェイを有効化（コスト削減のためマネージとNATを利用しない）
    const vpc = new sst.aws.Vpc("Vpc.v1", { bastion: true, nat: "ec2" });

    // Aurora Serverless v2を利用してデータベースを作成
    const database = new sst.aws.Aurora("Database", {
      engine: "postgres",
      vpc,
      // 未使用時はゼロにスケールダウンにコストを抑える
      scaling: { min: "0 ACU", max: "4 ACU" },
    });

    // OpenAI APIキーをシークレットとして管理
    // 実際の値はCLIで別途セットし、コードには埋め込まない
    const openaiApiKey = new sst.Secret("OpenaiApiKey");

    // better-authはOriginヘッダをBETTER_AUTH_URL由来の値と照合する。
    // デプロイ先のCloudFront URLと一致しないとログインが「Invalid origin」で失敗する。
    // URLは初回デプロイ後に確定するため、確定後にここへ登録して再デプロイする（Lesson 7/11の流儀）。
    // 未登録のステージ（次のnext devや個人ステージ）はlocalhostにフォールバック。
    // TODO: devステージのCloudFront URLが判明したらここに追加する。
    const authUrlByStage: Record<string, string> = {
      staging: "https://d23k1cl6i1ttr4.cloudfront.net",
      production: "https://d2lc4g19ynkv0b.cloudfront.net",
    };
    const authUrl = authUrlByStage[$app.stage] ?? "http://localhost:3000";

    // Next.jsアプリをAWSにデプロイ
    const web = new sst.aws.Nextjs("Web", {
      vpc,
      link: [database, openaiApiKey],
      environment: {
        BETTER_AUTH_SECRET: new sst.Secret("BetterAuthSecret").value,
        BETTER_AUTH_URL: authUrl,
        // ローカルの.envのDATABASE_URLをLambdaに持ち込まない（Resource.Databaseを使わせる）
        DATABASE_URL: "",
      },
    });

    return { url: web.url };
  },
});
