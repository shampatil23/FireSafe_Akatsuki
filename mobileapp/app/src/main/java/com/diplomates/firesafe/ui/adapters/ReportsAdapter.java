package com.diplomates.firesafe.ui.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.diplomates.firesafe.R;
import com.diplomates.firesafe.data.model.Report;
import java.util.List;

public class ReportsAdapter extends RecyclerView.Adapter<ReportsAdapter.ReportViewHolder> {
    private List<Report> reports;

    public ReportsAdapter(List<Report> reports) {
        this.reports = reports;
    }

    @NonNull
    @Override
    public ReportViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_report_card, parent, false);
        return new ReportViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ReportViewHolder holder, int position) {
        Report report = reports.get(position);
        holder.tvReportType.setText(report.getType());
        holder.tvReportDesc.setText(report.getDescription());
        holder.tvReportTime.setText(report.getTime() != null ? report.getTime() : "Just now");
        holder.tvReportLocation.setText(report.getLocation());
        
        String status = report.getStatus() != null ? report.getStatus() : "PENDING";
        holder.tvReportStatus.setText("Status: " + status);
        
        holder.btnUpdateStatus.setOnClickListener(v -> {
            String[] statuses = {"PENDING", "INVESTIGATING", "VERIFIED", "RESOLVED"};
            new android.app.AlertDialog.Builder(holder.itemView.getContext())
                .setTitle("Update Status")
                .setItems(statuses, (dialog, which) -> {
                    String newStatus = statuses[which];
                    if (report.getId() != null) {
                        com.google.firebase.firestore.FirebaseFirestore.getInstance()
                            .collection("reports")
                            .document(report.getId())
                            .update("status", newStatus)
                            .addOnSuccessListener(aVoid -> android.widget.Toast.makeText(holder.itemView.getContext(), "Status updated", android.widget.Toast.LENGTH_SHORT).show());
                    }
                }).show();
        });

        if (report.getImageUrl() != null && !report.getImageUrl().isEmpty()) {
            holder.btnShowEvidence.setVisibility(View.VISIBLE);
            holder.btnShowEvidence.setOnClickListener(v -> {
                android.content.Intent intent = new android.content.Intent(holder.itemView.getContext(), com.diplomates.firesafe.FullScreenImageActivity.class);
                intent.putExtra("imageUrl", report.getImageUrl());
                holder.itemView.getContext().startActivity(intent);
            });
        } else {
            holder.btnShowEvidence.setVisibility(View.GONE);
        }

        holder.llReportLocation.setOnClickListener(v -> {
            String loc = report.getLocation();
            if (loc != null && loc.contains("Lat:") && loc.contains("Lng:")) {
                try {
                    String latStr = loc.substring(loc.indexOf("Lat:") + 4, loc.indexOf(",")).trim();
                    String lngStr = loc.substring(loc.indexOf("Lng:") + 4).trim();
                    String geoUri = "geo:" + latStr + "," + lngStr + "?q=" + latStr + "," + lngStr + "(" + android.net.Uri.encode(report.getType()) + ")";
                    android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(geoUri));
                    holder.itemView.getContext().startActivity(intent);
                } catch (Exception e) {
                    android.widget.Toast.makeText(holder.itemView.getContext(), "Could not parse location", android.widget.Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    @Override
    public int getItemCount() {
        return reports.size();
    }

    static class ReportViewHolder extends RecyclerView.ViewHolder {
        TextView tvReportType, tvReportDesc, tvReportTime, tvReportLocation, tvReportStatus;
        android.widget.Button btnShowEvidence, btnUpdateStatus;
        View llReportLocation;

        public ReportViewHolder(@NonNull View itemView) {
            super(itemView);
            tvReportType = itemView.findViewById(R.id.tvReportType);
            tvReportDesc = itemView.findViewById(R.id.tvReportDesc);
            tvReportTime = itemView.findViewById(R.id.tvReportTime);
            tvReportLocation = itemView.findViewById(R.id.tvReportLocation);
            tvReportStatus = itemView.findViewById(R.id.tvReportStatus);
            btnShowEvidence = itemView.findViewById(R.id.btnShowEvidence);
            btnUpdateStatus = itemView.findViewById(R.id.btnUpdateStatus);
            llReportLocation = itemView.findViewById(R.id.llReportLocation);
        }
    }
}
