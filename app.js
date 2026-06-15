// ---------- Theme Management Configuration Engine ----------
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☾' : '☀';
  themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  localStorage.setItem('fr-theme', theme);
  refreshChartTheme();
}

themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#3A86FF";
}

// ---------- Application State Memory Register ----------
let globalDataStore = [];
let knownIds = new Set();
let lineChartInstance, donutChartInstance, deviceBarChartInstance;
const counters = { 'total-tx': 0, 'fraud-tx': 0, 'fraud-rate': 0, 'total-volume': 0, 'mean-risk': 0 };

// ---------- Animated Numerical Interpolation Engine ----------
function tweenNumber(id, to, formatter) {
  const start = counters[id] || 0;
  const duration = 700;
  const startTime = performance.now();
  
  function step(timestamp) {
    const progress = Math.min(1, (timestamp - startTime) / duration);
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic Out Easing
    const currentValue = start + (to - start) * easedProgress;
    
    const targetElement = document.getElementById(id);
    if (targetElement) targetElement.textContent = formatter(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counters[id] = to;
    }
  }
  requestAnimationFrame(step);
}

// ---------- Gauge Metric Vector Controller ----------
function setGauge(percentage) {
  const clampedValue = Math.max(0, Math.min(100, percentage));
  const arcLength = 157;
  
  document.getElementById('gaugeArc').setAttribute('stroke-dashoffset', arcLength - (arcLength * clampedValue / 100));
  
  const rotationAngle = -90 + (clampedValue / 100) * 180;
  document.getElementById('gaugeNeedle').style.transform = `rotate(${rotationAngle}deg)`;
  
  const classificationLabel = clampedValue < 30 ? 'low exposure' : clampedValue < 60 ? 'moderate exposure' : clampedValue < 80 ? 'elevated risk' : 'critical risk';
  document.getElementById('risk-label').textContent = classificationLabel;
}

// ---------- ChartJS Chart Architecture Compilation ----------
function initCharts() {
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  lineChartInstance = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'is_anomaly = 1', data: [], borderColor: '#FF0055', backgroundColor: 'transparent', borderWidth: 1.6, tension: 0.1, pointRadius: 2, pointBackgroundColor: '#FF0055', spanGaps: true },
        { label: 'is_anomaly = 0', data: [], borderColor: '#00F5D4', backgroundColor: 'transparent', borderWidth: 1.6, tension: 0.1, pointRadius: 0, spanGaps: true },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', labels: { color: '#94A3B8', font: { size: 10 }, boxWidth: 10 } } },
      scales: {
        x: { grid: { color: 'rgba(28,37,65,0.2)' }, ticks: { display: false } },
        y: { min: 0, max: 10000, grid: { color: 'rgba(28,37,65,0.4)' }, ticks: { color: '#64748B', font: { size: 10 } } }
      }
    }
  });

  const ctxDonut = document.getElementById('donutChart').getContext('2d');
  donutChartInstance = new Chart(ctxDonut, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#3A86FF', '#FF0055', '#FFB703', '#00F5D4', '#8338EC', '#FF006E', '#04E762'], borderWidth: 0 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 10 }, boxWidth: 8 } } }
    }
  });

  const ctxBar = document.getElementById('deviceBarChart').getContext('2d');
  deviceBarChartInstance = new Chart(ctxBar, {
    type: 'bar',
    data: { labels: [], datasets: [{ data: [], backgroundColor: 'rgba(99,102,241,0.85)', hoverBackgroundColor: '#6366F1', borderWidth: 0, borderRadius: 4, barThickness: 18 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(28,37,65,0.2)' }, ticks: { color: '#64748B', font: { size: 10 } } },
        y: { grid: { color: 'rgba(28,37,65,0.4)' }, ticks: { color: '#64748B', font: { size: 10 } } }
      }
    }
  });
}

function refreshChartTheme() {
  if (!lineChartInstance) return;
  const textSoftColor = cssVar('--text-soft') || '#94A3B8';
  const textMuteColor = cssVar('--text-mute') || '#64748B';
  const borderSoftColor = cssVar('--border-soft') || 'rgba(28,37,65,0.3)';
  
  [lineChartInstance, deviceBarChartInstance].forEach(chart => {
    chart.options.scales.x.grid.color = borderSoftColor;
    chart.options.scales.y.grid.color = borderSoftColor;
    chart.options.scales.x.ticks.color = textMuteColor;
    chart.options.scales.y.ticks.color = textMuteColor;
  });
  
  lineChartInstance.options.plugins.legend.labels.color = textSoftColor;
  donutChartInstance.options.plugins.legend.labels.color = textSoftColor;
  
  lineChartInstance.update();
  donutChartInstance.update();
  deviceBarChartInstance.update();
}

