package com.diplomates.firesafe.data.model;

import java.util.List;

public class SafeShelter {
    private final String id;
    private final String name;
    private final String address;
    private final double distanceKm;
    private final int travelTimeMinutes;
    private final boolean isOpen;
    private final int availableCapacity;
    private final int totalCapacity;
    private final String contactPhone;
    private final List<String> amenities;
    private final double latitude;
    private final double longitude;

    public SafeShelter(String id, String name, String address, double distanceKm,
                       int travelTimeMinutes, boolean isOpen, int availableCapacity,
                       int totalCapacity, String contactPhone, List<String> amenities,
                       double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.distanceKm = distanceKm;
        this.travelTimeMinutes = travelTimeMinutes;
        this.isOpen = isOpen;
        this.availableCapacity = availableCapacity;
        this.totalCapacity = totalCapacity;
        this.contactPhone = contactPhone;
        this.amenities = amenities;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public double getDistanceKm() { return distanceKm; }
    public int getTravelTimeMinutes() { return travelTimeMinutes; }
    public boolean isOpen() { return isOpen; }
    public int getAvailableCapacity() { return availableCapacity; }
    public int getTotalCapacity() { return totalCapacity; }
    public String getContactPhone() { return contactPhone; }
    public List<String> getAmenities() { return amenities; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
