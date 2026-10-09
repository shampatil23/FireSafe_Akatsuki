package com.diplomates.firesafe.data.model;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

/**
 * Model representing an emergency contact saved by the citizen in their profile.
 */
public class EmergencyContact implements Serializable {
    private String id;
    private String name;
    private String phoneNumber;
    private String relationship;
    private boolean isPrimary;

    public EmergencyContact(String id, String name, String phoneNumber, String relationship, boolean isPrimary) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.relationship = relationship;
        this.isPrimary = isPrimary;
    }

    public EmergencyContact(String id, String name, String phoneNumber, String relationship) {
        this(id, name, phoneNumber, relationship, false);
    }

    public String getPhone() {
        return phoneNumber;
    }

    public void setPhone(String phone) {
        this.phoneNumber = phone;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public JSONObject toJsonObject() {
        JSONObject json = new JSONObject();
        try {
            json.put("id", id);
            json.put("name", name);
            json.put("phoneNumber", phoneNumber);
            json.put("relationship", relationship);
            json.put("isPrimary", isPrimary);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return json;
    }

    public static EmergencyContact fromJsonObject(JSONObject json) {
        String id = json.optString("id", String.valueOf(System.currentTimeMillis()));
        String name = json.optString("name", "Emergency Contact");
        String phone = json.optString("phoneNumber", "");
        String rel = json.optString("relationship", "Family");
        boolean isPrimary = json.optBoolean("isPrimary", false);
        return new EmergencyContact(id, name, phone, rel, isPrimary);
    }
}
