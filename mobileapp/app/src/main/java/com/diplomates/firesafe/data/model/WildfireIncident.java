package com.diplomates.firesafe.data.model;

import org.json.JSONObject;

/**
 * Represents a confirmed or active wildfire incident from Firebase Realtime Database.
 */
public class WildfireIncident {
    private String incidentId;
    private String status; // "ACTIVE", "RESOLVED"
    private String severity; // "HIGH", "CRITICAL"
    private String nodeId;
    private double latitude;
    private double longitude;
    private int mq;
    private int flame;
    private int confirmationCount;
    private double confidence;

    public WildfireIncident() {}

    public static WildfireIncident fromJson(String key, JSONObject json) {
        if (json == null) return null;
        WildfireIncident incident = new WildfireIncident();
        incident.incidentId = json.optString("incidentId", key);
        incident.status = json.optString("status", "ACTIVE");
        incident.severity = json.optString("severity", "HIGH");

        JSONObject source = json.optJSONObject("source");
        if (source != null) {
            incident.nodeId = source.optString("nodeId", "WF-001");
        }

        JSONObject loc = json.optJSONObject("location");
        if (loc != null) {
            incident.latitude = loc.optDouble("latitude", 18.5204);
            incident.longitude = loc.optDouble("longitude", 73.8567);
        }

        JSONObject det = json.optJSONObject("detection");
        if (det != null) {
            incident.mq = det.optInt("mq", 0);
            incident.flame = det.optInt("flame", 0);
            incident.confirmationCount = det.optInt("confirmationCount", 3);
            incident.confidence = det.optDouble("confidence", 0.95);
        }

        return incident;
    }

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }

    public String getIncidentId() { return incidentId; }
    public String getStatus() { return status; }
    public String getSeverity() { return severity; }
    public String getNodeId() { return nodeId; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public int getMq() { return mq; }
    public int getFlame() { return flame; }
    public int getConfirmationCount() { return confirmationCount; }
    public double getConfidence() { return confidence; }
}
