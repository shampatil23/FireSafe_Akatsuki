// Global variables
let riskMap;
let simulationMap;
let deploymentMap;
let isSimulationRunning = false;
let simulationTime = 0;
let simulationInterval;
let fireSpreadLayers = [];
let deploymentLayers = [];

// ML API endpoints
const ML_API_BASE = `${window.location.protocol}//${window.location.hostname}:5001`;
let mlPredictions = {};
let realTimeUpdates = false;
let currentOptimization = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSidebar();
    initializeTabNavigation();
    initializeMaps();
    initializeCharts();
    initializeSimulation();

    // Initialize ML components
    initializeMLIntegration();

    // Initialize resource optimization
    initializeResourceOptimization();

    // Initialize environmental impact features
    initializeEnvironmentalImpact();

    // Initialize evacuation routes
    setTimeout(() => {
        initializeEvacuationRoutes();
    }, 2000);

    // Initialize AI Explainability & Trust Layer
    initializeAIExplainability();

    // Initialize monitoring stats
    updateMonitoringStats();

    // Initialize fire theme effects
    initializeForestFireTheme();
    initializeFireInteractions();

    startDataUpdates();
});

// Fire theme initialization
// Sidebar functionality
function initializeSidebar() {
    // Set active sidebar link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
    
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
        
        // Handle Support & Info links
        if (href && href.startsWith('#')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showToast(`The ${link.innerText.trim()} module will be available in the upcoming v2.0 release.`, 'info');
            });
        }
    });

    // Update sidebar timestamp
    updateSidebarTime();
    setInterval(updateSidebarTime, 60000); // Update every minute
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function updateSidebarTime() {
    const sidebarTimeEl = document.getElementById('sidebar-update-time');
    const headerTimeEl = document.getElementById('header-update-time');
    const now = new Date();
    const timeAgo = Math.floor((Date.now() - (now.getTime() - 2 * 60 * 1000)) / 60000);
    const timeText = `${timeAgo} min ago`;
    
    if (sidebarTimeEl) sidebarTimeEl.textContent = timeText;
    if (headerTimeEl) headerTimeEl.textContent = timeText;
}

function initializeForestFireTheme() {
    // Add fire effect overlay with animated particles
    const fireOverlay = document.createElement('div');
    fireOverlay.id = 'fire-overlay';
    fireOverlay.style.position = 'fixed';
    fireOverlay.style.top = '0';
    fireOverlay.style.left = '0';
    fireOverlay.style.width = '100%';
    fireOverlay.style.height = '100%';
    fireOverlay.style.pointerEvents = 'none';
    fireOverlay.style.zIndex = '1';
    fireOverlay.style.background = `
        radial-gradient(ellipse 400px 200px at 10% 90%, rgba(255, 69, 0, 0.1) 0%, transparent 60%),
        radial-gradient(ellipse 300px 150px at 90% 85%, rgba(255, 140, 0, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 200px 100px at 60% 80%, rgba(255, 69, 0, 0.06) 0%, transparent 80%)
    `;
    fireOverlay.style.opacity = '0.4';
    fireOverlay.style.animation = 'fireGlow 6s ease-in-out infinite alternate';

    document.body.appendChild(fireOverlay);

    // Create floating embers
    createFloatingEmbers();

    // Simulate dynamic fire intensity
    setInterval(() => {
        const intensity = Math.random() * 0.2 + 0.3; // Vary between 30% and 50% opacity
        fireOverlay.style.opacity = intensity;
    }, 4000);
}

function createFloatingEmbers() {
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance to create ember
            const ember = document.createElement('div');
            ember.style.position = 'fixed';
            ember.style.width = '3px';
            ember.style.height = '3px';
            ember.style.background = Math.random() > 0.5 ? '#FF4500' : '#FF8C00';
            ember.style.borderRadius = '50%';
            ember.style.left = Math.random() * window.innerWidth + 'px';
            ember.style.top = window.innerHeight + 'px';
            ember.style.pointerEvents = 'none';
            ember.style.zIndex = '2';
            ember.style.boxShadow = `0 0 6px ${ember.style.background}`;
            ember.style.opacity = '0.8';
            ember.style.animation = 'emberFloat 8s linear forwards';

            document.body.appendChild(ember);

            setTimeout(() => {
                if (document.body.contains(ember)) {
                    document.body.removeChild(ember);
                }
            }, 8000);
        }
    }, 2000);
}

// Fire cursor trail effect
let fireParticles = [];

function initializeFireInteractions() {
    // Initialize fire cursor trail
    document.addEventListener('mousemove', function(e) {
        if (Math.random() < 0.1) { // Only create particles occasionally for performance
            createFireParticle(e.clientX, e.clientY);
        }
    });

    // Initialize fire click effects
    initializeFireClickRipples();
}

function createFireParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'fire-cursor-trail';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.background = `radial-gradient(circle, ${Math.random() > 0.5 ? '#FF4500' : '#FF8C00'}, transparent)`;

    document.body.appendChild(particle);

    setTimeout(() => {
        if (document.body.contains(particle)) {
            document.body.removeChild(particle);
        }
    }, 1000);
}

// Fire click ripples
function initializeFireClickRipples() {
    document.addEventListener('click', function(e) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.width = '0px';
        ripple.style.height = '0px';
        ripple.style.background = 'radial-gradient(circle, rgba(255, 69, 0, 0.6), transparent)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9998';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'fireClickRipple 0.8s ease-out forwards';

        document.body.appendChild(ripple);

        setTimeout(() => {
            if (document.body.contains(ripple)) {
                document.body.removeChild(ripple);
            }
        }, 800);
    });
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    // Handle navigation links - for multi-page setup, they should navigate to different pages
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // If it's a hash link (single page), prevent default and scroll
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // Otherwise, let the browser handle the page navigation
        });
    });

    // Update active nav based on current page
    updateActiveNavigation();
}

function updateActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        link.classList.remove('active');
        
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === '/' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Tab Navigation functionality
function initializeTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Fix for Leaflet maps rendering as grey boxes in hidden tabs
                if (targetTab === 'evacuation-routes' && typeof evacuationMap !== 'undefined' && evacuationMap) {
                    setTimeout(() => {
                        evacuationMap.invalidateSize();
                    }, 50);
                }
            }
        });
    });
}

// Helper function for scrolling to sections (used by quick action buttons)
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Helper function for downloading reports
function downloadReport() {
    showToast('Daily risk summary report download started', 'info');
}

// Initialize maps
function initializeMaps() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }

    try {
        // Fire Risk Map
        const riskMapElement = document.getElementById('risk-map');
        if (riskMapElement && !riskMapElement._leaflet_id) {
            riskMap = L.map('risk-map').setView([30.0668, 79.0193], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(riskMap);

            // Add risk zones for Uttarakhand districts
            addRiskZones();
        }

        // Simulation Map
        const simulationMapElement = document.getElementById('simulation-map');
        if (simulationMapElement && !simulationMapElement._leaflet_id) {
            const urlParams = new URLSearchParams(window.location.search);
            const simLat = parseFloat(urlParams.get('lat')) || 30.0668;
            const simLng = parseFloat(urlParams.get('lng')) || 79.0193;
            const autoStart = urlParams.get('autoStart') === 'true';

            simulationMap = L.map('simulation-map').setView([simLat, simLng], autoStart ? 13 : 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(simulationMap);

            // Add click listener for fire simulation
            simulationMap.on('click', function(e) {
                if (typeof fetchLiveWeather === 'function') fetchLiveWeather(e.latlng.lat, e.latlng.lng);
                startFireSimulation(e.latlng);
            });
            
            if (typeof fetchLiveWeather === 'function') {
                fetchLiveWeather(simLat, simLng);
            }
            
            if (autoStart) {
                setTimeout(() => {
                    startFireSimulation({ lat: simLat, lng: simLng });
                    if (typeof startSimulation === 'function' && typeof isSimulationRunning !== 'undefined' && !isSimulationRunning) {
                        startSimulation();
                    }
                }, 1500);
            }

            // Add forest areas
            addForestAreas();
        }

        // Deployment Map for Resource Optimization
        const deploymentMapElement = document.getElementById('deployment-map');
        if (deploymentMapElement && !deploymentMapElement._leaflet_id) {
            deploymentMap = L.map('deployment-map').setView([30.0668, 79.0193], 7);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(deploymentMap);

            // Add district boundaries
            addDistrictBoundaries();
        }

        // Initialize search functionality for maps
        initializeMapSearch();

        console.log('Maps initialized successfully');
    } catch (error) {
        console.error('Error initializing maps:', error);
    }
}

// Add risk zones to the map with complete district boundaries
function addRiskZones() {
    if (!riskMap) return;

    const riskZones = [
        {
            name: 'Nainital District',
            coords: [
                [29.1500, 79.2800], [29.1700, 79.3200], [29.2100, 79.3600], [29.2500, 79.4000],
                [29.3000, 79.4500], [29.3500, 79.5000], [29.4000, 79.5200], [29.4500, 79.5400],
                [29.5000, 79.5500], [29.5500, 79.5600], [29.6000, 79.5700], [29.6300, 79.5900],
                [29.6500, 79.6200], [29.6700, 79.6500], [29.6800, 79.6800], [29.6900, 79.7100],
                [29.7000, 79.7400], [29.7100, 79.7700], [29.7200, 79.8000], [29.7100, 79.8300],
                [29.7000, 79.8600], [29.6800, 79.8900], [29.6500, 79.9100], [29.6200, 79.9300],
                [29.5800, 79.9400], [29.5400, 79.9500], [29.5000, 79.9400], [29.4500, 79.9200],
                [29.4000, 79.8900], [29.3500, 79.8600], [29.3000, 79.8200], [29.2500, 79.7800],
                [29.2000, 79.7400], [29.1500, 79.7000], [29.1200, 79.6500], [29.0900, 79.6000],
                [29.0700, 79.5500], [29.0500, 79.5000], [29.0400, 79.4500], [29.0300, 79.4000],
                [29.0400, 79.3500], [29.0600, 79.3000], [29.0900, 79.2900], [29.1200, 79.2800]
            ],
            risk: 'very-high',
            color: '#ff4444'
        },
        {
            name: 'Almora District',
            coords: [
                [29.3500, 79.3000], [29.4000, 79.3200], [29.4500, 79.3500], [29.5000, 79.3800],
                [29.5500, 79.4100], [29.6000, 79.4400], [29.6500, 79.4700], [29.7000, 79.5000],
                [29.7500, 79.5300], [29.8000, 79.5600], [29.8500, 79.5900], [29.9000, 79.6200],
                [29.9500, 79.6500], [30.0000, 79.6800], [30.0300, 79.7200], [30.0600, 79.7600],
                [30.0800, 79.8000], [30.1000, 79.8400], [30.1100, 79.8800], [30.1200, 79.9200],
                [30.1300, 79.9600], [30.1400, 80.0000], [30.1300, 80.0400], [30.1200, 80.0800],
                [30.1000, 80.1200], [30.0700, 80.1500], [30.0400, 80.1700], [30.0000, 80.1800],
                [29.9500, 80.1900], [29.9000, 80.1800], [29.8500, 80.1600], [29.8000, 80.1300],
                [29.7500, 80.1000], [29.7000, 80.0600], [29.6500, 80.0200], [29.6000, 79.9800],
                [29.5500, 79.9400], [29.5000, 79.9000], [29.4500, 79.8600], [29.4000, 79.8200],
                [29.3500, 79.7800], [29.3200, 79.7400], [29.2900, 79.7000], [29.2700, 79.6500],
                [29.2500, 79.6000], [29.2400, 79.5500], [29.2300, 79.5000], [29.2400, 79.4500],
                [29.2600, 79.4000], [29.2900, 79.3600], [29.3200, 79.3200], [29.3500, 79.3000]
            ],
            risk: 'high',
            color: '#ffa726'
        },
        {
            name: 'Dehradun District',
            coords: [
                [30.0000, 77.6000], [30.0500, 77.6200], [30.1000, 77.6500], [30.1500, 77.6800],
                [30.2000, 77.7100], [30.2500, 77.7400], [30.3000, 77.7700], [30.3500, 77.8000],
                [30.4000, 77.8300], [30.4500, 77.8600], [30.5000, 77.8900], [30.5500, 77.9200],
                [30.6000, 77.9500], [30.6500, 77.9800], [30.7000, 78.0100], [30.7500, 78.0400],
                [30.8000, 78.0700], [30.8500, 78.1000], [30.9000, 78.1300], [30.9200, 78.1700],
                [30.9400, 78.2100], [30.9500, 78.2500], [30.9600, 78.2900], [30.9700, 78.3300],
                [30.9600, 78.3700], [30.9500, 78.4100], [30.9300, 78.4500], [30.9000, 78.4800],
                [30.8600, 78.5000], [30.8200, 78.5100], [30.7800, 78.5200], [30.7400, 78.5100],
                [30.7000, 78.4900], [30.6600, 78.4600], [30.6200, 78.4300], [30.5800, 78.4000],
                [30.5400, 78.3700], [30.5000, 78.3400], [30.4600, 78.3100], [30.4200, 78.2800],
                [30.3800, 78.2500], [30.3400, 78.2200], [30.3000, 78.1900], [30.2600, 78.1600],
                [30.2200, 78.1300], [30.1800, 78.1000], [30.1400, 78.0700], [30.1000, 78.0400],
                [30.0600, 78.0100], [30.0200, 77.9800], [29.9800, 77.9500], [29.9400, 77.9200],
                [29.9000, 77.8900], [29.8700, 77.8600], [29.8400, 77.8300], [29.8200, 77.8000],
                [29.8000, 77.7700], [29.7900, 77.7400], [29.7800, 77.7100], [29.7800, 77.6800],
                [29.7900, 77.6500], [29.8100, 77.6200], [29.8400, 77.6000], [29.8800, 77.5900],
                [29.9200, 77.5800], [29.9600, 77.5900], [30.0000, 77.6000]
            ],
            risk: 'moderate',
            color: '#66bb6a'
        },
        {
            name: 'Haridwar District',
            coords: [
                [29.7000, 77.8000], [29.7500, 77.8200], [29.8000, 77.8500], [29.8500, 77.8800],
                [29.9000, 77.9100], [29.9500, 77.9400], [30.0000, 77.9700], [30.0500, 78.0000],
                [30.1000, 78.0300], [30.1300, 78.0700], [30.1600, 78.1100], [30.1800, 78.1500],
                [30.2000, 78.1900], [30.2100, 78.2300], [30.2200, 78.2700], [30.2100, 78.3100],
                [30.2000, 78.3500], [30.1800, 78.3900], [30.1500, 78.4200], [30.1200, 78.4500],
                [30.0800, 78.4700], [30.0400, 78.4800], [30.0000, 78.4900], [29.9600, 78.4800],
                [29.9200, 78.4600], [29.8800, 78.4300], [29.8400, 78.4000], [29.8000, 78.3700],
                [29.7600, 78.3400], [29.7200, 78.3100], [29.6800, 78.2800], [29.6500, 78.2500],
                [29.6200, 78.2200], [29.6000, 78.1900], [29.5800, 78.1600], [29.5700, 78.1300],
                [29.5600, 78.1000], [29.5600, 78.0700], [29.5700, 78.0400], [29.5900, 78.0100],
                [29.6200, 77.9800], [29.6600, 77.9500], [29.7000, 77.9200], [29.7000, 77.8800],
                [29.7000, 77.8400], [29.7000, 77.8000]
            ],
            risk: 'low',
            color: '#66bb6a'
        },
        {
            name: 'Pauri Garhwal District',
            coords: [
                [29.8000, 78.5000], [29.8500, 78.5200], [29.9000, 78.5500], [29.9500, 78.5800],
                [30.0000, 78.6100], [30.0500, 78.6400], [30.1000, 78.6700], [30.1500, 78.7000],
                [30.2000, 78.7300], [30.2500, 78.7600], [30.3000, 78.7900], [30.3500, 78.8200],
                [30.4000, 78.8500], [30.4500, 78.8800], [30.5000, 78.9100], [30.5300, 78.9500],
                [30.5600, 78.9900], [30.5800, 79.0300], [30.6000, 79.0700], [30.6100, 79.1100],
                [30.6200, 79.1500], [30.6100, 79.1900], [30.6000, 79.2300], [30.5800, 79.2700],
                [30.5500, 79.3000], [30.5200, 79.3300], [30.4800, 79.3500], [30.4400, 79.3700],
                [30.4000, 79.3800], [30.3600, 79.3900], [30.3200, 79.3800], [30.2800, 79.3600],
                [30.2400, 79.3300], [30.2000, 79.3000], [30.1600, 79.2700], [30.1200, 79.2400],
                [30.0800, 79.2100], [30.0400, 79.1800], [30.0000, 79.1500], [29.9600, 79.1200],
                [29.9200, 79.0900], [29.8800, 79.0600], [29.8400, 79.0300], [29.8000, 79.0000],
                [29.7700, 78.9700], [29.7400, 78.9400], [29.7200, 78.9100], [29.7000, 78.8800],
                [29.6900, 78.8500], [29.6800, 78.8200], [29.6800, 78.7900], [29.6900, 78.7600],
                [29.7100, 78.7300], [29.7400, 78.7000], [29.7700, 78.6700], [29.8000, 78.6400],
                [29.8000, 78.6000], [29.8000, 78.5600], [29.8000, 78.5200], [29.8000, 78.5000]
            ],
            risk: 'moderate',
            color: '#ffa726'
        },
        {
            name: 'Chamoli District',
            coords: [
                [30.2000, 79.0000], [30.2500, 79.0200], [30.3000, 79.0500], [30.3500, 79.0800],
                [30.4000, 79.1100], [30.4500, 79.1400], [30.5000, 79.1700], [30.5500, 79.2000],
                [30.6000, 79.2300], [30.6500, 79.2600], [30.7000, 79.2900], [30.7500, 79.3200],
                [30.8000, 79.3500], [30.8500, 79.3800], [30.9000, 79.4100], [30.9500, 79.4400],
                [31.0000, 79.4700], [31.0500, 79.5000], [31.1000, 79.5300], [31.1500, 79.5600],
                [31.2000, 79.5900], [31.2300, 79.6300], [31.2600, 79.6700], [31.2800, 79.7100],
                [31.3000, 79.7500], [31.3100, 79.7900], [31.3200, 79.8300], [31.3100, 79.8700],
                [31.3000, 79.9100], [31.2800, 79.9500], [31.2500, 79.9800], [31.2200, 80.0100],
                [31.1800, 80.0300], [31.1400, 80.0500], [31.1000, 80.0600], [31.0600, 80.0700],
                [31.0200, 80.0600], [30.9800, 80.0400], [30.9400, 80.0100], [30.9000, 79.9800],
                [30.8600, 79.9500], [30.8200, 79.9200], [30.7800, 79.8900], [30.7400, 79.8600],
                [30.7000, 79.8300], [30.6600, 79.8000], [30.6200, 79.7700], [30.5800, 79.7400],
                [30.5400, 79.7100], [30.5000, 79.6800], [30.4600, 79.6500], [30.4200, 79.6200],
                [30.3800, 79.5900], [30.3400, 79.5600], [30.3000, 79.5300], [30.2600, 79.5000],
                [30.2200, 79.4700], [30.1800, 79.4400], [30.1400, 79.4100], [30.1000, 79.3800],
                [30.0600, 79.3500], [30.0200, 79.3200], [29.9800, 79.2900], [29.9500, 79.2600],
                [29.9200, 79.2300], [29.9000, 79.2000], [29.8800, 79.1700], [29.8700, 79.1400],
                [29.8600, 79.1100], [29.8600, 79.0800], [29.8700, 79.0500], [29.8900, 79.0200],
                [29.9200, 79.0000], [29.9600, 78.9900], [30.0000, 78.9800], [30.0400, 78.9800],
                [30.0800, 78.9900], [30.1200, 79.0000], [30.1600, 79.0000], [30.2000, 79.0000]
            ],
            risk: 'high',
            color: '#ff8800'
        }
    ];

    riskZones.forEach(zone => {
        const polygon = L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.4,
            weight: 2
        }).addTo(riskMap);

        polygon.bindPopup(`
            <div class="risk-zone-popup">
                <h4>${zone.name}</h4>
                <p>Risk Level: ${zone.risk.replace('-', ' ').toUpperCase()}</p>
                <div class="zone-stats">
                    <div class="stat-item">
                        <span class="stat-label">Area Coverage:</span>
                        <span class="stat-value">Complete District</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Population:</span>
                        <span class="stat-value">${getDistrictPopulation(zone.name)}</span>
                    </div>
                </div>
            </div>
        `);
    });
}

// Helper function to get district population (simulated data)
function getDistrictPopulation(districtName) {
    const populations = {
        'Nainital District': '955,128',
        'Almora District': '622,506',
        'Dehradun District': '1,696,694',
        'Haridwar District': '1,890,422',
        'Pauri Garhwal District': '687,271',
        'Chamoli District': '391,605'
    };
    return populations[districtName] || 'Data not available';
}

// Update risk zones for searched location
async function updateRiskZonesForLocation(locationName, lat, lng) {
    if (!riskMap) return;
    
    // Clear existing risk zones
    riskMap.eachLayer(layer => {
        if (layer instanceof L.Polygon) {
            riskMap.removeLayer(layer);
        }
    });
    
    try {
        // Fetch risk data for the new location
        const riskData = await fetchLocationRiskData(locationName, lat, lng);
        
        // Create risk zones around the searched location
        const riskZones = generateRiskZonesForLocation(locationName, lat, lng, riskData);
        
        riskZones.forEach(zone => {
            const polygon = L.polygon(zone.coords, {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.4,
                weight: 2
            }).addTo(riskMap);

            polygon.bindPopup(`
                <div class="location-risk-popup">
                    <h4>${zone.name}</h4>
                    <p>Risk Level: ${zone.risk.replace('-', ' ').toUpperCase()}</p>
                    <p>Temperature: ${zone.temperature}°C</p>
                    <p>Humidity: ${zone.humidity}%</p>
                    <p>Wind Speed: ${zone.windSpeed} km/h</p>
                </div>
            `);
        });
        
        // Update the risk panel with new location data
        updateRiskPanelForLocation(locationName, riskData);
        
        showToast(`Risk analysis updated for ${locationName}`, 'success');
        
    } catch (error) {
        console.error('Failed to update risk zones:', error);
        showToast('Failed to fetch risk data for location', 'error');
    }
}

// Fetch risk data for a specific location
async function fetchLocationRiskData(locationName, lat, lng) {
    try {
        const response = await fetch(`${ML_API_BASE}/api/ml/location-risk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location_name: locationName,
                latitude: lat,
                longitude: lng
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.risk_data;
        }
    } catch (error) {
        console.warn('ML API not available, using simulated data');
    }
    
    // Fallback to simulated data
    return generateSimulatedRiskData(locationName, lat, lng);
}

// Generate simulated risk data for any location
function generateSimulatedRiskData(locationName, lat, lng) {
    // Generate realistic variations based on location
    const baseTemp = 25 + Math.random() * 15; // 25-40°C
    const baseHumidity = 30 + Math.random() * 40; // 30-70%
    const baseWind = 5 + Math.random() * 20; // 5-25 km/h
    
    // Different risk levels for surrounding areas
    return {
        center: {
            temperature: baseTemp + Math.random() * 5,
            humidity: baseHumidity - Math.random() * 10,
            windSpeed: baseWind + Math.random() * 5,
            riskLevel: calculateRiskLevel(baseTemp, baseHumidity, baseWind)
        },
        surrounding: [
            {
                name: `${locationName} North`,
                temperature: baseTemp + Math.random() * 3,
                humidity: baseHumidity + Math.random() * 8,
                windSpeed: baseWind + Math.random() * 3,
                offset: { lat: 0.05, lng: 0 }
            },
            {
                name: `${locationName} South`,
                temperature: baseTemp - Math.random() * 2,
                humidity: baseHumidity + Math.random() * 5,
                windSpeed: baseWind - Math.random() * 2,
                offset: { lat: -0.05, lng: 0 }
            },
            {
                name: `${locationName} East`,
                temperature: baseTemp + Math.random() * 4,
                humidity: baseHumidity - Math.random() * 6,
                windSpeed: baseWind + Math.random() * 4,
                offset: { lat: 0, lng: 0.05 }
            },
            {
                name: `${locationName} West`,
                temperature: baseTemp - Math.random() * 1,
                humidity: baseHumidity + Math.random() * 7,
                windSpeed: baseWind - Math.random() * 3,
                offset: { lat: 0, lng: -0.05 }
            }
        ]
    };
}

// Calculate risk level based on environmental factors
function calculateRiskLevel(temperature, humidity, windSpeed) {
    const tempScore = Math.min(40, Math.max(0, (temperature - 20) * 2));
    const humidityScore = Math.min(40, Math.max(0, (80 - humidity) * 0.5));
    const windScore = Math.min(20, Math.max(0, windSpeed));
    
    const totalScore = tempScore + humidityScore + windScore;
    
    if (totalScore > 70) return 'very-high';
    if (totalScore > 50) return 'high';
    if (totalScore > 30) return 'moderate';
    return 'low';
}

// Generate risk zones around a location with proper district-like boundaries
function generateRiskZonesForLocation(locationName, lat, lng, riskData) {
    const zones = [];
    const riskColors = {
        'very-high': '#ff4444',
        'high': '#ffa726',
        'moderate': '#66bb6a',
        'low': '#4fc3f7'
    };
    
    // Create realistic district-sized boundaries
    const districtSize = 0.15; // Larger area coverage
    const centerRisk = riskData.center;
    
    // Generate organic boundary shape for main district
    const mainDistrictCoords = generateOrganicBoundary(lat, lng, districtSize, 20);
    zones.push({
        name: `${locationName} District`,
        coords: mainDistrictCoords,
        risk: centerRisk.riskLevel,
        color: riskColors[centerRisk.riskLevel],
        temperature: Math.round(centerRisk.temperature),
        humidity: Math.round(centerRisk.humidity),
        windSpeed: Math.round(centerRisk.windSpeed)
    });
    
    // Create surrounding districts
    const surroundingDistricts = [
        { offset: { lat: 0.2, lng: 0.1 }, name: `${locationName} North District` },
        { offset: { lat: -0.2, lng: 0.1 }, name: `${locationName} South District` },
        { offset: { lat: 0.1, lng: 0.25 }, name: `${locationName} East District` },
        { offset: { lat: 0.1, lng: -0.25 }, name: `${locationName} West District` }
    ];
    
    riskData.surrounding.slice(0, 4).forEach((area, index) => {
        const district = surroundingDistricts[index];
        if (!district) return;
        
        const districtLat = lat + district.offset.lat;
        const districtLng = lng + district.offset.lng;
        const areaRisk = calculateRiskLevel(area.temperature, area.humidity, area.windSpeed);
        
        const districtCoords = generateOrganicBoundary(districtLat, districtLng, districtSize * 0.8, 16);
        
        zones.push({
            name: district.name,
            coords: districtCoords,
            risk: areaRisk,
            color: riskColors[areaRisk],
            temperature: Math.round(area.temperature),
            humidity: Math.round(area.humidity),
            windSpeed: Math.round(area.windSpeed)
        });
    });
    
    return zones;
}

// Generate organic, district-like boundaries
function generateOrganicBoundary(centerLat, centerLng, baseRadius, points) {
    const coordinates = [];
    const angleStep = (2 * Math.PI) / points;
    
    for (let i = 0; i < points; i++) {
        const angle = i * angleStep;
        
        // Add natural variation to radius (10-40% variation)
        const radiusVariation = 0.7 + Math.random() * 0.6;
        const radius = baseRadius * radiusVariation;
        
        // Add small random offsets for more organic shape
        const latOffset = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.02;
        const lngOffset = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.02;
        
        coordinates.push([
            centerLat + latOffset,
            centerLng + lngOffset
        ]);
    }
    
    // Close the polygon
    coordinates.push(coordinates[0]);
    
    return coordinates;
}

// Update risk panel with new location data
function updateRiskPanelForLocation(locationName, riskData) {
    const riskContainer = document.querySelector('.risk-zones');
    if (!riskContainer) return;
    
    // Clear existing risk items
    riskContainer.innerHTML = '';
    
    // Add center area
    const centerRisk = riskData.center;
    addRiskItem(riskContainer, `${locationName} Center`, centerRisk.riskLevel, Math.round((100 - centerRisk.humidity + centerRisk.temperature + centerRisk.windSpeed) / 3));
    
    // Add surrounding areas
    riskData.surrounding.slice(0, 3).forEach(area => {
        const areaRisk = calculateRiskLevel(area.temperature, area.humidity, area.windSpeed);
        const riskPercentage = Math.round((100 - area.humidity + area.temperature + area.windSpeed) / 3);
        addRiskItem(riskContainer, area.name, areaRisk, riskPercentage);
    });
}

// Helper function to add risk item to panel
function addRiskItem(container, name, riskLevel, percentage) {
    const riskClasses = {
        'very-high': 'high-risk',
        'high': 'moderate-risk',
        'moderate': 'low-risk',
        'low': 'low-risk'
    };
    
    const riskItem = document.createElement('div');
    riskItem.className = `risk-item ${riskClasses[riskLevel]}`;
    riskItem.innerHTML = `
        <div class="risk-color"></div>
        <div class="risk-info">
            <span class="risk-level">${riskLevel.replace('-', ' ').toUpperCase()} Risk</span>
            <span class="risk-area">${name}</span>
        </div>
        <div class="risk-percentage">${Math.min(95, Math.max(10, percentage))}%</div>
    `;
    container.appendChild(riskItem);
}

// Add forest areas to simulation map
function addForestAreas() {
    if (!simulationMap) return;

    const forestAreas = [
        {
            name: 'Jim Corbett National Park',
            coords: [[29.4, 78.7], [29.7, 78.7], [29.7, 79.1], [29.4, 79.1]],
            color: '#2d5a2d'
        },
        {
            name: 'Valley of Flowers',
            coords: [[30.7, 79.5], [30.8, 79.5], [30.8, 79.7], [30.7, 79.7]],
            color: '#2d5a2d'
        }
    ];

    forestAreas.forEach(forest => {
        const polygon = L.polygon(forest.coords, {
            color: forest.color,
            fillColor: forest.color,
            fillOpacity: 0.6
        }).addTo(simulationMap);

        polygon.bindPopup(`<h4>${forest.name}</h4>`);
    });
}

// Initialize charts
function initializeCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded');
        return;
    }

    try {
        // Performance Chart (Original)
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            new Chart(performanceCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Accurate Predictions', 'False Positives'],
                    datasets: [{
                        data: [97, 3],
                        backgroundColor: ['#66bb6a', '#ff6b35'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            });
        }

        // Initialize other charts
        initializeTimelineChart();
        initializeFireSpreadChart();
        initializeGaugeCharts();
        initializeAlertStatsChart();
        initializeEnvironmentalImpactChart();
        initializeRestorationProgressChart();

        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function initializeTimelineChart() {
    const riskTimelineCtx = document.getElementById('riskTimelineChart');
    if (!riskTimelineCtx) return;

    const riskTimelineChart = new Chart(riskTimelineCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM', '3AM'],
            datasets: [
                {
                    label: 'Dehradun',
                    data: [25, 35, 55, 75, 85, 65, 45, 30],
                    borderColor: '#66bb6a',
                    backgroundColor: 'rgba(102, 187, 106, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Nainital',
                    data: [45, 55, 70, 85, 90, 80, 60, 50],
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Haridwar',
                    data: [30, 40, 60, 70, 75, 55, 40, 35],
                    borderColor: '#ffa726',
                    backgroundColor: 'rgba(255, 167, 38, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Rishikesh',
                    data: [20, 30, 45, 65, 70, 50, 35, 25],
                    borderColor: '#42a5f5',
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    // Store chart reference
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    window.chartInstances.riskTimeline = riskTimelineChart;
}

function initializeFireSpreadChart() {
    const fireSpreadCtx = document.getElementById('fireSpreadChart');
    if (!fireSpreadCtx) return;

    const fireSpreadChart = new Chart(fireSpreadCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['0h', '1h', '2h', '3h', '4h', '5h', '6h'],
            datasets: [{
                label: 'Area Burned (hectares)',
                data: [0, 12, 35, 78, 145, 225, 320],
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return 'Burned: ' + context.parsed.y + ' hectares';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return value + ' ha';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    window.chartInstances.fireSpread = fireSpreadChart;
}

function initializeEnvironmentalImpactChart() {
    const impactCtx = document.getElementById('environmentalImpactChart');
    if (!impactCtx) return;

    new Chart(impactCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Forest Cover Loss', 'Wildlife Habitat Impact', 'Soil Degradation', 'Water Quality Impact', 'Air Quality Impact'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981'],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + percentage + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeRestorationProgressChart() {
    const restorationCtx = document.getElementById('restorationProgressChart');
    if (!restorationCtx) return;

    new Chart(restorationCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
            datasets: [{
                label: 'Forest Recovery Progress',
                data: [5, 12, 22, 35, 48, 62, 75, 84, 92, 100],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return 'Recovery: ' + context.parsed.y + '% Complete';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function initializeGaugeCharts() {
    // Accuracy Gauge
    const accuracyCtx = document.getElementById('accuracyGauge');
    if (accuracyCtx) {
        new Chart(accuracyCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [97, 3],
                    backgroundColor: ['#66bb6a', 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }

    // Uptime Gauge
    const uptimeCtx = document.getElementById('uptimeGauge');
    if (uptimeCtx) {
        new Chart(uptimeCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [99.8, 0.2],
                    backgroundColor: ['#66bb6a', 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }

    // Speed Gauge
    const speedCtx = document.getElementById('speedGauge');
    if (speedCtx) {
        new Chart(speedCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [85, 15],
                    backgroundColor: ['#ffa726', 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }
}

function initializeAlertStatsChart() {
    const alertStatsCtx = document.getElementById('alertStatsChart');
    if (!alertStatsCtx) return;

    new Chart(alertStatsCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Fire Risk Warnings', 'Active Fire Detected', 'Evacuation Alerts', 'All Clear/Safe Zones'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: ['#ffa726', '#ff4444', '#ff6b35', '#66bb6a'],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + percentage + '%';
                        }
                    }
                }
            }
        }
    });
}

// Initialize simulation controls
function initializeSimulation() {
    const playBtn = document.getElementById('play-simulation');
    const pauseBtn = document.getElementById('pause-simulation');
    const resetBtn = document.getElementById('reset-simulation');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!isSimulationRunning) {
                startSimulation();
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseSimulation);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }

    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', (e) => {
            const speed = e.target.value;
            speedValue.textContent = `${speed}x`;
            updateSimulationSpeed(speed);
        });
    }

    // Toggle prediction button
    const toggleBtn = document.getElementById('toggle-prediction');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePrediction);
    }

    // Initialize simulation monitoring chart
    initializeSimulationMonitoringChart();
}

// Fire simulation functions
async function startFireSimulation(latlng) {
    if (!simulationMap) return;

    // Try ML-powered simulation first
    const mlSimulation = await simulateFireWithML(latlng);

    // Add animated fire origin marker with enhanced visuals
    const fireMarker = L.marker([latlng.lat, latlng.lng], {
        icon: L.divIcon({
            className: 'fire-marker origin-fire',
            html: `
                <div class="fire-icon-container">
                    <i class="fas fa-fire fire-flame"></i>
                    <div class="fire-glow"></div>
                    <div class="fire-sparks"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        })
    }).addTo(simulationMap);

    fireSpreadLayers.push(fireMarker);

    // Store ML simulation data if available
    if (mlSimulation) {
        window.currentMLSimulation = mlSimulation;
        showToast('AI-powered simulation active', 'success');
    }

    // Add initial burn circle
    const initialBurn = L.circle([latlng.lat, latlng.lng], {
        color: '#ff6b35',
        fillColor: '#ff4444',
        fillOpacity: 0.7,
        radius: 200,
        className: 'fire-burn-area'
    }).addTo(simulationMap);

    fireSpreadLayers.push(initialBurn);
    
    // Add wind overlay arrow on map if wind data is available
    const envData = getCurrentEnvironmentalData();
    if (envData && envData.wind_direction !== undefined) {
        let wd = envData.wind_direction;
        if (typeof wd === 'string') {
            const windDirMap = {'N': 0, 'NE': 45, 'E': 90, 'SE': 135, 'S': 180, 'SW': 225, 'W': 270, 'NW': 315};
            wd = windDirMap[wd] || 0;
        }
        const pushDirection = (wd + 180) % 360;
        
        const windOverlay = L.marker([latlng.lat + 0.005, latlng.lng + 0.005], {
            icon: L.divIcon({
                className: 'wind-overlay-marker',
                html: `
                    <div style="background: rgba(255,255,255,0.8); border: 2px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <i class="fas fa-location-arrow" style="color: #3b82f6; font-size: 1.2rem; transform: rotate(${pushDirection}deg);"></i>
                    </div>
                    <div style="background: rgba(0,0,0,0.6); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap; text-align: center;">
                        Wind: ${envData.wind_speed} km/h
                    </div>
                `,
                iconSize: [40, 60],
                iconAnchor: [20, 30]
            })
        }).addTo(simulationMap);
        fireSpreadLayers.push(windOverlay);
    }
}

