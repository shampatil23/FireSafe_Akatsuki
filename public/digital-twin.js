// Digital Twin 3D Visualization Logic
const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;
const STALE_THRESHOLD_MS = 3 * 60 * 1000;

let nodesData = {};
let selectedNodeId = null;
let currentZone = 'all';

// 3D Scene Variables
let scene, camera, renderer, controls;
let treeMeshGroup, bandsGroup, linksGroup;
const nodeBands = {}; // mapping nodeId -> mesh
let raycaster, mouse;
let is3DMode = true;

// Leaflet Map
let dtMap;
let mapMarkers = {};

document.addEventListener('DOMContentLoaded', () => {
    initUIControls();
    initDatabaseListener();
    init3DScene();
    initLeafletMap();
});

function initUIControls() {
    const btn3D = document.getElementById('btn-view-3d');
    const btnMap = document.getElementById('btn-view-map');
    
    btn3D.addEventListener('click', () => {
        is3DMode = true;
        document.getElementById('dt-canvas-container').style.display = 'block';
        document.getElementById('dt-map-container').style.display = 'none';
        btn3D.style.background = '#3b82f6';
        btn3D.style.color = 'white';
        btnMap.style.background = 'transparent';
        btnMap.style.color = '#475569';
        if (renderer) renderer.setSize(document.getElementById('dt-canvas-container').clientWidth, document.getElementById('dt-canvas-container').clientHeight);
    });
    
    btnMap.addEventListener('click', () => {
        is3DMode = false;
        document.getElementById('dt-canvas-container').style.display = 'none';
        document.getElementById('dt-map-container').style.display = 'block';
        btnMap.style.background = '#3b82f6';
        btnMap.style.color = 'white';
        btn3D.style.background = 'transparent';
        btn3D.style.color = '#475569';
        if (dtMap) dtMap.invalidateSize();
    });
    
    document.getElementById('zone-selector').addEventListener('change', (e) => {
        currentZone = e.target.value;
        rebuildScene();
    });
}

