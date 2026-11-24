/* ============================================
   SehatSetu — Main Application Logic
   ============================================ */

// ============================================
// DATA: Simulated hospital & healthcare data
// ============================================
const HOSPITALS = [
    { id: 1, name: "District Hospital Lucknow", type: "district", lat: 26.8467, lng: 80.9462, load: 82, queue: 45, waitTime: 42, doctors: 28, beds: 200, bedsOccupied: 164, medicines: 94, status: "busy" },
    { id: 2, name: "CHC Mohanlalganj", type: "chc", lat: 26.7490, lng: 80.9080, load: 55, queue: 12, waitTime: 15, doctors: 8, beds: 50, bedsOccupied: 28, medicines: 88, status: "normal" },
    { id: 3, name: "PHC Kakori", type: "phc", lat: 26.8700, lng: 80.7900, load: 35, queue: 5, waitTime: 8, doctors: 3, beds: 15, bedsOccupied: 5, medicines: 76, status: "normal" },
    { id: 4, name: "CHC Malihabad", type: "chc", lat: 26.9200, lng: 80.7200, load: 72, queue: 22, waitTime: 28, doctors: 6, beds: 40, bedsOccupied: 29, medicines: 82, status: "busy" },
    { id: 5, name: "PHC Itaunja", type: "phc", lat: 27.0100, lng: 80.8900, load: 25, queue: 3, waitTime: 5, doctors: 2, beds: 10, bedsOccupied: 2, medicines: 91, status: "normal" },
    { id: 6, name: "District Hospital Barabanki", type: "district", lat: 26.9320, lng: 81.1740, load: 91, queue: 68, waitTime: 55, doctors: 22, beds: 180, bedsOccupied: 164, medicines: 72, status: "critical" },
    { id: 7, name: "CHC Haidergarh", type: "chc", lat: 26.6700, lng: 81.3200, load: 48, queue: 10, waitTime: 12, doctors: 5, beds: 30, bedsOccupied: 14, medicines: 95, status: "normal" },
    { id: 8, name: "PHC Dewa", type: "phc", lat: 26.8300, lng: 81.0300, load: 42, queue: 7, waitTime: 10, doctors: 2, beds: 12, bedsOccupied: 5, medicines: 68, status: "normal" },
    { id: 9, name: "CHC Bakshi Ka Talab", type: "chc", lat: 26.9100, lng: 80.9900, load: 88, queue: 35, waitTime: 38, doctors: 7, beds: 45, bedsOccupied: 40, medicines: 55, status: "critical" },
    { id: 10, name: "PHC Chinhat", type: "phc", lat: 26.8800, lng: 81.0500, load: 60, queue: 14, waitTime: 18, doctors: 3, beds: 15, bedsOccupied: 9, medicines: 83, status: "busy" },
    { id: 11, name: "District Hospital Sitapur", type: "district", lat: 27.5700, lng: 80.6800, load: 78, queue: 52, waitTime: 48, doctors: 20, beds: 160, bedsOccupied: 125, medicines: 80, status: "busy" },
    { id: 12, name: "CHC Biswan", type: "chc", lat: 27.4900, lng: 80.9800, load: 38, queue: 8, waitTime: 10, doctors: 4, beds: 25, bedsOccupied: 10, medicines: 92, status: "normal" },
    { id: 13, name: "PHC Sidhauli", type: "phc", lat: 27.2800, lng: 80.8300, load: 30, queue: 4, waitTime: 6, doctors: 2, beds: 10, bedsOccupied: 3, medicines: 87, status: "normal" },
    { id: 14, name: "CHC Hardoi City", type: "chc", lat: 27.3950, lng: 80.1310, load: 65, queue: 18, waitTime: 22, doctors: 6, beds: 35, bedsOccupied: 23, medicines: 78, status: "busy" },
    { id: 15, name: "PHC Sandila", type: "phc", lat: 27.0700, lng: 80.5200, load: 20, queue: 2, waitTime: 3, doctors: 2, beds: 10, bedsOccupied: 2, medicines: 96, status: "normal" },
];

const AMBULANCES = [
    { id: "AMB-01", lat: 26.86, lng: 80.92, destination: "District Hospital Lucknow", eta: "8 min" },
    { id: "AMB-02", lat: 26.78, lng: 80.95, destination: "CHC Mohanlalganj", eta: "12 min" },
    { id: "AMB-03", lat: 27.01, lng: 80.85, destination: "PHC Itaunja", eta: "5 min" },
    { id: "AMB-04", lat: 26.95, lng: 81.15, destination: "District Hospital Barabanki", eta: "15 min" },
];

