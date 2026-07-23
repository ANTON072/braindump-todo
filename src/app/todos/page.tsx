import { requireUserId } from "@/lib/session";

export default async function TodosPage() {
  const userId = await requireUserId();
  return <main className="p-8">ログイン中: {userId}</main>;
}
