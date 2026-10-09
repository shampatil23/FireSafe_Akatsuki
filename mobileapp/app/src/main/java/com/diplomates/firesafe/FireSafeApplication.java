package com.diplomates.firesafe;

import android.app.Application;
import com.cloudinary.android.MediaManager;
import java.util.HashMap;
import java.util.Map;

public class FireSafeApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        
        try {
            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", "djaieji0g");
            config.put("api_key", "625284495946884");
            config.put("api_secret", "Z3cIz5CO9OaGW3AQY9hCqjsBhf8");
            MediaManager.init(this, config);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
