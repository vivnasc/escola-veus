/**
 * Client-side PDF generation for workbook reflections.
 * Uses canvas-based approach — no external dependencies.
 */

type WorkbookData = {
  reflections: string[];
  table: { noticed: string; felt: string; remember: string };
  freeText: string;
};

const REFLECTION_PROMPTS = [
  "O que descobri sobre mim neste modulo?",
  "Que padrao reconheci que nao tinha visto antes?",
  "O que mudou na forma como vejo isto?",
];

export function generateWorkbookPDF(
  courseTitle: string,
  moduleTitle: string,
  moduleNumber: number,
  data: WorkbookData,
  primaryColor: string
): void {
  // Create a hidden iframe for printing
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) return;

  const html = buildHTML(courseTitle, moduleTitle, moduleNumber, data, primaryColor);
  doc.open();
  doc.write(html);
  doc.close();

  // Wait for styles to load, then print
  setTimeout(() => {
    iframe.contentWindow?.print();
    // Clean up after print dialog
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}

function buildHTML(
  courseTitle: string,
  moduleTitle: string,
  moduleNumber: number,
  data: WorkbookData,
  primaryColor: string
): string {
  const reflectionSections = REFLECTION_PROMPTS.map(
    (prompt, i) => `
    <div class="section">
      <h3>${prompt}</h3>
      <div class="answer">${escapeHtml(data.reflections[i] || "(sem resposta)")}</div>
    </div>
  `
  ).join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4;
      margin: 20mm 18mm;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: #2a2a2a;
      font-size: 11pt;
      line-height: 1.6;
      background: white;
    }

    .cover {
      text-align: center;
      padding: 60px 0 40px;
      border-bottom: 2px solid ${primaryColor};
      margin-bottom: 30px;
    }

    .cover h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .cover h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16pt;
      font-weight: 400;
      color: ${primaryColor};
      margin-bottom: 4px;
    }

    .cover .subtitle {
      font-size: 10pt;
      color: #888;
    }

    .section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }

    .section h3 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13pt;
      font-weight: 600;
      color: ${primaryColor};
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid ${primaryColor}33;
    }

    .answer {
      font-family: 'Cormorant Garamond', serif;
      font-size: 12pt;
      font-style: italic;
      color: #333;
      padding: 8px 0;
      white-space: pre-wrap;
    }

    .table-section {
      margin-bottom: 24px;
    }

    .table-section h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14pt;
      color: #1a1a2e;
      margin-bottom: 12px;
    }

    .reg-table {
      width: 100%;
      border-collapse: collapse;
    }

    .reg-table th {
      background: ${primaryColor}15;
      color: ${primaryColor};
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 8px 12px;
      text-align: left;
      border-bottom: 2px solid ${primaryColor}33;
    }

    .reg-table td {
      padding: 10px 12px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 11pt;
      border-bottom: 1px solid #eee;
      vertical-align: top;
      white-space: pre-wrap;
    }

    .free-text {
      margin-top: 24px;
      page-break-inside: avoid;
    }

    .free-text h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14pt;
      color: #1a1a2e;
      margin-bottom: 12px;
    }

    .free-text .content {
      font-family: 'Cormorant Garamond', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 8pt;
      color: #aaa;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h2>${escapeHtml(courseTitle)}</h2>
    <h1>Caderno de Exercicios</h1>
    <div class="subtitle">Modulo ${moduleNumber} &middot; ${escapeHtml(moduleTitle)}</div>
  </div>

  ${reflectionSections}

  <div class="table-section">
    <h2>Registo</h2>
    <table class="reg-table">
      <thead>
        <tr>
          <th>O que notei</th>
          <th>Onde senti</th>
          <th>O que quero lembrar</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(data.table.noticed || "—")}</td>
          <td>${escapeHtml(data.table.felt || "—")}</td>
          <td>${escapeHtml(data.table.remember || "—")}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${
    data.freeText
      ? `
  <div class="free-text">
    <h2>As tuas palavras</h2>
    <div class="content">${escapeHtml(data.freeText)}</div>
  </div>`
      : ""
  }

  <div class="footer">
    Escola dos Veus &middot; Ve o que estava invisivel &middot; seteveus.space
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}
