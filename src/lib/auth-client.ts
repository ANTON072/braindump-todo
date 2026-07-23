// ブラウザからBetter AuthのAPIをコールするためのクライアントインスタンス
// クライアントコンポーネントから利用する
// 内部的にlib/auth.tsにfetchを投げる
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