// ---------- Real-Time Threat Notification Toast Stack Engine ----------
function pushAlert(transaction) {
  const alertStack = document.getElementById('alertStack');
  if (alertStack.children.length >= 4) {
    alertStack.removeChild(alertStack.firstChild);
  }
  
  const toastElement = document.createElement('div');
  toastElement.className = 'toast';
  toastElement.innerHTML = `
    <div style="font-size:18px; line-height:1;">⚠️</div>
    <div style="flex:1;">
      <div class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--bad);">Malicious transaction intercepted</div>
      <div class="text-[12px] mt-1" style="color: var(--text);">User <span class="mono font-bold">${transaction.user_id}</span> · <span class="mono">$${transaction.amount.toFixed(2)}</span></div>
      <div class="text-[10px] mt-0.5" style="color: var(--text-mute);">${transaction.location} · ${transaction.device_type || 'Unknown'} · risk ${(transaction.risk_score * 100).toFixed(0)}%</div>
    </div>
    <button class="btn-ghost" style="padding:2px 6px; font-size:10px;">✕</button>
  `;
  
  toastElement.querySelector('button').onclick = () => dismiss(toastElement);
  toastElement.onclick = (event) => {
    if (event.target.tagName !== 'BUTTON') {
      closeInspector();
      inspectTransaction(transaction.id);
    }
  };
  
  alertStack.appendChild(toastElement);
  setTimeout(() => dismiss(toastElement), 6000);
}

function dismiss(element) {
  element.classList.add('out');
  setTimeout(() => element.remove(), 300);
}

