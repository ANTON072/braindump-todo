import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>braindump-todo</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>ログイン</Button>
          <Button variant={`outline`}>新規登録</Button>
        </CardContent>
      </Card>
    </main>
  );
}
