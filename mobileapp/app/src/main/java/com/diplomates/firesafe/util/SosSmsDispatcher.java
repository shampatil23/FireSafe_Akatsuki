package com.diplomates.firesafe.util;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.telephony.SmsManager;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.diplomates.firesafe.data.model.EmergencyContact;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Dispatches emergency SMS to citizen's saved emergency contacts using SmsManager.
 */
public class SosSmsDispatcher {

    private static final String TAG = "SosSmsDispatcher";

    public interface SmsDispatchCallback {
        void onDispatched(int sentCount, List<String> recipientNames);
        void onPermissionNeeded();
        void onError(String error);
    }

    public interface SmsCallback {
        void onProgress(int sent, int total, String lastRecipient);
        void onCompleted(int totalSent);
        void onError(String error);
    }

    public static void sendEmergencySms(Context context,
                                        List<EmergencyContact> contacts,
                                        double lat,
                                        double lng,
                                        String locationName,
                                        String cloudinaryAudioUrl,
                                        SmsCallback callback) {
        sendEmergencySms(context, contacts, locationName, lat, lng, cloudinaryAudioUrl, new SmsDispatchCallback() {
            @Override
            public void onDispatched(int sentCount, List<String> recipientNames) {
                if (callback != null) {
                    callback.onCompleted(sentCount);
                }
            }

            @Override
            public void onPermissionNeeded() {
                if (callback != null) {
                    callback.onError("SMS permission not granted");
                }
            }

            @Override
            public void onError(String error) {
                if (callback != null) {
                    callback.onError(error);
                }
            }
        });
    }

    /**
     * Send emergency distress SMS with live location and Cloudinary audio recording link.
     */
    public static void sendEmergencySms(Context context,
                                        List<EmergencyContact> contacts,
                                        String locationName,
                                        double lat,
                                        double lng,
                                        String cloudinaryAudioUrl,
                                        SmsDispatchCallback callback) {
        if (contacts == null || contacts.isEmpty()) {
            if (callback != null) {
                callback.onError("No emergency contacts saved in citizen profile");
            }
            return;
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "SEND_SMS permission not granted");
            if (callback != null) {
                callback.onPermissionNeeded();
            }
            return;
        }

        try {
            SmsManager smsManager;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                smsManager = context.getSystemService(SmsManager.class);
            } else {
                smsManager = SmsManager.getDefault();
            }

            if (smsManager == null) {
                if (callback != null) {
                    callback.onError("SMS Service unavailable on this device");
                }
                return;
            }

            StringBuilder msgBuilder = new StringBuilder();
            String resolvedLoc = (locationName != null && !locationName.trim().isEmpty()) ? locationName.trim() : "My Current Location";

            // Standard official Google Maps Universal Cross-Platform URLs
            String mapSearchUrl = String.format(Locale.US, "https://www.google.com/maps/search/?api=1&query=%.6f,%.6f", lat, lng);
            String mapDirectionsUrl = String.format(Locale.US, "https://www.google.com/maps/dir/?api=1&destination=%.6f,%.6f", lat, lng);

            msgBuilder.append("🚨 EMERGENCY SOS - FOREST FIRE ALERT!\n")
                    .append("I need immediate rescue or assistance.\n\n")
                    .append("📍 Location: ").append(resolvedLoc).append("\n")
                    .append(String.format(Locale.US, "📌 GPS: %.6f, %.6f\n\n", lat, lng))
                    .append("🗺️ Live Google Map Pin:\n")
                    .append(mapSearchUrl).append("\n\n")
                    .append("🚗 Route Navigation:\n")
                    .append(mapDirectionsUrl).append("\n");

            if (cloudinaryAudioUrl != null && !cloudinaryAudioUrl.trim().isEmpty()) {
                msgBuilder.append("\n🎙️ Distress Audio Recording:\n")
                        .append(cloudinaryAudioUrl.trim()).append("\n");
            }

            msgBuilder.append("\nPlease dispatch emergency responders or call 112!");

            String fullMessage = msgBuilder.toString();
            ArrayList<String> parts = smsManager.divideMessage(fullMessage);

            int sentCount = 0;
            List<String> names = new ArrayList<>();

