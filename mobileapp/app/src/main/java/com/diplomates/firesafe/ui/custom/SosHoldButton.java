package com.diplomates.firesafe.ui.custom;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.AttributeSet;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.LinearInterpolator;

import androidx.core.content.ContextCompat;

import com.diplomates.firesafe.R;

public class SosHoldButton extends View {

    public interface OnSosTriggeredListener {
        void onSosTriggered();
        void onHoldProgress(float progress);
        void onHoldCancelled();
    }

    private static final long HOLD_DURATION_MS = 3000;

    private Paint backgroundPaint;
    private Paint progressPaint;
    private Paint textPaint;
    private Paint subtextPaint;
    private Paint pulsePaint;

    private RectF progressRect;
    private float progress = 0f; // 0.0 to 1.0
    private boolean isHolding = false;
    private long holdStartTime = 0;

    private ValueAnimator pulseAnimator;
    private float pulseRadiusFactor = 1.0f;
    private int pulseAlpha = 100;

    private Handler handler;
    private Runnable progressRunnable;
    private OnSosTriggeredListener listener;

    public SosHoldButton(Context context) {
        super(context);
        init();
    }

    public SosHoldButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public SosHoldButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        handler = new Handler(Looper.getMainLooper());
        progressRect = new RectF();

        int redColor = ContextCompat.getColor(getContext(), R.color.extreme);
        int whiteColor = ContextCompat.getColor(getContext(), R.color.white);

        backgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        backgroundPaint.setColor(redColor);
        backgroundPaint.setStyle(Paint.Style.FILL);

        pulsePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pulsePaint.setColor(redColor);
        pulsePaint.setStyle(Paint.Style.FILL);

        progressPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        progressPaint.setColor(whiteColor);
        progressPaint.setStyle(Paint.Style.STROKE);
        progressPaint.setStrokeWidth(12f);
        progressPaint.setStrokeCap(Paint.Cap.ROUND);

        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(whiteColor);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setFakeBoldText(true);

        subtextPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        subtextPaint.setColor(whiteColor);
        subtextPaint.setTextAlign(Paint.Align.CENTER);
        subtextPaint.setAlpha(220);

        // Continuous subtle pulse animation
        pulseAnimator = ValueAnimator.ofFloat(1.0f, 1.25f);
        pulseAnimator.setDuration(1200);
        pulseAnimator.setRepeatCount(ValueAnimator.INFINITE);
        pulseAnimator.setRepeatMode(ValueAnimator.REVERSE);
        pulseAnimator.addUpdateListener(animation -> {
            pulseRadiusFactor = (float) animation.getAnimatedValue();
            pulseAlpha = (int) (120 * (1.25f - pulseRadiusFactor) / 0.25f);
            if (!isHolding) {
                invalidate();
            }
        });
        pulseAnimator.start();

        progressRunnable = new Runnable() {
            @Override
            public void run() {
                if (isHolding) {
                    long elapsed = System.currentTimeMillis() - holdStartTime;
                    progress = Math.min(1.0f, (float) elapsed / HOLD_DURATION_MS);
                    if (listener != null) {
                        listener.onHoldProgress(progress);
                    }
                    invalidate();

                    if (progress >= 1.0f) {
                        isHolding = false;
                        triggerVibrateComplete();
                        if (listener != null) {
                            listener.onSosTriggered();
                        }
                    } else {
                        handler.postDelayed(this, 30);
                    }
                }
            }
        };
    }

    public void setOnSosTriggeredListener(OnSosTriggeredListener listener) {
        this.listener = listener;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int desiredSize = getResources().getDimensionPixelSize(R.dimen.sos_button_size);
        int width = resolveSize(desiredSize, widthMeasureSpec);
        int height = resolveSize(desiredSize, heightMeasureSpec);
        int size = Math.min(width, height);
        setMeasuredDimension(size, size);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        float cx = getWidth() / 2f;
        float cy = getHeight() / 2f;
        float radius = Math.min(cx, cy) * 0.75f;

        // Draw pulse outer glow
        pulsePaint.setAlpha(isHolding ? 180 : Math.max(0, Math.min(255, pulseAlpha)));
        float currentPulseRadius = radius * (isHolding ? (1.0f + progress * 0.35f) : pulseRadiusFactor);
        canvas.drawCircle(cx, cy, currentPulseRadius, pulsePaint);

        // Draw primary red circle
        canvas.drawCircle(cx, cy, radius, backgroundPaint);

        // Draw hold circular progress ring
        if (progress > 0) {
            float strokePadding = progressPaint.getStrokeWidth() / 2f + 4f;
            progressRect.set(cx - radius + strokePadding, cy - radius + strokePadding,
                    cx + radius - strokePadding, cy + radius - strokePadding);
            canvas.drawArc(progressRect, -90, progress * 360f, false, progressPaint);
        }

        // Draw text
        textPaint.setTextSize(radius * 0.44f);
        float textY = cy + (textPaint.getTextSize() * 0.35f) - (radius * 0.08f);
        canvas.drawText("SOS", cx, textY, textPaint);

        // Small hold instruction below or hint
        subtextPaint.setTextSize(radius * 0.16f);
        if (isHolding) {
            int remainingSec = (int) Math.ceil((1.0f - progress) * 3);
            canvas.drawText(remainingSec + "s", cx, cy + radius * 0.46f, subtextPaint);
        } else {
            canvas.drawText("HOLD 3S", cx, cy + radius * 0.46f, subtextPaint);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                isHolding = true;
                holdStartTime = System.currentTimeMillis();
                progress = 0f;
                performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
                handler.post(progressRunnable);
                invalidate();
                return true;

            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                if (isHolding) {
                    isHolding = false;
                    progress = 0f;
                    handler.removeCallbacks(progressRunnable);
                    if (listener != null) {
                        listener.onHoldCancelled();
                    }
                    invalidate();
                }
                return true;
        }
        return super.onTouchEvent(event);
    }

    private void triggerVibrateComplete() {
        try {
            Vibrator v = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createWaveform(new long[]{0, 150, 100, 300}, -1));
                } else {
                    v.vibrate(400);
                }
            }
        } catch (Exception ignored) {}
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        if (pulseAnimator != null) {
            pulseAnimator.cancel();
        }
        handler.removeCallbacks(progressRunnable);
    }
}
