/* ============================================
   SehatSetu — Main Application Logic
   ============================================ */

// ============================================
// DATA: Simulated hospital & healthcare data
// ============================================
let HOSPITALS = [
    // ── LUCKNOW DISTRICT ── Real hospitals with verified coordinates ──
    { id: 1,  name: "Balrampur Hospital Lucknow",          type: "district", lat: 26.8553, lng: 80.9089, load: 88, queue: 62, waitTime: 48, doctors: 45, beds: 600, bedsOccupied: 528, medicines: 82, status: "critical" },
    { id: 2,  name: "Ram Manohar Lohia Hospital",          type: "district", lat: 26.8382, lng: 80.9346, load: 76, queue: 44, waitTime: 38, doctors: 38, beds: 350, bedsOccupied: 266, medicines: 90, status: "busy" },
    { id: 3,  name: "Civil Hospital Lucknow",              type: "district", lat: 26.8491, lng: 80.9325, load: 71, queue: 38, waitTime: 32, doctors: 30, beds: 300, bedsOccupied: 213, medicines: 85, status: "busy" },
    { id: 4,  name: "Queen Mary's Hospital",               type: "district", lat: 26.8450, lng: 80.9400, load: 65, queue: 28, waitTime: 25, doctors: 22, beds: 250, bedsOccupied: 163, medicines: 92, status: "busy" },
    { id: 5,  name: "CHC Mohanlalganj",                    type: "chc",      lat: 26.7488, lng: 80.9079, load: 42, queue: 11, waitTime: 14, doctors: 7,  beds: 50,  bedsOccupied: 21,  medicines: 88, status: "normal" },
    { id: 6,  name: "CHC Bakshi Ka Talab",                 type: "chc",      lat: 26.9102, lng: 80.9910, load: 89, queue: 36, waitTime: 40, doctors: 6,  beds: 45,  bedsOccupied: 40,  medicines: 55, status: "critical" },
    { id: 7,  name: "CHC Malihabad",                       type: "chc",      lat: 26.9201, lng: 80.7210, load: 68, queue: 20, waitTime: 26, doctors: 5,  beds: 40,  bedsOccupied: 27,  medicines: 80, status: "busy" },
    { id: 8,  name: "PHC Kakori",                          type: "phc",      lat: 26.8691, lng: 80.7876, load: 32, queue: 5,  waitTime: 7,  doctors: 2,  beds: 15,  bedsOccupied: 5,   medicines: 76, status: "normal" },
    { id: 9,  name: "PHC Chinhat",                         type: "phc",      lat: 26.8820, lng: 81.0495, load: 58, queue: 13, waitTime: 17, doctors: 3,  beds: 15,  bedsOccupied: 9,   medicines: 83, status: "busy" },
    { id: 10, name: "PHC Itaunja",                         type: "phc",      lat: 27.0098, lng: 80.8892, load: 22, queue: 3,  waitTime: 5,  doctors: 2,  beds: 10,  bedsOccupied: 2,   medicines: 91, status: "normal" },
    { id: 11, name: "PHC Dewa",                            type: "phc",      lat: 26.8305, lng: 81.0280, load: 40, queue: 7,  waitTime: 10, doctors: 2,  beds: 12,  bedsOccupied: 5,   medicines: 68, status: "normal" },
    // ── BARABANKI DISTRICT ──
    { id: 12, name: "District Hospital Barabanki",         type: "district", lat: 26.9272, lng: 81.1942, load: 92, queue: 70, waitTime: 58, doctors: 24, beds: 200, bedsOccupied: 184, medicines: 70, status: "critical" },
    { id: 13, name: "CHC Haidergarh",                      type: "chc",      lat: 26.6698, lng: 81.3187, load: 45, queue: 10, waitTime: 12, doctors: 5,  beds: 30,  bedsOccupied: 14,  medicines: 95, status: "normal" },
    { id: 14, name: "PHC Ramsanehi Ghat",                  type: "phc",      lat: 26.7800, lng: 81.2500, load: 28, queue: 4,  waitTime: 6,  doctors: 2,  beds: 10,  bedsOccupied: 3,   medicines: 87, status: "normal" },
    // ── SITAPUR DISTRICT ──
    { id: 15, name: "District Hospital Sitapur",           type: "district", lat: 27.5633, lng: 80.6786, load: 78, queue: 52, waitTime: 48, doctors: 20, beds: 160, bedsOccupied: 125, medicines: 80, status: "busy" },
    { id: 16, name: "CHC Biswan",                          type: "chc",      lat: 27.4874, lng: 80.9780, load: 36, queue: 7,  waitTime: 9,  doctors: 4,  beds: 25,  bedsOccupied: 9,   medicines: 92, status: "normal" },
    { id: 17, name: "PHC Sidhauli",                        type: "phc",      lat: 27.2812, lng: 80.8341, load: 29, queue: 4,  waitTime: 6,  doctors: 2,  beds: 10,  bedsOccupied: 3,   medicines: 87, status: "normal" },
    // ── HARDOI DISTRICT ──
    { id: 18, name: "District Hospital Hardoi",            type: "district", lat: 27.3952, lng: 80.1273, load: 62, queue: 24, waitTime: 22, doctors: 18, beds: 120, bedsOccupied: 74,  medicines: 78, status: "busy" },
    { id: 19, name: "PHC Sandila",                         type: "phc",      lat: 27.0693, lng: 80.5198, load: 18, queue: 2,  waitTime: 3,  doctors: 2,  beds: 10,  bedsOccupied: 2,   medicines: 96, status: "normal" },
];