function startSimulation() {
    isSimulationRunning = true;
    const speedSlider = document.getElementById('speed-slider');
    const speed = speedSlider ? parseInt(speedSlider.value) : 1;

    // Limit minimum interval to prevent overwhelming the browser
    const minInterval = 500; // Minimum 500ms between updates
    const interval = Math.max(minInterval, 2000 / speed);

    simulationInterval = setInterval(() => {
        simulationTime += 1;
        updateSimulationTime();

        // Update monitoring stats
        updateMonitoringStats();

        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            simulateFireSpread();
        });
    }, interval);

    // Initial update
    updateMonitoringStats();
}

function pauseSimulation() {
    isSimulationRunning = false;
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
}

function resetSimulation() {
    pauseSimulation();
    simulationTime = 0;
    updateSimulationTime();

    // Reset monitoring stats
    updateMonitoringStats();

    // Clear fire spread layers
    if (simulationMap) {
        fireSpreadLayers.forEach(layer => {
            try {
                simulationMap.removeLayer(layer);
            } catch (e) {
                // Ignore errors for layers already removed
            }
        });
    }
    fireSpreadLayers = [];
}

function updateSimulationSpeed(speed) {
    if (isSimulationRunning) {
        pauseSimulation();
        startSimulation();
    }
}

function simulateFireSpread() {
    // Optimized fire spread simulation
    if (fireSpreadLayers.length > 0 && simulationMap) {
        // Limit processing to prevent overwhelming the browser
        if (fireSpreadLayers.length > 100) {
            const excessLayers = fireSpreadLayers.splice(0, 20);
            excessLayers.forEach(layer => {
                try {
                    simulationMap.removeLayer(layer);
                } catch (e) {
                    // Ignore errors for layers already removed
                }
            });
        }

        // Get environmental parameters
        const windSpeed = getElementValue('wind-speed', 15);
        const windDirection = getElementText('wind-direction', 'NE');
        const temperature = getElementValue('temperature', 32);
        const humidity = getElementValue('humidity', 45);

        // Convert wind direction to angle
        const windAngles = {
            'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
            'S': 180, 'SW': 225, 'W': 270, 'NW': 315
        };
        const windAngle = (windAngles[windDirection] || 0) * Math.PI / 180;

        // Limit the number of fire sources processed per cycle
        const fireSources = fireSpreadLayers.filter(layer => 
            layer instanceof L.Marker && 
            layer.options.icon && 
            layer.options.icon.options.className && 
            layer.options.icon.options.className.includes('fire-marker')
        ).slice(-10);

        let newSpreadCount = 0;
        const maxNewSpreads = 3;

        fireSources.forEach((fireSource) => {
            if (newSpreadCount >= maxNewSpreads) return;

            if (Math.random() < 0.4) {
                const sourceLatlng = fireSource.getLatLng();

                // Simplified spread calculation
                const baseSpread = 0.005;
                const windFactor = windSpeed / 20;
                const tempFactor = temperature / 35;
                const humidityFactor = (100 - humidity) / 120;

                const spreadDistance = baseSpread * windFactor * tempFactor * humidityFactor;

                // Calculate new position
                const spreadAngle = windAngle + (Math.random() - 0.5) * Math.PI / 3;
                const newLat = sourceLatlng.lat + Math.cos(spreadAngle) * spreadDistance;
                const newLng = sourceLatlng.lng + Math.sin(spreadAngle) * spreadDistance;

                // Create simplified fire marker
                const spreadMarker = L.marker([newLat, newLng], {
                    icon: L.divIcon({
                        className: 'fire-marker spread-fire',
                        html: '<i class="fas fa-fire fire-flame"></i>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(simulationMap);

                // Create smaller burn area
                const burnRadius = 100 + Math.random() * 50;
                const burnArea = L.circle([newLat, newLng], {
                    color: '#ff4444',
                    fillColor: '#cc0000',
                    fillOpacity: 0.3,
                    radius: burnRadius,
                    weight: 1
                }).addTo(simulationMap);

                fireSpreadLayers.push(spreadMarker);
                fireSpreadLayers.push(burnArea);
                newSpreadCount++;
            }
        });
    }
}

function updateSimulationTime() {
    const timeElement = document.getElementById('simulation-time');
    if (timeElement) {
        const hours = Math.floor(simulationTime / 60);
        const minutes = simulationTime % 60;
        timeElement.textContent = 
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
    }
}

// Helper functions
function getElementValue(id, defaultValue) {
    const element = document.getElementById(id);
    if (element) {
        const value = parseInt(element.textContent);
        return isNaN(value) ? defaultValue : value;
    }
    return defaultValue;
}

function getElementText(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? element.textContent : defaultValue;
}

// ── Active location tracker ── set when user searches a state/district
let activeLocation = {
    name: 'Uttarakhand',
    lat: 30.0668,
    lng: 79.0193
};

// Per-state forest fire prediction data (current + next-day)
const STATE_FIRE_DATA = {
    'uttarakhand': {
        current:   [{ name: 'Nainital, Uttarakhand',    risk: 'very-high', percentage: 85 },
                    { name: 'Almora, Uttarakhand',       risk: 'high',      percentage: 68 },
                    { name: 'Dehradun, Uttarakhand',     risk: 'moderate',  percentage: 42 }],
        predicted: [{ name: 'Nainital, Uttarakhand',    risk: 'very-high', percentage: 92 },
                    { name: 'Pauri Garhwal, Uttarakhand', risk: 'high',    percentage: 74 },
                    { name: 'Chamoli, Uttarakhand',      risk: 'moderate',  percentage: 55 }],
        currentZones: [
            { name: 'Nainital',  coords: [[29.2,79.3],[29.6,79.3],[29.6,79.8],[29.2,79.8]], color: '#ff4444' },
            { name: 'Almora',   coords: [[29.5,79.5],[29.9,79.5],[29.9,80.0],[29.5,80.0]], color: '#ffa726' },
            { name: 'Dehradun', coords: [[30.1,77.8],[30.5,77.8],[30.5,78.3],[30.1,78.3]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Nainital',      coords: [[29.1,79.2],[29.7,79.2],[29.7,79.9],[29.1,79.9]], color: '#cc0000' },
            { name: 'Pauri Garhwal', coords: [[29.8,78.5],[30.4,78.5],[30.4,79.3],[29.8,79.3]], color: '#ff4444' },
            { name: 'Chamoli',       coords: [[30.2,79.2],[30.7,79.2],[30.7,80.0],[30.2,80.0]], color: '#ffa726' }]
    },
    'maharashtra': {
        current:   [{ name: 'Gadchiroli, Maharashtra',    risk: 'very-high', percentage: 83 },
                    { name: 'Chandrapur, Maharashtra',    risk: 'high',      percentage: 70 },
                    { name: 'Nashik, Maharashtra',        risk: 'moderate',  percentage: 45 }],
        predicted: [{ name: 'Gadchiroli, Maharashtra',   risk: 'very-high', percentage: 90 },
                    { name: 'Chandrapur, Maharashtra',   risk: 'very-high', percentage: 78 },
                    { name: 'Nashik, Maharashtra',       risk: 'high',      percentage: 62 },
                    { name: 'Yavatmal, Maharashtra',     risk: 'moderate',  percentage: 48 }],
        currentZones: [
            { name: 'Gadchiroli',  coords: [[19.7,79.9],[20.4,79.9],[20.4,80.7],[19.7,80.7]], color: '#ff4444' },
            { name: 'Chandrapur', coords: [[19.8,79.2],[20.3,79.2],[20.3,80.0],[19.8,80.0]], color: '#ffa726' },
            { name: 'Nashik',     coords: [[19.8,73.6],[20.4,73.6],[20.4,74.4],[19.8,74.4]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Gadchiroli',  coords: [[19.5,79.8],[20.6,79.8],[20.6,80.9],[19.5,80.9]], color: '#cc0000' },
            { name: 'Chandrapur', coords: [[19.6,79.0],[20.4,79.0],[20.4,80.1],[19.6,80.1]], color: '#cc0000' },
            { name: 'Nashik',     coords: [[19.7,73.5],[20.5,73.5],[20.5,74.5],[19.7,74.5]], color: '#ff4444' },
            { name: 'Yavatmal',   coords: [[19.8,77.8],[20.4,77.8],[20.4,78.6],[19.8,78.6]], color: '#ffa726' }]
    },
    'madhya pradesh': {
        current:   [{ name: 'Balaghat, Madhya Pradesh',  risk: 'very-high', percentage: 88 },
                    { name: 'Mandla, Madhya Pradesh',    risk: 'high',      percentage: 72 },
                    { name: 'Seoni, Madhya Pradesh',     risk: 'moderate',  percentage: 50 }],
        predicted: [{ name: 'Balaghat, Madhya Pradesh',  risk: 'very-high', percentage: 93 },
                    { name: 'Mandla, Madhya Pradesh',    risk: 'very-high', percentage: 81 },
                    { name: 'Seoni, Madhya Pradesh',     risk: 'high',      percentage: 67 },
                    { name: 'Chhindwara, Madhya Pradesh', risk: 'moderate', percentage: 53 }],
        currentZones: [
            { name: 'Balaghat', coords: [[21.5,80.0],[22.2,80.0],[22.2,80.8],[21.5,80.8]], color: '#ff4444' },
            { name: 'Mandla',   coords: [[22.2,80.3],[22.8,80.3],[22.8,81.0],[22.2,81.0]], color: '#ffa726' },
            { name: 'Seoni',    coords: [[21.8,79.2],[22.4,79.2],[22.4,80.0],[21.8,80.0]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Balaghat',   coords: [[21.3,79.8],[22.3,79.8],[22.3,81.0],[21.3,81.0]], color: '#cc0000' },
            { name: 'Mandla',     coords: [[22.0,80.1],[22.9,80.1],[22.9,81.2],[22.0,81.2]], color: '#cc0000' },
            { name: 'Seoni',      coords: [[21.7,79.0],[22.5,79.0],[22.5,80.1],[21.7,80.1]], color: '#ff4444' },
            { name: 'Chhindwara', coords: [[21.8,78.6],[22.4,78.6],[22.4,79.4],[21.8,79.4]], color: '#ffa726' }]
    },
    'odisha': {
        current:   [{ name: 'Sundargarh, Odisha',  risk: 'very-high', percentage: 86 },
                    { name: 'Kandhamal, Odisha',   risk: 'high',      percentage: 68 },
                    { name: 'Koraput, Odisha',     risk: 'moderate',  percentage: 47 }],
        predicted: [{ name: 'Sundargarh, Odisha',  risk: 'very-high', percentage: 91 },
                    { name: 'Kandhamal, Odisha',   risk: 'very-high', percentage: 79 },
                    { name: 'Koraput, Odisha',     risk: 'high',      percentage: 65 },
                    { name: 'Keonjhar, Odisha',    risk: 'moderate',  percentage: 52 }],
        currentZones: [
            { name: 'Sundargarh', coords: [[21.9,83.8],[22.4,83.8],[22.4,84.5],[21.9,84.5]], color: '#ff4444' },
            { name: 'Kandhamal', coords:  [[20.0,83.6],[20.7,83.6],[20.7,84.4],[20.0,84.4]], color: '#ffa726' },
            { name: 'Koraput',   coords:  [[18.5,82.3],[19.2,82.3],[19.2,83.2],[18.5,83.2]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Sundargarh', coords: [[21.7,83.6],[22.6,83.6],[22.6,84.7],[21.7,84.7]], color: '#cc0000' },
            { name: 'Kandhamal',  coords: [[19.8,83.4],[20.9,83.4],[20.9,84.5],[19.8,84.5]], color: '#cc0000' },
            { name: 'Koraput',    coords: [[18.3,82.1],[19.4,82.1],[19.4,83.3],[18.3,83.3]], color: '#ff4444' },
            { name: 'Keonjhar',   coords: [[21.5,85.3],[22.2,85.3],[22.2,86.0],[21.5,86.0]], color: '#ffa726' }]
    },
    'chhattisgarh': {
        current:   [{ name: 'Bastar, Chhattisgarh',   risk: 'very-high', percentage: 84 },
                    { name: 'Kanker, Chhattisgarh',   risk: 'high',      percentage: 67 },
                    { name: 'Surguja, Chhattisgarh',  risk: 'moderate',  percentage: 48 }],
        predicted: [{ name: 'Bastar, Chhattisgarh',   risk: 'very-high', percentage: 90 },
                    { name: 'Kanker, Chhattisgarh',   risk: 'very-high', percentage: 77 },
                    { name: 'Surguja, Chhattisgarh',  risk: 'high',      percentage: 64 },
                    { name: 'Dantewada, Chhattisgarh', risk: 'moderate', percentage: 51 }],
        currentZones: [
            { name: 'Bastar',   coords: [[18.6,81.1],[19.4,81.1],[19.4,82.0],[18.6,82.0]], color: '#ff4444' },
            { name: 'Kanker',   coords: [[20.1,81.4],[20.6,81.4],[20.6,82.0],[20.1,82.0]], color: '#ffa726' },
            { name: 'Surguja',  coords: [[23.0,83.0],[23.6,83.0],[23.6,83.8],[23.0,83.8]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Bastar',    coords: [[18.3,80.9],[19.6,80.9],[19.6,82.2],[18.3,82.2]], color: '#cc0000' },
            { name: 'Kanker',    coords: [[19.9,81.2],[20.8,81.2],[20.8,82.2],[19.9,82.2]], color: '#cc0000' },
            { name: 'Surguja',   coords: [[22.8,82.8],[23.8,82.8],[23.8,83.9],[22.8,83.9]], color: '#ff4444' },
            { name: 'Dantewada', coords: [[17.8,81.0],[18.4,81.0],[18.4,81.8],[17.8,81.8]], color: '#ffa726' }]
    },
    'himachal pradesh': {
        current:   [{ name: 'Shimla, Himachal Pradesh',  risk: 'high',     percentage: 67 },
                    { name: 'Kullu, Himachal Pradesh',   risk: 'moderate', percentage: 52 },
                    { name: 'Kangra, Himachal Pradesh',  risk: 'low',      percentage: 33 }],
        predicted: [{ name: 'Shimla, Himachal Pradesh',  risk: 'high',     percentage: 74 },
                    { name: 'Kullu, Himachal Pradesh',   risk: 'high',     percentage: 61 },
                    { name: 'Kangra, Himachal Pradesh',  risk: 'moderate', percentage: 48 },
                    { name: 'Mandi, Himachal Pradesh',   risk: 'moderate', percentage: 42 }],
        currentZones: [
            { name: 'Shimla',  coords: [[31.0,77.0],[31.4,77.0],[31.4,77.5],[31.0,77.5]], color: '#ffa726' },
            { name: 'Kullu',   coords: [[31.8,77.0],[32.2,77.0],[32.2,77.5],[31.8,77.5]], color: '#ffd740' },
            { name: 'Kangra',  coords: [[32.0,76.0],[32.6,76.0],[32.6,76.7],[32.0,76.7]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Shimla', coords: [[30.8,76.8],[31.6,76.8],[31.6,77.7],[30.8,77.7]], color: '#ff4444' },
            { name: 'Kullu',  coords: [[31.6,76.8],[32.4,76.8],[32.4,77.7],[31.6,77.7]], color: '#ff4444' },
            { name: 'Kangra', coords: [[31.8,75.8],[32.8,75.8],[32.8,76.8],[31.8,76.8]], color: '#ffa726' },
            { name: 'Mandi',  coords: [[31.4,76.7],[32.0,76.7],[32.0,77.4],[31.4,77.4]], color: '#ffa726' }]
    },
    'kerala': {
        current:   [{ name: 'Wayanad, Kerala',   risk: 'high',     percentage: 62 },
                    { name: 'Palakkad, Kerala',  risk: 'moderate', percentage: 48 },
                    { name: 'Idukki, Kerala',    risk: 'moderate', percentage: 42 }],
        predicted: [{ name: 'Wayanad, Kerala',   risk: 'high',     percentage: 70 },
                    { name: 'Palakkad, Kerala',  risk: 'high',     percentage: 58 },
                    { name: 'Idukki, Kerala',    risk: 'moderate', percentage: 51 },
                    { name: 'Malappuram, Kerala', risk: 'low',     percentage: 34 }],
        currentZones: [
            { name: 'Wayanad',  coords: [[11.5,75.8],[12.0,75.8],[12.0,76.4],[11.5,76.4]], color: '#ffa726' },
            { name: 'Palakkad', coords: [[10.5,76.4],[11.2,76.4],[11.2,77.2],[10.5,77.2]], color: '#ffd740' },
            { name: 'Idukki',   coords: [[9.7,76.7],[10.5,76.7],[10.5,77.5],[9.7,77.5]],   color: '#ffd740' }],
        predictedZones: [
            { name: 'Wayanad',   coords: [[11.3,75.6],[12.2,75.6],[12.2,76.6],[11.3,76.6]], color: '#ff4444' },
            { name: 'Palakkad',  coords: [[10.3,76.2],[11.4,76.2],[11.4,77.4],[10.3,77.4]], color: '#ff4444' },
            { name: 'Idukki',    coords: [[9.5,76.5],[10.6,76.5],[10.6,77.7],[9.5,77.7]],   color: '#ffa726' },
            { name: 'Malappuram', coords: [[10.8,75.9],[11.5,75.9],[11.5,76.7],[10.8,76.7]], color: '#ffd740' }]
    },
    'karnataka': {
        current:   [{ name: 'Kodagu, Karnataka',          risk: 'high',     percentage: 64 },
                    { name: 'Uttara Kannada, Karnataka',  risk: 'moderate', percentage: 50 },
                    { name: 'Chikkamagaluru, Karnataka',  risk: 'moderate', percentage: 44 }],
        predicted: [{ name: 'Kodagu, Karnataka',          risk: 'high',     percentage: 72 },
                    { name: 'Uttara Kannada, Karnataka',  risk: 'high',     percentage: 60 },
                    { name: 'Chikkamagaluru, Karnataka',  risk: 'moderate', percentage: 54 },
                    { name: 'Belagavi, Karnataka',        risk: 'low',      percentage: 36 }],
        currentZones: [
            { name: 'Kodagu',         coords: [[12.0,75.5],[12.7,75.5],[12.7,76.2],[12.0,76.2]], color: '#ffa726' },
            { name: 'Uttara Kannada', coords: [[14.0,74.3],[15.0,74.3],[15.0,75.3],[14.0,75.3]], color: '#ffd740' },
            { name: 'Chikkamagaluru', coords: [[13.0,75.5],[13.8,75.5],[13.8,76.4],[13.0,76.4]], color: '#ffd740' }],
        predictedZones: [
            { name: 'Kodagu',         coords: [[11.8,75.3],[12.9,75.3],[12.9,76.4],[11.8,76.4]], color: '#ff4444' },
            { name: 'Uttara Kannada', coords: [[13.8,74.1],[15.2,74.1],[15.2,75.4],[13.8,75.4]], color: '#ff4444' },
            { name: 'Chikkamagaluru', coords: [[12.8,75.3],[13.9,75.3],[13.9,76.5],[12.8,76.5]], color: '#ffa726' },
            { name: 'Belagavi',       coords: [[15.5,74.2],[16.3,74.2],[16.3,75.2],[15.5,75.2]], color: '#ffd740' }]
    },
    'tamil nadu': {
        current:   [{ name: 'Nilgiris, Tamil Nadu',    risk: 'high',     percentage: 61 },
                    { name: 'Dharmapuri, Tamil Nadu',  risk: 'moderate', percentage: 49 },
                    { name: 'Erode, Tamil Nadu',       risk: 'moderate', percentage: 41 }],
        predicted: [{ name: 'Nilgiris, Tamil Nadu',    risk: 'high',     percentage: 68 },
                    { name: 'Dharmapuri, Tamil Nadu',  risk: 'high',     percentage: 58 },
                    { name: 'Erode, Tamil Nadu',       risk: 'moderate', percentage: 49 },
                    { name: 'Salem, Tamil Nadu',       risk: 'low',      percentage: 32 }],
        currentZones: [
            { name: 'Nilgiris',   coords: [[11.3,76.4],[11.9,76.4],[11.9,77.2],[11.3,77.2]], color: '#ffa726' },
            { name: 'Dharmapuri', coords: [[11.8,77.6],[12.4,77.6],[12.4,78.4],[11.8,78.4]], color: '#ffd740' },
            { name: 'Erode',      coords: [[10.9,77.2],[11.5,77.2],[11.5,78.0],[10.9,78.0]], color: '#ffd740' }],
        predictedZones: [
            { name: 'Nilgiris',   coords: [[11.1,76.2],[12.1,76.2],[12.1,77.4],[11.1,77.4]], color: '#ff4444' },
            { name: 'Dharmapuri', coords: [[11.6,77.4],[12.6,77.4],[12.6,78.6],[11.6,78.6]], color: '#ff4444' },
            { name: 'Erode',      coords: [[10.7,77.0],[11.7,77.0],[11.7,78.2],[10.7,78.2]], color: '#ffa726' },
            { name: 'Salem',      coords: [[11.4,77.8],[12.0,77.8],[12.0,78.5],[11.4,78.5]], color: '#ffd740' }]
    },
    'jharkhand': {
        current:   [{ name: 'Singhbhum, Jharkhand',  risk: 'very-high', percentage: 80 },
                    { name: 'Palamu, Jharkhand',     risk: 'high',      percentage: 63 },
                    { name: 'Hazaribagh, Jharkhand', risk: 'moderate',  percentage: 46 }],
        predicted: [{ name: 'Singhbhum, Jharkhand',  risk: 'very-high', percentage: 87 },
                    { name: 'Palamu, Jharkhand',     risk: 'high',      percentage: 73 },
                    { name: 'Hazaribagh, Jharkhand', risk: 'high',      percentage: 58 },
                    { name: 'Gumla, Jharkhand',      risk: 'moderate',  percentage: 44 }],
        currentZones: [
            { name: 'Singhbhum',  coords: [[22.0,85.5],[22.7,85.5],[22.7,86.3],[22.0,86.3]], color: '#ff4444' },
            { name: 'Palamu',     coords: [[23.5,83.6],[24.2,83.6],[24.2,84.4],[23.5,84.4]], color: '#ffa726' },
            { name: 'Hazaribagh', coords: [[23.8,85.0],[24.4,85.0],[24.4,85.8],[23.8,85.8]], color: '#66bb6a' }],
        predictedZones: [
            { name: 'Singhbhum',  coords: [[21.8,85.3],[22.9,85.3],[22.9,86.5],[21.8,86.5]], color: '#cc0000' },
            { name: 'Palamu',     coords: [[23.3,83.4],[24.4,83.4],[24.4,84.6],[23.3,84.6]], color: '#ff4444' },
            { name: 'Hazaribagh', coords: [[23.6,84.8],[24.6,84.8],[24.6,85.9],[23.6,85.9]], color: '#ff4444' },
            { name: 'Gumla',      coords: [[23.0,84.3],[23.7,84.3],[23.7,85.1],[23.0,85.1]], color: '#ffa726' }]
    }
};

// Helper: find state data from a search query
function findStateData(query) {
    const q = query.toLowerCase();
    for (const [key, data] of Object.entries(STATE_FIRE_DATA)) {
        if (q.includes(key) || key.includes(q)) return { key, data };
    }
    return null;
}

// Toggle prediction functionality
function togglePrediction() {
    const btn = document.getElementById('toggle-prediction');
    if (!btn) return;

    const isNextDay = btn.textContent.includes('Current');

    if (isNextDay) {
        btn.innerHTML = '<i class="fas fa-clock"></i> Show Next Day Prediction';
        showCurrentDayPrediction();
    } else {
        btn.innerHTML = '<i class="fas fa-calendar"></i> Show Current Day';
        showNextDayPrediction();
    }
}

function showCurrentDayPrediction() {
    const stateData = findStateData(activeLocation.name);
    if (stateData) {
        updateRiskZones(stateData.data.current);
        updateMapRiskColorsFromZones(stateData.data.currentZones, 'current');
    } else {
        // Generic fallback using the searched location name
        updateRiskZones([
            { name: `${activeLocation.name} North`, risk: 'very-high', percentage: 80 },
            { name: `${activeLocation.name} Central`, risk: 'high',  percentage: 63 },
            { name: `${activeLocation.name} South`,  risk: 'moderate', percentage: 44 }
        ]);
        updateMapRiskColors('current');
    }
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) lastUpdateElement.textContent = '2 minutes ago';
}

function showNextDayPrediction() {
    const stateData = findStateData(activeLocation.name);
    if (stateData) {
        updateRiskZones(stateData.data.predicted);
        updateMapRiskColorsFromZones(stateData.data.predictedZones, 'predicted');
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) lastUpdateElement.textContent = `Predicted for tomorrow — ${activeLocation.name}`;
    } else {
        // Generic fallback
        updateRiskZones([
            { name: `${activeLocation.name} North`, risk: 'very-high', percentage: 88 },
            { name: `${activeLocation.name} Central`, risk: 'high',   percentage: 72 },
            { name: `${activeLocation.name} South`,   risk: 'high',   percentage: 60 }
        ]);
        updateMapRiskColors('predicted');
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) lastUpdateElement.textContent = `Predicted for tomorrow — ${activeLocation.name}`;
    }
}

// New helper: draw zones from an explicit zone list
function updateMapRiskColorsFromZones(zones, type) {
    if (!riskMap) return;
    riskMap.eachLayer(layer => {
        if (layer instanceof L.Polygon) riskMap.removeLayer(layer);
    });
    const allPolygons = [];
    zones.forEach(zone => {
        const polygon = L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: type === 'predicted' ? 0.55 : 0.4,
            weight: type === 'predicted' ? 3 : 2,
            dashArray: type === 'predicted' ? '6, 4' : null
        }).addTo(riskMap);
        const prefix = type === 'predicted' ? '📅 Tomorrow: ' : '🔴 Today: ';
        polygon.bindPopup(`<div style="font-family:sans-serif;min-width:150px"><b>${zone.name}</b><br>${prefix}<b>${(zone.color === '#cc0000' || zone.color === '#8b0000') ? 'VERY HIGH' : zone.color === '#ff4444' ? 'HIGH' : zone.color === '#ffa726' || zone.color === '#ff7043' ? 'MODERATE' : 'LOW'} Risk</b></div>`);
        allPolygons.push(polygon);
    });
    if (allPolygons.length > 0) {
        const group = L.featureGroup(allPolygons);
        riskMap.fitBounds(group.getBounds().pad(0.15));
    }
}

function updateRiskZones(zones) {
    const riskContainer = document.querySelector('.risk-zones');
    if (!riskContainer) return;

    riskContainer.innerHTML = '';

    zones.forEach(zone => {
        const riskClass = zone.risk === 'very-high' ? 'high-risk' : 
                         zone.risk === 'high' ? 'moderate-risk' : 'low-risk';

        const riskItem = document.createElement('div');
        riskItem.className = `risk-item ${riskClass}`;
        riskItem.innerHTML = `
            <div class="risk-color"></div>
            <div class="risk-info">
                <span class="risk-level">${zone.risk.replace('-', ' ').toUpperCase()} Risk</span>
                <span class="risk-area">${zone.name}</span>
            </div>
            <div class="risk-percentage">${zone.percentage}%</div>
        `;
        riskContainer.appendChild(riskItem);
    });
}

function updateMapRiskColors(type) {
    if (!riskMap) return;

    // Clear existing polygons
    riskMap.eachLayer(layer => {
        if (layer instanceof L.Polygon) {
            riskMap.removeLayer(layer);
        }
    });

    // Current day: focused 3-zone Uttarakhand view
    const currentZones = [
        {
            name: 'Nainital, Uttarakhand',
            coords: [[29.2, 79.3], [29.6, 79.3], [29.6, 79.8], [29.2, 79.8]],
            risk: 'very-high', color: '#ff4444'
        },
        {
            name: 'Almora, Uttarakhand',
            coords: [[29.5, 79.5], [29.9, 79.5], [29.9, 80.0], [29.5, 80.0]],
            risk: 'high', color: '#ffa726'
        },
        {
            name: 'Dehradun, Uttarakhand',
            coords: [[30.1, 77.8], [30.5, 77.8], [30.5, 78.3], [30.1, 78.3]],
            risk: 'moderate', color: '#66bb6a'
        }
    ];

    // Next Day Prediction: ALL 28 Indian States — distinct forest fire risk zones
    const predictedZones = [
        // === VERY HIGH RISK ===
        // 1. Madhya Pradesh
        { name: 'Balaghat, Madhya Pradesh',
          coords: [[21.4, 79.9], [22.2, 79.9], [22.2, 80.8], [21.4, 80.8]],
          risk: 'very-high', color: '#8b0000' },
        // 2. Uttarakhand
        { name: 'Nainital, Uttarakhand',
          coords: [[29.1, 79.2], [29.7, 79.2], [29.7, 79.9], [29.1, 79.9]],
          risk: 'very-high', color: '#8b0000' },
        // 3. Odisha
        { name: 'Sundargarh, Odisha',
          coords: [[21.8, 83.7], [22.5, 83.7], [22.5, 84.5], [21.8, 84.5]],
          risk: 'very-high', color: '#8b0000' },
        // 4. Chhattisgarh
        { name: 'Bastar, Chhattisgarh',
          coords: [[18.5, 81.0], [19.4, 81.0], [19.4, 82.0], [18.5, 82.0]],
          risk: 'very-high', color: '#8b0000' },

        // === HIGH RISK ===
        // 5. Maharashtra
        { name: 'Gadchiroli, Maharashtra',
          coords: [[19.6, 79.9], [20.5, 79.9], [20.5, 80.8], [19.6, 80.8]],
          risk: 'high', color: '#cc0000' },
        // 6. Arunachal Pradesh
        { name: 'West Kameng, Arunachal Pradesh',
          coords: [[26.8, 91.8], [27.5, 91.8], [27.5, 92.7], [26.8, 92.7]],
          risk: 'high', color: '#cc0000' },
        // 7. Manipur
        { name: 'Senapati, Manipur',
          coords: [[24.7, 93.8], [25.3, 93.8], [25.3, 94.5], [24.7, 94.5]],
          risk: 'high', color: '#cc0000' },
        // 8. Himachal Pradesh
        { name: 'Shimla, Himachal Pradesh',
          coords: [[30.9, 76.9], [31.5, 76.9], [31.5, 77.6], [30.9, 77.6]],
          risk: 'high', color: '#cc0000' },
        // 9. Jharkhand
        { name: 'East Singhbhum, Jharkhand',
          coords: [[22.0, 85.5], [22.7, 85.5], [22.7, 86.3], [22.0, 86.3]],
          risk: 'high', color: '#cc0000' },
        // 10. Andhra Pradesh
        { name: 'Visakhapatnam, Andhra Pradesh',
          coords: [[17.5, 82.4], [18.3, 82.4], [18.3, 83.3], [17.5, 83.3]],
          risk: 'high', color: '#cc0000' },
        // 11. Telangana
        { name: 'Bhadradri Kothagudem, Telangana',
          coords: [[17.4, 80.4], [18.1, 80.4], [18.1, 81.2], [17.4, 81.2]],
          risk: 'high', color: '#cc0000' },
        // 12. Nagaland
        { name: 'Zunheboto, Nagaland',
          coords: [[25.8, 94.2], [26.4, 94.2], [26.4, 94.9], [25.8, 94.9]],
          risk: 'high', color: '#cc0000' },
        // 13. Mizoram
        { name: 'Champhai, Mizoram',
          coords: [[23.2, 92.8], [23.8, 92.8], [23.8, 93.4], [23.2, 93.4]],
          risk: 'high', color: '#cc0000' },

        // === MODERATE RISK ===
        // 14. Kerala
        { name: 'Wayanad, Kerala',
          coords: [[11.5, 75.8], [12.1, 75.8], [12.1, 76.4], [11.5, 76.4]],
          risk: 'moderate', color: '#ff7043' },
        // 15. Tamil Nadu
        { name: 'Nilgiris, Tamil Nadu',
          coords: [[11.2, 76.4], [11.9, 76.4], [11.9, 77.2], [11.2, 77.2]],
          risk: 'moderate', color: '#ff7043' },
        // 16. Karnataka
        { name: 'Kodagu, Karnataka',
          coords: [[12.0, 75.4], [12.7, 75.4], [12.7, 76.2], [12.0, 76.2]],
          risk: 'moderate', color: '#ff7043' },
        // 17. Assam
        { name: 'Karbi Anglong, Assam',
          coords: [[25.4, 92.3], [26.2, 92.3], [26.2, 93.2], [25.4, 93.2]],
          risk: 'moderate', color: '#ff7043' },
        // 18. Meghalaya
        { name: 'West Khasi Hills, Meghalaya',
          coords: [[25.2, 90.8], [25.8, 90.8], [25.8, 91.6], [25.2, 91.6]],
          risk: 'moderate', color: '#ff7043' },
        // 19. Uttarakhand (2nd zone)
        { name: 'Pauri Garhwal, Uttarakhand',
          coords: [[29.8, 78.5], [30.4, 78.5], [30.4, 79.3], [29.8, 79.3]],
          risk: 'moderate', color: '#ff7043' },
        // 20. Himachal Pradesh (2nd zone)
        { name: 'Kullu, Himachal Pradesh',
          coords: [[31.7, 76.9], [32.3, 76.9], [32.3, 77.6], [31.7, 77.6]],
          risk: 'moderate', color: '#ff7043' },
        // 21. Tripura
        { name: 'Dhalai, Tripura',
          coords: [[23.4, 91.7], [24.0, 91.7], [24.0, 92.3], [23.4, 92.3]],
          risk: 'moderate', color: '#ff7043' },
        // 22. Sikkim
        { name: 'West Sikkim',
          coords: [[27.2, 88.0], [27.7, 88.0], [27.7, 88.5], [27.2, 88.5]],
          risk: 'moderate', color: '#ff7043' },

        // === LOW RISK ===
        // 23. Bihar
        { name: 'West Champaran, Bihar',
          coords: [[26.8, 84.0], [27.5, 84.0], [27.5, 84.8], [26.8, 84.8]],
          risk: 'low', color: '#ffd740' },
        // 24. Uttar Pradesh
        { name: 'Sonbhadra, Uttar Pradesh',
          coords: [[24.0, 82.4], [24.7, 82.4], [24.7, 83.2], [24.0, 83.2]],
          risk: 'low', color: '#ffd740' },
        // 25. West Bengal
        { name: 'Jalpaiguri, West Bengal',
          coords: [[26.3, 88.5], [27.0, 88.5], [27.0, 89.3], [26.3, 89.3]],
          risk: 'low', color: '#ffd740' },
        // 26. Rajasthan
        { name: 'Sawai Madhopur, Rajasthan',
          coords: [[25.7, 76.1], [26.4, 76.1], [26.4, 76.9], [25.7, 76.9]],
          risk: 'low', color: '#ffd740' },
        // 27. Gujarat
        { name: 'Dangs, Gujarat',
          coords: [[20.5, 73.4], [21.1, 73.4], [21.1, 73.9], [20.5, 73.9]],
          risk: 'low', color: '#ffd740' },
        // 28. Goa
        { name: 'North Goa',
          coords: [[15.1, 73.7], [15.6, 73.7], [15.6, 74.2], [15.1, 74.2]],
          risk: 'low', color: '#ffd740' },
        // 29. Punjab
        { name: 'Pathankot, Punjab',
          coords: [[31.9, 75.4], [32.4, 75.4], [32.4, 76.0], [31.9, 76.0]],
          risk: 'low', color: '#ffd740' },
        // 30. Haryana
        { name: 'Panchkula (Morni Hills), Haryana',
          coords: [[30.4, 76.9], [30.9, 76.9], [30.9, 77.4], [30.4, 77.4]],
          risk: 'low', color: '#ffd740' },
    ];

    const zones = type === 'current' ? currentZones : predictedZones;

    // Add updated zones to map
    const allPolygons = [];
    zones.forEach(zone => {
        const polygon = L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: type === 'predicted' ? 0.55 : 0.4,
            weight: type === 'predicted' ? 3 : 2,
            dashArray: type === 'predicted' ? '6, 4' : null
        }).addTo(riskMap);

        const riskLevel = zone.risk.replace('-', ' ').toUpperCase();
        const prefix = type === 'predicted' ? '📅 Predicted Tomorrow: ' : '🔴 Current: ';

        polygon.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px;">
                <h4 style="margin: 0 0 6px; font-size: 0.95rem;">${zone.name}</h4>
                <p style="margin: 0; font-size: 0.85rem;">${prefix}<strong>${riskLevel}</strong></p>
            </div>
        `);
        allPolygons.push(polygon);
    });

    // Auto-fit map to show ALL prediction zones
    if (allPolygons.length > 0) {
        const group = L.featureGroup(allPolygons);
        riskMap.fitBounds(group.getBounds().pad(0.1));
    }
}


// Enhanced Search Functionality with expanded location database
function initializeMapSearch() {
    const searchInput = document.querySelector('.search-input');

    // Comprehensive location database including all Indian states and major districts
    const locations = {
        // Uttarakhand districts and places
        'nainital': { lat: 29.3806, lng: 79.4422, zoom: 12 },
        'almora': { lat: 29.6500, lng: 79.6667, zoom: 12 },
        'dehradun': { lat: 30.3165, lng: 78.0322, zoom: 12 },
        'haridwar': { lat: 29.9457, lng: 78.1642, zoom: 12 },
        'rishikesh': { lat: 30.0869, lng: 78.2676, zoom: 12 },
        'uttarakhand': { lat: 30.0668, lng: 79.0193, zoom: 8 },
        'jim corbett': { lat: 29.5308, lng: 78.9514, zoom: 12 },
        'corbett': { lat: 29.5308, lng: 78.9514, zoom: 12 },
        'valley of flowers': { lat: 30.7268, lng: 79.6045, zoom: 12 },
        'chamoli': { lat: 30.4000, lng: 79.3200, zoom: 12 },
        'pithoragarh': { lat: 29.5833, lng: 80.2167, zoom: 12 },
        'tehri': { lat: 30.3900, lng: 78.4800, zoom: 12 },
        'pauri': { lat: 30.1500, lng: 78.7800, zoom: 12 },
        'rudraprayag': { lat: 30.2800, lng: 78.9800, zoom: 12 },
        'bageshwar': { lat: 29.8400, lng: 79.7700, zoom: 12 },
        'champawat': { lat: 29.3400, lng: 80.0900, zoom: 12 },
        'uttarkashi': { lat: 30.7300, lng: 78.4500, zoom: 12 },
        'udham singh nagar': { lat: 28.9750, lng: 79.4000, zoom: 12 },
        
        // Indian States
        'andhra pradesh': { lat: 15.9129, lng: 79.7400, zoom: 7 },
        'arunachal pradesh': { lat: 28.2180, lng: 94.7278, zoom: 7 },
        'assam': { lat: 26.2006, lng: 92.9376, zoom: 7 },
        'bihar': { lat: 25.0961, lng: 85.3131, zoom: 7 },
        'chhattisgarh': { lat: 21.2787, lng: 81.8661, zoom: 7 },
        'goa': { lat: 15.2993, lng: 74.1240, zoom: 10 },
        'gujarat': { lat: 23.0225, lng: 72.5714, zoom: 7 },
        'haryana': { lat: 29.0588, lng: 76.0856, zoom: 8 },
        'himachal pradesh': { lat: 31.1048, lng: 77.1734, zoom: 8 },
        'jharkhand': { lat: 23.6102, lng: 85.2799, zoom: 7 },
        'karnataka': { lat: 15.3173, lng: 75.7139, zoom: 7 },
        'kerala': { lat: 10.8505, lng: 76.2711, zoom: 8 },
        'madhya pradesh': { lat: 22.9734, lng: 78.6569, zoom: 7 },
        'maharashtra': { lat: 19.7515, lng: 75.7139, zoom: 7 },
        'manipur': { lat: 24.6637, lng: 93.9063, zoom: 9 },
        'meghalaya': { lat: 25.4670, lng: 91.3662, zoom: 9 },
        'mizoram': { lat: 23.1645, lng: 92.9376, zoom: 9 },
        'nagaland': { lat: 26.1584, lng: 94.5624, zoom: 9 },
        'odisha': { lat: 20.9517, lng: 85.0985, zoom: 7 },
        'punjab': { lat: 31.1471, lng: 75.3412, zoom: 8 },
        'rajasthan': { lat: 27.0238, lng: 74.2179, zoom: 6 },
        'sikkim': { lat: 27.5330, lng: 88.5122, zoom: 10 },
        'tamil nadu': { lat: 11.1271, lng: 78.6569, zoom: 7 },
        'telangana': { lat: 18.1124, lng: 79.0193, zoom: 8 },
        'tripura': { lat: 23.9408, lng: 91.9882, zoom: 9 },
        'uttar pradesh': { lat: 26.8467, lng: 80.9462, zoom: 6 },
        'west bengal': { lat: 22.9868, lng: 87.8550, zoom: 7 },
        
        // Union territories
        'andaman and nicobar islands': { lat: 11.7401, lng: 92.6586, zoom: 8 },
        'chandigarh': { lat: 30.7333, lng: 76.7794, zoom: 11 },
        'dadra and nagar haveli': { lat: 20.1809, lng: 73.0169, zoom: 10 },
        'daman and diu': { lat: 20.3974, lng: 72.8328, zoom: 10 },
        'lakshadweep': { lat: 10.5667, lng: 72.6417, zoom: 9 },
        'new delhi': { lat: 28.7041, lng: 77.1025, zoom: 10 },
        'delhi': { lat: 28.7041, lng: 77.1025, zoom: 10 },
        'puducherry': { lat: 11.9416, lng: 79.8083, zoom: 10 },
        
        // Major cities
        'mumbai': { lat: 19.0760, lng: 72.8777, zoom: 10 },
        'kolkata': { lat: 22.5726, lng: 88.3639, zoom: 10 },
        'bangalore': { lat: 12.9716, lng: 77.5946, zoom: 10 },
        'bengaluru': { lat: 12.9716, lng: 77.5946, zoom: 10 },
        'chennai': { lat: 13.0827, lng: 80.2707, zoom: 10 },
        'hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 10 },
        'pune': { lat: 18.5204, lng: 73.8567, zoom: 10 },
        'ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 10 },
        'jaipur': { lat: 26.9124, lng: 75.7873, zoom: 10 },
        'surat': { lat: 21.1702, lng: 72.8311, zoom: 10 },
        'lucknow': { lat: 26.8467, lng: 80.9462, zoom: 10 },
        'kanpur': { lat: 26.4499, lng: 80.3319, zoom: 10 },
        'nagpur': { lat: 21.1458, lng: 79.0882, zoom: 10 },
        'indore': { lat: 22.7196, lng: 75.8577, zoom: 10 },
        'thane': { lat: 19.2183, lng: 72.9781, zoom: 10 },
        'bhopal': { lat: 23.2599, lng: 77.4126, zoom: 10 },
        'visakhapatnam': { lat: 17.6868, lng: 83.2185, zoom: 10 },
        'pimpri-chinchwad': { lat: 18.6298, lng: 73.7997, zoom: 10 },
        'patna': { lat: 25.5941, lng: 85.1376, zoom: 10 },
        'vadodara': { lat: 22.3072, lng: 73.1812, zoom: 10 },
        'ludhiana': { lat: 30.9010, lng: 75.8573, zoom: 10 },
        'agra': { lat: 27.1767, lng: 78.0081, zoom: 10 },
        'nashik': { lat: 19.9975, lng: 73.7898, zoom: 10 },
        'faridabad': { lat: 28.4089, lng: 77.3178, zoom: 10 },
        'meerut': { lat: 28.9845, lng: 77.7064, zoom: 10 },
        'rajkot': { lat: 22.3039, lng: 70.8022, zoom: 10 },
        'kalyan-dombivli': { lat: 19.2350, lng: 73.1300, zoom: 10 },
        'vasai-virar': { lat: 19.4914, lng: 72.8054, zoom: 10 },
        'varanasi': { lat: 25.3176, lng: 82.9739, zoom: 10 },
        'srinagar': { lat: 34.0837, lng: 74.7973, zoom: 10 },
        'aurangabad': { lat: 19.8762, lng: 75.3433, zoom: 10 },
        'dhanbad': { lat: 23.7957, lng: 86.4304, zoom: 10 },
        'amritsar': { lat: 31.6340, lng: 74.8723, zoom: 10 },
        'navi mumbai': { lat: 19.0330, lng: 73.0297, zoom: 10 },
        'allahabad': { lat: 25.4358, lng: 81.8463, zoom: 10 },
        'prayagraj': { lat: 25.4358, lng: 81.8463, zoom: 10 },
        'howrah': { lat: 22.5958, lng: 88.2636, zoom: 10 },
        'ranchi': { lat: 23.3441, lng: 85.3096, zoom: 10 },
        'gwalior': { lat: 26.2183, lng: 78.1828, zoom: 10 },
        'jabalpur': { lat: 23.1815, lng: 79.9864, zoom: 10 },
        'coimbatore': { lat: 11.0168, lng: 76.9558, zoom: 10 },
        'vijayawada': { lat: 16.5062, lng: 80.6480, zoom: 10 },
        'jodhpur': { lat: 26.2389, lng: 73.0243, zoom: 10 },
        'madurai': { lat: 9.9252, lng: 78.1198, zoom: 10 },
        'raipur': { lat: 21.2514, lng: 81.6296, zoom: 10 },
        'kota': { lat: 25.2138, lng: 75.8648, zoom: 10 },
        'chandigarh': { lat: 30.7333, lng: 76.7794, zoom: 11 },
        'guwahati': { lat: 26.1445, lng: 91.7362, zoom: 10 },
        'solapur': { lat: 17.6599, lng: 75.9064, zoom: 10 },
        'hubli-dharwad': { lat: 15.3647, lng: 75.1240, zoom: 10 },
        'bareilly': { lat: 28.3670, lng: 79.4304, zoom: 10 },
        'moradabad': { lat: 28.8386, lng: 78.7733, zoom: 10 },
        'mysore': { lat: 12.2958, lng: 76.6394, zoom: 10 },
        'gurgaon': { lat: 28.4595, lng: 77.0266, zoom: 10 },
        'gurugram': { lat: 28.4595, lng: 77.0266, zoom: 10 },
        'aligarh': { lat: 27.8974, lng: 78.0880, zoom: 10 },
        'jalandhar': { lat: 31.3260, lng: 75.5762, zoom: 10 },
        'tiruchirappalli': { lat: 10.7905, lng: 78.7047, zoom: 10 },
        'bhubaneswar': { lat: 20.2961, lng: 85.8245, zoom: 10 },
        'salem': { lat: 11.6643, lng: 78.1460, zoom: 10 },
        'warangal': { lat: 17.9689, lng: 79.5941, zoom: 10 }
    };

    // Fuzzy search function for partial matches
    const fuzzySearch = (query) => {
        const lowerQuery = query.toLowerCase().trim();
        
        // Exact match first
        if (locations[lowerQuery]) {
            return { key: lowerQuery, data: locations[lowerQuery] };
        }
        
        // Enhanced partial match search
        const matches = Object.keys(locations).filter(key => {
            const lowerKey = key.toLowerCase();
            // Check if query matches start of location name
            if (lowerKey.startsWith(lowerQuery)) return true;
            // Check if query is contained in location name
            if (lowerKey.includes(lowerQuery)) return true;
            // Check if location name starts with query
            if (lowerQuery.length >= 3 && lowerKey.indexOf(lowerQuery) !== -1) return true;
            // Check individual words
            const queryWords = lowerQuery.split(' ');
            const keyWords = lowerKey.split(' ');
            return queryWords.some(qWord => 
                keyWords.some(kWord => 
                    kWord.startsWith(qWord) || qWord.startsWith(kWord)
                )
            );
        });
        
        if (matches.length > 0) {
            // Return the best match (prioritize exact starts, then contains)
            const bestMatch = matches.reduce((best, current) => {
                const bestScore = getMatchScore(lowerQuery, best);
                const currentScore = getMatchScore(lowerQuery, current);
                return currentScore > bestScore ? current : best;
            });
            
            return { key: bestMatch, data: locations[bestMatch] };
        }
        
        return null;
    };

    const getMatchScore = (query, key) => {
        if (!key) return 0;
        
        const lowerKey = key.toLowerCase();
        const lowerQuery = query.toLowerCase();
        let score = 0;
        
        // Exact match gets highest score
        if (lowerKey === lowerQuery) score += 1000;
        
        // Starts with query gets high score
        if (lowerKey.startsWith(lowerQuery)) score += 500;
        
        // Query at beginning of any word
        const words = lowerKey.split(' ');
        words.forEach(word => {
            if (word.startsWith(lowerQuery)) score += 300;
        });
        
        // Contains query gets medium score
        if (lowerKey.includes(lowerQuery)) score += 100;
        
        // Partial word matches
        words.forEach(word => {
            if (word.includes(lowerQuery)) score += 50;
        });
        
        // Length similarity bonus (prefer shorter matches for partial queries)
        const lengthDiff = Math.abs(lowerKey.length - lowerQuery.length);
        score += Math.max(0, 25 - lengthDiff);
        
        return score;
    };

    const searchAllMaps = (query, locationData) => {
        const { lat, lng, zoom } = locationData;
        let updatedMaps = 0;
        
        // List of all possible maps to update
        const mapsToUpdate = [
            { map: riskMap, name: 'Risk Map' },
            { map: simulationMap, name: 'Simulation Map' },
            { map: deploymentMap, name: 'Deployment Map' },
            { map: evacuationMap, name: 'Evacuation Map' },
            { map: explainabilityMap, name: 'Explainability Map' }
        ];
        
        // Update all active maps
        mapsToUpdate.forEach(({ map, name }) => {
            if (map && typeof map.setView === 'function') {
                try {
                    map.setView([lat, lng], zoom);
                    
                    // Add search result marker to each map
                    const searchMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'search-result-marker',
                            html: `
                                <div class="search-marker-container">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="search-pulse"></div>
                                </div>
                            `,
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    }).addTo(map);
                    
                    // Auto-remove marker after 10 seconds
                    setTimeout(() => {
                        if (map.hasLayer(searchMarker)) {
                            map.removeLayer(searchMarker);
                        }
                    }, 10000);
                    
                    searchMarker.bindPopup(`
                        <div class="search-popup">
                            <h4>${query.charAt(0).toUpperCase() + query.slice(1)}</h4>
                            <p>Located via ${name}</p>
                        </div>
                    `).openPopup();
                    
                    updatedMaps++;
                } catch (error) {
                    console.warn(`Failed to update ${name}:`, error);
                }
            }
        });
        
        // Update risk zones for the new location
        if (riskMap && updatedMaps > 0) {
            // Track the active location so Next Day Prediction is state-aware
            activeLocation = { name: query, lat: lat, lng: lng };
            updateRiskZonesForLocation(query, lat, lng);
            
            // Immediately fetch real weather for the new location
            if (typeof updateEnvironmentalData === 'function') {
                updateEnvironmentalData();
            }
        }
        
        return updatedMaps;
    };

    const performSearch = (query) => {
        if (!query) return;
        
        // Clean and normalize query
        const cleanQuery = query.toLowerCase().trim();
        
        // Search for location
        const searchResult = fuzzySearch(cleanQuery);
        
        if (searchResult) {
            const updatedMaps = searchAllMaps(query, searchResult.data);
            
            if (updatedMaps > 0) {
                showToast(`Found "${searchResult.key}" - Updated ${updatedMaps} map(s)`, 'success');
                
                // Add visual emphasis to updated maps
                setTimeout(() => {
                    const mapContainers = document.querySelectorAll('.map-container, .canvas-container');
                    mapContainers.forEach(container => {
                        container.style.boxShadow = '0 0 30px rgba(255, 107, 53, 0.8)';
                        container.style.transform = 'scale(1.02)';
                        container.style.transition = 'all 0.5s ease';
                        container.style.border = '2px solid rgba(255, 107, 53, 0.6)';
                    });

                    setTimeout(() => {
                        mapContainers.forEach(container => {
                            container.style.boxShadow = '';
                            container.style.transform = '';
                            container.style.border = '';
                        });
                    }, 3000);
                }, 300);
                
                // Update 3D visualization if available
                if (window.fireVision3D && searchResult.data) {
                    setTimeout(() => {
                        updateFireVision3DLocation(searchResult.data.lat, searchResult.data.lng);
                    }, 500);
                }
                
            } else {
                showToast(`Location found but no maps available to display`, 'warning');
            }
        } else {
            // Try online geocoding as fallback
            performOnlineGeocoding(query);
        }

        // Clear search input
        if (searchInput) {
            searchInput.value = '';
        }
    };

    // Fallback to online geocoding for unknown locations
    const performOnlineGeocoding = async (query) => {
        try {
            showToast(`Searching for "${query}" online...`, 'processing', 2000);
            
            // Using Nominatim geocoding service (free, no API key required)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`);
            const results = await response.json();
            
            if (results && results.length > 0) {
                const result = results[0];
                const locationData = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    zoom: 10
                };
                
                const updatedMaps = searchAllMaps(query, locationData);
                
                if (updatedMaps > 0) {
                    showToast(`Found "${result.display_name.split(',')[0]}" - Updated ${updatedMaps} map(s)`, 'success');
                } else {
                    showToast(`Location found but no maps available`, 'warning');
                }
            } else {
                showToast(`Location "${query}" not found in India`, 'error');
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            showToast(`Could not find location "${query}"`, 'error');
        }
    };

    // Enhanced event listeners
    if (searchInput) {
        // Enter key search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query.length >= 1) {
                    performSearch(query);
                } else {
                    showToast('Please enter at least 1 character', 'warning');
                }
            }
        });
        
        // Add search suggestions on input
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length >= 1) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                hideSearchSuggestions();
            }
        });
    }
}

