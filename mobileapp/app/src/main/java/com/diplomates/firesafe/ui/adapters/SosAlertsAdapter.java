package com.diplomates.firesafe.ui.adapters;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.diplomates.firesafe.R;
import com.google.firebase.firestore.DocumentSnapshot;

import java.util.List;

public class SosAlertsAdapter extends RecyclerView.Adapter<SosAlertsAdapter.SosViewHolder> {

    private List<DocumentSnapshot> sosList;
    private OnDispatchClickListener dispatchClickListener;

    public interface OnDispatchClickListener {
        void onDispatchClick(DocumentSnapshot doc);
    }

    public SosAlertsAdapter(List<DocumentSnapshot> sosList, OnDispatchClickListener listener) {
        this.sosList = sosList;
        this.dispatchClickListener = listener;
    }

    @NonNull
    @Override
    public SosViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_sos_alert_card, parent, false);
        return new SosViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull SosViewHolder holder, int position) {
        DocumentSnapshot doc = sosList.get(position);
        
        String location = doc.getString("location");
        Double lat = doc.getDouble("latitude");
        Double lng = doc.getDouble("longitude");
        String phone = doc.getString("phone");
        String status = doc.getString("status");
        Long battery = doc.getLong("battery");

        holder.tvLocation.setText(location != null ? location : "Unknown Location");
        holder.tvStatus.setText(status != null ? status : "ACTIVE");
        
        if ("ACTIVE".equals(status)) {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_status_critical);
            holder.btnDispatch.setVisibility(View.VISIBLE);
        } else if ("DISPATCHED".equals(status)) {
            holder.tvStatus.setBackgroundColor(Color.parseColor("#FF9800")); // Orange
            holder.btnDispatch.setVisibility(View.GONE);
        } else {
            holder.tvStatus.setBackgroundColor(Color.parseColor("#4CAF50")); // Green for resolved/other
            holder.btnDispatch.setVisibility(View.GONE);
        }

        holder.tvDetails.setText("Phone: " + (phone != null ? phone : "N/A") + 
                                 " | Battery: " + (battery != null ? battery : "?") + "%");

        holder.btnMap.setOnClickListener(v -> {
            if (lat != null && lng != null) {
                Intent intent = new Intent(Intent.ACTION_VIEW, 
                    Uri.parse("geo:" + lat + "," + lng + "?q=" + lat + "," + lng + "(SOS Location)"));
                v.getContext().startActivity(intent);
            }
        });

        holder.btnDispatch.setOnClickListener(v -> {
            if (dispatchClickListener != null) {
                dispatchClickListener.onDispatchClick(doc);
            }
        });
    }

    @Override
    public int getItemCount() {
        return sosList.size();
    }

    public static class SosViewHolder extends RecyclerView.ViewHolder {
        TextView tvLocation, tvStatus, tvDetails;
        Button btnDispatch, btnMap;

        public SosViewHolder(@NonNull View itemView) {
            super(itemView);
            tvLocation = itemView.findViewById(R.id.tvSosLocation);
            tvStatus = itemView.findViewById(R.id.tvSosStatus);
            tvDetails = itemView.findViewById(R.id.tvSosDetails);
            btnDispatch = itemView.findViewById(R.id.btnSosDispatch);
            btnMap = itemView.findViewById(R.id.btnSosMap);
        }
    }
}