let MEDICINES_STOCKOUT = [
    { medicine: "Paracetamol 500mg", hospital: "CHC Bakshi Ka Talab", currentStock: 120, daysLeft: 3, predictedNeed: 450, status: "critical" },
    { medicine: "Insulin Glargine", hospital: "District Hospital Barabanki", currentStock: 45, daysLeft: 5, predictedNeed: 180, status: "critical" },
    { medicine: "Amoxicillin 250mg", hospital: "PHC Dewa", currentStock: 200, daysLeft: 7, predictedNeed: 320, status: "warning" },
    { medicine: "ORS Sachets", hospital: "PHC Kakori", currentStock: 350, daysLeft: 8, predictedNeed: 500, status: "warning" },
    { medicine: "Metformin 500mg", hospital: "CHC Malihabad", currentStock: 180, daysLeft: 10, predictedNeed: 280, status: "normal" },
    { medicine: "Ciprofloxacin 500mg", hospital: "District Hospital Lucknow", currentStock: 90, daysLeft: 4, predictedNeed: 350, status: "critical" },
    { medicine: "Azithromycin 500mg", hospital: "CHC Haidergarh", currentStock: 250, daysLeft: 12, predictedNeed: 200, status: "normal" },
    { medicine: "Iron Folic Acid", hospital: "PHC Chinhat", currentStock: 60, daysLeft: 6, predictedNeed: 150, status: "warning" },
];

let ALERTS_DATA = [
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

let TRANSFERS_DATA = [
    { id: "transfer-1", from: "CHC Biswan", fromType: "CHC", to: "CHC Bakshi Ka Talab", toType: "CHC", medicine: "Paracetamol 500mg × 500", status: "in-transit", eta: "2 hours" },
    { id: "transfer-2", from: "Balrampur Hospital Lucknow", fromType: "DH", to: "PHC Dewa", toType: "PHC", medicine: "Amoxicillin 250mg × 300", status: "pending", eta: "Tomorrow" },
    { id: "transfer-3", from: "CHC Haidergarh", fromType: "CHC", to: "District Hospital Barabanki", toType: "DH", medicine: "Ciprofloxacin 500mg × 200", status: "in-transit", eta: "4 hours" },
    { id: "transfer-4", from: "PHC Sandila", fromType: "PHC", to: "PHC Chinhat", toType: "PHC", medicine: "Iron Folic Acid × 100", status: "delivered", eta: "Completed" },
];

// ============================================
// APP STATE
// ============================================
let currentPage = 'dashboard';
let backendConnected = false;
let map = null;
let mapMarkers = [];
let routeLines = [];
let heatmapCircles = [];
let osmFacilityLayer = null;
let osmFacilities = [];
let osmFacilityMetadata = null;
let osmFacilitiesLoaded = false;
let osmFacilityLoadPromise = null;
let userLocationMarker = null;
let userLocationCircle = null;
let locationWatchId = null;
let chartsInitialized = false;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        initApp().catch(error => {
            console.error('Application initialization failed:', error);
            showToast('danger', 'The dashboard could not be initialized. Check the browser console for details.');
        });
    }, 2200);
});

async function initApp() {
    try {
        await loadBackendData();
        setBackendStatus(true);
    } catch (error) {
        setBackendStatus(false);
        showToast('warning', 'Backend unavailable. Showing demo data only; changes will not be saved.');
    }

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

async function requestApi(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || `API request failed (${response.status})`);
    }
    return response.json();
}

function syncRecords(currentRecords, incomingRecords) {
    const existingById = new Map(currentRecords.map(record => [String(record.id), record]));
    const syncedRecords = incomingRecords.map(record => {
        const existing = existingById.get(String(record.id));
        return existing ? Object.assign(existing, record) : record;
    });
    currentRecords.splice(0, currentRecords.length, ...syncedRecords);
}

async function loadBackendData() {
    const state = await requestApi('/api/state');
    syncRecords(HOSPITALS, state.hospitals);
    syncRecords(MEDICINES_STOCKOUT, state.stockouts);
    syncRecords(ALERTS_DATA, state.alerts);
    syncRecords(TRANSFERS_DATA, state.transfers);
    backendConnected = true;
}