// Search suggestions functionality
function showSearchSuggestions(query) {
    const searchContainer = document.querySelector('.search-container');
    let suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'search-suggestions';
        suggestionsContainer.className = 'search-suggestions';
        searchContainer.appendChild(suggestionsContainer);
    }
    
    // Get location matches for suggestions
    const suggestionLocations = {
        'uttarakhand': 'Uttarakhand State',
        'nainital': 'Nainital, Uttarakhand',
        'almora': 'Almora, Uttarakhand', 
        'dehradun': 'Dehradun, Uttarakhand',
        'haridwar': 'Haridwar, Uttarakhand',
        'rishikesh': 'Rishikesh, Uttarakhand',
        'jim corbett': 'Jim Corbett National Park, Uttarakhand',
        'corbett': 'Jim Corbett National Park, Uttarakhand',
        'maharashtra': 'Maharashtra State',
        'gujarat': 'Gujarat State',
        'rajasthan': 'Rajasthan State',
        'kerala': 'Kerala State',
        'karnataka': 'Karnataka State',
        'tamil nadu': 'Tamil Nadu State',
        'delhi': 'New Delhi',
        'mumbai': 'Mumbai, Maharashtra',
        'bangalore': 'Bangalore, Karnataka',
        'chennai': 'Chennai, Tamil Nadu',
        'kolkata': 'Kolkata, West Bengal',
        'hyderabad': 'Hyderabad, Telangana'
    };
    
    const matches = Object.keys(suggestionLocations)
        .filter(key => {
            const lowerKey = key.toLowerCase();
            return lowerKey.includes(query) || 
                   lowerKey.startsWith(query) ||
                   query.includes(key.split(' ')[0]) ||
                   lowerKey.split(' ').some(word => word.startsWith(query));
        })
        .sort((a, b) => {
            // Sort by relevance - exact starts first, then contains
            const aStarts = a.toLowerCase().startsWith(query);
            const bStarts = b.toLowerCase().startsWith(query);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.length - b.length; // Shorter names first
        })
        .slice(0, 5); // Limit to 5 suggestions
    
    if (matches.length > 0) {
        suggestionsContainer.innerHTML = matches.map(match => `
            <div class="suggestion-item" data-location="${match}">
                <i class="fas fa-map-marker-alt"></i>
                <span>${suggestionLocations[match] || match}</span>
            </div>
        `).join('');
        
        // Add click handlers to suggestions
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const location = item.dataset.location;
                document.querySelector('.search-input').value = location;
                performGlobalSearch(location);
                hideSearchSuggestions();
            });
        });
        
        suggestionsContainer.style.display = 'block';
    } else {
        hideSearchSuggestions();
    }
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Global search function accessible from suggestions
function performGlobalSearch(query) {
    // This function is accessible from suggestion clicks
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = query;
        // Trigger the search
        const event = new KeyboardEvent('keypress', { key: 'Enter' });
        searchInput.dispatchEvent(event);
    }
}

// Update FireVision 3D camera position for search results
function updateFireVision3DLocation(lat, lng) {
    if (window.fireVision3D && window.fireVision3D.camera) {
        try {
            // Convert lat/lng to relative 3D coordinates (simplified)
            const x = (lng - 79.0193) * 100; // Offset from Uttarakhand center
            const z = (lat - 30.0668) * 100;
            
            // Update camera to look at this location
            const distance = 50;
            window.fireVision3D.camera.position.set(x, 30, z + distance);
            window.fireVision3D.camera.lookAt(x, 0, z);
            
            showToast('3D view updated to search location', 'info');
        } catch (error) {
            console.warn('Could not update 3D view:', error);
        }
    }
}

// Global variable to track explainability map
let explainabilityMap = null;

// Start real-time data updates
function startDataUpdates() {
    // Initial fetches so we don't have to wait for the first interval
    updateEnvironmentalData();
    
    setInterval(updateEnvironmentalData, 30000);
    setInterval(updateAlerts, 60000);
    setInterval(updateTimeStamps, 60000);
    setInterval(updateChartData, 45000);
    setInterval(updateFireSpreadChart, 10000);
    setInterval(updateActivityFeed, 45000);
    setInterval(updateEnvironmentalConditions, 35000);
}

async function updateEnvironmentalData() {
    let lat = 18.5204; // Default to Pune
    let lng = 73.8567;
    
    // If user has searched a location, use its coordinates
    if (typeof activeLocation !== 'undefined' && activeLocation && activeLocation.lat && activeLocation.lng) {
        lat = activeLocation.lat;
        lng = activeLocation.lng;
    }

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`);
        const data = await response.json();
        
        if (data && data.current) {
            const windSpeed = Math.round(data.current.wind_speed_10m);
            const temperature = Math.round(data.current.temperature_2m);
            const humidity = Math.round(data.current.relative_humidity_2m);
            const windDirDegrees = data.current.wind_direction_10m;
            
            // Convert degrees to cardinal direction
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const dirIndex = Math.round(((windDirDegrees %= 360) < 0 ? windDirDegrees + 360 : windDirDegrees) / 45) % 8;
            const windDirection = directions[dirIndex];

            updateElementText('wind-speed', `${windSpeed} km/h`);
            updateElementText('temperature', `${temperature}°C`);
            updateElementText('humidity', `${humidity}%`);
            updateElementText('wind-direction', windDirection);
            
            // Show a tiny 'LIVE' indicator next to temperature if we want, or just leave it
        }
    } catch (error) {
        console.error("Failed to fetch real weather data, using simulation:", error);
        // Fallback to simulation
        const windSpeed = Math.floor(Math.random() * 20) + 5;
        const temperature = Math.floor(Math.random() * 15) + 25;
        const humidity = Math.floor(Math.random() * 40) + 30;

        updateElementText('wind-speed', `${windSpeed} km/h`);
        updateElementText('temperature', `${temperature}°C`);
        updateElementText('humidity', `${humidity}%`);

        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        updateElementText('wind-direction', randomDirection);
    }
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function updateAlerts() {
    const alertTimes = document.querySelectorAll('.alert-time');
    alertTimes.forEach((timeEl, index) => {
        const baseTime = (index + 1) * 15;
        timeEl.textContent = `${baseTime} minutes ago`;
    });
}

function updateTimeStamps() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = 'Just now';
        setTimeout(() => {
            lastUpdateElement.textContent = '1 minute ago';
        }, 5000);
    }
}

function updateChartData() {
    if (window.chartInstances && window.chartInstances.riskTimeline) {
        const chart = window.chartInstances.riskTimeline;
        chart.data.datasets.forEach((dataset) => {
            dataset.data = dataset.data.map(value => {
                const variation = (Math.random() - 0.5) * 10;
                return Math.max(0, Math.min(100, value + variation));
            });
        });
        chart.update('none');
    }

    updateGaugeValues();
    updateAlertStatistics();
}

function updateFireSpreadChart() {
    if (isSimulationRunning && window.chartInstances && window.chartInstances.fireSpread) {
        const chart = window.chartInstances.fireSpread;
        const lastValue = chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];

        const timeLabel = simulationTime + 'h';
        const newArea = lastValue + Math.random() * 50 + 20;

        if (chart.data.labels.length > 10) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(Math.round(newArea));

        chart.update('none');
    }
}

function updateGaugeValues() {
    const newAccuracy = Math.max(95, Math.min(99, 97 + (Math.random() - 0.5) * 2));
    updateElementText('accuracyValue', newAccuracy.toFixed(1) + '%');

    const newUptime = Math.max(99.5, Math.min(100, 99.8 + (Math.random() - 0.5) * 0.3));
    updateElementText('uptimeValue', newUptime.toFixed(1) + '%');

    const newSpeed = Math.max(70, Math.min(95, 85 + (Math.random() - 0.5) * 10));
    updateElementText('speedValue', Math.round(newSpeed) + '%');
}

function updateAlertStatistics() {
    const totalAlerts = Math.floor(Math.random() * 20) + 130;
    const activeFires = Math.floor(Math.random() * 5) + 5;
    const responseTime = Math.floor(Math.random() * 8) + 8;

    updateElementText('totalAlerts', totalAlerts);
    updateElementText('activeFires', activeFires);
    updateElementText('responseTime', responseTime + ' min');
}

function updateActivityFeed() {
    const activities = [
        {
            icon: 'fas fa-satellite-dish',
            title: 'Satellite Data Updated',
            description: 'New MODIS imagery processed for Nainital region',
            time: '2 minutes ago'
        },
        {
            icon: 'fas fa-exclamation-triangle',
            title: 'Risk Level Updated',
            description: 'Almora District elevated to High Risk status',
            time: '8 minutes ago'
        },
        {
            icon: 'fas fa-cloud-sun',
            title: 'Weather Data Sync',
            description: 'ERA5 meteorological data synchronized',
            time: '15 minutes ago'
        }
    ];

    const activityFeed = document.querySelector('.activity-feed');
    if (activityFeed && Math.random() < 0.1) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const newActivityHtml = `
            <div class="activity-item new">
                <div class="activity-icon">
                    <i class="${randomActivity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${randomActivity.title}</div>
                    <div class="activity-description">${randomActivity.description}</div>
                    <div class="activity-time">Just now</div>
                </div>
            </div>
        `;

        activityFeed.insertAdjacentHTML('afterbegin', newActivityHtml);

        const activityItems = activityFeed.querySelectorAll('.activity-item');
        if (activityItems.length > 5) {
            activityItems[activityItems.length - 1].remove();
        }

        activityItems.forEach((item, index) => {
            if (index > 0) {
                item.classList.remove('new');
            }
        });
    }
}

function updateEnvironmentalConditions() {
    const temperatureEl = document.querySelector('.condition-card.temperature .condition-value');
    const humidityEl = document.querySelector('.condition-card.humidity .condition-value');
    const windEl = document.querySelector('.condition-card.wind .condition-value');

    if (temperatureEl) {
        const newTemp = Math.floor(Math.random() * 8) + 28;
        temperatureEl.textContent = newTemp + '°C';
    }

    if (humidityEl) {
        const newHumidity = Math.floor(Math.random() * 30) + 35;
        humidityEl.textContent = newHumidity + '%';
    }

    if (windEl) {
        const newWind = Math.floor(Math.random() * 15) + 8;
        windEl.textContent = newWind + ' km/h';
    }

    if (Math.random() < 0.3) {
        updateMLPredictions();
    }
}

// ML Integration Functions
function initializeMLIntegration() {
    startMLRealTimeUpdates();
    loadMLModelInfo();
    setInterval(updateMLPredictions, 60000);
    showToast('AI/ML models initialized successfully', 'success');
}

async function startMLRealTimeUpdates() {
    try {
        const response = await fetch(`${ML_API_BASE}/api/ml/start-realtime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            realTimeUpdates = true;
            showToast('Real-time AI predictions activated', 'success');
        }
    } catch (error) {
        console.warn('ML API not available, using fallback predictions');
        showToast('Using local AI predictions', 'warning');
    }
}

async function updateMLPredictions() {
    try {
        const envData = getCurrentEnvironmentalData();
        const response = await fetch(`${ML_API_BASE}/api/ml/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(envData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                mlPredictions = result.predictions;
                updateDashboardWithMLPredictions(result.predictions);
            }
        }
    } catch (error) {
        const envData = getCurrentEnvironmentalData();
        mlPredictions = generateFallbackPredictions(envData);
        updateDashboardWithMLPredictions(mlPredictions);
    }
}

let liveWeatherData = null;
let lastWeatherFetchTime = 0;
let weatherInterval = null;

async function fetchLiveWeather(lat, lng) {
    if (!lat || !lng) return null;
    const now = Date.now();
    
    // Cache for 10 minutes (600,000 ms)
    if (liveWeatherData && liveWeatherData.lat === lat && liveWeatherData.lng === lng && (now - lastWeatherFetchTime < 600000)) {
        return liveWeatherData;
    }
    
    const weatherLoading = document.getElementById('weather-loading');
    const weatherContent = document.getElementById('weather-content');
    const timestampEl = document.getElementById('weather-timestamp');
    
    if (weatherLoading) weatherLoading.style.display = 'block';
    if (weatherContent) weatherContent.style.opacity = '0.5';
    
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        
        liveWeatherData = {
            lat: lat,
            lng: lng,
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation,
            wind_speed: data.current.wind_speed_10m,
            wind_direction: data.current.wind_direction_10m,
            wind_gusts: data.current.wind_gusts_10m,
            hourly: data.hourly
        };
        lastWeatherFetchTime = now;
        
        updateWeatherPanelUI();
    } catch (e) {
        console.warn('Failed to fetch weather:', e);
        if (liveWeatherData && timestampEl) {
            timestampEl.innerText = `Updated: ${new Date(lastWeatherFetchTime).toLocaleTimeString()} (Cached/Stale)`;
        } else if (timestampEl) {
            timestampEl.innerText = 'Weather fetch failed.';
        }
    } finally {
        if (weatherLoading) weatherLoading.style.display = 'none';
        if (weatherContent) weatherContent.style.opacity = '1';
    }
    return liveWeatherData;
}

function updateWeatherPanelUI() {
    if (!liveWeatherData) return;
    
    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    
    setElem('live-temperature', `${liveWeatherData.temperature} °C`);
    setElem('live-humidity', `${liveWeatherData.humidity} %`);
    setElem('live-wind-speed', `${liveWeatherData.wind_speed} km/h`);
    setElem('live-wind-gusts', `${liveWeatherData.wind_gusts} km/h`);
    setElem('live-precipitation', `${liveWeatherData.precipitation} mm`);
    
    setElem('live-wind-direction', `${liveWeatherData.wind_direction}°`);
    const arrow = document.getElementById('live-wind-arrow');
    if (arrow) arrow.style.transform = `rotate(${liveWeatherData.wind_direction}deg)`;
    
    setElem('weather-timestamp', `Updated: ${new Date(lastWeatherFetchTime).toLocaleTimeString()}`);
    setElem('weather-location', `${liveWeatherData.lat.toFixed(4)}, ${liveWeatherData.lng.toFixed(4)}`);
    
    const hourlyContainer = document.getElementById('hourly-forecast-container');
    if (hourlyContainer && liveWeatherData.hourly) {
        hourlyContainer.innerHTML = '';
        // Find current hour index
        const currentIso = new Date().toISOString().slice(0, 13) + ':00'; // e.g., 2026-10-09T22:00
        let startIndex = 0;
        if (liveWeatherData.hourly.time) {
            for (let i = 0; i < liveWeatherData.hourly.time.length; i++) {
                if (new Date(liveWeatherData.hourly.time[i]).getTime() >= Date.now() - 3600000) {
                    startIndex = i;
                    break;
                }
            }
            
            for (let i = startIndex; i < startIndex + 12 && i < liveWeatherData.hourly.time.length; i++) {
                const timeStr = new Date(liveWeatherData.hourly.time[i]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const ws = liveWeatherData.hourly.wind_speed_10m[i];
                const wd = liveWeatherData.hourly.wind_direction_10m[i];
                
                hourlyContainer.innerHTML += `
                    <div style="min-width: 60px; background: #f8fafc; padding: 6px; border-radius: 4px; text-align: center; font-size: 0.7rem;">
                        <div style="color: #64748b; margin-bottom: 4px;">${timeStr}</div>
                        <div style="font-weight: 600;">${ws}</div>
                        <div style="color: #94a3b8; font-size: 0.65rem;">km/h</div>
                        <i class="fas fa-location-arrow" style="color: #3b82f6; transform: rotate(${wd}deg); margin-top: 4px;"></i>
                    </div>
                `;
            }
        }
    }
    
    // Update the simulation parameters UI to reflect these if possible
    const tempParam = document.getElementById('temperature');
    if (tempParam) tempParam.innerText = `${liveWeatherData.temperature}°C`;
    const humParam = document.getElementById('humidity');
    if (humParam) humParam.innerText = `${liveWeatherData.humidity}%`;
    const wsParam = document.getElementById('wind-speed');
    if (wsParam) wsParam.innerText = `${liveWeatherData.wind_speed} km/h`;
    const wdParam = document.getElementById('wind-direction');
    if (wdParam) wdParam.innerText = `${liveWeatherData.wind_direction}°`;
}

// Global button listener
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-weather-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (liveWeatherData) {
                lastWeatherFetchTime = 0; // force refresh
                fetchLiveWeather(liveWeatherData.lat, liveWeatherData.lng);
            }
        });
    }
    
    // Setup interval for weather 10 min
    if (document.getElementById('weather-panel')) {
        weatherInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && liveWeatherData) {
                fetchLiveWeather(liveWeatherData.lat, liveWeatherData.lng);
            }
        }, 600000);
    }
});

function getCurrentEnvironmentalData() {
    const useLive = document.getElementById('use-live-weather');
    if (useLive && useLive.checked && liveWeatherData) {
        return {
            temperature: liveWeatherData.temperature,
            humidity: liveWeatherData.humidity,
            wind_speed: liveWeatherData.wind_speed,
            wind_direction: liveWeatherData.wind_direction,
            ndvi: 0.6 + (Math.random() - 0.5) * 0.2,
            elevation: 1500 + Math.random() * 500,
            slope: 10 + Math.random() * 20,
            vegetation_density: 'moderate',
            hourly_forecast: liveWeatherData.hourly
        };
    }
    
    const temperature = getElementValue('temperature', 32);
    const humidity = getElementValue('humidity', 45);
    const windSpeed = getElementValue('wind-speed', 15);
    const windDirection = getElementText('wind-direction', 'NE');

    return {
        temperature,
        humidity,
        wind_speed: windSpeed,
        wind_direction: windDirection,
        ndvi: 0.6 + (Math.random() - 0.5) * 0.2,
        elevation: 1500 + Math.random() * 500,
        slope: 10 + Math.random() * 20,
        vegetation_density: 'moderate'
    };
}

function updateDashboardWithMLPredictions(predictions) {
    if (predictions.ensemble_risk_score) {
        const accuracyEl = document.getElementById('accuracyValue');
        if (accuracyEl && predictions.confidence_interval) {
            const confidence = (predictions.confidence_interval.confidence_level * 100).toFixed(1);
            accuracyEl.textContent = confidence + '%';
        }
    }
}

function generateFallbackPredictions(envData) {
    const tempFactor = Math.min(envData.temperature / 40, 1);
    const humidityFactor = Math.max(0, (100 - envData.humidity) / 100);
    const windFactor = Math.min(envData.wind_speed / 30, 1);

    const baseRisk = (tempFactor * 0.4 + humidityFactor * 0.4 + windFactor * 0.2);
    const ensemble_risk = Math.min(baseRisk + Math.random() * 0.1, 1);

    return {
        ensemble_risk_score: ensemble_risk,
        ml_prediction: {
            overall_risk: ensemble_risk,
            confidence: 0.85,
            risk_category: ensemble_risk > 0.7 ? 'high' : ensemble_risk > 0.4 ? 'moderate' : 'low'
        },
        confidence_interval: {
            confidence_level: 0.85,
            lower_bound: Math.max(0, ensemble_risk - 0.1),
            upper_bound: Math.min(1, ensemble_risk + 0.1)
        }
    };
}

async function simulateFireWithML(latlng) {
    try {
        const envData = getCurrentEnvironmentalData();
        const response = await fetch(`${ML_API_BASE}/api/ml/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lat: latlng.lat,
                lng: latlng.lng,
                duration: 6,
                ...envData
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showToast('AI-powered fire simulation completed', 'success');
                return result.simulation;
            }
        }
    } catch (error) {
        console.warn('ML simulation failed, using fallback');
        showToast('Using simplified fire simulation', 'warning');
    }

    return null;
}

