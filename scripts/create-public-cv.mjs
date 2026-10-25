import fs from 'node:fs';
import path from 'node:path';

function createCleanPdf() {
  const lines = [
    { text: "DR. HAMIS MIRAJI ALLY SIMBA", size: 16, dy: 0, font: "F2" },
    { text: "Economist - Researcher - Consultant", size: 12, dy: 22, font: "F1" },
    { text: "Tanzania Economic and Financial Policy Consultancy (TEFPC)", size: 11, dy: 18, font: "F1" },
    { text: "Rita Tower, 15th Floor, Posta, Dar es Salaam, Tanzania", size: 10, dy: 16, font: "F1" },
    { text: "--------------------------------------------------------------------------------", size: 10, dy: 18, font: "F1" },
    { text: "RESEARCH SPECIALIZATIONS", size: 12, dy: 22, font: "F2" },
    { text: "- Economic Policy and Analysis  |  Economic Modelling", size: 10, dy: 16, font: "F1" },
    { text: "- Applied Macroeconomics        |  Applied Econometrics", size: 10, dy: 14, font: "F1" },
    { text: "- Economic Development          |  Time Series Econometrics", size: 10, dy: 14, font: "F1" },
    { text: "--------------------------------------------------------------------------------", size: 10, dy: 18, font: "F1" },
    { text: "EDUCATION (Selected)", size: 12, dy: 22, font: "F2" },
    { text: "2022 - 2026: PhD in Economics, Istanbul Gelisim University, Turkey", size: 10, dy: 16, font: "F1" },
    { text: "2016 - 2018: M.S. in Economics, Ankara Yildirim Beyazit University, Turkey", size: 10, dy: 14, font: "F1" },
    { text: "2024 - Proc: Bachelor of Arts in Economics", size: 10, dy: 14, font: "F1" },
    { text: "2009 - 2012: B.A., Computer Science, Institute of Finance Management (IFM)", size: 10, dy: 14, font: "F1" },
    { text: "--------------------------------------------------------------------------------", size: 10, dy: 18, font: "F1" },
    { text: "SELECTED EXPERIENCE", size: 12, dy: 22, font: "F2" },
    { text: "- Economic Researcher, Economic and Social Research Foundation (ESRF), 2025-Resuming", size: 9, dy: 16, font: "F1" },
    { text: "- Economic Associate Researcher, Istanbul Gelisim University, 2022-2026", size: 9, dy: 14, font: "F1" },
    { text: "- Founder and Director General, Magandi Foreign Trade Comp LTD, 2023-2025", size: 9, dy: 14, font: "F1" },
    { text: "- Assistant Economic Researcher, Ankara Yildirim Beyazit University, 2017-2019", size: 9, dy: 14, font: "F1" },
    { text: "- Economic Director, Tanzania Chamber of Commerce (TCCIA) in Turkey, 2017-2022", size: 9, dy: 14, font: "F1" },
    { text: "- Interviewer & Coordinator, Ifakara Health Institute (IHI), 2013", size: 9, dy: 14, font: "F1" },
    { text: "--------------------------------------------------------------------------------", size: 10, dy: 18, font: "F1" },
    { text: "SELECTED PUBLICATIONS", size: 12, dy: 22, font: "F2" },
    { text: "- Cogent Social Sciences (2026): Macroeconomic determinants & income inequality in Africa", size: 9, dy: 16, font: "F1" },
    { text: "- Springer Nature (2026): Energy Security, Institutional Quality & Geopolitical Risks", size: 9, dy: 14, font: "F1" },
    { text: "- Journal of the Knowledge Economy (2024): Governance quality on economic growth in SSA", size: 9, dy: 14, font: "F1" },
    { text: "- Economic and Regional Studies (2024): Good governance and economic growth in SSA", size: 9, dy: 14, font: "F1" },
    { text: "- Sustainability (2023): Global energy transformation and climate change mitigation", size: 9, dy: 14, font: "F1" },
    { text: "- Journal of Economics Finance and Accounting (2020): Energy consumption & growth in TZ", size: 9, dy: 14, font: "F1" },
    { text: "--------------------------------------------------------------------------------", size: 10, dy: 18, font: "F1" },
    { text: "NOTICE: Confidential referee contacts and residential details omitted for privacy.", size: 8, dy: 20, font: "F1" },
    { text: "Full institutional references available upon official inquiry via TEFPC.", size: 8, dy: 12, font: "F1" },
  ];

  let stream = "";
  let currentY = 740;
  for (const l of lines) {
    currentY -= l.dy;
    stream += `BT\n/${l.font} ${l.size} Tf\n50 ${currentY} Td\n(${l.text.replace(/[()]/g, "")}) Tj\nET\n`;
  }

  const streamLength = Buffer.byteLength(stream);

  return `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj
4 0 obj << /Length ${streamLength} >> stream
${stream}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000251 00000 n 
0000000000 00000 n 
0000000000 00000 n 
trailer << /Size 7 /Root 1 0 R >>
startxref
${streamLength + 350}
%%EOF`;
}

const pdfContent = createCleanPdf();
fs.writeFileSync('public/dr-hamis-simba-cv-public.pdf', pdfContent);
console.log('✅ Public sanitized CV created at public/dr-hamis-simba-cv-public.pdf');
