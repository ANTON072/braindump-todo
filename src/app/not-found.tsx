import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl space-y-3 p-8">
      <h2 className="text-lg font-bold">ページが見つかりません</h2>
      <Link href="/todos" className="text-blue-600 underline">
        Todos に戻る
      </Link>
    </main>
  );
}
