export const calculateSAW = (cameras, criteria) => {
  if (!cameras || cameras.length === 0) throw new Error("Tidak ada data kamera untuk dihitung.");
  if (!criteria || criteria.length === 0) throw new Error("Tidak ada data kriteria untuk dihitung.");

  // Fully dynamic criteria usage. No hardcoded fields!
  const activeCriteria = criteria;

  const formatVal = (v, critName) => {
    if (!v) return 0;
    if (critName.toLowerCase().includes('harga')) return v.toLocaleString('id-ID');
    return v;
  };

  // 1. Matriks Keputusan (X)
  const decisionMatrix = cameras.map(cam => {
    const row = { id: cam.id, name: cam.name, originalData: cam, values: {} };
    activeCriteria.forEach(crit => {
      // Access the dynamic values map
      row.values[crit.id] = cam.values && cam.values[crit.id] !== undefined ? Number(cam.values[crit.id]) : 0;
    });
    return row;
  });

  const criteriaMinMax = {};
  activeCriteria.forEach(crit => {
    const values = decisionMatrix.map(row => row.values[crit.id]);
    criteriaMinMax[crit.id] = {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });

  // 2. Matriks Normalisasi (R)
  const normalizedMatrix = decisionMatrix.map(row => {
    const normRow = { id: row.id, name: row.name, values: {} };
    activeCriteria.forEach(crit => {
      const val = row.values[crit.id];
      const min = criteriaMinMax[crit.id].min;
      const max = criteriaMinMax[crit.id].max;
      
      let normVal = 0;
      let mathStr = '';

      if (crit.type.toLowerCase() === 'benefit') {
        normVal = max === 0 ? 0 : val / max;
        mathStr = `[ ${formatVal(val, crit.name)} / ${formatVal(max, crit.name)} ]`;
      } else { // Cost
        normVal = val === 0 ? 0 : min / val;
        mathStr = `[ ${formatVal(min, crit.name)} / ${formatVal(val, crit.name)} ]`;
      }
      
      normRow.values[crit.id] = {
        value: Number(normVal.toFixed(3)),
        mathString: mathStr
      };
    });
    return normRow;
  });

  // 3. Matriks Pembobotan & Nilai Preferensi (V)
  const results = normalizedMatrix.map(normRow => {
    const prefRow = { id: normRow.id, name: normRow.name, originalData: decisionMatrix.find(d => d.id === normRow.id).originalData, weightedValues: {}, totalScore: 0 };
    
    const sumParts = [];

    activeCriteria.forEach(crit => {
      const weight = Number(crit.weight) / 100;
      const val = normRow.values[crit.id].value;
      const weightedVal = val * weight;
      
      prefRow.weightedValues[crit.id] = {
        value: Number(weightedVal.toFixed(3)),
        mathString: `${val.toFixed(3)} × ${weight}`
      };
      prefRow.totalScore += prefRow.weightedValues[crit.id].value;
      sumParts.push(prefRow.weightedValues[crit.id].value.toFixed(3));
    });
    
    prefRow.totalScore = Number(prefRow.totalScore.toFixed(3));
    prefRow.mathSumString = `(${sumParts.join(' + ')})`;
    return prefRow;
  });

  // 4. Perankingan
  results.sort((a, b) => b.totalScore - a.totalScore);
  
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return {
    activeCriteria,
    decisionMatrix,
    criteriaMinMax,
    normalizedMatrix,
    results
  };
};