function setBackendStatus(connected) {
    const status = document.getElementById('backendStatus');
    const dot = document.querySelector('.topbar-status .status-dot');
    if (status) status.textContent = connected ? 'Backend connected' : 'Demo mode (offline)';
    if (dot) {
        dot.classList.toggle('online', connected);
        dot.classList.toggle('offline', !connected);
    }
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

    list.innerHTML = TRANSFERS_DATA.map(t => `
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

async function initiateTransfer(medicine, hospital) {
    if (!backendConnected) {
        showToast('warning', 'Transfer not saved because the backend is offline.');
        return;
    }

    try {
        const transfer = await requestApi('/api/transfers', {
            method: 'POST',
            body: JSON.stringify({ medicine, hospital })
        });
        TRANSFERS_DATA.unshift(transfer);
        renderTransfers();
        showToast('success', `Transfer request saved for ${medicine} to ${hospital}`);
    } catch (error) {
        console.error('Transfer request failed:', error);
        showToast('danger', `Transfer request failed: ${error.message}`);
    }
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
        zoomControl: false
    }).fitBounds([[23.8, 77.0], [30.5, 84.6]]);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    osmFacilityLayer = L.layerGroup().addTo(map);
    addLiveLocationControl();

    // These overlays use illustrative capacity data, not live facility feeds.
    addHospitalMarkers();
    addHeatmapCircles();
    addRouteLines();

    setupMapLayers();
    loadOsmFacilities();
    map.on('moveend zoomend', renderVisibleOsmFacilities);

    // Fix map rendering
    setTimeout(() => map.invalidateSize(), 200);
}

const OSM_MIN_ZOOM = 8;

async function loadOsmFacilities() {
    if (osmFacilitiesLoaded || osmFacilityLoadPromise) return osmFacilityLoadPromise;

    const status = document.getElementById('mapDataStatus');
    const retryButton = document.getElementById('retryMapData');
    if (status) status.textContent = 'Loading OpenStreetMap facilities for Uttar Pradesh...';
    if (retryButton) retryButton.hidden = true;

    osmFacilityLoadPromise = (async () => {
        try {
            const result = await requestApi('/api/map/facilities');
            if (!Array.isArray(result.facilities)) {
                throw new Error('The map API returned an invalid facility list');
            }
            osmFacilities = result.facilities;
            osmFacilityMetadata = result;
            osmFacilitiesLoaded = true;
            renderVisibleOsmFacilities();
        } catch (error) {
            if (status) status.textContent = `OpenStreetMap facilities could not be loaded: ${error.message}`;
            if (retryButton) retryButton.hidden = false;
        } finally {
            osmFacilityLoadPromise = null;
        }
    })();

    return osmFacilityLoadPromise;
}

function renderVisibleOsmFacilities() {
    if (!map || !osmFacilityLayer) return;
    osmFacilityLayer.clearLayers();

    const status = document.getElementById('mapDataStatus');
    const retryButton = document.getElementById('retryMapData');
    if (!osmFacilitiesLoaded) return;
    if (retryButton) retryButton.hidden = true;

    if (!document.getElementById('layerOsmFacilities')?.checked) {
        if (status) status.textContent = `${osmFacilities.length.toLocaleString()} OpenStreetMap facilities loaded; layer hidden.`;
        return;
    }

    if (map.getZoom() < OSM_MIN_ZOOM) {
        if (status) status.textContent = `${osmFacilities.length.toLocaleString()} facilities mapped across Uttar Pradesh. Zoom in to level ${OSM_MIN_ZOOM} or closer to view markers.`;
        return;
    }

    const bounds = map.getBounds();
    const typeFilter = document.getElementById('mapFilter')?.value || 'all';
    const visibleFacilities = osmFacilities.filter(facility => {
        const matchesBounds = bounds.contains([facility.lat, facility.lng]);
        const type = String(facility.type || '').toLowerCase();
        const matchesType = typeFilter === 'all'
            || (typeFilter === 'hospital' && type.includes('hospital'))
            || (typeFilter === 'clinic' && ['clinic', 'doctor', 'doctors'].includes(type))
            || (typeFilter === 'other' && !type.includes('hospital') && !['clinic', 'doctor', 'doctors'].includes(type));
        return matchesBounds && matchesType;
    });

    visibleFacilities.forEach(facility => {
        L.circleMarker([facility.lat, facility.lng], {
            radius: 6,
            color: '#ffffff',
            weight: 1,
            fillColor: '#4facfe',
            fillOpacity: 0.9
        }).bindPopup(createOsmFacilityPopup(facility)).addTo(osmFacilityLayer);
    });

    if (status) {
        const fetchedAt = osmFacilityMetadata?.fetchedAt
            ? new Date(osmFacilityMetadata.fetchedAt).toLocaleString()
            : 'unknown';
        status.textContent = `Showing ${visibleFacilities.length.toLocaleString()} of ${osmFacilities.length.toLocaleString()} mapped facilities in view · OSM data updated ${fetchedAt}`;
    }
}

function createOsmFacilityPopup(facility) {
    const popup = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = facility.name;
    popup.appendChild(title);

    const type = document.createElement('p');
    type.textContent = `Mapped facility type: ${facility.type}`;
    popup.appendChild(type);

    if (facility.operator) {
        const operator = document.createElement('p');
        operator.textContent = `Operator: ${facility.operator}`;
        popup.appendChild(operator);
    }
    if (facility.address) {
        const address = document.createElement('p');
        address.textContent = facility.address;
        popup.appendChild(address);
    }

    const source = document.createElement('a');
    source.href = `https://www.openstreetmap.org/${facility.id}`;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = 'OpenStreetMap source';
    popup.appendChild(source);

    return popup;
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

function addHospitalMarkers() {
    HOSPITALS.forEach(h => {
        const marker = L.marker([h.lat, h.lng], { icon: createHospitalIcon(h.status) });
        if (document.getElementById('layerHospitals')?.checked) marker.addTo(map);

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

        mapMarkers.push({ marker, data: h });
    });
}

function addHeatmapCircles() {
    HOSPITALS.forEach(h => {
        const radius = 600 + h.queue * 55;
        const color = h.status === 'critical' ? '#f5576c' : h.status === 'busy' ? '#f7b731' : '#43e97b';
        const circle = L.circle([h.lat, h.lng], {
            radius,
            color,
            fillColor: color,
            fillOpacity: 0.11,
            weight: 1
        });
        if (document.getElementById('layerHeatmap')?.checked) circle.addTo(map);
        heatmapCircles.push({ circle, data: h });
    });
}

function addRouteLines() {
    // Illustrative routes only; the app has no connected dispatch feed.
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
        });
        if (document.getElementById('layerRoutes')?.checked) line.addTo(map);
        routeLines.push(line);
    });
}