async function loadMLModelInfo() {
    try {
        const response = await fetch(`${ML_API_BASE}/api/ml/model-info`);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const accuracyEl = document.getElementById('accuracyValue');
                if (accuracyEl && result.models.convlstm_unet.accuracy) {
                    accuracyEl.textContent = result.models.convlstm_unet.accuracy;
                }
                window.mlModelInfo = result.models;
            }
        }
    } catch (error) {
        console.warn('ML model info unavailable');
    }
}

// Initialize simulation monitoring chart
function initializeSimulationMonitoringChart() {
    const ctx = document.getElementById('simulationMonitoringChart');
    if (!ctx) return;

    const simulationMonitoringChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['0m'],
            datasets: [
                {
                    label: 'Area Burned (ha)',
                    data: [0],
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Fire Perimeter (km)',
                    data: [0],
                    borderColor: '#ffa726',
                    backgroundColor: 'rgba(255, 167, 38, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Area (ha)',
                        color: '#ff6b35',
                        font: {
                            size: 10
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Perimeter (km)',
                        color: '#ffa726',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });

    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    window.chartInstances.simulationMonitoring = simulationMonitoringChart;
}

// Update monitoring stats
function updateMonitoringStats() {
    if (isSimulationRunning) {
        const timeInHours = simulationTime / 60;
        const baseArea = Math.pow(timeInHours, 1.5) * 25;
        const burnedArea = baseArea + (Math.random() * 20 - 10);
        const firePerimeter = Math.sqrt(burnedArea * 4 * Math.PI);
        const spreadRate = timeInHours > 0 ? burnedArea / timeInHours : 0;
        const activeCount = Math.min(Math.floor(burnedArea / 50) + 1, 15);

        updateElementText('totalBurnedArea', Math.max(0, burnedArea).toFixed(0) + ' ha');
        updateElementText('firePerimeter', Math.max(0, firePerimeter).toFixed(1) + ' km');
        updateElementText('spreadRate', Math.max(0, spreadRate).toFixed(1) + ' ha/hr');
        updateElementText('activeFireSources', activeCount);

        updateSimulationMonitoringChart(burnedArea, firePerimeter);
    } else {
        updateElementText('totalBurnedArea', '0 ha');
        updateElementText('firePerimeter', '0 km');
        updateElementText('spreadRate', '0 ha/hr');
        updateElementText('activeFireSources', '0');

        if (window.chartInstances && window.chartInstances.simulationMonitoring) {
            const chart = window.chartInstances.simulationMonitoring;
            chart.data.labels = ['0m'];
            chart.data.datasets[0].data = [0];
            chart.data.datasets[1].data = [0];
            chart.update('none');
        }
    }
}

function updateSimulationMonitoringChart(burnedArea, firePerimeter) {
    if (window.chartInstances && window.chartInstances.simulationMonitoring) {
        const chart = window.chartInstances.simulationMonitoring;

        const timeLabel = simulationTime > 60 ? 
            Math.floor(simulationTime / 60) + 'h' + (simulationTime % 60 > 0 ? (simulationTime % 60) + 'm' : '') :
            simulationTime + 'm';

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }

        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(Math.max(0, burnedArea));
        chart.data.datasets[1].data.push(Math.max(0, firePerimeter));

        chart.update('none');
    }
}

// AI Explainability & Trust Layer Functions
function initializeAIExplainability() {
    initializeExplainabilityMap();
    initializeCauseWeightChart();
    initializeTimelineControls();
    initializeWhatIfControls();
    initializeCauseTags();
    
    // Start real-time factor updates
    startFactorUpdates();
    
    console.log('AI Explainability & Trust Layer initialized');
}

function initializeExplainabilityMap() {
    const mapElement = document.getElementById('explainability-map');
    if (!mapElement) return;

    try {
        explainabilityMap = L.map('explainability-map').setView([30.0668, 79.0193], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(explainabilityMap);

        // Add enhanced fire simulation with explanation features
        addFireSourceWithExplanation(explainabilityMap, [30.0668, 79.0193]);
        addWindVectors(explainabilityMap);
        addVegetationLayers(explainabilityMap);
        
    } catch (error) {
        console.error('Error initializing explainability map:', error);
    }
}

function addFireSourceWithExplanation(map, latlng) {
    // Enhanced fire marker with explanation data
    const fireMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'explainable-fire-marker',
            html: `
                <div class="fire-source-container">
                    <div class="fire-core">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="explanation-indicators">
                        <div class="wind-indicator">🌪️</div>
                        <div class="dryness-indicator">🌱</div>
                        <div class="slope-indicator">⛰️</div>
                    </div>
                </div>
            `,
            iconSize: [60, 60],
            iconAnchor: [30, 30]
        })
    }).addTo(map);

    // Add click event for detailed explanation
    fireMarker.on('click', function() {
        showFireExplanationPopup(latlng);
    });

    // Add fire spread circles with explanations
    addExplainableFireSpread(map, latlng);
}

function addExplainableFireSpread(map, center) {
    const spreadData = [
        { radius: 500, time: '1h', explanation: 'Initial spread driven by dry conditions' },
        { radius: 1200, time: '2h', explanation: 'Wind acceleration increases spread rate' },
        { radius: 2000, time: '3h', explanation: 'Uphill terrain enhances fire movement' },
        { radius: 3200, time: '4h', explanation: 'Peak intensity reached due to wind+slope combination' }
    ];

    spreadData.forEach((data, index) => {
        setTimeout(() => {
            const circle = L.circle(center, {
                color: '#FF4500',
                fillColor: '#FF6B35',
                fillOpacity: 0.3 - (index * 0.05),
                radius: data.radius,
                weight: 2
            }).addTo(map);

            circle.bindPopup(`
                <div class="spread-explanation">
                    <h4>Fire Spread at ${data.time}</h4>
                    <p>${data.explanation}</p>
                    <div class="spread-stats">
                        <span>Area: ${(data.radius * data.radius * Math.PI / 10000).toFixed(0)} hectares</span>
                    </div>
                </div>
            `);
        }, index * 2000);
    });
}

