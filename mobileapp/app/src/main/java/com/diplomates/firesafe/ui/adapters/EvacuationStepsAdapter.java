package com.diplomates.firesafe.ui.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.diplomates.firesafe.R;
import com.diplomates.firesafe.data.model.EvacuationStep;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class EvacuationStepsAdapter extends RecyclerView.Adapter<EvacuationStepsAdapter.ViewHolder> {

    private final List<EvacuationStep> items = new ArrayList<>();

    public void setItems(List<EvacuationStep> newItems) {
        items.clear();
        if (newItems != null) {
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_evacuation_step, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        EvacuationStep step = items.get(position);
        holder.bind(step);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView tvStepNumber;
        private final TextView tvStepInstruction;
        private final TextView tvStepDistance;
        private final TextView tvHazardNote;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvStepNumber = itemView.findViewById(R.id.tvStepNumber);
            tvStepInstruction = itemView.findViewById(R.id.tvStepInstruction);
            tvStepDistance = itemView.findViewById(R.id.tvStepDistance);
            tvHazardNote = itemView.findViewById(R.id.tvHazardNote);
        }

        public void bind(EvacuationStep step) {
            tvStepNumber.setText(String.valueOf(step.getStepNumber()));
            tvStepInstruction.setText(step.getInstruction());
            tvStepDistance.setText(String.format(Locale.getDefault(), "in %d meters", step.getDistanceMeters()));

            if (step.isHazardAvoidance()) {
                tvHazardNote.setVisibility(View.VISIBLE);
                tvHazardNote.setText("⚠️ " + step.getSafetyNote());
            } else {
                tvHazardNote.setVisibility(View.GONE);
            }
        }
    }
}
