package com.diplomates.firesafe;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ImageView ivSplashLogo = findViewById(R.id.ivSplashLogo);
        Animation animation = AnimationUtils.loadAnimation(this, R.anim.fade_in_scale);
        ivSplashLogo.startAnimation(animation);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            boolean isLoggedIn = getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                    .getBoolean("isLoggedIn", false);
            boolean isAdmin = getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                    .getBoolean("isAdmin", false);
            boolean isFirepolice = getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                    .getBoolean("isFirepolice", false);
            
            Intent intent;
            if (isLoggedIn) {
                if (isAdmin) {
                    intent = new Intent(SplashActivity.this, AdminDashboardActivity.class);
                } else if (isFirepolice) {
                    intent = new Intent(SplashActivity.this, FirepoliceDashboardActivity.class);
                } else {
                    intent = new Intent(SplashActivity.this, MainActivity.class);
                }
            } else {
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            }
            startActivity(intent);
            finish();
        }, 2000); // 2 second delay
    }
}