const MEDICINES_STOCKOUT = [
    { medicine: "Paracetamol 500mg", hospital: "CHC Bakshi Ka Talab", currentStock: 120, daysLeft: 3, predictedNeed: 450, status: "critical" },
    { medicine: "Insulin Glargine", hospital: "District Hospital Barabanki", currentStock: 45, daysLeft: 5, predictedNeed: 180, status: "critical" },
    { medicine: "Amoxicillin 250mg", hospital: "PHC Dewa", currentStock: 200, daysLeft: 7, predictedNeed: 320, status: "warning" },
    { medicine: "ORS Sachets", hospital: "PHC Kakori", currentStock: 350, daysLeft: 8, predictedNeed: 500, status: "warning" },
    { medicine: "Metformin 500mg", hospital: "CHC Malihabad", currentStock: 180, daysLeft: 10, predictedNeed: 280, status: "normal" },
    { medicine: "Ciprofloxacin 500mg", hospital: "District Hospital Lucknow", currentStock: 90, daysLeft: 4, predictedNeed: 350, status: "critical" },
    { medicine: "Azithromycin 500mg", hospital: "CHC Haidergarh", currentStock: 250, daysLeft: 12, predictedNeed: 200, status: "normal" },
    { medicine: "Iron Folic Acid", hospital: "PHC Chinhat", currentStock: 60, daysLeft: 6, predictedNeed: 150, status: "warning" },
];

const ALERTS_DATA = [
    { type: "critical", icon: "fas fa-exclamation-circle", title: "Critical Stockout Alert: Ciprofloxacin", desc: "District Hospital Lucknow will run out of Ciprofloxacin 500mg in 4 days. Nearest surplus: CHC Haidergarh (stock: 250).", time: "2 minutes ago", unread: true },
    { type: "critical", icon: "fas fa-hospital", title: "Capacity Overflow: District Hospital Barabanki", desc: "Current load at 91%. Queue backed up to 68 patients. 15 patients re-routed to CHC Haidergarh.", time: "15 minutes ago", unread: true },
    { type: "warning", icon: "fas fa-cloud-rain", title: "Weather Alert: Heavy Rain Expected", desc: "IMD predicts heavy rainfall in Sitapur district for next 3 days. Historical data suggests 25% patient surge for respiratory illness.", time: "1 hour ago", unread: true },
    { type: "info", icon: "fas fa-route", title: "Patient Rerouting Success", desc: "328 patients successfully rerouted today, reducing average wait time by 42 minutes across the district network.", time: "2 hours ago", unread: false },
    { type: "warning", icon: "fas fa-smog", title: "AQI Spike Alert: Lucknow Urban", desc: "AQI reached 285 (Very Poor). Predictive model estimates 18% increase in respiratory OPD visits over next 48 hours.", time: "3 hours ago", unread: true },
    { type: "success", icon: "fas fa-truck", title: "Medicine Transfer Completed", desc: "500 units of Paracetamol successfully transferred from CHC Biswan to CHC Bakshi Ka Talab.", time: "4 hours ago", unread: false },
    { type: "info", icon: "fas fa-phone", title: "IVR System Update", desc: "Bhashini voice module updated with Bhojpuri dialect support. 342 IVR calls processed today with 89% resolution rate.", time: "5 hours ago", unread: false },
    { type: "warning", icon: "fas fa-virus", title: "Dengue Cluster Detected", desc: "Spatio-temporal model detected emerging dengue cluster in Mohanlalganj area. Pre-emptive ORS & IV fluid allocation recommended.", time: "6 hours ago", unread: true },
];

const PREDICTIONS_DATA = [
    { type: "danger", icon: "fas fa-chart-line", title: "Patient Surge: Barabanki", desc: "30% increase in OPD expected in 3 days due to seasonal flu + AQI.", color: "#f5576c" },
    { type: "warning", icon: "fas fa-pills", title: "Stockout Risk: 3 Facilities", desc: "Paracetamol & Ciprofloxacin running low across 3 PHCs by next week.", color: "#f7b731" },
    { type: "info", icon: "fas fa-cloud-sun-rain", title: "Weather Impact: Sitapur", desc: "Heavy rains may increase waterborne disease visits by 25%.", color: "#4facfe" },
    { type: "warning", icon: "fas fa-smog", title: "AQI Surge Impact", desc: "Respiratory visits to increase 18% in Lucknow urban in 48hrs.", color: "#f7b731" },
];

// ============================================
// APP STATE
// ============================================
let currentPage = 'dashboard';
let map = null;
let mapMarkers = [];
let routeLines = [];
let ambulanceMarkers = [];
let chartsInitialized = false;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        initApp();
    }, 2200);
});

function initApp() {
    setupNavigation();
    setupSidebar();
    setupThemeToggle();
    renderDashboard();
    renderHospitals();
    renderAlerts();
    setupRouting();
    setupIVR();
    setupWhatsApp();
    startRealTimeUpdates();
    initCharts();
}

// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
    document.querySelectorAll('.menu-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.menu-item[data-page="${page}"]`)?.classList.add('active');

    // Show page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) {
        pageEl.classList.add('active');
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');

    // Initialize map if switching to map page
    if (page === 'map' && !map) {
        setTimeout(initMap, 100);
    }

    // Initialize page-specific charts
    if (page === 'predictions') setTimeout(initPredictionCharts, 100);
    if (page === 'supply') setTimeout(initSupplyCharts, 100);
    if (page === 'analytics') setTimeout(initAnalyticsCharts, 100);

    currentPage = page;
}

// ============================================
// SIDEBAR
// ============================================
function setupSidebar() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
    });
}

