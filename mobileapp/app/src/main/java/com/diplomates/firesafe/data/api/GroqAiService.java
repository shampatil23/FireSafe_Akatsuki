package com.diplomates.firesafe.data.api;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.diplomates.firesafe.data.model.FireAlert;
import com.diplomates.firesafe.data.model.SafeShelter;
import com.diplomates.firesafe.data.repository.FireSafeRepository;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Service to interact with the Groq AI API for the SANthi emergency wildfire chatbot.
 * Uses high-speed inference on Groq with live situational awareness.
 */
public class GroqAiService {

    private static final String TAG = "GroqAiService";
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String API_KEY = "YOUR_GROQ_API_KEY_HERE";
    private static final String PRIMARY_MODEL = "openai/gpt-oss-120b";
    private static final String FALLBACK_MODEL = "qwen/qwen3.8-27b";

    private static GroqAiService instance;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public interface ChatCallback {
        void onSuccess(String aiReply);
        void onError(String error);
    }

    private GroqAiService() {}

    public static synchronized GroqAiService getInstance() {
        if (instance == null) {
            instance = new GroqAiService();
        }
        return instance;
    }

    public void sendMessage(String userQuery, ChatCallback callback) {
        executor.execute(() -> {
            String response = callGroqApi(userQuery, PRIMARY_MODEL);
            if (response == null || response.trim().isEmpty()) {
                Log.w(TAG, "Primary model failed or returned empty, trying fallback model...");
                response = callGroqApi(userQuery, FALLBACK_MODEL);
            }

            final String finalResult = sanitizeAiOutput(response);
            mainHandler.post(() -> {
                if (finalResult != null && !finalResult.trim().isEmpty()) {
                    callback.onSuccess(finalResult.trim());
                } else {
                    // Graceful contingency fallback
                    callback.onError("SANthi AI is currently operating in offline backup mode. Emergency advice: If you see smoke or fire, evacuate immediately toward Bibwewadi Community Relief Center (1.2 km) or call 112 / 101.");
                }
            });
        });
    }

    private String sanitizeAiOutput(String text) {
        if (text == null) return null;
        // Strip markdown asterisks and normalize
        return text.replace("**", "").replace("__", "").trim();
    }

    private String callGroqApi(String userQuery, String model) {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(GROQ_API_URL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Android; FireSafe-Mobile/1.0)");
            conn.setConnectTimeout(12000);
            conn.setReadTimeout(25000);
            conn.setDoOutput(true);

            JSONObject payload = new JSONObject();
            payload.put("model", model);
            payload.put("temperature", 0.5);
            payload.put("max_tokens", 450);

            JSONArray messages = new JSONArray();

            // 1. System Prompt with Real-time Situational Awareness
            JSONObject sysMsg = new JSONObject();
            sysMsg.put("role", "system");
            sysMsg.put("content", buildSystemPrompt());
            messages.put(sysMsg);

            // 2. User Query
            JSONObject userMsg = new JSONObject();
            userMsg.put("role", "user");
            userMsg.put("content", userQuery);
            messages.put(userMsg);

            payload.put("messages", messages);

            byte[] input = payload.toString().getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            if (code == 200) {
                InputStream is = conn.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();

                JSONObject resObj = new JSONObject(sb.toString());
                JSONArray choices = resObj.optJSONArray("choices");
                if (choices != null && choices.length() > 0) {
                    JSONObject choice = choices.getJSONObject(0);
                    JSONObject msg = choice.optJSONObject("message");
                    if (msg != null) {
                        return msg.optString("content", "");
                    }
                }
            } else {
                InputStream err = conn.getErrorStream();
                if (err != null) {
                    BufferedReader errReader = new BufferedReader(new InputStreamReader(err, StandardCharsets.UTF_8));
                    StringBuilder errSb = new StringBuilder();
                    String errLine;
                    while ((errLine = errReader.readLine()) != null) {
                        errSb.append(errLine);
                    }
                    errReader.close();
                    Log.e(TAG, "Groq API error (" + code + "): " + errSb.toString());
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Exception calling Groq API", e);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
        return null;
    }

    private String buildSystemPrompt() {
        FireSafeRepository repo = FireSafeRepository.getInstance();
        StringBuilder sb = new StringBuilder();
        sb.append("You are SANthi (Smart Autonomous Natural Threat Intelligence), the real-time AI emergency disaster assistant inside the FireSafe Forest Fire Defense System.\n");
        sb.append("Your mission is to provide calm, clear, rapid, and life-saving guidance to citizens during forest fire emergencies.\n\n");

        sb.append("Current Monitored Sector: ").append(repo.getCurrentLocationName()).append(" (Pune, Maharashtra).\n");
        sb.append("Risk Status: ").append(repo.getCurrentRiskStatus().name()).append(".\n");

        FireAlert active = repo.getActiveNearbyAlert();
        if (active != null) {
            sb.append("Active Hazard: ").append(active.getTitle())
              .append(" at ").append(active.getLocationName())
              .append(" (").append(String.format(java.util.Locale.US, "%.1f km away", active.getDistanceKm()))
              .append(", spread: ").append(active.getEstimatedSpread()).append(").\n");
        }

        List<SafeShelter> shelters = repo.getShelters();
        if (shelters != null && !shelters.isEmpty()) {
            sb.append("Nearby Safe Shelters within 5 km:\n");
            for (int i = 0; i < Math.min(shelters.size(), 4); i++) {
                SafeShelter s = shelters.get(i);
                sb.append("- ").append(s.getName()).append(" (")
                  .append(String.format(java.util.Locale.US, "%.1f km", s.getDistanceKm()))
                  .append(", ").append(s.getAddress()).append(")\n");
            }
        }

        sb.append("\nKey Guidelines:\n");
        sb.append("1. Always prioritize human life: Immediate evacuation, avoiding smoke, protecting airways with N95 or damp cloth.\n");
        sb.append("2. Guide citizens to the nearest safe shelter mentioned above if evacuation is necessary.\n");
        sb.append("3. Keep answers concise, highly readable, structured with bullet points and bold action verbs, and reassuring.\n");
        sb.append("4. Mention emergency numbers (112 / 101) for direct rescue if someone is trapped.\n");
        sb.append("5. Formatting: Output formatted plain text with bullet points (•) and clean numbered steps. Do NOT output raw markdown asterisks (such as **). Write headings in plain capitalized words.\n");

        return sb.toString();
    }
}
