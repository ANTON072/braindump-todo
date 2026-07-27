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
        aws: { profile: "braindump" },
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

    // Next.jsアプリをAWSにデプロイ
    const web = new sst.aws.Nextjs("Web", {
      vpc,
      link: [database, openaiApiKey],
      environment: {
        BETTER_AUTH_SECRET: new sst.Secret("BetterAuthSecret").value,
        // ローカルの.envのDATABASE_URLをLambdaに持ち込まない（Resource.Databaseを使わせる）
        DATABASE_URL: "",
      },
    });

    return { url: web.url };
  },
});
