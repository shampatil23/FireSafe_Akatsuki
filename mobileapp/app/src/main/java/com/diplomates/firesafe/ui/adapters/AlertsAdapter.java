package com.diplomates.firesafe.ui.adapters;

import android.content.res.ColorStateList;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.diplomates.firesafe.R;
import com.diplomates.firesafe.data.model.FireAlert;
import com.diplomates.firesafe.data.model.FireRiskStatus;
import com.google.android.material.button.MaterialButton;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class AlertsAdapter extends RecyclerView.Adapter<AlertsAdapter.ViewHolder> {

    public interface OnAlertActionListener {
        void onEvacuateRouteClicked(FireAlert alert);
    }

    private final List<FireAlert> items = new ArrayList<>();
    private final OnAlertActionListener listener;

    public AlertsAdapter(OnAlertActionListener listener) {
        this.listener = listener;
    }

    public void setItems(List<FireAlert> newItems) {
        items.clear();
        if (newItems != null) {
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_alert_card, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        FireAlert alert = items.get(position);
        holder.bind(alert, listener);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final View layoutAlertCategoryBadge;
        private final ImageView ivAlertCategoryIcon;
        private final View viewNotificationUnreadDot;
        private final View layoutAlertContextStrip;
        private final TextView tvAlertSeverityBadge;
        private final TextView tvAlertTime;
        private final TextView tvAlertTitle;
        private final TextView tvAlertLocation;
        private final TextView tvAlertDistance;
        private final TextView tvAlertDirection;
        private final TextView tvAlertSpread;
        private final TextView tvAlertAction;
        private final MaterialButton btnAlertAction;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            layoutAlertCategoryBadge = itemView.findViewById(R.id.layoutAlertCategoryBadge);
            ivAlertCategoryIcon = itemView.findViewById(R.id.ivAlertCategoryIcon);
            viewNotificationUnreadDot = itemView.findViewById(R.id.viewNotificationUnreadDot);
            layoutAlertContextStrip = itemView.findViewById(R.id.layoutAlertContextStrip);
            tvAlertSeverityBadge = itemView.findViewById(R.id.tvAlertSeverityBadge);
            tvAlertTime = itemView.findViewById(R.id.tvAlertTime);
            tvAlertTitle = itemView.findViewById(R.id.tvAlertTitle);
            tvAlertLocation = itemView.findViewById(R.id.tvAlertLocation);
            tvAlertDistance = itemView.findViewById(R.id.tvAlertDistance);
            tvAlertDirection = itemView.findViewById(R.id.tvAlertDirection);
            tvAlertSpread = itemView.findViewById(R.id.tvAlertSpread);
            tvAlertAction = itemView.findViewById(R.id.tvAlertAction);
            btnAlertAction = itemView.findViewById(R.id.btnAlertAction);
        }

        public void bind(FireAlert alert, OnAlertActionListener listener) {
            tvAlertTitle.setText(alert.getTitle());

            if (alert.getLocationName() != null && !alert.getLocationName().isEmpty()) {
                tvAlertLocation.setText("📍 " + alert.getLocationName());
                tvAlertLocation.setVisibility(View.VISIBLE);
            } else {
                tvAlertLocation.setVisibility(View.GONE);
            }

            tvAlertTime.setText(alert.getTimeDetected());

            if (tvAlertDistance != null) {
                tvAlertDistance.setText(String.format(Locale.US, "📍 %.1f km", alert.getDistanceKm()));
            }
            if (tvAlertDirection != null) {
                tvAlertDirection.setText("🧭 " + alert.getDirection());
            }
            if (tvAlertSpread != null) {
                tvAlertSpread.setText("⚡ " + alert.getEstimatedSpread());
            }
            if (tvAlertAction != null) {
                tvAlertAction.setText(alert.getRecommendedAction());
            }

            // Unread dot indicator
            if (viewNotificationUnreadDot != null) {
                viewNotificationUnreadDot.setVisibility(alert.isRead() ? View.GONE : View.VISIBLE);
            }

            // Severity & category styling
            FireRiskStatus sev = alert.getSeverity();
            int color;
            int bgBadgeRes;
            int iconRes;
            String categoryText;

            if (sev == FireRiskStatus.EXTREME) {
                color = ContextCompat.getColor(itemView.getContext(), R.color.extreme);
                bgBadgeRes = R.drawable.bg_badge_extreme;
                iconRes = R.drawable.ic_fire;
                categoryText = "CIVIL DEFENSE • CRITICAL ALERT";
            } else if (sev == FireRiskStatus.HIGH) {
                color = ContextCompat.getColor(itemView.getContext(), R.color.high);
                bgBadgeRes = R.drawable.bg_badge_high;
                iconRes = R.drawable.ic_fire;
                categoryText = "FOREST SENSOR MESH • HIGH RISK";
            } else if (sev == FireRiskStatus.WARNING) {
                color = ContextCompat.getColor(itemView.getContext(), R.color.warning);
                bgBadgeRes = R.drawable.bg_badge_warning;
                iconRes = R.drawable.ic_warning_triangle;
                categoryText = "REGIONAL WEATHER ADVISORY";
            } else {
                color = ContextCompat.getColor(itemView.getContext(), R.color.safe);
                bgBadgeRes = R.drawable.bg_badge_safe;
                iconRes = R.drawable.ic_shield_check;
                categoryText = "ALL-CLEAR • SECTOR SAFE";
            }

            if (tvAlertSeverityBadge != null) {
                tvAlertSeverityBadge.setText(categoryText);
                tvAlertSeverityBadge.setTextColor(color);
            }

            if (layoutAlertCategoryBadge != null) {
                layoutAlertCategoryBadge.setBackgroundResource(bgBadgeRes);
            }

            if (ivAlertCategoryIcon != null) {
                ivAlertCategoryIcon.setImageResource(iconRes);
                ivAlertCategoryIcon.setImageTintList(ColorStateList.valueOf(color));
            }

            // Context strip: hide if distance is 0 or safe state
            if (layoutAlertContextStrip != null) {
                layoutAlertContextStrip.setVisibility(alert.getDistanceKm() > 0 ? View.VISIBLE : View.GONE);
            }

            // Contextual notification action button
            if (btnAlertAction != null) {
                if (alert.isEvacuateNow() || sev == FireRiskStatus.EXTREME) {
                    btnAlertAction.setVisibility(View.VISIBLE);
                    btnAlertAction.setText(R.string.btn_start_evacuation);
                    btnAlertAction.setBackgroundTintList(ContextCompat.getColorStateList(itemView.getContext(), R.color.extreme));
                } else if (sev == FireRiskStatus.HIGH) {
                    btnAlertAction.setVisibility(View.VISIBLE);
                    btnAlertAction.setText("View Safe Route & Map");
                    btnAlertAction.setBackgroundTintList(ContextCompat.getColorStateList(itemView.getContext(), R.color.high));
                } else if (sev == FireRiskStatus.WARNING) {
                    btnAlertAction.setVisibility(View.VISIBLE);
                    btnAlertAction.setText("View Advisory on Map");
                    btnAlertAction.setBackgroundTintList(ContextCompat.getColorStateList(itemView.getContext(), R.color.primary));
                } else {
                    btnAlertAction.setVisibility(View.VISIBLE);
                    btnAlertAction.setText("View Safe Zone on Map");
                    btnAlertAction.setBackgroundTintList(ContextCompat.getColorStateList(itemView.getContext(), R.color.safe));
                }
            }

            View.OnClickListener clickListener = v -> {
                alert.setRead(true);
                if (viewNotificationUnreadDot != null) {
                    viewNotificationUnreadDot.setVisibility(View.GONE);
                }
                if (listener != null) {
                    listener.onEvacuateRouteClicked(alert);
                }
            };
            if (btnAlertAction != null) {
                btnAlertAction.setOnClickListener(clickListener);
            }
            itemView.setOnClickListener(clickListener);
        }
    }
}
