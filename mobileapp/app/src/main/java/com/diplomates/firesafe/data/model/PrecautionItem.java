package com.diplomates.firesafe.data.model;

import java.util.List;

public class PrecautionItem {
    public enum Category {
        BEFORE("Before Wildfire / Preparedness"),
        DURING("During Active Wildfire"),
        TRAPPED("If Trapped / Last Resort"),
        AFTER("After the Fire / Air Quality");

        private final String label;
        Category(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private final String id;
    private final String title;
    private final Category category;
    private final String summary;
    private final List<String> bulletPoints;

    public PrecautionItem(String id, String title, Category category, String summary, List<String> bulletPoints) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.summary = summary;
        this.bulletPoints = bulletPoints;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public Category getCategory() { return category; }
    public String getSummary() { return summary; }
    public List<String> getBulletPoints() { return bulletPoints; }
}