function initDatabaseListener() {
    if (typeof db === 'undefined') {
        document.getElementById('dt-network-status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> DB Offline';
        document.getElementById('dt-network-status').style.color = '#ef4444';
        document.getElementById('dt-loading').style.display = 'none';
        return;
    }
    
    const nodesRef = db.ref('nodes');
    
    nodesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        nodesData = data || {};
        updateZonesDropdown();
        rebuildScene();
        updateUI();
        
        document.getElementById('dt-loading').style.display = 'none';
        
        const now = new Date();
        document.getElementById('dt-sync-time').innerHTML = `<i class="fas fa-check"></i> Synced: ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        document.getElementById('dt-network-status').innerHTML = '<i class="fas fa-network-wired"></i> Network Connected';
        document.getElementById('dt-network-status').style.color = '#22c55e';
    }, (error) => {
        console.error("Firebase subscription error:", error);
        document.getElementById('dt-network-status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Connection Error';
        document.getElementById('dt-network-status').style.color = '#ef4444';
    });
}

function updateZonesDropdown() {
    const sel = document.getElementById('zone-selector');
    const zones = new Set();
    Object.values(nodesData).forEach(n => { if (n.zoneId) zones.add(n.zoneId); });
    
    const currentVal = sel.value;
    sel.innerHTML = '<option value="all">All Zones</option>';
    zones.forEach(z => {
        sel.innerHTML += `<option value="${z}">${z}</option>`;
    });
    sel.value = Array.from(zones).includes(currentVal) ? currentVal : 'all';
}

function calculateNodeStatus(node) {
    if (!node.lastHeartbeatAt && !node.lastTelemetryAt) return 'UNKNOWN';
    const lastSeen = Math.max(node.lastHeartbeatAt || 0, node.lastTelemetryAt || 0);
    const ageMs = Date.now() - lastSeen;
    if (ageMs > OFFLINE_THRESHOLD_MS) return 'OFFLINE';
    if (ageMs > STALE_THRESHOLD_MS) return 'STALE';
    return 'ONLINE';
}

function getStatusColor(status) {
    if (status === 'ONLINE') return 0x22c55e;
    if (status === 'STALE') return 0xf59e0b;
    if (status === 'OFFLINE') return 0xef4444;
    return 0x94a3b8;
}

function getStatusHex(status) {
    if (status === 'ONLINE') return '#22c55e';
    if (status === 'STALE') return '#f59e0b';
    if (status === 'OFFLINE') return '#ef4444';
    return '#94a3b8';
}

// ---------------------------------------------
// 3D SCENE SETUP
// ---------------------------------------------
function init3DScene() {
    const container = document.getElementById('dt-canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.005);
    
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 30, 80);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // don't go below ground
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);
    
    // Ground
    const groundGeo = new THREE.PlaneGeometry(500, 500, 32, 32);
    // Add some noise to ground
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, Math.random() * 2);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a3621, roughness: 0.9, flatShading: true });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Groups
    treeMeshGroup = new THREE.Group();
    scene.add(treeMeshGroup);
    bandsGroup = new THREE.Group();
    scene.add(bandsGroup);
    linksGroup = new THREE.Group();
    scene.add(linksGroup);
    
    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onWindowResize);
    
    // Create decorative background forest
    createBackgroundForest();
    
    animate();
}

function createBackgroundForest() {
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 10, 5);
    const canopyGeo = new THREE.ConeGeometry(4, 15, 5);
    canopyGeo.translate(0, 7.5, 0);
    const treeMatTrunk = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1.0 });
    const treeMatCanopy = new THREE.MeshStandardMaterial({ color: 0x0f401b, roughness: 0.9, flatShading: true });
    
    for (let i = 0; i < 200; i++) {
        const r = 30 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, treeMatTrunk);
        trunk.position.y = 5;
        trunk.castShadow = true;
        const canopy = new THREE.Mesh(canopyGeo, treeMatCanopy);
        canopy.position.y = 5;
        canopy.castShadow = true;
        tree.add(trunk);
        tree.add(canopy);
        
        tree.position.set(x, 0, z);
        const scale = 0.5 + Math.random() * 0.8;
        tree.scale.set(scale, scale, scale);
        tree.rotation.y = Math.random() * Math.PI;
        
        treeMeshGroup.add(tree);
    }
}

function rebuildScene() {
    if (!scene) return;
    
    // Clear old active nodes/bands/links
    while(bandsGroup.children.length > 0){ 
        const obj = bandsGroup.children[0];
        bandsGroup.remove(obj); 
    }
    while(linksGroup.children.length > 0){ 
        const obj = linksGroup.children[0];
        linksGroup.remove(obj); 
    }
    
    // Clean old markers
    if (dtMap) {
        Object.values(mapMarkers).forEach(m => dtMap.removeLayer(m));
        mapMarkers = {};
    }
    
    // Filter nodes
    const activeNodes = {};
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180, count = 0;
    
    Object.keys(nodesData).forEach(key => {
        const n = nodesData[key];
        if (currentZone !== 'all' && n.zoneId !== currentZone) return;
        activeNodes[key] = n;
        if (n.latitude && n.longitude) {
            minLat = Math.min(minLat, n.latitude);
            maxLat = Math.max(maxLat, n.latitude);
            minLng = Math.min(minLng, n.longitude);
            maxLng = Math.max(maxLng, n.longitude);
            count++;
        }
    });
    
    // Calculate range with a small padding to prevent division by zero
    const latRange = Math.max(maxLat - minLat, 0.001);
    const lngRange = Math.max(maxLng - minLng, 0.001);
    
    // Materials
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 12, 6);
    const canopyGeo = new THREE.ConeGeometry(5, 18, 6);
    canopyGeo.translate(0, 9, 0);
    const treeMatTrunk = new THREE.MeshStandardMaterial({ color: 0x4a3219, roughness: 1.0 });
    const treeMatCanopy = new THREE.MeshStandardMaterial({ color: 0x165c26, roughness: 0.9, flatShading: true });
    
    const nodePositions = {};
    
    Object.keys(activeNodes).forEach((key, index) => {
        const n = activeNodes[key];
        const status = calculateNodeStatus(n);
        const color = getStatusColor(status);
        
        // Map geo to 3D world: Force them into a highly visible 50x50 area at the center of the camera
        let x = 0, z = 0;
        if (n.latitude && n.longitude && count > 0) {
            // Normalize between -25 and +25
            x = ((n.longitude - minLng) / lngRange - 0.5) * 50; 
            z = ((maxLat - n.latitude) / latRange - 0.5) * 50; // invert lat so north is -z
        } else {
            const angle = index * (Math.PI * 2 / Object.keys(activeNodes).length);
            x = Math.cos(angle) * 20;
            z = Math.sin(angle) * 20;
        }
        
        // Add a tiny random offset so overlapping nodes (same coords) don't totally Z-fight
        x += (Math.random() - 0.5) * 5;
        z += (Math.random() - 0.5) * 5;
        
        nodePositions[key] = new THREE.Vector3(x, 0, z);
        
        // Render Tree
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, treeMatTrunk);
        trunk.position.y = 6;
        trunk.castShadow = true;
        const canopy = new THREE.Mesh(canopyGeo, treeMatCanopy);
        canopy.position.y = 6;
        canopy.castShadow = true;
        tree.add(trunk);
        tree.add(canopy);
        tree.position.set(x, 0, z);
        bandsGroup.add(tree); // attach tree to bands group for cleanup later
        
        // --- Detailed Sensor Node (Based on User Reference) ---
        const bandGroup = new THREE.Group();
        
        // 1. Canvas Strap (Khaki/Olive Green)
        const strapGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16);
        const strapMat = new THREE.MeshStandardMaterial({ color: 0x4b5320, roughness: 0.9 });
        const strap = new THREE.Mesh(strapGeo, strapMat);
        
        // 2. Main Enclosure Box (Olive Green)
        const boxGeo = new THREE.BoxGeometry(2.0, 1.5, 1.0);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x4b5320, roughness: 0.7, metalness: 0.2 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(0, 0, 1.6);
        
        // 3. Solar Panel (Top, Angled)
        const panelGroup = new THREE.Group();
        const panelBaseGeo = new THREE.BoxGeometry(1.8, 0.1, 1.2);
        const panelBaseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
        const panelBase = new THREE.Mesh(panelBaseGeo, panelBaseMat);
        const cellsGeo = new THREE.PlaneGeometry(1.6, 1.0);
        const cellsMat = new THREE.MeshStandardMaterial({ color: 0x1e3f5a, metalness: 0.9, roughness: 0.1 });
        const cells = new THREE.Mesh(cellsGeo, cellsMat);
        cells.rotation.x = -Math.PI / 2;
        cells.position.y = 0.06;
        panelGroup.add(panelBase);
        panelGroup.add(cells);
        
        panelGroup.position.set(0, 1.0, 1.4);
        panelGroup.rotation.x = -0.4; // Angle it upwards/backwards
        
        // 4. Antenna (Black, Right side)
        const antGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
        const antMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
        const antenna = new THREE.Mesh(antGeo, antMat);
        antenna.position.set(1.1, 0.8, 1.4);
        
        // 5. Sensor/Microphone bulb (Black, Front Right)
        const micGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const micMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
        const mic = new THREE.Mesh(micGeo, micMat);
        mic.position.set(0.8, -0.2, 2.2);
        
        // 6. Status Light LED (Front Left)
        const lightGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const lightMat = new THREE.MeshBasicMaterial({ color: color });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(-0.6, 0.3, 2.1);
        
        // Assembly
        bandGroup.add(strap);
        bandGroup.add(box);
        bandGroup.add(panelGroup);
        bandGroup.add(antenna);
        bandGroup.add(mic);
        bandGroup.add(light);
        
        // Position it securely on the tree
        bandGroup.position.set(x, 4.5 + Math.random(), z);
        
        // Make the node face the camera generally (since they are scattered)
        // We'll just rotate them randomly around the Y axis for variety, 
        // but ensure they point somewhat outwards
        bandGroup.rotation.y = Math.random() * Math.PI * 2;
        
        bandGroup.userData = { id: key };
        
        // Interactivity mesh (invisible bounding box for easy clicking, make it larger to catch clicks from distance)
        const hitGeo = new THREE.CylinderGeometry(3, 3, 5, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        bandGroup.add(hitMesh);
        
        bandsGroup.add(bandGroup);
        
        // Add Map Marker
        if (dtMap && n.latitude && n.longitude) {
            const hexColor = getStatusHex(status);
            const markerHtml = `<div style="background-color: ${hexColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`;
            const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
            const marker = L.marker([n.latitude, n.longitude], { icon: icon }).addTo(dtMap);
            marker.on('click', () => selectNode(key));
            mapMarkers[key] = marker;
        }
    });
    
    // Draw network links
    // Use connectedNodeIds if available, else connect closest nodes to simulate topology
    const drawnLinks = new Set();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, opacity: 0.4, transparent: true, linewidth: 2 });
    
    Object.keys(activeNodes).forEach(key => {
        const n = activeNodes[key];
        const p1 = nodePositions[key];
        p1.y = 4.5;
        
        if (n.connectedNodeIds && Array.isArray(n.connectedNodeIds)) {
            n.connectedNodeIds.forEach(targetId => {
                if (activeNodes[targetId] && !drawnLinks.has(`${targetId}-${key}`)) {
                    const p2 = nodePositions[targetId];
                    const pts = [p1, new THREE.Vector3(p2.x, 4.5, p2.z)];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
                    const line = new THREE.Line(lineGeo, lineMat);
                    linksGroup.add(line);
                    drawnLinks.add(`${key}-${targetId}`);
                }
            });
        } else {
            // Simulated mesh for visual: connect to 1 or 2 closest nodes
            let closest = [];
            Object.keys(activeNodes).forEach(k => {
                if(k !== key) closest.push({id: k, dist: p1.distanceTo(nodePositions[k])});
            });
            closest.sort((a,b) => a.dist - b.dist);
            const targets = closest.slice(0, 2); // Connect to 2 closest
            targets.forEach(t => {
                if (!drawnLinks.has(`${t.id}-${key}`)) {
                    const p2 = nodePositions[t.id];
                    const pts = [p1, new THREE.Vector3(p2.x, 4.5, p2.z)];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
                    const line = new THREE.Line(lineGeo, lineMat);
                    linksGroup.add(line);
                    drawnLinks.add(`${key}-${t.id}`);
                }
            });
        }
    });
    
    // Re-center map if there are markers
    if (dtMap && Object.keys(mapMarkers).length > 0) {
        const group = new L.featureGroup(Object.values(mapMarkers));
        dtMap.fitBounds(group.getBounds().pad(0.1));
    }
}

