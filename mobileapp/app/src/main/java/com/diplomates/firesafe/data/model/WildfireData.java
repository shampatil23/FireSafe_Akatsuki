package com.diplomates.firesafe.data.model;

import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Aggregates all realtime wildfire data from Firebase:
 * nodes, incidents, predictions, affectedZones, and gateways.
 * Determines whether a real wildfire, high risk condition, or normal state exists.
 * Supports loading from Firebase Cloud Firestore and Firebase RTDB.
 */
public class WildfireData {
    private final Map<String, WildfireNode> nodes = new HashMap<>();
    private final Map<String, WildfireIncident> incidents = new HashMap<>();
    private final Map<String, WildfireAffectedZone> affectedZones = new HashMap<>();
    private final Map<String, WildfirePrediction> predictions = new HashMap<>();
    private final Map<String, WildfireGateway> gateways = new HashMap<>();
    private boolean existsInFirebase = false;
    private boolean manualOverrideActive = false;
    private boolean manualSafeOverride = false;

    public boolean isForcedSafe() {
        return manualSafeOverride;
    }

    public void setManualOverride(boolean active, String state) {
        if ("SAFE".equalsIgnoreCase(state) || "NORMAL".equalsIgnoreCase(state) || (!active && (state == null || state.isEmpty()))) {
            this.manualSafeOverride = true;
            this.manualOverrideActive = false;
        } else {
            this.manualOverrideActive = active;
            this.manualSafeOverride = !active;
        }
    }

    public WildfireData() {}

    /**
     * Parses from Firebase Cloud Firestore REST payload
     * (e.g. { "documents": [ { "name": ".../nodes/WF-001", "fields": { ... } } ] })
     * or single document { "fields": { ... } }.
     */
    public static WildfireData fromFirestore(JSONObject json) {
        WildfireData data = new WildfireData();
        if (json == null) return data;
        data.existsInFirebase = true;

        if (json.has("documents")) {
            JSONArray docs = json.optJSONArray("documents");
            if (docs != null) {
                for (int i = 0; i < docs.length(); i++) {
                    JSONObject doc = docs.optJSONObject(i);
                    if (doc != null) {
                        WildfireNode node = WildfireNode.fromFirestoreDoc("", doc);
                        if (node != null) {
                            data.nodes.put(node.getNodeId(), node);
                        }
                    }
                }
            }
        } else if (json.has("fields")) {
            WildfireNode node = WildfireNode.fromFirestoreDoc("WF-001", json);
            if (node != null) {
                data.nodes.put(node.getNodeId(), node);
            }
        }

        // If high risk or confirmed fire exists, populate synthetic incident/predictions if empty
        if (data.hasActiveFire() || data.hasHighRisk()) {
            data.synthesizeActiveFireIncident();
        }

        return data;
    }

