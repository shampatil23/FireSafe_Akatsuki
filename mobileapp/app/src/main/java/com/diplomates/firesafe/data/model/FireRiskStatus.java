package com.diplomates.firesafe.data.model;

import com.diplomates.firesafe.R;

public enum FireRiskStatus {
    SAFE(
        "YOU ARE CURRENTLY SAFE",
        "No active threat detected near your location",
        "Safe",
        R.color.safe,
        R.color.safe_subtle,
        R.drawable.bg_badge_safe,
        R.drawable.ic_shield_check
    ),
    WARNING(
        "FIRE WATCH: MODERATE",
        "Elevated dry wind conditions detected. Stay alert.",
        "Warning",
        R.color.warning,
        R.color.warning_subtle,
        R.drawable.bg_badge_warning,
        R.drawable.ic_warning_triangle
    ),
    HIGH(
        "FIRE RISK: HIGH",
        "An active fire has been detected 4.2 km away.",
        "High Risk",
        R.color.high,
        R.color.high_subtle,
        R.drawable.bg_badge_high,
        R.drawable.ic_fire
    ),
    EXTREME(
        "EVACUATE NOW",
        "Active wildfire detected near your location.",
        "EXTREME DANGER",
        R.color.extreme,
        R.color.extreme_subtle,
        R.drawable.bg_badge_extreme,
        R.drawable.ic_fire
    );

    private final String title;
    private final String subtitle;
    private final String badgeText;
    private final int colorResId;
    private final int subtleColorResId;
    private final int badgeBackgroundResId;
    private final int iconResId;

    FireRiskStatus(String title, String subtitle, String badgeText,
                   int colorResId, int subtleColorResId,
                   int badgeBackgroundResId, int iconResId) {
        this.title = title;
        this.subtitle = subtitle;
        this.badgeText = badgeText;
        this.colorResId = colorResId;
        this.subtleColorResId = subtleColorResId;
        this.badgeBackgroundResId = badgeBackgroundResId;
        this.iconResId = iconResId;
    }

    public String getTitle() { return title; }
    public String getSubtitle() { return subtitle; }
    public String getBadgeText() { return badgeText; }
    public int getColorResId() { return colorResId; }
    public int getSubtleColorResId() { return subtleColorResId; }
    public int getBadgeBackgroundResId() { return badgeBackgroundResId; }
    public int getIconResId() { return iconResId; }
}
