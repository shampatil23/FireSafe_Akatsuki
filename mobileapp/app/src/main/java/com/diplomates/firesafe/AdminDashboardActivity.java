package com.diplomates.firesafe;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.diplomates.firesafe.data.model.Report;
import com.diplomates.firesafe.ui.adapters.ReportsAdapter;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;

public class AdminDashboardActivity extends AppCompatActivity {

    private ReportsAdapter reportsAdapter;
    private com.diplomates.firesafe.ui.adapters.SosAlertsAdapter sosAdapter;
    private List<Report> reportsList;
    private List<com.google.firebase.firestore.DocumentSnapshot> sosList;
    private RecyclerView rvAdminReports;
    private android.widget.TextView tvListTitle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_dashboard);

        ImageView ivAdminLogout = findViewById(R.id.ivAdminLogout);
        ivAdminLogout.setOnClickListener(v -> {
            getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                    .edit()
                    .putBoolean("isLoggedIn", false)
                    .putBoolean("isAdmin", false)
                    .apply();
            Toast.makeText(this, "Admin Logged out", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });

        tvListTitle = findViewById(R.id.tvListTitle);
        rvAdminReports = findViewById(R.id.rvAdminReports);
        rvAdminReports.setLayoutManager(new LinearLayoutManager(this));

        reportsList = new ArrayList<>();
        reportsAdapter = new ReportsAdapter(reportsList);
        
        sosList = new ArrayList<>();
        sosAdapter = new com.diplomates.firesafe.ui.adapters.SosAlertsAdapter(sosList, doc -> {
            Double lat = doc.getDouble("latitude");
            Double lng = doc.getDouble("longitude");
            String location = doc.getString("location");
            fetchAndSelectFirepolice(doc.getId(), lat, lng, location);
        });

        // Default view
        rvAdminReports.setAdapter(reportsAdapter);

        androidx.cardview.widget.CardView cardReports = findViewById(R.id.cardReports);
        androidx.cardview.widget.CardView cardSosAlerts = findViewById(R.id.cardSosAlerts);

        cardReports.setOnClickListener(v -> {
            tvListTitle.setText("Recent Suspicious Activity Reports");
            rvAdminReports.setAdapter(reportsAdapter);
        });

        cardSosAlerts.setOnClickListener(v -> {
            tvListTitle.setText("All SOS Alerts");
            rvAdminReports.setAdapter(sosAdapter);
        });

        com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton fabAddFirepolice = findViewById(R.id.fabAddFirepolice);
        fabAddFirepolice.setOnClickListener(v -> showAddFirepoliceDialog());

        fetchReportsRealtime();
        fetchSosAlertsRealtime();
        listenForSosAlerts();
    }

    private void fetchSosAlertsRealtime() {
        FirebaseFirestore.getInstance().collection("sos_alerts")
                .orderBy("serverTimestamp", Query.Direction.DESCENDING)
                .addSnapshotListener((value, error) -> {
                    if (error != null) {
                        Log.w("AdminDashboard", "SOS list fetch failed.", error);
                        return;
                    }

                    sosList.clear();
                    for (QueryDocumentSnapshot doc : value) {
                        sosList.add(doc);
                    }
                    sosAdapter.notifyDataSetChanged();
                });
    }

    private void showAddFirepoliceDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        builder.setTitle("Create Firepolice Account");

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(50, 40, 50, 10);

        final android.widget.EditText emailBox = new android.widget.EditText(this);
        emailBox.setHint("Email");
        layout.addView(emailBox);

        final android.widget.EditText passwordBox = new android.widget.EditText(this);
        passwordBox.setHint("Password");
        layout.addView(passwordBox);

        builder.setView(layout);
        builder.setPositiveButton("Create", (dialog, which) -> {
            String email = emailBox.getText().toString().trim();
            String password = passwordBox.getText().toString().trim();
            if(!email.isEmpty() && !password.isEmpty()) {
                createFirepoliceAccount(email, password);
            }
        });
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss());
        builder.show();
    }

    private void createFirepoliceAccount(String email, String password) {
        com.google.firebase.auth.FirebaseAuth auth = com.google.firebase.auth.FirebaseAuth.getInstance();
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    String uid = task.getResult().getUser().getUid();
                    java.util.Map<String, Object> user = new java.util.HashMap<>();
                    user.put("email", email);
                    user.put("role", "firepolice");
                    FirebaseFirestore.getInstance().collection("users").document(uid).set(user);
                    Toast.makeText(this, "Firepolice account created!", Toast.LENGTH_SHORT).show();
                    
                    // Sign back in as admin
                    auth.signInWithEmailAndPassword("admin@gmaill.com", "admin123");
                } else {
                    Toast.makeText(this, "Failed to create account: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                }
            });
    }

    private void fetchReportsRealtime() {
        FirebaseFirestore.getInstance().collection("reports")
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .addSnapshotListener((value, error) -> {
                    if (error != null) {
                        Log.w("AdminDashboard", "Listen failed.", error);
                        return;
                    }

                    reportsList.clear();
                    for (QueryDocumentSnapshot doc : value) {
                        String type = doc.getString("activityType");
                        String description = doc.getString("description");
                        String time = "Just now"; // You can parse timestamp here
                        String location = doc.getString("gpsLocation");
                        String imageUrl = doc.getString("imageUrl");
                        
                        String status = doc.getString("status");
                        if (status == null) status = "PENDING"; // Default if old data

                        reportsList.add(new Report(doc.getId(), type, description, time, location, imageUrl, status));
                    }
                    reportsAdapter.notifyDataSetChanged();
                });
    }

    private void listenForSosAlerts() {
        FirebaseFirestore.getInstance().collection("sos_alerts")
                .whereEqualTo("status", "ACTIVE")
                .addSnapshotListener((value, error) -> {
                    if (error != null) {
                        Log.w("AdminDashboard", "SOS Listen failed.", error);
                        return;
                    }

                    for (com.google.firebase.firestore.DocumentChange dc : value.getDocumentChanges()) {
                        if (dc.getType() == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                            QueryDocumentSnapshot doc = dc.getDocument();
                            showSosAlertDialog(doc);
                        }
                    }
                });
    }

    private void showSosAlertDialog(QueryDocumentSnapshot doc) {
        String location = doc.getString("address");
        if (location == null) {
            location = doc.getString("location");
        }
        final String finalLocation = location;
        Double lat = doc.getDouble("latitude");
        Double lng = doc.getDouble("longitude");
        String phone = doc.getString("phone");
        String battery = String.valueOf(doc.getLong("battery"));
        String audioUrl = doc.getString("audioUrl");
        String alertId = doc.getId();

        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        builder.setTitle("🚨 URGENT: SOS ALERT 🚨");
        builder.setMessage("Location: " + finalLocation + "\nCoordinates: " + lat + ", " + lng +
                "\nPhone: " + phone + "\nBattery: " + battery + "%\n\nAction required!");
        
        builder.setPositiveButton("Dispatch Firepolice", (dialog, which) -> {
            fetchAndSelectFirepolice(alertId, lat, lng, finalLocation);
        });
        
        builder.setNeutralButton("View Map", (dialog, which) -> {
            if(lat != null && lng != null) {
                Intent intent = new Intent(android.content.Intent.ACTION_VIEW, 
                    android.net.Uri.parse("geo:" + lat + "," + lng + "?q=" + lat + "," + lng + "(SOS Location)"));
                startActivity(intent);
            }
        });

        builder.setNegativeButton("Ignore", (dialog, which) -> {
            FirebaseFirestore.getInstance().collection("sos_alerts").document(alertId)
                .update("status", "IGNORED");
        });

        builder.setCancelable(false);
        if (!isFinishing() && !isDestroyed()) {
            builder.show();
        }
    }

    private void fetchAndSelectFirepolice(String alertId, Double lat, Double lng, String locationName) {
        FirebaseFirestore.getInstance().collection("users")
                .whereEqualTo("role", "firepolice")
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    List<String> policeEmails = new ArrayList<>();
                    List<String> policeIds = new ArrayList<>();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        policeEmails.add(doc.getString("email"));
                        policeIds.add(doc.getId());
                    }

                    if (policeEmails.isEmpty()) {
                        Toast.makeText(this, "No Firepolice found!", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    CharSequence[] items = policeEmails.toArray(new CharSequence[0]);
                    new android.app.AlertDialog.Builder(this)
                            .setTitle("Select Firepolice to Dispatch")
                            .setItems(items, (dialog, which) -> {
                                String selectedEmail = policeEmails.get(which);
                                String selectedId = policeIds.get(which);
                                dispatchToFirepolice(alertId, selectedId, selectedEmail, lat, lng, locationName);
                            })
                            .show();
                })
                .addOnFailureListener(e -> Toast.makeText(this, "Error fetching firepolice", Toast.LENGTH_SHORT).show());
    }

    private void dispatchToFirepolice(String alertId, String firepoliceId, String firepoliceEmail, Double lat, Double lng, String locationName) {
        java.util.Map<String, Object> updates = new java.util.HashMap<>();
        updates.put("status", "DISPATCHED");
        updates.put("assignedFirepoliceId", firepoliceId);
        updates.put("assignedFirepoliceEmail", firepoliceEmail);

        FirebaseFirestore.getInstance().collection("sos_alerts").document(alertId)
                .update(updates)
                .addOnSuccessListener(aVoid -> {
                    Toast.makeText(this, "Successfully dispatched to " + firepoliceEmail, Toast.LENGTH_SHORT).show();
                })
                .addOnFailureListener(e -> Toast.makeText(this, "Dispatch failed", Toast.LENGTH_SHORT).show());
    }
}
