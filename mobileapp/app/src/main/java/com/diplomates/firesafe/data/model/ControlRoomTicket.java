package com.diplomates.firesafe.data.model;

public class ControlRoomTicket {
    private final String ticketId;
    private final String source; // "EMERGENCY_SOS" or "FIRE_ALERT"
    private final String severity; // "CRITICAL", "HIGH", "WARNING"
    private final double latitude;
    private final double longitude;
    private final String locationName;
    private final String timestamp;
    private final String assignedManager;
    private final String description;
    private boolean isActive;

    public ControlRoomTicket(String ticketId, String source, String severity,
                             double latitude, double longitude, String locationName,
                             String timestamp, String assignedManager, String description) {
        this.ticketId = ticketId;
        this.source = source;
        this.severity = severity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationName = locationName;
        this.timestamp = timestamp;
        this.assignedManager = assignedManager;
        this.description = description;
        this.isActive = true;
    }

    public String getTicketId() { return ticketId; }
    public String getSource() { return source; }
    public String getSeverity() { return severity; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public String getLocationName() { return locationName; }
    public String getTimestamp() { return timestamp; }
    public String getAssignedManager() { return assignedManager; }
    public String getDescription() { return description; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
