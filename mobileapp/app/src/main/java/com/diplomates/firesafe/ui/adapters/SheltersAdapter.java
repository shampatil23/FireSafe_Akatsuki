package com.diplomates.firesafe.ui.adapters;

import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.diplomates.firesafe.R;
import com.diplomates.firesafe.data.model.SafeShelter;
import com.google.android.material.button.MaterialButton;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class SheltersAdapter extends RecyclerView.Adapter<SheltersAdapter.ViewHolder> {

    public interface OnShelterNavigateListener {
        void onNavigateToShelter(SafeShelter shelter);
    }

    private final List<SafeShelter> items = new ArrayList<>();
    private final OnShelterNavigateListener listener;

    public SheltersAdapter(OnShelterNavigateListener listener) {
        this.listener = listener;
    }

    public void setItems(List<SafeShelter> newItems) {
        items.clear();
        if (newItems != null) {
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_shelter_card, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        SafeShelter shelter = items.get(position);
        holder.bind(shelter, listener);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvShelterOpenBadge;
        private final TextView tvShelterCapacity;
        private final TextView tvShelterName;
        private final TextView tvShelterAddress;
        private final TextView tvShelterCoordinates;
        private final TextView tvShelterDistanceEta;
        private final TextView tvShelterAmenities;
        private final MaterialButton btnNavigateShelter;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvShelterOpenBadge = itemView.findViewById(R.id.tvShelterOpenBadge);
            tvShelterCapacity = itemView.findViewById(R.id.tvShelterCapacity);
            tvShelterName = itemView.findViewById(R.id.tvShelterName);
            tvShelterAddress = itemView.findViewById(R.id.tvShelterAddress);
            tvShelterCoordinates = itemView.findViewById(R.id.tvShelterCoordinates);
            tvShelterDistanceEta = itemView.findViewById(R.id.tvShelterDistanceEta);
            tvShelterAmenities = itemView.findViewById(R.id.tvShelterAmenities);
            btnNavigateShelter = itemView.findViewById(R.id.btnNavigateShelter);
        }

        public void bind(SafeShelter shelter, OnShelterNavigateListener listener) {
            tvShelterName.setText(shelter.getName());
            tvShelterAddress.setText(shelter.getAddress());
            if (tvShelterCoordinates != null) {
                tvShelterCoordinates.setText(String.format(Locale.US, "📍 GPS Coordinates: %.4f° N, %.4f° E",
                        shelter.getLatitude(), shelter.getLongitude()));
            }
            tvShelterCapacity.setText(String.format(Locale.getDefault(), "%d spots left", shelter.getAvailableCapacity()));
            tvShelterDistanceEta.setText(String.format(Locale.getDefault(), "%.1f km • approx %d mins",
                    shelter.getDistanceKm(), shelter.getTravelTimeMinutes()));

            if (shelter.getAmenities() != null && !shelter.getAmenities().isEmpty()) {
                tvShelterAmenities.setText(TextUtils.join(" • ", shelter.getAmenities()));
            }

            View.OnClickListener clickListener = v -> {
                if (listener != null) {
                    listener.onNavigateToShelter(shelter);
                }
            };
            btnNavigateShelter.setOnClickListener(clickListener);
            itemView.setOnClickListener(clickListener);
        }
    }
}
