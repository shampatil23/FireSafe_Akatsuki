// Node Health Monitoring Logic
// Connects to Firebase RTDB initialized in firebase-config.js

const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const STALE_THRESHOLD_MS = 3 * 60 * 1000;    // 3 minutes

let nodesData = {};

document.addEventListener('DOMContentLoaded', () => {
    initDatabaseListener();
    // Periodically re-evaluate statuses in case a node silently drops without new events
    setInterval(renderDashboard, 30000); 
});

function initDatabaseListener() {
    if (typeof db === 'undefined') {
        showDbWarning(true);
        return;
    }
    
    showDbWarning(false);
    
    // Listen to the 'nodes' path in RTDB
    const nodesRef = db.ref('nodes');
    
    nodesRef.on('value', (snapshot) => {
        showDbWarning(false);
        const data = snapshot.val();
        if (data) {
            nodesData = data;
        } else {
            nodesData = {};
        }
        renderDashboard();
    }, (error) => {
        console.error("Firebase subscription error:", error);
        showDbWarning(true);
    });
    
    // Check connection status
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
            showDbWarning(false);
        } else {
            showDbWarning(true);
        }
    });
}

function showDbWarning(show) {
    const el = document.getElementById('db-status-warning');
    if (el) el.style.display = show ? 'block' : 'none';
}

function calculateNodeStatus(node) {
    if (!node.lastHeartbeatAt && !node.lastTelemetryAt) {
        return 'UNKNOWN';
    }
    
    const lastSeen = Math.max(
        node.lastHeartbeatAt || 0,
        node.lastTelemetryAt || 0
    );
    
    const ageMs = Date.now() - lastSeen;
    
    if (ageMs > OFFLINE_THRESHOLD_MS) {
        return 'OFFLINE';
    } else if (ageMs > STALE_THRESHOLD_MS) {
        return 'STALE';
    } else {
        return 'ONLINE';
    }
}

