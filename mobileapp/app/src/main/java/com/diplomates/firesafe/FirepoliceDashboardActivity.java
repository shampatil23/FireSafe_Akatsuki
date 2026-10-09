package com.diplomates.firesafe;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;

public class FirepoliceDashboardActivity extends AppCompatActivity {
    private com.diplomates.firesafe.ui.adapters.FirepoliceAlertsAdapter adapter;
    private java.util.List<com.google.firebase.firestore.DocumentSnapshot> alertsList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_firepolice_dashboard);
        
        ImageView ivLogout = findViewById(R.id.ivFirepoliceLogout);
        ivLogout.setOnClickListener(v -> {
            FirebaseAuth.getInstance().signOut();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        androidx.recyclerview.widget.RecyclerView rvAlerts = findViewById(R.id.rvFirepoliceAlerts);
        rvAlerts.setLayoutManager(new androidx.recyclerview.widget.LinearLayoutManager(this));
        
        alertsList = new java.util.ArrayList<>();
        adapter = new com.diplomates.firesafe.ui.adapters.FirepoliceAlertsAdapter(alertsList, (doc, status) -> {
            if ("DISPATCHED".equals(status)) {
                FirebaseFirestore.getInstance().collection("sos_alerts").document(doc.getId())
                    .update("status", "ACCEPTED");
                Toast.makeText(this, "Incident Accepted!", Toast.LENGTH_SHORT).show();
            } else if ("ACCEPTED".equals(status)) {
                FirebaseFirestore.getInstance().collection("sos_alerts").document(doc.getId())
                    .update("status", "RESOLVED");
                Toast.makeText(this, "Incident Resolved!", Toast.LENGTH_SHORT).show();
            }
        });
        rvAlerts.setAdapter(adapter);

        fetchAssignedAlerts();
    }

    private java.util.Set<String> shownAlerts = new java.util.HashSet<>();

    private void fetchAssignedAlerts() {
        String currentUid = FirebaseAuth.getInstance().getCurrentUser().getUid();
        FirebaseFirestore.getInstance().collection("sos_alerts")
                .whereEqualTo("assignedFirepoliceId", currentUid)
                .addSnapshotListener((value, error) -> {
                    if (error != null) {
                        Log.w("FirepoliceDashboard", "SOS Listen failed.", error);
                        return;
                    }

                    for (com.google.firebase.firestore.DocumentChange dc : value.getDocumentChanges()) {
                        if (dc.getType() == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                            QueryDocumentSnapshot doc = dc.getDocument();
                            if ("DISPATCHED".equals(doc.getString("status")) && !shownAlerts.contains(doc.getId())) {
                                shownAlerts.add(doc.getId());
                                showDispatchDialog(doc);
                            }
                        }
                    }

                    alertsList.clear();
                    for (QueryDocumentSnapshot doc : value) {
                        alertsList.add(doc);
                    }
                    // Sort by timestamp safely
                    alertsList.sort((d1, d2) -> {
                        com.google.firebase.Timestamp t1 = d1.getTimestamp("serverTimestamp");
                        com.google.firebase.Timestamp t2 = d2.getTimestamp("serverTimestamp");
                        if (t1 == null && t2 == null) return 0;
                        if (t1 == null) return 1; // Put nulls at the end
                        if (t2 == null) return -1;
                        return t2.compareTo(t1); // Descending
                    });
                    
                    adapter.notifyDataSetChanged();
                });
    }

    private void showDispatchDialog(QueryDocumentSnapshot doc) {
        String location = doc.getString("address");
        if (location == null) {
            location = doc.getString("location");
        }
        Double lat = doc.getDouble("latitude");
        Double lng = doc.getDouble("longitude");
        String phone = doc.getString("phone");
        String alertId = doc.getId();

        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        builder.setTitle("🚨 NEW DISPATCH RECEIVED 🚨");
        builder.setMessage("You have been assigned to an SOS incident!\n\nLocation: " + location + 
                "\nCoordinates: " + lat + ", " + lng +
                "\nVictim Phone: " + phone);
        
        builder.setPositiveButton("Accept & View Map", (dialog, which) -> {
            FirebaseFirestore.getInstance().collection("sos_alerts").document(alertId)
                .update("status", "ACCEPTED");
                
            if(lat != null && lng != null) {
                Intent intent = new Intent(android.content.Intent.ACTION_VIEW, 
                    android.net.Uri.parse("geo:" + lat + "," + lng + "?q=" + lat + "," + lng + "(SOS Location)"));
                startActivity(intent);
            }
        });

        builder.setNegativeButton("Mark Resolved", (dialog, which) -> {
            FirebaseFirestore.getInstance().collection("sos_alerts").document(alertId)
                .update("status", "RESOLVED");
            Toast.makeText(this, "Incident marked as resolved.", Toast.LENGTH_SHORT).show();
        });

        builder.setCancelable(false);
        if (!isFinishing() && !isDestroyed()) {
            builder.show();
        }
    }
}
