package com.diplomates.firesafe.data.model;

import org.json.JSONObject;

/**
 * Represents a LoRa/Mesh Gateway from Firebase Realtime Database.
 */
public class WildfireGateway {
    private String gatewayId;
    private String name;
    private boolean online;
    private double latitude;
    private double longitude;
    private int connectedNodes;

    public WildfireGateway() {}

    public static WildfireGateway fromJson(String key, JSONObject json) {
        if (json == null) return null;
        WildfireGateway gw = new WildfireGateway();
        gw.gatewayId = json.optString("gatewayId", key);
        gw.name = json.optString("name", "Gateway " + key);
        gw.online = json.optBoolean("online", true);

        JSONObject loc = json.optJSONObject("location");
        if (loc != null) {
            gw.latitude = loc.optDouble("latitude", 18.5204);
            gw.longitude = loc.optDouble("longitude", 73.8567);
        }

        JSONObject net = json.optJSONObject("network");
        if (net != null) {
            gw.connectedNodes = net.optInt("connectedNodes", 1);
        }

        return gw;
    }

    public String getGatewayId() { return gatewayId; }
    public String getName() { return name; }
    public boolean isOnline() { return online; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public int getConnectedNodes() { return connectedNodes; }
}