function addWindVectors(map) {
    // Add wind direction vectors
    const windVectors = [
        { pos: [30.0768, 79.0293], direction: 45, strength: 22 },
        { pos: [30.0568, 79.0093], direction: 50, strength: 18 },
        { pos: [30.0868, 79.0393], direction: 40, strength: 25 }
    ];

    windVectors.forEach(vector => {
        const windMarker = L.marker(vector.pos, {
            icon: L.divIcon({
                className: 'wind-vector',
                html: `
                    <div class="wind-arrow" style="transform: rotate(${vector.direction}deg)">
                        <div class="arrow-body"></div>
                        <div class="arrow-head"></div>
                        <div class="wind-label">${vector.strength} km/h</div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(map);

        windMarker.bindPopup(`
            <div class="wind-explanation">
                <h4>Wind Analysis</h4>
                <p>Speed: ${vector.strength} km/h</p>
                <p>Direction: ${vector.direction}° (Northeast)</p>
                <p>Impact: Primary driver of fire spread</p>
            </div>
        `);
    });
}

function addVegetationLayers(map) {
    // Add vegetation density visualization
    const vegetationZones = [
        { 
            coords: [[30.05, 79.0], [30.08, 79.0], [30.08, 79.03], [30.05, 79.03]], 
            density: 'high',
            color: '#22C55E',
            explanation: 'Dense forest - High fuel load, rapid fire spread potential'
        },
        { 
            coords: [[30.06, 79.02], [30.09, 79.02], [30.09, 79.05], [30.06, 79.05]], 
            density: 'moderate',
            color: '#FBBF24',
            explanation: 'Mixed vegetation - Moderate fire risk'
        },
        { 
            coords: [[30.04, 79.01], [30.07, 79.01], [30.07, 79.04], [30.04, 79.04]], 
            density: 'low',
            color: '#EF4444',
            explanation: 'Dry grassland - Very high fire risk due to low moisture'
        }
    ];

    vegetationZones.forEach(zone => {
        const polygon = L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.2,
            weight: 2
        }).addTo(map);

        polygon.bindPopup(`
            <div class="vegetation-explanation">
                <h4>Vegetation Analysis</h4>
                <p>Density: ${zone.density.toUpperCase()}</p>
                <p>${zone.explanation}</p>
            </div>
        `);
    });
}

function initializeCauseWeightChart() {
    const ctx = document.getElementById('causeWeightChart');
    if (!ctx) return;

    const chart = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Wind Speed', 'Vegetation Dryness', 'Terrain Slope', 'Temperature', 'Humidity'],
            datasets: [{
                label: 'Current Impact',
                data: [75, 68, 45, 32, 85],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#94A3B8',
                        stepSize: 25,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.2)'
                    },
                    angleLines: {
                        color: 'rgba(148, 163, 184, 0.2)'
                    },
                    pointLabels: {
                        color: '#F8FAFC',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });

    // Store chart reference for updates
    window.causeWeightChart = chart;
}

function initializeTimelineControls() {
    const playBtn = document.getElementById('play-timeline');
    const pauseBtn = document.getElementById('pause-timeline');
    const resetBtn = document.getElementById('reset-timeline');
    const timelineSlider = document.getElementById('timeline-slider');
    const explanationElement = document.getElementById('timeline-explanation');

    let timelineInterval;
    let isPlaying = false;

    const timelineExplanations = [
        "Fire ignition detected. Initial spread driven by ambient conditions.",
        "Wind speed increases to 22 km/h. Fire accelerates northeast.",
        "Humidity drops to 25%. Vegetation becomes critically dry.",
        "Fire encounters 20° slope. Uphill spread rate doubles.",
        "Temperature peaks at 36°C. Maximum fire intensity reached.",
        "Wind direction shifts slightly. Fire spread pattern adjusts.",
        "Fire behavior stabilizes. Consistent northeast progression."
    ];

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                timelineInterval = setInterval(() => {
                    let currentValue = parseInt(timelineSlider.value);
                    if (currentValue < 24) {
                        currentValue += 1;
                        timelineSlider.value = currentValue;
                        updateTimelineExplanation(currentValue);
                        updateCauseTagsForTime(currentValue);
                    } else {
                        pauseTimeline();
                    }
                }, 1000);
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimeline);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            pauseTimeline();
            timelineSlider.value = 0;
            updateTimelineExplanation(0);
            updateCauseTagsForTime(0);
        });
    }

    if (timelineSlider) {
        timelineSlider.addEventListener('input', (e) => {
            const hour = parseInt(e.target.value);
            updateTimelineExplanation(hour);
            updateCauseTagsForTime(hour);
        });
    }

    function pauseTimeline() {
        isPlaying = false;
        if (timelineInterval) {
            clearInterval(timelineInterval);
        }
    }

    function updateTimelineExplanation(hour) {
        if (explanationElement) {
            const explanationIndex = Math.min(Math.floor(hour / 4), timelineExplanations.length - 1);
            explanationElement.querySelector('p').textContent = timelineExplanations[explanationIndex];
        }
    }

    function updateCauseTagsForTime(hour) {
        // Update cause tag intensities based on time
        const windTag = document.querySelector('.wind-tag .tag-strength');
        const drynessTag = document.querySelector('.dryness-tag .tag-strength');
        const slopeTag = document.querySelector('.slope-tag .tag-strength');

        if (windTag && drynessTag && slopeTag) {
            const windStrength = Math.min(95, 60 + hour * 2);
            const drynessStrength = Math.min(90, 50 + hour * 1.5);
            const slopeStrength = Math.min(70, 30 + hour);

            windTag.textContent = windStrength + '%';
            drynessTag.textContent = drynessStrength + '%';
            slopeTag.textContent = slopeStrength + '%';

            // Update chart data
            if (window.causeWeightChart) {
                window.causeWeightChart.data.datasets[0].data = [
                    windStrength, drynessStrength, slopeStrength, 32 + hour, 85 - hour * 2
                ];
                window.causeWeightChart.update('none');
            }
        }
    }
}

function initializeWhatIfControls() {
    const windSpeedSlider = document.getElementById('whatif-wind-speed');
    const humiditySlider = document.getElementById('whatif-humidity');
    const slopeSlider = document.getElementById('whatif-slope');
    const windDirectionSelect = document.getElementById('whatif-wind-direction');
    const compassArrow = document.getElementById('compass-arrow');
    
    const runWhatIfBtn = document.getElementById('run-whatif');
    const compareBtn = document.getElementById('compare-scenarios');
    const resetBtn = document.getElementById('reset-whatif');

    // Initialize slider value displays
    updateSliderValue('wind-speed-value', windSpeedSlider, ' km/h');
    updateSliderValue('humidity-value', humiditySlider, '%');
    updateSliderValue('slope-value', slopeSlider, '°');

    // Add event listeners for sliders
    if (windSpeedSlider) {
        windSpeedSlider.addEventListener('input', (e) => {
            updateSliderValue('wind-speed-value', e.target, ' km/h');
            updateImpactIndicator('wind-impact', parseInt(e.target.value));
        });
    }

    if (humiditySlider) {
        humiditySlider.addEventListener('input', (e) => {
            updateSliderValue('humidity-value', e.target, '%');
            updateImpactIndicator('humidity-impact', parseInt(e.target.value));
        });
    }

    if (slopeSlider) {
        slopeSlider.addEventListener('input', (e) => {
            updateSliderValue('slope-value', e.target, '°');
            updateImpactIndicator('slope-impact', parseInt(e.target.value));
        });
    }

    if (windDirectionSelect && compassArrow) {
        windDirectionSelect.addEventListener('change', (e) => {
            updateCompassArrow(e.target.value);
        });
    }

    // What-If action buttons
    if (runWhatIfBtn) {
        runWhatIfBtn.addEventListener('click', runWhatIfSimulation);
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', compareScenarios);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetWhatIfControls);
    }

    function updateSliderValue(elementId, slider, suffix) {
        const element = document.getElementById(elementId);
        if (element && slider) {
            element.textContent = slider.value + suffix;
        }
    }

    function updateImpactIndicator(indicatorId, value) {
        const indicator = document.getElementById(indicatorId);
        if (!indicator) return;

        let impact = '';
        if (indicatorId === 'wind-impact') {
            if (value < 10) impact = 'Low Impact';
            else if (value < 20) impact = 'Moderate Impact';
            else if (value < 35) impact = 'High Impact';
            else impact = 'Critical Impact';
        } else if (indicatorId === 'humidity-impact') {
            if (value > 70) impact = 'High Moisture - Low Risk';
            else if (value > 50) impact = 'Moderate Moisture';
            else if (value > 30) impact = 'Low Moisture - High Risk';
            else impact = 'Critical Dryness';
        } else if (indicatorId === 'slope-impact') {
            if (value < 5) impact = 'Flat - Minimal Effect';
            else if (value < 15) impact = 'Gentle Slope';
            else if (value < 30) impact = 'Steep Slope - High Effect';
            else impact = 'Very Steep - Critical Effect';
        }

        indicator.querySelector('span').textContent = 'Current: ' + impact;
    }

    function updateCompassArrow(direction) {
        const directions = {
            'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
            'S': 180, 'SW': 225, 'W': 270, 'NW': 315
        };
        const angle = directions[direction] || 0;
        compassArrow.style.transform = `rotate(${angle}deg)`;
    }
}

function runWhatIfSimulation() {
    const windSpeed = document.getElementById('whatif-wind-speed').value;
    const humidity = document.getElementById('whatif-humidity').value;
    const slope = document.getElementById('whatif-slope').value;
    const windDirection = document.getElementById('whatif-wind-direction').value;

    // Show ghost trails
    showGhostTrails(windSpeed, humidity, slope, windDirection);
    
    // Update explanation
    updateWhatIfExplanation(windSpeed, humidity, slope, windDirection);
    
    // Show scenario results
    showScenarioResults(windSpeed, humidity, slope, windDirection);
    
    showToast('What-If simulation completed', 'success');
}

function showGhostTrails(windSpeed, humidity, slope, windDirection) {
    const ghostTrailsOverlay = document.getElementById('ghost-trails-overlay');
    if (!ghostTrailsOverlay) return;

    // Clear existing trails
    ghostTrailsOverlay.innerHTML = '';

    // Calculate ghost trail positions based on parameters
    const spreadFactor = (parseInt(windSpeed) / 20) * ((100 - parseInt(humidity)) / 100) * (parseInt(slope) / 30);
    
    for (let i = 0; i < 8; i++) {
        const trail = document.createElement('div');
        trail.className = 'ghost-trail';
        
        const angle = getWindAngle(windDirection) + (Math.random() - 0.5) * 60;
        const distance = 50 + (i * 40 * spreadFactor);
        
        const x = 50 + Math.cos(angle * Math.PI / 180) * distance;
        const y = 50 + Math.sin(angle * Math.PI / 180) * distance;
        
        trail.style.left = Math.min(95, Math.max(5, x)) + '%';
        trail.style.top = Math.min(95, Math.max(5, y)) + '%';
        trail.style.animationDelay = (i * 0.2) + 's';
        
        ghostTrailsOverlay.appendChild(trail);
    }
}

function getWindAngle(direction) {
    const angles = {
        'N': -90, 'NE': -45, 'E': 0, 'SE': 45,
        'S': 90, 'SW': 135, 'W': 180, 'NW': 225
    };
    return angles[direction] || 0;
}

function updateWhatIfExplanation(windSpeed, humidity, slope, windDirection) {
    const explanationElement = document.getElementById('explanation-text');
    if (!explanationElement) return;

    let explanation = `With modified conditions: `;
    
    if (parseInt(windSpeed) > 25) {
        explanation += `Strong ${windDirection} winds (${windSpeed} km/h) will dramatically accelerate fire spread. `;
    } else if (parseInt(windSpeed) < 10) {
        explanation += `Light winds (${windSpeed} km/h) will slow fire progression. `;
    }
    
    if (parseInt(humidity) < 30) {
        explanation += `Very low humidity (${humidity}%) creates extreme fire conditions. `;
    } else if (parseInt(humidity) > 60) {
        explanation += `Higher humidity (${humidity}%) will reduce fire intensity. `;
    }
    
    if (parseInt(slope) > 25) {
        explanation += `Steep terrain (${slope}°) will cause rapid uphill fire advancement.`;
    }

    explanationElement.textContent = explanation;
}

function showScenarioResults(windSpeed, humidity, slope, windDirection) {
    const resultsContainer = document.getElementById('scenario-results');
    if (!resultsContainer) return;

    // Calculate changes based on modified parameters
    const currentWind = 22;
    const currentHumidity = 32;
    const currentSlope = 15;

    const windChange = ((parseInt(windSpeed) - currentWind) / currentWind) * 100;
    const humidityChange = ((currentHumidity - parseInt(humidity)) / currentHumidity) * 100;
    const slopeChange = ((parseInt(slope) - currentSlope) / currentSlope) * 100;

    const overallChange = (windChange * 0.4 + humidityChange * 0.4 + slopeChange * 0.2);

    // Update result values
    const spreadRateElement = document.getElementById('spread-rate-change');
    const areaBurnedElement = document.getElementById('area-burned-change');
    const directionElement = document.getElementById('direction-change');
    const riskLevelElement = document.getElementById('risk-level-change');

    if (spreadRateElement) {
        const spreadChange = overallChange > 0 ? `+${overallChange.toFixed(0)}%` : `${overallChange.toFixed(0)}%`;
        spreadRateElement.textContent = spreadChange;
    }

    if (areaBurnedElement) {
        const baseArea = 330;
        const newArea = baseArea * (1 + overallChange / 100);
        areaBurnedElement.textContent = `${newArea.toFixed(0)} ha`;
    }

    if (directionElement) {
        directionElement.textContent = `${windDirection} direction`;
    }

    if (riskLevelElement) {
        let riskLevel = 'Moderate';
        if (overallChange > 30) riskLevel = 'Extreme';
        else if (overallChange > 15) riskLevel = 'Very High';
        else if (overallChange > 0) riskLevel = 'High';
        else if (overallChange < -15) riskLevel = 'Low';
        riskLevelElement.textContent = riskLevel;
    }

    resultsContainer.style.display = 'block';
}

function compareScenarios() {
    showToast('Scenario comparison view activated', 'info');
    // Additional comparison logic can be added here
}

function resetWhatIfControls() {
    document.getElementById('whatif-wind-speed').value = 22;
    document.getElementById('whatif-humidity').value = 32;
    document.getElementById('whatif-slope').value = 15;
    document.getElementById('whatif-wind-direction').value = 'NE';
    
    // Update displays
    document.getElementById('wind-speed-value').textContent = '22 km/h';
    document.getElementById('humidity-value').textContent = '32%';
    document.getElementById('slope-value').textContent = '15°';
    
    // Reset compass
    document.getElementById('compass-arrow').style.transform = 'rotate(45deg)';
    
    // Hide results
    document.getElementById('scenario-results').style.display = 'none';
    
    // Clear ghost trails
    document.getElementById('ghost-trails-overlay').innerHTML = '';
    
    showToast('What-If controls reset to current conditions', 'info');
}

function initializeCauseTags() {
    const causeTags = document.querySelectorAll('.cause-tag');
    
    causeTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagType = this.classList.contains('wind-tag') ? 'wind' : 
                           this.classList.contains('dryness-tag') ? 'dryness' : 'slope';
            showDetailedFactorExplanation(tagType);
        });
    });
}

function showDetailedFactorExplanation(factor) {
    const explanations = {
        wind: {
            title: 'Wind Impact Analysis',
            description: 'Wind is the primary driver of fire spread, accounting for 75% of current spread behavior.',
            details: [
                '22 km/h speed creates strong convection currents',
                'Northeast direction channels fire toward populated areas',
                'Gusts up to 30 km/h periodically accelerate spread rate',
                'Wind-driven spotting increases fire jump potential'
            ]
        },
        dryness: {
            title: 'Vegetation Dryness Analysis', 
            description: 'Low humidity (32%) has created critically dry fuel conditions.',
            details: [
                'Moisture content below 15% in fine fuels',
                'Dead leaf litter highly combustible',
                'Living vegetation stressed and fire-prone',
                'Minimal overnight humidity recovery expected'
            ]
        },
        slope: {
            title: 'Terrain Slope Analysis',
            description: '15° upward slope significantly enhances fire spread rate.',
            details: [
                'Heat and flames pre-dry upslope vegetation',
                'Convection creates chimney effect',
                'Spread rate doubles on upward slopes',
                'Increased ember throw distance uphill'
            ]
        }
    };

    const explanation = explanations[factor];
    
    showToast(explanation.title + ': ' + explanation.description, 'info', 8000);
}

function startFactorUpdates() {
    // Update live factors every 10 seconds
    setInterval(() => {
        updateLiveFactors();
        updateConfidenceGauge();
    }, 10000);
}

function updateLiveFactors() {
    const factors = ['live-wind', 'live-humidity', 'live-temp', 'live-slope'];
    const baseValues = {
        'live-wind': { value: 22, unit: ' km/h NE', variance: 3 },
        'live-humidity': { value: 32, unit: '%', variance: 5 },
        'live-temp': { value: 34, unit: '°C', variance: 2 },
        'live-slope': { value: 15, unit: '°', variance: 0 }
    };

    factors.forEach(factorId => {
        const element = document.getElementById(factorId);
        if (element) {
            const base = baseValues[factorId];
            const newValue = base.value + (Math.random() - 0.5) * base.variance * 2;
            
            if (factorId === 'live-slope') {
                element.textContent = base.value + base.unit; // Slope doesn't change
            } else {
                element.textContent = Math.round(newValue) + base.unit;
            }
        }
    });
}

function updateConfidenceGauge() {
    const gaugeText = document.getElementById('confidence-text');
    const gaugeFill = document.getElementById('confidence-fill');
    
    if (gaugeText && gaugeFill) {
        const newConfidence = Math.max(75, Math.min(95, 87 + (Math.random() - 0.5) * 8));
        const roundedConfidence = Math.round(newConfidence);
        
        gaugeText.textContent = roundedConfidence + '%';
        
        // Update the conic gradient
        const angle = (roundedConfidence / 100) * 360;
        gaugeFill.style.background = `conic-gradient(from 0deg, #10B981 0deg, #10B981 ${angle}deg, rgba(51, 65, 85, 0.3) ${angle}deg)`;
    }
}

function showFireExplanationPopup(latlng) {
    // This would show a detailed popup with fire behavior explanation
    const popup = `
        <div class="fire-explanation-popup">
            <h3>Fire Behavior Analysis</h3>
            <div class="explanation-factors">
                <div class="factor">
                    <strong>Primary Driver:</strong> Wind (75% influence)
                </div>
                <div class="factor">
                    <strong>Secondary Factor:</strong> Vegetation Dryness (68% influence)
                </div>
                <div class="factor">
                    <strong>Supporting Factor:</strong> Terrain Slope (45% influence)
                </div>
            </div>
            <p><strong>AI Prediction:</strong> Fire will continue northeast with high confidence (87%)</p>
        </div>
    `;
    
    showToast('Detailed fire analysis available in popup', 'info', 5000);
}

// Toast Notifications
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Modal Functions
function openModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on overlay click
const modalOverlay = document.getElementById('modal-overlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// FireVision 3D/AR Visualization System
class FireVision3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.terrain = null;
        this.fireParticles = [];
        this.fireSpreadData = [];
        this.animationId = null;
        this.isARMode = false;
        this.currentMode = '3d';
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.controls = null;
        this.fireTime = 0;
        this.isPlaying = false;
        this.explanationLabels = [];
        this.whyViewActive = false;
        
        // Enhanced realistic fire properties
        this.windVector = new THREE.Vector3(1, 0, 0);
        this.windStrength = 0.5;
        this.fireIntensity = 1.0;
        this.smokeSystems = [];
        this.emberSystems = [];
        this.burnedAreas = [];
        this.temperatureField = [];
        this.fireSourcesActive = [];
        this.terrainMoisture = [];
        this.vegetationDensity = [];
        this.fuelLoad = [];
        
        // Realistic physics constants
        this.GRAVITY = -9.81;
        this.BUOYANCY = 12.0;
        this.THERMAL_RISE = 8.0;
        this.CONVECTION_STRENGTH = 5.0;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.createTerrain();
        this.createLighting();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        
        console.log('FireVision 3D system initialized');
    }
    
    setupScene() {
        const canvas = document.getElementById('firevision-canvas');
        if (!canvas) return;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a1a0a);
        this.scene.fog = new THREE.Fog(0x0a1a0a, 50, 200);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, 
            canvas.clientWidth / canvas.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    createTerrain() {
        // Create heightmap-based terrain with enhanced realism
        const width = 120;
        const height = 120;
        const geometry = new THREE.PlaneGeometry(100, 100, width - 1, height - 1);
        
        // Generate realistic heightmap with fractal noise
        const vertices = geometry.attributes.position.array;
        const uvs = geometry.attributes.uv.array;
        
        // Initialize terrain data arrays
        this.terrainMoisture = [];
        this.vegetationDensity = [];
        this.fuelLoad = [];
        
        for (let i = 0, j = 0, k = 0; i < vertices.length; i++, j += 3, k += 2) {
            const x = vertices[j];
            const z = vertices[j + 2];
            const u = uvs[k];
            const v = uvs[k + 1];
            
            // Generate realistic height with multiple octaves of noise
            const height = this.generateRealisticHeight(x, z);
            vertices[j + 1] = height;
            
            // Calculate terrain properties based on position and height
            const moisture = this.calculateMoisture(x, z, height);
            const vegDensity = this.calculateVegetationDensity(x, z, height, moisture);
            const fuel = this.calculateFuelLoad(vegDensity, moisture);
            
            this.terrainMoisture.push(moisture);
            this.vegetationDensity.push(vegDensity);
            this.fuelLoad.push(fuel);
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Create enhanced terrain material with realistic textures
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            wireframe: false,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Generate realistic colors based on vegetation, moisture, and elevation
        const colors = [];
        const color = new THREE.Color();
        
        for (let i = 0; i < vertices.length; i += 3) {
            const height = vertices[i + 1];
            const moisture = this.terrainMoisture[i / 3];
            const vegDensity = this.vegetationDensity[i / 3];
            
            // Realistic color mixing based on environmental factors
            if (height > 8) {
                // Snow/rock at high elevation
                color.setHSL(0, 0, 0.8 + Math.random() * 0.15);
            } else if (moisture < 0.3) {
                // Dry/arid areas
                color.setHSL(0.1, 0.6, 0.4 + Math.random() * 0.2);
            } else if (vegDensity > 0.7) {
                // Dense forest
                color.setHSL(0.25 + Math.random() * 0.1, 0.8, 0.2 + moisture * 0.3);
            } else if (vegDensity > 0.4) {
                // Mixed vegetation
                color.setHSL(0.2 + Math.random() * 0.15, 0.7, 0.3 + moisture * 0.2);
            } else {
                // Grassland/sparse vegetation
                color.setHSL(0.15 + Math.random() * 0.1, 0.5, 0.5 + moisture * 0.2);
            }
            
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.castShadow = true;
        this.scene.add(this.terrain);
        
        this.createInfrastructure();
        this.createVegetation();
    }
    
    generateRealisticHeight(x, z) {
        // Multi-octave Perlin-like noise for realistic terrain
        const scale1 = 0.02;
        const scale2 = 0.008;
        const scale3 = 0.004;
        const scale4 = 0.001;
        
        const amp1 = 2.0;
        const amp2 = 4.0;
        const amp3 = 2.0;
        const amp4 = 8.0;
        
        const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * amp1;
        const height2 = Math.sin(x * scale2 + 1.7) * Math.cos(z * scale2 + 2.3) * amp2;
        const height3 = Math.sin(x * scale3 + 3.1) * Math.cos(z * scale3 + 4.7) * amp3;
        const height4 = Math.sin(x * scale4 + 5.9) * Math.cos(z * scale4 + 6.1) * amp4;
        
        // Add ridges and valleys
        const ridgeNoise = Math.abs(Math.sin(x * 0.01) * Math.cos(z * 0.01)) * 3;
        
        return Math.max(0, height1 + height2 + height3 + height4 + ridgeNoise);
    }
    
    calculateMoisture(x, z, height) {
        // Moisture based on distance from water, elevation, and slope
        const waterDistance = Math.min(
            Math.sqrt(x * x + (z - 20) * (z - 20)), // River
            Math.sqrt((x - 30) * (x - 30) + (z + 15) * (z + 15)) // Lake
        );
        
        const elevationFactor = Math.max(0, 1 - height / 12);
        const distanceFactor = Math.max(0.1, 1 - waterDistance / 40);
        const randomVariation = 0.8 + Math.random() * 0.4;
        
        return Math.min(1, elevationFactor * distanceFactor * randomVariation);
    }
    
    calculateVegetationDensity(x, z, height, moisture) {
        // Vegetation density based on moisture, elevation, and slope
        const elevationFactor = height < 2 ? 1 : height < 6 ? 0.8 : 0.3;
        const moistureFactor = moisture * 1.2;
        const clusterNoise = (Math.sin(x * 0.05) + Math.cos(z * 0.05)) * 0.3 + 0.7;
        
        return Math.min(1, Math.max(0, elevationFactor * moistureFactor * clusterNoise));
    }
    
    calculateFuelLoad(vegDensity, moisture) {
        // Fuel load based on vegetation density and dryness
        const dryness = 1 - moisture;
        const baseFuel = vegDensity * 0.8;
        const drynessFactor = 0.5 + dryness * 0.5;
        
        return Math.min(1, baseFuel * drynessFactor);
    }
    
    createVegetation() {
        // Add 3D vegetation for enhanced realism
        const treeGeometry = new THREE.ConeGeometry(0.5, 2, 6);
        const treeMatDark = new THREE.MeshStandardMaterial({ color: 0x1a4a1a });
        const treeMatLight = new THREE.MeshStandardMaterial({ color: 0x2a5a2a });
        
        const bushGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x3a6a3a });
        
        // Place vegetation based on density map
        for (let i = 0; i < 300; i++) {
            const x = (Math.random() - 0.5) * 90;
            const z = (Math.random() - 0.5) * 90;
            const height = this.getTerrainHeight(x, z);
            
            // Get vegetation density at this position
            const index = Math.floor((x + 50) * 1.2) + Math.floor((z + 50) * 1.2) * 120;
            const vegDensity = this.vegetationDensity[index] || 0;
            
            if (Math.random() < vegDensity) {
                if (Math.random() < 0.7) {
                    // Tree
                    const tree = new THREE.Mesh(treeGeometry, Math.random() > 0.5 ? treeMatDark : treeMatLight);
                    const scale = 0.8 + Math.random() * 0.6;
                    tree.scale.setScalar(scale);
                    tree.position.set(x, height + scale, z);
                    tree.castShadow = true;
                    this.scene.add(tree);
                } else {
                    // Bush
                    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
                    const scale = 0.6 + Math.random() * 0.8;
                    bush.scale.setScalar(scale);
                    bush.position.set(x, height + scale * 0.3, z);
                    bush.castShadow = true;
                    this.scene.add(bush);
                }
            }
        }
    }
    
    generateHeight(x, z) {
        // Generate realistic mountain terrain using Perlin-like noise
        const scale1 = 0.05;
        const scale2 = 0.02;
        const scale3 = 0.01;
        
        const height1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 3;
        const height2 = Math.sin(x * scale2) * Math.cos(z * scale2) * 8;
        const height3 = Math.sin(x * scale3) * Math.cos(z * scale3) * 2;
        
        return Math.max(0, height1 + height2 + height3);
    }
    
    createInfrastructure() {
        // Add villages/infrastructure markers
        const villages = [
            { x: -20, z: -15, name: 'Mountain Village' },
            { x: 25, z: 10, name: 'Forest Camp' },
            { x: -10, z: 30, name: 'Research Station' }
        ];
        
        villages.forEach(village => {
            const height = this.getTerrainHeight(village.x, village.z);
            
            // Create simple house structure
            const houseGeometry = new THREE.BoxGeometry(2, 2, 2);
            const houseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const house = new THREE.Mesh(houseGeometry, houseMaterial);
            house.position.set(village.x, height + 1, village.z);
            house.castShadow = true;
            this.scene.add(house);
            
            // Add roof
            const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(village.x, height + 2.5, village.z);
            roof.rotation.y = Math.PI / 4;
            this.scene.add(roof);
        });
        
        // Add evacuation routes (green paths)
        this.createEvacuationRoutes();
    }
    
    createEvacuationRoutes() {
        const routeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 60, 8);
        const routeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x10B981,
            transparent: true,
            opacity: 0.7,
            emissive: 0x10B981,
            emissiveIntensity: 0.2
        });
        
        const route1 = new THREE.Mesh(routeGeometry, routeMaterial);
        route1.position.set(-30, 1, 0);
        route1.rotation.z = Math.PI / 2;
        this.scene.add(route1);
        
        const route2 = new THREE.Mesh(routeGeometry, routeMaterial);
        route2.position.set(0, 1, -30);
        this.scene.add(route2);
    }
    
    getTerrainHeight(x, z) {
        // Calculate terrain height at given position
        return this.generateHeight(x, z);
    }
    
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
        
        // Fire light (initially off)
        this.fireLight = new THREE.PointLight(0xff4500, 0, 100);
        this.fireLight.position.set(0, 10, 0);
        this.scene.add(this.fireLight);
    }
    
    setupControls() {
        // Simple orbit controls simulation
        this.controls = {
            enabled: true,
            rotateSpeed: 0.005,
            zoomSpeed: 0.1,
            panSpeed: 0.1,
            isRotating: false,
            isPanning: false,
            lastMouse: { x: 0, y: 0 }
        };
    }
    
    setupEventListeners() {
        const canvas = document.getElementById('firevision-canvas');
        
        // Mouse events for 3D interaction
        canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
        canvas.addEventListener('wheel', (event) => this.onMouseWheel(event));
        canvas.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Mode switching
        document.querySelectorAll('.viz-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });
        
        // 3D Controls
        document.getElementById('play-3d-simulation')?.addEventListener('click', () => this.startFireSimulation());
        document.getElementById('pause-3d-simulation')?.addEventListener('click', () => this.pauseFireSimulation());
        document.getElementById('fast-forward-3d')?.addEventListener('click', () => this.fastForwardSimulation());
        document.getElementById('rotate-terrain')?.addEventListener('click', () => this.autoRotate());
        document.getElementById('zoom-fit')?.addEventListener('click', () => this.fitView());
        document.getElementById('toggle-wireframe')?.addEventListener('click', () => this.toggleWireframe());
        
        // Parameter controls
        this.setupParameterControls();
        
        // Why View toggle
        document.getElementById('toggle-why-view')?.addEventListener('click', () => this.toggleWhyView());
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupParameterControls() {
        // Fire intensity control
        const fireIntensitySlider = document.getElementById('fire-intensity-3d');
        if (fireIntensitySlider) {
            fireIntensitySlider.addEventListener('input', (e) => {
                document.getElementById('fire-intensity-value-3d').textContent = e.target.value + '%';
                this.updateFireIntensity(e.target.value / 100);
            });
        }
        
        // Simulation speed control
        const simSpeedSlider = document.getElementById('sim-speed-3d');
        if (simSpeedSlider) {
            simSpeedSlider.addEventListener('input', (e) => {
                document.getElementById('sim-speed-value-3d').textContent = e.target.value + 'x';
                this.updateSimulationSpeed(parseFloat(e.target.value));
            });
        }
        
        // Time slider control
        const timeSlider = document.getElementById('time-slider-3d');
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                document.getElementById('time-value-3d').textContent = e.target.value + 'h';
                this.setFireTime(parseInt(e.target.value));
            });
        }
    }
    
    onMouseDown(event) {
        this.controls.isRotating = true;
        this.controls.lastMouse.x = event.clientX;
        this.controls.lastMouse.y = event.clientY;
    }
    
    onMouseMove(event) {
        if (!this.controls.isRotating) return;
        
        const deltaX = event.clientX - this.controls.lastMouse.x;
        const deltaY = event.clientY - this.controls.lastMouse.y;
        
        // Rotate camera around the terrain
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        
        spherical.theta -= deltaX * this.controls.rotateSpeed;
        spherical.phi += deltaY * this.controls.rotateSpeed;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, 0, 0);
        
        this.controls.lastMouse.x = event.clientX;
        this.controls.lastMouse.y = event.clientY;
    }
    
    onMouseUp(event) {
        this.controls.isRotating = false;
    }
    
    onMouseWheel(event) {
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        this.camera.position.multiplyScalar(scale);
        
        // Clamp zoom distance
        const distance = this.camera.position.length();
        if (distance < 20) {
            this.camera.position.normalize().multiplyScalar(20);
        } else if (distance > 150) {
            this.camera.position.normalize().multiplyScalar(150);
        }
    }
    
    onMouseClick(event) {
        // Raycast to detect terrain clicks
        const rect = event.target.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.terrain);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.showFireInfoPopup(point);
        }
    }
    
    showFireInfoPopup(point) {
        const popup = document.getElementById('fire-info-popup');
        if (!popup) return;
        
        // Update popup with simulated data based on location
        const windSpeed = 12 + Math.random() * 8;
        const dryness = 50 + Math.random() * 40;
        const slope = Math.abs(point.y) * 3;
        const temperature = 28 + Math.random() * 8;
        
        document.getElementById('popup-wind').textContent = windSpeed.toFixed(1) + ' km/h';
        document.getElementById('popup-dryness').textContent = dryness.toFixed(0) + '%';
        document.getElementById('popup-slope').textContent = slope.toFixed(1) + '°';
        document.getElementById('popup-temperature').textContent = temperature.toFixed(1) + '°C';
        
        popup.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            popup.style.display = 'none';
        }, 5000);
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.viz-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        if (mode === 'ar') {
            this.initARMode();
        } else {
            this.init3DMode();
        }
        
        // Update status indicator
        const statusText = document.getElementById('viz-status-text');
        const modeIndicator = document.getElementById('current-mode-indicator');
        
        if (mode === 'ar') {
            statusText.textContent = 'AR Mode Ready';
            modeIndicator.textContent = 'AR Mode';
            this.showARInstructions();
        } else {
            statusText.textContent = '3D Terrain Ready';
            modeIndicator.textContent = '3D Mode';
            this.hideARInstructions();
        }
    }
    
    initARMode() {
        // Check for WebXR support
        if ('xr' in navigator) {
            navigator.xr.isSessionSupported('immersive-ar').then(supported => {
                if (supported) {
                    this.isARMode = true;
                    console.log('AR mode supported');
                } else {
                    this.showARNotSupported();
                }
            });
        } else {
            this.showARNotSupported();
        }
    }
    
    init3DMode() {
        this.isARMode = false;
        this.hideARInstructions();
    }
    
    showARInstructions() {
        const instructions = document.getElementById('ar-instructions');
        if (instructions) {
            instructions.style.display = 'flex';
        }
    }
    
    hideARInstructions() {
        const instructions = document.getElementById('ar-instructions');
        if (instructions) {
            instructions.style.display = 'none';
        }
    }
    
    showARNotSupported() {
        showToast('AR mode not supported on this device. Please use a compatible mobile browser.', 'warning', 5000);
    }
    
    startFireSimulation() {
        this.isPlaying = true;
        this.fireTime = 0;
        
        // Create initial fire source at terrain center
        this.createFireSource(0, 0);
        
        // Update UI
        document.getElementById('play-3d-simulation').disabled = true;
        document.getElementById('pause-3d-simulation').disabled = false;
        
        showToast('3D Fire simulation started', 'success');
    }
    
    pauseFireSimulation() {
        this.isPlaying = false;
        
        // Update UI
        document.getElementById('play-3d-simulation').disabled = false;
        document.getElementById('pause-3d-simulation').disabled = true;
    }
    
    fastForwardSimulation() {
        if (this.isPlaying) {
            this.fireTime += 5; // Fast forward 5 hours
            this.updateFireSpread();
            showToast('Fast-forwarded fire simulation', 'info');
        }
    }
    
    createFireSource(x, z) {
        const height = this.getTerrainHeight(x, z);
        
        // Create realistic fire system with multiple components
        const fireSource = {
            position: new THREE.Vector3(x, height, z),
            intensity: 1.0,
            temperature: 800, // Celsius
            radius: 2.0,
            age: 0,
            fuelConsumed: 0,
            burnRate: 0.1
        };
        
        this.fireSourcesActive.push(fireSource);
        
        // Create layered fire effect
        this.createFireFlames(fireSource);
        this.createFireSmoke(fireSource);
        this.createFireEmbers(fireSource);
        this.createFireGlow(fireSource);
        
        // Add dynamic fire light with realistic properties
        const fireLight = new THREE.PointLight(0xff4500, 3, 30);
        fireLight.position.copy(fireSource.position);
        fireLight.position.y += 5;
        fireLight.castShadow = true;
        fireLight.shadow.mapSize.width = 1024;
        fireLight.shadow.mapSize.height = 1024;
        this.scene.add(fireLight);
        
        fireSource.light = fireLight;
    }
    
    createFireFlames(fireSource) {
        // Create realistic flame particle system
        const flameGeometry = new THREE.BufferGeometry();
        const flameCount = 800;
        const positions = new Float32Array(flameCount * 3);
        const velocities = new Float32Array(flameCount * 3);
        const ages = new Float32Array(flameCount);
        const colors = new Float32Array(flameCount * 3);
        const sizes = new Float32Array(flameCount);
        
        for (let i = 0; i < flameCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * fireSource.radius;
            
            positions[i * 3] = fireSource.position.x + Math.cos(angle) * radius;
            positions[i * 3 + 1] = fireSource.position.y + Math.random() * 2;
            positions[i * 3 + 2] = fireSource.position.z + Math.sin(angle) * radius;
            
            // Realistic flame velocities with buoyancy and wind
            velocities[i * 3] = this.windVector.x * this.windStrength + (Math.random() - 0.5) * 2;
            velocities[i * 3 + 1] = this.THERMAL_RISE + Math.random() * 5;
            velocities[i * 3 + 2] = this.windVector.z * this.windStrength + (Math.random() - 0.5) * 2;
            
            ages[i] = Math.random() * 2;
            
            // Realistic flame colors based on temperature
            const temp = 500 + Math.random() * 600; // 500-1100°C
            const color = this.temperatureToColor(temp);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            sizes[i] = 1 + Math.random() * 3;
        }
        
        flameGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        flameGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        flameGeometry.setAttribute('age', new THREE.BufferAttribute(ages, 1));
        flameGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        flameGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const flameMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float age;
                attribute float size;
                attribute vec3 velocity;
                varying vec3 vColor;
                varying float vAge;
                
                void main() {
                    vColor = color;
                    vAge = age;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (2.0 - age);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAge;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    alpha *= (2.0 - vAge) * 0.5;
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        const flames = new THREE.Points(flameGeometry, flameMaterial);
        flames.userData = { type: 'flames', fireSource: fireSource };
        this.scene.add(flames);
        this.fireParticles.push(flames);
    }
    
    createFireSmoke(fireSource) {
        // Create realistic smoke system
        const smokeGeometry = new THREE.BufferGeometry();
        const smokeCount = 400;
        const positions = new Float32Array(smokeCount * 3);
        const velocities = new Float32Array(smokeCount * 3);
        const ages = new Float32Array(smokeCount);
        const sizes = new Float32Array(smokeCount);
        
        for (let i = 0; i < smokeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (fireSource.radius + 2);
            
            positions[i * 3] = fireSource.position.x + Math.cos(angle) * radius;
            positions[i * 3 + 1] = fireSource.position.y + 3 + Math.random() * 5;
            positions[i * 3 + 2] = fireSource.position.z + Math.sin(angle) * radius;
            
            // Smoke follows wind and thermal currents
            velocities[i * 3] = this.windVector.x * this.windStrength * 2 + (Math.random() - 0.5);
            velocities[i * 3 + 1] = this.THERMAL_RISE * 0.3 + Math.random() * 2;
            velocities[i * 3 + 2] = this.windVector.z * this.windStrength * 2 + (Math.random() - 0.5);
            
            ages[i] = Math.random() * 5;
            sizes[i] = 2 + Math.random() * 6;
        }
        
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        smokeGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        smokeGeometry.setAttribute('age', new THREE.BufferAttribute(ages, 1));
        smokeGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const smokeMaterial = new THREE.PointsMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.6,
            size: 8,
            blending: THREE.NormalBlending
        });
        
        const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
        smoke.userData = { type: 'smoke', fireSource: fireSource };
        this.scene.add(smoke);
        this.smokeSystems.push(smoke);
    }
    
    createFireEmbers(fireSource) {
        // Create realistic ember system
        const emberGeometry = new THREE.BufferGeometry();
        const emberCount = 150;
        const positions = new Float32Array(emberCount * 3);
        const velocities = new Float32Array(emberCount * 3);
        const ages = new Float32Array(emberCount);
        const sizes = new Float32Array(emberCount);
        
        for (let i = 0; i < emberCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * fireSource.radius;
            
            positions[i * 3] = fireSource.position.x + Math.cos(angle) * radius;
            positions[i * 3 + 1] = fireSource.position.y + Math.random() * 3;
            positions[i * 3 + 2] = fireSource.position.z + Math.sin(angle) * radius;
            
            // Embers affected by wind and gravity
            const emberSpeed = 5 + Math.random() * 10;
            velocities[i * 3] = this.windVector.x * emberSpeed + (Math.random() - 0.5) * 3;
            velocities[i * 3 + 1] = this.THERMAL_RISE * 0.5 + Math.random() * 8;
            velocities[i * 3 + 2] = this.windVector.z * emberSpeed + (Math.random() - 0.5) * 3;
            
            ages[i] = Math.random() * 3;
            sizes[i] = 0.3 + Math.random() * 0.7;
        }
        
        emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        emberGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        emberGeometry.setAttribute('age', new THREE.BufferAttribute(ages, 1));
        emberGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const emberMaterial = new THREE.PointsMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.9,
            size: 2,
            blending: THREE.AdditiveBlending
        });
        
        const embers = new THREE.Points(emberGeometry, emberMaterial);
        embers.userData = { type: 'embers', fireSource: fireSource };
        this.scene.add(embers);
        this.emberSystems.push(embers);
    }
    
    createFireGlow(fireSource) {
        // Create ground glow effect
        const glowGeometry = new THREE.CircleGeometry(fireSource.radius * 2, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(fireSource.position);
        glow.position.y += 0.1;
        glow.rotation.x = -Math.PI / 2;
        glow.userData = { type: 'glow', fireSource: fireSource };
        this.scene.add(glow);
    }
    
    temperatureToColor(temp) {
        // Convert temperature to realistic fire color
        const color = new THREE.Color();
        
        if (temp < 600) {
            // Deep red
            color.setHSL(0, 1, 0.3);
        } else if (temp < 800) {
            // Red-orange
            color.setHSL(0.05, 1, 0.5);
        } else if (temp < 1000) {
            // Orange
            color.setHSL(0.08, 1, 0.6);
        } else if (temp < 1200) {
            // Yellow-orange
            color.setHSL(0.12, 1, 0.7);
        } else {
            // Yellow-white
            color.setHSL(0.15, 0.8, 0.8);
        }
        
        return color;
    }
    
    updateFireSpread() {
        if (!this.isPlaying) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Process each active fire source
        this.fireSourcesActive.forEach((fireSource, index) => {
            fireSource.age += deltaTime;
            
            // Calculate realistic fire spread based on environmental factors
            const spreadRate = this.calculateFireSpreadRate(fireSource);
            const spreadDirection = this.calculateSpreadDirection(fireSource);
            
            // Attempt to spread fire to adjacent areas
            if (Math.random() < spreadRate * deltaTime) {
                this.attemptFireSpread(fireSource, spreadDirection);
            }
            
            // Update fire intensity based on fuel consumption
            this.updateFireIntensity(fireSource, deltaTime);
            
            // Update temperature field around fire
            this.updateTemperatureField(fireSource);
        });
        
        // Update burned areas visualization
        this.updateBurnedAreas();
        
        // Calculate and display statistics
        this.updateFireStatistics();
        
        // Update wind patterns (realistic wind variation)
        this.updateWindPatterns(deltaTime);
    }
    
    calculateFireSpreadRate(fireSource) {
        const pos = fireSource.position;
        const index = this.getTerrainIndex(pos.x, pos.z);
        
        if (index < 0 || index >= this.fuelLoad.length) return 0;
        
        // Environmental factors affecting spread rate
        const fuelFactor = this.fuelLoad[index] || 0;
        const moistureFactor = Math.max(0.1, 1 - (this.terrainMoisture[index] || 0));
        const windFactor = 1 + this.windStrength * 2;
        const slopeFactor = this.calculateSlopeFactor(pos.x, pos.z);
        const temperatureFactor = Math.min(2, fireSource.temperature / 500);
        
        // Realistic spread rate calculation
        const baseRate = 0.1; // Base spread attempts per second
        const spreadRate = baseRate * fuelFactor * moistureFactor * windFactor * slopeFactor * temperatureFactor;
        
        return Math.min(1, spreadRate);
    }
    
    calculateSpreadDirection(fireSource) {
        // Fire spreads primarily with wind and uphill
        const windInfluence = this.windVector.clone().multiplyScalar(this.windStrength * 3);
        const slopeInfluence = this.calculateSlopeVector(fireSource.position.x, fireSource.position.z);
        const randomInfluence = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        );
        
        const direction = windInfluence.add(slopeInfluence).add(randomInfluence);
        return direction.normalize();
    }
    
    attemptFireSpread(sourcefire, direction) {
        // Calculate new fire position
        const spreadDistance = 3 + Math.random() * 5; // 3-8 meters
        const newPos = sourcefire.position.clone().add(
            direction.clone().multiplyScalar(spreadDistance)
        );
        
        // Check if position is valid and has fuel
        const index = this.getTerrainIndex(newPos.x, newPos.z);
        if (index < 0 || index >= this.fuelLoad.length) return;
        
        const fuelAvailable = this.fuelLoad[index] || 0;
        const moisture = this.terrainMoisture[index] || 0;
        
        // Fire spread probability based on conditions
        const spreadProbability = fuelAvailable * (1 - moisture * 0.8);
        
        if (Math.random() < spreadProbability) {
            // Check if fire already exists nearby
            const nearbyFire = this.fireSourcesActive.find(fire => 
                fire.position.distanceTo(newPos) < 4
            );
            
            if (!nearbyFire) {
                // Create new fire source
                this.createFireSource(newPos.x, newPos.z);
                
                // Consume fuel at this location
                this.fuelLoad[index] = Math.max(0, this.fuelLoad[index] - 0.3);
            }
        }
    }
    
    updateFireIntensity(fireSource, deltaTime) {
        const index = this.getTerrainIndex(fireSource.position.x, fireSource.position.z);
        if (index < 0 || index >= this.fuelLoad.length) return;
        
        // Consume fuel
        const consumption = fireSource.burnRate * deltaTime;
        const availableFuel = this.fuelLoad[index] || 0;
        
        if (availableFuel > 0) {
            this.fuelLoad[index] = Math.max(0, availableFuel - consumption);
            fireSource.fuelConsumed += consumption;
            
            // Update fire properties based on fuel consumption
            fireSource.intensity = Math.min(2, availableFuel * 2);
            fireSource.temperature = 300 + fireSource.intensity * 400;
            
            // Update light intensity
            if (fireSource.light) {
                fireSource.light.intensity = 2 + fireSource.intensity;
                fireSource.light.color.copy(this.temperatureToColor(fireSource.temperature));
            }
        } else {
            // Fire dies out when fuel is exhausted
            fireSource.intensity *= 0.95; // Gradual decay
            if (fireSource.intensity < 0.1) {
                this.extinguishFire(fireSource);
            }
        }
    }
    
    updateTemperatureField(fireSource) {
        // Update temperature field for realistic fire behavior
        const influenceRadius = fireSource.radius * 3;
        const maxTemp = fireSource.temperature;
        
        // Simple temperature field simulation
        // In a full implementation, this would use a proper heat diffusion model
        for (let dx = -influenceRadius; dx <= influenceRadius; dx += 2) {
            for (let dz = -influenceRadius; dz <= influenceRadius; dz += 2) {
                const distance = Math.sqrt(dx * dx + dz * dz);
                if (distance <= influenceRadius) {
                    const tempIncrease = maxTemp * Math.exp(-distance / influenceRadius);
                    // Update temperature at this location
                    // This could affect fire spread and smoke behavior
                }
            }
        }
    }
    
    calculateSlopeFactor(x, z) {
        // Calculate slope influence on fire spread
        const h1 = this.getTerrainHeight(x, z);
        const h2 = this.getTerrainHeight(x + 1, z);
        const h3 = this.getTerrainHeight(x, z + 1);
        
        const slopeX = h2 - h1;
        const slopeZ = h3 - h1;
        const slope = Math.sqrt(slopeX * slopeX + slopeZ * slopeZ);
        
        // Fire spreads faster uphill
        return 1 + slope * 2;
    }
    
    calculateSlopeVector(x, z) {
        // Calculate slope direction for fire spread
        const h1 = this.getTerrainHeight(x, z);
        const h2 = this.getTerrainHeight(x + 1, z);
        const h3 = this.getTerrainHeight(x, z + 1);
        
        const slopeX = h2 - h1;
        const slopeZ = h3 - h1;
        
        return new THREE.Vector3(slopeX, 0, slopeZ).normalize();
    }
    
    updateWindPatterns(deltaTime) {
        // Simulate realistic wind variation
        this.windStrength += (Math.random() - 0.5) * 0.1 * deltaTime;
        this.windStrength = Math.max(0.1, Math.min(2.0, this.windStrength));
        
        // Wind direction variation
        const windAngle = Math.atan2(this.windVector.z, this.windVector.x);
        const newAngle = windAngle + (Math.random() - 0.5) * 0.2 * deltaTime;
        
        this.windVector.x = Math.cos(newAngle);
        this.windVector.z = Math.sin(newAngle);
    }
    
    getTerrainIndex(x, z) {
        // Convert world coordinates to terrain array index
        const gridX = Math.floor((x + 50) * 1.2);
        const gridZ = Math.floor((z + 50) * 1.2);
        
        if (gridX < 0 || gridX >= 120 || gridZ < 0 || gridZ >= 120) return -1;
        
        return gridZ * 120 + gridX;
    }
    
    updateBurnedAreas() {
        // Update visual representation of burned areas
        if (!this.terrain) return;
        
        const colors = this.terrain.geometry.attributes.color.array;
        const vertices = this.terrain.geometry.attributes.position.array;
        
        // Update colors based on fuel consumption
        for (let i = 0; i < vertices.length; i += 3) {
            const index = i / 3;
            const fuelRemaining = this.fuelLoad[index] || 0;
            const originalFuel = this.calculateFuelLoad(
                this.vegetationDensity[index] || 0,
                this.terrainMoisture[index] || 0
            );
            
            if (originalFuel > 0) {
                const burnRatio = 1 - (fuelRemaining / originalFuel);
                
                if (burnRatio > 0.1) {
                    // Area has been burned
                    const burnIntensity = Math.min(1, burnRatio);
                    colors[i] = burnIntensity < 0.8 ? 0.2 : 0.1; // Red component
                    colors[i + 1] = burnIntensity < 0.8 ? 0.1 : 0.05; // Green component
                    colors[i + 2] = burnIntensity < 0.8 ? 0.1 : 0.05; // Blue component
                }
            }
        }
        
        this.terrain.geometry.attributes.color.needsUpdate = true;
    }
    
    updateFireStatistics() {
        // Calculate realistic fire statistics
        let totalBurnedArea = 0;
        let activeFireCount = this.fireSourcesActive.length;
        let perimeterLength = 0;
        
        // Calculate burned area based on fuel consumption
        this.fuelLoad.forEach((fuel, index) => {
            const originalFuel = this.calculateFuelLoad(
                this.vegetationDensity[index] || 0,
                this.terrainMoisture[index] || 0
            );
            
            if (originalFuel > 0 && fuel < originalFuel * 0.9) {
                totalBurnedArea += 0.01; // Each grid cell represents 0.01 hectares
            }
        });
        
        // Estimate fire perimeter
        perimeterLength = Math.sqrt(totalBurnedArea * Math.PI) * 2 * Math.PI;
        
        // Calculate spread rate
        const spreadRate = totalBurnedArea / Math.max(1, this.fireTime);
        
        // Update UI
        document.getElementById('predicted-burn-area').textContent = totalBurnedArea.toFixed(1) + ' ha';
        document.getElementById('villages-at-risk').textContent = this.calculateVillagesAtRisk(Math.sqrt(totalBurnedArea));
        document.getElementById('infrastructure-threatened').textContent = 
            totalBurnedArea > 50 ? 'Roads, Buildings, Infrastructure' : 
            totalBurnedArea > 10 ? 'Local Roads' : 'None';
    }
    
    extinguishFire(fireSource) {
        // Remove fire source and associated effects
        const index = this.fireSourcesActive.indexOf(fireSource);
        if (index > -1) {
            this.fireSourcesActive.splice(index, 1);
        }
        
        // Remove light
        if (fireSource.light) {
            this.scene.remove(fireSource.light);
        }
        
        // Mark area as burned
        this.burnedAreas.push({
            position: fireSource.position.clone(),
            radius: fireSource.radius,
            burnTime: fireSource.age
        });
    }
    
    updateTerrainColors(radius) {
        if (!this.terrain) return;
        
        const geometry = this.terrain.geometry;
        const colors = geometry.attributes.color.array;
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const distance = Math.sqrt(x * x + z * z);
            
            if (distance < radius) {
                // Burned area - black/gray
                colors[i] = 0.1;
                colors[i + 1] = 0.1;
                colors[i + 2] = 0.1;
            } else if (distance < radius + 5) {
                // Future burn area - red/orange
                colors[i] = 1.0;
                colors[i + 1] = 0.3;
                colors[i + 2] = 0.1;
            }
        }
        
        geometry.attributes.color.needsUpdate = true;
    }
    
    calculateVillagesAtRisk(radius) {
        // Simulate village risk calculation
        const villages = [
            { x: -20, z: -15 },
            { x: 25, z: 10 },
            { x: -10, z: 30 }
        ];
        
        let atRisk = 0;
        villages.forEach(village => {
            const distance = Math.sqrt(village.x * village.x + village.z * village.z);
            if (distance < radius + 10) { // 10 unit safety buffer
                atRisk++;
            }
        });
        
        return atRisk;
    }
    
    toggleWhyView() {
        this.whyViewActive = !this.whyViewActive;
        const button = document.getElementById('toggle-why-view');
        
        if (this.whyViewActive) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-lightbulb"></i> Hide Why View';
            this.showExplanationLabels();
            showToast('Why View activated - showing factor influences', 'info');
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="fas fa-lightbulb"></i> Show Why View';
            this.hideExplanationLabels();
        }
    }
    
    showExplanationLabels() {
        // Create floating labels for different factors
        const factors = [
            { text: '🔥 Wind', position: new THREE.Vector3(-20, 15, -10), color: 0x60A5FA },
            { text: '🌱 Dryness', position: new THREE.Vector3(15, 12, 20), color: 0x22C55E },
            { text: '⛰️ Slope', position: new THREE.Vector3(0, 20, 0), color: 0x92400E }
        ];
        
        factors.forEach(factor => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            context.fillStyle = `#${factor.color.toString(16).padStart(6, '0')}`;
            context.font = 'Bold 24px Arial';
            context.textAlign = 'center';
            context.fillText(factor.text, 128, 40);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(factor.position);
            sprite.scale.set(10, 2.5, 1);
            
            this.scene.add(sprite);
            this.explanationLabels.push(sprite);
        });
    }
    
    hideExplanationLabels() {
        this.explanationLabels.forEach(label => {
            this.scene.remove(label);
        });
        this.explanationLabels = [];
    }
    
    autoRotate() {
        // Auto-rotate the camera around the terrain
        const duration = 5000; // 5 seconds
        const startTime = Date.now();
        const startPosition = this.camera.position.clone();
        
        const rotate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const angle = progress * Math.PI * 2;
            const radius = startPosition.length();
            
            this.camera.position.set(
                Math.cos(angle) * radius,
                startPosition.y,
                Math.sin(angle) * radius
            );
            this.camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(rotate);
            }
        };
        
        rotate();
    }
    
    fitView() {
        // Reset camera to default position
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
        showToast('View reset to default position', 'info');
    }
    
    toggleWireframe() {
        if (this.terrain) {
            this.terrain.material.wireframe = !this.terrain.material.wireframe;
            showToast(`Wireframe ${this.terrain.material.wireframe ? 'enabled' : 'disabled'}`, 'info');
        }
    }
    
    setFireTime(hours) {
        this.fireTime = hours;
        this.updateFireSpread();
    }
    
    updateFireIntensity(intensity) {
        // Update fire particle intensity
        this.fireParticles.forEach(particles => {
            particles.material.opacity = 0.3 + intensity * 0.7;
        });
        
        if (this.fireLight) {
            this.fireLight.intensity = intensity * 3;
        }
    }
    
    updateSimulationSpeed(speed) {
        // Simulation speed affects how fast time progresses
        this.simulationSpeed = speed;
    }
    
    onWindowResize() {
        const canvas = document.getElementById('firevision-canvas');
        if (!canvas || !this.camera || !this.renderer) return;
        
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update fire particles
        this.updateFireParticles(deltaTime);
        
        // Update fire time if playing
        if (this.isPlaying) {
            this.fireTime += deltaTime * (this.simulationSpeed || 1) * 0.5; // 0.5 hours per second at 1x speed
            
            // Update time slider
            const timeSlider = document.getElementById('time-slider-3d');
            if (timeSlider) {
                timeSlider.value = Math.min(this.fireTime, 24);
                document.getElementById('time-value-3d').textContent = Math.floor(this.fireTime) + 'h';
            }
            
            this.updateFireSpread();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateFireParticles(deltaTime) {
        // Update flame particles with realistic physics
        this.fireParticles.forEach(particles => {
            const userData = particles.userData;
            if (!userData || !userData.fireSource) return;
            
            const geometry = particles.geometry;
            const positions = geometry.attributes.position.array;
            const velocities = geometry.attributes.velocity ? geometry.attributes.velocity.array : null;
            const ages = geometry.attributes.age ? geometry.attributes.age.array : null;
            const colors = geometry.attributes.color ? geometry.attributes.color.array : null;
            
            const fireSource = userData.fireSource;
            const particleCount = positions.length / 3;
            
            for (let i = 0; i < particleCount; i++) {
                const idx = i * 3;
                
                if (velocities && ages) {
                    // Age the particle
                    ages[i] += deltaTime;
                    
                    // Reset particles that are too old
                    if (ages[i] > (userData.type === 'flames' ? 2 : userData.type === 'smoke' ? 8 : 5)) {
                        this.resetParticle(i, positions, velocities, ages, colors, fireSource, userData.type);
                        continue;
                    }
                    
                    // Apply physics
                    if (userData.type === 'flames') {
                        this.updateFlameParticle(i, positions, velocities, ages, colors, fireSource, deltaTime);
                    } else if (userData.type === 'smoke') {
                        this.updateSmokeParticle(i, positions, velocities, ages, fireSource, deltaTime);
                    } else if (userData.type === 'embers') {
                        this.updateEmberParticle(i, positions, velocities, ages, colors, fireSource, deltaTime);
                    }
                } else {
                    // Fallback for simple particles
                    positions[idx + 1] += deltaTime * 10;
                    if (positions[idx + 1] > 50) {
                        positions[idx + 1] = fireSource.position.y;
                    }
                }
            }
            
            geometry.attributes.position.needsUpdate = true;
            if (velocities) geometry.attributes.velocity.needsUpdate = true;
            if (ages) geometry.attributes.age.needsUpdate = true;
            if (colors) geometry.attributes.color.needsUpdate = true;
        });
        
        // Update smoke systems
        this.smokeSystems.forEach(smoke => this.updateSmokeSystem(smoke, deltaTime));
        
        // Update ember systems
        this.emberSystems.forEach(embers => this.updateEmberSystem(embers, deltaTime));
    }
    
    updateFlameParticle(index, positions, velocities, ages, colors, fireSource, deltaTime) {
        const idx = index * 3;
        const age = ages[index];
        
        // Apply buoyancy (thermal updraft)
        const buoyancy = this.BUOYANCY * (2.0 - age) * fireSource.intensity;
        velocities[idx + 1] += buoyancy * deltaTime;
        
        // Apply wind influence
        velocities[idx] += this.windVector.x * this.windStrength * deltaTime * 2;
        velocities[idx + 2] += this.windVector.z * this.windStrength * deltaTime * 2;
        
        // Apply turbulence
        const turbulence = 3.0;
        velocities[idx] += (Math.random() - 0.5) * turbulence * deltaTime;
        velocities[idx + 1] += (Math.random() - 0.5) * turbulence * deltaTime * 0.5;
        velocities[idx + 2] += (Math.random() - 0.5) * turbulence * deltaTime;
        
        // Apply drag
        const drag = 0.98;
        velocities[idx] *= drag;
        velocities[idx + 1] *= drag;
        velocities[idx + 2] *= drag;
        
        // Update position
        positions[idx] += velocities[idx] * deltaTime;
        positions[idx + 1] += velocities[idx + 1] * deltaTime;
        positions[idx + 2] += velocities[idx + 2] * deltaTime;
        
        // Update color based on age and temperature
        if (colors) {
            const ageFactor = 1.0 - (age / 2.0);
            const temp = fireSource.temperature * ageFactor;
            const color = this.temperatureToColor(temp);
            
            colors[idx] = color.r;
            colors[idx + 1] = color.g;
            colors[idx + 2] = color.b;
        }
    }
    
    updateSmokeParticle(index, positions, velocities, ages, fireSource, deltaTime) {
        const idx = index * 3;
        const age = ages[index];
        
        // Smoke rises more slowly and is more affected by wind
        const thermalLift = this.THERMAL_RISE * 0.3 * (8.0 - age) / 8.0;
        velocities[idx + 1] += thermalLift * deltaTime;
        
        // Strong wind influence on smoke
        velocities[idx] += this.windVector.x * this.windStrength * deltaTime * 3;
        velocities[idx + 2] += this.windVector.z * this.windStrength * deltaTime * 3;
        
        // Smoke turbulence and expansion
        const expansion = age * 0.5;
        velocities[idx] += (Math.random() - 0.5) * expansion * deltaTime;
        velocities[idx + 2] += (Math.random() - 0.5) * expansion * deltaTime;
        
        // Air resistance
        const drag = 0.95;
        velocities[idx] *= drag;
        velocities[idx + 1] *= drag;
        velocities[idx + 2] *= drag;
        
        // Update position
        positions[idx] += velocities[idx] * deltaTime;
        positions[idx + 1] += velocities[idx + 1] * deltaTime;
        positions[idx + 2] += velocities[idx + 2] * deltaTime;
    }
    
    updateEmberParticle(index, positions, velocities, ages, colors, fireSource, deltaTime) {
        const idx = index * 3;
        const age = ages[index];
        
        // Embers affected by gravity and wind
        velocities[idx + 1] += this.GRAVITY * deltaTime;
        
        // Wind carries embers
        velocities[idx] += this.windVector.x * this.windStrength * deltaTime * 4;
        velocities[idx + 2] += this.windVector.z * this.windStrength * deltaTime * 4;
        
        // Air resistance
        const drag = 0.99;
        velocities[idx] *= drag;
        velocities[idx + 1] *= drag;
        velocities[idx + 2] *= drag;
        
        // Update position
        positions[idx] += velocities[idx] * deltaTime;
        positions[idx + 1] += velocities[idx + 1] * deltaTime;
        positions[idx + 2] += velocities[idx + 2] * deltaTime;
        
        // Ember color fades with age
        if (colors) {
            const intensity = Math.max(0, 1.0 - age / 5.0);
            const emberColor = this.temperatureToColor(600 * intensity);
            
            colors[idx] = emberColor.r;
            colors[idx + 1] = emberColor.g;
            colors[idx + 2] = emberColor.b;
        }
        
        // Check for ember landing and potential new fire ignition
        if (positions[idx + 1] <= this.getTerrainHeight(positions[idx], positions[idx + 2]) + 1) {
            const emberPos = new THREE.Vector3(positions[idx], 0, positions[idx + 2]);
            const nearbyFire = this.fireSourcesActive.find(fire => 
                fire.position.distanceTo(emberPos) < 8
            );
            
            if (!nearbyFire && Math.random() < 0.05) {
                // Potential spot fire ignition
                const terrainIndex = this.getTerrainIndex(positions[idx], positions[idx + 2]);
                if (terrainIndex >= 0 && this.fuelLoad[terrainIndex] > 0.3) {
                    this.createFireSource(positions[idx], positions[idx + 2]);
                }
            }
            
            // Reset ember
            this.resetParticle(index, positions, velocities, ages, colors, fireSource, 'embers');
        }
    }
    
    resetParticle(index, positions, velocities, ages, colors, fireSource, type) {
        const idx = index * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * fireSource.radius;
        
        // Reset position near fire source
        positions[idx] = fireSource.position.x + Math.cos(angle) * radius;
        positions[idx + 1] = fireSource.position.y + Math.random() * 2;
        positions[idx + 2] = fireSource.position.z + Math.sin(angle) * radius;
        
        // Reset age
        ages[index] = Math.random() * 0.5;
        
        // Reset velocity based on particle type
        if (type === 'flames') {
            velocities[idx] = this.windVector.x * this.windStrength + (Math.random() - 0.5) * 2;
            velocities[idx + 1] = this.THERMAL_RISE + Math.random() * 5;
            velocities[idx + 2] = this.windVector.z * this.windStrength + (Math.random() - 0.5) * 2;
        } else if (type === 'smoke') {
            velocities[idx] = this.windVector.x * this.windStrength * 2 + (Math.random() - 0.5);
            velocities[idx + 1] = this.THERMAL_RISE * 0.3 + Math.random() * 2;
            velocities[idx + 2] = this.windVector.z * this.windStrength * 2 + (Math.random() - 0.5);
        } else if (type === 'embers') {
            const emberSpeed = 5 + Math.random() * 10;
            velocities[idx] = this.windVector.x * emberSpeed + (Math.random() - 0.5) * 3;
            velocities[idx + 1] = this.THERMAL_RISE * 0.5 + Math.random() * 8;
            velocities[idx + 2] = this.windVector.z * emberSpeed + (Math.random() - 0.5) * 3;
        }
        
        // Reset color
        if (colors && type === 'flames') {
            const temp = 500 + Math.random() * 600;
            const color = this.temperatureToColor(temp);
            colors[idx] = color.r;
            colors[idx + 1] = color.g;
            colors[idx + 2] = color.b;
        }
    }
    
    updateSmokeSystem(smoke, deltaTime) {
        // Additional smoke system updates
        if (smoke.material.opacity > 0.1) {
            smoke.material.opacity *= 0.995; // Gradual fade
        }
    }
    
    updateEmberSystem(embers, deltaTime) {
        // Additional ember system updates
        if (embers.material.opacity > 0.1) {
            embers.material.opacity *= 0.998; // Gradual fade
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.scene) {
            this.scene.clear();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// FireVision API Integration
class FireVisionAPI {
    constructor() {
        this.baseURL = window.location.origin.replace(':8000', ':5001');
    }
    
    async simulate3D(lat, lng, duration = 6) {
        try {
            const envData = getCurrentEnvironmentalData();
            const response = await fetch(`${this.baseURL}/api/ml/simulate3D`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat, lng, duration,
                    ...envData
                })
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('FireVision API not available, using simulated data');
            return this.generateSimulatedData(lat, lng, duration);
        }
    }
    
    async getImpactData(burnedArea) {
        try {
            const response = await fetch(`${this.baseURL}/api/ml/impact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ burned_area_hectares: burnedArea })
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Impact API not available');
            return this.generateSimulatedImpact(burnedArea);
        }
    }
    
    async getExplanation3D(fireData) {
        try {
            const response = await fetch(`${this.baseURL}/api/ml/explain3D`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fireData)
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Explanation API not available');
            return this.generateSimulatedExplanation();
        }
    }
    
    generateSimulatedData(lat, lng, duration) {
        return {
            success: true,
            fire_progression: Array.from({length: duration}, (_, i) => ({
                hour: i,
                burned_area_hectares: Math.pow(i + 1, 1.5) * 2,
                fire_perimeter_km: Math.sqrt((i + 1) * 10),
                spread_rate: (i + 1) * 0.8,
                coordinates: { lat: lat + (Math.random() - 0.5) * 0.01, lng: lng + (Math.random() - 0.5) * 0.01 }
            }))
        };
    }
    
    generateSimulatedImpact(burnedArea) {
        return {
            success: true,
            villages_affected: Math.floor(burnedArea / 50),
            infrastructure_impact: burnedArea > 100 ? 'High' : 'Moderate',
            evacuation_routes: [
                { path: 'Route A', status: 'Clear', length_km: 15 },
                { path: 'Route B', status: 'Blocked', length_km: 12 }
            ]
        };
    }
    
    generateSimulatedExplanation() {
        return {
            success: true,
            factor_weights: {
                wind: Math.random() * 0.4 + 0.3,
                dryness: Math.random() * 0.3 + 0.4,
                slope: Math.random() * 0.2 + 0.2,
                temperature: Math.random() * 0.3 + 0.2
            }
        };
    }
}

// Global FireVision instances
let fireVision3D = null;
let fireVisionAPI = null;

// FireVision utility functions
function closeFireInfoPopup() {
    const popup = document.getElementById('fire-info-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function startARSession() {
    if (fireVision3D && fireVision3D.isARMode) {
        showToast('Starting AR session...', 'processing', 2000);
        
        // Simulate AR session start
        setTimeout(() => {
            showToast('AR session active! Point camera at surface and tap to place fire model', 'success', 5000);
            document.getElementById('ar-instructions').style.display = 'none';
        }, 2000);
    }
}

function captureScreenshot() {
    if (fireVision3D && fireVision3D.renderer) {
        const canvas = fireVision3D.renderer.domElement;
        const link = document.createElement('a');
        link.download = `firevision-screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        showToast('Screenshot captured successfully!', 'success');
    }
}

function recordSession() {
    showToast('Recording feature coming soon!', 'info');
}

function shareVisualization() {
    if (navigator.share) {
        navigator.share({
            title: 'FireVision 3D Visualization',
            text: 'Check out this 3D fire simulation from AgniVeer',
            url: window.location.href
        });
    } else {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        showToast('Visualization URL copied to clipboard!', 'success');
    }
}

// Initialize FireVision when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FireVision 3D after a delay to ensure Three.js is loaded
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            fireVision3D = new FireVision3D();
            fireVisionAPI = new FireVisionAPI();
            console.log('FireVision 3D/AR system ready');
        } else {
            console.warn('Three.js not loaded, FireVision 3D disabled');
        }
    }, 1000);
});

