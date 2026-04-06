"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PainelPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/painel/youtube");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-sm text-escola-creme-50">A carregar...</div>
    </div>
  );
}
