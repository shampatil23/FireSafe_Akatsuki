package com.diplomates.firesafe.util;

import android.content.Context;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.io.File;

/**
 * Handles audio recording for emergency distress voice clips during SOS activation.
 */
public class SosAudioRecorder {

    private static final String TAG = "SosAudioRecorder";
    private static SosAudioRecorder instance;
    private Context appContext;

    public interface RecordingListener {
        void onRecordingStarted();
        void onProgress(int elapsedSeconds);
        void onRecordingCompleted(File recordedFile);
        void onError(String error);
    }

    public interface RecordingCallback {
        void onStarted(File audioFile);
        void onProgress(int secondsElapsed);
        void onCompleted(File audioFile);
        void onError(String error);
    }

    public static synchronized SosAudioRecorder getInstance(Context context) {
        if (instance == null) {
            instance = new SosAudioRecorder(context.getApplicationContext());
        }
        return instance;
    }

    public SosAudioRecorder() {}

    public SosAudioRecorder(Context context) {
        this.appContext = context;
    }

    private MediaRecorder mediaRecorder;
    private File currentOutputFile;
    private boolean isRecording = false;
    private final Handler timerHandler = new Handler(Looper.getMainLooper());
    private int elapsedSeconds = 0;
    private RecordingListener currentListener;
    private RecordingCallback currentCallback;

    public void startRecording(RecordingCallback callback) {
        this.currentCallback = callback;
        Context ctx = appContext != null ? appContext : null;
        startRecording(ctx, 15, new RecordingListener() {
            @Override
            public void onRecordingStarted() {
                if (currentCallback != null && currentOutputFile != null) {
                    currentCallback.onStarted(currentOutputFile);
                }
            }

            @Override
            public void onProgress(int elapsedSeconds) {
                if (currentCallback != null) {
                    currentCallback.onProgress(elapsedSeconds);
                }
            }

            @Override
            public void onRecordingCompleted(File recordedFile) {
                if (currentCallback != null) {
                    currentCallback.onCompleted(recordedFile);
                }
            }

            @Override
            public void onError(String error) {
                if (currentCallback != null) {
                    currentCallback.onError(error);
                }
            }
        });
    }

    public void cancelRecording() {
        if (isRecording) {
            isRecording = false;
            timerHandler.removeCallbacks(timerRunnable);
            releaseRecorder();
            if (currentOutputFile != null && currentOutputFile.exists()) {
                currentOutputFile.delete();
            }
        }
    }

    private final Runnable timerRunnable = new Runnable() {
        @Override
        public void run() {
            if (isRecording) {
                elapsedSeconds++;
                if (currentListener != null) {
                    currentListener.onProgress(elapsedSeconds);
                }
                timerHandler.postDelayed(this, 1000);
            }
        }
    };

    public boolean isRecording() {
        return isRecording;
    }

    public void startRecording(Context context, int maxDurationSeconds, RecordingListener listener) {
        if (isRecording) {
            stopRecording();
        }

        this.currentListener = listener;
        this.elapsedSeconds = 0;

        try {
            File cacheDir = context.getCacheDir();
            currentOutputFile = new File(cacheDir, "sos_voice_" + System.currentTimeMillis() + ".m4a");

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                mediaRecorder = new MediaRecorder(context);
            } else {
                mediaRecorder = new MediaRecorder();
            }

            mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            mediaRecorder.setAudioEncodingBitRate(64000);
            mediaRecorder.setAudioSamplingRate(44100);
            mediaRecorder.setOutputFile(currentOutputFile.getAbsolutePath());

            if (maxDurationSeconds > 0) {
                mediaRecorder.setMaxDuration(maxDurationSeconds * 1000);
                mediaRecorder.setOnInfoListener((mr, what, extra) -> {
                    if (what == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) {
                        stopRecording();
                    }
                });
            }

            mediaRecorder.prepare();
            mediaRecorder.start();
            isRecording = true;

            timerHandler.post(timerRunnable);

            if (currentListener != null) {
                currentListener.onRecordingStarted();
            }
            Log.d(TAG, "Distress audio recording started: " + currentOutputFile.getAbsolutePath());

        } catch (Exception e) {
            Log.e(TAG, "Error starting voice recording", e);
            isRecording = false;
            releaseRecorder();
            if (currentListener != null) {
                currentListener.onError("Could not start microphone recording: " + e.getMessage());
            }
        }
    }

    public File stopRecording() {
        if (!isRecording) {
            return currentOutputFile;
        }

        isRecording = false;
        timerHandler.removeCallbacks(timerRunnable);

        try {
            if (mediaRecorder != null) {
                mediaRecorder.stop();
            }
        } catch (Exception e) {
            Log.w(TAG, "MediaRecorder stop note: " + e.getMessage());
        }

        releaseRecorder();

        if (currentListener != null && currentOutputFile != null && currentOutputFile.exists()) {
            currentListener.onRecordingCompleted(currentOutputFile);
        }

        return currentOutputFile;
    }

    private void releaseRecorder() {
        if (mediaRecorder != null) {
            try {
                mediaRecorder.reset();
                mediaRecorder.release();
            } catch (Exception e) {
                Log.w(TAG, "MediaRecorder release note: " + e.getMessage());
            }
            mediaRecorder = null;
        }
    }
}