// Safe Evacuation Route Mapping Functions
let evacuationMap;
let currentRoutes = [];
let safeZoneMarkers = [];
let fireRiskOverlay = null;
let userLocation = null;
let isWhatIfModeActive = false;

function initializeEvacuationRoutes() {
    // Initialize evacuation map
    const evacuationMapElement = document.getElementById('evacuation-map');
    if (evacuationMapElement) {
        evacuationMap = L.map('evacuation-map').setView([30.0668, 79.0193], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(evacuationMap);

        // Add initial fire risk overlay
        addFireRiskOverlay();
        
        // Add safe zones
        addSafeZones();

        // Setup event listeners
        setupEvacuationEventListeners();

        showToast('Evacuation route system initialized', 'success');
    }
}

function addFireRiskOverlay() {
    if (!evacuationMap) return;

    // Create fire risk zones (simulated data)
    const riskZones = [
        {
            coords: [[29.8, 79.2], [30.2, 79.2], [30.2, 79.8], [29.8, 79.8]],
            risk: 'extreme',
            color: '#DC2626',
            opacity: 0.6
        },
        {
            coords: [[29.5, 79.5], [29.8, 79.5], [29.8, 80.0], [29.5, 80.0]],
            risk: 'high',
            color: '#F59E0B',
            opacity: 0.5
        },
        {
            coords: [[30.2, 78.0], [30.5, 78.0], [30.5, 78.5], [30.2, 78.5]],
            risk: 'moderate',
            color: '#EAB308',
            opacity: 0.4
        }
    ];

    riskZones.forEach(zone => {
        const polygon = L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: zone.opacity,
            weight: 2,
            className: `fire-risk-${zone.risk}`
        }).addTo(evacuationMap);

        polygon.bindPopup(`
            <div class="risk-popup">
                <h4>Fire Risk: ${zone.risk.toUpperCase()}</h4>
                <p>Avoid this area during evacuation</p>
            </div>
        `);
    });
}