function showHospitalInfo(h) {
    const panel = document.getElementById('mapInfoPanel');
    const content = document.getElementById('mapInfoContent');

    const loadColor = h.status === 'critical' ? '#f5576c' : h.status === 'busy' ? '#f7b731' : '#43e97b';

    content.innerHTML = `
        <h3 style="margin-bottom:0.75rem;">${h.name}</h3>
        <p style="font-size:0.7rem;color:var(--warning);margin-bottom:0.5rem;">Illustrative demo availability; this is not a live facility feed.</p>
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

        <button class="btn-primary btn-full" onclick="navigateTo('routing'); showToast('info', 'Demo route suggestion for ${h.name}')">
            <i class="fas fa-route"></i> View Demo Route
        </button>
    `;

    panel.classList.add('visible');
}

function setupMapLayers() {
    document.getElementById('closeMapPanel')?.addEventListener('click', () => {
        document.getElementById('mapInfoPanel').classList.remove('visible');
    });

    const layerBindings = [
        ['layerHospitals', mapMarkers, 'marker'],
        ['layerRoutes', routeLines, 'line'],
        ['layerHeatmap', heatmapCircles, 'circle']
    ];

    layerBindings.forEach(([controlId, items, itemType]) => {
        document.getElementById(controlId)?.addEventListener('change', (event) => {
            items.forEach(item => {
                const layer = itemType === 'marker' ? item.marker : itemType === 'circle' ? item.circle : item;
                if (event.target.checked) layer.addTo(map);
                else map.removeLayer(layer);
            });
        });
    });

    document.getElementById('layerOsmFacilities')?.addEventListener('change', event => {
        if (event.target.checked) osmFacilityLayer.addTo(map);
        else map.removeLayer(osmFacilityLayer);
        renderVisibleOsmFacilities();
    });
    document.getElementById('retryMapData')?.addEventListener('click', loadOsmFacilities);
    document.getElementById('mapFilter')?.addEventListener('change', renderVisibleOsmFacilities);
    document.getElementById('mapStatus')?.addEventListener('change', applyMapFilters);
}

function applyMapFilters() {
    const statusFilter = document.getElementById('mapStatus')?.value || 'all';

    mapMarkers.forEach(({ marker, data }) => {
        const statusMatches = statusFilter === 'all' || data.status === statusFilter;
        if (statusMatches && document.getElementById('layerHospitals')?.checked) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });

    heatmapCircles.forEach(({ circle, data }) => {
        const statusMatches = statusFilter === 'all' || data.status === statusFilter;
        if (statusMatches && document.getElementById('layerHeatmap')?.checked) {
            circle.addTo(map);
        } else {
            map.removeLayer(circle);
        }
    });
}

function addLiveLocationControl() {
    const LocateControl = L.Control.extend({
        onAdd: function () {
            const button = L.DomUtil.create('button', 'leaflet-bar live-location-button');
            button.type = 'button';
            button.title = 'Use my live location';
            button.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
            L.DomEvent.disableClickPropagation(button);
            button.addEventListener('click', startLiveLocation);
            return button;
        }
    });
    new LocateControl({ position: 'bottomleft' }).addTo(map);
}