// ---------- Dynamic REST Synchronization Pipeline ----------
async function fetchData() {
  try {
    const response = await fetch('http://127.0.0.1:8000/transactions');
    const data = await response.json();

    if (knownIds.size > 0) {
      const freshAnomalies = data.filter(tx => !knownIds.has(tx.id) && (tx.is_anomaly === 1 || tx.is_anomaly === true));
      freshAnomalies.slice(0, 4).forEach(pushAlert);
    }
    knownIds = new Set(data.map(d => d.id));
    globalDataStore = data;

    const total = data.length;
    const fraud = data.filter(tx => tx.is_anomaly === 1 || tx.is_anomaly === true).length;
    const rate = total > 0 ? (fraud / total) * 100 : 0;
    const totalVolume = data.reduce((sum, tx) => sum + tx.amount, 0);
    const avgRisk = total > 0 ? (data.reduce((sum, tx) => sum + tx.risk_score, 0) / total) * 100 : 0;

    tweenNumber('total-tx', total, v => Math.round(v).toLocaleString());
    tweenNumber('fraud-tx', fraud, v => `${Math.round(v)} cases`);
    tweenNumber('fraud-rate', rate, v => `${v.toFixed(1)}%`);
    tweenNumber('total-volume', totalVolume, v => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    tweenNumber('mean-risk', avgRisk, v => `${v.toFixed(1)}%`);
    setGauge(avgRisk);

    // Chronological Multi-Series Mapping Tracker Update
    const timelineData = [...data].slice(0, 80).reverse();
    lineChartInstance.data.labels = timelineData.map((_, i) => i);
    lineChartInstance.data.datasets[0].data = timelineData.map(tx => (tx.is_anomaly === 1 || tx.is_anomaly === true) ? tx.amount : null);
    lineChartInstance.data.datasets[1].data = timelineData.map(tx => (tx.is_anomaly === 0 || tx.is_anomaly === false) ? tx.amount : null);
    lineChartInstance.update();

    // Category Safe Doughnut Population
    const merchantMap = {};
    data.forEach(tx => {
      const category = tx.merchant_category || 'General';
      merchantMap[category] = (merchantMap[category] || 0) + 1;
    });
    donutChartInstance.data.labels = Object.keys(merchantMap);
    donutChartInstance.data.datasets[0].data = Object.values(merchantMap);
    donutChartInstance.update();

    // Device Node Metric Bar Population
    const deviceMap = {};
    data.forEach(tx => {
      const device = tx.device_type || 'Unknown';
      deviceMap[device] = (deviceMap[device] || 0) + tx.amount;
    });
    deviceBarChartInstance.data.labels = Object.keys(deviceMap);
    deviceBarChartInstance.data.datasets[0].data = Object.values(deviceMap);
    deviceBarChartInstance.update();

    renderTable(data);
  } catch (error) {
    console.error('Data Sync Interruption:', error);
  }
}

// ---------- Document Sheet Dom Grid Renderer ----------
function renderTable(dataset) {
  const tbody = document.getElementById('transaction-rows');
  tbody.innerHTML = '';
  
  dataset.slice(0, 60).forEach((tx, i) => {
    const isMalicious = tx.is_anomaly === 1 || tx.is_anomaly === true;
    const verdictBadge = isMalicious
      ? `<span class="badge badge-bad">MALICIOUS</span>`
      : `<span class="badge badge-good">NOMINAL</span>`;
      
    const row = document.createElement('tr');
    row.className = 'row-enter cursor-pointer transition-colors';
    row.style.borderBottom = '1px solid var(--border-soft)';
    row.style.animationDelay = (i * 8) + 'ms';
    row.onclick = () => inspectTransaction(tx.id);
    
    row.innerHTML = `
      <td class="p-3.5 mono font-semibold" style="color: var(--text-mute);">#${tx.id}</td>
      <td class="p-3.5 font-semibold" style="color: var(--text);">${tx.user_id}</td>
      <td class="p-3.5 mono font-bold" style="color: var(--text);">$${tx.amount.toFixed(2)}</td>
      <td class="p-3.5">${tx.location}</td>
      <td class="p-3.5">${tx.merchant_category || 'General'}</td>
      <td class="p-3.5">${tx.device_type || 'Unknown'}</td>
      <td class="p-3.5">
        <div class="flex items-center gap-2">
          <div class="w-14 h-1.5 rounded-full overflow-hidden" style="background: var(--border);">
            <div style="width:${tx.risk_score * 100}%; height:100%; background:${isMalicious ? 'var(--bad)' : 'var(--warn)'};"></div>
          </div>
          <span class="text-[10px] mono" style="color: var(--text-mute);">${(tx.risk_score * 100).toFixed(0)}%</span>
        </div>
      </td>
      <td class="p-3.5 mono" style="color: var(--text-mute);">${isMalicious ? 1 : 0}</td>
      <td class="p-3.5">${verdictBadge}</td>
    `;
    tbody.appendChild(row);
  });
}

// ---------- Forensic Investigative Inspector Modal Overlay ----------
function inspectTransaction(id) {
  const transaction = globalDataStore.find(x => x.id === id);
  if (!transaction) return;
  const isMalicious = transaction.is_anomaly === 1 || transaction.is_anomaly === true;
  
  document.getElementById('modal-tx-hash').innerText = `SYSTEM_LOG_NODE: #TX-${transaction.id}`;
  document.getElementById('modal-user-id').innerText = transaction.user_id;
  document.getElementById('modal-amount').innerText = `$${transaction.amount.toFixed(2)}`;
  document.getElementById('modal-location').innerText = transaction.location;
  document.getElementById('modal-device').innerText = transaction.device_type || 'Unknown Node';
  document.getElementById('modal-category-lbl').innerText = `Category: ${transaction.merchant_category || 'General'}`;
  document.getElementById('modal-timestamp-lbl').innerText = `Logged: ${transaction.timestamp || '-'}`;
  
  const riskPercentage = (transaction.risk_score * 100).toFixed(0);
  document.getElementById('modal-risk-badge').innerText = `${riskPercentage}% RISK INDEX`;
  
  const bar = document.getElementById('modal-risk-bar');
  bar.style.width = `${riskPercentage}%`;
  bar.style.background = isMalicious ? 'var(--bad)' : 'var(--good)';
  bar.style.boxShadow = `0 0 12px ${isMalicious ? 'var(--bad)' : 'var(--good)'}`;
  
  const box = document.getElementById('modal-verdict-box');
  const badge = document.getElementById('modal-badge-verdict');
  
  if (isMalicious) {
    box.style.borderColor = 'color-mix(in oklab, var(--bad) 40%, transparent)';
    box.style.background  = 'color-mix(in oklab, var(--bad) 8%, transparent)';
    document.getElementById('modal-action-taken').innerText = 'GATEWAY INTRUSION DETECTED — ACCESS TOKEN REVOKED / ROUTE BLOCKED';
    document.getElementById('modal-action-taken').style.color = 'var(--bad)';
    badge.className = 'badge badge-bad'; 
    badge.innerText = 'REJECTED';
  } else {
    box.style.borderColor = 'color-mix(in oklab, var(--good) 40%, transparent)';
    box.style.background  = 'color-mix(in oklab, var(--good) 8%, transparent)';
    document.getElementById('modal-action-taken').innerText = 'TRANSACTION CLEARED — AGENT BASELINE VERIFICATION MATCH';
    document.getElementById('modal-action-taken').style.color = 'var(--good)';
    badge.className = 'badge badge-good'; 
    badge.innerText = 'APPROVED';
  }
  
  const modal = document.getElementById('inspectorModal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.children[0].classList.remove('scale-95'), 50);
}

function closeInspector() {
  const modal = document.getElementById('inspectorModal');
  if (!modal.classList.contains('hidden')) {
    modal.children[0].classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
  }
}

function filterTable() {
  const query = document.getElementById('search-user').value.trim();
  const statusFilter = document.getElementById('filter-status').value;
  let filteredData = globalDataStore;
  
  if (query !== '') {
    filteredData = filteredData.filter(tx => tx.user_id.toString().includes(query));
  }
  if (statusFilter !== 'ALL') {
    filteredData = filteredData.filter(tx => 
      statusFilter === 'MALICIOUS' 
        ? (tx.is_anomaly === 1 || tx.is_anomaly === true) 
        : (tx.is_anomaly === 0 || tx.is_anomaly === false)
    );
  }
  renderTable(filteredData);
}

// Window Escape Closer
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeInspector(); });

// Application Lifecyle Bootstrapper
window.onload = () => { 
  initCharts(); 
  applyTheme(localStorage.getItem('fr-theme') || 'dark');
  fetchData(); 
  setInterval(fetchData, 3000); // Polling sync heartbeat interval set to 3 seconds
};