function renderDashboard() {
    const nodesGrid = document.getElementById('nodes-grid');
    const emptyState = document.getElementById('empty-state');
    
    let total = 0;
    let online = 0;
    let offline = 0;
    let warnings = 0;
    
    const searchQuery = document.getElementById('node-search')?.value.toLowerCase() || '';
    
    let html = '';
    
    const nodeKeys = Object.keys(nodesData);
    if (nodeKeys.length === 0) {
        emptyState.style.display = 'block';
        if (nodesGrid.contains(emptyState)) {
            // Keep empty state
            nodesGrid.innerHTML = '';
            nodesGrid.appendChild(emptyState);
        }
    } else {
        emptyState.style.display = 'none';
        
        nodeKeys.forEach(key => {
            const node = nodesData[key];
            total++;
            
            const calcStatus = calculateNodeStatus(node);
            if (calcStatus === 'ONLINE') online++;
            if (calcStatus === 'OFFLINE') offline++;
            
            // Determine if there's a warning
            let hasWarning = false;
            let warningText = '';
            
            if (calcStatus === 'OFFLINE') {
                hasWarning = true;
                warningText = 'Node disconnected / Offline';
            } else if (calcStatus === 'STALE') {
                hasWarning = true;
                warningText = 'Heartbeat overdue';
            } else if (node.lastError) {
                hasWarning = true;
                warningText = node.lastError;
            } else if (node.batteryLevel !== undefined && node.batteryLevel < 20) {
                hasWarning = true;
                warningText = 'Low Battery';
            }
            
            if (hasWarning) warnings++;
            
            // Search filter
            if (searchQuery && !key.toLowerCase().includes(searchQuery) && !(node.name || '').toLowerCase().includes(searchQuery)) {
                return; // Skip
            }
            
            // Build Card
            const statusColor = calcStatus === 'ONLINE' ? '#22c55e' : (calcStatus === 'STALE' ? '#f59e0b' : (calcStatus === 'OFFLINE' ? '#ef4444' : '#64748b'));
            
            const lastHbStr = node.lastHeartbeatAt ? getTimeAgo(node.lastHeartbeatAt) : 'N/A';
            const tempStr = node.sensorReadings?.temperature !== undefined ? `${node.sensorReadings.temperature}°C` : 'N/A';
            const humStr = node.sensorReadings?.humidity !== undefined ? `${node.sensorReadings.humidity}%` : 'N/A';
            const batStr = node.batteryLevel !== undefined ? `${node.batteryLevel}%` : 'N/A';
            const sigStr = node.signalStrength !== undefined ? `${node.signalStrength} dBm` : 'N/A';
            
            html += `
                <div class="node-card" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); overflow: hidden; display: flex; flex-direction: column; height: 100%;">
                    <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; background: #ffffff;">
                        <div>
                            <div style="font-weight: 700; color: #1e293b; font-size: 1.1rem; letter-spacing: -0.01em;">${node.name || key}</div>
                            <div style="color: #64748b; font-size: 0.85rem; margin-top: 6px; font-weight: 500;"><i class="fas fa-map-marker-alt" style="color: #94a3b8; margin-right: 4px;"></i>${node.zoneId || 'Unknown Zone'}</div>
                        </div>
                        <div style="background: ${statusColor}15; color: ${statusColor}; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${calcStatus}
                        </div>
                    </div>
                    
                    <div style="padding: 20px; flex-grow: 1; background: #fdfdfd;">
                        ${hasWarning ? `<div style="background: #fef2f2; border-left: 3px solid #ef4444; color: #b91c1c; padding: 10px 14px; border-radius: 0 6px 6px 0; font-size: 0.85rem; font-weight: 500; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-exclamation-triangle"></i> ${warningText}</div>` : ''}
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.85rem;">
                            <div>
                                <span style="color: #94a3b8; display: block; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Last Heartbeat</span>
                                <span style="color: #334155; font-weight: 600;">${lastHbStr}</span>
                            </div>
                            <div>
                                <span style="color: #94a3b8; display: block; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Battery</span>
                                <span style="color: #334155; font-weight: 600;">${batStr}</span>
                            </div>
                            <div>
                                <span style="color: #94a3b8; display: block; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Temperature</span>
                                <span style="color: #334155; font-weight: 600;">${tempStr}</span>
                            </div>
                            <div>
                                <span style="color: #94a3b8; display: block; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Humidity</span>
                                <span style="color: #334155; font-weight: 600;">${humStr}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="openNodeDetails('${key}')" style="background: #f8fafc; border: none; padding: 14px; text-align: center; color: #3b82f6; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.05em; cursor: pointer; border-top: 1px solid #f1f5f9; transition: all 0.2s; text-transform: uppercase;">
                        VIEW DETAILS
                    </button>
                </div>
            `;
        });
        
        if (html === '') {
            html = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8;">No nodes match your search.</div>';
        }
        nodesGrid.innerHTML = html;
    }
    
    // Update summary counts
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-online').innerText = online;
    document.getElementById('stat-offline').innerText = offline;
    document.getElementById('stat-warnings').innerText = warnings;
}

// Attach search listener
document.getElementById('node-search')?.addEventListener('input', renderDashboard);