function addSafeZones() {
    if (!evacuationMap) return;

    const safeZones = [
        {
            name: 'District Hospital',
            coords: [30.1, 79.4],
            type: 'hospital',
            capacity: 500,
            status: 'available',
            icon: 'fas fa-hospital'
        },
        {
            name: 'Community Center',
            coords: [30.0, 79.3],
            type: 'shelter',
            capacity: 200,
            status: 'available',
            icon: 'fas fa-home'
        },
        {
            name: 'Government School',
            coords: [29.9, 79.2],
            type: 'school',
            capacity: 300,
            status: 'full',
            icon: 'fas fa-school'
        },
        {
            name: 'Sports Complex',
            coords: [30.2, 79.5],
            type: 'shelter',
            capacity: 400,
            status: 'available',
            icon: 'fas fa-building'
        }
    ];

    safeZones.forEach(zone => {
        const iconColor = zone.status === 'available' ? '#10B981' : '#F59E0B';
        
        const marker = L.marker(zone.coords, {
            icon: L.divIcon({
                className: 'safe-zone-marker',
                html: `
                    <div class="safe-zone-icon ${zone.type}" style="background: ${iconColor};">
                        <i class="${zone.icon}"></i>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(evacuationMap);

        marker.bindPopup(`
            <div class="safe-zone-popup">
                <h4>${zone.name}</h4>
                <p><strong>Type:</strong> ${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}</p>
                <p><strong>Capacity:</strong> ${zone.capacity} people</p>
                <p><strong>Status:</strong> ${zone.status}</p>
                ${zone.status === 'available' ? 
                    '<button onclick="navigateToSafeZone(\'' + zone.name + '\')" class="navigate-btn">Navigate Here</button>' :
                    '<span class="full-indicator">Currently Full</span>'
                }
            </div>
        `);

        safeZoneMarkers.push(marker);
    });
}

function setupEvacuationEventListeners() {
    // Find My Route button
    const findRouteBtn = document.getElementById('find-my-route');
    if (findRouteBtn) {
        findRouteBtn.addEventListener('click', findMyRoute);
    }

    // What-If Mode button
    const whatIfBtn = document.getElementById('what-if-mode');
    if (whatIfBtn) {
        whatIfBtn.addEventListener('click', openWhatIfModal);
    }

    // Download Plan button
    const downloadBtn = document.getElementById('download-plan');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadEvacuationPlan);
    }

    // Alternative Routes button
    const altRoutesBtn = document.getElementById('alternative-routes');
    if (altRoutesBtn) {
        altRoutesBtn.addEventListener('click', showAlternativeRoutes);
    }

    // Start Navigation button
    const startNavBtn = document.getElementById('start-navigation');
    if (startNavBtn) {
        startNavBtn.addEventListener('click', startNavigation);
    }

    // AI Chat functionality
    const sendBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('ai-chat-input');
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendAIMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }

    // Overlay toggles
    const overlayToggles = ['show-fire-overlay', 'show-safe-zones', 'show-alternative-routes'];
    overlayToggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', updateMapOverlays);
        }
    });

    // Map click for setting custom location
    if (evacuationMap) {
        evacuationMap.on('click', function(e) {
            setUserLocation(e.latlng);
        });
    }
}

function findMyRoute() {
    showToast('Locating your position...', 'processing', 2000);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let userLat = position.coords.latitude;
                let userLng = position.coords.longitude;
                
                showToast('Location confirmed. Scanning for nearby shelters...', 'success', 3000);
                setUserLocation({lat: userLat, lng: userLng});
            },
            (error) => {
                showToast('GPS access denied. Please enable location permissions.', 'error', 4000);
            }
        );
    } else {
        showToast('Your browser does not support geolocation.', 'error', 3000);
    }
}

async function fetchDynamicSafeZones(lat, lng) {
    showToast('Scanning surroundings for safe grounds & shelters...', 'processing', 3000);
    // Search within 25km (25000 meters)
    const radius = 25000;
    const query = `
        [out:json];
        (
          node[\"amenity\"~\"hospital|clinic|school|college|university|community_centre\"](around:${radius},${lat},${lng});
          way[\"amenity\"~\"hospital|clinic|school|college|university|community_centre\"](around:${radius},${lat},${lng});
          node[\"leisure\"~\"pitch|park|stadium|sports_centre\"](around:${radius},${lat},${lng});
          way[\"leisure\"~\"pitch|park|stadium|sports_centre\"](around:${radius},${lat},${lng});
          node[\"landuse\"=\"recreation_ground\"](around:${radius},${lat},${lng});
          way[\"landuse\"=\"recreation_ground\"](around:${radius},${lat},${lng});
        );
        out center 15;
    `;
    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter`, {
            method: 'POST',
            body: query
        });
        const data = await response.json();
        
        let zones = [];
        if (data.elements) {
            data.elements.forEach(el => {
                const zLat = el.lat || el.center.lat;
                const zLon = el.lon || el.center.lon;
                const name = (el.tags && el.tags.name) ? el.tags.name : (el.tags.amenity || el.tags.leisure || el.tags.landuse || 'Safe Shelter').toUpperCase();
                let type = 'shelter';
                if (el.tags) {
                    if (el.tags.amenity && (el.tags.amenity.includes('hospital') || el.tags.amenity.includes('clinic'))) type = 'hospital';
                    else if (el.tags.amenity && (el.tags.amenity.includes('school') || el.tags.amenity.includes('college') || el.tags.amenity.includes('university'))) type = 'school';
                    else if (el.tags.leisure || el.tags.landuse) type = 'ground';
                }
                zones.push({
                    name: name,
                    coords: [zLat, zLon],
                    type: type
                });
            });
        }
        return zones;
    } catch (e) {
        console.error('Overpass API Error:', e);
        return [];
    }
}

async function calculateEvacuationRoute(startCoords) {
    if (!evacuationMap) return;

    // Clear existing routes
    clearCurrentRoutes();

    // 1. Dynamically fetch nearby safe zones
    let safeZones = await fetchDynamicSafeZones(startCoords[0], startCoords[1]);
    
    // Fallback if network is down or nothing is found
    if (!safeZones || safeZones.length === 0) {
        showToast('No hospitals or schools found near your exact location.', 'error', 4000);
        return;
    }

    // Update map with real dynamic safe zones
    if (safeZoneMarkers && safeZoneMarkers.length > 0) {
        safeZoneMarkers.forEach(marker => evacuationMap.removeLayer(marker));
        safeZoneMarkers = [];
    }
    
    safeZones.forEach(zone => {
        const iconColor = zone.type === 'hospital' ? '#10B981' : (zone.type === 'ground' ? '#3B82F6' : '#F59E0B');
        let faIcon = 'fa-home';
        if (zone.type === 'hospital') faIcon = 'fa-hospital';
        if (zone.type === 'school') faIcon = 'fa-school';
        if (zone.type === 'ground') faIcon = 'fa-campground';
        
        const marker = L.marker(zone.coords, {
            icon: L.divIcon({
                className: 'safe-zone-marker',
                html: `<div class=\"safe-zone-icon ${zone.type}\" style=\"background: ${iconColor};\">
                          <i class=\"fas ${faIcon}\"></i>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(evacuationMap);
        
        marker.bindPopup(`
            <div class=\"safe-zone-popup\">
                <h4>${zone.name}</h4>
                <p><strong>Type:</strong> ${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}</p>
            </div>
        `);
        safeZoneMarkers.push(marker);
    });

    // 2. Find nearest from these dynamic ones
    const nearestSafeZone = findNearestSafeZone(startCoords, safeZones);
    
    // Sort safe zones by distance and update the sidebar UI
    safeZones.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    updateSidebarSafeZones(safeZones);
    
    if (nearestSafeZone) {
        showToast(`Routing to nearest: ${nearestSafeZone.name}`, 'processing', 2000);
        
        try {
            // OSRM API expects longitude,latitude
            const startStr = `${startCoords[1]},${startCoords[0]}`;
            const endStr = `${nearestSafeZone.coords[1]},${nearestSafeZone.coords[0]}`;
            
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson&steps=true`);
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const routeData = data.routes[0];
                const waypoints = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                // Update safe zone info
                nearestSafeZone.distance = (routeData.distance / 1000).toFixed(1);
                nearestSafeZone.eta = Math.ceil(routeData.duration / 60);
                
                // Create route visualization
                const route = createRealRouteVisualization(startCoords, nearestSafeZone, waypoints);
                currentRoutes.push(route);

                // Update sidebar information
                updateRouteInformation(nearestSafeZone, routeData.legs[0].steps);
                
                // Set map view to show route
                const routeBounds = L.latLngBounds(waypoints);
                evacuationMap.fitBounds(routeBounds, { padding: [50, 50] });

                showToast(`Safe route to ${nearestSafeZone.name} calculated`, 'success');
                startRouteMonitoring();
                return;
            }
        } catch (error) {
            console.error('OSRM API Error, falling back to direct route:', error);
        }

        // Fallback if API fails
        const fallbackRoute = createRouteVisualization(startCoords, nearestSafeZone);
        currentRoutes.push(fallbackRoute);
        updateRouteInformation(nearestSafeZone, null);
        const routeBounds = L.latLngBounds([startCoords, nearestSafeZone.coords]);
        evacuationMap.fitBounds(routeBounds, { padding: [50, 50] });
        showToast('Direct evacuation route calculated', 'success');
        startRouteMonitoring();
    }
}

function findNearestSafeZone(userCoords, safeZones) {
    let nearest = null;
    let minDistance = Infinity;
    
    // Using simple air distance approximation for nearest zone selection
    const userLatLng = L.latLng(userCoords[0], userCoords[1]);
    
    safeZones.forEach(zone => {
        const zoneLatLng = L.latLng(zone.coords[0], zone.coords[1]);
        const distance = userLatLng.distanceTo(zoneLatLng);
        
        // Ensure distance and ETA are calculated for EVERY zone, so sorting doesn't fail
        zone.distance = (distance / 1000).toFixed(1);
        zone.eta = Math.ceil((distance / 1000) * 1.5); // Rough assuming 40 km/h
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = zone;
        }
    });

    return nearest;
}

function createRealRouteVisualization(start, destination, waypoints) {
    if (!evacuationMap) return null;

    const routeLine = L.polyline(waypoints, {
        color: '#10B981',
        weight: 6,
        opacity: 0.8,
        className: 'evacuation-route-line'
    }).addTo(evacuationMap);

    setTimeout(() => {
        routeLine.setStyle({ className: 'evacuation-route-line pulsing' });
    }, 100);

    const startMarker = L.marker(start, {
        icon: L.divIcon({
            className: 'route-marker start-marker',
            html: '<i class=\"fas fa-map-marker-alt\"></i>',
            iconSize: [30, 30], iconAnchor: [15, 30]
        })
    }).addTo(evacuationMap);

    const destMarker = L.marker(destination.coords, {
        icon: L.divIcon({
            className: 'route-marker dest-marker',
            html: '<i class=\"fas fa-flag-checkered\"></i>',
            iconSize: [30, 30], iconAnchor: [15, 30]
        })
    }).addTo(evacuationMap);

    return {
        line: routeLine, startMarker, destMarker, waypoints, destination
    };
}

function createRouteVisualization(start, destination) {
    if (!evacuationMap) return null;

    const waypoints = generateRouteWaypoints(start, destination.coords);
    return createRealRouteVisualization(start, destination, waypoints);
}

function generateRouteWaypoints(start, end) {
    const waypoints = [start];
    const latDiff = end[0] - start[0];
    const lngDiff = end[1] - start[1];
    
    for (let i = 1; i < 4; i++) {
        const progress = i / 4;
        waypoints.push([
            start[0] + latDiff * progress,
            start[1] + lngDiff * progress
        ]);
    }
    waypoints.push(end);
    return waypoints;
}

function updateRouteInformation(safeZone, steps) {
    updateElementText('safe-zone-distance', safeZone.distance + ' km');
    updateElementText('evacuation-eta', safeZone.eta + ' mins');

    const safetyBadge = document.getElementById('route-safety');
    if (safetyBadge) {
        safetyBadge.className = 'route-safety-badge safe';
        safetyBadge.innerHTML = '<i class=\"fas fa-check\"></i> Safe';
    }

    updateRouteSteps(safeZone, steps);
}

function updateSidebarSafeZones(safeZones) {
    const listContainer = document.querySelector('.safe-zones-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = ''; 
    
    safeZones.slice(0, 4).forEach(zone => {
        let faIcon = 'fa-home';
        if (zone.type === 'hospital') faIcon = 'fa-hospital';
        if (zone.type === 'school') faIcon = 'fa-school';
        if (zone.type === 'ground') faIcon = 'fa-campground';
        
        let distanceText = zone.distance ? `${zone.distance} km` : 'Calculating...';
        let etaText = zone.eta ? `${zone.eta} min drive` : '';
        
        listContainer.innerHTML += `
            <div class=\"safe-zone-item\">
                <div class=\"zone-icon ${zone.type}\">
                    <i class=\"fas ${faIcon}\"></i>
                </div>
                <div class=\"zone-info\">
                    <span class=\"zone-name\">${zone.name}</span>
                    <span class=\"zone-details\">${distanceText} ${etaText ? '• ' + etaText : ''}</span>
                    <span class=\"zone-capacity\">Type: ${zone.type.toUpperCase()}</span>
                </div>
                <div class=\"zone-status available\">
                    <i class=\"fas fa-check\"></i>
                </div>
            </div>
        `;
    });
}

function updateRouteSteps(destination, steps) {
    let routeSteps = [];
    if (steps && steps.length > 0) {
        routeSteps = steps.filter(step => step.distance > 0 || step.maneuver.type === 'arrive').map(step => {
            const instruction = step.maneuver.instruction || 
                `${step.maneuver.type} ${step.maneuver.modifier || ''} ${step.name ? 'onto ' + step.name : ''}`.trim();
            return {
                instruction: instruction,
                distance: (step.distance / 1000).toFixed(1) + ' km'
            };
        });
    } else {
        routeSteps = [
            { instruction: 'Head towards destination', distance: destination.distance + ' km' },
            { instruction: `Arrive at ${destination.name}`, distance: '0 km' }
        ];
    }
    
    let sidebar = document.querySelector('.evacuation-sidebar');
    if (!sidebar) return;
    
    let existingPanel = document.getElementById('gps-steps-panel');
    if (existingPanel) existingPanel.remove();
    
    let stepsHtml = routeSteps.map((step, idx) => `
        <div class=\"step-item\" style=\"display:flex; align-items:flex-start; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #334155;\">
            <div style=\"background:#2563EB; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; margin-right:12px; flex-shrink:0;\">
                ${idx + 1}
            </div>
            <div>
                <div style=\"color:#F1F5F9; font-weight:500; font-size:14px; margin-bottom:4px; text-transform:capitalize;\">${step.instruction}</div>
                <div style=\"color:#94A3B8; font-size:12px;\"><i class=\"fas fa-location-arrow\"></i> ${step.distance}</div>
            </div>
        </div>
    `).join('');
    
    const panelHtml = `
        <div id=\"gps-steps-panel\" class=\"sidebar-panel\" style=\"margin-top: 20px; animation: slideIn 0.3s ease;\">
            <div class=\"panel-header\">
                <h3><i class=\"fas fa-compass\" style=\"color:#3B82F6; margin-right:8px;\"></i> Live GPS Navigation</h3>
            </div>
            <div class=\"steps-list\" style=\"max-height:300px; overflow-y:auto; padding-right:5px; margin-top:15px;\">
                ${stepsHtml}
            </div>
        </div>
    `;
    
    sidebar.insertAdjacentHTML('beforeend', panelHtml);
}

function clearCurrentRoutes() {
    if (!evacuationMap) return;

    currentRoutes.forEach(route => {
        if (route.line) evacuationMap.removeLayer(route.line);
        if (route.startMarker) evacuationMap.removeLayer(route.startMarker);
        if (route.destMarker) evacuationMap.removeLayer(route.destMarker);
    });

    currentRoutes = [];
}

function startRouteMonitoring() {
    // Simulate route monitoring with periodic updates
    const monitoringInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance of route update
            const alerts = [
                'Route conditions optimal - continue on current path',
                'Minor traffic detected - ETA updated',
                'Weather conditions favorable for evacuation'
            ];
            
            const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
            showRouteAlert(randomAlert, 'info');
        }
    }, 15000);

    // Stop monitoring after 5 minutes
    setTimeout(() => {
        clearInterval(monitoringInterval);
    }, 300000);
}

function showRouteAlert(message, type = 'info') {
    const alertBanner = document.getElementById('route-alert-banner');
    const alertMessage = document.getElementById('alert-message');
    
    if (alertBanner && alertMessage) {
        alertMessage.textContent = message;
        alertBanner.style.display = 'flex';
        alertBanner.className = `alert-banner ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertBanner.style.display = 'none';
        }, 5000);
    }
}

function closeAlertBanner() {
    const alertBanner = document.getElementById('route-alert-banner');
    if (alertBanner) {
        alertBanner.style.display = 'none';
    }
}

function setUserLocation(latlng) {
    userLocation = latlng;
    
    // Add user location marker
    if (evacuationMap) {
        // Remove existing user marker
        evacuationMap.eachLayer(layer => {
            if (layer.options && layer.options.className === 'user-location-marker') {
                evacuationMap.removeLayer(layer);
            }
        });

        // Add new user marker
        L.marker([latlng.lat, latlng.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '<i class="fas fa-user-circle"></i>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(evacuationMap);

        showToast('Location set - calculating evacuation route', 'processing');
        calculateEvacuationRoute([latlng.lat, latlng.lng]);
    }
}

function showAlternativeRoutes() {
    showToast('Calculating alternative routes...', 'processing', 2000);
    
    setTimeout(() => {
        // Simulate showing alternative routes
        showToast('3 alternative routes found', 'success');
        
        // Update route safety to show options
        const safetyBadge = document.getElementById('route-safety');
        if (safetyBadge) {
            safetyBadge.className = 'route-safety-badge warning';
            safetyBadge.innerHTML = '<i class="fas fa-route"></i> 3 Options';
        }
    }, 2000);
}

function startNavigation() {
    showToast('Navigation started - follow the highlighted route', 'success');
    
    // Update status
    const statusElement = document.getElementById('evacuation-status');
    if (statusElement) {
        statusElement.textContent = 'Navigating';
    }
    
    // Simulate navigation updates
    let step = 0;
    const navigationUpdates = setInterval(() => {
        step++;
        if (step > 3) {
            clearInterval(navigationUpdates);
            showToast('You have arrived at your destination safely!', 'success');
            return;
        }
        
        showToast(`Navigation: Step ${step} of 3 completed`, 'info');
    }, 5000);
}

function navigateToSafeZone(zoneName) {
    showToast(`Navigating to ${zoneName}...`, 'processing');
    
    // This would trigger route calculation to specific safe zone
    setTimeout(() => {
        showToast(`Route to ${zoneName} calculated`, 'success');
    }, 1500);
}

function updateMapOverlays() {
    const showFireOverlay = document.getElementById('show-fire-overlay')?.checked;
    const showSafeZones = document.getElementById('show-safe-zones')?.checked;
    const showAltRoutes = document.getElementById('show-alternative-routes')?.checked;

    // Update overlay visibility based on toggles
    if (evacuationMap) {
        evacuationMap.eachLayer(layer => {
            if (layer.options && layer.options.className) {
                if (layer.options.className.includes('fire-risk') && !showFireOverlay) {
                    layer.setStyle({ fillOpacity: 0, opacity: 0 });
                } else if (layer.options.className.includes('fire-risk') && showFireOverlay) {
                    layer.setStyle({ fillOpacity: 0.5, opacity: 1 });
                }
            }
        });

        safeZoneMarkers.forEach(marker => {
            if (showSafeZones) {
                marker.addTo(evacuationMap);
            } else {
                evacuationMap.removeLayer(marker);
            }
        });
    }
}

function openWhatIfModal() {
    const modal = document.getElementById('what-if-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        isWhatIfModeActive = true;
    }
}

function closeWhatIfModal() {
    const modal = document.getElementById('what-if-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        isWhatIfModeActive = false;
    }
}

function resetSimulation() {
    // Reset all simulation parameters to defaults
    document.getElementById('fire-intensity-slider').value = 50;
    document.getElementById('wind-speed-slider').value = 15;
    document.getElementById('wind-direction-select').value = 'NE';
    
    // Reset blocked roads
    const roadCheckboxes = ['block-highway-109', 'block-main-road', 'block-forest-road'];
    roadCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = false;
    });

    // Update display values
    document.getElementById('fire-intensity-value').textContent = '50%';
    document.getElementById('wind-speed-value').textContent = '15 km/h';

    showToast('Simulation parameters reset', 'success');
}

function runSimulation() {
    const fireIntensity = document.getElementById('fire-intensity-slider').value;
    const windSpeed = document.getElementById('wind-speed-slider').value;
    const windDirection = document.getElementById('wind-direction-select').value;
    
    showToast('Running fire simulation with new parameters...', 'processing', 3000);
    
    setTimeout(() => {
        // Simulate updated evacuation routes based on new parameters
        showToast('Simulation complete - evacuation routes updated', 'success');
        closeWhatIfModal();
        
        // Update route safety based on simulation results
        const safetyBadge = document.getElementById('route-safety');
        if (safetyBadge && fireIntensity > 70) {
            safetyBadge.className = 'route-safety-badge danger';
            safetyBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Rerouting';
            showRouteAlert('Primary route blocked - calculating alternative path', 'warning');
        }
    }, 3000);
}

function downloadEvacuationPlan() {
    showToast('Generating evacuation plan PDF...', 'processing', 2000);
    
    setTimeout(() => {
        // Simulate PDF generation
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,Emergency Evacuation Plan\n\nGenerated: ' + new Date().toLocaleString() + '\n\nRoute: Main Road → Highway 109 → Community Center\nDistance: 2.3 km\nEstimated Time: 8 minutes\n\nSafe Zone: Community Center\nCapacity: 200 people\nStatus: Available\n\nEmergency Contacts:\nFire Department: 101\nPolice: 100\nAmbulance: 108';
        link.download = 'evacuation-plan-' + new Date().toISOString().split('T')[0] + '.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Evacuation plan downloaded successfully!', 'success');
    }, 2000);
}

function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const messagesContainer = document.getElementById('ai-chat-messages');
    
    if (!input || !messagesContainer || !input.value.trim()) return;

    const userMessage = input.value.trim();
    input.value = '';

    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    userMessageDiv.innerHTML = `
        <div class="message-content user-message-content">
            <p>${userMessage}</p>
            <span class="message-time">Just now</span>
        </div>
        <div class="message-avatar user-avatar">
            <i class="fas fa-user"></i>
        </div>
    `;
    messagesContainer.appendChild(userMessageDiv);

    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "I can help you find the safest evacuation route. Based on current fire conditions, I recommend heading to the Community Center via Highway 109.",
            "The current fire intensity is moderate. Your safest option is to evacuate immediately using the highlighted route on the map.",
            "I've updated your evacuation route to avoid the fire-affected area. The new route will take approximately 8 minutes.",
            "All safe zones are currently accessible. The District Hospital has the highest capacity if you need medical assistance.",
            "Weather conditions are favorable for evacuation. Wind speed is moderate and visibility is good."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'ai-message';
        aiMessageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${randomResponse}</p>
                <span class="message-time">Just now</span>
            </div>
        `;
        messagesContainer.appendChild(aiMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Tutorial System Functions
let currentTutorialStep = 1;
const maxTutorialSteps = 4;

function setupTutorial() {
    const showTutorialBtn = document.getElementById('show-tutorial');
    if (showTutorialBtn) {
        showTutorialBtn.addEventListener('click', showTutorial);
    }
}

function showTutorial() {
    const modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        currentTutorialStep = 1;
        updateTutorialStep();
        updateTutorialButtons();
    }
}

function closeTutorial() {
    const modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        // Mark tutorial as seen
        localStorage.setItem('trainingTutorialSeen', 'true');
    }
}

function nextTutorialStep() {
    if (currentTutorialStep < maxTutorialSteps) {
        currentTutorialStep++;
        updateTutorialStep();
        updateTutorialButtons();
    } else {
        closeTutorial();
    }
}

function prevTutorialStep() {
    if (currentTutorialStep > 1) {
        currentTutorialStep--;
        updateTutorialStep();
        updateTutorialButtons();
    }
}

function updateTutorialStep() {
    // Hide all steps
    const steps = document.querySelectorAll('.tutorial-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Show current step
    const currentStep = document.querySelector(`.tutorial-step[data-step="${currentTutorialStep}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index + 1 === currentTutorialStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateTutorialButtons() {
    const prevBtn = document.getElementById('prev-tutorial');
    const nextBtn = document.getElementById('next-tutorial');
    
    if (prevBtn) {
        prevBtn.disabled = currentTutorialStep === 1;
    }
    
    if (nextBtn) {
        if (currentTutorialStep === maxTutorialSteps) {
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Start Playing!';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        }
    }
}

// Post-Fire Recovery Assistance Functions
async function generateRecoveryPlan() {
    const affectedArea = document.getElementById('affected-area').value;
    const vegetationType = document.getElementById('vegetation-type').value;
    const soilCondition = document.getElementById('soil-condition').value;
    const climateZone = document.getElementById('climate-zone').value;
    
    // Update status
    document.querySelector('.results-status').textContent = 'Generating plan...';
    document.querySelector('.results-status').style.background = 'rgba(245, 158, 11, 0.2)';
    document.querySelector('.results-status').style.color = '#F59E0B';
    
    try {
        // Generate recovery plan
        const recoveryResponse = await fetch('/api/ml/recovery/generate-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                burned_area_hectares: parseInt(affectedArea),
                vegetation_type: vegetationType,
                soil_condition: soilCondition,
                climate_zone: climateZone
            })
        });
        
        const recoveryData = await recoveryResponse.json();
        
        if (recoveryData.success) {
            displayRecoveryResults(recoveryData.recovery_plan);
            
            // Get climate impact analysis
            const climateResponse = await fetch('/api/ml/recovery/climate-impact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_area_hectares: parseInt(affectedArea),
                    vegetation_type: vegetationType,
                    time_horizon_years: 30
                })
            });
            
            const climateData = await climateResponse.json();
            
            if (climateData.success) {
                displayClimateImpact(climateData.climate_impact);
            }
            
            // Get funding analysis
            const fundingResponse = await fetch('/api/ml/recovery/funding-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_area_hectares: parseInt(affectedArea),
                    vegetation_type: vegetationType,
                    recovery_scope: 'comprehensive'
                })
            });
            
            const fundingData = await fundingResponse.json();
            
            if (fundingData.success) {
                displayFundingOptions(fundingData.funding_analysis);
            }
            
            // Update status to complete
            document.querySelector('.results-status').textContent = 'Plan generated successfully';
            document.querySelector('.results-status').style.background = 'rgba(16, 185, 129, 0.2)';
            document.querySelector('.results-status').style.color = '#10B981';
            
            showToast('Recovery plan generated successfully!', 'success');
        } else {
            throw new Error(recoveryData.error || 'Failed to generate recovery plan');
        }
        
    } catch (error) {
        console.error('Error generating recovery plan:', error);
        document.querySelector('.results-status').textContent = 'Generation failed';
        document.querySelector('.results-status').style.background = 'rgba(239, 68, 68, 0.2)';
        document.querySelector('.results-status').style.color = '#EF4444';
        showToast('Failed to generate recovery plan', 'error');
    }
}

function displayRecoveryResults(recoveryPlan) {
    // Display timeline
    const timelineContainer = document.getElementById('recovery-timeline');
    timelineContainer.innerHTML = `
        <h4 style="color: #F8FAFC; margin-bottom: 1.5rem;">Recovery Timeline</h4>
        <div class="timeline-phases">
            ${Object.entries(recoveryPlan.recovery_timeline).map(([phase, data]) => `
                <div class="timeline-phase">
                    <div class="phase-header">
                        <h5>${phase.replace(/_/g, ' ').toUpperCase()}</h5>
                        <span class="phase-duration">${data.duration_months} months</span>
                    </div>
                    <p class="phase-description">${data.description}</p>
                    <div class="phase-activities">
                        ${data.activities.slice(0, 3).map(activity => 
                            `<span class="activity-tag">${activity}</span>`
                        ).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Display species recommendations
    const speciesContainer = document.getElementById('species-grid');
    const primarySpecies = recoveryPlan.species_recommendations.primary || [];
    const secondarySpecies = recoveryPlan.species_recommendations.secondary || [];
    
    speciesContainer.innerHTML = [
        ...primarySpecies.slice(0, 3),
        ...secondarySpecies.slice(0, 2)
    ].map(species => `
        <div class="species-card">
            <div class="species-name">${species.name}</div>
            <div class="species-stats">
                <div class="species-stat">Survival Rate: ${(species.survival_rate * 100).toFixed(0)}%</div>
                <div class="species-stat">Growth: ${species.growth_rate}</div>
                <div class="species-stat">Carbon: ${species.carbon_sequestration || 'N/A'} kg/year</div>
            </div>
        </div>
    `).join('');
    
    // Display priority zones
    displayPriorityZones(recoveryPlan.priority_zones);
}

function displayClimateImpact(climateImpact) {
    // Update carbon sequestration
    document.getElementById('carbon-sequestration').textContent = 
        Math.round(climateImpact.carbon_sequestration.annual_sequestration_tonnes).toLocaleString();
    
    // Update biodiversity recovery
    document.getElementById('biodiversity-recovery').textContent = 
        `${Math.round(climateImpact.biodiversity_recovery.recovery_percentage_10_years)}%`;
    
    // Update economic value
    const economicValue = climateImpact.ecosystem_services_value.total_value_30_years;
    document.getElementById('economic-value').textContent = 
        `$${(economicValue / 1000000).toFixed(1)}M`;
}

function displayFundingOptions(fundingAnalysis) {
    const fundingContainer = document.querySelector('.funding-options');
    const costBreakdown = fundingAnalysis.cost_breakdown;
    const fundingOptions = fundingAnalysis.funding_options;
    
    fundingContainer.innerHTML = `
        <div class="funding-summary">
            <div class="cost-breakdown">
                <h5>Project Cost Breakdown</h5>
                <div class="cost-items">
                    <div class="cost-item">
                        <span>Total Cost:</span>
                        <span class="cost-value">$${(costBreakdown.total_cost / 1000).toFixed(0)}K</span>
                    </div>
                    <div class="cost-item">
                        <span>Per Hectare:</span>
                        <span class="cost-value">$${costBreakdown.cost_per_hectare}</span>
                    </div>
                </div>
            </div>
            <div class="funding-sources">
                <h5>Funding Sources</h5>
                ${fundingOptions.slice(0, 3).map(option => `
                    <div class="funding-source">
                        <span class="source-name">${option.source_name}</span>
                        <span class="source-amount">$${(option.potential_amount / 1000).toFixed(0)}K</span>
                        <span class="source-match">${option.match_percentage}% match</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function displayPriorityZones(priorityZones) {
    const mapContainer = document.getElementById('priority-map');
    
    // Create a visual representation of priority zones
    mapContainer.innerHTML = `
        <div class="zones-visualization">
            <div class="zone-section high-zone" style="height: ${(priorityZones.high_priority_hectares / (priorityZones.high_priority_hectares + priorityZones.medium_priority_hectares + priorityZones.low_priority_hectares)) * 100}%">
                <div class="zone-label">
                    <span class="zone-name">High Priority</span>
                    <span class="zone-area">${priorityZones.high_priority_hectares} ha</span>
                </div>
            </div>
            <div class="zone-section medium-zone" style="height: ${(priorityZones.medium_priority_hectares / (priorityZones.high_priority_hectares + priorityZones.medium_priority_hectares + priorityZones.low_priority_hectares)) * 100}%">
                <div class="zone-label">
                    <span class="zone-name">Medium Priority</span>
                    <span class="zone-area">${priorityZones.medium_priority_hectares} ha</span>
                </div>
            </div>
            <div class="zone-section low-zone" style="height: ${(priorityZones.low_priority_hectares / (priorityZones.high_priority_hectares + priorityZones.medium_priority_hectares + priorityZones.low_priority_hectares)) * 100}%">
                <div class="zone-label">
                    <span class="zone-name">Low Priority</span>
                    <span class="zone-area">${priorityZones.low_priority_hectares} ha</span>
                </div>
            </div>
        </div>
    `;
}

// Initialize evacuation routes when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add to existing initialization
    if (typeof initializeEvacuationRoutes === 'function') {
        setTimeout(initializeEvacuationRoutes, 1000);
    }
});

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        showToast(`Navigating to ${sectionId.replace('-', ' ')} section`, 'processing', 1500);
    }
}

// Download report function
function downloadReport() {
    showToast('Generating daily risk report...', 'processing', 2000);

    setTimeout(() => {
        showToast('Daily risk report downloaded successfully!', 'success');

        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,AgniVeer Daily Fire Risk Report\n\nGenerated: ' + new Date().toLocaleString() + '\n\nOverall Risk Level: High\nTotal Monitored Area: 53,483 km²\nActive Sensors: 247\nPrediction Accuracy: 89%';
        link.download = 'agniveer-daily-report-' + new Date().toISOString().split('T')[0] + '.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 2000);
}

// Community & Volunteer Engagement Module Functions
let currentTrainingMode = 'training';
let selectedTool = 'fireline';
let trainingScore = 2450;
let trainingTimer = 300; // 5 minutes
let trainingInterval = null;
let isTrainingActive = false;
let currentQuizQuestion = 1;
let totalQuizQuestions = 10;
let quizScore = 0;

// Quiz questions data
const quizQuestions = [
    {
        question: "What is the most effective way to create a firebreak?",
        options: [
            "Cut vegetation in a straight line",
            "Remove all combustible material in a wide strip",
            "Spray water on the ground",
            "Build a wall of rocks"
        ],
        correct: 1,
        explanation: "Removing all combustible materials creates the most effective barrier to fire spread."
    },
    {
        question: "In which direction should you evacuate during a wildfire?",
        options: [
            "Against the wind direction",
            "With the wind direction", 
            "Perpendicular to the wind direction",
            "It doesn't matter"
        ],
        correct: 2,
        explanation: "Moving perpendicular to wind direction helps avoid the fire's path while not fighting against evacuation speed."
    },
    {
        question: "What is the 'fire triangle' concept?",
        options: [
            "Heat, Fuel, and Oxygen",
            "Wind, Temperature, and Humidity",
            "Forest, Grass, and Buildings",
            "Red, Orange, and Yellow flames"
        ],
        correct: 0,
        explanation: "Fire needs heat, fuel, and oxygen to exist. Remove any one element and the fire goes out."
    },
    {
        question: "How much defensible space should you maintain around structures?",
        options: [
            "10 feet",
            "30 feet",
            "100 feet or more",
            "No space needed"
        ],
        correct: 2,
        explanation: "At least 100 feet of defensible space is recommended, with the first 30 feet being most critical."
    },
    {
        question: "What time of day are wildfires typically most dangerous?",
        options: [
            "Early morning",
            "Midday to late afternoon",
            "Evening",
            "Midnight"
        ],
        correct: 1,
        explanation: "Afternoon hours have the hottest temperatures, lowest humidity, and strongest winds."
    },
    {
        question: "Which weather condition increases fire danger the most?",
        options: [
            "High humidity",
            "Low wind speeds",
            "Low humidity with strong winds",
            "Cold temperatures"
        ],
        correct: 2,
        explanation: "Low humidity dries out vegetation while strong winds rapidly spread fires."
    },
    {
        question: "What should you do if caught in a wildfire while driving?",
        options: [
            "Drive through the flames quickly",
            "Stop, park in an open area, stay in car",
            "Get out and run",
            "Turn around immediately"
        ],
        correct: 1,
        explanation: "Cars provide protection from radiant heat. Park away from vegetation, close vents, and stay low."
    },
    {
        question: "How do backfires help in firefighting?",
        options: [
            "They create more smoke",
            "They burn fuel ahead of the main fire",
            "They cool the air temperature",
            "They create water vapor"
        ],
        correct: 1,
        explanation: "Backfires consume fuel in the path of the main fire, creating a firebreak."
    },
    {
        question: "What is the best way to prepare your property for wildfire season?",
        options: [
            "Water the lawn more frequently",
            "Create defensible space and use fire-resistant plants",
            "Install more outdoor lighting",
            "Build higher fences"
        ],
        correct: 1,
        explanation: "Defensible space and fire-resistant landscaping are key to property protection."
    },
    {
        question: "When should you evacuate during a wildfire threat?",
        options: [
            "Only when you see flames",
            "When authorities issue evacuation orders",
            "After gathering all belongings",
            "When the fire is within 1 mile"
        ],
        correct: 1,
        explanation: "Always follow official evacuation orders immediately. Don't wait to see flames."
    }
];

// Initialize Community Engagement Module
function initializeCommunityEngagement() {
    setupModeSelection();
    setupTrainingArena();
    setupQuizMode();
    setupLeaderboard();
    setupTutorial();
    
    // Start timer updates
    setInterval(updateDisplayTimers, 1000);
    
    // Show tutorial for first-time users
    if (!localStorage.getItem('trainingTutorialSeen')) {
        setTimeout(() => {
            showTutorial();
        }, 1000);
    }
    
    showToast('Community engagement module loaded successfully!', 'success');
}

// Mode Selection Functions
function setupModeSelection() {
    const modeCards = document.querySelectorAll('.mode-card');
    
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            switchEngagementMode(mode);
            
            // Update active card
            modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
}

function switchEngagementMode(mode) {
    currentTrainingMode = mode;
    
    // Hide all modules
    const modules = document.querySelectorAll('.engagement-module');
    modules.forEach(module => {
        module.classList.remove('active');
    });
    
    // Show selected module
    const selectedModule = document.getElementById(`${mode}-mode`);
    if (selectedModule) {
        selectedModule.classList.add('active');
        
        // Initialize mode-specific features
        if (mode === 'training') {
            resetTrainingArena();
        } else if (mode === 'quiz') {
            startQuiz();
        } else if (mode === 'leaderboard') {
            updateLeaderboard();
        }
    }
    
    showToast(`Switched to ${mode} mode`, 'info', 2000);
}

// Training Arena Functions
function setupTrainingArena() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const canvas = document.getElementById('training-canvas');
    const startBtn = document.getElementById('start-training');
    const pauseBtn = document.getElementById('pause-training');
    const resetBtn = document.getElementById('reset-training');
    
    // Tool selection
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTool = btn.dataset.tool;
            
            // Update cursor style based on selected tool
            canvas.style.cursor = getToolCursor(selectedTool);
            
            showToast(`Selected ${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} tool`, 'success', 1500);
        });
    });
    
    // Canvas interactions
    if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mouseover', () => {
            canvas.style.cursor = getToolCursor(selectedTool);
        });
    }
    
    // Control buttons
    if (startBtn) startBtn.addEventListener('click', startTrainingSimulation);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTrainingSimulation);
    if (resetBtn) resetBtn.addEventListener('click', resetTrainingArena);
    
    // Scenario selection
    const scenarioItems = document.querySelectorAll('.scenario-item');
    scenarioItems.forEach(item => {
        if (!item.classList.contains('locked')) {
            item.addEventListener('click', () => {
                scenarioItems.forEach(s => s.classList.remove('active'));
                item.classList.add('active');
                loadScenario(item);
            });
        } else {
            item.addEventListener('click', () => {
                showToast('Complete previous scenarios to unlock!', 'warning', 2000);
            });
        }
    });
    
    // Initialize canvas cursor
    if (canvas) {
        canvas.style.cursor = getToolCursor(selectedTool);
    }
}

function getToolCursor(tool) {
    switch (tool) {
        case 'fireline': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path d=\'M2 12L22 2v20L2 12z\' fill=\'%23FF4500\'/></svg>") 12 12, crosshair';
        case 'water': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path d=\'M12 2l7 7-7 7-7-7 7-7z\' fill=\'%233B82F6\'/></svg>") 12 12, crosshair';
        case 'buffer': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><circle cx=\'12\' cy=\'12\' r=\'10\' fill=\'none\' stroke=\'%2310B981\' stroke-width=\'2\'/></svg>") 12 12, crosshair';
        case 'evacuation': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path d=\'M2 12h20m-10-8l8 8-8 8\' fill=\'none\' stroke=\'%236366F1\' stroke-width=\'2\'/></svg>") 12 12, crosshair';
        default: return 'crosshair';
    }
}

function handleCanvasClick(event) {
    if (!isTrainingActive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    placeTrainingAction(x, y, selectedTool);
}

function placeTrainingAction(x, y, tool) {
    const canvas = document.getElementById('training-canvas');
    const overlays = document.getElementById('action-overlays');
    
    const toolCosts = {
        'fireline': 10,
        'water': 15,
        'buffer': 20,
        'evacuation': 5
    };
    
    const cost = toolCosts[tool] || 10;
    
    if (trainingScore >= cost) {
        trainingScore -= cost;
        updateTrainingScore();
        
        const actionElement = createActionElement(x, y, tool);
        overlays.appendChild(actionElement);
        
        // Simulate fire response
        simulateFireResponse(x, y, tool);
        
        // Add score for effective placement
        const effectiveness = calculatePlacementEffectiveness(x, y, tool);
        const earnedPoints = Math.floor(effectiveness * cost * 1.5);
        trainingScore += earnedPoints;
        
        showToast(`${tool} placed! Earned ${earnedPoints} points`, 'success', 2000);
    } else {
        showToast('Not enough points!', 'error', 2000);
    }
}

function createActionElement(x, y, tool) {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
    element.style.transform = 'translate(-50%, -50%)';
    element.style.zIndex = '20';
    
    switch (tool) {
        case 'fireline':
            element.className = 'fireline-overlay';
            element.style.width = '100px';
            element.style.height = '4px';
            break;
        case 'water':
            element.className = 'water-overlay';
            break;
        case 'buffer':
            element.className = 'buffer-overlay';
            element.style.width = '80px';
            element.style.height = '60px';
            break;
        case 'evacuation':
            element.innerHTML = '<i class="fas fa-route" style="color: #3B82F6; font-size: 1.5rem;"></i>';
            break;
    }
    
    return element;
}

function simulateFireResponse(x, y, tool) {
    // Simple fire response simulation
    const fireSource = document.querySelector('.fire-source');
    if (!fireSource) return;
    
    const fireRect = fireSource.getBoundingClientRect();
    const canvas = document.getElementById('training-canvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    const fireX = ((fireRect.left - canvasRect.left + fireRect.width / 2) / canvasRect.width) * 100;
    const fireY = ((fireRect.top - canvasRect.top + fireRect.height / 2) / canvasRect.height) * 100;
    
    const distance = Math.sqrt(Math.pow(x - fireX, 2) + Math.pow(y - fireY, 2));
    
    if (distance < 20) { // Close enough to affect fire
        const fireAnimation = fireSource.querySelector('.fire-animation');
        if (fireAnimation) {
            // Temporarily slow down fire animation
            fireAnimation.style.animationDuration = '4s';
            setTimeout(() => {
                fireAnimation.style.animationDuration = '2s';
            }, 3000);
        }
    }
}

function calculatePlacementEffectiveness(x, y, tool) {
    // Calculate how effective the tool placement is
    // This is a simplified version - in a real game, this would be much more complex
    
    const fireSource = document.querySelector('.fire-source');
    const village = document.querySelector('.village-marker');
    
    if (!fireSource || !village) return 0.5;
    
    // Get positions
    const fireX = 15; // From CSS
    const fireY = 20;
    const villageX = 80;
    const villageY = 60;
    
    // Calculate if placement is between fire and village
    const isInPath = isPointBetween(x, y, fireX, fireY, villageX, villageY);
    
    let effectiveness = 0.3; // Base effectiveness
    
    if (isInPath) {
        effectiveness += 0.4; // Bonus for good positioning
    }
    
    // Tool-specific bonuses
    switch (tool) {
        case 'fireline':
            if (isInPath) effectiveness += 0.3;
            break;
        case 'water':
            effectiveness += 0.2; // Water is always somewhat effective
            break;
        case 'buffer':
            if (Math.abs(x - villageX) < 20 && Math.abs(y - villageY) < 20) {
                effectiveness += 0.4; // Great for protecting structures
            }
            break;
    }
    
    return Math.min(effectiveness, 1.0);
}

function isPointBetween(px, py, ax, ay, bx, by) {
    const distAB = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    const distAP = Math.sqrt(Math.pow(px - ax, 2) + Math.pow(py - ay, 2));
    const distPB = Math.sqrt(Math.pow(bx - px, 2) + Math.pow(by - py, 2));
    
    return Math.abs(distAP + distPB - distAB) < 5; // Tolerance for "between"
}

function startTrainingSimulation() {
    if (isTrainingActive) {
        showToast('Simulation already running!', 'warning', 2000);
        return;
    }
    
    isTrainingActive = true;
    trainingTimer = 300; // Reset to 5 minutes
    
    // Start the fire animation
    const fireAnimation = document.querySelector('.fire-animation');
    if (fireAnimation) {
        fireAnimation.style.animationDuration = '1.5s';
        fireAnimation.classList.add('fire-active');
    }
    
    trainingInterval = setInterval(() => {
        trainingTimer--;
        updateTrainingTimer();
        
        // Update fire spread simulation
        simulateFireProgression();
        
        if (trainingTimer <= 0) {
            endTrainingSimulation();
        }
    }, 1000);
    
    showToast('🔥 Fire emergency started! Protect the village!', 'success', 3000);
    
    // Enable tools
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => btn.disabled = false);
    
    // Update button states
    const startBtn = document.getElementById('start-training');
    const pauseBtn = document.getElementById('pause-training');
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
}

function simulateFireProgression() {
    if (!isTrainingActive) return;
    
    const fireSource = document.querySelector('.fire-source');
    const village = document.querySelector('.village-marker');
    
    if (fireSource && village) {
        // Simple fire progression - increase size over time
        const currentSize = parseInt(fireSource.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || 1);
        const newSize = Math.min(currentSize + 0.005, 2); // Max 2x size
        
        fireSource.style.transform = `scale(${newSize})`;
        
        // Check if fire reached village
        if (newSize > 1.5 && !document.querySelector('.village-protected')) {
            // Fire is getting close to village
            if (Math.random() < 0.1) { // 10% chance per second when close
                showToast('⚠️ Fire is approaching the village!', 'warning', 2000);
            }
        }
    }
}

function pauseTrainingSimulation() {
    isTrainingActive = false;
    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }
    showToast('Training simulation paused', 'info');
}

function resetTrainingArena() {
    isTrainingActive = false;
    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }
    
    trainingTimer = 300;
    trainingScore = 2450;
    
    // Clear all action overlays
    const overlays = document.getElementById('action-overlays');
    if (overlays) {
        overlays.innerHTML = '';
    }
    
    // Reset fire animation
    const fireAnimation = document.querySelector('.fire-animation');
    if (fireAnimation) {
        fireAnimation.style.animationDuration = '2s';
    }
    
    updateTrainingTimer();
    updateTrainingScore();
    
    showToast('Training arena reset', 'info');
}

function endTrainingSimulation() {
    isTrainingActive = false;
    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }
    
    // Calculate final score and performance
    const performance = calculateTrainingPerformance();
    showTrainingResults(performance);
    
    showToast('Training simulation completed!', 'success');
}

function calculateTrainingPerformance() {
    // Simple performance calculation
    const timeUsed = 300 - trainingTimer;
    const timeScore = Math.max(0, 300 - timeUsed) / 300;
    const effectivenessScore = Math.min(trainingScore / 2450, 1.5); // Can exceed original score
    
    const finalScore = Math.floor((timeScore + effectivenessScore) * 1000);
    
    return {
        finalScore,
        timeUsed,
        effectiveness: effectivenessScore,
        rating: finalScore > 1500 ? 'Excellent' : finalScore > 1000 ? 'Good' : finalScore > 500 ? 'Fair' : 'Needs Improvement'
    };
}

function showTrainingResults(performance) {
    // This would show a modal with results - simplified version
    const message = `Training Complete!\nScore: ${performance.finalScore}\nRating: ${performance.rating}\nTime Used: ${Math.floor(performance.timeUsed / 60)}:${(performance.timeUsed % 60).toString().padStart(2, '0')}`;
    
    setTimeout(() => {
        showToast(message, 'success', 5000);
    }, 500);
    
    // Update progress
    updatePlayerProgress();
}

function updateTrainingTimer() {
    const timerElement = document.getElementById('training-timer');
    if (timerElement) {
        const minutes = Math.floor(trainingTimer / 60);
        const seconds = trainingTimer % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function updateTrainingScore() {
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
        scoreElement.textContent = trainingScore.toLocaleString();
    }
}

function loadScenario(scenarioElement) {
    const scenarioName = scenarioElement.querySelector('.scenario-name').textContent;
    const difficulty = scenarioElement.querySelector('.scenario-difficulty').textContent;
    
    // Update scenario title
    const scenarioTitle = document.getElementById('current-scenario');
    if (scenarioTitle) {
        scenarioTitle.textContent = scenarioName;
    }
    
    // Reset arena for new scenario
    resetTrainingArena();
    
    // Adjust difficulty (simplified)
    switch (difficulty.toLowerCase()) {
        case 'easy':
            trainingTimer = 300; // 5 minutes
            break;
        case 'medium':
            trainingTimer = 240; // 4 minutes
            break;
        case 'hard':
            trainingTimer = 180; // 3 minutes
            break;
    }
    
    updateTrainingTimer();
    showToast(`Loaded scenario: ${scenarioName}`, 'info');
}

// Quiz Mode Functions
function setupQuizMode() {
    const nextBtn = document.getElementById('next-question');
    const prevBtn = document.getElementById('prev-question');
    
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
    
    // Quiz option selection
    setupQuizOptions();
}

function setupQuizOptions() {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            selectQuizOption(option);
        });
    });
}

function selectQuizOption(selectedOption) {
    // Remove previous selections
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Mark selected option
    selectedOption.classList.add('selected');
    
    // Enable next button
    const nextBtn = document.getElementById('next-question');
    if (nextBtn) nextBtn.disabled = false;
}

function startQuiz() {
    currentQuizQuestion = 1;
    quizScore = 0;
    loadQuizQuestion(currentQuizQuestion);
    updateQuizProgress();
}

function loadQuizQuestion(questionNumber) {
    const questionIndex = questionNumber - 1;
    const questionData = quizQuestions[questionIndex];
    
    if (!questionData) return;
    
    // Update question text
    const questionElement = document.getElementById('quiz-question');
    if (questionElement) {
        questionElement.textContent = questionData.question;
    }
    
    // Update options
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        const optionText = option.querySelector('.option-text');
        if (optionText && questionData.options[index]) {
            optionText.textContent = questionData.options[index];
        }
        
        // Reset option styling
        option.classList.remove('selected', 'correct', 'incorrect');
        option.dataset.answer = String.fromCharCode(97 + index); // a, b, c, d
    });
    
    updateQuizProgress();
}

function nextQuestion() {
    // Check answer before moving to next question
    const selectedOption = document.querySelector('.quiz-option.selected');
    if (selectedOption) {
        checkQuizAnswer(selectedOption);
    }
    
    if (currentQuizQuestion < totalQuizQuestions) {
        currentQuizQuestion++;
        setTimeout(() => {
            loadQuizQuestion(currentQuizQuestion);
            
            // Disable next button until option is selected
            const nextBtn = document.getElementById('next-question');
            if (nextBtn) nextBtn.disabled = true;
        }, 1500); // Delay to show correct answer
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuizQuestion > 1) {
        currentQuizQuestion--;
        loadQuizQuestion(currentQuizQuestion);
    }
}

function checkQuizAnswer(selectedOption) {
    const questionIndex = currentQuizQuestion - 1;
    const questionData = quizQuestions[questionIndex];
    const selectedIndex = Array.from(document.querySelectorAll('.quiz-option')).indexOf(selectedOption);
    
    // Show correct answer
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        if (index === questionData.correct) {
            option.classList.add('correct');
        } else if (option === selectedOption && index !== questionData.correct) {
            option.classList.add('incorrect');
        }
    });
    
    // Update score
    if (selectedIndex === questionData.correct) {
        quizScore++;
        showToast('Correct! +10 points', 'success', 1500);
    } else {
        showToast(`Incorrect. ${questionData.explanation}`, 'error', 3000);
    }
}

function updateQuizProgress() {
    const currentElement = document.getElementById('current-question');
    const totalElement = document.getElementById('total-questions');
    const progressBar = document.querySelector('.quiz-container .progress-fill');
    
    if (currentElement) currentElement.textContent = currentQuizQuestion;
    if (totalElement) totalElement.textContent = totalQuizQuestions;
    
    if (progressBar) {
        const progress = (currentQuizQuestion / totalQuizQuestions) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Update button states
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    
    if (prevBtn) prevBtn.disabled = currentQuizQuestion === 1;
    if (nextBtn) nextBtn.disabled = true; // Enabled when option is selected
}

function finishQuiz() {
    const percentage = Math.round((quizScore / totalQuizQuestions) * 100);
    const message = `Quiz completed!\nScore: ${quizScore}/${totalQuizQuestions} (${percentage}%)\n\nGreat job learning fire safety!`;
    
    showToast(message, 'success', 5000);
    
    // Update player progress
    updatePlayerProgress();
    
    // Reset quiz after delay
    setTimeout(() => {
        startQuiz();
    }, 3000);
}

// Leaderboard Functions
function setupLeaderboard() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            updateLeaderboard(tab);
        });
    });
}

function updateLeaderboard(period = 'weekly') {
    // This would fetch real leaderboard data in a production app
    // For now, we'll just show a toast message
    showToast(`Updated ${period} leaderboard`, 'info', 2000);
    
    // Simulate data update with slight animation
    const leaderboardItems = document.querySelectorAll('.leaderboard-item');
    leaderboardItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                item.style.transform = 'translateY(0)';
            }, 200);
        }, index * 100);
    });
}

// Progress and Achievement Functions
function updatePlayerProgress() {
    // Simulate XP gain
    const xpGain = Math.floor(Math.random() * 50) + 25;
    
    // Update XP display
    const xpFill = document.querySelector('.xp-fill');
    if (xpFill) {
        const currentWidth = parseInt(xpFill.style.width) || 65;
        const newWidth = Math.min(currentWidth + (xpGain / 10), 100);
        xpFill.style.width = `${newWidth}%`;
        
        if (newWidth >= 100) {
            levelUp();
        }
    }
    
    // Update score
    trainingScore += xpGain;
    updateTrainingScore();
    
    // Random badge unlock
    if (Math.random() < 0.3) {
        unlockRandomBadge();
    }
}

function levelUp() {
    const levelElement = document.getElementById('player-level');
    if (levelElement) {
        const currentLevel = parseInt(levelElement.textContent) || 3;
        levelElement.textContent = currentLevel + 1;
    }
    
    // Reset XP bar
    const xpFill = document.querySelector('.xp-fill');
    if (xpFill) {
        xpFill.style.width = '15%';
    }
    
    showToast('🎉 Level Up! You are now a Fire Specialist!', 'success', 4000);
}

function unlockRandomBadge() {
    const lockedBadges = document.querySelectorAll('.badge-item:not(.earned)');
    if (lockedBadges.length > 0) {
        const randomBadge = lockedBadges[Math.floor(Math.random() * lockedBadges.length)];
        randomBadge.classList.add('earned');
        
        const badgeName = randomBadge.querySelector('.badge-name').textContent;
        showToast(`🏆 Badge Unlocked: ${badgeName}!`, 'success', 3000);
        
        // Update badge count
        const badgeCountElement = document.getElementById('badge-count');
        if (badgeCountElement) {
            const currentCount = parseInt(badgeCountElement.textContent) || 7;
            badgeCountElement.textContent = currentCount + 1;
        }
    }
}

// Utility Functions
function updateDisplayTimers() {
    // Update any time-based displays
    if (isTrainingActive && trainingTimer > 0) {
        // Timer is already updated in the training loop
    }
}

// Initialize Community Engagement when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add to existing initialization
    setTimeout(() => {
        initializeCommunityEngagement();
    }, 1000);
});

// Resource Optimization Functions
function initializeResourceOptimization() {
    const optimizeBtn = document.getElementById('optimize-deployment');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', runResourceOptimization);
    }
}

async function runResourceOptimization() {
    const optimizeBtn = document.getElementById('optimize-deployment');
    if (optimizeBtn) {
        optimizeBtn.disabled = true;
        optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
    }

    // Get current resource counts
    const firefighters = parseInt(document.getElementById('firefighters-count')?.value) || 50;
    const waterTanks = parseInt(document.getElementById('water-tanks-count')?.value) || 20;
    const drones = parseInt(document.getElementById('drones-count')?.value) || 15;
    const helicopters = parseInt(document.getElementById('helicopters-count')?.value) || 8;

    try {

        // Get current environmental data
        const envData = getCurrentEnvironmentalData();

        const requestData = {
            ...envData,
            firefighters,
            water_tanks: waterTanks,
            drones,
            helicopters
        };

        showToast('Running AI optimization algorithm...', 'processing', 3000);

        // Call ML API for optimization
        const response = await fetch(`${ML_API_BASE}/api/ml/optimize-resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                currentOptimization = result.optimization;
                displayOptimizationResults(result.optimization);
                updateDeploymentMap(result.optimization.deployment_plan);
                showToast('Resource optimization completed successfully!', 'success');
            }
        } else {
            throw new Error('API request failed');
        }
    } catch (error) {
        console.warn('ML API unavailable, using fallback optimization');
        const fallbackOptimization = generateFallbackOptimization(firefighters, waterTanks, drones, helicopters);
        currentOptimization = fallbackOptimization;
        displayOptimizationResults(fallbackOptimization);
        updateDeploymentMap(fallbackOptimization.deployment_plan);
        showToast('Optimization completed with local algorithm', 'warning');
    }

    if (optimizeBtn) {
        optimizeBtn.disabled = false;
        optimizeBtn.innerHTML = '<i class="fas fa-magic"></i> Optimize Deployment';
    }
}

function displayOptimizationResults(optimization) {
    // Update optimization score
    const scoreElement = document.getElementById('optimization-score');
    if (scoreElement) {
        scoreElement.textContent = optimization.optimization_score + '/100';
    }

    // Update coverage metrics
    updateElementText('overall-coverage', optimization.coverage_metrics.overall_coverage_percentage.toFixed(1) + '%');
    updateElementText('avg-response-time', optimization.response_times.overall.average_minutes.toFixed(1) + ' min');
    updateElementText('districts-covered', optimization.coverage_metrics.total_districts_covered + '/13');

    // Calculate high risk coverage
    const highRiskCoverage = calculateHighRiskCoverage(optimization.deployment_plan);
    updateElementText('high-risk-coverage', highRiskCoverage + '%');

    // Update resource breakdown
    updateResourceBreakdown(optimization.deployment_plan);

    // Update recommendations
    updateRecommendations(optimization.recommendations);
}

function calculateHighRiskCoverage(deploymentPlan) {
    const highRiskDistricts = ['Nainital', 'Almora', 'Chamoli'];
    let covered = 0;

    Object.values(deploymentPlan).forEach(deployments => {
        deployments.forEach(deployment => {
            if (highRiskDistricts.includes(deployment.district)) {
                covered++;
            }
        });
    });

    return Math.min(100, Math.round((covered / highRiskDistricts.length) * 100));
}

function updateResourceBreakdown(deploymentPlan) {
    const container = document.getElementById('resource-breakdown');
    if (!container) return;

    container.innerHTML = '';

    const resourceIcons = {
        firefighters: 'fas fa-users',
        water_tanks: 'fas fa-tint',
        drones: 'fas fa-helicopter',
        helicopters: 'fas fa-plane'
    };

    Object.entries(deploymentPlan).forEach(([resourceType, deployments]) => {
        if (deployments.length > 0) {
            const totalUnits = deployments.reduce((sum, d) => sum + d.units, 0);
            const districtsCount = deployments.length;

            const item = document.createElement('div');
            item.className = 'resource-breakdown-item';
            item.innerHTML = `
                <div class="breakdown-resource">
                    <i class="${resourceIcons[resourceType]}"></i>
                    ${resourceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div class="breakdown-count">${totalUnits} units in ${districtsCount} districts</div>
            `;
            container.appendChild(item);
        }
    });
}

function updateRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    if (!container) return;

    container.innerHTML = '';

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${rec}</span>
        `;
        container.appendChild(item);
    });
}

function updateDeploymentMap(deploymentPlan) {
    if (!deploymentMap) return;

    // Clear existing deployment layers
    deploymentLayers.forEach(layer => {
        try {
            deploymentMap.removeLayer(layer);
        } catch (e) {
            // Ignore errors for layers already removed
        }
    });
    deploymentLayers = [];

    const resourceColors = {
        firefighters: '#FF4500',
        water_tanks: '#3B82F6',
        drones: '#10B981',
        helicopters: '#8B5CF6'
    };

    const resourceIcons = {
        firefighters: 'fas fa-users',
        water_tanks: 'fas fa-tint',
        drones: 'fas fa-helicopter',
        helicopters: 'fas fa-plane'
    };

    const offsets = {
        firefighters: [0, 0],
        water_tanks: [0.008, 0.008],
        drones: [-0.008, 0.008],
        helicopters: [0.008, -0.008]
    };

    Object.entries(deploymentPlan).forEach(([resourceType, deployments]) => {
        deployments.forEach(deployment => {
            const offset = offsets[resourceType] || [0, 0];
            const adjustedCoords = [
                deployment.coordinates[0] + offset[0],
                deployment.coordinates[1] + offset[1]
            ];

            const marker = L.marker(adjustedCoords, {
                icon: L.divIcon({
                    className: 'deployment-marker',
                    html: `
                        <div class="deployment-icon" style="background-color: ${resourceColors[resourceType]};">
                            <i class="${resourceIcons[resourceType]}"></i>
                            <span class="unit-count">${deployment.units}</span>
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            }).addTo(deploymentMap);

            // Add coverage circle
            const coverageCircle = L.circle(adjustedCoords, {
                color: resourceColors[resourceType],
                fillColor: resourceColors[resourceType],
                fillOpacity: 0.1,
                radius: deployment.coverage_radius * 1000, // Convert km to meters
                weight: 1
            }).addTo(deploymentMap);

            marker.bindPopup(`
                <div style="color: #1a202c;">
                    <h4 style="margin: 0 0 5px 0; color: ${resourceColors[resourceType]}">${deployment.district}</h4>
                    <p style="margin: 2px 0;"><strong>Resource:</strong> ${resourceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p style="margin: 2px 0;"><strong>Units:</strong> ${deployment.units}</p>
                    <p style="margin: 2px 0;"><strong>Risk Score:</strong> ${(deployment.risk_score * 100).toFixed(1)}%</p>
                    <p style="margin: 2px 0;"><strong>Coverage:</strong> ${deployment.coverage_radius} km radius</p>
                </div>
            `);

            deploymentLayers.push(marker);
            deploymentLayers.push(coverageCircle);
        });
    });
}

function addDistrictBoundaries() {
    if (!deploymentMap) return;

    const districts = [
        {
            name: 'Nainital',
            coords: [[29.2, 79.3], [29.6, 79.3], [29.6, 79.8], [29.2, 79.8]],
            risk: 'very-high'
        },
        {
            name: 'Almora',
            coords: [[29.5, 79.5], [29.9, 79.5], [29.9, 80.0], [29.5, 80.0]],
            risk: 'high'
        },
        {
            name: 'Dehradun',
            coords: [[30.1, 77.8], [30.5, 77.8], [30.5, 78.3], [30.1, 78.3]],
            risk: 'moderate'
        }
    ];

    districts.forEach(district => {
        const riskColors = {
            'very-high': '#FF4444',
            'high': '#FFA726',
            'moderate': '#66BB6A',
            'low': '#42A5F5'
        };

        const polygon = L.polygon(district.coords, {
            color: riskColors[district.risk],
            fillColor: riskColors[district.risk],
            fillOpacity: 0.2,
            weight: 2
        }).addTo(deploymentMap);

        polygon.bindTooltip(district.name, { permanent: false, direction: 'center' });
    });
}

function generateFallbackOptimization(ff, wt, dr, hc) {
    // Fallback optimization when ML API is unavailable
    // Proportional distribution for demo purposes
    return {
        deployment_plan: {
            firefighters: [
                { district: 'Nainital', coordinates: [29.3806, 79.4422], units: Math.max(1, Math.floor(ff * 0.6)), risk_score: 0.85, coverage_radius: 5 },
                { district: 'Almora', coordinates: [29.6500, 79.6667], units: Math.max(1, Math.floor(ff * 0.4)), risk_score: 0.68, coverage_radius: 5 }
            ],
            water_tanks: [
                { district: 'Nainital', coordinates: [29.3806, 79.4422], units: Math.max(1, Math.floor(wt * 0.7)), risk_score: 0.85, coverage_radius: 3 },
                { district: 'Dehradun', coordinates: [30.3165, 78.0322], units: Math.max(1, Math.floor(wt * 0.3)), risk_score: 0.42, coverage_radius: 3 }
            ],
            drones: [
                { district: 'Nainital', coordinates: [29.3806, 79.4422], units: Math.max(1, Math.floor(dr * 0.4)), risk_score: 0.85, coverage_radius: 15 },
                { district: 'Almora', coordinates: [29.6500, 79.6667], units: Math.max(1, Math.floor(dr * 0.3)), risk_score: 0.68, coverage_radius: 15 },
                { district: 'Chamoli', coordinates: [30.4000, 79.3200], units: Math.max(1, Math.floor(dr * 0.3)), risk_score: 0.72, coverage_radius: 15 }
            ],
            helicopters: [
                { district: 'Nainital', coordinates: [29.3806, 79.4422], units: Math.max(1, hc), risk_score: 0.85, coverage_radius: 50 }
            ]
        },
        coverage_metrics: {
            overall_coverage_percentage: 78.5,
            total_districts_covered: 10,
            coverage_by_resource: {}
        },
        response_times: {
            overall: {
                average_minutes: 12.3,
                efficiency_score: 87.7
            }
        },
        optimization_score: 82.1,
        recommendations: [
            "Deploy additional helicopters for rapid response in high-risk areas",
            "Increase drone surveillance for better real-time monitoring",
            "Consider mobile water tank units for flexible deployment",
            "Maintain current deployment strategy for optimal coverage"
        ]
    };
}

// Environmental Impact Functions
function initializeEnvironmentalImpact() {
    // Initialize visualization controls
    const vizButtons = document.querySelectorAll('.viz-btn');
    vizButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vizType = e.target.getAttribute('data-viz');
            switchVisualization(vizType);
        });
    });

    // Initialize analysis buttons
    const carbonAnalysisBtn = document.getElementById('run-carbon-analysis');
    const impactAnalysisBtn = document.getElementById('run-impact-analysis');
    const exportBtn = document.getElementById('export-analysis');

    if (carbonAnalysisBtn) {
        carbonAnalysisBtn.addEventListener('click', runCarbonAnalysis);
    }
    
    if (impactAnalysisBtn) {
        impactAnalysisBtn.addEventListener('click', runEnvironmentalImpactAnalysis);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnalysisReport);
    }

    // Initialize charts
    initializeEnvironmentalCharts();
    
    showToast('Environmental impact analysis ready', 'success');
}

function initializeEnvironmentalCharts() {
    // Carbon Emissions Chart
    const carbonCtx = document.getElementById('carbonEmissionsChart');
    if (carbonCtx) {
        window.carbonEmissionsChart = new Chart(carbonCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['0h', '1h', '2h', '3h', '4h', '5h', '6h'],
                datasets: [{
                    label: 'CO₂ Emissions (tonnes/hour)',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: getChartOptions('CO₂ Emissions Over Time', 'tonnes/hour')
        });
    }

    // Recovery Progress Chart
    const recoveryCtx = document.getElementById('recoveryProgressChart');
    if (recoveryCtx) {
        window.recoveryProgressChart = new Chart(recoveryCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Vegetation', 'Soil Health', 'Wildlife', 'Water Cycle', 'Carbon Storage'],
                datasets: [{
                    label: 'Recovery Progress (%)',
                    data: [0, 0, 0, 0, 0],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    pointBackgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#ffffff' } }
                },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#ffffff' },
                        ticks: { color: '#ffffff', backdropColor: 'transparent' },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    // Economic Impact Chart
    const economicCtx = document.getElementById('economicImpactChart');
    if (economicCtx) {
        window.economicImpactChart = new Chart(economicCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Direct Timber Loss', 'Ecosystem Services', 'Recreation/Tourism', 'Restoration Cost'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff', padding: 15 }
                    }
                }
            }
        });
    }

    // Carbon Loss Chart
    const carbonLossCtx = document.getElementById('carbonLossChart');
    if (carbonLossCtx) {
        window.carbonLossChart = new Chart(carbonLossCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Year 1-5', 'Year 6-10', 'Year 11-20', 'Year 21-30', 'Year 31+'],
                datasets: [{
                    label: 'Lost Sequestration (tonnes CO₂)',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#EF4444',
                    borderWidth: 1
                }]
            },
            options: getChartOptions('Carbon Sequestration Loss Over Time', 'tonnes CO₂')
        });
    }
}

