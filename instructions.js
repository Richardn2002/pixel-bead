/**
 * Bead Assembly Instruction Image Generator
 */
const Instructions = (() => {

  /**
   * Generate an instruction image from a clusterResult.
   * Returns a canvas element with the full instruction sheet.
   *
   * Layout:
   * - Axis labels (x across top, y down left side)
   * - Enlarged pixel grid with color tag text in each cell
   * - Grid lines (thin every pixel, thick every 5)
   * - Color totals table below the grid
   */
  function generate(clusterResult) {
    const { clusters, pixelCluster, width, height } = clusterResult;

    // ── Sizing ──────────────────────────────────────────────────────
    // Cell size chosen so 10px bold monospace tags (~18px for 3 chars)
    // fill roughly half the cell width
    const cellSize = 36;
    const axisMargin = 30; // space for axis labels
    const gridW = width * cellSize;
    const gridH = height * cellSize;

    // Count colors for the legend
    const tagCounts = {};
    for (let i = 0; i < pixelCluster.length; i++) {
      const ci = pixelCluster[i];
      if (ci === 0xFFFF) continue;
      const tag = clusters[ci].mapped.tag;
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    // Legend layout — large and readable
    const legendPadding = 40;
    const legendRowH = 60;
    const legendSwatchSize = 40;
    const legendFontSize = 30;
    const legendTitleSize = 36;
    const legendCols = 4;
    const legendRows = Math.ceil(sortedTags.length / legendCols);
    const legendH = legendRows * legendRowH + legendPadding * 2 + legendTitleSize + 20;

    const totalW = axisMargin + gridW + 10;
    const totalH = axisMargin + gridH + legendH + 10;

    // ── Canvas ──────────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);

    // ── Draw pixels ─────────────────────────────────────────────────
    const ox = axisMargin; // grid origin x
    const oy = axisMargin; // grid origin y

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const ci = pixelCluster[py * width + px];
        const x = ox + px * cellSize;
        const y = oy + py * cellSize;

        if (ci === 0xFFFF) {
          // Transparent — light checker
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.fillStyle = '#ddd';
          const half = cellSize / 2;
          ctx.fillRect(x, y, half, half);
          ctx.fillRect(x + half, y + half, half, half);
          continue;
        }

        const bead = clusters[ci].mapped;
        ctx.fillStyle = bead.hex;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Tag text — pick white or black based on luminance
        const lum = 0.299 * bead.r + 0.587 * bead.g + 0.114 * bead.b;
        ctx.fillStyle = lum > 140 ? '#000000' : '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bead.tag, x + cellSize / 2, y + cellSize / 2);
      }
    }

    // ── Grid lines ──────────────────────────────────────────────────
    // Thin lines every pixel
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i++) {
      const x = ox + i * cellSize;
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + gridH); ctx.stroke();
    }
    for (let i = 0; i <= height; i++) {
      const y = oy + i * cellSize;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + gridW, y); ctx.stroke();
    }

    // Thick lines every 5
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= width; i += 5) {
      const x = ox + i * cellSize;
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + gridH); ctx.stroke();
    }
    for (let i = 0; i <= height; i += 5) {
      const y = oy + i * cellSize;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + gridW, y); ctx.stroke();
    }

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, gridW, gridH);

    // ── Axis labels ─────────────────────────────────────────────────
    ctx.fillStyle = '#333';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // X axis (top)
    for (let i = 0; i < width; i++) {
      ctx.fillText(String(i + 1), ox + i * cellSize + cellSize / 2, oy - 3);
    }

    // Y axis (left)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < height; i++) {
      ctx.fillText(String(i + 1), ox - 4, oy + i * cellSize + cellSize / 2);
    }

    // ── Color totals legend ─────────────────────────────────────────
    const legendY = oy + gridH + legendPadding;

    ctx.fillStyle = '#333';
    ctx.font = `bold ${legendTitleSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Color Totals', ox, legendY);

    const colW = Math.floor(gridW / legendCols);
    const tableY = legendY + legendTitleSize + 16;

    ctx.font = `${legendFontSize}px monospace`;
    for (let i = 0; i < sortedTags.length; i++) {
      const [tag, count] = sortedTags[i];
      const col = i % legendCols;
      const row = Math.floor(i / legendCols);
      const x = ox + col * colW;
      const y = tableY + row * legendRowH;

      // Find bead color for swatch
      const bead = Palette.colors.find(c => c.tag === tag);
      if (bead) {
        ctx.fillStyle = bead.hex;
        ctx.fillRect(x, y + 4, legendSwatchSize, legendSwatchSize);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + 4, legendSwatchSize, legendSwatchSize);
      }

      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${tag}: ${count}`, x + legendSwatchSize + 8, y + 10);
    }

    return canvas;
  }

  return { generate };
})();
