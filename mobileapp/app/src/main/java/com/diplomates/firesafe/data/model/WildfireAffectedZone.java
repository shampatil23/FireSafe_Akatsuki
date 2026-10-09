package com.diplomates.firesafe.data.model;

import org.json.JSONObject;

/**
 * Represents an affected wildfire hazard zone from Firebase Realtime Database.
 */
public class WildfireAffectedZone {
    private String zoneId;
    private String incidentId;
    private String riskLevel; // "HIGH", "CRITICAL"
    private double centerLatitude;
    private double centerLongitude;
    private double radiusKm;
    private int estimatedPopulation;

    public WildfireAffectedZone() {}

    public static WildfireAffectedZone fromJson(String key, JSONObject json) {
        if (json == null) return null;
        WildfireAffectedZone zone = new WildfireAffectedZone();
        zone.zoneId = json.optString("zoneId", key);
        zone.incidentId = json.optString("incidentId", "");
        zone.riskLevel = json.optString("riskLevel", "HIGH");

        JSONObject center = json.optJSONObject("center");
        if (center != null) {
            zone.centerLatitude = center.optDouble("latitude", 18.5250);
            zone.centerLongitude = center.optDouble("longitude", 73.8620);
        }

        zone.radiusKm = json.optDouble("radiusKm", 3.5);

        JSONObject pop = json.optJSONObject("population");
        if (pop != null) {
            zone.estimatedPopulation = pop.optInt("estimated", 0);
        }

        return zone;
    }

    public String getZoneId() { return zoneId; }
    public String getIncidentId() { return incidentId; }
    public String getRiskLevel() { return riskLevel; }
    public double getCenterLatitude() { return centerLatitude; }
    public double getCenterLongitude() { return centerLongitude; }
    public double getRadiusKm() { return radiusKm; }
    public int getEstimatedPopulation() { return estimatedPopulation; }
}
