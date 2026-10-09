package com.diplomates.firesafe.data.repository;

import android.os.Handler;
import android.os.Looper;

import com.diplomates.firesafe.data.api.FireSafeApiClient;
import com.diplomates.firesafe.data.model.ControlRoomMessage;
import com.diplomates.firesafe.data.model.ControlRoomTicket;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class ControlRoomManager {
    private static volatile ControlRoomManager instance;

    public interface ControlRoomListener {
        void onMessagesUpdated();
        void onTicketStateChanged(ControlRoomTicket ticket);
    }

    private final List<ControlRoomMessage> messages = new ArrayList<>();
    private final List<ControlRoomListener> listeners = new ArrayList<>();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private ControlRoomTicket activeTicket = null;

    private ControlRoomManager() {
        // Initial welcome info message
        String time = getCurrentTime();
        messages.add(new ControlRoomMessage(
                "sys_init",
                "🔒 Messages in this channel are linked directly to the Disaster Control Room Emergency Console.",
                ControlRoomMessage.Type.SYSTEM,
                "System",
                time,
                true,
                null
        ));
    }

    public static ControlRoomManager getInstance() {
        if (instance == null) {
            synchronized (ControlRoomManager.class) {
                if (instance == null) {
                    instance = new ControlRoomManager();
                }
            }
        }
        return instance;
    }

    public void addListener(ControlRoomListener listener) {
        if (listener != null && !listeners.contains(listener)) {
            listeners.add(listener);
        }
    }

    public void removeListener(ControlRoomListener listener) {
        listeners.remove(listener);
    }

    public boolean isTicketActive() {
        return activeTicket != null && activeTicket.isActive();
    }

    public ControlRoomTicket getActiveTicket() {
        return activeTicket;
    }

    public List<ControlRoomMessage> getMessages() {
        return Collections.unmodifiableList(messages);
    }

    /**
     * Activates an Emergency Ticket when the user triggers SOS.
     */
    public ControlRoomTicket activateSosTicket(double lat, double lng, String locationName, int battery) {
        String ticketId = "TKT-SOS-" + (1000 + (int)(Math.random() * 9000));
        String time = getCurrentTime();

        activeTicket = new ControlRoomTicket(
                ticketId,
                "EMERGENCY_SOS",
                "CRITICAL",
                lat,
                lng,
                locationName != null ? locationName : "Live GPS Fix",
                time,
                "Commander Sharma • Sector 4 HQ",
                "Live SOS Distress Beacon dispatched from device (" + battery + "% battery)"
        );

        // 1. System Notification in WhatsApp Chat
        String locStr = String.format(Locale.US, "%.4f° N, %.4f° E", lat, lng);
        ControlRoomMessage sysMsg = new ControlRoomMessage(
                "sys_" + System.currentTimeMillis(),
                "🚨 EMERGENCY TICKET #" + ticketId + " ACTIVATED\n\nLive SOS distress signal received from "
                        + activeTicket.getLocationName() + " (" + locStr + ").\nTelemetry and ambient distress recording dispatched to Manager.",
                ControlRoomMessage.Type.SYSTEM,
                "System",
                time,
                true,
                ticketId
        );
        messages.add(sysMsg);

        // 2. Automated Initial Response from Manager (Simulating Realtime WhatsApp Dispatch Response)
        mainHandler.postDelayed(() -> {
            String replyTime = getCurrentTime();
            ControlRoomMessage mgrMsg = new ControlRoomMessage(
                    "mgr_" + System.currentTimeMillis(),
                    "⚠️ DISASTER COMMANDER SHARMA:\nWe have received your Emergency SOS signal under Ticket #" + ticketId
                            + ". Sector 4 emergency rescue teams and fire suppression trucks are deploying toward your coordinates.\n\nPlease stay on this WhatsApp channel. Are you trapped, injured, or able to move toward open ground?",
                    ControlRoomMessage.Type.MANAGER,
                    "Commander Sharma (Sector 4 HQ)",
                    replyTime,
                    true,
                    ticketId
            );
            messages.add(mgrMsg);
            notifyMessagesUpdated();
        }, 1200);

        notifyTicketChanged();
        notifyMessagesUpdated();
        return activeTicket;
    }

    /**
     * Activates an Emergency Ticket when the user sends a Fire Alert report.
     */
    public ControlRoomTicket activateAlertTicket(String category, String severity, double lat, double lng, String locationName, String remarks) {
        String ticketId = "TKT-ALT-" + (1000 + (int)(Math.random() * 9000));
        String time = getCurrentTime();

        activeTicket = new ControlRoomTicket(
                ticketId,
                "FIRE_ALERT",
                severity,
                lat,
                lng,
                locationName != null ? locationName : "Reported Coordinates",
                time,
                "Duty Officer Verma • Sector Recon",
                category + " reported by citizen"
        );

        String locStr = String.format(Locale.US, "%.4f° N, %.4f° E", lat, lng);
        String noteStr = (remarks != null && !remarks.trim().isEmpty()) ? "\nNote: " + remarks.trim() : "";

        // 1. System notification in WhatsApp Chat
        ControlRoomMessage sysMsg = new ControlRoomMessage(
                "sys_" + System.currentTimeMillis(),
                "🔥 FIRE ALERT TICKET #" + ticketId + " ACTIVATED\n\nIncident: " + category + " [" + severity + "]\nLocation: "
                        + activeTicket.getLocationName() + " (" + locStr + ")" + noteStr + "\nReport logged with Incident Command Console.",
                ControlRoomMessage.Type.SYSTEM,
                "System",
                time,
                true,
                ticketId
        );
        messages.add(sysMsg);

        // 2. Manager confirmation
        mainHandler.postDelayed(() -> {
            String replyTime = getCurrentTime();
            ControlRoomMessage mgrMsg = new ControlRoomMessage(
                    "mgr_" + System.currentTimeMillis(),
                    "🚒 CONTROL ROOM DISPATCH:\nDuty Officer Verma on desk. We have cataloged your fire report under Ticket #" + ticketId
                            + ".\nSector reconnaissance drones have been queued to scan the coordinates. Please evacuate away from the smoke plume toward the nearest concrete buffer zone.",
                    ControlRoomMessage.Type.MANAGER,
                    "Duty Officer Verma",
                    replyTime,
                    true,
                    ticketId
            );
            messages.add(mgrMsg);
            notifyMessagesUpdated();
        }, 1200);

        notifyTicketChanged();
        notifyMessagesUpdated();
        return activeTicket;
    }

    /**
     * User sends a message inside WhatsApp Control Room.
     */
    public void postCitizenMessage(String text) {
        if (text == null || text.trim().isEmpty()) return;

        String time = getCurrentTime();
        String currentTicketId = isTicketActive() ? activeTicket.getTicketId() : null;

        ControlRoomMessage citizenMsg = new ControlRoomMessage(
                "msg_" + System.currentTimeMillis(),
                text.trim(),
                ControlRoomMessage.Type.CITIZEN,
                "Citizen",
                time,
                true,
                currentTicketId
        );
        messages.add(citizenMsg);
        notifyMessagesUpdated();

        // Push to Firebase Realtime Database
        FireSafeApiClient.getInstance().sendCitizenChatMessage(text.trim(), null);

        // Generate context-aware Manager Response
        mainHandler.postDelayed(() -> {
            generateManagerResponse(text.trim());
        }, 1500);
    }

    public void resolveTicket() {
        if (activeTicket != null) {
            String tId = activeTicket.getTicketId();
            activeTicket.setActive(false);
            activeTicket = null;

            String time = getCurrentTime();
            messages.add(new ControlRoomMessage(
                    "sys_res_" + System.currentTimeMillis(),
                    "✅ Incident Ticket #" + tId + " has been marked RESOLVED by Control Room. Thank you for staying safe.",
                    ControlRoomMessage.Type.SYSTEM,
                    "System",
                    time,
                    true,
                    tId
            ));
            notifyTicketChanged();
            notifyMessagesUpdated();
        }
    }

    private void generateManagerResponse(String userText) {
        String lower = userText.toLowerCase(Locale.ROOT);
        String reply;
        String tId = isTicketActive() ? activeTicket.getTicketId() : null;

        if (!isTicketActive()) {
            reply = "Control Room Standby: You currently do not have an active emergency ticket. If you notice fire or need urgent rescue, tap 'TRIGGER SOS' or 'SEND FIRE ALERT' above to activate immediate dispatch.";
        } else if (lower.contains("evacuate") || lower.contains("where") || lower.contains("route") || lower.contains("go")) {
            reply = "Evacuation Directive [Ticket #" + tId + "]: Head South-West away from Vetal Tekdi ridge toward Pashan Link Rd. Avoid uphill trails with dry brush. Proceed directly to Shivaji Community Safe Hall.";
        } else if (lower.contains("when") || lower.contains("reach") || lower.contains("arrive") || lower.contains("help") || lower.contains("team")) {
            reply = "Dispatch Update: Fire Engine Unit #4 and medical escort are approximately 6–9 minutes away from your sector. Keep your phone active and display a flashlight or bright cloth if smoke density increases.";
        } else if (lower.contains("safe") || lower.contains("shelter")) {
            reply = "Nearest Safe Shelter is Shivaji Community Safe Hall (2.4 km South-West). It has filtered air intake, emergency food, and medical triage.";
        } else if (lower.contains("fire") || lower.contains("flame") || lower.contains("smoke")) {
            reply = "Received. Wind speed in your sector is 18 km/h blowing North-East. Plume is rising. Keep wet cloth over your nose/mouth and stay close to concrete structures.";
        } else if (lower.contains("thank") || lower.contains("ok") || lower.contains("understood")) {
            reply = "Stay vigilant. We have continuous GPS tracking on your coordinates. Update us immediately if your situation changes.";
        } else {
            reply = "Message logged under Ticket #" + tId + ". Commander Sharma is monitoring your channel. Our tactical teams have your location pinned. Stay safe.";
        }

        String replyTime = getCurrentTime();
        ControlRoomMessage mgrMsg = new ControlRoomMessage(
                "mgr_" + System.currentTimeMillis(),
                reply,
                ControlRoomMessage.Type.MANAGER,
                activeTicket != null ? activeTicket.getAssignedManager() : "Control Room Manager",
                replyTime,
                true,
                tId
        );
        messages.add(mgrMsg);
        notifyMessagesUpdated();
    }

    private String getCurrentTime() {
        return new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
    }

    private void notifyMessagesUpdated() {
        for (ControlRoomListener l : new ArrayList<>(listeners)) {
            l.onMessagesUpdated();
        }
    }

    private void notifyTicketChanged() {
        for (ControlRoomListener l : new ArrayList<>(listeners)) {
            l.onTicketStateChanged(activeTicket);
        }
    }
}
