/**
 * Pixel Art Downscaling Algorithms
 *
 * All functions take:
 *   srcData  - ImageData of the source image
 *   tw       - target width
 *   th       - target height
 * And return an ImageData of size tw x th.
 */

const Algorithms = (() => {

  // ── Helpers ───────────────────────────────────────────────────────────

  function createOutput(tw, th) {
    return new ImageData(tw, th);
  }

  /** Get RGBA at (x, y) from ImageData */
  function getPixel(data, w, x, y) {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  }

  /** Set RGBA at (x, y) in ImageData */
  function setPixel(data, w, x, y, rgba) {
    const i = (y * w + x) * 4;
    data[i] = rgba[0];
    data[i + 1] = rgba[1];
    data[i + 2] = rgba[2];
    data[i + 3] = rgba[3];
  }

  /** Pack RGBA into a single 32-bit key for fast comparison */
  function colorKey(r, g, b, a) {
    return (r << 24) | (g << 16) | (b << 8) | a;
  }

  // ── 1. Nearest Neighbor ───────────────────────────────────────────────

  function nearestNeighbor(srcData, tw, th) {
    const sw = srcData.width, sh = srcData.height;
    const src = srcData.data;
    const out = createOutput(tw, th);
    const dst = out.data;

    for (let y = 0; y < th; y++) {
      const sy = Math.floor((y + 0.5) * sh / th);
      for (let x = 0; x < tw; x++) {
        const sx = Math.floor((x + 0.5) * sw / tw);
        const si = (sy * sw + sx) * 4;
        const di = (y * tw + x) * 4;
        dst[di] = src[si];
        dst[di + 1] = src[si + 1];
        dst[di + 2] = src[si + 2];
        dst[di + 3] = src[si + 3];
      }
    }
    return out;
  }

  // ── 2. Box Sampling (Average) ─────────────────────────────────────────

  function boxSampling(srcData, tw, th) {
    const sw = srcData.width, sh = srcData.height;
    const src = srcData.data;
    const out = createOutput(tw, th);
    const dst = out.data;

    for (let y = 0; y < th; y++) {
      const srcY0 = y * sh / th;
      const srcY1 = (y + 1) * sh / th;
      const iy0 = Math.floor(srcY0);
      const iy1 = Math.min(Math.ceil(srcY1), sh);

      for (let x = 0; x < tw; x++) {
        const srcX0 = x * sw / tw;
        const srcX1 = (x + 1) * sw / tw;
        const ix0 = Math.floor(srcX0);
        const ix1 = Math.min(Math.ceil(srcX1), sw);

        let rSum = 0, gSum = 0, bSum = 0, aSum = 0, wSum = 0;

        for (let sy = iy0; sy < iy1; sy++) {
          // vertical weight: fraction of this row inside the box
          const wy = Math.min(sy + 1, srcY1) - Math.max(sy, srcY0);
          for (let sx = ix0; sx < ix1; sx++) {
            const wx = Math.min(sx + 1, srcX1) - Math.max(sx, srcX0);
            const w = wx * wy;
            const si = (sy * sw + sx) * 4;
            const a = src[si + 3] / 255;
            // premultiply to avoid dark halos
            rSum += src[si] * a * w;
            gSum += src[si + 1] * a * w;
            bSum += src[si + 2] * a * w;
            aSum += a * w;
            wSum += w;
          }
        }

        const di = (y * tw + x) * 4;
        if (aSum > 0.001) {
          dst[di] = Math.round(rSum / aSum);
          dst[di + 1] = Math.round(gSum / aSum);
          dst[di + 2] = Math.round(bSum / aSum);
          dst[di + 3] = Math.round((aSum / wSum) * 255);
        } else {
          dst[di] = dst[di + 1] = dst[di + 2] = dst[di + 3] = 0;
        }
      }
    }
    return out;
  }

  // ── 3. Mode (Majority Color) Sampling ─────────────────────────────────

  function modeSampling(srcData, tw, th) {
    const sw = srcData.width, sh = srcData.height;
    const src = srcData.data;
    const out = createOutput(tw, th);
    const dst = out.data;

    for (let y = 0; y < th; y++) {
      const iy0 = Math.floor(y * sh / th);
      const iy1 = Math.max(iy0 + 1, Math.min(Math.floor((y + 1) * sh / th), sh));

      for (let x = 0; x < tw; x++) {
        const ix0 = Math.floor(x * sw / tw);
        const ix1 = Math.max(ix0 + 1, Math.min(Math.floor((x + 1) * sw / tw), sw));

        // Count occurrences of each color in the block
        const counts = new Map();
        let maxCount = 0;
        let maxColor = [0, 0, 0, 0];

        // Count transparent vs opaque
        let transparentCount = 0;
        let totalCount = 0;

        for (let sy = iy0; sy < iy1; sy++) {
          for (let sx = ix0; sx < ix1; sx++) {
            const si = (sy * sw + sx) * 4;
            const a = src[si + 3];
            totalCount++;

            if (a < 128) {
              transparentCount++;
              continue;
            }

            const key = colorKey(src[si], src[si + 1], src[si + 2], a);
            const c = (counts.get(key) || 0) + 1;
            counts.set(key, c);
            if (c > maxCount) {
              maxCount = c;
              maxColor = [src[si], src[si + 1], src[si + 2], a];
            }
          }
        }

        const di = (y * tw + x) * 4;
        if (transparentCount > totalCount / 2) {
          dst[di] = dst[di + 1] = dst[di + 2] = dst[di + 3] = 0;
        } else {
          dst[di] = maxColor[0];
          dst[di + 1] = maxColor[1];
          dst[di + 2] = maxColor[2];
          dst[di + 3] = maxColor[3];
        }
      }
    }
    return out;
  }

  // ── 4. Edge-Aware Adaptive ────────────────────────────────────────────

  function adaptive(srcData, tw, th) {
    const sw = srcData.width, sh = srcData.height;
    const src = srcData.data;

    // Step 1: Get a smooth base via box sampling
    const base = boxSampling(srcData, tw, th);
    const baseD = base.data;

    // Step 2: Get a sharp version via mode sampling
    const sharp = modeSampling(srcData, tw, th);
    const sharpD = sharp.data;

    // Step 3: Build an edge/importance map from the source image.
    // For each output pixel's corresponding source block, measure color variance.
    // High variance = edge region = prefer sharp version.
    const out = createOutput(tw, th);
    const dst = out.data;

    for (let y = 0; y < th; y++) {
      const iy0 = Math.floor(y * sh / th);
      const iy1 = Math.max(iy0 + 1, Math.min(Math.floor((y + 1) * sh / th), sh));

      for (let x = 0; x < tw; x++) {
        const ix0 = Math.floor(x * sw / tw);
        const ix1 = Math.max(ix0 + 1, Math.min(Math.floor((x + 1) * sw / tw), sw));

        // Compute color variance in the block
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        const pixels = [];

        for (let sy = iy0; sy < iy1; sy++) {
          for (let sx = ix0; sx < ix1; sx++) {
            const si = (sy * sw + sx) * 4;
            if (src[si + 3] < 128) continue;
            const r = src[si], g = src[si + 1], b = src[si + 2];
            pixels.push([r, g, b]);
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        const di = (y * tw + x) * 4;

        if (count === 0) {
          // Fully transparent
          dst[di] = dst[di + 1] = dst[di + 2] = dst[di + 3] = 0;
          continue;
        }

        const rMean = rSum / count;
        const gMean = gSum / count;
        const bMean = bSum / count;

        // Calculate variance
        let variance = 0;
        for (const [r, g, b] of pixels) {
          variance += (r - rMean) ** 2 + (g - gMean) ** 2 + (b - bMean) ** 2;
        }
        variance /= count;

        // Also check for outlier pixels: pixels that are very different from the block mean.
        // This helps preserve single important pixels (e.g., an eye pixel on a face).
        let hasOutlier = false;
        const outlierThreshold = 80 * 80 * 3; // high color distance
        for (const [r, g, b] of pixels) {
          const dist = (r - rMean) ** 2 + (g - gMean) ** 2 + (b - bMean) ** 2;
          if (dist > outlierThreshold) {
            hasOutlier = true;
            break;
          }
        }

        // High variance or outlier → use sharp (mode) version
        // Low variance → use smooth (box) version for gradients
        // Medium → blend
        const edgeThreshold = 1500;
        const smoothThreshold = 300;

        let t; // blend factor: 0 = box, 1 = mode
        if (hasOutlier || variance > edgeThreshold) {
          t = 1.0;
        } else if (variance < smoothThreshold) {
          t = 0.0;
        } else {
          t = (variance - smoothThreshold) / (edgeThreshold - smoothThreshold);
        }

        dst[di]     = Math.round(baseD[di]     * (1 - t) + sharpD[di]     * t);
        dst[di + 1] = Math.round(baseD[di + 1] * (1 - t) + sharpD[di + 1] * t);
        dst[di + 2] = Math.round(baseD[di + 2] * (1 - t) + sharpD[di + 2] * t);
        dst[di + 3] = Math.round(baseD[di + 3] * (1 - t) + sharpD[di + 3] * t);
      }
    }

    return out;
  }

  // ── 5. Vectorize & Re-rasterize ──────────────────────────────────────
  //
  // Inspired by Kopf-Lischinski "Depixelizing Pixel Art" (SIGGRAPH 2011).
  // 1. Build a pixel similarity graph (8-connected)
  // 2. Resolve ambiguous crossing diagonals using curves + sparse heuristics
  // 3. Render to a super-resolution buffer with diagonal-aware cell shapes
  // 4. Box-sample the super-res down to the target size

  function vectorize(srcData, tw, th, rasterFn) {
    const sw = srcData.width, sh = srcData.height;
    const src = srcData.data;
    rasterFn = rasterFn || modeSampling;

    if (sw < 2 || sh < 2) return rasterFn(srcData, tw, th);

    function srcIdx(x, y) { return (y * sw + x) * 4; }

    function colorDist2(x1, y1, x2, y2) {
      const i = srcIdx(x1, y1), j = srcIdx(x2, y2);
      const dr = src[i] - src[j];
      const dg = src[i + 1] - src[j + 1];
      const db = src[i + 2] - src[j + 2];
      const da = src[i + 3] - src[j + 3];
      return dr * dr + dg * dg + db * db + da * da;
    }

    // ── Step 1: Build similarity graph ──────────────────────────────

    const T2 = 48 * 48; // similarity threshold (squared Euclidean in RGBA)

    // Edge arrays indexed by y * sw + x
    // hEdge: (x,y)↔(x+1,y)  vEdge: (x,y)↔(x,y+1)
    // dEdge: (x,y)↔(x+1,y+1) "\"   aEdge: (x+1,y)↔(x,y+1) "/"
    const hEdge = new Uint8Array(sh * sw);
    const vEdge = new Uint8Array(sh * sw);
    const dEdge = new Uint8Array(sh * sw);
    const aEdge = new Uint8Array(sh * sw);

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const k = y * sw + x;
        if (x + 1 < sw)
          hEdge[k] = colorDist2(x, y, x + 1, y) < T2 ? 1 : 0;
        if (y + 1 < sh)
          vEdge[k] = colorDist2(x, y, x, y + 1) < T2 ? 1 : 0;
        if (x + 1 < sw && y + 1 < sh) {
          dEdge[k] = colorDist2(x, y, x + 1, y + 1) < T2 ? 1 : 0;
          aEdge[k] = colorDist2(x + 1, y, x, y + 1) < T2 ? 1 : 0;
        }
      }
    }

    // ── Step 2: Resolve crossing diagonals ──────────────────────────

    function valence(x, y) {
      let v = 0;
      // horizontal
      if (x > 0) v += hEdge[y * sw + x - 1];
      if (x + 1 < sw) v += hEdge[y * sw + x];
      // vertical
      if (y > 0) v += vEdge[(y - 1) * sw + x];
      if (y + 1 < sh) v += vEdge[y * sw + x];
      // \ diag
      if (x > 0 && y > 0) v += dEdge[(y - 1) * sw + x - 1];
      if (x + 1 < sw && y + 1 < sh) v += dEdge[y * sw + x];
      // / anti-diag — aEdge[by][bx] links (bx+1,by)↔(bx,by+1)
      if (x > 0 && y + 1 < sh) v += aEdge[y * sw + x - 1];       // as (bx+1,by)
      if (x + 1 < sw && y > 0) v += aEdge[(y - 1) * sw + x];     // as (bx,by+1)
      return v;
    }

    // Sparseness: how many of the 8-neighbours share a similar color.
    // Lower = rarer pixel = more important to keep connected.
    function sparseness(x, y) {
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= sw || ny < 0 || ny >= sh) continue;
          if (colorDist2(x, y, nx, ny) < T2) count++;
        }
      }
      return count;
    }

    for (let by = 0; by < sh - 1; by++) {
      for (let bx = 0; bx < sw - 1; bx++) {
        const k = by * sw + bx;
        if (!dEdge[k] || !aEdge[k]) continue; // no crossing

        // TL=(bx,by) TR=(bx+1,by) BL=(bx,by+1) BR=(bx+1,by+1)
        let dVotes = 0, aVotes = 0;

        // Curves heuristic (weight 1): lower total valence → thinner feature → keep
        const dVal = valence(bx, by) + valence(bx + 1, by + 1);
        const aVal = valence(bx + 1, by) + valence(bx, by + 1);
        if (dVal < aVal) dVotes += 1;
        else if (aVal < dVal) aVotes += 1;

        // Sparse-pixel heuristic (weight 5): lower sparseness → rarer → keep
        const dSp = sparseness(bx, by) + sparseness(bx + 1, by + 1);
        const aSp = sparseness(bx + 1, by) + sparseness(bx, by + 1);
        if (dSp < aSp) dVotes += 5;
        else if (aSp < dSp) aVotes += 5;

        // Islands heuristic (weight 5): don't isolate a pixel
        // If removing \ would leave TL or BR with valence 0, vote to keep \.
        // (Valence includes both diags, so subtract 1 for the removed one.)
        if (valence(bx, by) <= 1 || valence(bx + 1, by + 1) <= 1) dVotes += 5;
        if (valence(bx + 1, by) <= 1 || valence(bx, by + 1) <= 1) aVotes += 5;

        if (dVotes > aVotes) aEdge[k] = 0;
        else if (aVotes > dVotes) dEdge[k] = 0;
        else { dEdge[k] = 0; aEdge[k] = 0; } // tie → remove both
      }
    }

    // ── Step 3: Render at super-resolution with diagonal corrections ─

    // Choose S so the super-res buffer stays within ~4 M pixels
    const maxPx = 4000000;
    let S = Math.floor(Math.sqrt(maxPx / (sw * sh)));
    S = Math.max(2, Math.min(S, 8));

    const srW = sw * S, srH = sh * S;
    const sr = new Uint8ClampedArray(srW * srH * 4);

    // 3a. Fill each source pixel as an S×S block
    for (let py = 0; py < sh; py++) {
      for (let px = 0; px < sw; px++) {
        const si = srcIdx(px, py);
        const r = src[si], g = src[si + 1], b = src[si + 2], a = src[si + 3];
        for (let dy = 0; dy < S; dy++) {
          const rowOff = ((py * S + dy) * srW) * 4;
          for (let dx = 0; dx < S; dx++) {
            const di = rowOff + (px * S + dx) * 4;
            sr[di] = r; sr[di + 1] = g; sr[di + 2] = b; sr[di + 3] = a;
          }
        }
      }
    }

    // 3b. At each grid intersection, paint correction triangles so that
    //     diagonal-connected pixels visually merge through the junction.
    const d = Math.max(1, Math.floor(S / 2));

    for (let gy = 1; gy < sh; gy++) {
      for (let gx = 1; gx < sw; gx++) {
        const bk = (gy - 1) * sw + (gx - 1);
        const hasDiag = dEdge[bk];
        const hasAnti = aEdge[bk];
        if (!hasDiag && !hasAnti) continue;

        const bx = gx - 1, by = gy - 1;
        const tlI = srcIdx(bx, by);
        const trI = srcIdx(bx + 1, by);
        const blI = srcIdx(bx, by + 1);
        const brI = srcIdx(bx + 1, by + 1);

        const gcx = gx * S; // grid-point centre in super-res coords
        const gcy = gy * S;

        if (hasDiag) {
          // "\" TL↔BR — paint TL colour into TR corner, BR colour into BL corner
          for (let sy = Math.max(0, gcy - d); sy < gcy; sy++) {
            for (let sx = gcx; sx < Math.min(srW, gcx + d); sx++) {
              if ((sx - gcx) + (gcy - 1 - sy) < d) {
                const di = (sy * srW + sx) * 4;
                sr[di] = src[tlI]; sr[di + 1] = src[tlI + 1];
                sr[di + 2] = src[tlI + 2]; sr[di + 3] = src[tlI + 3];
              }
            }
          }
          for (let sy = gcy; sy < Math.min(srH, gcy + d); sy++) {
            for (let sx = Math.max(0, gcx - d); sx < gcx; sx++) {
              if ((gcx - 1 - sx) + (sy - gcy) < d) {
                const di = (sy * srW + sx) * 4;
                sr[di] = src[brI]; sr[di + 1] = src[brI + 1];
                sr[di + 2] = src[brI + 2]; sr[di + 3] = src[brI + 3];
              }
            }
          }
        }

        if (hasAnti) {
          // "/" TR↔BL — paint TR colour into TL corner, BL colour into BR corner
          for (let sy = Math.max(0, gcy - d); sy < gcy; sy++) {
            for (let sx = Math.max(0, gcx - d); sx < gcx; sx++) {
              if ((gcx - 1 - sx) + (gcy - 1 - sy) < d) {
                const di = (sy * srW + sx) * 4;
                sr[di] = src[trI]; sr[di + 1] = src[trI + 1];
                sr[di + 2] = src[trI + 2]; sr[di + 3] = src[trI + 3];
              }
            }
          }
          for (let sy = gcy; sy < Math.min(srH, gcy + d); sy++) {
            for (let sx = gcx; sx < Math.min(srW, gcx + d); sx++) {
              if ((sx - gcx) + (sy - gcy) < d) {
                const di = (sy * srW + sx) * 4;
                sr[di] = src[blI]; sr[di + 1] = src[blI + 1];
                sr[di + 2] = src[blI + 2]; sr[di + 3] = src[blI + 3];
              }
            }
          }
        }
      }
    }

    // ── Step 4: Mode-sample super-res buffer down to target ────────
    // Mode (majority-color) sampling keeps the output pixel-perfect:
    // each output pixel gets the single most-frequent color in its
    // super-res block.  The diagonal correction triangles shift area
    // between colours at junctions, tipping the majority vote so that
    // boundaries follow the resolved diagonals instead of stair-stepping.

    const srImageData = new ImageData(sr, srW, srH);
    return rasterFn(srImageData, tw, th);
  }

  // ── Public API ────────────────────────────────────────────────────────

  const descriptions = {
    nearest: "Samples the single closest source pixel. Fast and sharp, but can miss thin features depending on grid alignment.",
    box: "Averages all source pixels in each block. Every pixel contributes, but results look softer/blurrier.",
    mode: "Picks the most frequent color in each block. Sharper than averaging, good at preserving dominant colors.",
    adaptive: "Blends smooth (box) and sharp (mode) results based on edge detection. Best for preserving both gradients and important details.",
  };

  const vectorizeDescriptions = {
    nearest: "Vectorize + nearest neighbor. Smooth diagonals, sharp rasterization — may miss sub-pixel details.",
    box: "Vectorize + box sampling. Smooth diagonals with averaged rasterization — softer output.",
    mode: "Vectorize + mode sampling. Clean diagonal boundaries with sharp single-color pixels. Recommended.",
    adaptive: "Vectorize + adaptive. Clean diagonals with edge-aware rasterization blending smooth and sharp.",
  };

  const methods = {
    nearest: nearestNeighbor,
    box: boxSampling,
    mode: modeSampling,
    adaptive: adaptive,
  };

  return { methods, descriptions, vectorizeDescriptions, vectorize };
})();