function openNodeDetails(nodeId) {
    const node = nodesData[nodeId];
    if (!node) return;
    
    const calcStatus = calculateNodeStatus(node);
    const statusColor = calcStatus === 'ONLINE' ? '#22c55e' : (calcStatus === 'STALE' ? '#f59e0b' : (calcStatus === 'OFFLINE' ? '#ef4444' : '#64748b'));
    
    document.getElementById('modal-node-title').innerText = `Node: ${node.name || nodeId}`;
    
    let readingsHtml = '';
    if (node.sensorReadings) {
        Object.keys(node.sensorReadings).forEach(k => {
            let unit = '';
            if (k === 'temperature') unit = '°C';
            if (k === 'humidity') unit = '%';
            if (k === 'wind_speed') unit = 'km/h';
            
            readingsHtml += `
                <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <div style="color: #64748b; font-size: 0.8rem; text-transform: capitalize; margin-bottom: 4px;">${k.replace('_', ' ')}</div>
                    <div style="color: #0f172a; font-size: 1.2rem; font-weight: 600;">${node.sensorReadings[k]} ${unit}</div>
                </div>
            `;
        });
    }
    if (readingsHtml === '') readingsHtml = '<div style="color: #94a3b8; font-size: 0.9rem;">No telemetry data available.</div>';
    
    let diagnosticsHtml = '';
    if (node.lastError) {
        diagnosticsHtml += `<div style="color: #b91c1c; margin-bottom: 8px;"><i class="fas fa-times-circle"></i> Error: ${node.lastError}</div>`;
    }
    if (calcStatus === 'OFFLINE' || calcStatus === 'STALE') {
         diagnosticsHtml += `<div style="color: #b91c1c; margin-bottom: 8px;"><i class="fas fa-exclamation-circle"></i> Node is currently ${calcStatus}. Missing telemetry.</div>`;
    }
    if (node.batteryLevel !== undefined && node.batteryLevel < 20) {
        diagnosticsHtml += `<div style="color: #b91c1c; margin-bottom: 8px;"><i class="fas fa-battery-quarter"></i> Critical Battery Level (${node.batteryLevel}%)</div>`;
    }
    if (diagnosticsHtml === '') diagnosticsHtml = '<div style="color: #22c55e; font-size: 0.9rem;"><i class="fas fa-check-circle"></i> No device-health warnings. Systems nominal.</div>';
    
    const bodyHtml = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">
            <div style="flex: 1; min-width: 250px;">
                <h4 style="color: #334155; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Node Information</h4>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px; font-size: 0.9rem;">
                    <div style="color: #64748b;">ID:</div><div style="color: #0f172a; font-weight: 500;">${nodeId}</div>
                    <div style="color: #64748b;">Zone:</div><div style="color: #0f172a; font-weight: 500;">${node.zoneId || 'N/A'}</div>
                    <div style="color: #64748b;">Coordinates:</div><div style="color: #0f172a; font-weight: 500;">${node.latitude ? node.latitude.toFixed(4) : 'N/A'}, ${node.longitude ? node.longitude.toFixed(4) : 'N/A'}</div>
                    <div style="color: #64748b;">Status:</div><div style="color: ${statusColor}; font-weight: 600;">${calcStatus}</div>
                    <div style="color: #64748b;">Last Heartbeat:</div><div style="color: #0f172a; font-weight: 500;">${node.lastHeartbeatAt ? new Date(node.lastHeartbeatAt).toLocaleString() : 'N/A'}</div>
                    <div style="color: #64748b;">Last Telemetry:</div><div style="color: #0f172a; font-weight: 500;">${node.lastTelemetryAt ? new Date(node.lastTelemetryAt).toLocaleString() : 'N/A'}</div>
                    <div style="color: #64748b;">Firmware:</div><div style="color: #0f172a; font-weight: 500;">${node.firmwareVersion || 'UNKNOWN'}</div>
                </div>
            </div>
            
            <div style="flex: 1; min-width: 250px;">
                <h4 style="color: #334155; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Health Diagnostics</h4>
                ${diagnosticsHtml}
            </div>
        </div>
        
        <h4 style="color: #334155; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Latest Live Telemetry</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
            ${readingsHtml}
            ${node.batteryLevel !== undefined ? `<div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;"><div style="color: #64748b; font-size: 0.8rem; margin-bottom: 4px;">Battery</div><div style="color: #0f172a; font-size: 1.2rem; font-weight: 600;">${node.batteryLevel}%</div></div>` : ''}
            ${node.signalStrength !== undefined ? `<div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;"><div style="color: #64748b; font-size: 0.8rem; margin-bottom: 4px;">Signal (RSSI)</div><div style="color: #0f172a; font-size: 1.2rem; font-weight: 600;">${node.signalStrength} dBm</div></div>` : ''}
        </div>
        
        <div style="display: flex; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            ${node.latitude && node.longitude ? `<button onclick="window.open('simulation.html?lat=${node.latitude}&lng=${node.longitude}&autoStart=true', '_blank')" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px;"><i class="fas fa-map-marked-alt"></i> View on Simulation Map</button>` : ''}
        </div>
    `;
    
    document.getElementById('modal-node-body').innerHTML = bodyHtml;
    document.getElementById('node-modal').style.display = 'flex';
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
