"use client";

import { useState } from "react";

/**
 * /admin/producao/escola-veus
 *
 * Empacota os 3 vídeos da semana (ep3, ep4, longo) num CSV Metricool
 * para importar no workspace Escola dos Véus. Vídeos vivem em Supabase
 * (URLs hardcoded no endpoint), captions derivam dos scripts.
 */

export default function EscolaVeusPackagePage() {
  // Default: ter/qui da semana corrente + domingo.
  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(d.getDate() + n);
    return x;
  };
  const day = today.getDay(); // 0 dom, 1 seg, ..., 6 sáb
  const toMonday = day === 0 ? -6 : 1 - day;
  const monday = addDays(today, toMonday);
  const [ep3Date, setEp3Date] = useState(ymd(addDays(monday, 1))); // Ter
  const [ep3Time, setEp3Time] = useState("18:00");
  const [ep4Date, setEp4Date] = useState(ymd(addDays(monday, 3))); // Qui
  const [ep4Time, setEp4Time] = useState("18:00");
  const [longoDate, setLongoDate] = useState(ymd(addDays(monday, 6))); // Dom
  const [longoTime, setLongoTime] = useState("11:00");

  const download = () => {
    const qs = new URLSearchParams({
      ep3Date, ep3Time, ep4Date, ep4Time, longoDate, longoTime,
    });
    window.location.href = `/api/admin/escola-veus/package?${qs.toString()}`;
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Escola dos Véus — Empacotar semana</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Gera CSV Metricool com ep3, ep4 (IG/TT/YT-Shorts) + longo de domingo (YT canal).
        Importa no workspace Escola dos Véus.
      </p>

      <Row label="Ep3 — Ter">
        <input type="date" value={ep3Date} onChange={(e) => setEp3Date(e.target.value)} />
        <input type="time" value={ep3Time} onChange={(e) => setEp3Time(e.target.value)} />
      </Row>
      <Row label="Ep4 — Qui">
        <input type="date" value={ep4Date} onChange={(e) => setEp4Date(e.target.value)} />
        <input type="time" value={ep4Time} onChange={(e) => setEp4Time(e.target.value)} />
      </Row>
      <Row label="Longo — Dom">
        <input type="date" value={longoDate} onChange={(e) => setLongoDate(e.target.value)} />
        <input type="time" value={longoTime} onChange={(e) => setLongoTime(e.target.value)} />
      </Row>

      <button
        onClick={download}
        style={{
          marginTop: 24,
          padding: "12px 20px",
          background: "#2A3F5C",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Descarregar CSV
      </button>

      <details style={{ marginTop: 32, color: "#666" }}>
        <summary style={{ cursor: "pointer" }}>Vídeos incluídos</summary>
        <ul style={{ fontSize: 13, marginTop: 8 }}>
          <li>ep03-a-vergonha-que-inventa-desculpas (Reels)</li>
          <li>ep04-o-desconto-que-deste-sem-ninguem-pedir (Reels)</li>
          <li>peso-de-quem-veio-antes (YT canal)</li>
        </ul>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          Para mudar os vídeos, edita as constantes <code>VIDEOS</code> e <code>LONGO_SLUG</code> em <code>/api/admin/escola-veus/package/route.ts</code>.
        </p>
      </details>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <label style={{ width: 130, fontSize: 14, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}