    /**
     * Parses from standard flat JSON (e.g. Firebase Realtime Database)
     */
    public static WildfireData fromJson(JSONObject json) {
        WildfireData data = new WildfireData();
        if (json == null) return data;

        // If this is actually a Firestore document collection or single doc
        if (json.has("documents") || json.has("fields")) {
            return fromFirestore(json);
        }

        // If wrapped in "wildfire": { ... }
        JSONObject root = json.has("wildfire") ? json.optJSONObject("wildfire") : json;
        if (root == null) return data;

        data.existsInFirebase = true;

        // Check manual override flag
        JSONObject manualObj = root.optJSONObject("manualOverride");
        if (manualObj != null) {
            String state = manualObj.optString("state", "");
            boolean active = manualObj.optBoolean("active", false);
            if ("SAFE".equalsIgnoreCase(state) || "NORMAL".equalsIgnoreCase(state) || (!active && manualObj.has("active"))) {
                data.manualSafeOverride = true;
                data.manualOverrideActive = false;
            } else if ("HIGH".equalsIgnoreCase(state) || "FIRE".equalsIgnoreCase(state) || active) {
                data.manualOverrideActive = true;
                data.manualSafeOverride = false;
            }
        } else if (root.has("manualOverride") && root.opt("manualOverride") instanceof Boolean) {
            boolean active = root.optBoolean("manualOverride", false);
            data.manualOverrideActive = active;
            data.manualSafeOverride = !active;
        }

        // Parse nodes
        JSONObject nodesObj = root.optJSONObject("nodes");
        if (nodesObj != null) {
            Iterator<String> it = nodesObj.keys();
            while (it.hasNext()) {
                String key = it.next();
                JSONObject nodeJson = nodesObj.optJSONObject(key);
                if (nodeJson != null) {
                    WildfireNode node = WildfireNode.fromJson(key, nodeJson);
                    if (node != null) {
                        data.nodes.put(node.getNodeId(), node);
                    }
                }
            }
        }

        // Parse incidents
        JSONObject incObj = root.optJSONObject("incidents");
        if (incObj != null) {
            Iterator<String> it = incObj.keys();
            while (it.hasNext()) {
                String key = it.next();
                JSONObject incJson = incObj.optJSONObject(key);
                if (incJson != null) {
                    WildfireIncident inc = WildfireIncident.fromJson(key, incJson);
                    if (inc != null) {
                        data.incidents.put(inc.getIncidentId(), inc);
                    }
                }
            }
        }

        // Parse affected zones
        JSONObject zonesObj = root.optJSONObject("affectedZones");
        if (zonesObj != null) {
            Iterator<String> it = zonesObj.keys();
            while (it.hasNext()) {
                String key = it.next();
                JSONObject zoneJson = zonesObj.optJSONObject(key);
                if (zoneJson != null) {
                    WildfireAffectedZone zone = WildfireAffectedZone.fromJson(key, zoneJson);
                    if (zone != null) {
                        data.affectedZones.put(zone.getZoneId(), zone);
                    }
                }
            }
        }

        // Parse predictions
        JSONObject predObj = root.optJSONObject("predictions");
        if (predObj != null) {
            Iterator<String> it = predObj.keys();
            while (it.hasNext()) {
                String key = it.next();
                JSONObject predJson = predObj.optJSONObject(key);
                if (predJson != null) {
                    WildfirePrediction pred = WildfirePrediction.fromJson(key, predJson);
                    if (pred != null) {
                        data.predictions.put(pred.getIncidentId(), pred);
                    }
                }
            }
        }

        // Parse gateways
        JSONObject gwObj = root.optJSONObject("gateways");
        if (gwObj != null) {
            Iterator<String> it = gwObj.keys();
            while (it.hasNext()) {
                String key = it.next();
                JSONObject gwJson = gwObj.optJSONObject(key);
                if (gwJson != null) {
                    WildfireGateway gw = WildfireGateway.fromJson(key, gwJson);
                    if (gw != null) {
                        data.gateways.put(gw.getGatewayId(), gw);
                    }
                }
            }
        }

        if (data.manualOverrideActive && data.incidents.isEmpty()) {
            data.synthesizeActiveFireIncident();
        }

        return data;
    }

