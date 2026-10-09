package com.diplomates.firesafe.data.model;

import org.json.JSONObject;

/**
 * Represents an IoT Wildfire Detection Sensor Node (e.g. WF-001)
 * with digital MQ smoke sensor, digital flame sensor, temperature, and humidity telemetry.
 * Supports both standard JSON and Firebase Cloud Firestore document field structures.
 */
public class WildfireNode {
    private String nodeId;
    private String name;
    private String status; // "NORMAL", "SUSPICIOUS", "HIGH", "FIRE_CONFIRMED"
    private boolean online;
    private int mq; // Digital: 1 = normal, 0 = smoke detected (active low). Analog: > 50 = smoke.
    private int flame; // Digital: 1 = normal, 0 = flame detected (active low).
    private double temperature; // Normal: ~28-29°C. High: >= 35°C. Extreme: >= 40°C.
    private double humidity;
    private int confirmationCount;
    private int threshold = 3;
    private double confidence;
    private Long lastDetection;
    private double latitude = 18.5204;
    private double longitude = 73.8567;
    private String gatewayId;

    public WildfireNode() {}

    /**
     * Parses from standard flat JSON (e.g. RTDB format or synthetic data)
     */
    public static WildfireNode fromJson(String key, JSONObject json) {
        if (json == null) return null;
        if (json.has("fields")) {
            return fromFirestoreDoc(key, json);
        }

        WildfireNode node = new WildfireNode();
        node.nodeId = json.optString("nodeId", key);
        node.name = json.optString("name", "Forest Node " + key);
        node.status = json.optString("status", "NORMAL");
        node.online = json.optBoolean("online", true);

        JSONObject sensors = json.optJSONObject("sensors");
        if (sensors != null) {
            node.mq = sensors.optInt("mq", 1);
            node.flame = sensors.optInt("flame", 1);
            node.temperature = sensors.optDouble("temperature", 28.5);
            node.humidity = sensors.optDouble("humidity", 60.0);
        } else {
            node.mq = 1;
            node.flame = 1;
            node.temperature = 28.5;
            node.humidity = 60.0;
        }

        JSONObject fireDet = json.optJSONObject("fireDetection");
        if (fireDet != null) {
            node.confirmationCount = fireDet.optInt("confirmationCount", 0);
            node.threshold = fireDet.optInt("threshold", 3);
            node.confidence = fireDet.optDouble("confidence", 0.0);
            if (!fireDet.isNull("lastDetection")) {
                node.lastDetection = fireDet.optLong("lastDetection");
            }
        }

        JSONObject loc = json.optJSONObject("location");
        com.diplomates.firesafe.data.repository.FireSafeRepository repo = com.diplomates.firesafe.data.repository.FireSafeRepository.getInstanceOrNull();
        double defLat = (repo != null ? repo.getCurrentLatitude() : 18.4695) + 0.0055;
        double defLng = (repo != null ? repo.getCurrentLongitude() : 73.8640) + 0.0045;
        if (loc != null) {
            double parsedLat = loc.optDouble("latitude", defLat);
            double parsedLng = loc.optDouble("longitude", defLng);
            if (parsedLat == 0 || (Math.abs(parsedLat - 18.5204) < 0.001 && Math.abs(parsedLng - 73.8567) < 0.001)) {
                node.latitude = defLat;
                node.longitude = defLng;
            } else {
                node.latitude = parsedLat;
                node.longitude = parsedLng;
            }
        } else {
            node.latitude = defLat;
            node.longitude = defLng;
        }

        JSONObject net = json.optJSONObject("network");
        if (net != null) {
            node.gatewayId = net.optString("gatewayId", "GW-001");
        }

        return node;
    }

    /**
     * Parses directly from a Firebase Cloud Firestore Document:
     * e.g. { "name": "projects/firesafe-48056/.../nodes/WF-001", "fields": { ... } }
     */
    public static WildfireNode fromFirestoreDoc(String defaultKey, JSONObject doc) {
        if (doc == null) return null;
        JSONObject fields = doc.optJSONObject("fields");
        if (fields == null) {
            return fromJson(defaultKey, doc);
        }

        WildfireNode node = new WildfireNode();
        String docPath = doc.optString("name", "");
        String derivedKey = defaultKey;
        if (derivedKey == null || derivedKey.isEmpty()) {
            if (docPath.contains("/")) {
                derivedKey = docPath.substring(docPath.lastIndexOf('/') + 1);
            } else {
                derivedKey = "WF-001";
            }
        }

        node.nodeId = getFsString(fields, "nodeId", derivedKey);
        node.name = getFsString(fields, "name", "Forest Node " + derivedKey);
        node.status = getFsString(fields, "status", "NORMAL");
        node.online = getFsBoolean(fields, "online", true);
        node.confidence = getFsDouble(fields, "confidence", 0.0);

        JSONObject sensorFields = getFsMapFields(fields, "sensors");
        if (sensorFields != null) {
            node.mq = getFsInt(sensorFields, "mq", 1);
            node.flame = getFsInt(sensorFields, "flame", 1);
            node.temperature = getFsDouble(sensorFields, "temperature", 28.5);
            node.humidity = getFsDouble(sensorFields, "humidity", 60.0);
        } else {
            node.mq = 1;
            node.flame = 1;
            node.temperature = 28.5;
            node.humidity = 60.0;
        }

        JSONObject fireDetFields = getFsMapFields(fields, "fireDetection");
        if (fireDetFields != null) {
            node.confirmationCount = getFsInt(fireDetFields, "confirmationCount", 0);
            node.threshold = getFsInt(fireDetFields, "threshold", 3);
            if (node.confidence == 0.0) {
                node.confidence = getFsDouble(fireDetFields, "confidence", 0.0);
            }
        }

        com.diplomates.firesafe.data.repository.FireSafeRepository repo = com.diplomates.firesafe.data.repository.FireSafeRepository.getInstanceOrNull();
        double defLat = (repo != null ? repo.getCurrentLatitude() : 18.4695) + 0.0055;
        double defLng = (repo != null ? repo.getCurrentLongitude() : 73.8640) + 0.0045;

        JSONObject locFields = getFsMapFields(fields, "location");
        if (locFields == null) {
            locFields = getFsMapFields(fields, "gps");
        }
        if (locFields != null) {
            double parsedLat = getFsDouble(locFields, "latitude", defLat);
            double parsedLng = getFsDouble(locFields, "longitude", defLng);
            if (parsedLat == 0 || (Math.abs(parsedLat - 18.5204) < 0.001 && Math.abs(parsedLng - 73.8567) < 0.001)) {
                node.latitude = defLat;
                node.longitude = defLng;
            } else {
                node.latitude = parsedLat;
                node.longitude = parsedLng;
            }
        } else {
            node.latitude = defLat;
            node.longitude = defLng;
        }

        JSONObject netFields = getFsMapFields(fields, "network");
        if (netFields != null) {
            node.gatewayId = getFsString(netFields, "gatewayId", "GW-001");
        } else {
            node.gatewayId = "GW-001";
        }

        return node;
    }

