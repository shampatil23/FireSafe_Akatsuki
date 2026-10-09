package com.diplomates.firesafe.data.model;

public class ControlRoomMessage {
    public enum Type {
        CITIZEN,
        MANAGER,
        SYSTEM
    }

    private final String id;
    private final String text;
    private final Type type;
    private final String senderName;
    private final String timestamp;
    private final boolean isRead;
    private final String ticketId;

    public ControlRoomMessage(String id, String text, Type type, String senderName,
                              String timestamp, boolean isRead, String ticketId) {
        this.id = id;
        this.text = text;
        this.type = type;
        this.senderName = senderName;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.ticketId = ticketId;
    }

    public String getId() { return id; }
    public String getText() { return text; }
    public Type getType() { return type; }
    public String getSenderName() { return senderName; }
    public String getTimestamp() { return timestamp; }
    public boolean isRead() { return isRead; }
    public String getTicketId() { return ticketId; }
}