// ============================================
// THEME
// ============================================
function setupThemeToggle() {
    document.getElementById('themeToggle').addEventListener('click', () => {
        const icon = document.querySelector('#themeToggle i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
        showToast('info', 'Theme preference saved');
    });

    document.getElementById('darkModeToggle')?.addEventListener('change', (e) => {
        showToast('info', 'Theme updated');
    });
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
    renderQueueTable();
    renderPredictionsList();
}

function renderQueueTable() {
    const tbody = document.getElementById('queueTableBody');
    const topHospitals = HOSPITALS.slice(0, 8).sort((a, b) => b.load - a.load);

    tbody.innerHTML = topHospitals.map(h => `
        <tr>
            <td><strong>${h.name}</strong></td>
            <td><span style="text-transform:uppercase;font-size:0.7rem;color:var(--text-muted);">${h.type}</span></td>
            <td>${h.queue} patients</td>
            <td>${h.waitTime} min</td>
            <td><span class="status-pill ${h.status}">${h.status}</span></td>
            <td><button class="btn-action" onclick="handleRouteAction('${h.name}')">Route</button></td>
        </tr>
    `).join('');
}

function renderPredictionsList() {
    const container = document.getElementById('predictionsList');
    container.innerHTML = PREDICTIONS_DATA.map(p => `
        <div class="prediction-item ${p.type}">
            <div class="prediction-icon" style="background:${p.color}22;color:${p.color};">
                <i class="${p.icon}"></i>
            </div>
            <div class="prediction-text">
                <strong>${p.title}</strong>
                <small>${p.desc}</small>
            </div>
        </div>
    `).join('');
}

function handleRouteAction(hospitalName) {
    navigateTo('routing');
    showToast('info', `Routing to ${hospitalName}`);
}

// ============================================
// CHARTS
// ============================================
function initCharts() {
    // Patient Flow Chart
    const pfCtx = document.getElementById('patientFlowChart')?.getContext('2d');
    if (pfCtx) {
        new Chart(pfCtx, {
            type: 'line',
            data: {
                labels: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
                datasets: [{
                    label: 'Patients In',
                    data: [12, 8, 5, 15, 85, 142, 165, 138, 120, 95, 55, 28],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#667eea'
                }, {
                    label: 'Patients Treated',
                    data: [10, 7, 4, 12, 70, 125, 150, 130, 115, 90, 50, 25],
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67,233,123,0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#43e97b'
                }, {
                    label: 'Rerouted',
                    data: [1, 0, 0, 2, 15, 25, 32, 22, 18, 12, 5, 2],
                    borderColor: '#f7b731',
                    backgroundColor: 'rgba(247,183,49,0.08)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#f7b731'
                }]
            },
            options: chartOptions()
        });
    }

    // Load Distribution Chart
    const ldCtx = document.getElementById('loadDistChart')?.getContext('2d');
    if (ldCtx) {
        new Chart(ldCtx, {
            type: 'doughnut',
            data: {
                labels: ['Normal (<60%)', 'Busy (60-85%)', 'Critical (>85%)'],
                datasets: [{
                    data: [8, 5, 2],
                    backgroundColor: ['#43e97b', '#f7b731', '#f5576c'],
                    borderColor: 'rgba(0,0,0,0.3)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 }, padding: 15 }
                    }
                },
                cutout: '65%'
            }
        });
    }

    chartsInitialized = true;
}

function chartOptions(customOptions = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
            legend: {
                labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 }, usePointStyle: true, padding: 15 }
            },
            tooltip: {
                backgroundColor: 'rgba(15,12,41,0.9)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                titleColor: '#fff',
                bodyColor: 'rgba(255,255,255,0.8)',
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
            }
        },
        ...customOptions
    };
}

