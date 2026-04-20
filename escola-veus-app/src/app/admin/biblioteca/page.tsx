"use client";

import { useEffect, useState } from "react";

type FileEntry = {
  name: string;
  size: number | null;
  created_at: string | null;
  url: string;
};

const PRESETS: { label: string; folder: string }[] = [
  { label: "Funil — áudios Nomear", folder: "youtube" },
  { label: "Funil — imagens", folder: "youtube/images" },
  { label: "Funil — clips", folder: "youtube/clips" },
  { label: "Funil — vídeos finais", folder: "youtube/videos" },
  { label: "Aulas — Ouro Próprio", folder: "curso-ouro-proprio" },
  { label: "Aulas — Limite Sagrado", folder: "curso-limite-sagrado" },
  { label: "Aulas — Sangue e Seda", folder: "curso-sangue-e-seda" },
  { label: "Aulas — Silêncio que Grita", folder: "curso-o-silencio-que-grita" },
  { label: "Aulas — Pele Nua", folder: "curso-pele-nua" },
  { label: "Aulas — A Fome", folder: "curso-a-fome" },
  { label: "Aulas — A Chama", folder: "curso-a-chama" },
];

export default function BibliotecaPage() {
  const [folder, setFolder] = useState(PRESETS[0].folder);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetch(`/api/admin/biblioteca/list?folder=${encodeURIComponent(folder)}&limit=200`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.erro) setErr(d.erro);
        else setFiles(d.files ?? []);
      })
      .catch((e) => !cancelled && setErr(String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [folder]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Biblioteca
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          Browser do bucket Supabase <code>course-assets</code>
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-escola-creme-50 mb-1">Pasta</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.folder}
              onClick={() => setFolder(p.folder)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                folder === p.folder
                  ? "border-escola-dourado text-escola-dourado bg-escola-dourado/5"
                  : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="mt-3 w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2 text-sm text-escola-creme"
          placeholder="ex: youtube/clips"
        />
      </div>

      <div className="rounded-xl border border-escola-border bg-escola-card">
        <div className="flex items-center justify-between border-b border-escola-border px-4 py-2 text-xs text-escola-creme-50">
          <span>{loading ? "A carregar..." : `${files.length} ficheiros`}</span>
          <span className="font-mono">{folder || "/"}</span>
        </div>
        {err && <div className="px-4 py-3 text-xs text-escola-terracota">{err}</div>}
        <ul className="divide-y divide-escola-border">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between px-4 py-2 text-xs">
              <div className="min-w-0">
                <p className="truncate text-escola-creme">{f.name}</p>
                <p className="text-escola-creme-50">
                  {f.size != null ? `${(f.size / 1024).toFixed(1)} KB` : "—"} ·{" "}
                  {f.created_at ? new Date(f.created_at).toLocaleString("pt-PT") : "—"}
                </p>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="ml-3 shrink-0 rounded-full border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
              >
                abrir
              </a>
            </li>
          ))}
          {!loading && files.length === 0 && !err && (
            <li className="px-4 py-6 text-center text-xs text-escola-creme-50">
              Sem ficheiros nesta pasta.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