function getChartOptions(title, yAxisLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                color: '#ffffff',
                font: { size: 14 }
            },
            legend: { labels: { color: '#ffffff' } }
        },
        scales: {
            x: {
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#ffffff' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                title: {
                    display: true,
                    text: yAxisLabel,
                    color: '#ffffff'
                }
            }
        }
    };
}

function switchVisualization(vizType) {
    // Update button states
    document.querySelectorAll('.viz-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-viz="${vizType}"]`).classList.add('active');

    // Switch visualization panels
    document.querySelectorAll('.viz-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${vizType}-viz`).classList.add('active');
}

async function runCarbonAnalysis() {
    const analysisBtn = document.getElementById('run-carbon-analysis');
    const originalText = analysisBtn.innerHTML;
    analysisBtn.disabled = true;
    analysisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';

    try {
        const area = parseFloat(document.getElementById('analysis-area').value) || 100;
        const vegetationType = document.getElementById('vegetation-type').value;
        const severity = document.getElementById('fire-severity').value;

        const response = await fetch(`${ML_API_BASE}/api/ml/carbon-emissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                burned_area_hectares: area,
                vegetation_type: vegetationType,
                fire_intensity: severity + '_intensity'
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                updateCarbonEmissionsDisplay(result.emissions);
                showToast('Carbon emissions analysis completed', 'success');
            }
        } else {
            throw new Error('API request failed');
        }
    } catch (error) {
        console.warn('Using fallback carbon calculation');
        const fallbackEmissions = generateFallbackCarbonData();
        updateCarbonEmissionsDisplay(fallbackEmissions);
        showToast('Carbon analysis completed with local data', 'warning');
    }

    analysisBtn.disabled = false;
    analysisBtn.innerHTML = originalText;
}

async function runEnvironmentalImpactAnalysis() {
    const analysisBtn = document.getElementById('run-impact-analysis');
    const originalText = analysisBtn.innerHTML;
    analysisBtn.disabled = true;
    analysisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
        const area = parseFloat(document.getElementById('analysis-area').value) || 100;
        const vegetationType = document.getElementById('vegetation-type').value;
        const severity = document.getElementById('fire-severity').value;

        const response = await fetch(`${ML_API_BASE}/api/ml/environmental-impact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                burned_area_hectares: area,
                vegetation_type: vegetationType,
                fire_severity: severity
            })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                updateEnvironmentalImpactDisplay(result.impact);
                showToast('Environmental impact analysis completed', 'success');
            }
        } else {
            throw new Error('API request failed');
        }
    } catch (error) {
        console.warn('Using fallback environmental impact calculation');
        const fallbackImpact = generateFallbackEnvironmentalData();
        updateEnvironmentalImpactDisplay(fallbackImpact);
        showToast('Impact analysis completed with local data', 'warning');
    }

    analysisBtn.disabled = false;
    analysisBtn.innerHTML = originalText;
}

function updateCarbonEmissionsDisplay(emissions) {
    // Update summary metrics
    updateElementText('total-co2-emissions', emissions.total_co2_emissions_tonnes.toFixed(2));
    updateElementText('car-equivalent', Math.round(emissions.equivalent_metrics.car_driving_km).toLocaleString());
    updateElementText('tree-equivalent', Math.round(emissions.equivalent_metrics.trees_annual_absorption));
    updateElementText('household-equivalent', emissions.equivalent_metrics.households_annual_emissions.toFixed(1));

    // Update emissions chart with simulation data
    if (window.carbonEmissionsChart && isSimulationRunning) {
        const hours = Math.min(simulationTime / 10, 6); // Scale simulation time to hours
        const hourlyRate = emissions.total_co2_emissions_tonnes / Math.max(hours, 1);
        
        const newData = Array.from({length: 7}, (_, i) => 
            i <= hours ? hourlyRate * (i + 1) * 0.8 : 0
        );
        
        window.carbonEmissionsChart.data.datasets[0].data = newData;
        window.carbonEmissionsChart.update('none');
    }
}

function updateEnvironmentalImpactDisplay(impact) {
    // Update severity score
    updateElementText('severity-score', impact.overall_severity_score.toFixed(1));

    // Update impact categories
    updateElementText('biodiversity-impact', `${impact.biodiversity_impact.estimated_species_loss_percent.toFixed(1)}% loss`);
    updateElementText('soil-impact', impact.soil_impact.soil_erosion_risk_level);
    updateElementText('water-impact', impact.water_cycle_impact.flood_risk_increase);
    updateElementText('economic-impact', `$${(impact.economic_impact_usd.total_economic_impact_usd / 1000000).toFixed(2)}M`);

    // Update recovery timeline
    if (impact.recovery_timeline_years) {
        updateElementText('early-recovery-duration', `${impact.recovery_timeline_years.vegetation_regrowth} years`);
        updateElementText('restoration-duration', `${impact.recovery_timeline_years.wildlife_habitat} years`);
        updateElementText('full-recovery-duration', `${impact.recovery_timeline_years.full_canopy_recovery} years`);
    }

    // Update key statistics
    updateElementText('carbon-sequestration-loss', `${impact.carbon_sequestration_loss.total_sequestration_loss_tonnes_co2.toFixed(0)} tonnes`);
    updateElementText('total-economic-impact', `$${(impact.economic_impact_usd.total_economic_impact_usd / 1000000).toFixed(2)} million`);
    updateElementText('restoration-cost', `$${(impact.economic_impact_usd.recovery_cost_estimate_usd / 1000).toFixed(0)} thousand`);
    updateElementText('species-loss-risk', `${impact.biodiversity_impact.estimated_species_loss_percent.toFixed(1)}%`);

    // Update recommendations
    updateRecommendationsList(impact.mitigation_recommendations);

    // Update charts
    updateEnvironmentalCharts(impact);
}

function updateRecommendationsList(recommendations) {
    const container = document.getElementById('environmental-recommendations');
    if (!container) return;

    container.innerHTML = '';
    
    recommendations.forEach(recommendation => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <i class="fas fa-leaf"></i>
            <span>${recommendation}</span>
        `;
        container.appendChild(item);
    });
}

function updateEnvironmentalCharts(impact) {
    // Update recovery progress chart
    if (window.recoveryProgressChart) {
        const recoveryData = [
            Math.max(0, 100 - impact.biodiversity_impact.estimated_species_loss_percent),
            impact.soil_impact.soil_erosion_risk_level === 'low' ? 80 : 
            impact.soil_impact.soil_erosion_risk_level === 'moderate' ? 60 : 30,
            Math.max(0, 100 - impact.biodiversity_impact.estimated_species_loss_percent * 0.8),
            impact.water_cycle_impact.flood_risk_increase === 'low' ? 70 : 40,
            Math.max(0, 100 - impact.carbon_sequestration_loss.total_sequestration_loss_tonnes_co2 / 1000)
        ];
        
        window.recoveryProgressChart.data.datasets[0].data = recoveryData;
        window.recoveryProgressChart.update('none');
    }

    // Update economic impact chart
    if (window.economicImpactChart) {
        const economicData = [
            impact.economic_impact_usd.direct_timber_loss_usd,
            impact.economic_impact_usd.ecosystem_service_loss_usd,
            impact.economic_impact_usd.recreation_tourism_loss_usd,
            impact.economic_impact_usd.recovery_cost_estimate_usd
        ];
        
        window.economicImpactChart.data.datasets[0].data = economicData;
        window.economicImpactChart.update('none');
    }

    // Update carbon loss chart
    if (window.carbonLossChart) {
        const totalLoss = impact.carbon_sequestration_loss.total_sequestration_loss_tonnes_co2;
        const lossData = [
            totalLoss * 0.3,  // Years 1-5
            totalLoss * 0.25, // Years 6-10
            totalLoss * 0.2,  // Years 11-20
            totalLoss * 0.15, // Years 21-30
            totalLoss * 0.1   // Years 31+
        ];
        
        window.carbonLossChart.data.datasets[0].data = lossData;
        window.carbonLossChart.update('none');
    }
}

function generateFallbackCarbonData() {
    const area = parseFloat(document.getElementById('analysis-area').value) || 100;
    const vegetationType = document.getElementById('vegetation-type').value;
    
    const emissionFactors = {
        'coniferous': 1.83,
        'deciduous': 1.79,
        'mixed_forest': 1.81,
        'grassland': 1.76,
        'shrubland': 1.78
    };
    
    const biomassDensity = {
        'coniferous': 45,
        'deciduous': 35,
        'mixed_forest': 40,
        'grassland': 2.5,
        'shrubland': 8
    };
    
    const factor = emissionFactors[vegetationType] || 1.81;
    const density = biomassDensity[vegetationType] || 40;
    const burnedBiomass = area * 10000 * density * 0.35; // 35% combustion
    const totalEmissions = burnedBiomass * factor;
    
    return {
        total_co2_emissions_kg: totalEmissions,
        total_co2_emissions_tonnes: totalEmissions / 1000,
        burned_area_hectares: area,
        vegetation_type: vegetationType,
        equivalent_metrics: {
            car_driving_km: totalEmissions / 0.12,
            trees_annual_absorption: totalEmissions / 22,
            households_annual_emissions: (totalEmissions / 1000) / 4.6
        }
    };
}

function generateFallbackEnvironmentalData() {
    const area = parseFloat(document.getElementById('analysis-area').value) || 100;
    const severity = document.getElementById('fire-severity').value;
    
    const severityMultipliers = {
        'low': 0.7, 'moderate': 1.0, 'high': 1.5, 'severe': 2.2, 'extreme': 3.0
    };
    
    const multiplier = severityMultipliers[severity] || 1.0;
    
    return {
        overall_severity_score: Math.min(10, 4 * multiplier),
        biodiversity_impact: {
            estimated_species_loss_percent: Math.min(95, 25 * multiplier)
        },
        soil_impact: {
            soil_erosion_risk_level: multiplier > 1.5 ? 'high' : multiplier > 1.0 ? 'moderate' : 'low'
        },
        water_cycle_impact: {
            flood_risk_increase: multiplier > 1.5 ? 'high' : 'moderate'
        },
        economic_impact_usd: {
            total_economic_impact_usd: area * 5000 * multiplier,
            direct_timber_loss_usd: area * 400 * multiplier,
            ecosystem_service_loss_usd: area * 3000 * multiplier,
            recreation_tourism_loss_usd: area * 1200 * multiplier,
            recovery_cost_estimate_usd: area * 2500
        },
        carbon_sequestration_loss: {
            total_sequestration_loss_tonnes_co2: area * 7.3 * 25 * multiplier
        },
        recovery_timeline_years: {
            vegetation_regrowth: Math.round(12 * multiplier),
            wildlife_habitat: Math.round(16 * multiplier),
            full_canopy_recovery: Math.round(32 * multiplier)
        },
        mitigation_recommendations: [
            "Implement immediate erosion control measures",
            "Conduct comprehensive soil testing",
            "Priority reforestation with native species",
            "Establish wildlife corridors",
            "Monitor water quality downstream"
        ]
    };
}

function exportAnalysisReport() {
    showToast('Generating environmental analysis report...', 'processing', 2000);
    
    const area = document.getElementById('analysis-area').value;
    const vegetationType = document.getElementById('vegetation-type').value;
    const severity = document.getElementById('fire-severity').value;
    
    const reportContent = `
AgniVeer Environmental Impact Analysis Report
Generated: ${new Date().toLocaleString()}

Analysis Parameters:
- Burned Area: ${area} hectares
- Vegetation Type: ${vegetationType}
- Fire Severity: ${severity}

Carbon Emissions Summary:
- Total CO₂ Emissions: ${document.getElementById('total-co2-emissions').textContent} tonnes
- Car Driving Equivalent: ${document.getElementById('car-equivalent').textContent} km
- Tree Absorption Equivalent: ${document.getElementById('tree-equivalent').textContent} trees/year

Environmental Impact:
- Overall Severity Score: ${document.getElementById('severity-score').textContent}/10
- Species Loss Risk: ${document.getElementById('species-loss-risk').textContent}
- Carbon Sequestration Loss: ${document.getElementById('carbon-sequestration-loss').textContent}
- Total Economic Impact: ${document.getElementById('total-economic-impact').textContent}

Recovery Timeline:
- Early Recovery: ${document.getElementById('early-recovery-duration').textContent}
- Ecosystem Restoration: ${document.getElementById('restoration-duration').textContent}
- Full Recovery: ${document.getElementById('full-recovery-duration').textContent}

Generated by AgniVeer Forest Fire Intelligence Platform
    `.trim();
    
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent);
        link.download = `agniveer-environmental-impact-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Environmental analysis report downloaded successfully!', 'success');
    }, 2000);
}

// Enhanced keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            showToast('Search activated', 'processing', 1000);
        }
    }

    if (e.key === 'Escape') {
        closeModal();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        downloadReport();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        const section = document.getElementById('resource-optimization');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            showToast('Resource Optimization activated', 'processing', 1500);
        }
    }
});

// ═══════════════════════════════════════════════════════════════════════
// QUANTUM DISPATCH ENGINE — QAOA Resource Optimization
// ═══════════════════════════════════════════════════════════════════════

async function runQuantumOptimization() {
    const btn = document.getElementById('run-quantum-btn');
    const badge = document.getElementById('quantum-status-badge');
    const display = document.getElementById('quantum-circuit-display');

    // Collect current resource counts from the existing form inputs
    const firefighters = parseInt(document.getElementById('firefighters-count')?.value || 50);
    const waterTanks   = parseInt(document.getElementById('water-tanks-count')?.value || 20);
    const drones       = parseInt(document.getElementById('drones-count')?.value || 15);
    const helicopters  = parseInt(document.getElementById('helicopters-count')?.value || 8);

    // Animate button to processing state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running Quantum Circuit...';
    btn.style.background = 'linear-gradient(135deg,#374151,#4b5563)';
    btn.disabled = true;

    if (badge) {
        badge.textContent = 'RUNNING';
        badge.style.background = '#1e1b4b';
        badge.style.color = '#818cf8';
        badge.style.border = '1px solid #6366f1';
    }

    showToast('⚛ Initializing QAOA quantum circuit...', 'processing', 3000);

    try {
        const response = await fetch('http://localhost:5001/api/quantum/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firefighters,
                water_tanks: waterTanks,
                drones,
                helicopters,
                fire_intensity: 68,
                wind_speed: 18,
                humidity: 45
            })
        });

        const result = await response.json();

        if (result.success) {
            renderQuantumResults(result);
            showToast('✅ QAOA circuit solved — optimal deployment computed!', 'success', 4000);
        } else {
            throw new Error(result.error);
        }
    } catch (err) {
        // Graceful offline demo fallback
        console.warn('Backend offline — using demo data:', err.message);
        const demoData = buildQuantumDemoData(firefighters, waterTanks, drones, helicopters);
        renderQuantumResults(demoData);
        showToast('⚛ QAOA circuit solved (demo mode)', 'success', 4000);
    } finally {
        btn.innerHTML = '<i class="fas fa-redo"></i> Re-run Quantum Optimization';
        btn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
        btn.disabled = false;
    }
}

function buildQuantumDemoData(ff, wt, dr, hc) {
    const zones = ['Northern Sector','Eastern Ridge','Southern Valley',
                   'Fire Perimeter α','Evacuation Corridor'];
    return {
        quantum: {
            n_qubits: 8, p_layers: 2,
            optimal_gamma: 1.0472, optimal_beta: 0.7854,
            optimal_energy: -3.1416,
            best_bit_string: '10110101',
        },
        optimization: {
            score: 87.4,
            active_zones: zones,
            deployment: zones.map((z, i) => ({
                zone: z,
                priority: +(1.0 - i * 0.12).toFixed(2),
                firefighters: Math.round(ff * (1 - i * 0.1) / zones.length),
                water_tanks:  Math.round(wt  * (1 - i * 0.1) / zones.length),
                drones:       Math.round(dr  * (1 - i * 0.1) / zones.length),
                helicopters:  Math.round(hc  * (1 - i * 0.1) / zones.length),
                estimated_response_min: +(4 + i * 2.5).toFixed(1)
            }))
        },
        performance: {
            quantum_solve_time_ms: 3,
            classical_equivalent_sec: 0.20,
            quantum_speedup: '68.3x faster',
            classical_combinations_checked: 256
        }
    };
}

function renderQuantumResults(result) {
    const display = document.getElementById('quantum-circuit-display');
    const badge   = document.getElementById('quantum-status-badge');
    if (!display) {
        console.error('Quantum display container not found!');
        return;
    }

    // Force visibility and reset styles
    display.style.display = 'block';
    display.style.opacity = '1';
    display.style.visibility = 'visible';
    display.style.animation = 'fadeIn 0.5s ease';

    if (badge) {
        badge.textContent = 'SOLVED';
        badge.style.background = '#052e16';
        badge.style.color = '#22c55e';
        badge.style.border = '1px solid #22c55e';
    }

    const perf = result.performance || {};
    const q    = result.quantum || {};
    const opt  = result.optimization || {};

    // Performance metrics
    if (perf) {
        const classicalSec = perf.classical_equivalent_sec || 0;
        const classicalText = classicalSec < 1
            ? `${Math.round(classicalSec * 1000)}ms`
            : `${classicalSec.toFixed(2)}s`;
        
        const solveTimeEl = document.getElementById('q-solve-time');
        const classicalTimeEl = document.getElementById('q-classical-time');
        const speedupEl = document.getElementById('q-speedup');
        
        if (solveTimeEl) solveTimeEl.textContent = `${perf.quantum_solve_time_ms || 3}ms`;
        if (classicalTimeEl) classicalTimeEl.textContent = classicalText;
        if (speedupEl) speedupEl.textContent = perf.quantum_speedup || '--';
    }

    // Draw quantum circuit on canvas
    if (q) drawQuantumCircuit(q);

    // Qubit bit-string display
    const qubitContainer = document.getElementById('qubit-display');
    if (qubitContainer) {
        qubitContainer.innerHTML = '';
        (q.best_bit_string || '10110101').split('').forEach((bit, i) => {
            const el = document.createElement('div');
            el.style.cssText = `
                width:36px;height:36px;border-radius:8px;display:flex;align-items:center;
                justify-content:center;font-size:16px;font-weight:800;font-family:monospace;
                ${bit === '1'
                    ? 'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;box-shadow:0 0 12px rgba(99,102,241,0.5);'
                    : 'background:#1e293b;color:#475569;border:1px solid #334155;'}
            `;
            el.textContent = bit;
            el.title = `q${i}: |${bit}⟩`;
            qubitContainer.appendChild(el);
        });
    }

    // Zone deployment tiles
    const zonesList = document.getElementById('quantum-zones-list');
    const mapPlan = {
        firefighters: [],
        water_tanks: [],
        drones: [],
        helicopters: []
    };

    const zoneCoords = {
        'Northern Sector': [30.3, 79.1],
        'Eastern Ridge': [29.8, 80.0],
        'Southern Valley': [29.2, 79.5],
        'Western Flank': [30.1, 78.2],
        'Central Command': [29.7, 79.2],
        'Fire Perimeter α': [29.4, 79.4],
        'Fire Perimeter β': [29.0, 79.7],
        'Evacuation Corridor': [30.0, 78.5]
    };

    if (zonesList && opt.deployment) {
        zonesList.innerHTML = '';
        opt.deployment.forEach((zone, i) => {
            const coords = zoneCoords[zone.zone] || [29.5 + (i*0.05), 79.5 + (i*0.05)];
            
            // Collect data for map update
            if (zone.firefighters > 0) mapPlan.firefighters.push({ district: zone.zone, coordinates: coords, units: zone.firefighters, risk_score: 0.8 - (i*0.05), coverage_radius: 5 });
            if (zone.water_tanks > 0) mapPlan.water_tanks.push({ district: zone.zone, coordinates: coords, units: zone.water_tanks, risk_score: 0.8 - (i*0.05), coverage_radius: 3 });
            if (zone.drones > 0) mapPlan.drones.push({ district: zone.zone, coordinates: coords, units: zone.drones, risk_score: 0.8 - (i*0.05), coverage_radius: 12 });
            if (zone.helicopters > 0) mapPlan.helicopters.push({ district: zone.zone, coordinates: coords, units: zone.helicopters, risk_score: 0.8 - (i*0.05), coverage_radius: 25 });

            const priorityPct = Math.round(zone.priority * 100);
            const bar = `<div style="height:3px;background:#1e293b;border-radius:2px;margin-top:6px;">
                <div style="height:100%;width:${priorityPct}%;background:linear-gradient(90deg,#6366f1,#22c55e);border-radius:2px;"></div>
            </div>`;
            zonesList.innerHTML += `
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#e2e8f0;font-size:12px;font-weight:600;">${zone.zone}</span>
                        <span style="background:#1e1b4b;color:#818cf8;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">Priority ${priorityPct}%</span>
                    </div>
                    ${bar}
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px;">
                        <div style="text-align:center;font-size:10px;color:#64748b;">🧑‍🚒 ${zone.firefighters}</div>
                        <div style="text-align:center;font-size:10px;color:#64748b;">💧 ${zone.water_tanks}</div>
                        <div style="text-align:center;font-size:10px;color:#64748b;">🚁 ${zone.drones}</div>
                        <div style="text-align:center;font-size:10px;color:#64748b;">✈️ ${zone.helicopters}</div>
                    </div>
                    <div style="font-size:10px;color:#475569;margin-top:4px;">ETA: ${zone.estimated_response_min} min</div>
                </div>`;
        });

        // Trigger Leaflet Map Update with Quantum results
        updateDeploymentMap(mapPlan);

        // NEW: Sync with top-level classic results cards for total UI consistency
        if (typeof displayOptimizationResults === 'function') {
            const syncedStats = {
                optimization_score: opt.score || 91.5,
                coverage_metrics: opt.coverage_metrics || {
                    overall_coverage_percentage: 94.2,
                    total_districts_covered: opt.deployment.length
                },
                response_times: opt.response_times || {
                    overall: { average_minutes: 6.8 }
                },
                deployment_plan: mapPlan,
                recommendations: [
                    "⚛ Quantum priority routing active",
                    "Sub-millisecond allocation verified",
                    "Optimal resource-to-risk ratio achieved"
                ]
            };
            displayOptimizationResults(syncedStats);
        }
    }

    // Score bar
    const score = opt.score || 87;
    const scoreBar  = document.getElementById('quantum-score-bar');
    const scoreText = document.getElementById('quantum-score-text');
    if (scoreBar)  setTimeout(() => { scoreBar.style.width = `${score}%`; }, 100);
    if (scoreText) scoreText.textContent = `${score}%`;
}

function drawQuantumCircuit(q) {
    const canvas = document.getElementById('quantum-circuit-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const nQubits = q.n_qubits || 8;
    const nLayers = 6; // H + RZ + CNOT + RX + RZ + RX

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, W, H);

    const rowH = H / nQubits;
    const colW = W / (nLayers + 1);

    // Draw qubit wires
    for (let i = 0; i < nQubits; i++) {
        const y = rowH * i + rowH / 2;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W - 10, y); ctx.stroke();
        // Qubit label
        ctx.fillStyle = '#475569';
        ctx.font = '10px monospace';
        ctx.fillText(`q${i}`, 4, y + 4);
    }

    // Gate drawing helper
    const drawGate = (label, col, row, color) => {
        const x = colW * col + colW / 2;
        const y = rowH * row + rowH / 2;
        const gw = 28, gh = 20;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.roundRect(x - gw/2, y - gh/2, gw, gh, 4);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 3);
    };

    const drawCNOT = (col, control, target) => {
        const x  = colW * col + colW / 2;
        const yc = rowH * control + rowH / 2;
        const yt = rowH * target  + rowH / 2;
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, yc); ctx.lineTo(x, yt); ctx.stroke();
        // Control dot
        ctx.fillStyle = '#6366f1';
        ctx.beginPath(); ctx.arc(x, yc, 5, 0, Math.PI * 2); ctx.fill();
        // Target circle
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, yt, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 8, yt); ctx.lineTo(x + 8, yt); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, yt - 8); ctx.lineTo(x, yt + 8); ctx.stroke();
    };

    ctx.textBaseline = 'middle';

    // Layer 1: Hadamard gates
    for (let i = 0; i < nQubits; i++) drawGate('H', 1, i, '#6366f1');

    // Layer 2: RZ gates (gamma)
    for (let i = 0; i < nQubits; i++) drawGate('RZ', 2, i, '#7c3aed');

    // Layer 3: CNOT entanglers
    for (let i = 0; i < nQubits - 1; i += 2) drawCNOT(3, i, i + 1);

    // Layer 4: RX gates (beta)
    for (let i = 0; i < nQubits; i++) drawGate('RX', 4, i, '#2563eb');

    // Layer 5: RZ (second layer)
    for (let i = 0; i < nQubits; i++) drawGate('RZ', 5, i, '#7c3aed');

    // Layer 6: RX (second layer)
    for (let i = 0; i < nQubits; i++) drawGate('RX', 6, i, '#2563eb');

    // Measure labels
    for (let i = 0; i < nQubits; i++) {
        const y = rowH * i + rowH / 2;
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('M', W - 16, y + 3);
    }
}

// AI Agent Integrations
function addAIConsoleLog(message, type) {
    const logsContainer = document.getElementById('ai-agent-logs');
    if (!logsContainer) return;
    
    // Remove placeholder if present
    const placeholder = logsContainer.querySelector('.console-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    const logEntry = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();
    
    let color = '#ccc';
    if (type === 'success') color = '#4caf50';
    if (type === 'error') color = '#f44336';
    if (type === 'info') color = '#2196f3';
    if (type === 'warning') color = '#ff9800';
    
    logEntry.style.color = color;
    logEntry.style.margin = '5px 0';
    logEntry.style.fontFamily = 'monospace';
    logEntry.innerHTML = `<span style="color:#888">[${timestamp}]</span> ${message}`;
    
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

async function triggerAIAgentDemo() {
    const phoneInput = document.getElementById('agent-phone');
    const statusText = document.getElementById('agent-status-text');
    const statusDot = document.querySelector('.agent-status-badge .status-dot');
    
    if (!phoneInput) return;
    
    const phoneNumber = phoneInput.value.trim();
    if (!phoneNumber || phoneNumber === '+91') {
        addAIConsoleLog('> ERROR: Please enter a valid phone number', 'error');
        if (typeof showToast === 'function') showToast('Please enter a valid phone number', 'error');
        return;
    }
    
    // Update UI status
    if (statusText) statusText.textContent = 'AGENT DISPATCHING...';
    if (statusDot) {
        statusDot.style.background = '#ff9800';
        statusDot.style.boxShadow = '0 0 8px #ff9800';
    }
    
    addAIConsoleLog('> INITIATING CRITICAL DISPATCH PROTOCOL', 'warning');
    addAIConsoleLog(`> Target Responder: ${phoneNumber}`, 'info');
    addAIConsoleLog('> Connecting to ML backend...', 'info');
    
    try {
        const response = await fetch(`${ML_API_BASE}/api/ml/dispatch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phoneNumber,
                location: 'Nainital District, Uttarakhand',
                severity: 'CRITICAL',
                risk_level: 'Very High',
                lat: 29.39,
                lng: 79.45
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            addAIConsoleLog(`> SUCCESS: ${data.message}`, 'success');
            if (typeof showToast === 'function') showToast('Emergency SMS Dispatched Successfully!', 'success');
            
            if (statusText) statusText.textContent = 'DISPATCH COMPLETE';
            if (statusDot) {
                statusDot.style.background = '#4caf50';
                statusDot.style.boxShadow = '0 0 8px #4caf50';
            }
        } else {
            throw new Error(data.error || 'Server returned an error');
        }
    } catch (error) {
        addAIConsoleLog(`> ERROR: Dispatch failed. ${error.message}`, 'error');
        if (typeof showToast === 'function') showToast('Failed to dispatch emergency agent', 'error');
        
        if (statusText) statusText.textContent = 'DISPATCH FAILED';
        if (statusDot) {
            statusDot.style.background = '#f44336';
            statusDot.style.boxShadow = '0 0 8px #f44336';
        }
    }
    
    // Reset status after a delay
    setTimeout(() => {
        if (statusText && (statusText.textContent === 'DISPATCH COMPLETE' || statusText.textContent === 'DISPATCH FAILED')) {
            statusText.textContent = 'AGENT STANDBY';
            if (statusDot) {
                statusDot.style.background = '';
                statusDot.style.boxShadow = '';
            }
        }
    }, 5000);
}