    /**
     * Checks if there is an active confirmed wildfire:
     * - Manual override active
     * - Node has status == "FIRE_CONFIRMED", "EXTREME", or dual optical sensors active
     * - Or active incident exists
     */
    public boolean hasActiveFire() {
        if (manualSafeOverride) return false;
        if (manualOverrideActive) return true;

        for (WildfireNode node : nodes.values()) {
            if (node.isFireConfirmed()) {
                return true;
            }
        }

        for (WildfireIncident inc : incidents.values()) {
            if (inc.isActive()) {
                WildfireNode srcNode = nodes.get(inc.getNodeId());
                if (srcNode == null || !srcNode.isNormal()) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if any node is in HIGH risk state:
     * - Smoke sensor reading is high (mq == 0 or mq > 50)
     * - Temperature reading is high (>= 35.0°C)
     * - Status is "HIGH" or "SUSPICIOUS"
     */
    public boolean hasHighRisk() {
        if (manualSafeOverride) return false;
        if (hasActiveFire()) return false;
        for (WildfireNode node : nodes.values()) {
            if (node.isHighRisk()) return true;
        }
        return false;
    }

    /**
     * Checks for suspicious or high risk activity
     */
    public boolean hasSuspiciousActivity() {
        if (manualSafeOverride) return false;
        return hasHighRisk();
    }

    /**
     * Creates baseline data in Normal State (WF-001 with mq: 1, flame: 1, temp: 28.5)
     */
    public static WildfireData createDefaultNormalState() {
        WildfireData data = new WildfireData();
        try {
            JSONObject json = new JSONObject();
            json.put("nodeId", "WF-001");
            json.put("name", "Forest Node 001");
            json.put("status", "NORMAL");
            json.put("online", true);

            JSONObject sensors = new JSONObject();
            sensors.put("mq", 1);
            sensors.put("flame", 1);
            sensors.put("temperature", 28.5);
            sensors.put("humidity", 62.4);
            json.put("sensors", sensors);

            JSONObject fireDet = new JSONObject();
            fireDet.put("confirmationCount", 0);
            fireDet.put("threshold", 3);
            fireDet.put("confidence", 0.0);
            json.put("fireDetection", fireDet);

            JSONObject loc = new JSONObject();
            com.diplomates.firesafe.data.repository.FireSafeRepository repo = com.diplomates.firesafe.data.repository.FireSafeRepository.getInstanceOrNull();
            double defLat = (repo != null ? repo.getCurrentLatitude() : 18.4695) + 0.0055;
            double defLng = (repo != null ? repo.getCurrentLongitude() : 73.8640) + 0.0045;
            loc.put("latitude", defLat);
            loc.put("longitude", defLng);
            json.put("location", loc);

            JSONObject net = new JSONObject();
            net.put("gatewayId", "GW-001");
            json.put("network", net);

            WildfireNode parsed = WildfireNode.fromJson("WF-001", json);
            if (parsed != null) data.nodes.put("WF-001", parsed);

            WildfireGateway gw = new WildfireGateway();
            JSONObject gwJson = new JSONObject();
            gwJson.put("gatewayId", "GW-001");
            gwJson.put("name", "Main Gateway");
            gwJson.put("online", true);
            JSONObject gwLoc = new JSONObject();
            gwLoc.put("latitude", 18.5204);
            gwLoc.put("longitude", 73.8567);
            gwJson.put("location", gwLoc);
            JSONObject gwNet = new JSONObject();
            gwNet.put("connectedNodes", 3);
            gwJson.put("network", gwNet);

            WildfireGateway parsedGw = WildfireGateway.fromJson("GW-001", gwJson);
            if (parsedGw != null) data.gateways.put("GW-001", parsedGw);
        } catch (Exception ignored) {}
        return data;
    }

    public List<WildfireNode> getActiveFireNodes() {
        List<WildfireNode> list = new ArrayList<>();
        for (WildfireNode node : nodes.values()) {
            if (node.isFireConfirmed()) list.add(node);
        }
        return list;
    }

    public List<WildfireNode> getHighRiskNodes() {
        List<WildfireNode> list = new ArrayList<>();
        for (WildfireNode node : nodes.values()) {
            if (node.isHighRisk()) list.add(node);
        }
        return list;
    }

    public List<WildfireNode> getSuspiciousNodes() {
        return getHighRiskNodes();
    }

    public WildfireIncident getPrimaryActiveIncident() {
        for (WildfireIncident inc : incidents.values()) {
            if (inc.isActive()) return inc;
        }
        return null;
    }

    public WildfireAffectedZone getPrimaryAffectedZone() {
        if (!affectedZones.isEmpty()) {
            return affectedZones.values().iterator().next();
        }
        return null;
    }

    public WildfirePrediction getPrimaryPrediction() {
        if (!predictions.isEmpty()) {
            return predictions.values().iterator().next();
        }
        return null;
    }

    /**
     * Synthesizes incident, prediction, and affectedZone metadata
     * grounded in real node telemetry if available.
     */
    public void synthesizeActiveFireIncident() {
        try {
            WildfireNode primaryNode = null;
            if (!getActiveFireNodes().isEmpty()) {
                primaryNode = getActiveFireNodes().get(0);
            } else if (!getHighRiskNodes().isEmpty()) {
                primaryNode = getHighRiskNodes().get(0);
            } else if (!nodes.isEmpty()) {
                primaryNode = nodes.values().iterator().next();
            }

            com.diplomates.firesafe.data.repository.FireSafeRepository repo = com.diplomates.firesafe.data.repository.FireSafeRepository.getInstanceOrNull();
            double userLat = repo != null ? repo.getCurrentLatitude() : 18.4695;
            double userLng = repo != null ? repo.getCurrentLongitude() : 73.8640;
            double nodeLat = (primaryNode != null && primaryNode.getLatitude() != 0 && Math.abs(primaryNode.getLatitude() - 18.5204) >= 0.001)
                    ? primaryNode.getLatitude() : (userLat + 0.0055);
            double nodeLng = (primaryNode != null && primaryNode.getLongitude() != 0 && Math.abs(primaryNode.getLongitude() - 73.8567) >= 0.001)
                    ? primaryNode.getLongitude() : (userLng + 0.0045);
            String nodeId = primaryNode != null ? primaryNode.getNodeId() : "WF-001";
            double nodeTemp = primaryNode != null ? primaryNode.getTemperature() : 43.8;
            double nodeConf = primaryNode != null && primaryNode.getConfidence() > 0 ? primaryNode.getConfidence() : 0.95;

            if (!nodes.containsKey(nodeId)) {
                JSONObject json = new JSONObject();
                json.put("nodeId", nodeId);
                json.put("name", "Forest Node " + nodeId);
                json.put("status", hasActiveFire() ? "FIRE_CONFIRMED" : "HIGH");
                json.put("online", true);

                JSONObject sensors = new JSONObject();
                sensors.put("mq", 0);
                sensors.put("flame", hasActiveFire() ? 0 : 1);
                sensors.put("temperature", nodeTemp);
                sensors.put("humidity", 24.2);
                json.put("sensors", sensors);

                JSONObject fireDet = new JSONObject();
                fireDet.put("confirmationCount", 3);
                fireDet.put("threshold", 3);
                fireDet.put("confidence", nodeConf);
                fireDet.put("lastDetection", System.currentTimeMillis());
                json.put("fireDetection", fireDet);

                JSONObject loc = new JSONObject();
                loc.put("latitude", nodeLat);
                loc.put("longitude", nodeLng);
                json.put("location", loc);

                JSONObject net = new JSONObject();
                net.put("gatewayId", "GW-001");
                json.put("network", net);

                WildfireNode wn = WildfireNode.fromJson(nodeId, json);
                if (wn != null) nodes.put(nodeId, wn);
            }

            if (incidents.isEmpty()) {
                JSONObject incJson = new JSONObject();
                incJson.put("incidentId", "INC-001");
                incJson.put("status", "ACTIVE");
                incJson.put("severity", hasActiveFire() ? "CRITICAL" : "HIGH");
                JSONObject src = new JSONObject();
                src.put("nodeId", nodeId);
                incJson.put("source", src);
                JSONObject incLoc = new JSONObject();
                incLoc.put("latitude", nodeLat);
                incLoc.put("longitude", nodeLng);
                incJson.put("location", incLoc);
                JSONObject det = new JSONObject();
                det.put("mq", primaryNode != null ? primaryNode.getMq() : 0);
                det.put("flame", primaryNode != null ? primaryNode.getFlame() : 0);
                det.put("confirmationCount", 3);
                det.put("confidence", nodeConf);
                incJson.put("detection", det);

                WildfireIncident wi = WildfireIncident.fromJson("INC-001", incJson);
                if (wi != null) incidents.put("INC-001", wi);
            }

            if (predictions.isEmpty()) {
                JSONObject predJson = new JSONObject();
                predJson.put("incidentId", "INC-001");
                predJson.put("predictedAreaKm2", hasActiveFire() ? 12.4 : 6.2);
                predJson.put("direction", "NORTH_EAST");
                predJson.put("riskLevel", hasActiveFire() ? "EXTREME" : "HIGH");
                WildfirePrediction wp = WildfirePrediction.fromJson("PRED-001", predJson);
                if (wp != null) predictions.put("PRED-001", wp);
            }

            if (affectedZones.isEmpty()) {
                JSONObject zoneJson = new JSONObject();
                zoneJson.put("zoneId", "ZONE-001");
                zoneJson.put("incidentId", "INC-001");
                zoneJson.put("riskLevel", hasActiveFire() ? "EXTREME" : "HIGH");
                zoneJson.put("centerLatitude", nodeLat);
                zoneJson.put("centerLongitude", nodeLng);
                zoneJson.put("radiusKm", hasActiveFire() ? 1.5 : 1.2);
                WildfireAffectedZone wz = WildfireAffectedZone.fromJson("ZONE-001", zoneJson);
                if (wz != null) affectedZones.put("ZONE-001", wz);
            }
        } catch (Exception ignored) {}
    }

    public boolean isManualOverrideActive() { return manualOverrideActive; }
    public void setManualOverrideActive(boolean active) { this.manualOverrideActive = active; }
    public Map<String, WildfireNode> getNodes() { return nodes; }
    public Map<String, WildfireIncident> getIncidents() { return incidents; }
    public Map<String, WildfireAffectedZone> getAffectedZones() { return affectedZones; }
    public Map<String, WildfirePrediction> getPredictions() { return predictions; }
    public Map<String, WildfireGateway> getGateways() { return gateways; }
    public boolean isExistsInFirebase() { return existsInFirebase; }
}
