(() => {
  // ── DOM refs ───────────────────────────────────────────────────────
  const fileInput = document.getElementById('file-input');
  const skipShrinkCheck = document.getElementById('skip-shrink');
  const shrinkControls = document.getElementById('shrink-controls');
  const targetW = document.getElementById('target-width');
  const targetH = document.getElementById('target-height');
  const lockAspect = document.getElementById('lock-aspect');
  const vectorizeCheck = document.getElementById('vectorize-check');
  const algoSelect = document.getElementById('algorithm');
  const algoDesc = document.getElementById('algo-desc');
  const processBtn = document.getElementById('process-btn');

  const origCanvas = document.getElementById('original-canvas');
  const resultCanvas = document.getElementById('result-canvas');
  const clusteredCanvas = document.getElementById('clustered-canvas');
  const mappedCanvas = document.getElementById('mapped-canvas');

  const origWrap = document.getElementById('original-wrap');
  const resultWrap = document.getElementById('result-wrap');
  const clusteredWrap = document.getElementById('clustered-wrap');
  const mappedWrap = document.getElementById('mapped-wrap');

  const origDims = document.getElementById('original-dims');
  const resultDims = document.getElementById('result-dims');

  const origZoomLabel = document.getElementById('original-zoom');
  const resultZoomLabel = document.getElementById('result-zoom');
  const clusteredZoomLabel = document.getElementById('clustered-zoom');
  const mappedZoomLabel = document.getElementById('mapped-zoom');

  const downloadLink = document.getElementById('download-link');
  const downloadMapped = document.getElementById('download-mapped');

  const colorSection = document.getElementById('color-section');
  const thresholdInput = document.getElementById('cluster-threshold');
  const thresholdVal = document.getElementById('threshold-val');
  const metricSelect = document.getElementById('cluster-metric');
  const mappingMetricSelect = document.getElementById('mapping-metric');
  const clusterCountEl = document.getElementById('cluster-count');
  const clusterListEl = document.getElementById('cluster-list');

  const beadPicker = document.getElementById('bead-picker');
  const pickerGrid = document.getElementById('picker-grid');
  const pickerFrom = document.getElementById('picker-from');
  const pickerTo = document.getElementById('picker-to');
  const pickerTag = document.getElementById('picker-tag');
  const pickerClose = document.getElementById('picker-close');

  const instructionSection = document.getElementById('instruction-section');
  const generateInstrBtn = document.getElementById('generate-instructions-btn');
  const instructionOutput = document.getElementById('instruction-output');
  const instructionCanvas = document.getElementById('instruction-canvas');
  const downloadInstructions = document.getElementById('download-instructions');

  // ── State ──────────────────────────────────────────────────────────
  let sourceImage = null;
  let sourceData = null;
  let hasLoadedImage = false;
  let shrunkData = null;
  let clusterResult = null;
  let pickerClusterId = null;
  let backdropEl = null;
  let highlightedClusterId = null;

  // Per-metric threshold settings
  const metricThresholds = {
    rgb:        { value: 30,  min: 0, max: 200 },
    perceptual: { value: 50,  min: 0, max: 350 },
    hue:        { value: 15,  min: 0, max: 90 },
  };

  const zoomState = {
    original:  { w: 0, h: 0, zoom: 1 },
    result:    { w: 0, h: 0, zoom: 1 },
    clustered: { w: 0, h: 0, zoom: 1 },
    mapped:    { w: 0, h: 0, zoom: 1 },
  };

  // ── Zoom helpers ───────────────────────────────────────────────────

  const canvasMap = { original: origCanvas, result: resultCanvas, clustered: clusteredCanvas, mapped: mappedCanvas };
  const wrapMap = { original: origWrap, result: resultWrap, clustered: clusteredWrap, mapped: mappedWrap };
  const labelMap = { original: origZoomLabel, result: resultZoomLabel, clustered: clusteredZoomLabel, mapped: mappedZoomLabel };

  function fitZoom(target) {
    const s = zoomState[target];
    if (!s.w || !s.h) return 1;
    const wrap = wrapMap[target];
    const availW = wrap.clientWidth - 24;
    const availH = Math.max(wrap.clientHeight - 24, 140);
    return Math.max(1, Math.min(Math.floor(availW / s.w), Math.floor(availH / s.h)));
  }

  function applyZoom(target, zoom) {
    const s = zoomState[target];
    s.zoom = Math.max(1, Math.min(zoom, 64));
    canvasMap[target].style.width = (s.w * s.zoom) + 'px';
    canvasMap[target].style.height = (s.h * s.zoom) + 'px';
    labelMap[target].textContent = s.zoom + 'x';
  }

  function autoFit(target) { applyZoom(target, fitZoom(target)); }

  document.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.target, dir = btn.dataset.dir;
      if (dir === 'fit') autoFit(t);
      else if (dir === '+') applyZoom(t, zoomState[t].zoom + 1);
      else applyZoom(t, zoomState[t].zoom - 1);
    });
  });

  // ── Algorithm description ──────────────────────────────────────────

  function updateAlgoDesc() {
    const name = algoSelect.value;
    if (vectorizeCheck.checked) {
      algoDesc.textContent = (Algorithms.vectorizeDescriptions[name] || '') ;
    } else {
      algoDesc.textContent = Algorithms.descriptions[name] || '';
    }
  }
  algoSelect.addEventListener('change', updateAlgoDesc);
  vectorizeCheck.addEventListener('change', updateAlgoDesc);
  updateAlgoDesc();

  // ── Skip-shrink toggle ─────────────────────────────────────────────

  function updateSkipShrinkUI() {
    const skip = skipShrinkCheck.checked;
    shrinkControls.style.display = skip ? 'none' : '';
    // When skipping, enable direct color mapping once image is loaded
    if (skip && sourceData) {
      enterColorMapping(sourceData);
    }
  }

  skipShrinkCheck.addEventListener('change', updateSkipShrinkUI);

  // ── Image loading ──────────────────────────────────────────────────

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      sourceImage = img;
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      sourceData = ctx.getImageData(0, 0, img.width, img.height);

      origCanvas.width = img.width;
      origCanvas.height = img.height;
      origCanvas.getContext('2d').drawImage(img, 0, 0);
      origDims.textContent = `${img.width} x ${img.height}`;
      zoomState.original.w = img.width;
      zoomState.original.h = img.height;
      autoFit('original');

      if (!hasLoadedImage) {
        const maxDim = 64;
        if (img.width >= img.height) {
          targetW.value = Math.min(img.width, maxDim);
          targetH.value = Math.round(img.height * Math.min(img.width, maxDim) / img.width);
        } else {
          targetH.value = Math.min(img.height, maxDim);
          targetW.value = Math.round(img.width * Math.min(img.height, maxDim) / img.height);
        }
        hasLoadedImage = true;
      }

      processBtn.disabled = false;
      downloadLink.style.display = 'none';
      resultDims.textContent = '';

      // If skip-shrink is checked, go directly to color mapping
      if (skipShrinkCheck.checked) {
        enterColorMapping(sourceData);
      }
    };
    img.src = URL.createObjectURL(file);
  });

  // ── Aspect ratio lock ──────────────────────────────────────────────

  targetW.addEventListener('input', () => {
    if (lockAspect.checked && sourceImage) {
      targetH.value = Math.max(1, Math.round(parseInt(targetW.value) * sourceImage.height / sourceImage.width));
    }
  });
  targetH.addEventListener('input', () => {
    if (lockAspect.checked && sourceImage) {
      targetW.value = Math.max(1, Math.round(parseInt(targetH.value) * sourceImage.width / sourceImage.height));
    }
  });

  // ── Enter color mapping (shared by shrink and skip-shrink) ─────────

  function enterColorMapping(imageData) {
    shrunkData = imageData;

    // Show shrunk preview
    const tw = imageData.width, th = imageData.height;
    resultCanvas.width = tw;
    resultCanvas.height = th;
    resultCanvas.getContext('2d').putImageData(imageData, 0, 0);
    resultDims.textContent = `${tw} x ${th}`;
    zoomState.result.w = tw;
    zoomState.result.h = th;
    autoFit('result');

    downloadLink.href = resultCanvas.toDataURL('image/png');
    downloadLink.download = `pixel-art-${tw}x${th}.png`;
    downloadLink.style.display = 'inline-block';

    colorSection.style.display = '';
    instructionSection.style.display = '';
    instructionOutput.style.display = 'none';
    runClustering();
  }

  // ── Shrink processing ─────────────────────────────────────────────

  processBtn.addEventListener('click', () => {
    if (!sourceData) return;
    const tw = parseInt(targetW.value), th = parseInt(targetH.value);
    if (tw < 1 || th < 1 || isNaN(tw) || isNaN(th)) return;

    const algoName = algoSelect.value;
    const useVectorize = vectorizeCheck.checked;

    processBtn.disabled = true;
    processBtn.textContent = 'Processing...';

    setTimeout(() => {
      let result;
      if (useVectorize) {
        const rasterFn = Algorithms.methods[algoName];
        result = Algorithms.vectorize(sourceData, tw, th, rasterFn);
      } else {
        result = Algorithms.methods[algoName](sourceData, tw, th);
      }

      processBtn.disabled = false;
      processBtn.textContent = 'Process';

      enterColorMapping(result);
    }, 0);
  });

  // ── Per-metric threshold ───────────────────────────────────────────

  function syncThresholdUI() {
    const m = metricSelect.value;
    const cfg = metricThresholds[m];
    thresholdInput.min = cfg.min;
    thresholdInput.max = cfg.max;
    thresholdInput.value = cfg.value;
    thresholdVal.textContent = cfg.value;
  }
  syncThresholdUI();

  metricSelect.addEventListener('change', () => {
    syncThresholdUI();
    runClustering();
  });

  thresholdInput.addEventListener('input', () => {
    const m = metricSelect.value;
    metricThresholds[m].value = parseInt(thresholdInput.value);
    thresholdVal.textContent = thresholdInput.value;
    runClustering();
  });

  // ── Mapping metric change (re-map beads, don't re-cluster) ─────────

  mappingMetricSelect.addEventListener('change', () => {
    if (!clusterResult) return;
    remapBeads();
    renderMappedPreview();
    renderClusterList();
  });

  function remapBeads() {
    if (!clusterResult) return;
    const distFn = Palette.distanceFns[mappingMetricSelect.value] || Palette.rgbDist;
    for (const cl of clusterResult.clusters) {
      cl.mapped = Palette.findClosest(cl, distFn);
    }
  }

  // ── Color clustering pipeline ──────────────────────────────────────

  function runClustering() {
    if (!shrunkData) return;
    const threshold = parseInt(thresholdInput.value);
    const metric = metricSelect.value;

    clusterResult = ColorTransform.cluster(shrunkData, threshold, metric);

    // Apply mapping metric
    const mappingDistFn = Palette.distanceFns[mappingMetricSelect.value] || Palette.rgbDist;
    for (const cl of clusterResult.clusters) {
      cl.mapped = Palette.findClosest(cl, mappingDistFn);
    }

    clusterCountEl.textContent = `${clusterResult.clusters.length} clusters`;

    renderClusteredPreview();
    renderMappedPreview();
    renderClusterList();

    // Hide instructions when re-clustering
    instructionOutput.style.display = 'none';
  }

  function renderClusteredPreview() {
    if (!clusterResult) return;
    const img = ColorTransform.renderClustered(clusterResult);
    clusteredCanvas.width = img.width;
    clusteredCanvas.height = img.height;
    clusteredCanvas.getContext('2d').putImageData(img, 0, 0);
    zoomState.clustered.w = img.width;
    zoomState.clustered.h = img.height;
    autoFit('clustered');
  }

  function renderMappedPreview() {
    if (!clusterResult) return;
    const img = ColorTransform.renderMapped(clusterResult);
    mappedCanvas.width = img.width;
    mappedCanvas.height = img.height;
    mappedCanvas.getContext('2d').putImageData(img, 0, 0);
    zoomState.mapped.w = img.width;
    zoomState.mapped.h = img.height;
    autoFit('mapped');

    downloadMapped.href = mappedCanvas.toDataURL('image/png');
    downloadMapped.download = `bead-output-${img.width}x${img.height}.png`;
    downloadMapped.style.display = 'inline-block';
  }

  // ── Cluster list UI ────────────────────────────────────────────────

  function renderClusterList() {
    if (!clusterResult) return;
    clusterListEl.innerHTML = '';
    highlightedClusterId = null;

    const sorted = clusterResult.clusters.slice().sort((a, b) => b.count - a.count);

    for (const cl of sorted) {
      const row = document.createElement('div');
      row.className = 'cluster-item';
      row.dataset.clusterId = cl.id;

      const fromSwatch = document.createElement('span');
      fromSwatch.className = 'cluster-swatch';
      fromSwatch.style.background = `rgb(${cl.r},${cl.g},${cl.b})`;

      const arrow = document.createElement('span');
      arrow.className = 'cluster-arrow';
      arrow.textContent = '\u2192';

      const toSwatch = document.createElement('span');
      toSwatch.className = 'bead-swatch';
      toSwatch.style.background = cl.mapped.hex;

      const tag = document.createElement('span');
      tag.className = 'bead-tag';
      tag.textContent = cl.mapped.tag;

      const px = document.createElement('span');
      px.className = 'cluster-px';
      px.textContent = cl.count + 'px';

      row.append(fromSwatch, arrow, toSwatch, tag, px);
      row.addEventListener('click', () => openPicker(cl.id));
      clusterListEl.appendChild(row);
    }
  }

  // ── Hover-to-highlight on bead output ──────────────────────────────

  function highlightCluster(clusterId) {
    if (clusterId === highlightedClusterId) return;
    highlightedClusterId = clusterId;

    clusterListEl.querySelectorAll('.cluster-item').forEach(el => {
      const isMatch = parseInt(el.dataset.clusterId) === clusterId;
      el.classList.toggle('highlight', isMatch);
      if (isMatch) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function clearHighlight() {
    highlightedClusterId = null;
    clusterListEl.querySelectorAll('.cluster-item.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
  }

  function getPixelFromEvent(e) {
    if (!clusterResult) return -1;
    const rect = mappedCanvas.getBoundingClientRect();
    const zoom = zoomState.mapped.zoom;
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);
    const { width, height } = clusterResult;
    if (x < 0 || x >= width || y < 0 || y >= height) return -1;
    return clusterResult.pixelCluster[y * width + x];
  }

  mappedCanvas.addEventListener('pointermove', (e) => {
    const ci = getPixelFromEvent(e);
    if (ci >= 0 && ci !== 0xFFFF) highlightCluster(ci);
    else clearHighlight();
  });

  mappedCanvas.addEventListener('pointerleave', clearHighlight);

  mappedCanvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const ci = getPixelFromEvent(e);
    if (ci >= 0 && ci !== 0xFFFF) highlightCluster(ci);
  });

  // ── Bead Picker ────────────────────────────────────────────────────

  function buildPickerGrid() {
    pickerGrid.innerHTML = '';
    const groups = Palette.getGroups();
    for (const [groupName, colors] of Object.entries(groups)) {
      const label = document.createElement('div');
      label.className = 'picker-group-label';
      label.textContent = groupName;
      label.style.width = '100%';
      pickerGrid.appendChild(label);

      for (const c of colors) {
        const cell = document.createElement('div');
        cell.className = 'picker-cell';
        cell.style.background = c.hex;
        cell.dataset.tag = c.tag;
        cell.title = c.tag;
        cell.addEventListener('click', () => selectBead(c));
        cell.addEventListener('mouseenter', () => {
          pickerTo.style.background = c.hex;
          pickerTag.textContent = c.tag;
        });
        pickerGrid.appendChild(cell);
      }
    }
  }
  buildPickerGrid();

  function openPicker(clusterId) {
    pickerClusterId = clusterId;
    const cl = clusterResult.clusters.find(c => c.id === clusterId);
    if (!cl) return;

    pickerFrom.style.background = `rgb(${cl.r},${cl.g},${cl.b})`;
    pickerTo.style.background = cl.mapped.hex;
    pickerTag.textContent = cl.mapped.tag;

    pickerGrid.querySelectorAll('.picker-cell').forEach(cell => {
      cell.classList.toggle('selected', cell.dataset.tag === cl.mapped.tag);
    });

    backdropEl = document.createElement('div');
    backdropEl.className = 'picker-backdrop';
    backdropEl.addEventListener('click', closePicker);
    document.body.appendChild(backdropEl);
    beadPicker.style.display = '';
  }

  function closePicker() {
    beadPicker.style.display = 'none';
    if (backdropEl) { backdropEl.remove(); backdropEl = null; }
    pickerClusterId = null;
  }

  function selectBead(bead) {
    if (pickerClusterId === null || !clusterResult) return;
    const cl = clusterResult.clusters.find(c => c.id === pickerClusterId);
    if (!cl) return;

    cl.mapped = bead;
    closePicker();
    renderMappedPreview();
    renderClusterList();
  }

  pickerClose.addEventListener('click', closePicker);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && beadPicker.style.display !== 'none') closePicker();
  });

  // ── Assembly Instructions ──────────────────────────────────────────

  generateInstrBtn.addEventListener('click', () => {
    if (!clusterResult) return;

    generateInstrBtn.disabled = true;
    generateInstrBtn.textContent = 'Generating...';

    setTimeout(() => {
      const instrCanvas = Instructions.generate(clusterResult);

      instructionCanvas.width = instrCanvas.width;
      instructionCanvas.height = instrCanvas.height;
      instructionCanvas.getContext('2d').drawImage(instrCanvas, 0, 0);

      instructionOutput.style.display = '';
      downloadInstructions.href = instructionCanvas.toDataURL('image/png');
      downloadInstructions.download = `bead-instructions-${clusterResult.width}x${clusterResult.height}.png`;
      downloadInstructions.style.display = 'inline-block';

      generateInstrBtn.disabled = false;
      generateInstrBtn.textContent = 'Generate Instructions';
    }, 0);
  });
})();
