package com.diplomates.firesafe.ui.custom;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.view.HapticFeedbackConstants;
import android.view.LayoutInflater;
import android.view.View;
import android.view.animation.OvershootInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import com.diplomates.firesafe.R;

/**
 * Custom Floating Pill Bottom Navigation View
 * Designed precisely after the modern minimalist Uber-style floating navigation pill.
 * Features:
 * - Floating rounded capsule card with smooth elevation
 * - 4 Navigation tabs: Home, Services, Activity, Account
 * - Active pill indicator behind selected item with bold label
 * - Subtle haptic feedback and micro-animation on selection
 * - Blue notification badge dot on Account profile tab
 * - Backward compatibility with nav_map and nav_alerts IDs
 */
public class FloatingBottomNavView extends FrameLayout {

    public interface OnItemSelectedListener {
        boolean onNavigationItemSelected(int itemId);
    }

    private View tabHome, tabServices, tabActivity, tabAccount;
    private LinearLayout pillHome, pillServices, pillActivity, pillAccount;
    private ImageView iconHome, iconServices, iconActivity, iconAccount;
    private TextView labelHome, labelServices, labelActivity, labelAccount;
    private View dotAccount, dotActivity;

    private int currentSelectedId = R.id.nav_home;
    private OnItemSelectedListener itemSelectedListener;

    public FloatingBottomNavView(@NonNull Context context) {
        super(context);
        init(context);
    }

    public FloatingBottomNavView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public FloatingBottomNavView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.layout_floating_bottom_nav, this, true);

        tabHome = findViewById(R.id.nav_home);
        tabServices = findViewById(R.id.nav_services);
        tabActivity = findViewById(R.id.nav_activity);
        tabAccount = findViewById(R.id.nav_account);

        pillHome = findViewById(R.id.pill_home);
        pillServices = findViewById(R.id.pill_services);
        pillActivity = findViewById(R.id.pill_activity);
        pillAccount = findViewById(R.id.pill_account);

        iconHome = findViewById(R.id.icon_home);
        iconServices = findViewById(R.id.icon_services);
        iconActivity = findViewById(R.id.icon_activity);
        iconAccount = findViewById(R.id.icon_account);

        labelHome = findViewById(R.id.label_home);
        labelServices = findViewById(R.id.label_services);
        labelActivity = findViewById(R.id.label_activity);
        labelAccount = findViewById(R.id.label_account);

        dotAccount = findViewById(R.id.dot_account);
        dotActivity = findViewById(R.id.dot_activity);

        setupClickListeners();
        updateTabStyles(R.id.nav_home, false);
    }

    private void setupClickListeners() {
        tabHome.setOnClickListener(v -> onTabClicked(R.id.nav_home, v));
        tabServices.setOnClickListener(v -> onTabClicked(R.id.nav_services, v));
        tabActivity.setOnClickListener(v -> onTabClicked(R.id.nav_activity, v));
        tabAccount.setOnClickListener(v -> onTabClicked(R.id.nav_account, v));
    }

    private void onTabClicked(int itemId, View view) {
        view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
        if (currentSelectedId == itemId) {
            return;
        }

        setSelectedItemId(itemId, true);
    }

    public void setOnItemSelectedListener(OnItemSelectedListener listener) {
        this.itemSelectedListener = listener;
    }

    public void setSelectedItemId(int itemId) {
        setSelectedItemId(itemId, true);
    }

    public void setSelectedItemId(int itemId, boolean notifyListener) {
        // Map legacy aliases
        if (itemId == R.id.nav_map) {
            itemId = R.id.nav_services;
        } else if (itemId == R.id.nav_alerts) {
            itemId = R.id.nav_activity;
        }

        currentSelectedId = itemId;
        updateTabStyles(itemId, true);

        if (notifyListener && itemSelectedListener != null) {
            itemSelectedListener.onNavigationItemSelected(itemId);
        }
    }

    public int getSelectedItemId() {
        return currentSelectedId;
    }

    public void setAccountBadgeVisible(boolean visible) {
        if (dotAccount != null) {
            dotAccount.setVisibility(visible ? View.VISIBLE : View.GONE);
        }
    }

    public void setActivityBadgeVisible(boolean visible) {
        if (dotActivity != null) {
            dotActivity.setVisibility(visible ? View.VISIBLE : View.GONE);
        }
    }

    private void updateTabStyles(int selectedId, boolean animate) {
        applyItemState(R.id.nav_home, selectedId == R.id.nav_home, pillHome, iconHome, labelHome, animate);
        applyItemState(R.id.nav_services, selectedId == R.id.nav_services, pillServices, iconServices, labelServices, animate);
        applyItemState(R.id.nav_activity, selectedId == R.id.nav_activity, pillActivity, iconActivity, labelActivity, animate);
        applyItemState(R.id.nav_account, selectedId == R.id.nav_account, pillAccount, iconAccount, labelAccount, animate);
    }

    private void applyItemState(int id, boolean isSelected, LinearLayout pill, ImageView icon, TextView label, boolean animate) {
        if (pill == null || icon == null || label == null) return;

        if (isSelected) {
            pill.setBackgroundResource(R.drawable.bg_nav_pill_active);
            label.setTextColor(Color.parseColor("#000000"));
            label.setTypeface(Typeface.create("sans-serif-black", Typeface.BOLD));

            if (animate) {
                // Micro overshoot bounce animation
                ObjectAnimator scaleX = ObjectAnimator.ofFloat(pill, View.SCALE_X, 0.94f, 1.04f, 1.0f);
                ObjectAnimator scaleY = ObjectAnimator.ofFloat(pill, View.SCALE_Y, 0.94f, 1.04f, 1.0f);
                AnimatorSet set = new AnimatorSet();
                set.playTogether(scaleX, scaleY);
                set.setDuration(220);
                set.setInterpolator(new OvershootInterpolator(1.4f));
                set.start();
            }
        } else {
            pill.setBackgroundColor(Color.TRANSPARENT);
            label.setTextColor(Color.parseColor("#5E5E5E"));
            label.setTypeface(Typeface.create("sans-serif", Typeface.NORMAL));
            pill.setScaleX(1.0f);
            pill.setScaleY(1.0f);
        }
    }
}
