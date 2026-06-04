import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (sawResult) => {
  const { activeCriteria, decisionMatrix, normalizedMatrix, results } = sawResult;
  const topCamera = results[0];
  
  const doc = new jsPDF();
  
  // Format dates
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Sistem Pendukung Keputusan Pemilihan Kamera Terbaik', 14, 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Metode: Simple Additive Weighting (SAW)', 14, 28);
  doc.text(`Tanggal Perhitungan: ${dateStr}`, 14, 34);
  
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  let currentY = 46;

  // TABLE 1: Kriteria
  doc.setFont('helvetica', 'bold');
  doc.text('1. Data Kriteria', 14, currentY);
  
  const criteriaData = activeCriteria.map((c, i) => [
    `C${i+1}`, 
    c.name, 
    `${c.weight}%`, 
    c.type
  ]);
  
  doc.autoTable({
    startY: currentY + 4,
    head: [['Kode', 'Nama Kriteria', 'Bobot', 'Jenis (Cost/Benefit)']],
    body: criteriaData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 10 }
  });
  
  currentY = doc.lastAutoTable.finalY + 14;

  // TABLE 2: Matriks Keputusan (X)
  doc.text('2. Matriks Keputusan (X)', 14, currentY);
  
  const matrixHeaders = ['Alternatif', ...activeCriteria.map(c => c.name)];
  
  // Custom format value for the PDF to ensure prices have dots and video has format
  const formatValue = (v, critName) => {
    if (v === undefined || v === null) return 0;
    const nameStr = critName.toLowerCase();
    if (nameStr.includes('harga')) {
      return new Intl.NumberFormat('id-ID').format(v);
    }
    if (nameStr.includes('berat')) {
      return `${v} g`;
    }
    if (nameStr.includes('video')) {
      if (v == 4320) return '8K (4320p)';
      if (v == 2160) return '4K (2160p)';
      if (v == 1440) return '2K (1440p)';
      if (v == 1080) return '1080p';
      if (v == 720) return '720p';
      return `${v}p`;
    }
    return v;
  };

  const decisionBody = decisionMatrix.map(row => {
    return [
      row.name,
      ...activeCriteria.map(c => formatValue(row.values[c.id], c.name))
    ];
  });
  
  doc.autoTable({
    startY: currentY + 4,
    head: [matrixHeaders],
    body: decisionBody,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 }
  });

  currentY = doc.lastAutoTable.finalY + 14;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // TABLE 3: Matriks Normalisasi (R)
  doc.text('3. Matriks Normalisasi (R)', 14, currentY);
  
  const normBody = normalizedMatrix.map(row => {
    return [
      row.name,
      ...activeCriteria.map(c => {
        const val = row.values[c.id]?.value !== undefined ? row.values[c.id].value : row.values[c.id];
        return typeof val === 'number' ? val.toFixed(3) : val;
      })
    ];
  });

  doc.autoTable({
    startY: currentY + 4,
    head: [matrixHeaders],
    body: normBody,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 }
  });

  currentY = doc.lastAutoTable.finalY + 14;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // TABLE 4: Nilai Preferensi (V)
  doc.text('4. Nilai Preferensi (V)', 14, currentY);
  
  const prefBody = results.map(row => {
    return [
      row.name,
      ...activeCriteria.map(c => {
        const val = row.weightedValues[c.id]?.value !== undefined ? row.weightedValues[c.id].value : row.weightedValues[c.id];
        return typeof val === 'number' ? val.toFixed(3) : val;
      })
    ];
  });

  doc.autoTable({
    startY: currentY + 4,
    head: [matrixHeaders],
    body: prefBody,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 }
  });

  currentY = doc.lastAutoTable.finalY + 14;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // TABLE 5: Ranking
  doc.text('5. Hasil Perankingan Akhir', 14, currentY);
  
  const rankBody = results.map((row, idx) => {
    return [
      idx + 1,
      row.name,
      row.totalScore.toFixed(3)
    ];
  });

  doc.autoTable({
    startY: currentY + 4,
    head: [['Peringkat', 'Nama Alternatif (Kamera)', 'Nilai Akhir']],
    body: rankBody,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald color for winner table
    styles: { fontSize: 10 }
  });

  currentY = doc.lastAutoTable.finalY + 14;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // Kesimpulan
  doc.setFont('helvetica', 'bold');
  doc.text('Kesimpulan', 14, currentY);
  doc.setFont('helvetica', 'normal');
  const conclusionText = `Berdasarkan hasil perhitungan metode SAW, ${topCamera.name} memperoleh nilai tertinggi sebesar ${topCamera.totalScore.toFixed(3)} sehingga direkomendasikan sebagai alternatif terbaik.`;
  
  const splitTitle = doc.splitTextToSize(conclusionText, 180);
  doc.text(splitTitle, 14, currentY + 8);

  // Pagination Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`Halaman ${i} dari ${pageCount}`, 196, 290, { align: 'right' });
    doc.text('Dicetak dari Sistem Pendukung Keputusan CamDecision', 14, 290);
  }

  doc.save('Laporan_Perhitungan_SAW.pdf');
};