            for (EmergencyContact contact : contacts) {
                String phone = contact.getPhoneNumber();
                if (phone != null && !phone.trim().isEmpty()) {
                    try {
                        if (parts.size() > 1) {
                            smsManager.sendMultipartTextMessage(phone.trim(), null, parts, null, null);
                        } else {
                            smsManager.sendTextMessage(phone.trim(), null, fullMessage, null, null);
                        }
                        sentCount++;
                        names.add(contact.getName());
                        Log.i(TAG, "Emergency SMS sent to: " + contact.getName() + " (" + phone + ")");
                    } catch (Exception ex) {
                        Log.e(TAG, "Failed sending SMS to " + phone, ex);
                    }
                }
            }

            if (callback != null) {
                if (sentCount > 0) {
                    callback.onDispatched(sentCount, names);
                } else {
                    callback.onError("Could not send SMS to any recipient");
                }
            }

        } catch (Exception e) {
            Log.e(TAG, "Error in sendEmergencySms", e);
            if (callback != null) {
                callback.onError(e.getMessage() != null ? e.getMessage() : "Failed to dispatch SMS");
            }
        }
    }

    /**
     * Send 'I Am Safe' check-in SMS with live location and Google Maps link to saved emergency contacts.
     */
    public static void sendImSafeSms(Context context,
                                     List<EmergencyContact> contacts,
                                     String locationName,
                                     double lat,
                                     double lng,
                                     SmsDispatchCallback callback) {
        if (contacts == null || contacts.isEmpty()) {
            if (callback != null) {
                callback.onError("No emergency contacts saved in citizen profile");
            }
            return;
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "SEND_SMS permission not granted for I'm Safe broadcast");
            if (callback != null) {
                callback.onPermissionNeeded();
            }
            return;
        }

        try {
            SmsManager smsManager;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                smsManager = context.getSystemService(SmsManager.class);
            } else {
                smsManager = SmsManager.getDefault();
            }

            if (smsManager == null) {
                if (callback != null) {
                    callback.onError("SMS Service unavailable on this device");
                }
                return;
            }

            String resolvedLoc = (locationName != null && !locationName.trim().isEmpty()) ? locationName.trim() : "Current Location";
            String mapSearchUrl = String.format(Locale.US, "https://www.google.com/maps/search/?api=1&query=%.6f,%.6f", lat, lng);
            String timeStr = new SimpleDateFormat("hh:mm a, dd MMM yyyy", Locale.US).format(new Date());

            String fullMessage = "✅ FIRE DEFENSE UPDATE: I AM SAFE\n" +
                    "I am currently safe and out of immediate wildfire danger.\n\n" +
                    "📍 Location: " + resolvedLoc + "\n" +
                    String.format(Locale.US, "📌 GPS: %.6f, %.6f\n", lat, lng) +
                    "🕒 Time: " + timeStr + "\n\n" +
                    "🗺️ My Live Location on Map:\n" +
                    mapSearchUrl + "\n\n" +
                    "- Sent via FireSafe AI Defense System";

            ArrayList<String> parts = smsManager.divideMessage(fullMessage);
            int sentCount = 0;
            List<String> names = new ArrayList<>();

            for (EmergencyContact contact : contacts) {
                String phone = contact.getPhoneNumber();
                if (phone != null && !phone.trim().isEmpty()) {
                    try {
                        if (parts.size() > 1) {
                            smsManager.sendMultipartTextMessage(phone.trim(), null, parts, null, null);
                        } else {
                            smsManager.sendTextMessage(phone.trim(), null, fullMessage, null, null);
                        }
                        sentCount++;
                        names.add(contact.getName());
                        Log.i(TAG, "I'm Safe SMS sent to: " + contact.getName() + " (" + phone + ")");
                    } catch (Exception ex) {
                        Log.e(TAG, "Failed sending I'm Safe SMS to " + phone, ex);
                    }
                }
            }

            if (callback != null) {
                if (sentCount > 0) {
                    callback.onDispatched(sentCount, names);
                } else {
                    callback.onError("Could not send SMS to any emergency contact");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in sendImSafeSms", e);
            if (callback != null) {
                callback.onError(e.getMessage() != null ? e.getMessage() : "Failed to dispatch I'm Safe SMS");
            }
        }
    }
}