function onPointerDown(event) {
    if (!is3DMode) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bandsGroup.children, true);
    
    for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;
        while (obj.parent && obj.parent !== bandsGroup) {
            if (obj.userData && obj.userData.id) {
                selectNode(obj.userData.id);
                return;
            }
            obj = obj.parent;
        }
        if (obj.userData && obj.userData.id) {
            selectNode(obj.userData.id);
            return;
        }
    }
}

function selectNode(nodeId) {
    selectedNodeId = nodeId;
    updateUI();
}

function updateUI() {
    let t = 0, on = 0, off = 0;
    Object.values(nodesData).forEach(n => {
        if (currentZone !== 'all' && n.zoneId !== currentZone) return;
        t++;
        const s = calculateNodeStatus(n);
        if (s === 'ONLINE') on++;
        if (s === 'OFFLINE') off++;
    });
    
    document.getElementById('dt-stat-total').innerText = t;
    document.getElementById('dt-stat-online').innerText = on;
    document.getElementById('dt-stat-offline').innerText = off;
    
    const panel = document.getElementById('dt-side-panel');
    const details = document.getElementById('dt-node-details');
    const badge = document.getElementById('dt-node-status-badge');
    
    if (!selectedNodeId || !nodesData[selectedNodeId]) {
        details.innerHTML = `<div style="text-align: center; color: #94a3b8; margin-top: 40px;"><i class="fas fa-hand-pointer" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i><p>Select a node band in the 3D scene<br>or map to view details.</p></div>`;
        badge.style.display = 'none';
        return;
    }
    
    const n = nodesData[selectedNodeId];
    const status = calculateNodeStatus(n);
    const color = getStatusHex(status);
    
    badge.style.display = 'block';
    badge.style.background = `${color}20`;
    badge.style.color = color;
    badge.innerText = status;
    
    const lastHbStr = n.lastHeartbeatAt ? new Date(n.lastHeartbeatAt).toLocaleString() : 'N/A';
    const tempStr = n.sensorReadings?.temperature !== undefined ? `${n.sensorReadings.temperature}°C` : 'N/A';
    const humStr = n.sensorReadings?.humidity !== undefined ? `${n.sensorReadings.humidity}%` : 'N/A';
    const batStr = n.batteryLevel !== undefined ? `${n.batteryLevel}%` : 'N/A';
    const smokeStr = n.sensorReadings?.smoke || 'N/A';
    
    details.innerHTML = `
        <h4 style="margin-top:0; color:#0f172a; margin-bottom: 4px;">${n.name || selectedNodeId}</h4>
        <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 20px;"><i class="fas fa-map-marker-alt"></i> ${n.zoneId || 'Unknown Zone'}</div>
        
        <div style="margin-bottom: 20px;">
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">Location & Device</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
                <div><span style="color:#64748b">Lat:</span> <span style="font-weight:500;">${n.latitude ? n.latitude.toFixed(5) : 'N/A'}</span></div>
                <div><span style="color:#64748b">Lng:</span> <span style="font-weight:500;">${n.longitude ? n.longitude.toFixed(5) : 'N/A'}</span></div>
                <div><span style="color:#64748b">Firmware:</span> <span style="font-weight:500;">${n.firmwareVersion || 'N/A'}</span></div>
                <div><span style="color:#64748b">Tree ID:</span> <span style="font-weight:500;">${n.treeId || 'Approximate'}</span></div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">Live Telemetry</div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px;">Temperature</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">${tempStr}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px;">Humidity</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">${humStr}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px;">Battery</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">${batStr}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 2px;">Smoke / Gas</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: #1e293b;">${smokeStr}</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">Network Info</div>
            <div style="font-size: 0.85rem; color: #334155;">
                <div style="margin-bottom: 4px;"><span style="color:#64748b">Last Seen:</span> <span style="font-weight:500;">${lastHbStr}</span></div>
                <div><span style="color:#64748b">Connections:</span> <span style="font-weight:500;">${n.connectedNodeIds ? n.connectedNodeIds.join(', ') : 'Auto-mesh'}</span></div>
            </div>
        </div>
        
        <button onclick="window.location.href='node-health.html'" style="width: 100%; background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="fas fa-microchip"></i> Open Node Health
        </button>
    `;
}

function onWindowResize() {
    if (camera && renderer) {
        const container = document.getElementById('dt-canvas-container');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera && is3DMode) renderer.render(scene, camera);
}

// ---------------------------------------------
// LEAFLET MAP SETUP
// ---------------------------------------------
function initLeafletMap() {
    dtMap = L.map('dt-map-container').setView([30.0668, 79.0193], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(dtMap);
}
