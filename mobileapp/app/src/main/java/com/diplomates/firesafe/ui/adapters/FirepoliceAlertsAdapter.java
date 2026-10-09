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

public class FirepoliceAlertsAdapter extends RecyclerView.Adapter<FirepoliceAlertsAdapter.ViewHolder> {

    private List<DocumentSnapshot> sosList;
    private OnActionClickListener actionListener;

    public interface OnActionClickListener {
        void onActionClick(DocumentSnapshot doc, String currentStatus);
    }

    public FirepoliceAlertsAdapter(List<DocumentSnapshot> sosList, OnActionClickListener listener) {
        this.sosList = sosList;
        this.actionListener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_sos_alert_card, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DocumentSnapshot doc = sosList.get(position);
        
        String location = doc.getString("location");
        Double lat = doc.getDouble("latitude");
        Double lng = doc.getDouble("longitude");
        String phone = doc.getString("phone");
        String status = doc.getString("status");
        Long battery = doc.getLong("battery");

        holder.tvLocation.setText(location != null ? location : "Unknown Location");
        holder.tvStatus.setText(status != null ? status : "ASSIGNED");
        
        holder.tvDetails.setText("Phone: " + (phone != null ? phone : "N/A") + 
                                 " | Battery: " + (battery != null ? battery : "?") + "%");

        if ("DISPATCHED".equals(status)) {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_status_critical);
            holder.btnAction.setText("Accept");
            holder.btnAction.setVisibility(View.VISIBLE);
        } else if ("ACCEPTED".equals(status)) {
            holder.tvStatus.setBackgroundColor(Color.parseColor("#FF9800")); // Orange
            holder.btnAction.setText("Mark Resolved");
            holder.btnAction.setVisibility(View.VISIBLE);
        } else {
            holder.tvStatus.setBackgroundColor(Color.parseColor("#4CAF50")); // Green
            holder.btnAction.setVisibility(View.GONE);
        }

        holder.btnMap.setOnClickListener(v -> {
            if (lat != null && lng != null) {
                Intent intent = new Intent(Intent.ACTION_VIEW, 
                    Uri.parse("geo:" + lat + "," + lng + "?q=" + lat + "," + lng + "(SOS Location)"));
                v.getContext().startActivity(intent);
            }
        });

        holder.btnAction.setOnClickListener(v -> {
            if (actionListener != null) {
                actionListener.onActionClick(doc, status);
            }
        });
    }

    @Override
    public int getItemCount() {
        return sosList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvLocation, tvStatus, tvDetails;
        Button btnAction, btnMap;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvLocation = itemView.findViewById(R.id.tvSosLocation);
            tvStatus = itemView.findViewById(R.id.tvSosStatus);
            tvDetails = itemView.findViewById(R.id.tvSosDetails);
            btnAction = itemView.findViewById(R.id.btnSosDispatch); // Reusing the same button ID
            btnMap = itemView.findViewById(R.id.btnSosMap);
        }
    }
}