function startLiveLocation() {
    if (!navigator.geolocation) {
        showToast('danger', 'Geolocation is not supported by this browser');
        return;
    }

    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }

    const status = document.getElementById('liveLocationStatus');
    if (status) status.textContent = 'Location: locating...';

    locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const latlng = [position.coords.latitude, position.coords.longitude];

            if (!userLocationMarker) {
                userLocationMarker = L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div class="user-location-marker"><span></span></div>',
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })
                }).addTo(map).bindPopup('Your live location');

                userLocationCircle = L.circle(latlng, {
                    radius: position.coords.accuracy,
                    color: '#4facfe',
                    fillColor: '#4facfe',
                    fillOpacity: 0.12,
                    weight: 1
                }).addTo(map);
                map.setView(latlng, 13);
            } else {
                userLocationMarker.setLatLng(latlng);
                userLocationCircle.setLatLng(latlng);
                userLocationCircle.setRadius(position.coords.accuracy);
            }

            if (status) {
                status.textContent = `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
            }
        },
        (error) => {
            const message = error.code === 1
                ? 'Location permission denied'
                : 'Unable to retrieve your location';
            if (status) status.textContent = message;
            showToast('danger', message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000
        }
    );
}

function refreshLiveMap() {
    if (!map) return;

    mapMarkers.forEach(({ marker, data }) => {
        marker.setIcon(createHospitalIcon(data.status));
        marker.setPopupContent(`
            <div style="min-width:200px;">
                <h4 style="margin-bottom:6px;">${data.name}</h4>
                <div style="display:flex;gap:12px;margin-bottom:8px;">
                    <span style="font-size:0.75rem;"><i class="fas fa-users"></i> Queue: ${data.queue}</span>
                    <span style="font-size:0.75rem;"><i class="fas fa-clock"></i> Wait: ${data.waitTime}min</span>
                </div>
                <div style="height:4px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${data.load}%;background:${data.status === 'critical' ? '#f5576c' : data.status === 'busy' ? '#f7b731' : '#43e97b'};border-radius:4px;"></div>
                </div>
                <span style="font-size:0.65rem;color:rgba(255,255,255,0.5);">Load: ${data.load}%</span>
            </div>
        `);
    });

    heatmapCircles.forEach(({ circle, data }) => {
        const color = data.status === 'critical' ? '#f5576c' : data.status === 'busy' ? '#f7b731' : '#43e97b';
        circle.setRadius(600 + data.queue * 55);
        circle.setStyle({ color, fillColor: color });
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
        <div class="alert-item ${a.unread ? 'unread' : ''}" data-alert-id="${a.id}">
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

    list.onclick = async event => {
        const alertItem = event.target.closest('.alert-item');
        if (alertItem && alertItem.classList.contains('unread')) {
            await markAlertRead(alertItem.dataset.alertId);
        }
    };

    const markAllButton = document.getElementById('markAllRead');
    if (markAllButton) markAllButton.onclick = markAllAlertsRead;
}

async function markAlertRead(alertId) {
    try {
        const saved = backendConnected;
        if (saved) {
            await requestApi(`/api/alerts/${encodeURIComponent(alertId)}`, {
                method: 'PATCH',
                body: JSON.stringify({ unread: false })
            });
        }
        const alert = ALERTS_DATA.find(item => String(item.id) === String(alertId));
        if (alert) alert.unread = false;
        renderAlerts();
        if (!saved) showToast('warning', 'Alert updated in demo mode only; the change was not saved.');
    } catch (error) {
        console.error('Updating alert failed:', error);
        showToast('danger', `Could not update alert: ${error.message}`);
    }
}

async function markAllAlertsRead() {
    try {
        const saved = backendConnected;
        if (saved) {
            await requestApi('/api/alerts/read', { method: 'POST' });
        }
        ALERTS_DATA.forEach(alert => { alert.unread = false; });
        renderAlerts();
        showToast(saved ? 'success' : 'warning', saved
            ? 'All alerts marked as read'
            : 'Alerts updated in demo mode only; changes were not saved.');
    } catch (error) {
        console.error('Updating alerts failed:', error);
        showToast('danger', `Could not update alerts: ${error.message}`);
    }
}

// ============================================
// REAL-TIME UPDATES
// ============================================
function startRealTimeUpdates() {
    // Simulate real-time data changes every 5 seconds
    setInterval(async () => {
        if (backendConnected) {
            try {
                await loadBackendData();
                renderQueueTable();
                refreshLiveMap();
                if (currentPage === 'supply') {
                    renderStockoutTable();
                    renderTransfers();
                }
                if (currentPage === 'hospitals') {
                    renderHospitals(
                        document.getElementById('hospitalTypeFilter')?.value || 'all',
                        document.getElementById('hospitalStatusFilter')?.value || 'all',
                        document.getElementById('hospitalSearch')?.value || ''
                    );
                }
                if (currentPage === 'alerts') renderAlerts();
            } catch (error) {
                backendConnected = false;
                setBackendStatus(false);
                console.error('Backend refresh failed:', error);
                showToast('danger', `Backend refresh failed: ${error.message}. Changes are no longer being saved.`);
            }
            return;
        }

        if (currentPage !== 'dashboard' && currentPage !== 'map') return;

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
        refreshLiveMap();
        if (currentPage === 'map') applyMapFilters();
    }, 5000);

    if (!backendConnected) {
        setTimeout(() => showToast('warning', 'AQI rising in Lucknow urban area — monitor respiratory OPD'), 8000);
        setTimeout(() => showToast('info', '12 patients rerouted from District Hospital to nearby CHCs'), 15000);
        setTimeout(() => showToast('success', 'Medicine transfer completed: Paracetamol → CHC Bakshi Ka Talab'), 25000);
    }
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

// ============================================
// PATIENT-FACING HEALTHCARE MODULES
// ============================================
let ambulanceLeafletMap = null;
let ambulanceMapMarkers = new Map();
let driverGpsWatch = null;

function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

async function setupPatientTools() {
    document.getElementById('careSearchBtn')?.addEventListener('click', searchCare);
    document.getElementById('careSearch')?.addEventListener('keydown', e => { if (e.key === 'Enter') searchCare(); });
    document.getElementById('bloodSearchBtn')?.addEventListener('click', loadBloodBanks);
    document.getElementById('medicineSearchBtn')?.addEventListener('click', loadPharmacies);
    document.getElementById('emergencyForm')?.addEventListener('submit', submitEmergencyRequest);
    document.getElementById('startGpsBtn')?.addEventListener('click', startDriverGps);
    document.getElementById('stopGpsBtn')?.addEventListener('click', stopDriverGps);
    document.getElementById('assistantForm')?.addEventListener('submit', sendAssistantMessage);
    await Promise.allSettled([searchCare(), loadBloodBanks(), loadPharmacies(), loadAmbulanceOptions(), loadEmergencyRequests()]);
}

async function searchCare() {
    const host = document.getElementById('careResults');
    if (!host) return;
    const query = (document.getElementById('careSearch')?.value || '').trim().toLowerCase();
    host.innerHTML = '<div class="glass-card">Searching healthcare network…</div>';
    try {
        const [hospitals, doctors] = await Promise.all([requestApi('/api/hospitals'), requestApi('/api/doctors')]);
        const diseaseTerms = { 'heart disease':'cardiology', 'heart':'cardiology', 'chest':'cardiology', 'brain':'neurology', 'stroke':'neurology', 'paralysis':'neurology', 'bone':'orthopedics', 'fracture':'orthopedics', 'joint pain':'orthopedics', 'child':'pediatrics', 'baby':'pediatrics', 'pregnancy':'gynecology', 'women':'gynecology', 'diabetes':'endocrinology', 'thyroid':'endocrinology', 'skin':'dermatology', 'asthma':'pulmonology', 'lung':'pulmonology', 'breathing':'pulmonology', 'stomach':'gastroenterology', 'digestive':'gastroenterology', 'cancer':'oncology', 'ear':'ent', 'nose':'ent', 'throat':'ent' };
        const specialtyQuery = diseaseTerms[query] || query;
        const matches = hospitals.filter(h => !query || [h.name, h.type, ...(h.specialties || [])].join(' ').toLowerCase().includes(specialtyQuery));
        const doctorMatches = doctors.filter(d => !query || [d.name, d.specialty].join(' ').toLowerCase().includes(specialtyQuery));
        const hospitalCards = matches.map(h => { const listedSpecialties = h.specialties || doctors.filter(d => d.hospitalId === h.id).map(d => d.specialty); return `<article class="glass-card health-card"><div class="health-card-top"><span class="status-pill ${h.status || 'normal'}">${safeText(h.status || 'status unknown')}</span><span class="demo-label">DEMO DATA</span></div><h3>${safeText(h.name)}</h3><p>${safeText(h.type || 'Hospital')} · ${safeText(h.address || 'Address to be confirmed')}</p><div class="health-stats"><span><b>${safeText(h.beds ?? '—')}</b> total beds</span><span><b>${safeText(Math.max(0,(h.beds||0)-(h.bedsOccupied||0)))}</b> estimated beds free</span><span><b>${safeText(h.icuBeds ?? '—')}</b> ICU beds*</span></div><p><b>Departments:</b> ${safeText((listedSpecialties.length ? listedSpecialties : ['Contact hospital']).join(', '))}</p><p><b>Emergency:</b> ${h.emergency24x7 ? 'Listed as 24/7 (verify)' : 'Contact hospital'}</p><small>*Illustrative figures. Not live hospital capacity.</small></article>`; }).join('');
        const doctorCards = doctorMatches.map(d => { const hospital = hospitals.find(h => h.id === d.hospitalId); return `<article class="glass-card health-card"><span class="demo-label">UNVERIFIED SAMPLE PROFILE</span><h3>${safeText(d.name)}</h3><p>${safeText(d.specialty)} · ${safeText(d.qualification)}</p><p>${safeText(hospital?.name || 'Hospital not listed')}</p><p><b>${safeText(d.availability)}</b> · Next slot: ${safeText(d.nextSlot)}</p><p>Consultation fee: ₹${safeText(d.consultationFee)}</p><button class="btn-secondary" onclick="requestDoctorAppointment('${safeText(d.id)}','${safeText(d.name)}','${safeText(d.nextSlot)}')">Request appointment</button></article>`; }).join('');
        host.innerHTML = `<div class="health-section-title"><h3>Hospitals (${matches.length})</h3></div>${hospitalCards || '<div class="glass-card">No matching hospitals found.</div>'}<div class="health-section-title"><h3>Doctors (${doctorMatches.length})</h3></div>${doctorCards || '<div class="glass-card">No matching doctor profiles found.</div>'}`;
    } catch (error) { host.innerHTML = `<div class="glass-card">Could not load care directory: ${safeText(error.message)}</div>`; }
}

async function requestDoctorAppointment(id, name, slot) {
    const patientName = prompt(`Request appointment with ${name}. Enter patient name:`);
    if (!patientName) return;
    const phone = prompt('Enter a contact number for this demo request:');
    if (!phone) return;
    try {
        const result = await requestApi('/api/appointments', {method:'POST', body:JSON.stringify({doctorId:id, patientName, phone, slot})});
        showToast('success', `Appointment request ${result.id.slice(0,8)} saved. Hospital confirmation is required.`);
    } catch (error) { showToast('danger', error.message); }
}
window.requestDoctorAppointment = requestDoctorAppointment;

async function loadBloodBanks() {
    const host = document.getElementById('bloodResults'); if (!host) return;
    const group = document.getElementById('bloodGroup')?.value || '';
    try {
        const banks = await requestApi(`/api/blood-banks${group ? `?group=${encodeURIComponent(group)}` : ''}`);
        host.innerHTML = banks.map(b => `<article class="glass-card health-card"><span class="demo-label">SAMPLE INVENTORY — CALL TO VERIFY</span><h3>${safeText(b.name)}</h3><p>${safeText(b.address)}</p><div class="blood-grid">${Object.entries(b.inventory || {}).map(([g,n])=>`<span><b>${safeText(g)}</b>${safeText(n)} units</span>`).join('')}</div><p><b>Components:</b> ${safeText((b.components || []).join(', '))}</p><p>${safeText(b.phone)}</p></article>`).join('') || '<div class="glass-card">No matching blood bank records.</div>';
    } catch (e) { host.textContent = e.message; }
}

async function loadPharmacies() {
    const host = document.getElementById('medicineResults'); if (!host) return;
    const medicine = document.getElementById('medicineSearch')?.value.trim() || '';
    try {
        const pharmacies = await requestApi(`/api/pharmacies${medicine ? `?medicine=${encodeURIComponent(medicine)}` : ''}`);
        host.innerHTML = pharmacies.map(p => { const meds = (p.medicines || []).filter(m => !medicine || m.name.toLowerCase().includes(medicine.toLowerCase())); return `<article class="glass-card health-card"><span class="demo-label">SAMPLE STOCK — NOT LIVE</span><h3>${safeText(p.name)}</h3><p>${safeText(p.address)} · ${p.openNow ? 'Listed open' : 'Listed closed'}</p>${meds.map(m=>`<div class="medicine-row"><span>${safeText(m.name)}<small>${m.prescriptionRequired ? 'Prescription required' : 'OTC listing'}</small></span><b>${m.stock > 0 ? `${safeText(m.stock)} in stock` : 'Out of stock'}</b><strong>${m.price ? `₹${safeText(m.price)}` : '—'}</strong></div>`).join('') || '<p>No matching medicine in this sample pharmacy.</p>'}<p>${safeText(p.phone)}</p></article>`; }).join('') || '<div class="glass-card">No pharmacies found.</div>';
    } catch (e) { host.textContent = e.message; }
}

async function loadAmbulanceOptions() {
    const select = document.getElementById('ambulanceSelect'); if (!select) return;
    const ambulances = await requestApi('/api/ambulances');
    select.innerHTML = ambulances.map(a=>`<option value="${safeText(a.id)}">${safeText(a.id)} · ${safeText(a.status || 'demo vehicle')}</option>`).join('');
    renderAmbulanceMap(ambulances);
}

function renderAmbulanceMap(ambulances) {
    const node = document.getElementById('ambulanceMap'); if (!node || !window.L) return;
    if (!ambulanceLeafletMap) { ambulanceLeafletMap = L.map(node).setView([26.8467,80.9462],10); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(ambulanceLeafletMap); }
    ambulances.forEach(a => { if (typeof a.lat !== 'number' || typeof a.lng !== 'number') return; const pos=[a.lat,a.lng]; if (ambulanceMapMarkers.has(a.id)) ambulanceMapMarkers.get(a.id).setLatLng(pos); else ambulanceMapMarkers.set(a.id,L.marker(pos).addTo(ambulanceLeafletMap).bindPopup(`${safeText(a.id)} · ${safeText(a.status || 'sample location')}`)); });
    if (ambulances.length) setTimeout(()=>ambulanceLeafletMap.invalidateSize(),150);
}

async function startDriverGps() {
    if (!navigator.geolocation) { showToast('danger','Geolocation is not supported by this browser.'); return; }
    const id = document.getElementById('ambulanceSelect')?.value; if (!id) return;
    if (driverGpsWatch !== null) navigator.geolocation.clearWatch(driverGpsWatch);
    document.getElementById('gpsStatus').textContent = 'Waiting for GPS permission…';
    driverGpsWatch = navigator.geolocation.watchPosition(async pos => {
        try { await requestApi(`/api/ambulances/${encodeURIComponent(id)}/location`,{method:'POST',body:JSON.stringify({lat:pos.coords.latitude,lng:pos.coords.longitude,status:'on-duty'})}); document.getElementById('gpsStatus').textContent = `GPS shared for ${id}. Accuracy: ±${Math.round(pos.coords.accuracy)} m. Updated ${new Date().toLocaleTimeString()}`; await loadAmbulanceOptions(); }
        catch(e) { document.getElementById('gpsStatus').textContent = `GPS update failed: ${e.message}`; }
    }, err => { document.getElementById('gpsStatus').textContent = `Location error: ${err.message}`; }, {enableHighAccuracy:true,maximumAge:5000,timeout:15000});
}
function stopDriverGps() { if (driverGpsWatch !== null) navigator.geolocation.clearWatch(driverGpsWatch); driverGpsWatch=null; const el=document.getElementById('gpsStatus'); if(el)el.textContent='GPS sharing stopped on this device.'; }

async function submitEmergencyRequest(event) {
    event.preventDefault(); const form=event.currentTarget; const status=document.getElementById('emergencyStatus');
    if (!navigator.geolocation) { status.textContent='Location is unavailable. In a real emergency call 112.'; return; }
    status.textContent='Requesting location permission…';
    navigator.geolocation.getCurrentPosition(async pos => {
        const data=Object.fromEntries(new FormData(form).entries()); data.lat=pos.coords.latitude; data.lng=pos.coords.longitude;
        try { const result=await requestApi('/api/emergency-requests',{method:'POST',body:JSON.stringify(data)}); status.textContent=`Demo request ${result.id.slice(0,8)} recorded. Assigned sample ambulance: ${result.assignedAmbulance || 'none available'}. This does NOT dispatch a real ambulance.`; await loadEmergencyRequests(); }
        catch(e){status.textContent=e.message;}
    }, err=>{status.textContent=`Could not get location: ${err.message}. If urgent, call 112.`;},{enableHighAccuracy:true,timeout:12000});
}
async function loadEmergencyRequests(){const host=document.getElementById('emergencyList');if(!host)return;try{const items=await requestApi('/api/emergency-requests');host.innerHTML=items.slice().reverse().map(x=>`<div class="medicine-row"><span><b>${safeText(x.patientName)}</b><small>${safeText(x.issue)} · ${safeText(new Date(x.createdAt).toLocaleString())}</small></span><b>${safeText(x.status)}</b><strong>${safeText(x.assignedAmbulance || 'Unassigned')}</strong></div>`).join('')||'<p>No requests yet.</p>';}catch(e){host.textContent=e.message;}}

async function sendAssistantMessage(event){event.preventDefault();const input=document.getElementById('assistantInput');const chat=document.getElementById('assistantChat');const message=input.value.trim();if(!message)return;chat.insertAdjacentHTML('beforeend',`<div class="assistant-message user">${safeText(message)}</div>`);input.value='';try{const result=await requestApi('/api/assistant',{method:'POST',body:JSON.stringify({message})});chat.insertAdjacentHTML('beforeend',`<div class="assistant-message bot ${result.triage==='emergency'?'urgent':''}"><b>${result.triage==='emergency'?'Emergency warning':'General guidance'}</b><br>${safeText(result.reply)}<small>${safeText(result.disclaimer)}</small></div>`);chat.scrollTop=chat.scrollHeight;}catch(e){chat.insertAdjacentHTML('beforeend',`<div class="assistant-message bot">Assistant unavailable: ${safeText(e.message)}</div>`);}}

// Extend existing navigation for the live GPS map.
const originalNavigateTo = navigateTo;
navigateTo = function(page) { originalNavigateTo(page); if(page==='ambulance') setTimeout(()=>{ if(ambulanceLeafletMap) ambulanceLeafletMap.invalidateSize(); else loadAmbulanceOptions().catch(()=>{}); },180); };

// Hook into the existing startup sequence without changing its other modules.
document.addEventListener('DOMContentLoaded', () => { setTimeout(() => setupPatientTools().catch(err => console.error('Patient modules:',err)), 2300); });