function initPredictionCharts() {
    // Surge Forecast
    const sfCtx = document.getElementById('surgeForecastChart')?.getContext('2d');
    if (sfCtx && !sfCtx.chart) {
        const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
        sfCtx.chart = new Chart(sfCtx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Predicted Patients',
                    data: [1850, 1920, 2200, 2450, 2380, 2100, 1950],
                    borderColor: '#f5576c',
                    backgroundColor: 'rgba(245,87,108,0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }, {
                    label: 'Normal Baseline',
                    data: [1800, 1800, 1800, 1800, 1800, 1800, 1800],
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderDash: [5, 5],
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }, {
                    label: 'Capacity Limit',
                    data: [2500, 2500, 2500, 2500, 2500, 2500, 2500],
                    borderColor: 'rgba(245,87,108,0.4)',
                    borderDash: [10, 5],
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: chartOptions()
        });
    }

    // Weather Impact
    const wiCtx = document.getElementById('weatherImpactChart')?.getContext('2d');
    if (wiCtx && !wiCtx.chart) {
        wiCtx.chart = new Chart(wiCtx, {
            type: 'bar',
            data: {
                labels: ['Respiratory', 'Waterborne', 'Dengue', 'General', 'Cardiac'],
                datasets: [{
                    label: 'Expected Impact %',
                    data: [25, 18, 35, 8, 5],
                    backgroundColor: ['rgba(79,172,254,0.6)', 'rgba(67,233,123,0.6)', 'rgba(245,87,108,0.6)', 'rgba(247,183,49,0.6)', 'rgba(118,75,162,0.6)'],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: chartOptions()
        });
    }

    // Correlations
    renderCorrelations();
}

function renderCorrelations() {
    const grid = document.getElementById('correlationsGrid');
    if (!grid) return;

    const correlations = [
        { title: "AQI → Respiratory OPD", score: "0.87", scoreColor: "#f5576c", border: "#f5576c", desc: "High AQI (>200) correlates with 25% spike in respiratory visits within 48 hours." },
        { title: "Rainfall → Dengue Cluster", score: "0.82", scoreColor: "#f7b731", border: "#f7b731", desc: "3+ days of rain followed by high humidity triggers dengue outbreak in 7-10 days." },
        { title: "Temperature → Dehydration", score: "0.79", scoreColor: "#4facfe", border: "#4facfe", desc: "Temperatures above 42°C increase dehydration-related admissions by 30%." },
        { title: "Festival Season → Trauma", score: "0.74", scoreColor: "#43e97b", border: "#43e97b", desc: "Diwali/Holi period shows 40% increase in burn/injury cases." },
        { title: "Crop Season → Pesticide Exposure", score: "0.71", scoreColor: "#764ba2", border: "#764ba2", desc: "Kharif sowing season correlates with pesticide poisoning cases in rural PHCs." },
        { title: "School Reopening → Flu Spread", score: "0.68", scoreColor: "#667eea", border: "#667eea", desc: "School sessions increase pediatric flu visits by 22% within 2 weeks of reopening." },
    ];

    grid.innerHTML = correlations.map(c => `
        <div class="correlation-card" style="border-left-color:${c.border};">
            <div class="correlation-header">
                <span class="correlation-title">${c.title}</span>
                <span class="correlation-score" style="background:${c.scoreColor}22;color:${c.scoreColor};">r=${c.score}</span>
            </div>
            <p class="correlation-desc">${c.desc}</p>
        </div>
    `).join('');
}

function initSupplyCharts() {
    renderStockoutTable();
    renderTransfers();

    const shCtx = document.getElementById('stockHealthChart')?.getContext('2d');
    if (shCtx && !shCtx.chart) {
        shCtx.chart = new Chart(shCtx, {
            type: 'doughnut',
            data: {
                labels: ['Adequate (>14d)', 'Low (7-14d)', 'Critical (<7d)'],
                datasets: [{
                    data: [65, 22, 13],
                    backgroundColor: ['#43e97b', '#f7b731', '#f5576c'],
                    borderColor: 'rgba(0,0,0,0.3)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 }, padding: 15 }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

function renderStockoutTable() {
    const tbody = document.getElementById('stockoutTableBody');
    if (!tbody) return;

    tbody.innerHTML = MEDICINES_STOCKOUT.map(m => `
        <tr>
            <td><strong>${m.medicine}</strong></td>
            <td>${m.hospital}</td>
            <td>${m.currentStock}</td>
            <td><strong style="color:${m.status === 'critical' ? 'var(--danger)' : m.status === 'warning' ? 'var(--warning)' : 'var(--success)'};">${m.daysLeft} days</strong></td>
            <td>${m.predictedNeed}</td>
            <td><span class="status-pill ${m.status}">${m.status}</span></td>
            <td><button class="btn-action" onclick="initiateTransfer('${m.medicine}', '${m.hospital}')">Transfer</button></td>
        </tr>
    `).join('');
}

function renderTransfers() {
    const list = document.getElementById('transfersList');
    if (!list) return;

    const transfers = [
        { from: "CHC Biswan", fromType: "CHC", to: "CHC Bakshi Ka Talab", toType: "CHC", medicine: "Paracetamol 500mg × 500", status: "in-transit", eta: "2 hours" },
        { from: "District Hospital Lucknow", fromType: "DH", to: "PHC Dewa", toType: "PHC", medicine: "Amoxicillin 250mg × 300", status: "pending", eta: "Tomorrow" },
        { from: "CHC Haidergarh", fromType: "CHC", to: "District Hospital Barabanki", toType: "DH", medicine: "Ciprofloxacin 500mg × 200", status: "in-transit", eta: "4 hours" },
        { from: "PHC Sandila", fromType: "PHC", to: "PHC Chinhat", toType: "PHC", medicine: "Iron Folic Acid × 100", status: "delivered", eta: "Completed" },
    ];

    list.innerHTML = transfers.map(t => `
        <div class="transfer-item">
            <div class="transfer-route">
                <div class="transfer-point">
                    <span class="facility-name">${t.from}</span>
                    <span class="facility-type">${t.fromType}</span>
                </div>
                <div class="transfer-arrow">
                    <i class="fas fa-arrow-right"></i>
                    <small>${t.eta}</small>
                </div>
                <div class="transfer-point">
                    <span class="facility-name">${t.to}</span>
                    <span class="facility-type">${t.toType}</span>
                </div>
            </div>
            <div class="transfer-info">
                <span class="transfer-medicine">${t.medicine}</span>
                <span class="transfer-status ${t.status}">${t.status.replace('-', ' ')}</span>
            </div>
        </div>
    `).join('');
}

function initiateTransfer(medicine, hospital) {
    showToast('success', `Transfer initiated for ${medicine} to ${hospital}`);
}

function initAnalyticsCharts() {
    const impCtx = document.getElementById('impactChart')?.getContext('2d');
    if (impCtx && !impCtx.chart) {
        impCtx.chart = new Chart(impCtx, {
            type: 'bar',
            data: {
                labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                datasets: [{
                    label: 'Patients Rerouted',
                    data: [120, 180, 250, 310, 380, 420],
                    backgroundColor: 'rgba(102,126,234,0.6)',
                    borderRadius: 6,
                    borderSkipped: false
                }, {
                    label: 'Wait Time Saved (hrs)',
                    data: [45, 72, 110, 145, 170, 195],
                    backgroundColor: 'rgba(67,233,123,0.6)',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: chartOptions()
        });
    }

    const effCtx = document.getElementById('efficiencyChart')?.getContext('2d');
    if (effCtx && !effCtx.chart) {
        effCtx.chart = new Chart(effCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                datasets: [{
                    label: 'System Accuracy %',
                    data: [72, 78, 82, 85, 88, 90, 92, 94],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }, {
                    label: 'Patient Satisfaction %',
                    data: [65, 70, 75, 78, 82, 85, 87, 89],
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67,233,123,0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }]
            },
            options: chartOptions()
        });
    }
}

// ============================================
// LIVE MAP
// ============================================
function initMap() {
    if (map) return;

    map = L.map('liveMap', {
        zoomControl: true,
        attributionControl: false
    }).setView([26.88, 80.95], 10);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    // Add hospitals
    addHospitalMarkers();

    // Add ambulances
    addAmbulanceMarkers();

    // Add sample routes
    addRouteLines();

    // Setup layer toggles
    setupMapLayers();

    // Start ambulance animation
    animateAmbulances();

    // Fix map rendering
    setTimeout(() => map.invalidateSize(), 200);
}

function createHospitalIcon(status) {
    const colors = { normal: '#43e97b', busy: '#f7b731', critical: '#f5576c' };
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="hospital-marker ${status}"><i class="fas fa-hospital"></i></div>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42]
    });
}

function createAmbulanceIcon() {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="ambulance-marker"><i class="fas fa-ambulance"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}

function addHospitalMarkers() {
    HOSPITALS.forEach(h => {
        const marker = L.marker([h.lat, h.lng], { icon: createHospitalIcon(h.status) })
            .addTo(map);

        marker.on('click', () => showHospitalInfo(h));

        marker.bindPopup(`
            <div style="min-width:200px;">
                <h4 style="margin-bottom:6px;">${h.name}</h4>
                <div style="display:flex;gap:12px;margin-bottom:8px;">
                    <span style="font-size:0.75rem;"><i class="fas fa-users"></i> Queue: ${h.queue}</span>
                    <span style="font-size:0.75rem;"><i class="fas fa-clock"></i> Wait: ${h.waitTime}min</span>
                </div>
                <div style="height:4px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${h.load}%;background:${h.status === 'critical' ? '#f5576c' : h.status === 'busy' ? '#f7b731' : '#43e97b'};border-radius:4px;"></div>
                </div>
                <span style="font-size:0.65rem;color:rgba(255,255,255,0.5);">Load: ${h.load}%</span>
            </div>
        `);

        mapMarkers.push(marker);
    });
}

function addAmbulanceMarkers() {
    AMBULANCES.forEach(a => {
        const marker = L.marker([a.lat, a.lng], { icon: createAmbulanceIcon() })
            .addTo(map);

        marker.bindPopup(`
            <div>
                <h4 style="margin-bottom:4px;">${a.id}</h4>
                <p style="font-size:0.8rem;">Heading to: ${a.destination}</p>
                <p style="font-size:0.8rem;color:#4facfe;">ETA: ${a.eta}</p>
            </div>
        `);

        ambulanceMarkers.push({ marker, data: a });
    });
}

function addRouteLines() {
    // Sample routes showing patient rerouting
    const routes = [
        { from: [26.85, 80.90], to: [26.7490, 80.9080], color: '#667eea' },
        { from: [26.90, 81.10], to: [26.6700, 81.3200], color: '#764ba2' },
        { from: [27.00, 80.80], to: [27.0100, 80.8900], color: '#4facfe' },
    ];

    routes.forEach(r => {
        const line = L.polyline([r.from, r.to], {
            color: r.color,
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 8'
        }).addTo(map);
        routeLines.push(line);
    });
}

function animateAmbulances() {
    setInterval(() => {
        ambulanceMarkers.forEach(am => {
            const lat = am.data.lat + (Math.random() - 0.5) * 0.005;
            const lng = am.data.lng + (Math.random() - 0.5) * 0.005;
            am.marker.setLatLng([lat, lng]);
            am.data.lat = lat;
            am.data.lng = lng;
        });
    }, 2000);
}

function showHospitalInfo(h) {
    const panel = document.getElementById('mapInfoPanel');
    const content = document.getElementById('mapInfoContent');

    const loadColor = h.status === 'critical' ? '#f5576c' : h.status === 'busy' ? '#f7b731' : '#43e97b';

    content.innerHTML = `
        <h3 style="margin-bottom:0.75rem;">${h.name}</h3>
        <span class="status-pill ${h.status}" style="margin-bottom:1rem;display:inline-block;">${h.status}</span>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin:1rem 0;">
            <div style="text-align:center;padding:0.5rem;background:rgba(255,255,255,0.05);border-radius:8px;">
                <span style="font-size:1.2rem;font-weight:700;display:block;">${h.queue}</span>
                <small style="color:var(--text-muted);font-size:0.65rem;">IN QUEUE</small>
            </div>
            <div style="text-align:center;padding:0.5rem;background:rgba(255,255,255,0.05);border-radius:8px;">
                <span style="font-size:1.2rem;font-weight:700;display:block;">${h.waitTime}m</span>
                <small style="color:var(--text-muted);font-size:0.65rem;">WAIT TIME</small>
            </div>
            <div style="text-align:center;padding:0.5rem;background:rgba(255,255,255,0.05);border-radius:8px;">
                <span style="font-size:1.2rem;font-weight:700;display:block;">${h.doctors}</span>
                <small style="color:var(--text-muted);font-size:0.65rem;">DOCTORS</small>
            </div>
            <div style="text-align:center;padding:0.5rem;background:rgba(255,255,255,0.05);border-radius:8px;">
                <span style="font-size:1.2rem;font-weight:700;display:block;">${h.bedsOccupied}/${h.beds}</span>
                <small style="color:var(--text-muted);font-size:0.65rem;">BEDS</small>
            </div>
        </div>

        <div style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.3rem;">
                <span>Capacity Load</span>
                <span style="color:${loadColor}">${h.load}%</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;">
                <div style="height:100%;width:${h.load}%;background:${loadColor};border-radius:6px;transition:width 1s ease;"></div>
            </div>
        </div>

        <div style="margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.3rem;">
                <span>Medicine Stock</span>
                <span>${h.medicines}%</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;">
                <div style="height:100%;width:${h.medicines}%;background:${h.medicines > 80 ? '#43e97b' : h.medicines > 60 ? '#f7b731' : '#f5576c'};border-radius:6px;"></div>
            </div>
        </div>

        <button class="btn-primary btn-full" onclick="navigateTo('routing'); showToast('info', 'Route patients to ${h.name}')">
            <i class="fas fa-route"></i> Route Patients Here
        </button>
    `;

    panel.classList.add('visible');
}

function setupMapLayers() {
    document.getElementById('closeMapPanel')?.addEventListener('click', () => {
        document.getElementById('mapInfoPanel').classList.remove('visible');
    });
}

// ============================================
// HOSPITALS PAGE
// ============================================
function renderHospitals(filter = 'all', status = 'all', search = '') {
    const grid = document.getElementById('hospitalGrid');
    if (!grid) return;

    let filtered = HOSPITALS;
    if (filter !== 'all') filtered = filtered.filter(h => h.type === filter);
    if (status !== 'all') filtered = filtered.filter(h => h.status === status);
    if (search) filtered = filtered.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

    grid.innerHTML = filtered.map(h => {
        const loadColor = h.status === 'critical' ? '#f5576c' : h.status === 'busy' ? '#f7b731' : '#43e97b';
        return `
        <div class="glass-card hospital-card" onclick="navigateTo('map')">
            <div class="hospital-card-header">
                <div>
                    <div class="hospital-name">${h.name}</div>
                    <div class="hospital-type">${h.type === 'district' ? 'District Hospital' : h.type.toUpperCase()}</div>
                </div>
                <span class="status-pill ${h.status}">${h.status}</span>
            </div>
            <div class="hospital-stats">
                <div class="hospital-stat">
                    <span class="hospital-stat-value">${h.queue}</span>
                    <span class="hospital-stat-label">Queue</span>
                </div>
                <div class="hospital-stat">
                    <span class="hospital-stat-value">${h.waitTime}m</span>
                    <span class="hospital-stat-label">Wait</span>
                </div>
                <div class="hospital-stat">
                    <span class="hospital-stat-value">${h.doctors}</span>
                    <span class="hospital-stat-label">Doctors</span>
                </div>
            </div>
            <div class="hospital-load-bar">
                <div class="hospital-load-fill" style="width:${h.load}%;background:${loadColor};"></div>
            </div>
        </div>
    `;
    }).join('');

    // Setup filters
    document.getElementById('hospitalSearch')?.addEventListener('input', (e) => {
        renderHospitals(
            document.getElementById('hospitalTypeFilter').value,
            document.getElementById('hospitalStatusFilter').value,
            e.target.value
        );
    });

    document.getElementById('hospitalTypeFilter')?.addEventListener('change', (e) => {
        renderHospitals(
            e.target.value,
            document.getElementById('hospitalStatusFilter').value,
            document.getElementById('hospitalSearch').value
        );
    });

    document.getElementById('hospitalStatusFilter')?.addEventListener('change', (e) => {
        renderHospitals(
            document.getElementById('hospitalTypeFilter').value,
            e.target.value,
            document.getElementById('hospitalSearch').value
        );
    });
}

// ============================================
// PATIENT ROUTING
// ============================================
function setupRouting() {
    // Urgency buttons
    document.querySelectorAll('.urgency-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Find Route button
    document.getElementById('findRouteBtn')?.addEventListener('click', () => {
        const resultsContainer = document.getElementById('routingResults');
        const condition = document.getElementById('conditionType')?.value || 'general';
        const urgency = document.querySelector('.urgency-btn.active')?.dataset.level || 'low';

        // Sort hospitals by load (ascending) and filter available ones
        const sorted = [...HOSPITALS].sort((a, b) => a.load - b.load);
        const topResults = sorted.slice(0, 4);

        resultsContainer.innerHTML = `
            <h3><i class="fas fa-route"></i> Recommended Routes</h3>
            <div style="margin-bottom:1rem;">
                <span style="font-size:0.8rem;color:var(--text-secondary);">
                    <i class="fas fa-brain"></i> AI analyzed ${HOSPITALS.length} facilities • ${condition} • ${urgency} urgency
                </span>
            </div>
            ${topResults.map((h, i) => `
                <div class="route-option ${i === 0 ? 'recommended' : ''}">
                    <div class="route-rank">${i === 0 ? '★' : i + 1}</div>
                    <div class="route-details">
                        <div class="route-hospital-name">${h.name} ${i === 0 ? '<span style="color:var(--success);font-size:0.72rem;">✓ AI Recommended</span>' : ''}</div>
                        <div class="route-meta">
                            <span><i class="fas fa-clock"></i> ${h.waitTime} min wait</span>
                            <span><i class="fas fa-users"></i> ${h.queue} in queue</span>
                            <span><i class="fas fa-road"></i> ${(Math.random() * 15 + 3).toFixed(1)} km</span>
                            <span><i class="fas fa-user-md"></i> ${h.doctors} doctors</span>
                        </div>
                        <div class="route-tags">
                            ${h.medicines > 80 ? '<span class="route-tag available">Medicine Available</span>' : '<span class="route-tag">Low Stock</span>'}
                            <span class="route-tag available">${h.type.toUpperCase()}</span>
                            <span class="route-tag">Load: ${h.load}%</span>
                        </div>
                    </div>
                </div>
            `).join('')}
            <button class="btn-primary btn-full" onclick="showToast('success', 'Token booked! SMS sent to patient.')">
                <i class="fas fa-ticket-alt"></i> Book Token at Recommended
            </button>
        `;
    });
}

// ============================================
// IVR SIMULATOR
// ============================================
function setupIVR() {
    let callActive = false;
    let ivrState = 'idle';

    const startBtn = document.getElementById('startCallBtn');
    const endBtn = document.getElementById('endCallBtn');
    const statusEl = document.getElementById('callStatus');
    const msgsEl = document.getElementById('ivrMessages');

    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
        if (callActive) return;
        callActive = true;
        ivrState = 'welcome';
        startBtn.style.display = 'none';
        endBtn.style.display = 'flex';
        statusEl.textContent = 'Connected — 00:00';

        msgsEl.innerHTML = '';
        addIvrMsg('system', '🏥 SehatSetu में आपका स्वागत है। Press 1 for Hindi, Press 2 for English.');

        // Start timer
        let seconds = 0;
        const timer = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            statusEl.textContent = `Connected — ${mins}:${secs}`;
        }, 1000);

        endBtn.addEventListener('click', () => {
            callActive = false;
            ivrState = 'idle';
            clearInterval(timer);
            startBtn.style.display = 'flex';
            endBtn.style.display = 'none';
            statusEl.textContent = 'Call ended';
            setTimeout(() => { statusEl.textContent = 'Tap to simulate call'; }, 2000);
        }, { once: true });
    });

    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!callActive) return;
            const key = btn.dataset.key;
            addIvrMsg('user', `Pressed: ${key}`);
            handleIvrInput(key);
        });
    });

    function handleIvrInput(key) {
        switch (ivrState) {
            case 'welcome':
                if (key === '1') {
                    addIvrMsg('system', 'हिंदी चुना गया। कृपया चुनें:\n1 — नजदीकी अस्पताल\n2 — कतार की स्थिति\n3 — दवा उपलब्धता');
                    ivrState = 'menu';
                } else if (key === '2') {
                    addIvrMsg('system', 'English selected. Please choose:\n1 — Nearest Hospital\n2 — Queue Status\n3 — Medicine Availability');
                    ivrState = 'menu';
                }
                break;
            case 'menu':
                if (key === '1') {
                    addIvrMsg('system', 'कृपया अपना पिन कोड दर्ज करें।\nPlease enter your PIN code.');
                    ivrState = 'pincode';
                } else if (key === '2') {
                    addIvrMsg('system', '📊 Queue Status:\n• District Hospital: 45 patients, 42min wait\n• CHC Mohanlalganj: 12 patients, 15min wait\n• PHC Kakori: 5 patients, 8min wait');
                    ivrState = 'done';
                } else if (key === '3') {
                    addIvrMsg('system', '💊 Medicine Status:\n• Paracetamol: Available at 12/15 facilities\n• Insulin: Available at 8/15 facilities\n• ORS: Available at 14/15 facilities');
                    ivrState = 'done';
                }
                break;
            case 'pincode':
                addIvrMsg('system', '📍 Nearest facilities:\n✅ PHC Kakori — 4km, 8min wait\n✅ CHC Mohanlalganj — 6km, 15min wait\n⚠️ District Hospital — 10km, 42min wait\n\nPress 1 to book token at recommended.');
                ivrState = 'booking';
                break;
            case 'booking':
                if (key === '1') {
                    addIvrMsg('system', '✅ Token booked at PHC Kakori!\nToken #: KK-247\nSMS भेज दिया गया है।\nThank you for using SehatSetu!');
                    ivrState = 'done';
                    showToast('success', 'IVR: Token booked successfully!');
                }
                break;
            case 'done':
                addIvrMsg('system', 'Thank you! Press * to return to main menu.');
                if (key === '*') ivrState = 'welcome';
                break;
        }
    }

    function addIvrMsg(type, text) {
        const div = document.createElement('div');
        div.className = `ivr-msg ${type}`;
        div.textContent = text;
        msgsEl.appendChild(div);
        msgsEl.scrollTop = msgsEl.scrollHeight;
    }
}

