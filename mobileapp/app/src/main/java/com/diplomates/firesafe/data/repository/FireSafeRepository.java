package com.diplomates.firesafe.data.repository;

import com.diplomates.firesafe.data.model.ChatMessage;
import com.diplomates.firesafe.data.model.EvacuationStep;
import com.diplomates.firesafe.data.model.FireAlert;
import com.diplomates.firesafe.data.model.FireRiskStatus;
import com.diplomates.firesafe.data.model.PrecautionItem;
import com.diplomates.firesafe.data.model.SafeShelter;
import com.diplomates.firesafe.data.model.SosEvent;
import com.diplomates.firesafe.data.model.WildfireAffectedZone;
import com.diplomates.firesafe.data.model.WildfireData;
import com.diplomates.firesafe.data.model.WildfireIncident;
import com.diplomates.firesafe.data.model.WildfireNode;
import com.diplomates.firesafe.data.model.WildfirePrediction;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class FireSafeRepository {

    private static FireSafeRepository instance;

    public interface OnRiskStatusChangedListener {
        void onRiskStatusChanged(FireRiskStatus newStatus, boolean isOffline);
    }

    private final List<OnRiskStatusChangedListener> listeners = new ArrayList<>();
    private FireRiskStatus currentRiskStatus = FireRiskStatus.SAFE;
    private WildfireData currentWildfireData = null;
    private boolean isOffline = false;
    private String currentLocationName = "Bibwewadi, Pune";
    private double currentLatitude = 18.4695;
    private double currentLongitude = 73.8640;
    private int simulatedBatteryPercent = 84;

    private final List<FireAlert> alertsList = new ArrayList<>();
    private final List<SafeShelter> sheltersList = new ArrayList<>();
    private final List<ChatMessage> chatMessages = new ArrayList<>();
    private final List<PreacuationContact> emergencyContacts = new ArrayList<>();
    private final List<PrecautionItem> precautionsList = new ArrayList<>();

    public static class PreacuationContact {
        public String name;
        public String phone;
        public String relation;

        public PreacuationContact(String name, String phone, String relation) {
            this.name = name;
            this.phone = phone;
            this.relation = relation;
        }
    }

    private FireSafeRepository() {
        instance = this;
        this.currentWildfireData = WildfireData.createDefaultNormalState();
        initSampleData();
    }

    public static synchronized FireSafeRepository getInstance() {
        if (instance == null) {
            instance = new FireSafeRepository();
        }
        return instance;
    }

    public static FireSafeRepository getInstanceOrNull() {
        return instance;
    }

    public void addListener(OnRiskStatusChangedListener listener) {
        if (!listeners.contains(listener)) {
            listeners.add(listener);
            listener.onRiskStatusChanged(currentRiskStatus, isOffline);
        }
    }

    public void removeListener(OnRiskStatusChangedListener listener) {
        listeners.remove(listener);
    }

    public FireRiskStatus getCurrentRiskStatus() {
        return currentRiskStatus;
    }

    public void setRiskStatus(FireRiskStatus newStatus) {
        this.currentRiskStatus = newStatus;
        notifyListeners();
    }

    public boolean isOffline() {
        return isOffline;
    }

    public void setOffline(boolean offline) {
        this.isOffline = offline;
        notifyListeners();
    }

    private void notifyListeners() {
        for (OnRiskStatusChangedListener l : new ArrayList<>(listeners)) {
            l.onRiskStatusChanged(currentRiskStatus, isOffline);
        }
    }

    public void syncWithApi(com.diplomates.firesafe.data.api.FireSafeApiClient.LocationRiskResult result) {
        if (result == null) return;
        if (result.locationName != null && !result.locationName.isEmpty()) {
            this.currentLocationName = result.locationName;
        }
        if (result.latitude != 0) this.currentLatitude = result.latitude;
        if (result.longitude != 0) this.currentLongitude = result.longitude;

        // Ground truth for wildfire threat strictly reflects real Firebase IoT sensor nodes & incident state
        if (currentWildfireData != null && currentWildfireData.hasActiveFire()) {
            this.currentRiskStatus = FireRiskStatus.EXTREME;
        } else if (currentWildfireData != null && currentWildfireData.hasSuspiciousActivity()) {
            this.currentRiskStatus = FireRiskStatus.WARNING;
        } else {
            this.currentRiskStatus = FireRiskStatus.SAFE;
        }

        notifyListeners();
    }

    public void updateCurrentLocation(String locationName, double latitude, double longitude) {
        if (locationName != null && !locationName.trim().isEmpty()) {
            this.currentLocationName = locationName.trim();
        }
        if (latitude != 0) {
            this.currentLatitude = latitude;
        }
        if (longitude != 0) {
            this.currentLongitude = longitude;
        }
    }

    public String getCurrentLocationName() { return currentLocationName; }
    public double getCurrentLatitude() { return currentLatitude; }
    public double getCurrentLongitude() { return currentLongitude; }
    public int getSimulatedBatteryPercent() { return simulatedBatteryPercent; }

    public List<FireAlert> getAlerts() {
        return Collections.unmodifiableList(alertsList);
    }

    public void addCustomAlert(FireAlert alert) {
        if (alert != null) {
            alertsList.add(0, alert);
            notifyListeners();
        }
    }

    public WildfireData getWildfireData() {
        return currentWildfireData;
    }

    public boolean hasActiveFire() {
        if (currentWildfireData != null && currentWildfireData.isForcedSafe()) {
            return false;
        }
        return currentWildfireData != null && currentWildfireData.hasActiveFire();
    }

    public boolean hasHighRisk() {
        if (currentWildfireData != null && currentWildfireData.isForcedSafe()) {
            return false;
        }
        return currentWildfireData != null && currentWildfireData.hasHighRisk();
    }

    public boolean hasFireOrHighThreat() {
        if (currentWildfireData != null && currentWildfireData.isForcedSafe()) {
            return false;
        }
        return hasActiveFire() || hasHighRisk() || currentRiskStatus == FireRiskStatus.HIGH || currentRiskStatus == FireRiskStatus.EXTREME;
    }

    public boolean hasSuspiciousActivity() {
        if (currentWildfireData != null && currentWildfireData.isForcedSafe()) {
            return false;
        }
        return currentWildfireData != null && currentWildfireData.hasSuspiciousActivity();
    }

    public void forceSetFireState(boolean enableFire, double fireLat, double fireLng) {
        if (currentWildfireData == null) {
            currentWildfireData = WildfireData.createDefaultNormalState();
        }

        if (enableFire) {
            this.currentRiskStatus = FireRiskStatus.HIGH;
            currentWildfireData.setManualOverride(true, "HIGH");
            double lat = fireLat != 0 ? fireLat : (currentLatitude + 0.0055);
            double lng = fireLng != 0 ? fireLng : (currentLongitude + 0.0045);
            currentWildfireData.synthesizeActiveFireIncident();

            // Retain only non-realtime historical alerts
            List<FireAlert> retained = new ArrayList<>();
            for (FireAlert a : alertsList) {
                if (a.getTimelineBucket() != FireAlert.TimelineBucket.ACTIVE_NOW) {
                    retained.add(a);
                }
            }
            alertsList.clear();
            FireAlert activeAlert = new FireAlert(
                    "wf_high_" + System.currentTimeMillis(),
                    "HIGH FIRE RISK DETECTED",
                    "Forest Sector",
                    FireRiskStatus.HIGH,
                    computeDistanceKm(currentLatitude, currentLongitude, lat, lng),
                    "Just now",
                    "North-East",
                    "1.8 km² NORTH_EAST",
                    "HIGH RISK WARNING: Elevated thermal and sensor telemetry confirmed near your sector. Prepared shelters outside hazard perimeter are open.",
                    lat, lng,
                    true,
                    FireAlert.TimelineBucket.ACTIVE_NOW
            );
            alertsList.add(0, activeAlert);
            alertsList.addAll(retained);
        } else {
            this.currentRiskStatus = FireRiskStatus.SAFE;
            currentWildfireData.setManualOverride(true, "SAFE");

            // Retain only non-realtime historical alerts (clear active alerts)
            List<FireAlert> retained = new ArrayList<>();
            for (FireAlert a : alertsList) {
                if (a.getTimelineBucket() != FireAlert.TimelineBucket.ACTIVE_NOW) {
                    retained.add(a);
                }
            }
            alertsList.clear();
            FireAlert safeAlert = new FireAlert(
                    "wf_safe_" + System.currentTimeMillis(),
                    "ALL-CLEAR: Sector Safe & Contained",
                    "Bibwewadi / Katraj Sector",
                    FireRiskStatus.SAFE,
                    0.0,
                    "Just now",
                    "All Sectors",
                    "Perimeter Secured",
                    "Wildfire threat successfully contained. All sensor channels report normal levels. Designated shelters remain open if needed.",
                    currentLatitude, currentLongitude,
                    false,
                    FireAlert.TimelineBucket.ACTIVE_NOW
            );
            alertsList.add(0, safeAlert);
            alertsList.addAll(retained);
        }
        notifyListeners();
    }

    public void syncWithWildfireData(WildfireData data) {
        if (data == null) return;
        this.currentWildfireData = data;

        // If manualSafeOverride is active, force SAFE state!
        if (data.isForcedSafe()) {
            this.currentRiskStatus = FireRiskStatus.SAFE;
            List<FireAlert> retained = new ArrayList<>();
            for (FireAlert a : alertsList) {
                if (a.getTimelineBucket() != FireAlert.TimelineBucket.ACTIVE_NOW) {
                    retained.add(a);
                }
            }
            alertsList.clear();
            FireAlert safeAlert = new FireAlert(
                    "wf_safe_" + System.currentTimeMillis(),
                    "ALL-CLEAR: Sector Safe & Contained",
                    "Bibwewadi / Katraj Sector",
                    FireRiskStatus.SAFE,
                    0.0,
                    "Just now",
                    "All Sectors",
                    "Perimeter Secured",
                    "Wildfire threat successfully contained. All sensor channels report normal levels.",
                    currentLatitude, currentLongitude,
                    false,
                    FireAlert.TimelineBucket.ACTIVE_NOW
            );
            alertsList.add(0, safeAlert);
            alertsList.addAll(retained);
            notifyListeners();
            return;
        }

        // Retain only non-realtime historical alerts
        List<FireAlert> retained = new ArrayList<>();
        for (FireAlert a : alertsList) {
            if (a.getTimelineBucket() != FireAlert.TimelineBucket.ACTIVE_NOW) {
                retained.add(a);
            }
        }
        alertsList.clear();
        alertsList.addAll(retained);

        if (data.hasActiveFire()) {
            this.currentRiskStatus = FireRiskStatus.EXTREME;

            WildfireIncident inc = data.getPrimaryActiveIncident();
            List<WildfireNode> fireNodes = data.getActiveFireNodes();
            WildfireNode primaryNode = (!fireNodes.isEmpty()) ? fireNodes.get(0) : null;
            WildfireAffectedZone zone = data.getPrimaryAffectedZone();
            WildfirePrediction pred = data.getPrimaryPrediction();

            double lat = primaryNode != null ? primaryNode.getLatitude() : (inc != null ? inc.getLatitude() : 18.5204);
            double lng = primaryNode != null ? primaryNode.getLongitude() : (inc != null ? inc.getLongitude() : 73.8567);
            String nodeName = primaryNode != null ? primaryNode.getName() : "Forest Node (WF-001)";
            double temp = primaryNode != null ? primaryNode.getTemperature() : 42.6;
            double conf = inc != null ? inc.getConfidence() : (primaryNode != null ? primaryNode.getConfidence() : 0.95);
            String spread = pred != null ? (pred.getPredictedAreaKm2() + " km² " + pred.getDirection()) : "12.4 km² NORTH_EAST";

            FireAlert activeFireAlert = new FireAlert(
                    "wf_active_" + System.currentTimeMillis(),
                    "ACTIVE WILDFIRE CONFIRMED",
                    nodeName + " Sector",
                    FireRiskStatus.EXTREME,
                    computeDistanceKm(currentLatitude, currentLongitude, lat, lng),
                    "Just now",
                    pred != null ? pred.getDirection() : "North-East",
                    spread,
                    "EVACUATE IMMEDIATELY: Dual optical flame & MQ smoke sensors confirmed at " + temp + "°C (" + (int)(conf * 100) + "% confidence). Follow designated evacuation corridor to nearest shelter.",
                    lat, lng,
                    true,
                    FireAlert.TimelineBucket.ACTIVE_NOW
            );
            alertsList.add(0, activeFireAlert);

        } else if (data.hasHighRisk() || data.hasSuspiciousActivity()) {
            this.currentRiskStatus = FireRiskStatus.HIGH;

            List<WildfireNode> highNodes = data.getHighRiskNodes();
            WildfireNode sn = (!highNodes.isEmpty()) ? highNodes.get(0) : null;
            double lat = sn != null ? sn.getLatitude() : 18.5204;
            double lng = sn != null ? sn.getLongitude() : 73.8567;
            String nodeName = sn != null ? sn.getName() : "Forest Node (WF-001)";
            double temp = sn != null ? sn.getTemperature() : 35.0;

            String anomalyType;
            if (sn != null && sn.isSmokeHigh() && sn.isTemperatureHigh()) {
                anomalyType = "Smoke Anomaly (MQ: " + sn.getMq() + ") & High Temperature (" + temp + "°C)";
            } else if (sn != null && sn.isSmokeHigh()) {
                anomalyType = "Smoke Sensor Reading High (MQ: " + sn.getMq() + ") at " + temp + "°C";
            } else if (sn != null && sn.isTemperatureHigh()) {
                anomalyType = "Temperature Sensor Reading High (" + temp + "°C)";
            } else {
                anomalyType = "Elevated Sensor Telemetry (" + (sn != null ? sn.getStatus() : "HIGH") + ") at " + temp + "°C";
            }

            FireAlert highAlert = new FireAlert(
                    "wf_high_" + System.currentTimeMillis(),
                    "HIGH FIRE RISK DETECTED",
                    nodeName + " Sector",
                    FireRiskStatus.HIGH,
                    computeDistanceKm(currentLatitude, currentLongitude, lat, lng),
                    "Just now",
                    "Sector Watch",
                    "0.5 km/h perimeter",
                    "HIGH RISK WARNING: " + anomalyType + ". Prepare emergency supplies and monitor live map telemetry.",
                    lat, lng,
                    true,
                    FireAlert.TimelineBucket.ACTIVE_NOW
            );
            alertsList.add(0, highAlert);

        } else {
            // NORMAL STATE: NO FIRE EXISTS!
            this.currentRiskStatus = FireRiskStatus.SAFE;
        }

        notifyListeners();
    }

    public double computeDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.max(0.1, 6371.0 * c);
    }

    public FireAlert getActiveNearbyAlert() {
        if (!hasActiveFire() && !hasSuspiciousActivity()) {
            return null;
        }
        for (FireAlert alert : alertsList) {
            if (alert.getTimelineBucket() == FireAlert.TimelineBucket.ACTIVE_NOW) {
                return alert;
            }
        }
        return null;
    }

    public List<SafeShelter> getSheltersOutsideDangerZone() {
        if (!hasFireOrHighThreat()) {
            return Collections.unmodifiableList(sheltersList);
        }

        double fireLat = currentLatitude + 0.0055;
        double fireLng = currentLongitude + 0.0045;
        double dangerRadiusKm = 2.0;

        if (currentWildfireData != null) {
            WildfireIncident inc = currentWildfireData.getPrimaryActiveIncident();
            List<WildfireNode> fireNodes = currentWildfireData.getActiveFireNodes();
            List<WildfireNode> highNodes = currentWildfireData.getHighRiskNodes();
            WildfireNode primaryNode = (!fireNodes.isEmpty()) ? fireNodes.get(0)
                    : ((!highNodes.isEmpty()) ? highNodes.get(0) : null);
            if (primaryNode != null && primaryNode.getLatitude() != 0) {
                fireLat = primaryNode.getLatitude();
                fireLng = primaryNode.getLongitude();
            } else if (inc != null && inc.getLatitude() != 0) {
                fireLat = inc.getLatitude();
                fireLng = inc.getLongitude();
            }
            WildfireAffectedZone zone = currentWildfireData.getPrimaryAffectedZone();
            if (zone != null && zone.getRadiusKm() > 0) {
                dangerRadiusKm = Math.max(dangerRadiusKm, zone.getRadiusKm() + 0.4);
            }
        }

        FireAlert activeAlert = getActiveNearbyAlert();
        if (activeAlert != null && activeAlert.getLatitude() != 0) {
            fireLat = activeAlert.getLatitude();
            fireLng = activeAlert.getLongitude();
        }

        List<SafeShelter> safeOutside = new ArrayList<>();
        for (SafeShelter s : sheltersList) {
            double distToFire = computeDistanceKm(s.getLatitude(), s.getLongitude(), fireLat, fireLng);
            if (distToFire > dangerRadiusKm) {
                safeOutside.add(s);
            }
        }

        if (safeOutside.isEmpty() && !sheltersList.isEmpty()) {
            List<SafeShelter> sorted = new ArrayList<>(sheltersList);
            final double fLat = fireLat;
            final double fLng = fireLng;
            Collections.sort(sorted, (a, b) -> Double.compare(
                    computeDistanceKm(b.getLatitude(), b.getLongitude(), fLat, fLng),
                    computeDistanceKm(a.getLatitude(), a.getLongitude(), fLat, fLng)
            ));
            safeOutside.add(sorted.get(0));
        }

        return safeOutside;
    }

    public List<SafeShelter> getShelters() {
        if (hasFireOrHighThreat()) {
            return Collections.unmodifiableList(getSheltersOutsideDangerZone());
        }
        return Collections.unmodifiableList(sheltersList);
    }

    public SafeShelter getNearestShelter() {
        List<SafeShelter> safeList = getSheltersOutsideDangerZone();
        return safeList.isEmpty() ? (sheltersList.isEmpty() ? null : sheltersList.get(0)) : safeList.get(0);
    }

    public List<ChatMessage> getChatHistory() {
        return Collections.unmodifiableList(chatMessages);
    }

    public List<PreacuationContact> getEmergencyContacts() {
        return emergencyContacts;
    }

    public List<PrecautionItem> getPrecautions() {
        return Collections.unmodifiableList(precautionsList);
    }

    public List<EvacuationStep> getSafeEvacuationSteps() {
        List<EvacuationStep> steps = new ArrayList<>();
        steps.add(new EvacuationStep(1, "Head SOUTH-WEST away from northeast fire hotspot", 400, false, "Avoid northern sector and uphill trails with smoke plume"));
        steps.add(new EvacuationStep(2, "Follow Pune-Satara Road Arterial Corridor toward Katraj", 1100, true, "AI Risk Avoidance: North-East sector blocked by high flame zone"));
        steps.add(new EvacuationStep(3, "Cross Katraj Lake Junction via wide paved buffer zone", 600, false, "Verified perimeter outside active fire hazard zone"));
        steps.add(new EvacuationStep(4, "Arrive at Katraj Civic Disaster Relief Complex", 200, false, "Verified Safe Shelter with medical aid and emergency supplies"));
        return steps;
    }

    public ChatMessage sendUserMessage(String userText) {
        String timestamp = new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
        ChatMessage userMsg = new ChatMessage("msg_" + System.currentTimeMillis(), userText, true, timestamp, null, false);
        chatMessages.add(userMsg);

        // Intelligent emergency AI response generation based on FireSafe safety playbook
        ChatMessage aiReply = generateSanthiResponse(userText);
        chatMessages.add(aiReply);
        return aiReply;
    }

    public ChatMessage addUserMessage(String userText) {
        String timestamp = new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
        ChatMessage userMsg = new ChatMessage("msg_" + System.currentTimeMillis(), userText, true, timestamp, null, false);
        chatMessages.add(userMsg);
        return userMsg;
    }

    public void addAiMessage(ChatMessage aiMsg) {
        if (aiMsg != null) {
            chatMessages.add(aiMsg);
        }
    }

    public ChatMessage generateFallbackAiResponse(String userText) {
        return generateSanthiResponse(userText);
    }

    private ChatMessage generateSanthiResponse(String input) {
        String lower = input.toLowerCase(Locale.ROOT);
        String timestamp = new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
        List<String> chips = new ArrayList<>();

        if (lower.contains("what should i do") || lower.contains("action") || lower.contains("now")) {
            chips.add("Show safe route");
            chips.add("Nearest shelter");
            chips.add("Emergency contacts");
            return new ChatMessage(
                "ai_" + System.currentTimeMillis(),
                "Priority Protocol for your current area:\n\n" +
                "1. If fire risk is HIGH or EXTREME, evacuate immediately toward the South-West.\n" +
                "2. Close all windows, doors, and vents to prevent smoke infiltration.\n" +
                "3. Grab your Go-Bag: IDs, water, N95 masks, medications.\n" +
                "4. Nearest open shelter is Shivaji Community Safe Hall (2.4 km away).\n" +
                "5. Tap SOS below if you cannot evacuate on your own.",
                false, timestamp, chips, true
            );
        } else if (lower.contains("safe") || lower.contains("area") || lower.contains("risk")) {
            chips.add("View fire map");
            chips.add("Evacuate now");
            if (currentRiskStatus == FireRiskStatus.SAFE) {
                return new ChatMessage(
                    "ai_" + System.currentTimeMillis(),
                    "Your current coordinates (" + String.format(Locale.US, "%.4f, %.4f", currentLatitude, currentLongitude) +
                    ") are categorized as SAFE. No active thermal anomalies detected within a 5 km radius. Continue monitoring updates.",
                    false, timestamp, chips, false
                );
            } else {
                return new ChatMessage(
                    "ai_" + System.currentTimeMillis(),
                    "WARNING: Active fire detected 4.2 km North-East of your location. Wind speed is 18 km/h spreading toward ridge slopes. Prepare your evacuation route.",
                    false, timestamp, chips, true
                );
            }
        } else if (lower.contains("shelter") || lower.contains("where")) {
            chips.add("Start Safe Navigation");
            chips.add("Call Shelter");
            return new ChatMessage(
                "ai_" + System.currentTimeMillis(),
                "The nearest verified safe shelter is:\n\n" +
                "• Shivaji Community Safe Hall\n" +
                "• Distance: 2.4 km (approx 8 min drive)\n" +
                "• Status: Verified Open (140 beds available)\n" +
                "• Amenities: Emergency Medical Unit, Clean Water, Power Backup.",
                false, timestamp, chips, false
            );
        } else if (lower.contains("evacuate") || lower.contains("route")) {
            chips.add("Open Evacuation Navigation");
            return new ChatMessage(
                "ai_" + System.currentTimeMillis(),
                "Evacuation Recommendation:\n" +
                "Take South-West route via Senapati Bapat Road. Do NOT use the Northern forest ridge bypass because high thermal risk and smoke obstruction are active.",
                false, timestamp, chips, true
            );
        } else if (lower.contains("carry") || lower.contains("bag") || lower.contains("pack")) {
            chips.add("Checklist: Go-Bag");
            return new ChatMessage(
                "ai_" + System.currentTimeMillis(),
                "Essential Wildfire Evacuation Go-Bag:\n" +
                "✓ Government IDs & Emergency Cash\n" +
                "✓ 3-day supply of personal medications\n" +
                "✓ N95 or P100 respirator masks\n" +
                "✓ 1 Gallon of water per person\n" +
                "✓ Sturdy leather shoes & long cotton pants\n" +
                "✓ Phone charger & portable power bank.",
                false, timestamp, chips, false
            );
        } else if (lower.contains("internet") || lower.contains("offline")) {
            chips.add("Cached map info");
            chips.add("SMS emergency protocol");
            return new ChatMessage(
                "ai_" + System.currentTimeMillis(),
                "Offline Playbook Active:\n" +
                "• Your local map tiles and safe shelter directory are cached locally on this device.\n" +
                "• The SOS button will automatically fall back to SMS to +91 112 and your emergency contacts if cell data is unreachable.",
                false, timestamp, chips, false
            );
        } else {
            chips.add("What should I do now?");
            chips.add("Where is the nearest shelter?");
            chips.add("Is my area safe?");
            return new ChatMessage(
                "ai_" + System.currentTimeMillis(),
                "I am SANthi, your emergency safety assistant. I can guide you through safe evacuation routes, shelter locations, fire risk updates, and emergency precautions. How can I help right now?",
                false, timestamp, chips, false
            );
        }
    }

    public SosEvent dispatchEmergencySos() {
        return dispatchEmergencySos(currentLatitude, currentLongitude, currentLocationName, simulatedBatteryPercent, currentRiskStatus);
    }

    public SosEvent dispatchEmergencySos(double lat, double lng, String locationName, int batteryPercent, FireRiskStatus riskStatus) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date());
        String id = "SOS-" + System.currentTimeMillis();
        SosEvent event = new SosEvent(
            id,
            timestamp,
            lat,
            lng,
            locationName != null ? locationName : currentLocationName,
            batteryPercent,
            SosEvent.TransmissionStatus.SENDING
        );
        event.setDispatchId(id);
        event.setRiskLevel(riskStatus != null ? riskStatus.name() : "HIGH");
        event.setSeverity("CRITICAL");
        return event;
    }

    private void initSampleData() {
        // Initial state is clean & safe. Active alerts are populated dynamically from Firebase Realtime Database.

        alertsList.add(new FireAlert(
            "alt_01",
            "Forest Defense Sensor Mesh Active",
            "Bibwewadi & Katraj Ridge Network",
            FireRiskStatus.SAFE,
            0.0,
            "10m ago",
            "Local Sector",
            "All 4 nodes online",
            "Real-time IoT telemetry connected: MQ smoke and thermal monitoring active across sector perimeters.",
            18.4695, 73.8640,
            false,
            FireAlert.TimelineBucket.ACTIVE_NOW
        ));

        alertsList.add(new FireAlert(
            "alt_03",
            "Controlled Buffer Backfire",
            "Taljai Hills Nature Reserve, Pune",
            FireRiskStatus.SAFE,
            2.9,
            "2 hours ago",
            "West",
            "Contained by PMC Forest Unit",
            "Area safe for transit; smoke cleared",
            18.4810, 73.8430,
            false,
            FireAlert.TimelineBucket.TODAY
        ));

        alertsList.add(new FireAlert(
            "alt_04",
            "High Heat & Dry Brush Advisory",
            "Satara Road & Dhankawadi Sector",
            FireRiskStatus.WARNING,
            2.6,
            "Yesterday 4:00 PM",
            "Regional",
            "Dry winds above 36°C",
            "Refrain from any open burning or outdoor welding",
            18.4610, 73.8540,
            false,
            FireAlert.TimelineBucket.EARLIER
        ));

        // Safe Shelters located FIRMLY OUTSIDE all fire hazard danger zones (South & South-West)
        sheltersList.add(new SafeShelter(
            "sh_01",
            "Katraj Disaster Relief Shelter Complex",
            "Near Katraj Lake Chowk, Pune-Satara Road, Katraj, Pune",
            2.8,
            9,
            true,
            280,
            350,
            "+91 20 2437 2020",
            Arrays.asList("Emergency Medical", "Clean Drinking Water", "Generator Power", "Food Packets", "Air Filtration"),
            18.4480, 73.8500
        ));

        sheltersList.add(new SafeShelter(
            "sh_02",
            "Ambegaon Municipal Relief Center & Safe Hall",
            "Near Katraj-Dehu Bypass, Ambegaon Budruk, Pune",
            3.9,
            13,
            true,
            220,
            300,
            "+91 20 2436 7700",
            Arrays.asList("Protected Concrete Hall", "Clean Water Tanker", "Generator Power", "First Aid"),
            18.4420, 73.8380
        ));

        sheltersList.add(new SafeShelter(
            "sh_03",
            "Bharati Vidyapeeth South Safe Haven",
            "Bharati Vidyapeeth Campus South, Dhankawadi, Pune",
            3.1,
            10,
            true,
            320,
            450,
            "+91 20 2436 4411",
            Arrays.asList("Field Clinic", "Canteen", "Pet Friendly", "Ambulances", "Charging Hub"),
            18.4500, 73.8430
        ));

        sheltersList.add(new SafeShelter(
            "sh_04",
            "Katraj-Kondhwa Civic Safe Assembly Hub",
            "Katraj-Kondhwa Arterial Road, Pune",
            2.7,
            9,
            true,
            180,
            250,
            "+91 20 2422 1100",
            Arrays.asList("Emergency Shelter", "Drinking Water", "First Aid Kit", "Backup Power"),
            18.4450, 73.8620
        ));

        // Initial SANthi message
        chatMessages.add(new ChatMessage(
            "msg_init",
            "Hello! I am SANthi, your FireSafe emergency assistant. I continuously track forest fire risks, safe shelters, and evacuation corridors. How can I protect you right now?",
            false,
            "12:00 PM",
            Arrays.asList("What should I do now?", "Is my area safe?", "Where is the nearest shelter?", "How do I evacuate?"),
            false
        ));

        // Emergency Contacts start empty - user adds real contacts

        // Precautions
        precautionsList.add(new PrecautionItem(
            "pr_01",
            "Go-Bag & Evacuation Checklist",
            PrecautionItem.Category.BEFORE,
            "Prepare essentials in advance so you can leave within 3 minutes.",
            Arrays.asList(
                "N95 or P100 respirator masks for all household members",
                "Flashlight, whistle, and spare batteries",
                "Minimum 3 liters of sealed water per person",
                "Important identification documents in waterproof pouch",
                "Prescription medicines for at least 7 days",
                "Full power bank and charging cables"
            )
        ));

        precautionsList.add(new PrecautionItem(
            "pr_02",
            "During Active Wildfire Evacuation",
            PrecautionItem.Category.DURING,
            "Follow official evacuation corridors and avoid ridge bottlenecks.",
            Arrays.asList(
                "Wear cotton or wool clothing with long sleeves; avoid synthetics that melt",
                "Drive with headlights on low beam and hazard lights flashing in smoke",
                "Keep all vehicle windows and AC set to recirculate inside air",
                "Never drive into dense dark smoke where road visibility is zero",
                "Follow green safe evacuation arrows on the FireSafe app map"
            )
        ));

        precautionsList.add(new PrecautionItem(
            "pr_03",
            "If Trapped in Structure or Vehicle",
            PrecautionItem.Category.TRAPPED,
            "Action steps if you are unable to evacuate before the fire front arrives.",
            Arrays.asList(
                "Stay inside the building; heat radiates much stronger outside in open air",
                "Close all doors and windows; block cracks with wet towels",
                "Fill sinks and tubs with water for emergency dousing",
                "Turn on all lights inside and outside so responders can see your location",
                "Hold the red SOS button in this app for 3 seconds to broadcast coordinates"
            )
        ));

        precautionsList.add(new PrecautionItem(
            "pr_04",
            "Smoke Inhalation & Air Quality Guide",
            PrecautionItem.Category.AFTER,
            "Protecting lungs and health from hazardous particulate matter (PM2.5).",
            Arrays.asList(
                "Wear a fitted N95 mask outdoors until AQI drops below 100",
                "Do not run outdoor ventilation or vacuum indoors",
                "Check on elderly neighbors and young children for respiratory distress",
                "Wait for official FireSafe clearance before returning to evacuated zones"
            )
        ));
    }
}
