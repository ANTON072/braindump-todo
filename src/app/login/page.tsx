"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitLogin(formData: FormData) {
    const { error } = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    if (error) setErrorMessage(error.message ?? "ログインに失敗しました");
    else router.push("/todos");
  }

  return (
    <form action={submitLogin} className="mx-auto max-w-sm space-y-4 p-8">
      <h1 className="text-xl font-bold text-center">braindump-todo</h1>
      <Input name="email" type="email" placeholder="メールアドレス" required />
      <Input
        name="password"
        type="password"
        placeholder="パスワード"
        required
      />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <Button type="submit" className="w-full">
        ログイン
      </Button>
    </form>
  );
}
