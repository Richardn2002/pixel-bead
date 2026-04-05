/**
 * Color clustering and bead-mapping logic.
 */
const ColorTransform = (() => {

  /**
   * Agglomerative clustering of image colors.
   * Returns { clusters, pixelCluster, width, height }
   *   clusters[i] = { id, r, g, b, count, colors: [original colors], mapped: beadColor }
   *   pixelCluster = Uint16Array mapping pixel index → cluster id
   */
  function cluster(imageData, threshold, distFnName) {
    const { data, width, height } = imageData;
    const distFn = Palette.distanceFns[distFnName] || Palette.rgbDist;

    // 1. Extract unique colors (ignore fully transparent)
    const colorMap = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      if (!colorMap.has(key)) {
        colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 0, key });
      }
      colorMap.get(key).count++;
    }

    // 2. Initial clusters
    let clusters = Array.from(colorMap.values()).map((c, i) => ({
      id: i,
      r: c.r, g: c.g, b: c.b,
      count: c.count,
      colors: [c],
    }));

    // 3. Agglomerative merge
    // Pre-compute distance matrix for efficiency
    if (clusters.length > 1) {
      const n = clusters.length;
      const dist = new Float32Array(n * n);
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const d = distFn(clusters[i], clusters[j]);
          dist[i * n + j] = d;
          dist[j * n + i] = d;
        }

      const alive = new Uint8Array(n).fill(1);

      while (true) {
        let minD = Infinity, mi = -1, mj = -1;
        for (let i = 0; i < n; i++) {
          if (!alive[i]) continue;
          for (let j = i + 1; j < n; j++) {
            if (!alive[j]) continue;
            if (dist[i * n + j] < minD) {
              minD = dist[i * n + j];
              mi = i; mj = j;
            }
          }
        }
        if (minD > threshold || mi === -1) break;

        // Merge mj into mi (weighted average)
        const ci = clusters[mi], cj = clusters[mj];
        const total = ci.count + cj.count;
        ci.r = Math.round((ci.r * ci.count + cj.r * cj.count) / total);
        ci.g = Math.round((ci.g * ci.count + cj.g * cj.count) / total);
        ci.b = Math.round((ci.b * ci.count + cj.b * cj.count) / total);
        ci.count = total;
        ci.colors = ci.colors.concat(cj.colors);
        alive[mj] = 0;

        // Update distances for mi
        for (let k = 0; k < n; k++) {
          if (!alive[k] || k === mi) continue;
          const d = distFn(ci, clusters[k]);
          dist[mi * n + k] = d;
          dist[k * n + mi] = d;
        }
      }

      // Compact
      clusters = clusters.filter((_, i) => alive[i]);
    }

    // Re-index
    clusters.forEach((c, i) => c.id = i);

    // 4. Build color → cluster lookup
    const colorToCluster = new Map();
    for (const cl of clusters) {
      for (const c of cl.colors) {
        colorToCluster.set(c.key, cl.id);
      }
    }

    // 5. Map pixels
    const pixelCluster = new Uint16Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      if (data[idx + 3] < 128) {
        pixelCluster[i] = 0xFFFF; // transparent sentinel
        continue;
      }
      const key = `${data[idx]},${data[idx + 1]},${data[idx + 2]}`;
      pixelCluster[i] = colorToCluster.get(key) ?? 0;
    }

    // 6. Auto-map each cluster to closest bead
    const distForMapping = Palette.distanceFns[distFnName] || Palette.rgbDist;
    for (const cl of clusters) {
      cl.mapped = Palette.findClosest(cl, distForMapping);
    }

    return { clusters, pixelCluster, width, height };
  }

  /** Render the clustered image (each pixel = its cluster's representative color) */
  function renderClustered(result) {
    const { clusters, pixelCluster, width, height } = result;
    const out = new ImageData(width, height);
    const d = out.data;
    for (let i = 0; i < pixelCluster.length; i++) {
      const ci = pixelCluster[i];
      if (ci === 0xFFFF) { d[i * 4 + 3] = 0; continue; }
      const cl = clusters[ci];
      d[i * 4] = cl.r;
      d[i * 4 + 1] = cl.g;
      d[i * 4 + 2] = cl.b;
      d[i * 4 + 3] = 255;
    }
    return out;
  }

  /** Render the final mapped image (each pixel = its cluster's mapped bead color) */
  function renderMapped(result) {
    const { clusters, pixelCluster, width, height } = result;
    const out = new ImageData(width, height);
    const d = out.data;
    for (let i = 0; i < pixelCluster.length; i++) {
      const ci = pixelCluster[i];
      if (ci === 0xFFFF) { d[i * 4 + 3] = 0; continue; }
      const bead = clusters[ci].mapped;
      d[i * 4] = bead.r;
      d[i * 4 + 1] = bead.g;
      d[i * 4 + 2] = bead.b;
      d[i * 4 + 3] = 255;
    }
    return out;
  }

  return { cluster, renderClustered, renderMapped };
})();
