// theme.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Find a place to put the toggle button
    let container = document.querySelector('.header-controls') || document.querySelector('.user-profile') || document.body;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'themeToggleBtn';
    toggleBtn.style.padding = '8px 15px';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.border = '1px solid #E5E7EB';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.gap = '8px';
    toggleBtn.style.fontWeight = '600';
    toggleBtn.style.zIndex = '9999';
    
    // Position it absolutely if we just put it on the body
    if (container === document.body) {
        toggleBtn.style.position = 'fixed';
        toggleBtn.style.bottom = '20px';
        toggleBtn.style.right = '20px';
    } else {
        toggleBtn.style.marginLeft = '15px';
    }

    toggleBtn.onclick = toggleTheme;
    if (container.classList.contains('header-controls')) {
        container.appendChild(toggleBtn);
    } else {
        container.prepend(toggleBtn);
    }
    
    // 2. Load preferred theme
    const savedTheme = localStorage.getItem('agniVeerTheme') || 'light'; // Default to light now
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateToggleButton();
    
    // 3. Wait for charts to render then update their colors
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            updateChartsTheme();
        }
    }, 500);
});

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('agniVeerTheme', isLight ? 'light' : 'dark');
    updateToggleButton();
    if (typeof Chart !== 'undefined') {
        updateChartsTheme();
    }
}

function updateToggleButton() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const isLight = document.body.classList.contains('light-theme');
    
    if (isLight) {
        btn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        btn.style.background = '#F8FAFC';
        btn.style.color = '#1F2937';
    } else {
        btn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.color = '#FFFFFF';
        btn.style.border = '1px solid rgba(255,255,255,0.2)';
    }
}

function updateChartsTheme() {
    if (typeof Chart === 'undefined') return;
    
    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#4B5563' : '#CBD5E1';
    const gridColor = isLight ? '#E5E7EB' : 'rgba(255, 255, 255, 0.1)';
    
    // Update global defaults
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    if (Chart.defaults.plugins && Chart.defaults.plugins.legend && Chart.defaults.plugins.legend.labels) {
        Chart.defaults.plugins.legend.labels.color = textColor;
    }

    if (!Chart.instances) return;
    
    for (let id in Chart.instances) {
        let chart = Chart.instances[id];
        
        // Force legend color
        if (!chart.options.plugins) chart.options.plugins = {};
        if (!chart.options.plugins.legend) chart.options.plugins.legend = {};
        if (!chart.options.plugins.legend.labels) chart.options.plugins.legend.labels = {};
        chart.options.plugins.legend.labels.color = textColor;
        
        // Force title color
        if (chart.options.plugins.title) {
            chart.options.plugins.title.color = textColor;
        }
        
        // Force scales color
        if (chart.options.scales) {
            for (let scale in chart.options.scales) {
                if (!chart.options.scales[scale].ticks) chart.options.scales[scale].ticks = {};
                chart.options.scales[scale].ticks.color = textColor;
                
                if (!chart.options.scales[scale].grid) chart.options.scales[scale].grid = {};
                chart.options.scales[scale].grid.color = gridColor;
                
                if (chart.options.scales[scale].title) {
                    chart.options.scales[scale].title.color = textColor;
                }
                if (chart.options.scales[scale].pointLabels) {
                    chart.options.scales[scale].pointLabels.color = textColor;
                }
                if (chart.options.scales[scale].angleLines) {
                    chart.options.scales[scale].angleLines.color = gridColor;
                }
            }
        }
        chart.update();
    }
}

