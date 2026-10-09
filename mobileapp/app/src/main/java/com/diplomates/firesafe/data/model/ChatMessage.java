package com.diplomates.firesafe.data.model;

import java.util.List;

public class ChatMessage {
    private final String id;
    private final String text;
    private final boolean isFromUser;
    private final String timestamp;
    private final List<String> suggestionChips;
    private final boolean isEmergencyGuidance;

    public ChatMessage(String id, String text, boolean isFromUser, String timestamp,
                       List<String> suggestionChips, boolean isEmergencyGuidance) {
        this.id = id;
        this.text = text;
        this.isFromUser = isFromUser;
        this.timestamp = timestamp;
        this.suggestionChips = suggestionChips;
        this.isEmergencyGuidance = isEmergencyGuidance;
    }

    public String getId() { return id; }
    public String getText() { return text; }
    public boolean isFromUser() { return isFromUser; }
    public String getTimestamp() { return timestamp; }
    public List<String> getSuggestionChips() { return suggestionChips; }
    public boolean isEmergencyGuidance() { return isEmergencyGuidance; }
}