// ============================================
// WHATSAPP BOT SIMULATOR
// ============================================
function setupWhatsApp() {
    const input = document.getElementById('waInput');
    const sendBtn = document.getElementById('waSendBtn');
    const chat = document.getElementById('waChat');

    if (!sendBtn) return;

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        addWaMsg('sent', text);
        input.value = '';

        // Bot response
        setTimeout(() => {
            if (text === '1' || text.toLowerCase().includes('hospital') || text.toLowerCase().includes('अस्पताल')) {
                addWaMsg('received', '📍 कृपया अपना पिन कोड या लोकेशन भेजें\n\nPlease share your PIN code or location');
            } else if (text === '2' || text.toLowerCase().includes('queue') || text.toLowerCase().includes('कतार')) {
                addWaMsg('received', '📊 *Live Queue Status:*\n\n✅ PHC Kakori — 5 patients, ~8min\n⚠️ CHC Mohanlalganj — 12 patients, ~15min\n🔴 District Hospital — 45 patients, ~42min\n\nTokens available! Reply with hospital number to book.');
            } else if (text === '3' || text.toLowerCase().includes('medicine') || text.toLowerCase().includes('दवा')) {
                addWaMsg('received', '💊 *Medicine Availability:*\n\n✅ Paracetamol — 12/15 facilities\n✅ ORS — 14/15 facilities\n⚠️ Insulin — 8/15 facilities\n⚠️ Ciprofloxacin — 10/15 facilities\n\nReply with medicine name for specific stock.');
            } else if (/^\d{6}$/.test(text)) {
                addWaMsg('received', `🏥 *Facilities near ${text}:*\n\n1️⃣ ✅ *PHC Kakori* — 4km, 8min wait\n2️⃣ ✅ *CHC Mohanlalganj* — 6km, 15min wait\n3️⃣ ⚠️ *District Hospital* — 10km, 42min wait\n\nReply with number to book token! 🎫`);
            } else {
                addWaMsg('received', '🏥 *SehatSetu Bot*\n\nI can help with:\n1️⃣ Find nearest hospital\n2️⃣ Check queue status\n3️⃣ Medicine availability\n4️⃣ Link ABHA ID\n\nReply with a number!');
            }
        }, 800);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addWaMsg(type, text) {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = `wa-msg ${type}`;
        div.innerHTML = `<p>${text.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<b>$1</b>')}</p><span class="wa-time">${time}</span>`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
}

// ============================================
// ALERTS
// ============================================
function renderAlerts() {
    const list = document.getElementById('alertsList');
    if (!list) return;

    list.innerHTML = ALERTS_DATA.map(a => `
        <div class="alert-item ${a.unread ? 'unread' : ''}" onclick="this.classList.remove('unread')">
            <div class="alert-icon ${a.type}">
                <i class="${a.icon}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${a.title}</div>
                <div class="alert-desc">${a.desc}</div>
                <div class="alert-time">${a.time}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('markAllRead')?.addEventListener('click', () => {
        document.querySelectorAll('.alert-item.unread').forEach(a => a.classList.remove('unread'));
        showToast('success', 'All alerts marked as read');
    });
}

// ============================================
// REAL-TIME UPDATES
// ============================================
function startRealTimeUpdates() {
    // Simulate real-time data changes every 5 seconds
    setInterval(() => {
        if (currentPage !== 'dashboard') return;

        // Update KPI values with small fluctuations
        const patientsEl = document.getElementById('kpiPatients');
        if (patientsEl) {
            const current = parseInt(patientsEl.textContent.replace(',', ''));
            const change = Math.floor(Math.random() * 10) - 3;
            patientsEl.textContent = (current + change).toLocaleString();
        }

        const reroutedEl = document.getElementById('kpiRerouted');
        if (reroutedEl) {
            const current = parseInt(reroutedEl.textContent);
            if (Math.random() > 0.7) {
                reroutedEl.textContent = current + 1;
            }
        }

        // Update timestamp
        const updatedEl = document.getElementById('lastUpdated');
        if (updatedEl) {
            updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        }

        // Randomly update hospital loads
        HOSPITALS.forEach(h => {
            h.load = Math.max(10, Math.min(98, h.load + Math.floor(Math.random() * 7) - 3));
            h.queue = Math.max(0, h.queue + Math.floor(Math.random() * 5) - 2);
            h.waitTime = Math.max(1, Math.round(h.queue * 0.9));

            if (h.load > 85) h.status = 'critical';
            else if (h.load > 60) h.status = 'busy';
            else h.status = 'normal';
        });

        renderQueueTable();
    }, 5000);

    // Periodic notifications
    setTimeout(() => showToast('warning', 'AQI rising in Lucknow urban area — monitor respiratory OPD'), 8000);
    setTimeout(() => showToast('info', '12 patients rerouted from District Hospital to nearby CHCs'), 15000);
    setTimeout(() => showToast('success', 'Medicine transfer completed: Paracetamol → CHC Bakshi Ka Talab'), 25000);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        danger: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="${icons[type]} toast-icon ${type}"></i>
        <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
