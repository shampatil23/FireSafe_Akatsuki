package com.diplomates.firesafe.data.model;

public class FireAlert {
    public enum TimelineBucket {
        ACTIVE_NOW("ACTIVE NOW"),
        PAST_1_HOUR("Past 1 hour"),
        TODAY("Today"),
        EARLIER("Earlier");

        private final String label;
        TimelineBucket(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private final String id;
    private final String title;
    private final String locationName;
    private FireRiskStatus severity;
    private final double distanceKm;
    private final String timeDetected;
    private final String direction;
    private String estimatedSpread;
    private final String recommendedAction;
    private final double latitude;
    private final double longitude;
    private final boolean isEvacuateNow;
    private final TimelineBucket timelineBucket;

    public FireAlert(String id, String title, String locationName, FireRiskStatus severity,
                     double distanceKm, String timeDetected, String direction,
                     String estimatedSpread, String recommendedAction,
                     double latitude, double longitude, boolean isEvacuateNow,
                     TimelineBucket timelineBucket) {
        this.id = id;
        this.title = title;
        this.locationName = locationName;
        this.severity = severity;
        this.distanceKm = distanceKm;
        this.timeDetected = timeDetected;
        this.direction = direction;
        this.estimatedSpread = estimatedSpread;
        this.recommendedAction = recommendedAction;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isEvacuateNow = isEvacuateNow;
        this.timelineBucket = timelineBucket;
    }

    private boolean isRead = false;

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getLocationName() { return locationName; }
    public FireRiskStatus getSeverity() { return severity; }
    public double getDistanceKm() { return distanceKm; }
    public String getTimeDetected() { return timeDetected; }
    public String getDirection() { return direction; }
    public String getEstimatedSpread() { return estimatedSpread; }
    public String getRecommendedAction() { return recommendedAction; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public boolean isEvacuateNow() { return isEvacuateNow; }
    public TimelineBucket getTimelineBucket() { return timelineBucket; }
    public void setSeverity(FireRiskStatus severity) { this.severity = severity; }
    public void setEstimatedSpread(String estimatedSpread) { this.estimatedSpread = estimatedSpread; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { this.isRead = read; }
}
