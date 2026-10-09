        // --- 1. FIREBASE CONFIGURATION (Placeholder for User to Fill) ---
        // REPLACE THIS OBJECT WITH YOUR ACTUAL FIREBASE CONFIG
        const firebaseConfig = {
            apiKey: "AIzaSyDummyKeyForPrototypeOnly",
            authDomain: "agniveer-prototype.firebaseapp.com",
            projectId: "agniveer-prototype",
            storageBucket: "agniveer-prototype.appspot.com",
            messagingSenderId: "1234567890",
            appId: "1:1234567890:web:abcdef123456"
        };

        // Initialize Firebase (We catch errors in case config is invalid/dummy)
        let db = null;
        // DISABLED FIREBASE FOR PROTOTYPE TO ENSURE UI LOADS:
        /*
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log("Firebase initialized successfully.");
        } catch (e) {
            console.warn("Firebase not properly configured.", e);
        }
        // --- 2. LOCAL MOCK DATA (Fallback if Firestore isn't connected) ---
        let incidents = [
            {
                id: "REQ-001",
                userName: "Ramesh Kumar",
                contact: "+91 98765 43210",
                latitude: 30.3165,
                longitude: 78.0322,
                location: "Rajaji National Park Sector 4",
                description: "Heavy smoke seen near the western boundary.",
                severity: "HIGH",
                createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                status: "PENDING"
            },
            {
                id: "REQ-002",
                userName: "Forest Guard Unit B",
                contact: "Radio CH-4",
                latitude: 30.2900,
                longitude: 78.0100,
                location: "Dehradun Outskirts",
                description: "Small brush fire, currently contained.",
                severity: "LOW",
                createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                status: "ACKNOWLEDGED"
            }
        ];

        let selectedIncidentId = null;
        let map, marker, circle;

        // --- 3. INITIALIZATION ---
        document.addEventListener('DOMContentLoaded', () => {
            initMap();
            
            if (db) {
                setupDatabaseListener();
            } else {
                renderList();
                // Simulate a new request arriving after 5 seconds
                setTimeout(simulateIncomingRequest, 5000);
            }
        });

        function initMap() {
            map = L.map('operatorMap', { zoomControl: false }).setView([30.3165, 78.0322], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
        }

        // --- 4. FIREBASE RTDB REAL-TIME LISTENER ---
        let firebaseData = { emergency: {}, sos: {} };

        function setupDatabaseListener() {
            db.ref("emergency_requests").on("value", (snapshot) => {
                firebaseData.emergency = snapshot.val() || {};
                mergeAndRenderIncidents();
            });

            db.ref("sos_dispatches").on("value", (snapshot) => {
                firebaseData.sos = snapshot.val() || {};
                mergeAndRenderIncidents();
            });
        }

        function mergeAndRenderIncidents() {
            let newIncidents = [];
            let oldIncidentIds = incidents.map(i => i.id);

            // 1. Process regular emergency requests
            Object.keys(firebaseData.emergency).forEach(key => {
                const inc = firebaseData.emergency[key];
                if (!oldIncidentIds.includes(key) && inc.status === 'PENDING') {
                    triggerAlert({ id: key, ...inc });
                }
                newIncidents.push({ id: key, ...inc });
            });

            // 2. Process Android App SOS Dispatches
            Object.keys(firebaseData.sos).forEach(key => {
                const sos = firebaseData.sos[key];
                
                // Map the Android schema to the Operator Dashboard schema
                let isoDate = new Date().toISOString();
                if (sos.timestamp) {
                    // Try to fix "2026-10-06 02:19:00" to ISO
                    isoDate = sos.timestamp.replace(" ", "T") + "Z";
                }
                
                const mappedInc = {
                    id: key, // Use the firebase key
                    createdAt: isoDate,
                    severity: sos.severity || "CRITICAL",
                    status: (sos.status === "SENDING" || sos.status === "ACTIVE_SOS") ? "PENDING" : sos.status,
                    location: sos.location_name || sos.location || "GPS Location",
                    description: `🚨 SOS ALERT! Type: ${sos.emergency_type || 'Unknown'}. Device: ${sos.device_info || 'Unknown'}. Battery: ${sos.battery_percent || sos.battery}%`,
                    userName: "SOS Dispatch (Mobile)",
                    contact: sos.phone || "+91 112",
                    latitude: sos.latitude || sos.lat,
                    longitude: sos.longitude || sos.lng
                };

                if (!oldIncidentIds.includes(key) && mappedInc.status === 'PENDING') {
                    triggerAlert(mappedInc);
                }
                newIncidents.push(mappedInc);
            });
            
            incidents = newIncidents;
            renderList();

            if (selectedIncidentId) {
                const selected = incidents.find(i => i.id === selectedIncidentId);
                if (selected) renderDetails(selected);
            }
        }

        // --- 5. RENDER FUNCTIONS ---
        function renderList() {
            const listEl = document.getElementById('incidentList');
            listEl.innerHTML = '';
            
            // Sorting Logic: Critical > High > Medium > Low, then by timestamp
            const severityRank = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            
            const sorted = [...incidents].sort((a, b) => {
                const sevA = severityRank[a.severity] || 0;
                const sevB = severityRank[b.severity] || 0;
                if (sevA !== sevB) {
                    return sevB - sevA;
                }
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
                return dateB - dateA;
            });

            // Update KPIs
            let active = 0, critical = 0, pending = 0, resolved = 0;

            sorted.forEach(inc => {
                if (inc.status !== 'RESOLVED') active++;
                if (inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED') critical++;
                if (inc.status === 'PENDING') pending++;
                if (inc.status === 'RESOLVED') resolved++; // Simply counting all resolved for prototype

                const safeDate = inc.createdAt ? new Date(inc.createdAt) : new Date();
                const timeStr = safeDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const div = document.createElement('div');
                div.className = `incident-card ${inc.id === selectedIncidentId ? 'selected' : ''}`;
                div.onclick = () => selectIncident(inc.id);
                
                const safeUserName = inc.userName || "Android User";
                const safeSeverity = inc.severity || "MEDIUM";
                const safeLocation = inc.location || "Unknown Location";
                const safeStatus = inc.status || "PENDING";
                
                div.innerHTML = `
                    <div class="incident-meta">
                        <span>${timeStr} • ID: ${inc.id.substring(0, 8)}</span>
                        <span class="status-badge">${safeStatus}</span>
                    </div>
                    <div class="incident-title">${safeLocation}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span style="font-size: 0.85rem; color: #94a3b8;"><i class="fas fa-user"></i> ${safeUserName}</span>
                        <span class="severity-badge sev-${safeSeverity.toLowerCase()}">${safeSeverity}</span>
                    </div>
                `;
                listEl.appendChild(div);
            });
            
            // Render KPIs
            document.getElementById('kpiActive').innerText = active;
            document.getElementById('kpiCritical').innerText = critical;
            document.getElementById('kpiPending').innerText = pending;
            document.getElementById('kpiResolved').innerText = resolved;
            
            document.getElementById('alertBadge').innerText = pending;
        }

        function selectIncident(id) {
            selectedIncidentId = id;
            renderList(); // highlight selected
            const inc = incidents.find(i => i.id === id);
            if(inc) renderDetails(inc);
        }

        function renderDetails(inc) {
            const detailsEl = document.getElementById('incidentDetails');
            
            const safeDate = inc.createdAt ? new Date(inc.createdAt) : new Date();
            const timeStr = safeDate.toLocaleString();
            
            // Determine button states
            const acceptDis = inc.status !== 'PENDING' ? 'btn-disabled' : '';
            const respondDis = (inc.status === 'RESOLVED' || inc.status === 'RESPONDING') ? 'btn-disabled' : '';
            const resolveDis = inc.status === 'RESOLVED' ? 'btn-disabled' : '';

            detailsEl.innerHTML = `
                <div class="panel-header" style="margin: -20px -20px 20px -20px; border-radius: 16px 16px 0 0;">
                    <span style="font-size: 1.1rem; color: white;">Incident: ${inc.id}</span>
                    <span class="severity-badge sev-${inc.severity.toLowerCase()}">${inc.severity}</span>
                </div>
                
                <h2 style="margin-bottom: 5px; color: white;">${inc.location}</h2>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">${inc.description}</p>
                
                <div class="details-grid">
                    <div class="detail-item">
                        <span>Reported By</span>
                        <div>${inc.userName}</div>
                    </div>
                    <div class="detail-item">
                        <span>Contact</span>
                        <div>${inc.contact || inc.phone || "No Contact Provided"}</div>
                    </div>
                    <div class="detail-item">
                        <span>Time</span>
                        <div>${timeStr}</div>
                    </div>
                    <div class="detail-item">
                        <span>Current Status</span>
                        <div><strong style="color: #3B82F6;">${inc.status}</strong></div>
                    </div>
                    <div class="detail-item">
                        <span>Coordinates</span>
                        <div>${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}</div>
                    </div>
                </div>

                <div style="margin-top: 15px; border-top: 1px solid #E5E7EB; padding-top: 15px;">
                    <strong style="color: white;"><i class="fas fa-camera"></i> Proof of Request</strong>
                    <div style="margin-top: 10px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); height: 160px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative;">
                        <img src="https://images.unsplash.com/photo-1599839619722-39751411ea63?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="SOS Fire Proof" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        <div style="position: absolute; top: 10px; right: 10px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <i class="fas fa-map-marker-alt" style="color: #EF4444;"></i> GPS Verified
                        </div>
                    </div>
                </div>

                <textarea class="op-notes" id="opNotes" placeholder="Add operational notes..."></textarea>

                <div class="action-buttons">
                    <button class="action-btn btn-accept ${acceptDis}" onclick="updateStatus('${inc.id}', 'ACKNOWLEDGED')">
                        <i class="fas fa-check-circle"></i> Accept
                    </button>
                    <button class="action-btn btn-respond ${respondDis}" onclick="updateStatus('${inc.id}', 'RESPONDING')">
                        <i class="fas fa-truck-fast"></i> Responding
                    </button>
                    <button class="action-btn btn-resolve ${resolveDis}" onclick="updateStatus('${inc.id}', 'RESOLVED')">
                        <i class="fas fa-shield-alt"></i> Resolve
                    </button>
                </div>
            `;

            // Update Map
            if (marker) map.removeLayer(marker);
            if (circle) map.removeLayer(circle);

            const latlng = [inc.latitude, inc.longitude];
            
            let markerColor = inc.severity === 'CRITICAL' ? '#ef4444' : inc.severity === 'HIGH' ? '#f97316' : '#eab308';
            
            circle = L.circle(latlng, {
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.2,
                radius: 500
            }).addTo(map);

            marker = L.marker(latlng).addTo(map);
            map.flyTo(latlng, 14, { duration: 1.5 });
        }

        // --- 6. ACTIONS ---
        function updateStatus(id, newStatus) {
            const notes = document.getElementById('opNotes').value;
            
            if (db) {
                // Update RTDB
                const updatePayload = {
                    status: newStatus,
                    operatorNote: notes,
                    operatorId: "OP-01",
                    operatorName: "Station Alpha",
                    updatedAt: new Date().toISOString()
                };

                if (newStatus === 'ACKNOWLEDGED') updatePayload.acceptedAt = new Date().toISOString();
                if (newStatus === 'RESOLVED') updatePayload.resolvedAt = new Date().toISOString();

                db.ref("emergency_requests/" + id).update(updatePayload).catch(err => alert("Error updating status: " + err));
            } else {
                // Mock update
                const idx = incidents.findIndex(i => i.id === id);
                if (idx > -1) {
                    incidents[idx].status = newStatus;
                    incidents[idx].operatorNote = notes;
                    renderList();
                    renderDetails(incidents[idx]);
                }
            }
        }

        // --- 7. MOCK/ALERT HELPERS ---
        function triggerAlert(data) {
            document.getElementById('alertLoc').innerText = data.location;
            const sevBadge = document.getElementById('alertSev');
            sevBadge.innerText = data.severity;
            sevBadge.className = `severity-badge sev-${data.severity.toLowerCase()}`;
            
            document.getElementById('newAlertPopup').classList.add('show');
            
            // Audio alert
            try {
                const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3');
                audio.play();
            } catch(e) {}
        }

        function dismissAlert() {
            document.getElementById('newAlertPopup').classList.remove('show');
        }

        function viewLatestAlert() {
            dismissAlert();
            // Find newest pending
            const newest = [...incidents].sort((a,b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
                return dateB - dateA;
            }).find(i => i.status === 'PENDING');
            if (newest) selectIncident(newest.id);
        }

        function simulateIncomingRequest() {
            if (db) return; // Don't mock if connected to firestore
            
            const newReq = {
                id: "REQ-" + Math.floor(Math.random()*1000),
                userName: "Local Trekker",
                contact: "+91 91234 56789",
                latitude: 30.3500,
                longitude: 78.0500,
                location: "Mussoorie Hills Trail",
                description: "Spotted flames rapidly spreading uphill.",
                severity: "CRITICAL",
                createdAt: new Date().toISOString(),
                status: "PENDING"
            };
            
            incidents.unshift(newReq);
            renderList();
            triggerAlert(newReq);
        }
