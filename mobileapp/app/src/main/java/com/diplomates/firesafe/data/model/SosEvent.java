package com.diplomates.firesafe.data.model;

public class SosEvent {
    public enum TransmissionStatus {
        SENDING("Sending..."),
        SENT("Sent via AI Emergency Gateway"),
        SMS_FALLBACK("Dispatched via SMS Fallback"),
        OFFLINE_RELAY("Queued for Offline Mesh Relay"),
        FAILED("Unable to send - Call 112");

        private final String displayText;
        TransmissionStatus(String displayText) { this.displayText = displayText; }
        public String getDisplayText() { return displayText; }
    }

    private final String id;
    private final String timestamp;
    private double latitude;
    private double longitude;
    private String address;
    private final int batteryPercent;
    private TransmissionStatus status;
    private String dispatchId;

    private String severity = "CRITICAL";
    private String riskLevel = "EXTREME";
    private String phone = "+91 112";
    private String deviceInfo = "Android Citizen App";
    private String emergencyType = "WILDFIRE_TRAPPED";

    public SosEvent(String id, String timestamp, double latitude, double longitude,
                    String address, int batteryPercent, TransmissionStatus status) {
        this.id = id;
        this.timestamp = timestamp;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.batteryPercent = batteryPercent;
        this.status = status;
        this.dispatchId = id;
    }

    public String getId() { return id; }
    public String getTimestamp() { return timestamp; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLocationName() { return address; }
    public int getBatteryPercent() { return batteryPercent; }
    public TransmissionStatus getStatus() { return status; }
    public void setStatus(TransmissionStatus status) { this.status = status; }
    public String getDispatchId() { return dispatchId != null ? dispatchId : id; }
    public void setDispatchId(String dispatchId) { this.dispatchId = dispatchId; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    private String audioUrl = "";
    private boolean isSmsDispatched = false;

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public String getCloudinaryUrl() { return audioUrl; }
    public void setCloudinaryUrl(String url) { this.audioUrl = url; }
    public String getEmergencyType() { return "FOREST_FIRE_SOS"; }
    public boolean isSmsDispatched() { return isSmsDispatched; }
    public void setSmsDispatched(boolean smsDispatched) { isSmsDispatched = smsDispatched; }

    public org.json.JSONObject toRealtimeJson() {
        org.json.JSONObject json = new org.json.JSONObject();
        try {
            json.put("id", getId());
            json.put("dispatch_id", getDispatchId());

            java.text.SimpleDateFormat dateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US);
            java.text.SimpleDateFormat timeFormat = new java.text.SimpleDateFormat("hh:mm:ss a", java.util.Locale.US);
            java.text.SimpleDateFormat humanTimeFormat = new java.text.SimpleDateFormat("hh:mm a", java.util.Locale.US);
            java.text.SimpleDateFormat isoFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", java.util.Locale.US);
            java.util.Date now = new java.util.Date();

            json.put("date", dateFormat.format(now));
            json.put("time", timeFormat.format(now));
            json.put("alert_date", dateFormat.format(now));
            json.put("alert_time", timeFormat.format(now));
            json.put("iso_timestamp", isoFormat.format(now));
            json.put("formatted_datetime", dateFormat.format(now) + " " + timeFormat.format(now));
            json.put("timestamp", getTimestamp() != null ? getTimestamp() : humanTimeFormat.format(now));
            json.put("epoch_millis", System.currentTimeMillis());
            json.put("latitude", getLatitude());
            json.put("longitude", getLongitude());
            json.put("lat", getLatitude());
            json.put("lng", getLongitude());
            json.put("location_name", getAddress());
            json.put("location", getAddress());
            json.put("battery_percent", getBatteryPercent());
            json.put("battery", getBatteryPercent());
            json.put("severity", getSeverity());
            json.put("risk_level", getRiskLevel());
            json.put("status", getStatus() != null ? getStatus().name() : "ACTIVE_SOS");
            json.put("phone", getPhone());
            json.put("device_info", getDeviceInfo());
            json.put("emergency_type", getEmergencyType());
            json.put("audio_url", audioUrl);
            json.put("cloudinary_url", audioUrl);
            json.put("sms_dispatched", isSmsDispatched);
            json.put("navigation_link", String.format(java.util.Locale.US,
                    "https://www.google.com/maps/dir/?api=1&destination=%.6f,%.6f", getLatitude(), getLongitude()));
            json.put("map_link", String.format(java.util.Locale.US,
                    "https://www.google.com/maps/search/?api=1&query=%.6f,%.6f", getLatitude(), getLongitude()));
        } catch (org.json.JSONException ignored) {}
        return json;
    }
}