    // --- Firestore Field Type Helpers ---
    private static String getFsString(JSONObject fields, String key, String def) {
        if (fields == null) return def;
        JSONObject val = fields.optJSONObject(key);
        if (val == null) return def;
        return val.optString("stringValue", def);
    }

    private static double getFsDouble(JSONObject fields, String key, double def) {
        if (fields == null) return def;
        JSONObject val = fields.optJSONObject(key);
        if (val == null) return def;
        if (val.has("doubleValue")) return val.optDouble("doubleValue", def);
        if (val.has("integerValue")) {
            try {
                return Double.parseDouble(val.optString("integerValue", String.valueOf(def)));
            } catch (Exception ignored) {}
        }
        return def;
    }

    private static int getFsInt(JSONObject fields, String key, int def) {
        if (fields == null) return def;
        JSONObject val = fields.optJSONObject(key);
        if (val == null) return def;
        if (val.has("integerValue")) {
            try {
                return Integer.parseInt(val.optString("integerValue", String.valueOf(def)));
            } catch (Exception ignored) {}
        }
        if (val.has("doubleValue")) return (int) val.optDouble("doubleValue", def);
        return def;
    }

    private static boolean getFsBoolean(JSONObject fields, String key, boolean def) {
        if (fields == null) return def;
        JSONObject val = fields.optJSONObject(key);
        if (val == null) return def;
        return val.optBoolean("booleanValue", def);
    }

    private static JSONObject getFsMapFields(JSONObject fields, String key) {
        if (fields == null) return null;
        JSONObject val = fields.optJSONObject(key);
        if (val == null) return null;
        JSONObject mapVal = val.optJSONObject("mapValue");
        if (mapVal == null) return null;
        return mapVal.optJSONObject("fields");
    }

    // --- Threat & Sensor Reading Evaluators ---

    /**
     * Checks if smoke sensor reading is high / active:
     * - Digital active-low: 0 indicates smoke detection (as seen in Firestore console)
     * - Analog reading: > 50 indicates elevated smoke concentration
     */
    public boolean isSmokeHigh() {
        return mq == 0 || mq > 50;
    }

    public boolean isSmokeDetected() {
        return isSmokeHigh();
    }

    public boolean isFlameDetected() {
        return flame == 0;
    }

    /**
     * Checks if temperature sensor reading is high / anomalous:
     * Normal forest baseline is ~28-29.5°C. >= 35.0°C indicates an elevated heat/fire anomaly.
     */
    public boolean isTemperatureHigh() {
        return temperature >= 35.0;
    }

    /**
     * Evaluates if this node warrants a HIGH Risk threat alert:
     * When smoke sensor reading is high OR temperature sensor reading is high,
     * or when node status is explicitly set to "HIGH" or "SUSPICIOUS" in Firestore.
     */
    public boolean isHighRisk() {
        if (isFireConfirmed()) return false;
        return isSmokeHigh()
                || isTemperatureHigh()
                || "HIGH".equalsIgnoreCase(status)
                || "SUSPICIOUS".equalsIgnoreCase(status);
    }

    /**
     * Evaluates if this node warrants an EXTREME / CONFIRMED wildfire status:
     * Confirmed dual flame & smoke, or critical status, or smoke/flame with extreme heat (>= 40°C).
     */
    public boolean isFireConfirmed() {
        return "FIRE_CONFIRMED".equalsIgnoreCase(status)
                || "EXTREME".equalsIgnoreCase(status)
                || "CRITICAL".equalsIgnoreCase(status)
                || ((isSmokeHigh() || isFlameDetected()) && temperature >= 40.0)
                || (isSmokeHigh() && isFlameDetected() && confirmationCount >= 2);
    }

    public boolean isSuspicious() {
        return isHighRisk();
    }

    public boolean isNormal() {
        return !isFireConfirmed() && !isHighRisk();
    }

    public String getNodeId() { return nodeId; }
    public String getName() { return name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isOnline() { return online; }
    public int getMq() { return mq; }
    public int getFlame() { return flame; }
    public double getTemperature() { return temperature; }
    public double getHumidity() { return humidity; }
    public int getConfirmationCount() { return confirmationCount; }
    public int getThreshold() { return threshold; }
    public double getConfidence() { return confidence; }
    public Long getLastDetection() { return lastDetection; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public String getGatewayId() { return gatewayId; }
}
