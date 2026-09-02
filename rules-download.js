/*
  RULES PDF DOWNLOAD
  Reads the visible Field Rules list at click time, so editing Rules.html
  automatically changes the PDF players download - no second rules file to update.
*/
const rulesDownloadButton = document.querySelector('#download-rules-button');
const fieldRules = document.querySelectorAll('[data-download-rule]');

/* PDF literal strings need escaped punctuation and simple ASCII-safe text. */
function escapePdfText(value) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/* Wraps long rules so they fit inside the one-page PDF margins. */
function wrapRule(value, maximumCharacters = 86) {
  const lines = [];
  let line = '';

  value.split(/\s+/).forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maximumCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

/* Creates a lightweight, text-only PDF without requiring an external library. */
function createRulesPdf(rules) {
  const encoder = new TextEncoder();
  let content = 'BT\n';
  content += '/F1 20 Tf\n0.14 0.29 0.18 rg\n72 744 Td\n(Paintball Sports Land - Field Rules) Tj\n';
  content += '/F1 10.5 Tf\n0 0 0 rg\n0 -28 Td\n(Please review these rules before every game.) Tj\n0 -24 Td\n';

  rules.forEach((rule, index) => {
    wrapRule(`${index + 1}. ${rule}`).forEach((line) => {
      content += `(${escapePdfText(line)}) Tj\n0 -15 Td\n`;
    });
    content += '0 -4 Td\n';
  });

  content += '/F1 9 Tf\n0.14 0.29 0.18 rg\n0 -7 Td\n(Paintball Sports Land | (301) 898-1100) Tj\nET\n';

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return pdf;
}

if (rulesDownloadButton && fieldRules.length) {
  rulesDownloadButton.addEventListener('click', () => {
    /* Pulls the current marked rules from this page instead of maintaining a duplicate list. */
    const rules = Array.from(fieldRules, (item) => item.textContent.trim());
    const rulesPdf = createRulesPdf(rules);
    const downloadUrl = URL.createObjectURL(new Blob([rulesPdf], { type: 'application/pdf' }));
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = 'Paintball-Sports-Land-Field-Rules.pdf';
    downloadLink.click();
    /* Releases the temporary browser file after the download has begun. */
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  });
}
