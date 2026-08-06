const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Paths
const markdownPath = path.join('C:', 'Users', 'eaddi', '.gemini', 'antigravity', 'brain', 'cbfc9bd9-f03b-4e55-be82-cbac73ee05b0', 'sales_analysis.md');
const htmlPath = path.join('C:', 'Users', 'eaddi', '.gemini', 'antigravity', 'scratch', 'OneLife', 'sales_analysis.html');
const pdfPath = path.join('C:', 'Users', 'eaddi', '.gemini', 'antigravity', 'scratch', 'OneLife', 'sales_analysis.pdf');

// Read Markdown
let markdownContent = fs.readFileSync(markdownPath, 'utf8');

// Custom Markdown to HTML Parser
function parseMarkdown(md) {
  let html = '';
  const lines = md.split('\n');
  let inList = false;
  let inTable = false;
  let tableHeaders = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Handle code blocks (e.g. Mermaid)
    if (line.startsWith('```')) {
      if (inCode) {
        inCode = false;
        html += '</div></div>';
      } else {
        inCode = true;
        const lang = line.slice(3).trim();
        html += `<div class="code-block ${lang}"><div class="code-content">`;
      }
      continue;
    }

    if (inCode) {
      // If it's a Mermaid diagram, render it as visual cards instead of text
      if (line.includes('-->')) {
        const parts = line.split('-->');
        if (parts.length === 2) {
          const left = parts[0].trim().replace(/"/g, '').replace(/<br>/g, ' - ');
          const right = parts[1].trim().replace(/"/g, '').replace(/<br>/g, ' - ');
          // Parse specific flowchart items
          const leftText = left.split(':')[1] || left;
          const rightText = right.split(':')[1] || right;
          html += `<div class="flow-step">
            <span class="flow-problem">❌ ${leftText}</span>
            <span class="flow-arrow">➔</span>
            <span class="flow-solution">🚀 ${rightText}</span>
          </div>`;
          continue;
        }
      }
      if (line.startsWith('graph') || line.startsWith('sequenceDiagram') || line.includes('participant')) {
        // Skip structural diagram commands
        continue;
      }
      html += line + '<br>';
      continue;
    }

    // Close list if line doesn't start with * or -
    if (inList && !line.startsWith('*') && !line.startsWith('-') && !line.startsWith('1.') && !line.startsWith('2.') && !line.startsWith('3.') && !line.startsWith('4.')) {
      html += '</ul>\n';
      inList = false;
    }

    // Close table if line doesn't start with |
    if (inTable && !line.startsWith('|')) {
      html += '</tbody></table>\n';
      inTable = false;
    }

    // Empty lines
    if (line === '') {
      html += '<p></p>\n';
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      html += `<h1>${line.slice(2)}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${line.slice(3)}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3>${line.slice(4)}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      const headerText = line.slice(5);
      if (headerText.includes('🚨 PROBLEM')) {
        html += `<div class="problem-card-wrapper"><h4 class="problem-card-title">${headerText}</h4>`;
      } else {
        html += `<h4>${headerText}</h4>\n`;
      }
      continue;
    }

    // Horizontal Rule
    if (line === '---') {
      html += '<hr>\n';
      continue;
    }

    // Table Parser
    if (line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Skip separator line
      if (cells[0] && cells[0].startsWith(':---') || cells[0] && cells[0].startsWith('---')) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        html += '<table><thead><tr>';
        cells.forEach(cell => {
          html += `<th>${parseInline(cell)}</th>`;
        });
        html += '</tr></thead><tbody>\n';
      } else {
        html += '<tr>';
        cells.forEach(cell => {
          html += `<td>${parseInline(cell)}</td>`;
        });
        html += '</tr>\n';
      }
      continue;
    }

    // Unordered Lists
    if (line.startsWith('*') || line.startsWith('-')) {
      if (!inList) {
        inList = true;
        html += '<ul>\n';
      }
      
      let itemContent = line.slice(1).trim();
      // Detect solutions inside problem cards to close the wrapper
      if (itemContent.includes('**Die OneLife-Lösung:**')) {
        html += `<li class="solution-item">${parseInline(itemContent)}</li>\n`;
        // Close wrapper div at the end of solution
        html += '</div><!-- close problem-card-wrapper -->\n';
      } else {
        html += `<li>${parseInline(itemContent)}</li>\n`;
      }
      continue;
    }

    // Numbered Lists
    if (/^\d+\./.test(line)) {
      if (!inList) {
        inList = true;
        html += '<ol>\n';
      }
      html += `<li>${parseInline(line.replace(/^\d+\./, '').trim())}</li>\n`;
      continue;
    }

    // Paragraph
    html += `<p>${parseInline(line)}</p>\n`;
  }

  // Cleanup open tags
  if (inList) html += '</ul>\n';
  if (inTable) html += '</tbody></table>\n';

  return html;
}

// Inline formatting (bold, italic, links)
function parseInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

const parsedBody = parseMarkdown(markdownContent);

// Premium HTML Template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>OneLife Nienburg - Verkaufs- und Geschäftsmodellanalyse</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            color: #2d3748;
            line-height: 1.6;
            font-size: 11pt;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }

        /* Cover Page */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40mm 20mm;
            page-break-after: always;
            border-left: 8px solid #D9A24A; /* Scholz & Friese Gold */
            background-color: #071B33; /* Deep Navy */
            color: #ffffff;
        }

        .cover-logo {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 16pt;
            letter-spacing: 2px;
            color: #D9A24A;
        }

        .cover-title-group {
            margin-top: auto;
            margin-bottom: auto;
        }

        .cover-title {
            font-family: 'Playfair Display', serif;
            font-size: 38pt;
            font-weight: 700;
            line-height: 1.15;
            color: #ffffff;
            margin: 0 0 10px 0;
        }

        .cover-subtitle {
            font-size: 18pt;
            font-weight: 300;
            color: #e2e8f0;
            margin: 0;
        }

        .cover-meta {
            font-size: 10pt;
            color: #a0aec0;
            border-top: 1px solid #4a5568;
            padding-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .cover-meta span {
            display: block;
        }

        /* Content Styles */
        .content-container {
            padding: 20mm;
        }

        h1, h2, h3, h4 {
            color: #071B33;
            font-family: 'Playfair Display', serif;
            page-break-inside: avoid;
        }

        h1 {
            font-size: 24pt;
            border-bottom: 2px solid #D9A24A;
            padding-bottom: 8px;
            margin-top: 0;
            margin-bottom: 20px;
        }

        h2 {
            font-size: 18pt;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 40px;
            margin-bottom: 15px;
            page-break-before: always;
        }

        h3 {
            font-size: 14pt;
            margin-top: 25px;
            margin-bottom: 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            color: #1a202c;
        }

        h4 {
            font-size: 12pt;
            margin-top: 15px;
            margin-bottom: 8px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
        }

        p {
            margin-top: 0;
            margin-bottom: 15px;
            text-align: justify;
        }

        ul, ol {
            margin-top: 0;
            margin-bottom: 20px;
            padding-left: 20px;
        }

        li {
            margin-bottom: 6px;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 10pt;
            page-break-inside: avoid;
        }

        th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        th {
            background-color: #071B33;
            color: #ffffff;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
        }

        tr:nth-child(even) {
            background-color: #f7fafc;
        }

        /* Custom Flow Steps (Replaced Mermaid) */
        .flow-step {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 18px;
            margin-bottom: 12px;
            font-size: 10.5pt;
            page-break-inside: avoid;
        }

        .flow-problem {
            color: #c53030;
            font-weight: 600;
            flex: 1;
        }

        .flow-arrow {
            color: #a0aec0;
            font-size: 16pt;
            margin: 0 15px;
        }

        .flow-solution {
            color: #22543d;
            font-weight: 600;
            flex: 1;
            text-align: right;
        }

        /* Problem-Solution Premium Cards styling */
        .problem-card-wrapper {
            background-color: #fffaf0;
            border: 1px solid #feebc8;
            border-left: 5px solid #dd6b20; /* Orange border for problems */
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            page-break-inside: avoid;
        }

        .problem-card-title {
            color: #dd6b20 !important;
            font-size: 13pt !important;
            margin-top: 0 !important;
            margin-bottom: 15px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .problem-card-wrapper ul {
            margin-bottom: 0;
        }

        .solution-item {
            list-style: none;
            background-color: #f0fff4;
            border: 1px solid #c6f6d5;
            border-left: 4px solid #38a169; /* Green marker */
            margin-top: 15px;
            padding: 12px 15px;
            border-radius: 6px;
            color: #22543d;
            font-weight: 500;
        }

        .solution-item strong {
            color: #276749;
        }

        /* Code block container styles */
        .code-block {
            display: none; /* Hide standard mermaid codes as we visually draw them */
        }

        hr {
            border: 0;
            height: 1px;
            background: #e2e8f0;
            margin: 30px 0;
        }

        code {
            font-family: monospace;
            background-color: #edf2f7;
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 9pt;
        }

        /* Print Settings */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
            }
            .cover-page {
                height: 99vh; /* Adjust for page breaks */
            }
            h2 {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>

    <!-- Cover Page -->
    <div class="cover-page">
        <div class="cover-logo">SCHOLZ & FRIESE</div>
        <div class="cover-title-group">
            <h1 class="cover-title">Verkaufs- &amp;<br>Geschäftsmodellanalyse</h1>
            <p class="cover-subtitle">OneLife Nienburg — Premium EMS &amp; Personal Training</p>
        </div>
        <div class="cover-meta">
            <div>
                <span><strong>Kunde:</strong> OneLife Nienburg (Juri Baron)</span>
                <span><strong>Konzept:</strong> Scholz &amp; Friese Webdesign-Agentur</span>
            </div>
            <div style="text-align: right;">
                <span><strong>Datum:</strong> 5. August 2026</span>
                <span><strong>Version:</strong> 1.1 (Premium)</span>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="content-container">
        ${parsedBody}
    </div>

</body>
</html>
`;

// Write HTML
fs.writeFileSync(htmlPath, htmlTemplate, 'utf8');
console.log('HTML generated at:', htmlPath);

// Execute Edge PDF print
const edgeCmd = `"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;

exec(edgeCmd, (err, stdout, stderr) => {
  if (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
  console.log('PDF successfully generated at:', pdfPath);
});
