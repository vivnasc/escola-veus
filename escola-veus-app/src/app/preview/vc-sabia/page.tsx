import { VcSabiaPreviewPanel } from "@/components/vc-sabia/PreviewPanel";

export const metadata = {
  title: "VC Sabia Que…? — Preview",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="min-h-dvh bg-escola-bg">
      <VcSabiaPreviewPanel />
    </main>
  );
}
