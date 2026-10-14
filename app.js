// Global dataset loaded dynamically from data.json (single source of truth)
let DATA_CENTERS = [];

// Fetch dataset directly from external data.json
async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) {
      throw new Error('Failed to load data.json (HTTP ' + res.status + ')');
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      DATA_CENTERS = data;
    }
  } catch (err) {
    console.error('Error loading data.json:', err);
    if (window.location.protocol === 'file:') {
      alert('Note: Modern browsers block local file:// fetch requests. Please serve through a local web server (e.g. python3 -m http.server).');
    }
  }
  init();
}

let map = null;
let markersLayer = null;
let activeFilter = 'all';
let searchQuery = '';
let selectedDcId = null;

const STATUS_COLORS = {
  operational: '#10b981',
  construction: '#f59e0b',
  planned: '#3b82f6'
};

function init() {
  initMap();
  renderStats();
  renderMarkers();
  setupEventListeners();
}

function initMap() {
  try {
    map = L.map('map', {
      center: [39.8283, -98.5795],
      zoom: 4,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Esri World Dark Gray Canvas: No API key required
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxNativeZoom: 16,
      maxZoom: 19
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16,
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  } catch (err) {
    console.warn('Map tile service unavailable offline; please check your network connection.', err);
  }
}

function renderStats() {
  const total = DATA_CENTERS.length;
  let opMW = 0, conMW = 0, planMW = 0;
  let countOp = 0, countCon = 0, countPlan = 0;

  DATA_CENTERS.forEach(dc => {
    const mw = Number(dc.powerCapacityMW) || 0;
    if (dc.status === 'operational') {
      opMW += mw;
      countOp++;
    } else if (dc.status === 'construction') {
      conMW += mw;
      countCon++;
    } else if (dc.status === 'planned') {
      planMW += mw;
      countPlan++;
    }
  });

  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-op-mw').innerText = opMW.toLocaleString() + ' MW';
  document.getElementById('stat-con-mw').innerText = conMW.toLocaleString() + ' MW';
  document.getElementById('stat-plan-mw').innerText = planMW.toLocaleString() + ' MW';

  document.getElementById('count-all').innerText = total;
  document.getElementById('count-op').innerText = countOp;
  document.getElementById('count-con').innerText = countCon;
  document.getElementById('count-plan').innerText = countPlan;
}

function getFilteredData() {
  return DATA_CENTERS.filter(dc => {
    const matchesStatus = (activeFilter === 'all') || (dc.status === activeFilter);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      dc.name.toLowerCase().includes(q) ||
      dc.operator.toLowerCase().includes(q) ||
      dc.city.toLowerCase().includes(q) ||
      dc.state.toLowerCase().includes(q) ||
      (dc.notes && dc.notes.toLowerCase().includes(q))
    );
    return matchesStatus && matchesSearch;
  });
}

function renderMarkers() {
  if (!map || !markersLayer) return;
  markersLayer.clearLayers();

  const filtered = getFilteredData();

  filtered.forEach(dc => {
    const color = STATUS_COLORS[dc.status] || '#94a3b8';
    const mw = Number(dc.powerCapacityMW) || 50;
    const radius = Math.max(6, Math.min(18, Math.sqrt(mw) * 1.0));
    const isSelected = (selectedDcId === dc.id);

    const marker = L.circleMarker([dc.lat, dc.lng], {
      radius: isSelected ? radius + 4 : radius,
      fillColor: color,
      color: isSelected ? '#ffffff' : color,
      weight: isSelected ? 3 : 1.5,
      opacity: 0.9,
      fillOpacity: isSelected ? 0.95 : 0.65
    });

    marker.bindTooltip(`
      <div class="popup-box">
        <div class="popup-title">${dc.name}</div>
        <div class="popup-sub">${dc.operator} • ${dc.city}, ${dc.state}</div>
        <div><strong>${dc.powerCapacityMW} MW</strong> • <span style="text-transform: capitalize; color: ${color}">${dc.status}</span></div>
      </div>
    `, { direction: 'top', offset: [0, -5] });

    marker.on('click', () => {
      openMetadataDrawer(dc);
    });

    markersLayer.addLayer(marker);
  });
}

function openMetadataDrawer(dc) {
  selectedDcId = dc.id;
  renderMarkers();

  const drawer = document.getElementById('details-drawer');
  drawer.classList.remove('closed');

  document.getElementById('drawer-title').innerText = dc.name;
  document.getElementById('drawer-operator').innerText = `${dc.operator} • ${dc.developer || 'Developer'}`;
  
  const badge = document.getElementById('drawer-badge');
  badge.className = `status-badge badge-${dc.status}`;
  badge.innerText = dc.status === 'construction' ? 'In Construction' : dc.status;

  document.getElementById('drawer-capacity').innerText = dc.powerCapacityMW ? `${dc.powerCapacityMW} MW` : 'N/A';
  document.getElementById('drawer-sqft').innerText = dc.sqft ? `${Number(dc.sqft).toLocaleString()} sq ft` : 'N/A';
  document.getElementById('drawer-announced').innerText = dc.announcedYear || '—';
  document.getElementById('drawer-completion').innerText = dc.completionYear || '—';

  document.getElementById('drawer-location').innerText = `${dc.city}, ${dc.state}, ${dc.country}`;
  document.getElementById('drawer-coords').innerText = `${dc.lat.toFixed(4)}, ${dc.lng.toFixed(4)}`;
  document.getElementById('drawer-developer').innerText = dc.developer || dc.operator;
  document.getElementById('drawer-cooling').innerText = dc.cooling || 'Standard Mechanical Chillers';
  document.getElementById('drawer-notes').innerText = dc.notes || 'No extra notes provided.';

  const link = document.getElementById('drawer-source-link');
  if (dc.sourceUrl) {
    link.href = dc.sourceUrl;
    link.style.display = 'block';
  } else {
    link.style.display = 'none';
  }

  if (map) {
    map.flyTo([dc.lat, dc.lng], Math.max(map.getZoom(), 8), { duration: 0.8 });
  }
}

function closeMetadataDrawer() {
  selectedDcId = null;
  document.getElementById('details-drawer').classList.add('closed');
  renderMarkers();
}

function setupEventListeners() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-status');
      renderMarkers();
    });
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderMarkers();
  });

  document.getElementById('drawer-close-btn').addEventListener('click', closeMetadataDrawer);



  const exportModal = document.getElementById('export-modal');
  const showExport = () => {
    document.getElementById('json-code-output').innerText = JSON.stringify(DATA_CENTERS, null, 2);
    exportModal.classList.add('open');
  };

  document.getElementById('btn-export-json').addEventListener('click', showExport);
  document.getElementById('export-close-btn').addEventListener('click', () => exportModal.classList.remove('open'));

  document.getElementById('btn-copy-json').addEventListener('click', () => {
    const text = JSON.stringify(DATA_CENTERS, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert('Dataset JSON copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy automatically; please copy from the box.');
    });
  });

  document.getElementById('btn-download-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(DATA_CENTERS, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

window.addEventListener('DOMContentLoaded', loadData);
