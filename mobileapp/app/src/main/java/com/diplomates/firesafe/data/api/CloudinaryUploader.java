package com.diplomates.firesafe.data.api;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Cloudinary Audio Uploader
 * Securely uploads emergency distress audio recordings to Cloudinary using signed authentication.
 */
public class CloudinaryUploader {

    private static final String TAG = "CloudinaryUploader";

    public static final String CLOUD_NAME = "djaieji0g";
    public static final String API_KEY = "625284495946884";
    public static final String API_SECRET = "Z3cIz5CO9OaGW3AQY9hCqjsBhf8";

    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());

    public interface UploadCallback {
        void onSuccess(String secureUrl, String publicId);
        void onError(String errorMessage);
    }

    /**
     * Upload an audio file to Cloudinary asynchronously.
     */
    public static void uploadAudio(File audioFile, UploadCallback callback) {
        if (audioFile == null || !audioFile.exists() || audioFile.length() == 0) {
            if (callback != null) {
                callback.onError("Audio file does not exist or is empty");
            }
            return;
        }

        executor.execute(() -> {
            try {
                long timestamp = System.currentTimeMillis() / 1000;
                String toSign = "timestamp=" + timestamp + API_SECRET;
                String signature = sha1(toSign);

                String uploadUrl = "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/auto/upload";
                String boundary = "===" + System.currentTimeMillis() + "===";
                String lineEnd = "\r\n";
                String twoHyphens = "--";

                URL url = new URL(uploadUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true);
                conn.setDoOutput(true);
                conn.setUseCaches(false);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Connection", "Keep-Alive");
                conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(20000);

                DataOutputStream dos = new DataOutputStream(conn.getOutputStream());

                // 1. Add api_key
                addFormField(dos, boundary, "api_key", API_KEY, lineEnd, twoHyphens);

                // 2. Add timestamp
                addFormField(dos, boundary, "timestamp", String.valueOf(timestamp), lineEnd, twoHyphens);

                // 3. Add signature
                addFormField(dos, boundary, "signature", signature, lineEnd, twoHyphens);

                // 4. Add file binary
                dos.writeBytes(twoHyphens + boundary + lineEnd);
                dos.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"" + audioFile.getName() + "\"" + lineEnd);
                dos.writeBytes("Content-Type: audio/mp4" + lineEnd);
                dos.writeBytes(lineEnd);

                FileInputStream fis = new FileInputStream(audioFile);
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    dos.write(buffer, 0, bytesRead);
                }
                fis.close();
                dos.writeBytes(lineEnd);

                // End of multipart
                dos.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd);
                dos.flush();
                dos.close();

                int responseCode = conn.getResponseCode();
                InputStream is = (responseCode >= 200 && responseCode < 400) ? conn.getInputStream() : conn.getErrorStream();
                String responseBody = readStream(is);

                Log.d(TAG, "Cloudinary upload response (" + responseCode + "): " + responseBody);

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    JSONObject json = new JSONObject(responseBody);
                    String secureUrl = json.optString("secure_url", "");
                    String publicId = json.optString("public_id", "");
                    mainHandler.post(() -> {
                        if (callback != null) {
                            callback.onSuccess(secureUrl, publicId);
                        }
                    });
                } else {
                    JSONObject json = new JSONObject(responseBody);
                    JSONObject errObj = json.optJSONObject("error");
                    String errMsg = errObj != null ? errObj.optString("message", "Upload failed") : ("Server returned " + responseCode);
                    mainHandler.post(() -> {
                        if (callback != null) {
                            callback.onError(errMsg);
                        }
                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Cloudinary upload exception", e);
                mainHandler.post(() -> {
                    if (callback != null) {
                        callback.onError(e.getMessage() != null ? e.getMessage() : "Network upload error");
                    }
                });
            }
        });
    }

    private static void addFormField(DataOutputStream dos, String boundary, String name, String value, String lineEnd, String twoHyphens) throws Exception {
        dos.writeBytes(twoHyphens + boundary + lineEnd);
        dos.writeBytes("Content-Disposition: form-data; name=\"" + name + "\"" + lineEnd);
        dos.writeBytes("Content-Type: text/plain; charset=UTF-8" + lineEnd);
        dos.writeBytes(lineEnd);
        dos.write(value.getBytes(StandardCharsets.UTF_8));
        dos.writeBytes(lineEnd);
    }

    private static String sha1(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static String readStream(InputStream is) throws Exception {
        if (is == null) return "";
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }
}
