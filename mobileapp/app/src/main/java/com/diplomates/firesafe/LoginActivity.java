package com.diplomates.firesafe;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private TextView tvRegisterLink;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvRegisterLink = findViewById(R.id.tvRegisterLink);
        
        Button btnQuickUser = findViewById(R.id.btnQuickUser);
        Button btnQuickFirepolice = findViewById(R.id.btnQuickFirepolice);
        Button btnQuickAdmin = findViewById(R.id.btnQuickAdmin);
        
        btnQuickUser.setOnClickListener(v -> quickLogin("user@firesafe.com", "password123", "user"));
        btnQuickFirepolice.setOnClickListener(v -> quickLogin("firepolice@firesafe.com", "password123", "firepolice"));
        btnQuickAdmin.setOnClickListener(v -> quickLogin("admin@gmaill.com", "admin123", "admin"));

        btnLogin.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            } else {
                com.google.firebase.auth.FirebaseAuth.getInstance().signInWithEmailAndPassword(email, password)
                        .addOnCompleteListener(task -> {
                            if (task.isSuccessful()) {
                                String uid = task.getResult().getUser().getUid();
                                com.google.firebase.firestore.FirebaseFirestore.getInstance()
                                        .collection("users")
                                        .document(uid)
                                        .get()
                                        .addOnCompleteListener(firestoreTask -> {
                                            if (firestoreTask.isSuccessful() && firestoreTask.getResult() != null && firestoreTask.getResult().exists()) {
                                                String role = firestoreTask.getResult().getString("role");
                                                proceedToDashboard(role != null ? role : "user");
                                            } else {
                                                proceedToDashboard("user");
                                            }
                                        });
                            } else {
                                Toast.makeText(this, "Login failed: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                            }
                        });
            }
        });

        tvRegisterLink.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegistrationActivity.class);
            startActivity(intent);
        });
    }

    private void quickLogin(String email, String password, String role) {
        Toast.makeText(this, "Logging in as " + role + "...", Toast.LENGTH_SHORT).show();
        com.google.firebase.auth.FirebaseAuth auth = com.google.firebase.auth.FirebaseAuth.getInstance();
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    proceedToDashboard(role);
                } else {
                    // Try creating
                    auth.createUserWithEmailAndPassword(email, password)
                        .addOnCompleteListener(createTask -> {
                            if (createTask.isSuccessful()) {
                                String uid = createTask.getResult().getUser().getUid();
                                java.util.Map<String, Object> user = new java.util.HashMap<>();
                                user.put("email", email);
                                user.put("role", role);
                                com.google.firebase.firestore.FirebaseFirestore.getInstance()
                                    .collection("users")
                                    .document(uid)
                                    .set(user)
                                    .addOnCompleteListener(firestoreTask -> {
                                        proceedToDashboard(role);
                                    });
                            } else {
                                Toast.makeText(this, "Quick login failed: " + createTask.getException().getMessage(), Toast.LENGTH_LONG).show();
                            }
                        });
                }
            });
    }

    private void proceedToDashboard(String role) {
        boolean isAdmin = "admin".equals(role);
        boolean isFirepolice = "firepolice".equals(role);
        getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                .edit()
                .putBoolean("isLoggedIn", true)
                .putBoolean("isAdmin", isAdmin)
                .putBoolean("isFirepolice", isFirepolice)
                .apply();
        
        Intent intent;
        if (isAdmin) {
            intent = new Intent(LoginActivity.this, AdminDashboardActivity.class);
        } else if (isFirepolice) {
            intent = new Intent(LoginActivity.this, FirepoliceDashboardActivity.class);
        } else {
            intent = new Intent(LoginActivity.this, MainActivity.class);
        }
        startActivity(intent);
        finish();
    }
}
