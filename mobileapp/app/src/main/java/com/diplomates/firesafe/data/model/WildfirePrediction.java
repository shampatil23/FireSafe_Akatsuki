package com.diplomates.firesafe.data.model;

import org.json.JSONObject;

/**
 * Represents AI spread & risk predictions from Firebase Realtime Database.
 */
public class WildfirePrediction {
    private String incidentId;
    private String model;
    private String predictionHorizon;
    private double riskScore;
    private String riskLevel;
    private double predictedAreaKm2;
    private String direction;

    public WildfirePrediction() {}

    public static WildfirePrediction fromJson(String key, JSONObject json) {
        if (json == null) return null;
        WildfirePrediction pred = new WildfirePrediction();
        pred.incidentId = key;
        pred.model = json.optString("model", "UNET3D");
        pred.predictionHorizon = json.optString("predictionHorizon", "10_DAYS");

        JSONObject risk = json.optJSONObject("risk");
        if (risk != null) {
            pred.riskScore = risk.optDouble("score", 0.0);
            pred.riskLevel = risk.optString("level", "NORMAL");
        }

        JSONObject spread = json.optJSONObject("spread");
        if (spread != null) {
            pred.predictedAreaKm2 = spread.optDouble("predictedAreaKm2", 0.0);
            pred.direction = spread.optString("direction", "STABLE");
        }

        return pred;
    }

    public String getIncidentId() { return incidentId; }
    public String getModel() { return model; }
    public String getPredictionHorizon() { return predictionHorizon; }
    public double getRiskScore() { return riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public double getPredictedAreaKm2() { return predictedAreaKm2; }
    public String getDirection() { return direction; }
}
