package com.diplomates.firesafe;

import android.os.Bundle;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import com.bumptech.glide.Glide;

public class FullScreenImageActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_full_screen_image);

        String imageUrl = getIntent().getStringExtra("imageUrl");

        ImageView ivFullScreenImage = findViewById(R.id.ivFullScreenImage);
        ImageView btnClose = findViewById(R.id.btnClose);

        if (imageUrl != null) {
            Glide.with(this).load(imageUrl).into(ivFullScreenImage);
        }

        btnClose.setOnClickListener(v -> finish());
    }
}
