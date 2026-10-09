package com.diplomates.firesafe;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class RegistrationActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPassword;
    private Button btnRegister;
    private TextView tvLoginLink;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);

        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnRegister = findViewById(R.id.btnRegister);
        tvLoginLink = findViewById(R.id.tvLoginLink);

        btnRegister.setOnClickListener(v -> {
            String name = etName.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            } else {
                com.google.firebase.auth.FirebaseAuth.getInstance().createUserWithEmailAndPassword(email, password)
                        .addOnCompleteListener(task -> {
                            if (task.isSuccessful()) {
                                String uid = task.getResult().getUser().getUid();
                                java.util.Map<String, Object> user = new java.util.HashMap<>();
                                user.put("name", name);
                                user.put("email", email);
                                user.put("role", "user");
                                
                                com.google.firebase.firestore.FirebaseFirestore.getInstance()
                                        .collection("users")
                                        .document(uid)
                                        .set(user)
                                        .addOnCompleteListener(firestoreTask -> {
                                            getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                                                    .edit()
                                                    .putBoolean("isLoggedIn", true)
                                                    .putBoolean("isAdmin", false)
                                                    .apply();

                                            Toast.makeText(this, "Registration successful", Toast.LENGTH_SHORT).show();
                                            Intent intent = new Intent(RegistrationActivity.this, MainActivity.class);
                                            startActivity(intent);
                                            finish();
                                        });
                            } else {
                                Toast.makeText(this, "Registration failed: " + task.getException().getMessage(), Toast.LENGTH_LONG).show();
                            }
                        });
            }
        });

        tvLoginLink.setOnClickListener(v -> {
            finish();
        });
    }
}
