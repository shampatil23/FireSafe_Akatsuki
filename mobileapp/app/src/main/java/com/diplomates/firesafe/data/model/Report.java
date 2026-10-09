package com.diplomates.firesafe.data.model;

public class Report {
    private String id;
    private String type;
    private String description;
    private String time;
    private String location;
    private String imageUrl;
    private String status;

    public Report() {}

    public Report(String id, String type, String description, String time, String location, String imageUrl, String status) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.time = time;
        this.location = location;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public String getDescription() { return description; }
    public String getTime() { return time; }
    public String getLocation() { return location; }
    public String getImageUrl() { return imageUrl; }
    public String getStatus() { return status; }
}
