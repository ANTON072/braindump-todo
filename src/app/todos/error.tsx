"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <h2 className="text-lg font-bold">問題が発生しました</h2>
      <p className="text-sm text-gray-600">
        一時的な不具合の可能性があります。時間をおいて再度お試しください。
      </p>
      <Button onClick={() => reset()}>再試行</Button>
    </main>
  );
}
