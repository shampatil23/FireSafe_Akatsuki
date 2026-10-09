package com.diplomates.firesafe.ui.adapters;

import android.os.Build;
import android.text.Html;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.diplomates.firesafe.R;
import com.diplomates.firesafe.data.model.ChatMessage;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import java.util.ArrayList;
import java.util.List;

public class ChatAdapter extends RecyclerView.Adapter<ChatAdapter.ViewHolder> {

    public interface OnSuggestionChipClickListener {
        void onSuggestionClicked(String question);
    }

    private final List<ChatMessage> items = new ArrayList<>();
    private final OnSuggestionChipClickListener listener;

    public ChatAdapter(OnSuggestionChipClickListener listener) {
        this.listener = listener;
    }

    public void setItems(List<ChatMessage> newItems) {
        items.clear();
        if (newItems != null) {
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    public void addMessage(ChatMessage message) {
        items.add(message);
        notifyItemInserted(items.size() - 1);
    }

    public void removeMessageById(String id) {
        if (id == null) return;
        for (int i = 0; i < items.size(); i++) {
            if (id.equals(items.get(i).getId())) {
                items.remove(i);
                notifyItemRemoved(i);
                break;
            }
        }
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_message, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ChatMessage message = items.get(position);
        holder.bind(message, listener);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final LinearLayout layoutAiContainer;
        private final TextView tvAiTimestamp;
        private final TextView tvAiText;
        private final HorizontalScrollView scrollSuggestions;
        private final ChipGroup chipGroupSuggestions;

        private final LinearLayout layoutUserContainer;
        private final TextView tvUserTimestamp;
        private final TextView tvUserText;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            layoutAiContainer = itemView.findViewById(R.id.layoutAiContainer);
            tvAiTimestamp = itemView.findViewById(R.id.tvAiTimestamp);
            tvAiText = itemView.findViewById(R.id.tvAiText);
            scrollSuggestions = itemView.findViewById(R.id.scrollSuggestions);
            chipGroupSuggestions = itemView.findViewById(R.id.chipGroupSuggestions);

            layoutUserContainer = itemView.findViewById(R.id.layoutUserContainer);
            tvUserTimestamp = itemView.findViewById(R.id.tvUserTimestamp);
            tvUserText = itemView.findViewById(R.id.tvUserText);
        }

        public void bind(ChatMessage message, OnSuggestionChipClickListener listener) {
            if (message.isFromUser()) {
                layoutAiContainer.setVisibility(View.GONE);
                layoutUserContainer.setVisibility(View.VISIBLE);
                tvUserText.setText(message.getText());
                tvUserTimestamp.setText(message.getTimestamp());
            } else {
                layoutUserContainer.setVisibility(View.GONE);
                layoutAiContainer.setVisibility(View.VISIBLE);
                
                // Format markdown so **bold** renders as clean bold, bullets format, and asterisks are stripped
                tvAiText.setText(formatMarkdownToSpanned(message.getText()));
                tvAiTimestamp.setText(message.getTimestamp());

                // Set AI Assistant Identity
                TextView tvAiSenderTitle = itemView.findViewById(R.id.tvAiSenderTitle);
                if (tvAiSenderTitle != null) {
                    tvAiSenderTitle.setText("SANthi AI Assistant");
                }

                // Suggestions
                chipGroupSuggestions.removeAllViews();
                if (message.getSuggestionChips() != null && !message.getSuggestionChips().isEmpty()) {
                    scrollSuggestions.setVisibility(View.VISIBLE);
                    for (String suggestion : message.getSuggestionChips()) {
                        Chip chip = new Chip(itemView.getContext());
                        chip.setText(suggestion);
                        chip.setCheckable(false);
                        chip.setClickable(true);
                        chip.setOnClickListener(v -> {
                            if (listener != null) {
                                listener.onSuggestionClicked(suggestion);
                            }
                        });
                        chipGroupSuggestions.addView(chip);
                    }
                } else {
                    scrollSuggestions.setVisibility(View.GONE);
                }
            }
        }

        /**
         * Cleans and converts raw LLM Markdown into formatted Spanned text.
         * Strips any raw double-asterisks (**) and formats bold headings and clean bullets.
         */
        private CharSequence formatMarkdownToSpanned(String rawText) {
            if (rawText == null || rawText.trim().isEmpty()) {
                return "";
            }
            // 1. Normalize line breaks
            String formatted = rawText.replace("\r\n", "\n").replace("\r", "\n");

            // 2. Convert markdown bold **bold text** to <b>bold text</b>
            formatted = formatted.replaceAll("\\*\\*(.*?)\\*\\*", "<b>$1</b>");

            // 3. Convert markdown italic *italic text* to <i>italic text</i>
            formatted = formatted.replaceAll("(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)", "<i>$1</i>");

            // 4. Convert markdown bullets (* or - at line start) to nice bullet dots •
            formatted = formatted.replaceAll("(?m)^[\\*\\-]\\s+", "• ");

            // 5. Eliminate ANY remaining stray double or single asterisks (so NO raw ** ever appears)
            formatted = formatted.replace("**", "").replace("*", "");

            // 6. Convert newlines to HTML line breaks
            formatted = formatted.replace("\n", "<br/>");

            // 7. Parse HTML to Spanned
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                return Html.fromHtml(formatted, Html.FROM_HTML_MODE_COMPACT);
            } else {
                return Html.fromHtml(formatted);
            }
        }
    }
}
