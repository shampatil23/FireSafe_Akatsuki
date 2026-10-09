package com.diplomates.firesafe.ui.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.diplomates.firesafe.R;
import com.diplomates.firesafe.data.model.ControlRoomMessage;

import java.util.ArrayList;
import java.util.List;

public class ControlRoomAdapter extends RecyclerView.Adapter<ControlRoomAdapter.ViewHolder> {

    private final List<ControlRoomMessage> items = new ArrayList<>();

    public void setItems(List<ControlRoomMessage> newItems) {
        items.clear();
        if (newItems != null) {
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    public void addMessage(ControlRoomMessage message) {
        if (message != null) {
            items.add(message);
            notifyItemInserted(items.size() - 1);
        }
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_control_room_message, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(items.get(position));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        // System
        private final LinearLayout layoutSystemContainer;
        private final TextView tvSystemText;
        private final TextView tvSystemTime;

        // Manager
        private final LinearLayout layoutManagerContainer;
        private final TextView tvManagerSenderTitle;
        private final TextView tvManagerText;
        private final TextView tvManagerTime;

        // Citizen
        private final LinearLayout layoutCitizenContainer;
        private final TextView tvCitizenText;
        private final TextView tvCitizenTime;
        private final ImageView ivCitizenCheck;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            layoutSystemContainer = itemView.findViewById(R.id.layoutSystemContainer);
            tvSystemText = itemView.findViewById(R.id.tvSystemText);
            tvSystemTime = itemView.findViewById(R.id.tvSystemTime);

            layoutManagerContainer = itemView.findViewById(R.id.layoutManagerContainer);
            tvManagerSenderTitle = itemView.findViewById(R.id.tvManagerSenderTitle);
            tvManagerText = itemView.findViewById(R.id.tvManagerText);
            tvManagerTime = itemView.findViewById(R.id.tvManagerTime);

            layoutCitizenContainer = itemView.findViewById(R.id.layoutCitizenContainer);
            tvCitizenText = itemView.findViewById(R.id.tvCitizenText);
            tvCitizenTime = itemView.findViewById(R.id.tvCitizenTime);
            ivCitizenCheck = itemView.findViewById(R.id.ivCitizenCheck);
        }

        public void bind(ControlRoomMessage message) {
            if (message == null) return;

            layoutSystemContainer.setVisibility(View.GONE);
            layoutManagerContainer.setVisibility(View.GONE);
            layoutCitizenContainer.setVisibility(View.GONE);

            switch (message.getType()) {
                case SYSTEM:
                    layoutSystemContainer.setVisibility(View.VISIBLE);
                    tvSystemText.setText(message.getText());
                    tvSystemTime.setText(message.getTimestamp());
                    break;

                case MANAGER:
                    layoutManagerContainer.setVisibility(View.VISIBLE);
                    tvManagerSenderTitle.setText(message.getSenderName() != null ? message.getSenderName() : "Control Room Manager");
                    tvManagerText.setText(message.getText());
                    tvManagerTime.setText(message.getTimestamp());
                    break;

                case CITIZEN:
                default:
                    layoutCitizenContainer.setVisibility(View.VISIBLE);
                    tvCitizenText.setText(message.getText());
                    tvCitizenTime.setText(message.getTimestamp());
                    if (ivCitizenCheck != null) {
                        ivCitizenCheck.setVisibility(View.VISIBLE);
                    }
                    break;
            }
        }
    }
}
