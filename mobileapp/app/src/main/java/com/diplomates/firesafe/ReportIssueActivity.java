package com.diplomates.firesafe;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import com.cloudinary.android.MediaManager;
import com.cloudinary.android.callback.ErrorInfo;
import com.cloudinary.android.callback.UploadCallback;
import java.util.Map;

public class ReportIssueActivity extends AppCompatActivity {
    private Uri selectedImageUri = null;
    private String uploadedImageUrl = null;
    private TextView tvMediaStatus;

    private final ActivityResultLauncher<String> getContent = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    tvMediaStatus.setText("Uploading image...");
                    uploadToCloudinary(uri);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report_issue);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        Spinner spinnerActivityType = findViewById(R.id.spinnerActivityType);
        String[] types = {"Tree Cutting", "Chainsaw Sounds", "Unauthorized Burning", "Suspicious Vehicle", "Other"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, types);
        spinnerActivityType.setAdapter(adapter);

        TextView tvGpsLocation = findViewById(R.id.tvGpsLocation);
        tvGpsLocation.setText("Lat: 18.5204, Lng: 73.8567 (Accuracy: 12m)");

        tvMediaStatus = findViewById(R.id.tvMediaStatus);

        findViewById(R.id.btnAttachMedia).setOnClickListener(v -> {
            getContent.launch("image/*");
        });

        findViewById(R.id.btnSubmitReport).setOnClickListener(v -> {
            EditText etDescription = findViewById(R.id.etDescription);
            if (etDescription.getText().toString().isEmpty()) {
                Toast.makeText(this, "Please provide a description", Toast.LENGTH_SHORT).show();
            } else {
                Map<String, Object> report = new java.util.HashMap<>();
                report.put("activityType", spinnerActivityType.getSelectedItem().toString());
                report.put("description", etDescription.getText().toString());
                report.put("gpsLocation", "Lat: 18.5204, Lng: 73.8567");
                report.put("imageUrl", uploadedImageUrl);
                report.put("timestamp", com.google.firebase.firestore.FieldValue.serverTimestamp());
                report.put("status", "PENDING");

                com.google.firebase.firestore.FirebaseFirestore.getInstance()
                    .collection("reports")
                    .add(report)
                    .addOnSuccessListener(documentReference -> {
                        Toast.makeText(this, "Report submitted successfully. Thank you!", Toast.LENGTH_LONG).show();
                        finish();
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Failed to submit report.", Toast.LENGTH_SHORT).show();
                    });
            }
        });
    }

    private void uploadToCloudinary(Uri uri) {
        MediaManager.get().upload(uri).callback(new UploadCallback() {
            @Override
            public void onStart(String requestId) {
            }

            @Override
            public void onProgress(String requestId, long bytes, long totalBytes) {
            }

            @Override
            public void onSuccess(String requestId, Map resultData) {
                uploadedImageUrl = (String) resultData.get("secure_url");
                tvMediaStatus.setText("Image uploaded successfully!");
                Toast.makeText(ReportIssueActivity.this, "Image uploaded!", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(String requestId, ErrorInfo error) {
                tvMediaStatus.setText("Upload failed");
                Toast.makeText(ReportIssueActivity.this, "Upload Error: " + error.getDescription(), Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onReschedule(String requestId, ErrorInfo error) {
            }
        }).dispatch();
    }
}
