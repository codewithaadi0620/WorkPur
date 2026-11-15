import fs from 'fs';
import path from 'path';
import { marked } from '../backend/node_modules/marked/lib/marked.esm.js';
import { execSync } from 'child_process';

const markdownPath = path.resolve('docs/ADBMS_REPORT.md');
const htmlPath = path.resolve('docs/report.html');
const pdfPath = path.resolve('docs/FreelanceHub_ADBMS_Report.pdf');

console.log('Reading Markdown report...');
const mdContent = fs.readFileSync(markdownPath, 'utf8');

console.log('Converting Markdown to HTML...');
const htmlBody = marked.parse(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FreelanceHub - ADBMS Academic Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 90vh;
      text-align: center;
      padding: 40px 20px;
    }

    .cover-badge {
      display: inline-block;
      align-self: center;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 6px 16px;
      border-radius: 9999px;
      margin-bottom: 24px;
      border: 1px solid #c7d2fe;
    }

    .cover-title {
      font-size: 30pt;
      font-weight: 900;
      color: #1e1b4b;
      margin: 0 0 16px 0;
      line-height: 1.15;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 14pt;
      font-weight: 600;
      color: #4338ca;
      max-width: 600px;
      margin: 0 auto 36px auto;
      line-height: 1.4;
    }

    .cover-divider {
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      margin: 0 auto 36px auto;
      border-radius: 2px;
    }

    .cover-meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      max-width: 520px;
      margin: 0 auto;
      text-align: left;
      font-size: 10pt;
    }

    .cover-meta-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .cover-meta-row:last-child {
      border-bottom: none;
    }

    .cover-meta-label {
      color: #64748b;
      font-weight: 600;
    }

    .cover-meta-val {
      color: #0f172a;
      font-weight: 700;
    }

    /* Headings */
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 28px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 15pt;
      font-weight: 700;
      color: #1e1b4b;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 14px;
      page-break-before: always;
      page-break-after: avoid;
    }

    h2:first-of-type {
      page-break-before: avoid;
    }

    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: #334155;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h4 {
      font-size: 11pt;
      font-weight: 600;
      color: #475569;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 24px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Code Blocks */
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: Consolas, Monaco, "Andale Mono", monospace;
      font-size: 8.5pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 14px 0;
      page-break-inside: avoid;
      border: 1px solid #1e293b;
    }

    code {
      font-family: Consolas, Monaco, "Andale Mono", monospace;
      font-size: 9pt;
      background-color: #f1f5f9;
      color: #4338ca;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    blockquote {
      border-left: 4px solid #6366f1;
      background-color: #f5f3ff;
      margin: 14px 0;
      padding: 10px 16px;
      color: #4338ca;
      font-size: 9.5pt;
      border-radius: 0 8px 8px 0;
    }

    hr {
      border: none;
      height: 1px;
      background-color: #e2e8f0;
      margin: 28px 0;
    }

    a {
      color: #4f46e5;
      text-decoration: none;
    }

    /* Header & Footer printing */
    .report-footer {
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
      margin-top: 40px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-badge">Academic Project Documentation</div>
    <h1 class="cover-title">FreelanceHub</h1>
    <div class="cover-subtitle">
      Advanced Database Management Systems (ADBMS)<br>
      Enterprise Relational Architecture for Freelance Marketplace Platforms
    </div>
    <div class="cover-divider"></div>
    <div class="cover-meta">
      <div class="cover-meta-row">
        <span class="cover-meta-label">Subject:</span>
        <span class="cover-meta-val">Advanced Database Management Systems (ADBMS)</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Database Engine:</span>
        <span class="cover-meta-val">PostgreSQL 18 (Native PL/pgSQL)</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Backend Architecture:</span>
        <span class="cover-meta-val">Node.js / Express.js / Prisma ORM</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Frontend Framework:</span>
        <span class="cover-meta-val">React 19 / Vite / Tailwind CSS</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Relational Scope:</span>
        <span class="cover-meta-val">17 Tables (3NF/BCNF) • 4 Stored Procs • 5 Triggers</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Test Verification:</span>
        <span class="cover-meta-val">26/26 Automated Tests Passing (Jest/Supertest)</span>
      </div>
      <div class="cover-meta-row">
        <span class="cover-meta-label">Publication Date:</span>
        <span class="cover-meta-val">November 2026</span>
      </div>
    </div>
  </div>

  <!-- Body Content -->
  <div class="report-content">
    ${htmlBody}
  </div>

  <div class="report-footer">
    FreelanceHub © 2026 • Advanced Database Management Systems (ADBMS) Technical Documentation
  </div>

</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('HTML written to:', htmlPath);

console.log('Generating PDF via headless Chrome...');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cmd = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('SUCCESS! PDF generated at:', pdfPath);
  const stats = fs.statSync(pdfPath);
  console.log(`PDF File Size: ${(stats.size / 1024).toFixed(1)} KB`);
} catch (err) {
  console.error('Error invoking Chrome headless:', err);
  process.exit(1);
}
