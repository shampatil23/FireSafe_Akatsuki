package com.diplomates.firesafe;

import android.Manifest;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.annotation.SuppressLint;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.graphics.Color;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import android.view.ViewGroup;
import android.speech.tts.TextToSpeech;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.core.widget.NestedScrollView;
import android.util.TypedValue;
import android.view.animation.AccelerateInterpolator;
import android.view.animation.DecelerateInterpolator;

import com.diplomates.firesafe.data.api.FireSafeApiClient;
import com.diplomates.firesafe.data.api.GroqAiService;
import com.diplomates.firesafe.data.model.ChatMessage;
import com.diplomates.firesafe.data.model.FireAlert;
import com.diplomates.firesafe.data.model.FireRiskStatus;
import com.diplomates.firesafe.data.model.PrecautionItem;
import com.diplomates.firesafe.data.model.SafeShelter;
import com.diplomates.firesafe.data.model.SosEvent;
import com.diplomates.firesafe.data.repository.FireSafeRepository;
import com.diplomates.firesafe.ui.adapters.AlertsAdapter;
import com.diplomates.firesafe.ui.adapters.ChatAdapter;
import com.diplomates.firesafe.ui.adapters.EvacuationStepsAdapter;
import com.diplomates.firesafe.ui.adapters.SheltersAdapter;
import com.diplomates.firesafe.ui.custom.FloatingBottomNavView;
import com.diplomates.firesafe.ui.custom.InteractiveFireMapView;
import com.diplomates.firesafe.ui.custom.SosHoldButton;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import com.diplomates.firesafe.data.api.CloudinaryUploader;
import com.diplomates.firesafe.data.model.EmergencyContact;
import com.diplomates.firesafe.data.repository.EmergencyContactsManager;
import com.diplomates.firesafe.util.SosAudioRecorder;
import com.diplomates.firesafe.util.SosSmsDispatcher;
import com.diplomates.firesafe.data.model.ControlRoomMessage;
import com.diplomates.firesafe.data.model.ControlRoomTicket;
import com.diplomates.firesafe.data.repository.ControlRoomManager;
import com.diplomates.firesafe.ui.adapters.ControlRoomAdapter;
import android.view.LayoutInflater;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textfield.TextInputEditText;
import java.io.File;
import androidx.annotation.NonNull;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity implements FireSafeRepository.OnRiskStatusChangedListener {

    private FireSafeRepository repository;

    // Top Bar views
    private TextView tvTopLocation;
    private TextView tvTopUpdated;
    private TextView tvTopConnectionBadge;
    private View viewUnreadBellDot;

    // Simulation chips — kept as null fields; views removed from production UI
    private Chip chipSimSafe, chipSimWarning, chipSimHigh, chipSimExtreme, chipSimOffline;

    // Main Tab Views
    private View viewHome, viewMap, viewAlerts, viewAccount;
    private FloatingBottomNavView bottomNavigation;

    // Floating SOS
    private View layoutFloatingSos;
    // tvSosHoldHint removed from production UI
    private SosHoldButton btnSosHold;
    private ConnectivityManager.NetworkCallback networkCallback;

    // Home Screen Views
    private MaterialCardView cardOfflineBanner;
    private MaterialCardView cardSafetyStatus;
    private ImageView ivSafetyIcon;
    private TextView tvSafetyBadge;
    private TextView tvSafetyTitle;
    private TextView tvSafetySubtitle;
    private TextView tvSafetyTimestamp;
    private MaterialButton btnStatusEvacuate;


    // Top Priority Alert Views (Home Screen)
    private TextView tvHomeAlertBadge, tvHomeAlertTime, tvHomeAlertTitle, tvHomeAlertLocation;
    private TextView tvHomeAlertDistance, tvHomeAlertDirection, tvHomeAlertSpread, tvHomeAlertAction;
    private MaterialButton btnHomeAlertEvacuate, btnHomeAlertViewMap;

    private View cardQaShelters, cardQaPrecautions, cardQaOffline, cardQaSanthi;
    private TextView tvHomeShelterName, tvHomeShelterDistTime;
    private MaterialButton btnHomeNavigateShelter;

    // Map Screen Views
    private InteractiveFireMapView fullInteractiveMapView;
    private Chip chipLayerFire, chipLayerRisk, chipLayerShelters, chipLayerRoute;
    private MaterialButton btnMapEvacuateSafely;
    private TextView tvMapRiskTitle, tvMapRiskDistance;
    private MaterialCardView cardMapRiskSummary;
    private ImageView ivMapRiskIcon;
    private TextView tvMapCurrentLocation;

    // Alerts Screen Views
    private RecyclerView rvAlertsTimeline;
    private AlertsAdapter alertsAdapter;
    private View layoutAlertsEmpty;
    private ChipGroup chipGroupAlertFilter;

    // Account Screen Views
    private TextView tvImSafeStatus;
    private View btnSendImSafe;
    private View btnNationalEmergency112;

    // Dedicated Overlays
    private View topBar, viewEvacuation, viewSanthiChat, viewShelters, viewPrecautions, viewSosDialog;
    private View viewControlRoom, viewSendAlertDialog;

    // Control Room WhatsApp Chat Views
    private ControlRoomAdapter controlRoomAdapter;
    private RecyclerView rvControlRoomMessages;
    private EditText etControlRoomMessage;
    private View btnSendControlRoomMessage;
    private View cardTicketActiveBanner, cardTicketInactiveBanner;
    private TextView tvActiveTicketId, tvActiveTicketDetails, tvControlRoomSubtitle;
    private MaterialButton btnResolveTicket, btnBannerTriggerSos, btnBannerSendAlert;
    private TextView tvSosTicketNumber;
    private View btnSosOpenControlRoom;

    // Evacuation Views & Turn-by-Turn TTS Engine (Google Maps Style)
    private InteractiveFireMapView evacMapView;
    private View cardNavTopBanner;
    private ImageView ivNavManeuverIcon;
    private TextView tvNavDistanceMeters;
    private TextView tvNavInstruction;
    private TextView tvNavStreetName;
    private TextView tvNavNextPreview;
    private View btnVoiceToggle;
    private ImageView ivVoiceToggleIcon;
    private TextView tvNavHazardAlert;
    private TextView tvNavEtaMinutes;
    private TextView tvNavRemainingDist;
    private TextView tvNavEstimatedArrival;
    private TextView tvNavDestinationShelter;
    private MaterialButton btnNavSimulateProgress;
    private MaterialButton btnNavRepeatVoice;
    private View layoutEvacuationStepsModal;
    private RecyclerView rvEvacuationSteps;
    private EvacuationStepsAdapter evacuationStepsAdapter;

    private TextToSpeech textToSpeech;
    private boolean isVoiceNavEnabled = true;
    private int currentEvacStepIndex = 0;
    private int currentStepSubState = 0;

    // SANthi Chat Views
    private RecyclerView rvChatMessages;
    private ChatAdapter chatAdapter;
    private EditText etChatMessage;
    private View btnSendChatMessage;
    private ImageView ivSendChatMessage;
    private TextView tvChatStatusBadge;

    // Shelters Directory Views
    private RecyclerView rvSheltersDirectory;
    private SheltersAdapter sheltersAdapter;

    // Precautions Views
    private LinearLayout containerPrecautions;

    // SOS Dialog Views & Audio / SMS Engine
    private ProgressBar pbSosStatus;
    private ImageView ivSosStatusDone;
    private TextView tvSosStatusText;
    private TextView tvSosCoordinates, tvSosTimestamp, tvSosBattery;
    private MaterialButton btnSosCall112, btnSosCancel;
    private final Handler sosHandler = new Handler(Looper.getMainLooper());

    private SosAudioRecorder sosAudioRecorder;
    private TextView tvSosAudioStatus, tvSosCloudinaryUrl, tvSosSmsStatus;
    private ImageView ivSosAudioStatusIcon, ivSosSmsIcon;
    private MaterialButton btnSosStopRecord;
    private String currentSosAudioFilePath;
    private String currentSosPushKey = "";
    private SosEvent currentActiveSosEvent;

    // Account Emergency Contacts & Profile
    private LinearLayout layoutEmergencyContactsContainer;
    private MaterialButton btnAddEmergencyContact;
    private TextView tvCitizenInitials;
    private TextView tvCitizenName;
    private TextView tvCitizenLocation;
    private TextView tvCitizenMedicalId;

    // Real-Time Live GPS Tracking
    private static final int RC_LOCATION_PERMISSION = 101;
    private LocationManager locationManager;
    private LocationListener liveLocationListener;
    private Location lastKnownLiveLocation;
    private boolean hasRealLocationFix = false;
    private boolean hasSyncedRealLocation = false;
    private String currentLiveAddress = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        repository = FireSafeRepository.getInstance();

        initViews();
        initLiveGpsTracking();
        setupNetworkMonitoring();
        FireSafeApiClient.getInstance().initFromGoogleServicesJson(this);
        setupWindowInsets();
        setupBottomNavigation();
        setupSimulationControls();
        setupHomeInteractions();
        setupMapInteractions();
        setupAlertsScreen();
        setupAccountScreen();
        initTextToSpeech();
        setupEvacuationScreen();
        setupSanthiChat();
        setupSheltersDirectory();
        setupPrecautionsScreen();
        setupSosButton();
        setupControlRoom();
        setupSendAlertDialog();
        setupBackNavigation();

        repository.addListener(this);
        setupRealtimeApiSync();
        wildfirePollingHandler.post(wildfirePollingRunnable);
    }

    private void initViews() {
        tvTopLocation = findViewById(R.id.tvTopLocation);
        tvTopUpdated = findViewById(R.id.tvTopUpdated);
        tvTopConnectionBadge = findViewById(R.id.tvTopConnectionBadge);
        viewUnreadBellDot = findViewById(R.id.viewUnreadBellDot);

        // Chip simulation IDs removed from production layout
        // chipSimSafe = chipSimWarning = chipSimHigh = chipSimExtreme = chipSimOffline = null;

        topBar = findViewById(R.id.topBar);
        viewHome = findViewById(R.id.viewHome);
        viewMap = findViewById(R.id.viewMap);
        viewAlerts = findViewById(R.id.viewAlerts);
        viewAccount = findViewById(R.id.viewAccount);

        viewEvacuation = findViewById(R.id.viewEvacuation);
        viewSanthiChat = findViewById(R.id.viewSanthiChat);
        viewShelters = findViewById(R.id.viewShelters);
        viewPrecautions = findViewById(R.id.viewPrecautions);
        viewControlRoom = findViewById(R.id.viewControlRoom);
        viewSosDialog = findViewById(R.id.viewSosDialog);
        viewSendAlertDialog = findViewById(R.id.viewSendAlertDialog);
        tvSosTicketNumber = findViewById(R.id.tvSosTicketNumber);
        btnSosOpenControlRoom = findViewById(R.id.btnSosOpenControlRoom);

        bottomNavigation = findViewById(R.id.bottomNavigation);
        layoutFloatingSos = findViewById(R.id.layoutFloatingSos);
        // tvSosHoldHint removed from production UI
        btnSosHold = findViewById(R.id.btnSosHold);

        // Home widgets
        cardOfflineBanner = findViewById(R.id.cardOfflineBanner);
        cardSafetyStatus = findViewById(R.id.cardSafetyStatus);
        ivSafetyIcon = findViewById(R.id.ivSafetyIcon);
        tvSafetyBadge = findViewById(R.id.tvSafetyBadge);
        tvSafetyTitle = findViewById(R.id.tvSafetyTitle);
        tvSafetySubtitle = findViewById(R.id.tvSafetySubtitle);
        tvSafetyTimestamp = findViewById(R.id.tvSafetyTimestamp);
        btnStatusEvacuate = findViewById(R.id.btnStatusEvacuate);

        // Top Priority Alert Views
        tvHomeAlertBadge = findViewById(R.id.tvHomeAlertBadge);
        tvHomeAlertTime = findViewById(R.id.tvHomeAlertTime);
        tvHomeAlertTitle = findViewById(R.id.tvHomeAlertTitle);
        tvHomeAlertLocation = findViewById(R.id.tvHomeAlertLocation);
        tvHomeAlertDistance = findViewById(R.id.tvHomeAlertDistance);
        tvHomeAlertDirection = findViewById(R.id.tvHomeAlertDirection);
        tvHomeAlertSpread = findViewById(R.id.tvHomeAlertSpread);
        tvHomeAlertAction = findViewById(R.id.tvHomeAlertAction);
        btnHomeAlertEvacuate = findViewById(R.id.btnHomeAlertEvacuate);
        btnHomeAlertViewMap = findViewById(R.id.btnHomeAlertViewMap);
        refreshTopPriorityAlertCard();

        cardQaShelters = findViewById(R.id.cardQaShelters);
        cardQaPrecautions = findViewById(R.id.cardQaPrecautions);
        cardQaOffline = findViewById(R.id.cardQaOffline);
        cardQaSanthi = findViewById(R.id.cardQaSanthi);

        tvHomeShelterName = findViewById(R.id.tvHomeShelterName);
        tvHomeShelterDistTime = findViewById(R.id.tvHomeShelterDistTime);
        btnHomeNavigateShelter = findViewById(R.id.btnHomeNavigateShelter);

        SafeShelter initNearest = repository.getNearestShelter();
        if (initNearest != null && tvHomeShelterName != null && tvHomeShelterDistTime != null) {
            tvHomeShelterName.setText(initNearest.getName());
            tvHomeShelterDistTime.setText(String.format(Locale.US, "%.1f km • approx %d mins • 📍 Lat: %.4f° N, Lng: %.4f° E",
                    initNearest.getDistanceKm(), initNearest.getTravelTimeMinutes(), initNearest.getLatitude(), initNearest.getLongitude()));
        }

        // Map widgets
        fullInteractiveMapView = findViewById(R.id.fullInteractiveMapView);
        chipLayerFire = findViewById(R.id.chipLayerFire);
        chipLayerRisk = findViewById(R.id.chipLayerRisk);
        chipLayerShelters = findViewById(R.id.chipLayerShelters);
        chipLayerRoute = findViewById(R.id.chipLayerRoute);
        btnMapEvacuateSafely = findViewById(R.id.btnMapEvacuateSafely);
        tvMapRiskTitle = findViewById(R.id.tvMapRiskTitle);
        tvMapRiskDistance = findViewById(R.id.tvMapRiskDistance);
        cardMapRiskSummary = findViewById(R.id.cardMapRiskSummary);
        ivMapRiskIcon = findViewById(R.id.ivMapRiskIcon);
        tvMapCurrentLocation = findViewById(R.id.tvMapCurrentLocation);
        refreshMapRiskSummaryCard();

        // Alerts widgets
        rvAlertsTimeline = findViewById(R.id.rvAlertsTimeline);
        layoutAlertsEmpty = findViewById(R.id.layoutAlertsEmpty);
        chipGroupAlertFilter = findViewById(R.id.chipGroupAlertFilter);

        // Account widgets
        tvImSafeStatus = findViewById(R.id.tvImSafeStatus);
        btnSendImSafe = findViewById(R.id.btnSendImSafe);
        btnNationalEmergency112 = findViewById(R.id.btnNationalEmergency112);
        tvCitizenInitials = findViewById(R.id.tvCitizenInitials);
        tvCitizenName = findViewById(R.id.tvCitizenName);
        tvCitizenLocation = findViewById(R.id.tvCitizenLocation);
        tvCitizenMedicalId = findViewById(R.id.tvCitizenMedicalId);

        // Evacuation widgets (Google Maps Navigation Style)
        evacMapView = findViewById(R.id.evacMapView);
        cardNavTopBanner = findViewById(R.id.cardNavTopBanner);
        ivNavManeuverIcon = findViewById(R.id.ivNavManeuverIcon);
        tvNavDistanceMeters = findViewById(R.id.tvNavDistanceMeters);
        tvNavInstruction = findViewById(R.id.tvNavInstruction);
        tvNavStreetName = findViewById(R.id.tvNavStreetName);
        tvNavNextPreview = findViewById(R.id.tvNavNextPreview);
        btnVoiceToggle = findViewById(R.id.btnVoiceToggle);
        ivVoiceToggleIcon = findViewById(R.id.ivVoiceToggleIcon);
        tvNavHazardAlert = findViewById(R.id.tvNavHazardAlert);
        tvNavEtaMinutes = findViewById(R.id.tvNavEtaMinutes);
        tvNavRemainingDist = findViewById(R.id.tvNavRemainingDist);
        tvNavEstimatedArrival = findViewById(R.id.tvNavEstimatedArrival);
        tvNavDestinationShelter = findViewById(R.id.tvNavDestinationShelter);
        btnNavSimulateProgress = findViewById(R.id.btnNavSimulateProgress);
        btnNavRepeatVoice = findViewById(R.id.btnNavRepeatVoice);
        layoutEvacuationStepsModal = findViewById(R.id.layoutEvacuationStepsModal);
        rvEvacuationSteps = findViewById(R.id.rvEvacuationSteps);

        // SANthi widgets
        rvChatMessages = findViewById(R.id.rvChatMessages);
        etChatMessage = findViewById(R.id.etChatMessage);
        btnSendChatMessage = findViewById(R.id.btnSendChatMessage);
        ivSendChatMessage = findViewById(R.id.ivSendChatMessage);
        tvChatStatusBadge = findViewById(R.id.tvChatStatusBadge);

        // Shelters directory
        rvSheltersDirectory = findViewById(R.id.rvSheltersDirectory);

        // Precautions
        containerPrecautions = findViewById(R.id.containerPrecautions);

        // SOS Dialog
        pbSosStatus = findViewById(R.id.pbSosStatus);
        ivSosStatusDone = findViewById(R.id.ivSosStatusDone);
        tvSosStatusText = findViewById(R.id.tvSosStatusText);
        tvSosCoordinates = findViewById(R.id.tvSosCoordinates);
        tvSosTimestamp = findViewById(R.id.tvSosTimestamp);
        tvSosBattery = findViewById(R.id.tvSosBattery);
        btnSosCall112 = findViewById(R.id.btnSosCall112);
        btnSosCancel = findViewById(R.id.btnSosCancel);

        // SOS Audio Recording & Cloudinary Upload views
        tvSosAudioStatus = findViewById(R.id.tvSosAudioStatus);
        tvSosCloudinaryUrl = findViewById(R.id.tvSosCloudinaryUrl);
        tvSosSmsStatus = findViewById(R.id.tvSosSmsStatus);
        ivSosAudioStatusIcon = findViewById(R.id.ivSosAudioStatusIcon);
        ivSosSmsIcon = findViewById(R.id.ivSosSmsIcon);
        btnSosStopRecord = findViewById(R.id.btnSosStopRecord);

        // Account Emergency Contacts
        layoutEmergencyContactsContainer = findViewById(R.id.layoutEmergencyContactsContainer);
        btnAddEmergencyContact = findViewById(R.id.btnAddEmergencyContact);
    }

    private int cachedStatusBarHeight = 0;
    private int cachedNavigationBarHeight = 0;

    private void setupWindowInsets() {
        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            cachedStatusBarHeight = getResources().getDimensionPixelSize(resourceId);
        } else {
            cachedStatusBarHeight = (int) dpToPx(28);
        }
        applySystemBarInsets(cachedStatusBarHeight, 0);
        setStatusBarAppearance(true);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            if (systemBars.top > 0) {
                cachedStatusBarHeight = systemBars.top;
            }
            if (systemBars.bottom > 0) {
                cachedNavigationBarHeight = systemBars.bottom;
            }

            applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);
            return insets;
        });
    }

    private void applySystemBarInsets(int statusBarTop, int navBarBottom) {
        if (statusBarTop <= 0) return;

        // 1. Top Bar (Home, Live Map, Alerts)
        View topBarView = findViewById(R.id.topBar);
        if (topBarView != null) {
            topBarView.setPadding(
                    (int) dpToPx(16),
                    statusBarTop + (int) dpToPx(8),
                    (int) dpToPx(16),
                    (int) dpToPx(8)
            );
        }

        // 2. Safe Shelters Directory Header
        View headerShelters = findViewById(R.id.headerShelters);
        if (headerShelters != null) {
            headerShelters.setPadding(
                    (int) dpToPx(16),
                    statusBarTop + (int) dpToPx(8),
                    (int) dpToPx(16),
                    (int) dpToPx(8)
            );
        }

        // 3. SANthi AI Chatbot Header
        View headerSanthiChat = findViewById(R.id.headerSanthiChat);
        if (headerSanthiChat != null) {
            headerSanthiChat.setPadding(
                    (int) dpToPx(16),
                    statusBarTop + (int) dpToPx(8),
                    (int) dpToPx(16),
                    (int) dpToPx(8)
            );
        }

        // 4. WhatsApp Style Control Room Header
        View headerControlRoom = findViewById(R.id.headerControlRoom);
        if (headerControlRoom != null) {
            headerControlRoom.setPadding(
                    (int) dpToPx(4),
                    statusBarTop + (int) dpToPx(8),
                    (int) dpToPx(12),
                    (int) dpToPx(8)
            );
        }

        // 5. Wildfire Precautions Header
        View headerPrecautions = findViewById(R.id.headerPrecautions);
        if (headerPrecautions != null) {
            headerPrecautions.setPadding(
                    (int) dpToPx(16),
                    statusBarTop + (int) dpToPx(8),
                    (int) dpToPx(16),
                    (int) dpToPx(8)
            );
        }

        // 6. Turn-by-Turn Evacuation HUD Top Bar
        View layoutEvacTopHud = findViewById(R.id.layoutEvacTopHud);
        if (layoutEvacTopHud != null) {
            layoutEvacTopHud.setPadding(
                    layoutEvacTopHud.getPaddingLeft(),
                    statusBarTop + (int) dpToPx(10),
                    layoutEvacTopHud.getPaddingRight(),
                    layoutEvacTopHud.getPaddingBottom()
            );
        }

        // 7. Citizen Account Profile Header
        View layoutAccountHeader = findViewById(R.id.layoutAccountHeader);
        if (layoutAccountHeader != null) {
            layoutAccountHeader.setPadding(
                    (int) dpToPx(20),
                    statusBarTop + (int) dpToPx(16),
                    (int) dpToPx(20),
                    (int) dpToPx(14)
            );
        }

        // 8. Modals / Dialogs safe top inset
        View layoutSosDialogRoot = findViewById(R.id.layoutSosDialogRoot);
        if (layoutSosDialogRoot != null) {
            layoutSosDialogRoot.setPadding(
                    layoutSosDialogRoot.getPaddingLeft(),
                    statusBarTop + (int) dpToPx(16),
                    layoutSosDialogRoot.getPaddingRight(),
                    layoutSosDialogRoot.getPaddingBottom()
            );
        }
        View layoutSendAlertDialogRoot = findViewById(R.id.layoutSendAlertDialogRoot);
        if (layoutSendAlertDialogRoot != null) {
            layoutSendAlertDialogRoot.setPadding(
                    layoutSendAlertDialogRoot.getPaddingLeft(),
                    statusBarTop + (int) dpToPx(16),
                    layoutSendAlertDialogRoot.getPaddingRight(),
                    layoutSendAlertDialogRoot.getPaddingBottom()
            );
        }

        // 9. Floating Bottom Navigation & Floating SOS bottom margin adjustment
        if (navBarBottom > 0) {
            if (bottomNavigation != null && bottomNavigation.getLayoutParams() instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) bottomNavigation.getLayoutParams();
                lp.bottomMargin = (int) dpToPx(24) + navBarBottom;
                bottomNavigation.setLayoutParams(lp);
            }
            if (layoutFloatingSos != null && layoutFloatingSos.getLayoutParams() instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) layoutFloatingSos.getLayoutParams();
                lp.bottomMargin = (int) dpToPx(104) + navBarBottom;
                layoutFloatingSos.setLayoutParams(lp);
            }
        }

        // 10. SANthi AI Chat input bar bottom insets
        View layoutSanthiChatInputBar = findViewById(R.id.layoutSanthiChatInputBar);
        if (layoutSanthiChatInputBar != null) {
            layoutSanthiChatInputBar.setPadding(
                    (int) dpToPx(12),
                    (int) dpToPx(8),
                    (int) dpToPx(12),
                    (int) dpToPx(10) + Math.max(0, navBarBottom)
            );
        }
    }

    private void setStatusBarAppearance(boolean darkIcons) {
        if (getWindow() != null) {
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
            if (controller != null) {
                controller.setAppearanceLightStatusBars(darkIcons);
            }
        }
    }

    private boolean isBottomNavHidden = false;

    private void setupBottomNavigation() {
        bottomNavigation.setOnItemSelectedListener(id -> {
            closeAllOverlays();

            if (id == R.id.nav_home) {
                showTab(viewHome);
                return true;
            } else if (id == R.id.nav_services || id == R.id.nav_map) {
                showTab(viewMap);
                refreshMapRiskSummaryCard();
                if (fullInteractiveMapView != null) {
                    fullInteractiveMapView.updateMapFromRepository();
                }
                return true;
            } else if (id == R.id.nav_activity || id == R.id.nav_alerts) {
                showTab(viewAlerts);
                if (viewUnreadBellDot != null) {
                    viewUnreadBellDot.setVisibility(View.GONE);
                }
                refreshNotificationsList();
                return true;
            } else if (id == R.id.nav_account) {
                showTab(viewAccount);
                return true;
            }
            return false;
        });

        View topBell = findViewById(R.id.layoutNotificationBell);
        if (topBell != null) {
            topBell.setOnClickListener(v -> {
                closeAllOverlays();
                if (bottomNavigation != null) {
                    bottomNavigation.setSelectedItemId(R.id.nav_activity);
                }
                if (viewUnreadBellDot != null) {
                    viewUnreadBellDot.setVisibility(View.GONE);
                }
            });
        }

        setupScrollToHideBottomNav();
    }

    private void setupScrollToHideBottomNav() {
        // 1. Home tab scroll listener (NestedScrollView)
        NestedScrollView scrollHome = findViewById(R.id.scrollHome);
        if (scrollHome != null) {
            scrollHome.setOnScrollChangeListener((NestedScrollView.OnScrollChangeListener) (v, scrollX, scrollY, oldScrollX, oldScrollY) -> {
                if (scrollY <= 20) {
                    showBottomNavWithAnimation();
                } else if (scrollY - oldScrollY > 12) {
                    // Scrolling down into content -> hide bottom nav like Uber
                    hideBottomNavWithAnimation();
                } else if (oldScrollY - scrollY > 12) {
                    // Scrolling up towards top -> show bottom nav with animation
                    showBottomNavWithAnimation();
                }
            });
        }

        // 2. Alerts tab scroll listener (RecyclerView)
        if (rvAlertsTimeline != null) {
            rvAlertsTimeline.addOnScrollListener(new RecyclerView.OnScrollListener() {
                @Override
                public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                    super.onScrolled(recyclerView, dx, dy);
                    if (!recyclerView.canScrollVertically(-1)) {
                        showBottomNavWithAnimation();
                    } else if (dy > 10) {
                        hideBottomNavWithAnimation();
                    } else if (dy < -10) {
                        showBottomNavWithAnimation();
                    }
                }
            });
        }

        // 3. Account tab scroll listener (NestedScrollView)
        NestedScrollView layoutAccountRoot = findViewById(R.id.layoutAccountRoot);
        if (layoutAccountRoot != null) {
            layoutAccountRoot.setOnScrollChangeListener((NestedScrollView.OnScrollChangeListener) (v, scrollX, scrollY, oldScrollX, oldScrollY) -> {
                if (scrollY <= 20) {
                    showBottomNavWithAnimation();
                } else if (scrollY - oldScrollY > 12) {
                    hideBottomNavWithAnimation();
                } else if (oldScrollY - scrollY > 12) {
                    showBottomNavWithAnimation();
                }
            });
        }
    }

    private void hideBottomNavWithAnimation() {
        if (isBottomNavHidden || bottomNavigation == null) return;
        isBottomNavHidden = true;

        float targetY = (bottomNavigation.getHeight() > 0 ? bottomNavigation.getHeight() : dpToPx(72)) + dpToPx(60);

        bottomNavigation.animate()
                .translationY(targetY)
                .alpha(0.0f)
                .setDuration(260)
                .setInterpolator(new AccelerateInterpolator(1.2f))
                .start();

        if (layoutFloatingSos != null && layoutFloatingSos.getVisibility() == View.VISIBLE) {
            float sosTargetY = (layoutFloatingSos.getHeight() > 0 ? layoutFloatingSos.getHeight() : dpToPx(72)) + dpToPx(140);
            layoutFloatingSos.animate()
                    .translationY(sosTargetY)
                    .alpha(0.0f)
                    .setDuration(220)
                    .setInterpolator(new AccelerateInterpolator(1.2f))
                    .start();
        }
    }

    private void showBottomNavWithAnimation() {
        if (!isBottomNavHidden || bottomNavigation == null) return;
        isBottomNavHidden = false;

        bottomNavigation.animate()
                .translationY(0f)
                .alpha(1.0f)
                .setDuration(260)
                .setInterpolator(new DecelerateInterpolator(1.2f))
                .start();

        if (layoutFloatingSos != null && viewAccount != null && viewAccount.getVisibility() != View.VISIBLE) {
            layoutFloatingSos.animate()
                    .translationY(0f)
                    .alpha(1.0f)
                    .setDuration(260)
                    .setInterpolator(new DecelerateInterpolator(1.2f))
                    .start();
        }
    }

    private void showBottomNavigationImmediately() {
        isBottomNavHidden = false;
        if (bottomNavigation != null) {
            bottomNavigation.animate().cancel();
            bottomNavigation.setTranslationY(0f);
            bottomNavigation.setAlpha(1.0f);
        }
        if (layoutFloatingSos != null) {
            layoutFloatingSos.animate().cancel();
            layoutFloatingSos.setTranslationY(0f);
            layoutFloatingSos.setAlpha(1.0f);
        }
    }

    private float dpToPx(float dp) {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, getResources().getDisplayMetrics());
    }

    private void showTab(View targetTab) {
        viewHome.setVisibility(targetTab == viewHome ? View.VISIBLE : View.GONE);
        viewMap.setVisibility(targetTab == viewMap ? View.VISIBLE : View.GONE);
        viewAlerts.setVisibility(targetTab == viewAlerts ? View.VISIBLE : View.GONE);
        viewAccount.setVisibility(targetTab == viewAccount ? View.VISIBLE : View.GONE);

        showBottomNavigationImmediately();

        if (topBar != null) {
            topBar.setVisibility(targetTab == viewAccount ? View.GONE : View.VISIBLE);
        }

        View layoutFloatingSos = findViewById(R.id.layoutFloatingSos);
        if (layoutFloatingSos != null) {
            layoutFloatingSos.setVisibility(targetTab == viewAccount ? View.GONE : View.VISIBLE);
        }

        setStatusBarAppearance(true);
        if (cachedStatusBarHeight > 0) {
            applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);
        }
    }

    private void setupSimulationControls() {
        // Simulation chips removed from production UI; guard against null
        if (chipSimSafe != null) chipSimSafe.setOnClickListener(v -> repository.setRiskStatus(FireRiskStatus.SAFE));
        if (chipSimWarning != null) chipSimWarning.setOnClickListener(v -> repository.setRiskStatus(FireRiskStatus.WARNING));
        if (chipSimHigh != null) chipSimHigh.setOnClickListener(v -> repository.setRiskStatus(FireRiskStatus.HIGH));
        if (chipSimExtreme != null) chipSimExtreme.setOnClickListener(v -> repository.setRiskStatus(FireRiskStatus.EXTREME));
        if (chipSimOffline != null) chipSimOffline.setOnClickListener(v -> repository.setOffline(!repository.isOffline()));
    }


    public void openFullScreenMap() {
        closeAllOverlays();
        showTab(viewMap);
        bottomNavigation.setSelectedItemId(R.id.nav_services);
        refreshMapRiskSummaryCard();
        if (fullInteractiveMapView != null) {
            fullInteractiveMapView.updateMapFromRepository();
        }
    }

    private void setupHomeInteractions() {
        btnStatusEvacuate.setOnClickListener(v -> openGoogleMapsForActiveIncident());
        btnHomeNavigateShelter.setOnClickListener(v -> openGoogleMapsForNearestShelter());

        // Unified Threat & Active Alert Card CTAs
        if (btnHomeAlertEvacuate != null) {
            btnHomeAlertEvacuate.setOnClickListener(v -> {
                if (repository.getCurrentRiskStatus() == FireRiskStatus.SAFE) {
                    openPrecautionsScreen();
                } else {
                    openGoogleMapsForActiveIncident();
                }
            });
        }
        if (btnHomeAlertViewMap != null) {
            btnHomeAlertViewMap.setOnClickListener(v -> openFullScreenMap());
        }
        if (cardSafetyStatus != null) {
            cardSafetyStatus.setOnClickListener(v -> showDetailedAlertBottomSheet());
        }
        View cardTopPriorityAlert = findViewById(R.id.cardTopPriorityAlert);
        if (cardTopPriorityAlert != null) {
            cardTopPriorityAlert.setOnClickListener(v -> showDetailedAlertBottomSheet());
        }

        // Top Navbar Location Selector Dropdown & Chevron Arrow
        View.OnClickListener openLocationPicker = v -> showLocationPickerDialog();
        View layoutLocationSelector = findViewById(R.id.layoutLocationSelector);
        if (layoutLocationSelector != null) {
            layoutLocationSelector.setOnClickListener(openLocationPicker);
        }
        View layoutLocationHeader = findViewById(R.id.layoutLocationHeader);
        if (layoutLocationHeader != null) {
            layoutLocationHeader.setOnClickListener(openLocationPicker);
        }
        View btnLocationDropdown = findViewById(R.id.btnLocationDropdown);
        if (btnLocationDropdown != null) {
            btnLocationDropdown.setOnClickListener(openLocationPicker);
        }
        if (tvTopLocation != null) {
            tvTopLocation.setOnClickListener(openLocationPicker);
        }
        if (tvTopUpdated != null) {
            tvTopUpdated.setOnClickListener(openLocationPicker);
        }

        cardQaShelters.setOnClickListener(v -> openSheltersDirectory());
        cardQaPrecautions.setOnClickListener(v -> openPrecautionsScreen());
        cardQaOffline.setOnClickListener(v -> openSanthiChatScreen());
        cardQaSanthi.setOnClickListener(v -> openControlRoomScreen());
        findViewById(R.id.cardReportIssue).setOnClickListener(v -> startActivity(new Intent(this, ReportIssueActivity.class)));


        View layoutNotificationBell = findViewById(R.id.layoutNotificationBell);
        if (layoutNotificationBell != null) {
            layoutNotificationBell.setOnClickListener(v -> {
                closeAllOverlays();
                if (bottomNavigation != null) {
                    bottomNavigation.setSelectedItemId(R.id.nav_activity);
                }
                if (viewUnreadBellDot != null) {
                    viewUnreadBellDot.setVisibility(View.GONE);
                }
            });
        }
    }

    private void showLocationPickerDialog() {
        final String[] locationNames = {
                "📍 Use Current Live GPS",
                "Bibwewadi / VIT Campus, Pune",
                "Pune City Center, Maharashtra",
                "Nainital District, Uttarakhand",
                "Shimla Forest Division, HP",
                "Bandipur Tiger Reserve, Karnataka",
                "Wayanad Forest Range, Kerala",
                "Gir Forest National Park, Gujarat"
        };
        final double[][] coordinates = {
                {0, 0}, // GPS
                {18.4695, 73.8640},
                {18.5204, 73.8567},
                {29.3900, 79.4500},
                {31.1048, 77.1734},
                {11.6664, 76.6291},
                {11.6854, 76.1320},
                {21.1243, 70.8242}
        };

        new com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                .setTitle("Select Monitoring Region")
                .setIcon(R.drawable.ic_location_pin)
                .setItems(locationNames, (dialog, which) -> {
                    if (which == 0) {
                        initLiveGpsTracking();
                        if (hasRealLocationFix && lastKnownLiveLocation != null) {
                            applyLiveLocation(lastKnownLiveLocation, true);
                            Toast.makeText(this, "Acquired live GPS fix", Toast.LENGTH_SHORT).show();
                        } else {
                            tvTopLocation.setText("Acquiring GPS fix...");
                            tvTopUpdated.setText("Live tracking");
                            Toast.makeText(this, "Requesting real-time satellite GPS fix...", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        changeLocation(locationNames[which], coordinates[which][0], coordinates[which][1]);
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void changeLocation(String name, double lat, double lng) {
        repository.updateCurrentLocation(name, lat, lng);
        tvTopLocation.setText(name);
        tvTopUpdated.setText("Updated just now");
        setupRealtimeApiSync();
        refreshTopPriorityAlertCard();
        refreshMapRiskSummaryCard();
        if (fullInteractiveMapView != null) {
            fullInteractiveMapView.updateMapFromRepository();
            fullInteractiveMapView.resetCenter();
        }
        Toast.makeText(this, "Monitoring location updated: " + name, Toast.LENGTH_SHORT).show();
    }

    private void refreshTopPriorityAlertCard() {
        if (tvSafetyTitle == null) return;
        List<FireAlert> alerts = repository.getAlerts();
        FireAlert topAlert = (alerts != null && !alerts.isEmpty()) ? alerts.get(0) : null;
        FireRiskStatus status = repository.getCurrentRiskStatus();

        int strokeColor;
        int statusColor;
        int bgColor;
        int badgeBgRes;
        int iconRes;

        if (status == FireRiskStatus.EXTREME) {
            strokeColor = ContextCompat.getColor(this, R.color.extreme_stroke);
            statusColor = ContextCompat.getColor(this, R.color.extreme);
            bgColor = ContextCompat.getColor(this, R.color.extreme_subtle);
            badgeBgRes = R.drawable.bg_badge_extreme;
            iconRes = R.drawable.ic_fire;

            if (tvSafetyBadge != null) tvSafetyBadge.setText("Extreme Risk");
            if (tvSafetyTitle != null) tvSafetyTitle.setText(topAlert != null ? topAlert.getTitle().toUpperCase(Locale.US) : "ACTIVE WILDFIRE DETECTED");
            if (tvSafetySubtitle != null) {
                String sub = topAlert != null
                        ? ("Active threat " + String.format(Locale.US, "%.1f km away", topAlert.getDistanceKm()) + " near " + topAlert.getLocationName())
                        : "Active fire anomaly detected 4.2 km away near Vetal Hills Ridge";
                tvSafetySubtitle.setText(sub);
            }
            if (tvHomeAlertTime != null) {
                tvHomeAlertTime.setText("● Active Threat • " + (topAlert != null ? topAlert.getTimeDetected() : "14m ago"));
            }

            // Hidden stubs compatibility
            if (tvHomeAlertLocation != null) tvHomeAlertLocation.setText(topAlert != null ? topAlert.getLocationName() : repository.getCurrentLocationName());
            if (tvHomeAlertDistance != null) tvHomeAlertDistance.setText(topAlert != null ? String.format(Locale.US, "%.1f km", topAlert.getDistanceKm()) : "4.2 km");
            if (tvHomeAlertDirection != null) tvHomeAlertDirection.setText(topAlert != null ? topAlert.getDirection() : "North-East");
            if (tvHomeAlertSpread != null) tvHomeAlertSpread.setText(topAlert != null ? topAlert.getEstimatedSpread() : "0.8 km/h SW");
            if (tvHomeAlertAction != null) tvHomeAlertAction.setText(topAlert != null ? topAlert.getRecommendedAction() : "Evacuate toward South-West buffer immediately.");

        } else if (status == FireRiskStatus.HIGH) {
            strokeColor = ContextCompat.getColor(this, R.color.extreme_stroke);
            statusColor = ContextCompat.getColor(this, R.color.extreme);
            bgColor = ContextCompat.getColor(this, R.color.surface);
            badgeBgRes = R.drawable.bg_badge_extreme;
            iconRes = R.drawable.ic_fire;

            if (tvSafetyBadge != null) tvSafetyBadge.setText("High Threat");
            if (tvSafetyTitle != null) tvSafetyTitle.setText(topAlert != null ? topAlert.getTitle().toUpperCase(Locale.US) : "HIGH WILDFIRE THREAT");
            if (tvSafetySubtitle != null) {
                String sub = topAlert != null
                        ? ("Elevated threat " + String.format(Locale.US, "%.1f km away", topAlert.getDistanceKm()) + " near " + topAlert.getLocationName())
                        : "Elevated thermal anomaly detected 5.1 km away";
                tvSafetySubtitle.setText(sub);
            }
            if (tvHomeAlertTime != null) {
                tvHomeAlertTime.setText("● Active Alert • " + (topAlert != null ? topAlert.getTimeDetected() : "20m ago"));
            }

            // Hidden stubs compatibility
            if (tvHomeAlertLocation != null) tvHomeAlertLocation.setText(topAlert != null ? topAlert.getLocationName() : repository.getCurrentLocationName());
            if (tvHomeAlertDistance != null) tvHomeAlertDistance.setText(topAlert != null ? String.format(Locale.US, "%.1f km", topAlert.getDistanceKm()) : "5.1 km");
            if (tvHomeAlertDirection != null) tvHomeAlertDirection.setText(topAlert != null ? topAlert.getDirection() : "North");
            if (tvHomeAlertSpread != null) tvHomeAlertSpread.setText(topAlert != null ? topAlert.getEstimatedSpread() : "0.5 km/h");
            if (tvHomeAlertAction != null) tvHomeAlertAction.setText(topAlert != null ? topAlert.getRecommendedAction() : "Prepare for potential evacuation.");

        } else if (status == FireRiskStatus.WARNING) {
            strokeColor = ContextCompat.getColor(this, R.color.warning_stroke);
            statusColor = ContextCompat.getColor(this, R.color.warning);
            bgColor = ContextCompat.getColor(this, R.color.surface);
            badgeBgRes = R.drawable.bg_badge_warning;
            iconRes = R.drawable.ic_warning_triangle;

            if (tvSafetyBadge != null) tvSafetyBadge.setText("Elevated Risk");
            if (tvSafetyTitle != null) tvSafetyTitle.setText("ELEVATED FIRE RISK");
            if (tvSafetySubtitle != null) {
                tvSafetySubtitle.setText("Moderate risk in monitored perimeter • High heat & dry brush");
            }
            if (tvHomeAlertTime != null) {
                tvHomeAlertTime.setText("● Fire Watch • Monitored sector");
            }

            // Hidden stubs compatibility
            if (tvHomeAlertLocation != null) tvHomeAlertLocation.setText(repository.getCurrentLocationName());
            if (tvHomeAlertDistance != null) tvHomeAlertDistance.setText("8.5 km");
            if (tvHomeAlertDirection != null) tvHomeAlertDirection.setText("East");
            if (tvHomeAlertSpread != null) tvHomeAlertSpread.setText("0.3 km/h");
            if (tvHomeAlertAction != null) tvHomeAlertAction.setText("Review personal evacuation route and keep alerts active.");

        } else {
            // SAFE
            strokeColor = ContextCompat.getColor(this, R.color.safe_stroke);
            statusColor = ContextCompat.getColor(this, R.color.safe);
            bgColor = ContextCompat.getColor(this, R.color.surface);
            badgeBgRes = R.drawable.bg_badge_safe;
            iconRes = R.drawable.ic_shield_check;

            if (tvSafetyBadge != null) tvSafetyBadge.setText("Safe");
            if (tvSafetyTitle != null) tvSafetyTitle.setText("YOU ARE CURRENTLY SAFE");
            if (tvSafetySubtitle != null) {
                tvSafetySubtitle.setText("No active threat detected near your location");
            }
            if (tvHomeAlertTime != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.US);
                tvHomeAlertTime.setText("● Safe • Last updated: " + sdf.format(new Date()));
            }

            // Hidden stubs compatibility
            if (tvHomeAlertLocation != null) tvHomeAlertLocation.setText(repository.getCurrentLocationName());
            if (tvHomeAlertDistance != null) tvHomeAlertDistance.setText("None");
            if (tvHomeAlertDirection != null) tvHomeAlertDirection.setText("Clear");
            if (tvHomeAlertSpread != null) tvHomeAlertSpread.setText("0 km/h (Calm)");
            if (tvHomeAlertAction != null) tvHomeAlertAction.setText("Maintain standard outdoor fire vigilance.");
        }

        if (cardSafetyStatus != null) {
            cardSafetyStatus.setStrokeColor(strokeColor);
            // Don't override card bg — it's handled by the inner gradient drawable
        }
        if (ivSafetyIcon != null) {
            ivSafetyIcon.setImageResource(iconRes);
            ivSafetyIcon.setColorFilter(statusColor);
        }
        if (tvSafetyBadge != null) {
            tvSafetyBadge.setTextColor(statusColor);
        }
        View layoutBadgeContainer = findViewById(R.id.layoutSafetyBadgeContainer);
        if (layoutBadgeContainer != null) {
            layoutBadgeContainer.setBackgroundResource(badgeBgRes);
        }

        // Apply hero gradient background based on risk level
        View layoutSafetyContent = findViewById(R.id.layoutSafetyContent);
        if (layoutSafetyContent != null) {
            int heroGradientRes;
            if (status == FireRiskStatus.EXTREME || status == FireRiskStatus.HIGH) {
                heroGradientRes = R.drawable.bg_gradient_hero_extreme;
            } else if (status == FireRiskStatus.WARNING) {
                heroGradientRes = R.drawable.bg_gradient_hero_warning;
            } else {
                heroGradientRes = R.drawable.bg_gradient_hero_safe;
            }
            layoutSafetyContent.setBackgroundResource(heroGradientRes);
        }

        // Tint the icon circle background
        View iconCircle = findViewById(R.id.layoutStatusIconCircle);
        if (iconCircle != null && iconCircle.getBackground() != null) {
            iconCircle.getBackground().setTint((statusColor & 0x00FFFFFF) | 0x1A000000);
        }
    }

    private void refreshMapRiskSummaryCard() {
        if (tvMapRiskTitle == null) return;

        FireRiskStatus status = repository.getCurrentRiskStatus();
        boolean hasFire = repository.hasActiveFire();
        boolean hasSuspicious = repository.hasSuspiciousActivity();
        String locName = repository.getCurrentLocationName();

        if (tvMapCurrentLocation != null) {
            if (hasFire) {
                tvMapCurrentLocation.setText(locName + " • Active Wildfire Area");
            } else if (hasSuspicious) {
                tvMapCurrentLocation.setText(locName + " • Sensor Watch Sector");
            } else {
                tvMapCurrentLocation.setText(locName + " • Monitored Safe Zone");
            }
        }

        if (hasFire || status == FireRiskStatus.EXTREME || status == FireRiskStatus.HIGH) {
            int extremeColor = ContextCompat.getColor(this, R.color.extreme);
            int strokeColor = ContextCompat.getColor(this, R.color.extreme_stroke);

            tvMapRiskTitle.setText("Active Wildfire Threat");
            tvMapRiskTitle.setTextColor(extremeColor);

            FireAlert activeAlert = repository.getActiveNearbyAlert();
            double dist = (activeAlert != null) ? activeAlert.getDistanceKm() : 4.2;
            String spread = (activeAlert != null) ? activeAlert.getEstimatedSpread() : "Spreading North-East";
            tvMapRiskDistance.setText(String.format(Locale.US, "%.1f km from your location • %s", dist, spread));

            if (ivMapRiskIcon != null) {
                ivMapRiskIcon.setImageResource(R.drawable.ic_fire);
                ivMapRiskIcon.setColorFilter(extremeColor);
            }
            if (cardMapRiskSummary != null) {
                cardMapRiskSummary.setStrokeColor(strokeColor);
            }
            if (btnMapEvacuateSafely != null) {
                btnMapEvacuateSafely.setText("Evacuate Safely");
                btnMapEvacuateSafely.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.extreme));
                btnMapEvacuateSafely.setOnClickListener(v -> openGoogleMapsForActiveIncident());
            }
        } else if (hasSuspicious || status == FireRiskStatus.WARNING) {
            int warningColor = ContextCompat.getColor(this, R.color.warning);
            int strokeColor = ContextCompat.getColor(this, R.color.warning_stroke);

            tvMapRiskTitle.setText("Elevated Risk — Sensor Anomaly");
            tvMapRiskTitle.setTextColor(warningColor);

            tvMapRiskDistance.setText("Telemetry anomaly detected • Maintain vigilance & monitor updates");

            if (ivMapRiskIcon != null) {
                ivMapRiskIcon.setImageResource(R.drawable.ic_warning_triangle);
                ivMapRiskIcon.setColorFilter(warningColor);
            }
            if (cardMapRiskSummary != null) {
                cardMapRiskSummary.setStrokeColor(strokeColor);
            }
            if (btnMapEvacuateSafely != null) {
                btnMapEvacuateSafely.setText("Review Safety Plan");
                btnMapEvacuateSafely.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.warning));
                btnMapEvacuateSafely.setOnClickListener(v -> openPrecautionsScreen());
            }
        } else {
            // SAFE: NO FIRE DETECTED!
            int safeColor = ContextCompat.getColor(this, R.color.safe);
            int strokeColor = ContextCompat.getColor(this, R.color.safe_stroke);

            tvMapRiskTitle.setText("Area Safe — No Fire Detected");
            tvMapRiskTitle.setTextColor(safeColor);

            SafeShelter nearest = repository.getNearestShelter();
            String shelterInfo = (nearest != null)
                    ? String.format(Locale.US, "Nearest shelter: %s (%.1f km)", nearest.getName(), nearest.getDistanceKm())
                    : "IoT sensor mesh active • All sectors clear";
            tvMapRiskDistance.setText("All IoT sensors normal • " + shelterInfo);

            if (ivMapRiskIcon != null) {
                ivMapRiskIcon.setImageResource(R.drawable.ic_shield_check);
                ivMapRiskIcon.setColorFilter(safeColor);
            }
            if (cardMapRiskSummary != null) {
                cardMapRiskSummary.setStrokeColor(strokeColor);
            }
            if (btnMapEvacuateSafely != null) {
                btnMapEvacuateSafely.setText("View Verified Shelters");
                btnMapEvacuateSafely.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.primary));
                btnMapEvacuateSafely.setOnClickListener(v -> openSheltersDirectory());
            }
        }
    }

    private void showDetailedAlertBottomSheet() {
        FireRiskStatus status = repository.getCurrentRiskStatus();
        List<FireAlert> alerts = repository.getAlerts();
        FireAlert topAlert = (alerts != null && !alerts.isEmpty()) ? alerts.get(0) : null;

        BottomSheetDialog sheetDialog = new BottomSheetDialog(this);
        View sheetView = getLayoutInflater().inflate(R.layout.layout_alert_detail_bottom_sheet, null);
        sheetDialog.setContentView(sheetView);

        if (sheetDialog.getWindow() != null) {
            View bottomSheet = sheetDialog.findViewById(com.google.android.material.R.id.design_bottom_sheet);
            if (bottomSheet != null) {
                bottomSheet.setBackgroundResource(android.R.color.transparent);
            }
        }

        TextView tvSheetBadge = sheetView.findViewById(R.id.tvSheetBadge);
        ImageView ivSheetBadgeIcon = sheetView.findViewById(R.id.ivSheetBadgeIcon);
        LinearLayout layoutSheetBadge = sheetView.findViewById(R.id.layoutSheetBadge);
        TextView tvSheetTime = sheetView.findViewById(R.id.tvSheetTime);
        ImageView btnCloseSheet = sheetView.findViewById(R.id.btnCloseSheet);
        TextView tvSheetTitle = sheetView.findViewById(R.id.tvSheetTitle);
        TextView tvSheetLocation = sheetView.findViewById(R.id.tvSheetLocation);
        TextView tvSheetDescription = sheetView.findViewById(R.id.tvSheetDescription);
        TextView tvSheetDistance = sheetView.findViewById(R.id.tvSheetDistance);
        TextView tvSheetDirection = sheetView.findViewById(R.id.tvSheetDirection);
        TextView tvSheetSpread = sheetView.findViewById(R.id.tvSheetSpread);
        TextView tvSheetWeather = sheetView.findViewById(R.id.tvSheetWeather);
        View dividerSheetTelemetry1 = sheetView.findViewById(R.id.dividerSheetTelemetry1);
        View dividerSheetTelemetry2 = sheetView.findViewById(R.id.dividerSheetTelemetry2);
        MaterialCardView cardSheetProtocol = sheetView.findViewById(R.id.cardSheetProtocol);
        ImageView ivSheetProtocolIcon = sheetView.findViewById(R.id.ivSheetProtocolIcon);
        TextView tvSheetProtocolTitle = sheetView.findViewById(R.id.tvSheetProtocolTitle);
        TextView tvSheetProtocol = sheetView.findViewById(R.id.tvSheetProtocol);
        MaterialButton btnSheetEvacuate = sheetView.findViewById(R.id.btnSheetEvacuate);
        MaterialButton btnSheetViewMap = sheetView.findViewById(R.id.btnSheetViewMap);

        int statusColor;
        int badgeBg;
        int iconRes;

        // Parse spread and environmental telemetry so text does not cramp the column
        String rawSpread = (topAlert != null) ? topAlert.getEstimatedSpread() : "0.8 km/h SW";
        String cleanSpread = rawSpread;
        String weatherInfo = "💨 Wind: 15.6 km/h  •  🌡️ Ambient: 30.1°C  •  💧 Humidity: 45%";

        if (rawSpread != null && rawSpread.contains("(Wind:")) {
            int windIdx = rawSpread.indexOf("(Wind:");
            cleanSpread = rawSpread.substring(0, windIdx).trim();
            String details = rawSpread.substring(windIdx + 1).replace(")", "").trim();
            weatherInfo = "💨 " + details + "  •  💧 Humidity: 45%";
        } else if (status == FireRiskStatus.SAFE) {
            weatherInfo = "💨 Wind: Calm (3.2 km/h)  •  🌡️ Ambient: 26.5°C  •  💧 Humidity: 62%";
        }

        if (tvSheetWeather != null) {
            tvSheetWeather.setText(weatherInfo);
        }

        int protocolBg;
        int protocolStroke;
        int protocolTextColor;

        if (status == FireRiskStatus.EXTREME) {
            statusColor = ContextCompat.getColor(this, R.color.extreme);
            badgeBg = R.drawable.bg_badge_extreme;
            iconRes = R.drawable.ic_fire;

            protocolBg = ContextCompat.getColor(this, R.color.extreme_subtle);
            protocolStroke = ContextCompat.getColor(this, R.color.extreme_stroke);
            protocolTextColor = ContextCompat.getColor(this, R.color.extreme);

            if (tvSheetBadge != null) tvSheetBadge.setText("CRITICAL EVACUATION ALERT");
            if (tvSheetTime != null) tvSheetTime.setText("● Active • " + (topAlert != null ? topAlert.getTimeDetected() : "14m ago"));
            if (tvSheetTitle != null) tvSheetTitle.setText(topAlert != null ? topAlert.getTitle() : "Active Wildfire Ridge Fire");
            if (tvSheetLocation != null) tvSheetLocation.setText(topAlert != null ? topAlert.getLocationName() : repository.getCurrentLocationName());
            if (tvSheetDescription != null) tvSheetDescription.setText("Rapid fire expansion detected toward western residential buffer. High winds and dense dry brush accelerate embers. Direct access via northern ridge road is blocked by flame anomalies.");
            if (tvSheetDistance != null) tvSheetDistance.setText(topAlert != null ? String.format(Locale.US, "%.1f km", topAlert.getDistanceKm()) : "4.2 km");
            if (tvSheetDirection != null) tvSheetDirection.setText(topAlert != null ? topAlert.getDirection() : "North-East");
            if (tvSheetSpread != null) tvSheetSpread.setText(!cleanSpread.isEmpty() ? cleanSpread : "0.8 km/h SW");
            if (tvSheetProtocolTitle != null) tvSheetProtocolTitle.setText("CRITICAL EVACUATION DIRECTIVE");
            if (tvSheetProtocol != null) tvSheetProtocol.setText(topAlert != null ? topAlert.getRecommendedAction() : "Evacuate toward South-West concrete buffer zone immediately. Avoid northern ridge roads and keep N95 masks equipped.");
            if (btnSheetEvacuate != null) {
                btnSheetEvacuate.setText("START EVACUATION");
                btnSheetEvacuate.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.extreme));
            }
        } else if (status == FireRiskStatus.HIGH) {
            statusColor = ContextCompat.getColor(this, R.color.extreme);
            badgeBg = R.drawable.bg_badge_extreme;
            iconRes = R.drawable.ic_fire;

            protocolBg = ContextCompat.getColor(this, R.color.extreme_subtle);
            protocolStroke = ContextCompat.getColor(this, R.color.extreme_stroke);
            protocolTextColor = ContextCompat.getColor(this, R.color.extreme);

            if (tvSheetBadge != null) tvSheetBadge.setText("HIGH PRIORITY THREAT");
            if (tvSheetTime != null) tvSheetTime.setText("● Active • " + (topAlert != null ? topAlert.getTimeDetected() : "20m ago"));
            if (tvSheetTitle != null) tvSheetTitle.setText(topAlert != null ? topAlert.getTitle() : "High Wildfire Danger");
            if (tvSheetLocation != null) tvSheetLocation.setText(topAlert != null ? topAlert.getLocationName() : repository.getCurrentLocationName());
            if (tvSheetDescription != null) tvSheetDescription.setText("Elevated thermal anomaly detected nearby. Wildfire behavior unpredictable due to wind gusts. Local authorities recommend preparing emergency grab bags.");
            if (tvSheetDistance != null) tvSheetDistance.setText(topAlert != null ? String.format(Locale.US, "%.1f km", topAlert.getDistanceKm()) : "5.1 km");
            if (tvSheetDirection != null) tvSheetDirection.setText(topAlert != null ? topAlert.getDirection() : "North");
            if (tvSheetSpread != null) tvSheetSpread.setText(!cleanSpread.isEmpty() ? cleanSpread : "0.5 km/h");
            if (tvSheetProtocolTitle != null) tvSheetProtocolTitle.setText("PREPARE FOR IMMEDIATE EVACUATION");
            if (tvSheetProtocol != null) tvSheetProtocol.setText(topAlert != null ? topAlert.getRecommendedAction() : "Prepare for potential evacuation. Ensure vehicles are fueled and go-bags ready.");
            if (btnSheetEvacuate != null) {
                btnSheetEvacuate.setText("START EVACUATION");
                btnSheetEvacuate.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.extreme));
            }
        } else if (status == FireRiskStatus.WARNING) {
            statusColor = ContextCompat.getColor(this, R.color.warning);
            badgeBg = R.drawable.bg_badge_warning;
            iconRes = R.drawable.ic_warning_triangle;

            protocolBg = ContextCompat.getColor(this, R.color.warning_subtle);
            protocolStroke = ContextCompat.getColor(this, R.color.warning_stroke);
            protocolTextColor = ContextCompat.getColor(this, R.color.warning);

            if (tvSheetBadge != null) tvSheetBadge.setText("ELEVATED FIRE WATCH");
            if (tvSheetTime != null) tvSheetTime.setText("● Monitored • Just now");
            if (tvSheetTitle != null) tvSheetTitle.setText("Elevated Fire Danger in Sector");
            if (tvSheetLocation != null) tvSheetLocation.setText(repository.getCurrentLocationName());
            if (tvSheetDescription != null) tvSheetDescription.setText("Dry ambient conditions and low humidity elevate fire spread potential. Fire defense crews are on elevated alert in surrounding sectors.");
            if (tvSheetDistance != null) tvSheetDistance.setText("8.5 km");
            if (tvSheetDirection != null) tvSheetDirection.setText("East");
            if (tvSheetSpread != null) tvSheetSpread.setText("0.3 km/h");
            if (tvSheetProtocolTitle != null) tvSheetProtocolTitle.setText("PRECAUTIONARY ACTION PROTOCOL");
            if (tvSheetProtocol != null) tvSheetProtocol.setText("Review personal evacuation route, inspect defensible space, and keep alerts active.");
            if (btnSheetEvacuate != null) {
                btnSheetEvacuate.setText("VIEW EVACUATION ROUTE");
                btnSheetEvacuate.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.primary));
            }
        } else {
            statusColor = ContextCompat.getColor(this, R.color.safe);
            badgeBg = R.drawable.bg_badge_safe;
            iconRes = R.drawable.ic_shield_check;

            protocolBg = ContextCompat.getColor(this, R.color.safe_subtle);
            protocolStroke = ContextCompat.getColor(this, R.color.safe_stroke);
            protocolTextColor = ContextCompat.getColor(this, R.color.safe);

            if (tvSheetBadge != null) tvSheetBadge.setText("SAFE ZONE • ALL CLEAR");
            if (tvSheetTime != null) tvSheetTime.setText("● Live • Updated just now");
            if (tvSheetTitle != null) tvSheetTitle.setText("Area Is Currently Safe");
            if (tvSheetLocation != null) tvSheetLocation.setText(repository.getCurrentLocationName() + " • Normal Conditions");
            if (tvSheetDescription != null) tvSheetDescription.setText("AI thermal satellite scans and local telemetry detect no active wildfire hotspots in your immediate perimeter.");
            if (tvSheetDistance != null) tvSheetDistance.setText("None");
            if (tvSheetDirection != null) tvSheetDirection.setText("Clear");
            if (tvSheetSpread != null) tvSheetSpread.setText("0 km/h (Calm)");
            if (tvSheetProtocolTitle != null) tvSheetProtocolTitle.setText("STANDARD SAFETY DIRECTIVE");
            if (tvSheetProtocol != null) tvSheetProtocol.setText("Maintain standard outdoor fire vigilance. Report any unauthorized brush burning or smoke.");
            if (btnSheetEvacuate != null) {
                btnSheetEvacuate.setText("SAFETY PRECAUTIONS");
                btnSheetEvacuate.setBackgroundTintList(ContextCompat.getColorStateList(this, R.color.primary));
            }
        }

        if (layoutSheetBadge != null) layoutSheetBadge.setBackgroundResource(badgeBg);
        if (tvSheetBadge != null) tvSheetBadge.setTextColor(statusColor);
        if (ivSheetBadgeIcon != null) {
            ivSheetBadgeIcon.setImageResource(iconRes);
            ivSheetBadgeIcon.setColorFilter(statusColor);
        }

        if (cardSheetProtocol != null) {
            cardSheetProtocol.setCardBackgroundColor(protocolBg);
            cardSheetProtocol.setStrokeColor(protocolStroke);
        }
        if (ivSheetProtocolIcon != null) {
            ivSheetProtocolIcon.setColorFilter(protocolTextColor);
        }
        if (tvSheetProtocolTitle != null) {
            tvSheetProtocolTitle.setTextColor(protocolTextColor);
        }

        if (btnCloseSheet != null) {
            btnCloseSheet.setOnClickListener(v -> sheetDialog.dismiss());
        }

        if (btnSheetEvacuate != null) {
            btnSheetEvacuate.setOnClickListener(v -> {
                sheetDialog.dismiss();
                if (status == FireRiskStatus.SAFE) {
                    openPrecautionsScreen();
                } else {
                    if (topAlert != null) {
                        openGoogleMapsNavigation(topAlert.getLatitude(), topAlert.getLongitude(), topAlert.getTitle());
                    } else {
                        openGoogleMapsForActiveIncident();
                    }
                }
            });
        }

        if (btnSheetViewMap != null) {
            btnSheetViewMap.setOnClickListener(v -> {
                sheetDialog.dismiss();
                openFullScreenMap();
            });
        }

        sheetDialog.show();
    }

    private void setupMapInteractions() {
        View.OnClickListener layerListener = v -> {
            if (fullInteractiveMapView != null) {
                fullInteractiveMapView.setLayerVisibility(
                        chipLayerFire.isChecked(),
                        chipLayerRisk.isChecked(),
                        chipLayerShelters.isChecked(),
                        chipLayerRoute.isChecked()
                );
            }
        };

        chipLayerFire.setOnClickListener(layerListener);
        chipLayerRisk.setOnClickListener(layerListener);
        chipLayerShelters.setOnClickListener(layerListener);
        chipLayerRoute.setOnClickListener(layerListener);

        findViewById(R.id.fabMapRecenter).setOnClickListener(v -> {
            if (fullInteractiveMapView != null) {
                fullInteractiveMapView.resetCenter();
                Toast.makeText(this, "Centered on Pune Location", Toast.LENGTH_SHORT).show();
            }
        });

        btnMapEvacuateSafely.setOnClickListener(v -> openGoogleMapsForActiveIncident());
    }

    private void setupAlertsScreen() {
        alertsAdapter = new AlertsAdapter(alert -> {
            if (alert != null) {
                alert.setRead(true);
                alertsAdapter.notifyDataSetChanged();
                openGoogleMapsNavigation(alert.getLatitude(), alert.getLongitude(), alert.getTitle());
            } else {
                openGoogleMapsForActiveIncident();
            }
        });
        rvAlertsTimeline.setLayoutManager(new LinearLayoutManager(this));
        rvAlertsTimeline.setAdapter(alertsAdapter);
        alertsAdapter.setItems(repository.getAlerts());

        View btnMarkAllRead = findViewById(R.id.btnMarkAllRead);
        if (btnMarkAllRead != null) {
            btnMarkAllRead.setOnClickListener(v -> {
                List<FireAlert> all = repository.getAlerts();
                for (FireAlert a : all) {
                    a.setRead(true);
                }
                alertsAdapter.notifyDataSetChanged();
                if (viewUnreadBellDot != null) {
                    viewUnreadBellDot.setVisibility(View.GONE);
                }
                Toast.makeText(this, "All notifications marked as read", Toast.LENGTH_SHORT).show();
            });
        }

        chipGroupAlertFilter.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) return;
            int checkedId = checkedIds.get(0);
            List<FireAlert> filtered = new ArrayList<>();
            List<FireAlert> all = repository.getAlerts();

            if (checkedId == R.id.chipFilterCritical) {
                for (FireAlert a : all) {
                    if (a.getSeverity() == FireRiskStatus.HIGH || a.getSeverity() == FireRiskStatus.EXTREME) {
                        filtered.add(a);
                    }
                }
            } else if (checkedId == R.id.chipFilterWarning) {
                for (FireAlert a : all) {
                    if (a.getSeverity() == FireRiskStatus.WARNING) {
                        filtered.add(a);
                    }
                }
            } else if (checkedId == R.id.chipFilterSafe) {
                for (FireAlert a : all) {
                    if (a.getSeverity() == FireRiskStatus.SAFE) {
                        filtered.add(a);
                    }
                }
            } else {
                filtered.addAll(all);
            }

            alertsAdapter.setItems(filtered);
            layoutAlertsEmpty.setVisibility(filtered.isEmpty() ? View.VISIBLE : View.GONE);
            rvAlertsTimeline.setVisibility(filtered.isEmpty() ? View.GONE : View.VISIBLE);
        });
    }

    private void refreshNotificationsList() {
        if (alertsAdapter == null || repository == null) return;
        List<FireAlert> all = repository.getAlerts();
        if (chipGroupAlertFilter != null && !chipGroupAlertFilter.getCheckedChipIds().isEmpty()) {
            int checkedId = chipGroupAlertFilter.getCheckedChipIds().get(0);
            List<FireAlert> filtered = new ArrayList<>();
            if (checkedId == R.id.chipFilterCritical) {
                for (FireAlert a : all) {
                    if (a.getSeverity() == FireRiskStatus.HIGH || a.getSeverity() == FireRiskStatus.EXTREME) {
                        filtered.add(a);
                    }
                }
            } else if (checkedId == R.id.chipFilterWarning) {
                for (FireAlert a : all) {
                    if (a.getSeverity() == FireRiskStatus.WARNING) {
                        filtered.add(a);
                    }
                }
            } else if (checkedId == R.id.chipFilterSafe) {
                for (FireAlert a : all) {
                    if (a.getSeverity() == FireRiskStatus.SAFE) {
                        filtered.add(a);
                    }
                }
            } else {
                filtered.addAll(all);
            }
            alertsAdapter.setItems(filtered);
            if (layoutAlertsEmpty != null) layoutAlertsEmpty.setVisibility(filtered.isEmpty() ? View.VISIBLE : View.GONE);
            if (rvAlertsTimeline != null) rvAlertsTimeline.setVisibility(filtered.isEmpty() ? View.GONE : View.VISIBLE);
        } else {
            alertsAdapter.setItems(all);
            if (layoutAlertsEmpty != null) layoutAlertsEmpty.setVisibility(all.isEmpty() ? View.VISIBLE : View.GONE);
            if (rvAlertsTimeline != null) rvAlertsTimeline.setVisibility(all.isEmpty() ? View.GONE : View.VISIBLE);
        }
    }

    private void setupAccountScreen() {
        refreshEmergencyContactsUi();
        fetchMyReports();
        if (btnAddEmergencyContact != null) {
            btnAddEmergencyContact.setOnClickListener(v -> showAddEmergencyContactDialog());
        }

        btnSendImSafe.setOnClickListener(v -> {
            String time = new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
            tvImSafeStatus.setText("Broadcast Sent (" + time + ")");
            tvImSafeStatus.setBackgroundResource(R.drawable.bg_badge_safe);

            double[] coords = getLiveCoordinates();
            String loc = (currentLiveAddress != null && !currentLiveAddress.isEmpty())
                    ? currentLiveAddress
                    : (hasRealLocationFix ? String.format(Locale.US, "GPS (%.5f, %.5f)", coords[0], coords[1]) : repository.getCurrentLocationName());
            List<EmergencyContact> contacts = EmergencyContactsManager.getInstance(this).getContacts();

            // 1. Send dedicated 'I Am Safe' SMS with live GPS and Google Maps pin to emergency contacts
            SosSmsDispatcher.sendImSafeSms(this, contacts, loc, coords[0], coords[1], new SosSmsDispatcher.SmsDispatchCallback() {
                @Override
                public void onDispatched(int sentCount, List<String> recipientNames) {
                    Toast.makeText(MainActivity.this, "✅ Sent I'm Safe SMS to " + sentCount + " emergency contact(s) with live location!", Toast.LENGTH_LONG).show();
                }

                @Override
                public void onPermissionNeeded() {
                    androidx.core.app.ActivityCompat.requestPermissions(MainActivity.this, new String[]{android.Manifest.permission.SEND_SMS}, 102);
                    Toast.makeText(MainActivity.this, "Please grant SMS permission to broadcast safety status", Toast.LENGTH_SHORT).show();
                }

                @Override
                public void onError(String error) {
                    Toast.makeText(MainActivity.this, "SMS status: " + error, Toast.LENGTH_SHORT).show();
                }
            });

            // 2. Push safety status with date, time, and coordinates to Firebase Realtime Database
            FireSafeApiClient.getInstance().pushCitizenSafeStatus(coords[0], coords[1], loc, "Sham Patil", (success, message) -> {
                android.util.Log.i("FireSafe", "Pushed I'm Safe check-in to Firebase Realtime Database: " + success);
            });
        });

        if (btnNationalEmergency112 != null) {
            btnNationalEmergency112.setOnClickListener(v -> makePhoneCall("112"));
        }

        View btnTileSafety = findViewById(R.id.btnTileSafety);
        if (btnTileSafety != null) {
            btnTileSafety.setOnClickListener(v -> openPrecautionsScreen());
        }

        View btnTileInbox = findViewById(R.id.btnTileInbox);
        if (btnTileInbox != null) {
            btnTileInbox.setOnClickListener(v -> openSanthiChatScreen());
        }

        View cardUberOne = findViewById(R.id.cardUberOne);
        if (cardUberOne != null) {
            cardUberOne.setOnClickListener(v -> Toast.makeText(this, "🛰️ Satellite Sentinel: NASA FIRMS thermal anomaly detection active across sector.", Toast.LENGTH_LONG).show());
        }

        View cardRiderInsurance = findViewById(R.id.cardRiderInsurance);
        if (cardRiderInsurance != null) {
            cardRiderInsurance.setOnClickListener(v -> Toast.makeText(this, "🗺️ Offline Cache: Regional topography & escape paths available with zero network.", Toast.LENGTH_LONG).show());
        }

        View cardSafetyCheckup = findViewById(R.id.cardSafetyCheckup);
        if (cardSafetyCheckup != null) {
            cardSafetyCheckup.setOnClickListener(v -> openPrecautionsScreen());
        }

        if (tvCitizenLocation != null) {
            String loc = currentLiveAddress != null ? currentLiveAddress : repository.getCurrentLocationName();
            tvCitizenLocation.setText("Live Location: " + loc);
        }

        findViewById(R.id.rowOfflineMaps).setOnClickListener(v -> {
            Toast.makeText(this, "Offline Cache: High-resolution terrain cached for current region", Toast.LENGTH_SHORT).show();
        });

        findViewById(R.id.rowNotifications).setOnClickListener(v -> {
            Toast.makeText(this, "Audible Siren Priority: Enabled for High & Extreme Risk Alerts", Toast.LENGTH_SHORT).show();
        });

        findViewById(R.id.rowLocation).setOnClickListener(v -> {
            initLiveGpsTracking();
            Toast.makeText(this, "Real-time High Accuracy GPS tracking enabled", Toast.LENGTH_SHORT).show();
        });

        findViewById(R.id.rowLogout).setOnClickListener(v -> {
            getSharedPreferences("FireSafePrefs", MODE_PRIVATE)
                    .edit()
                    .putBoolean("isLoggedIn", false)
                    .apply();
                    
            Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(MainActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });

        // Hidden Secret Remote Fire State Toggle on "4.9 • DEFENSE READY" text / rating pill
        View layoutRatingPill = findViewById(R.id.layoutRatingPill);
        View tvCitizenRating = findViewById(R.id.tvCitizenRating);
        View.OnClickListener secretFireToggle = v -> toggleRemoteFirebaseFireState();
        if (layoutRatingPill != null) {
            layoutRatingPill.setOnClickListener(secretFireToggle);
        }
        if (tvCitizenRating != null) {
            tvCitizenRating.setOnClickListener(secretFireToggle);
        }
    }

    private void fetchMyReports() {
        LinearLayout layoutMyReportsContainer = findViewById(R.id.layoutMyReportsContainer);
        if (layoutMyReportsContainer == null) return;
        
        com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("reports")
                .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .addSnapshotListener((snapshots, e) -> {
                    if (e != null) {
                        android.util.Log.e("FireSafe", "Listen failed.", e);
                        return;
                    }
                    
                    layoutMyReportsContainer.removeAllViews();
                    
                    if (snapshots != null && !snapshots.isEmpty()) {
                        for (com.google.firebase.firestore.DocumentSnapshot doc : snapshots.getDocuments()) {
                            View reportView = getLayoutInflater().inflate(R.layout.item_report_card, layoutMyReportsContainer, false);
                            
                            TextView tvType = reportView.findViewById(R.id.tvReportType);
                            TextView tvTime = reportView.findViewById(R.id.tvReportTime);
                            TextView tvDesc = reportView.findViewById(R.id.tvReportDesc);
                            TextView tvStatus = reportView.findViewById(R.id.tvReportStatus);
                            TextView tvLocation = reportView.findViewById(R.id.tvReportLocation);
                            com.google.android.material.button.MaterialButton btnShowEvidence = reportView.findViewById(R.id.btnShowEvidence);
                            com.google.android.material.button.MaterialButton btnUpdateStatus = reportView.findViewById(R.id.btnUpdateStatus);
                            if (btnUpdateStatus != null) {
                                btnUpdateStatus.setVisibility(View.GONE);
                            }
                            
                            String type = doc.getString("activityType");
                            String desc = doc.getString("description");
                            String status = doc.getString("status");
                            String loc = doc.getString("gpsLocation");
                            String imageUrl = doc.getString("imageUrl");
                            
                            if (type != null) tvType.setText(type);
                            if (desc != null) tvDesc.setText(desc);
                            if (status != null) {
                                tvStatus.setText("Status: " + status);
                                if (status.equals("PENDING")) tvStatus.setTextColor(android.graphics.Color.parseColor("#FFA500"));
                                else if (status.equals("INVESTIGATING")) tvStatus.setTextColor(android.graphics.Color.parseColor("#0000FF"));
                                else if (status.equals("VERIFIED")) tvStatus.setTextColor(android.graphics.Color.parseColor("#008000"));
                                else if (status.equals("RESOLVED")) tvStatus.setTextColor(android.graphics.Color.parseColor("#808080"));
                            }
                            if (loc != null) tvLocation.setText(loc);
                            
                            if (imageUrl != null && !imageUrl.isEmpty()) {
                                btnShowEvidence.setVisibility(View.VISIBLE);
                                btnShowEvidence.setOnClickListener(v -> {
                                    if (isFinishing() || isDestroyed()) return;
                                    android.app.Dialog dialog = new android.app.Dialog(MainActivity.this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
                                    ImageView imageView = new ImageView(MainActivity.this);
                                    com.bumptech.glide.Glide.with(MainActivity.this).load(imageUrl).into(imageView);
                                    imageView.setOnClickListener(v1 -> dialog.dismiss());
                                    dialog.setContentView(imageView);
                                    dialog.show();
                                });
                            } else {
                                btnShowEvidence.setVisibility(View.GONE);
                            }
                            
                            com.google.firebase.Timestamp ts = doc.getTimestamp("timestamp");
                            if (ts != null) {
                                tvTime.setText(new java.text.SimpleDateFormat("MMM dd, hh:mm a", java.util.Locale.getDefault()).format(ts.toDate()));
                            }
                            
                            layoutMyReportsContainer.addView(reportView);
                        }
                    } else {
                        TextView tvEmpty = new TextView(MainActivity.this);
                        tvEmpty.setText("You haven't reported any incidents yet.");
                        tvEmpty.setPadding(0, 20, 0, 20);
                        tvEmpty.setTextColor(android.graphics.Color.parseColor("#888888"));
                        layoutMyReportsContainer.addView(tvEmpty);
                    }
                });
    }

    /**
     * Completely hidden remote fire simulation toggle triggered by tapping the "4.9 • DEFENSE READY" text.
     * Toggles between Active Wildfire and Normal Safe states by uploading the state directly
     * to Firebase Realtime Database at /wildfire.json via REST PUT.
     * Any other running device polling Firebase Realtime Database will immediately read this state and
     * update or remove the fire across its interactive map, alerts list, and dashboard.
     */
    private void toggleRemoteFirebaseFireState() {
        // Discreet tactile haptic feedback
        try {
            android.os.Vibrator vibrator = (android.os.Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createOneShot(70, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(70);
                }
            }
        } catch (Exception ignored) {}

        boolean isCurrentlyFire = repository.hasFireOrHighThreat();
        boolean targetEnableFire = !isCurrentlyFire;

        double[] userCoords = getLiveCoordinates();
        double userLat = userCoords[0];
        double userLng = userCoords[1];
        double fireLat = userLat + 0.0055;
        double fireLng = userLng + 0.0045;

        // 1. Instantly force local repository and all UI elements to target state (0ms latency)
        repository.forceSetFireState(targetEnableFire, fireLat, fireLng);
        refreshTopPriorityAlertCard();
        refreshMapRiskSummaryCard();
        if (alertsAdapter != null) alertsAdapter.notifyDataSetChanged();
        if (fullInteractiveMapView != null) fullInteractiveMapView.updateMapFromRepository();
        if (evacMapView != null) evacMapView.updateMapFromRepository();
        if (viewUnreadBellDot != null) {
            viewUnreadBellDot.setVisibility(targetEnableFire ? View.VISIBLE : View.GONE);
        }

        Toast.makeText(this, targetEnableFire
                ? "🔥 Setting HIGH Fire Risk near live location & updating Firebase..."
                : "🛡️ Setting ALL STATES TO SAFE & updating Firebase...", Toast.LENGTH_SHORT).show();

        // 2. Synchronize to Firebase Firestore and Realtime Database in background
        FireSafeApiClient.getInstance().toggleFirebaseSimulatedFire(targetEnableFire, fireLat, fireLng, (success, message) -> {
            runOnUiThread(() -> {
                if (success) {
                    pollFirebaseWildfireData();
                    Toast.makeText(MainActivity.this, targetEnableFire
                            ? "✅ HIGH Fire Risk synchronized across Firebase!"
                            : "✅ SAFE state synchronized across Firebase!", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(MainActivity.this, "⚠️ Firebase sync warning: " + message, Toast.LENGTH_SHORT).show();
                }
            });
        });
    }

    private void refreshEmergencyContactsUi() {
        if (layoutEmergencyContactsContainer == null) return;
        layoutEmergencyContactsContainer.removeAllViews();

        List<EmergencyContact> contacts = EmergencyContactsManager.getInstance(this).getContacts();
        LayoutInflater inflater = LayoutInflater.from(this);

        if (contacts.isEmpty()) {
            View emptyView = inflater.inflate(R.layout.layout_empty_emergency_contacts, layoutEmergencyContactsContainer, false);
            View btnAdd = emptyView.findViewById(R.id.btnEmptyAddContact);
            if (btnAdd != null) {
                btnAdd.setOnClickListener(v -> showAddEmergencyContactDialog());
            }
            layoutEmergencyContactsContainer.addView(emptyView);
            return;
        }

        for (EmergencyContact contact : contacts) {
            View itemView = inflater.inflate(R.layout.item_emergency_contact, layoutEmergencyContactsContainer, false);
            TextView tvInitials = itemView.findViewById(R.id.tvContactInitials);
            TextView tvName = itemView.findViewById(R.id.tvContactName);
            TextView tvRelation = itemView.findViewById(R.id.tvContactRelation);
            TextView tvPhone = itemView.findViewById(R.id.tvContactPhone);
            View btnCall = itemView.findViewById(R.id.btnCallContact);
            View btnDelete = itemView.findViewById(R.id.btnDeleteContact);

            String name = contact.getName();
            String initials = "EC";
            if (name != null && !name.trim().isEmpty()) {
                String[] parts = name.trim().split("\\s+");
                if (parts.length >= 2 && !parts[0].isEmpty() && !parts[1].isEmpty()) {
                    initials = ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase(Locale.US);
                } else if (!parts[0].isEmpty()) {
                    initials = ("" + parts[0].charAt(0)).toUpperCase(Locale.US);
                }
            }

            if (tvInitials != null) tvInitials.setText(initials);
            if (tvName != null) tvName.setText(contact.getName());
            if (tvRelation != null) tvRelation.setText(contact.getRelationship());
            if (tvPhone != null) tvPhone.setText(contact.getPhone());

            if (btnCall != null) {
                btnCall.setOnClickListener(v -> makePhoneCall(contact.getPhone()));
            }

            if (btnDelete != null) {
                btnDelete.setOnClickListener(v -> {
                    new MaterialAlertDialogBuilder(this)
                            .setTitle("Remove Contact?")
                            .setMessage("Remove " + contact.getName() + " (" + contact.getPhone() + ") from emergency broadcast?")
                            .setPositiveButton("Remove", (dialog, which) -> {
                                EmergencyContactsManager.getInstance(this).removeContact(contact.getId());
                                refreshEmergencyContactsUi();
                                Toast.makeText(this, "Removed " + contact.getName(), Toast.LENGTH_SHORT).show();
                            })
                            .setNegativeButton("Cancel", null)
                            .show();
                });
            }

            layoutEmergencyContactsContainer.addView(itemView);
        }
    }

    private void showAddEmergencyContactDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_emergency_contact, null);
        TextInputEditText etName = dialogView.findViewById(R.id.etContactName);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etContactPhone);
        TextInputEditText etRelation = dialogView.findViewById(R.id.etContactRelation);

        new MaterialAlertDialogBuilder(this)
                .setView(dialogView)
                .setPositiveButton("Save Contact", (dialog, which) -> {
                    String name = etName != null && etName.getText() != null ? etName.getText().toString().trim() : "";
                    String phone = etPhone != null && etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
                    String relation = etRelation != null && etRelation.getText() != null ? etRelation.getText().toString().trim() : "";

                    if (name.isEmpty() || phone.isEmpty()) {
                        Toast.makeText(this, "Please enter both Contact Name and Phone Number", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    if (relation.isEmpty()) {
                        relation = "Family";
                    }

                    EmergencyContact newContact = new EmergencyContact(
                            "contact_" + System.currentTimeMillis(),
                            name,
                            phone,
                            relation
                    );
                    EmergencyContactsManager.getInstance(this).addContact(newContact);
                    refreshEmergencyContactsUi();
                    Toast.makeText(this, "Emergency Contact Saved: " + name, Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void setupEvacuationScreen() {
        findViewById(R.id.btnBackEvacuation).setOnClickListener(v -> closeAllOverlays());

        // Setup steps list in modal
        evacuationStepsAdapter = new EvacuationStepsAdapter();
        rvEvacuationSteps.setLayoutManager(new LinearLayoutManager(this));
        rvEvacuationSteps.setAdapter(evacuationStepsAdapter);
        evacuationStepsAdapter.setItems(repository.getSafeEvacuationSteps());

        View btnCloseModal = findViewById(R.id.btnCloseStepsModal);
        if (btnCloseModal != null) {
            btnCloseModal.setOnClickListener(v -> {
                if (layoutEvacuationStepsModal != null) {
                    layoutEvacuationStepsModal.setVisibility(View.GONE);
                }
            });
        }

        View fabToggleSteps = findViewById(R.id.fabEvacToggleSteps);
        if (fabToggleSteps != null) {
            fabToggleSteps.setOnClickListener(v -> {
                if (layoutEvacuationStepsModal != null) {
                    boolean show = layoutEvacuationStepsModal.getVisibility() != View.VISIBLE;
                    layoutEvacuationStepsModal.setVisibility(show ? View.VISIBLE : View.GONE);
                }
            });
        }

        View fabRecenter = findViewById(R.id.fabEvacRecenter);
        if (fabRecenter != null) {
            fabRecenter.setOnClickListener(v -> {
                if (evacMapView != null) {
                    evacMapView.resetCenter();
                    Toast.makeText(this, "Re-centered on Safe Evacuation Corridor", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Voice guidance toggle button
        if (btnVoiceToggle != null) {
            btnVoiceToggle.setOnClickListener(v -> {
                isVoiceNavEnabled = !isVoiceNavEnabled;
                if (ivVoiceToggleIcon != null) {
                    ivVoiceToggleIcon.setImageResource(isVoiceNavEnabled ? R.drawable.ic_volume_up : R.drawable.ic_volume_off);
                }
                if (isVoiceNavEnabled) {
                    Toast.makeText(this, "Voice guidance enabled", Toast.LENGTH_SHORT).show();
                    repeatCurrentManeuverVoice();
                } else {
                    stopVoiceGuidance();
                    Toast.makeText(this, "Voice guidance muted", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Repeat voice button & clicking the top maneuver card
        View.OnClickListener repeatAction = v -> repeatCurrentManeuverVoice();
        if (btnNavRepeatVoice != null) btnNavRepeatVoice.setOnClickListener(repeatAction);
        if (cardNavTopBanner != null) cardNavTopBanner.setOnClickListener(repeatAction);

        // Turn simulation progress button: counts down meters and speaks aloud
        if (btnNavSimulateProgress != null) {
            btnNavSimulateProgress.setOnClickListener(v -> advanceEvacuationProgress());
        }

        // Open in external Google Maps app
        View btnOpenGoogleMaps = findViewById(R.id.btnOpenGoogleMaps);
        if (btnOpenGoogleMaps != null) {
            btnOpenGoogleMaps.setOnClickListener(v -> {
                try {
                    android.net.Uri gmmIntentUri = android.net.Uri.parse("google.navigation:q=18.5350,73.8320&mode=d");
                    Intent mapIntent = new Intent(Intent.ACTION_VIEW, gmmIntentUri);
                    mapIntent.setPackage("com.google.android.apps.maps");
                    startActivity(mapIntent);
                } catch (Exception e) {
                    Intent webIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://www.google.com/maps/dir/?api=1&destination=18.5350,73.8320"));
                    startActivity(webIntent);
                }
            });
        }

        // Quick Emergency SOS trigger button inside evacuation HUD
        View btnEvacQuickSos = findViewById(R.id.btnEvacQuickSos);
        if (btnEvacQuickSos != null) {
            btnEvacQuickSos.setOnClickListener(v -> showSosDialog());
        }
    }

    private static class NavManeuver {
        final int iconRes;
        final String distanceDisplay;
        final int distanceMeters;
        final String instruction;
        final String street;
        final String nextPreview;
        final String initialSpeech;
        final String closeSpeech;

        NavManeuver(int iconRes, String distanceDisplay, int distanceMeters,
                    String instruction, String street, String nextPreview,
                    String initialSpeech, String closeSpeech) {
            this.iconRes = iconRes;
            this.distanceDisplay = distanceDisplay;
            this.distanceMeters = distanceMeters;
            this.instruction = instruction;
            this.street = street;
            this.nextPreview = nextPreview;
            this.initialSpeech = initialSpeech;
            this.closeSpeech = closeSpeech;
        }
    }

    private final NavManeuver[] navManeuvers = new NavManeuver[]{
            new NavManeuver(
                    R.drawable.ic_turn_left,
                    "100 m",
                    100,
                    "Turn LEFT",
                    "onto Sinhagad Valley Safe Corridor",
                    "Proceed 900 m on Senapati Bapat Rd away from fire",
                    "In 100 meters, turn left onto Sinhagad Valley Safe Corridor away from the fire zone.",
                    "Turn left now onto Sinhagad Valley Safe Corridor."
            ),
            new NavManeuver(
                    R.drawable.ic_turn_right,
                    "900 m",
                    900,
                    "Turn RIGHT",
                    "onto Senapati Bapat Rd (AWAY from smoke plume)",
                    "Continue straight 800 m through Protected Buffer Corridor",
                    "In 900 meters, turn right onto Senapati Bapat Road away from smoke plume.",
                    "Turn right now onto Senapati Bapat Road."
            ),
            new NavManeuver(
                    R.drawable.ic_turn_straight,
                    "800 m",
                    800,
                    "Continue STRAIGHT",
                    "through Protected Buffer Corridor",
                    "Turn left into Shivaji Community Safe Hall",
                    "Continue straight for 800 meters through the protected buffer corridor.",
                    "In 200 meters, prepare to turn left into the emergency shelter."
            ),
            new NavManeuver(
                    R.drawable.ic_turn_left,
                    "150 m",
                    150,
                    "Turn LEFT",
                    "into Shivaji Community Safe Hall Entrance",
                    "Destination reached • Designated primary safe assembly point",
                    "In 150 meters, turn left into Shivaji Community Safe Hall entrance.",
                    "Turn left now into Shivaji Community Safe Hall entrance."
            ),
            new NavManeuver(
                    R.drawable.ic_shield_check,
                    "ARRIVED",
                    0,
                    "YOU HAVE ARRIVED",
                    "Shivaji Community Safe Hall • Check-in Active",
                    "Safe zone reached • Capacity: 450 verified",
                    "You have arrived safely at the emergency shelter. Please proceed inside for check-in and safety triage.",
                    "You have arrived safely at the emergency shelter."
            )
    };

    private void applyManeuver(int index, boolean isClose) {
        if (index < 0 || index >= navManeuvers.length) return;
        NavManeuver m = navManeuvers[index];

        if (ivNavManeuverIcon != null) {
            ivNavManeuverIcon.setImageResource(m.iconRes);
        }
        if (tvNavInstruction != null) {
            tvNavInstruction.setText(m.instruction);
        }
        if (tvNavStreetName != null) {
            tvNavStreetName.setText(m.street);
        }
        if (tvNavNextPreview != null) {
            tvNavNextPreview.setText(m.nextPreview);
        }

        if (isClose) {
            if (index == 0) {
                if (tvNavDistanceMeters != null) tvNavDistanceMeters.setText("50 m");
                if (btnNavSimulateProgress != null) btnNavSimulateProgress.setText("TURN NOW (50 m)");
            } else if (index == 1) {
                if (tvNavDistanceMeters != null) tvNavDistanceMeters.setText("250 m");
                if (btnNavSimulateProgress != null) btnNavSimulateProgress.setText("TURN NOW (250 m)");
            } else if (index == 3) {
                if (tvNavDistanceMeters != null) tvNavDistanceMeters.setText("50 m");
                if (btnNavSimulateProgress != null) btnNavSimulateProgress.setText("ARRIVE (50 m)");
            }
        } else {
            if (tvNavDistanceMeters != null) {
                tvNavDistanceMeters.setText(m.distanceDisplay);
            }
            if (btnNavSimulateProgress != null) {
                if (index == navManeuvers.length - 1) {
                    btnNavSimulateProgress.setText("RESTART EVACUATION");
                } else {
                    btnNavSimulateProgress.setText("NEXT MANEUVER (" + m.distanceDisplay + ")");
                }
            }
        }

        // ETA & remaining distance updates (dynamic Google Maps style)
        int remainingMins = 8;
        if (index == 0) {
            remainingMins = isClose ? 7 : 8;
            if (tvNavEtaMinutes != null) tvNavEtaMinutes.setText(String.valueOf(remainingMins));
            if (tvNavRemainingDist != null) tvNavRemainingDist.setText(isClose ? "•  2.3 km" : "•  2.4 km");
        } else if (index == 1) {
            remainingMins = isClose ? 5 : 6;
            if (tvNavEtaMinutes != null) tvNavEtaMinutes.setText(String.valueOf(remainingMins));
            if (tvNavRemainingDist != null) tvNavRemainingDist.setText(isClose ? "•  1.8 km" : "•  2.3 km");
        } else if (index == 2) {
            remainingMins = isClose ? 3 : 4;
            if (tvNavEtaMinutes != null) tvNavEtaMinutes.setText(String.valueOf(remainingMins));
            if (tvNavRemainingDist != null) tvNavRemainingDist.setText(isClose ? "•  800 m" : "•  1.4 km");
        } else if (index == 3) {
            remainingMins = 1;
            if (tvNavEtaMinutes != null) tvNavEtaMinutes.setText("1");
            if (tvNavRemainingDist != null) tvNavRemainingDist.setText(isClose ? "•  50 m" : "•  150 m");
        } else {
            remainingMins = 0;
            if (tvNavEtaMinutes != null) tvNavEtaMinutes.setText("0");
            if (tvNavRemainingDist != null) tvNavRemainingDist.setText("•  0 m");
        }

        long arrivalMillis = System.currentTimeMillis() + (remainingMins * 60 * 1000L);
        java.text.SimpleDateFormat etaFormat = new java.text.SimpleDateFormat("h:mm a", Locale.getDefault());
        if (tvNavEstimatedArrival != null) {
            tvNavEstimatedArrival.setText("•  " + etaFormat.format(new java.util.Date(arrivalMillis)));
        }
    }

    private void advanceEvacuationProgress() {
        if (currentEvacStepIndex >= navManeuvers.length - 1) {
            // Restart simulation
            currentEvacStepIndex = 0;
            currentStepSubState = 0;
            applyManeuver(0, false);
            speakTurnGuidance(navManeuvers[0].initialSpeech);
            return;
        }

        if (currentStepSubState == 0) {
            currentStepSubState = 1;
            applyManeuver(currentEvacStepIndex, true);
            speakTurnGuidance(navManeuvers[currentEvacStepIndex].closeSpeech);
        } else {
            currentStepSubState = 0;
            currentEvacStepIndex++;
            applyManeuver(currentEvacStepIndex, false);
            speakTurnGuidance(navManeuvers[currentEvacStepIndex].initialSpeech);
        }
    }

    private void repeatCurrentManeuverVoice() {
        if (currentEvacStepIndex >= 0 && currentEvacStepIndex < navManeuvers.length) {
            String speech = (currentStepSubState == 1)
                    ? navManeuvers[currentEvacStepIndex].closeSpeech
                    : navManeuvers[currentEvacStepIndex].initialSpeech;
            speakTurnGuidance(speech);
        }
    }

    private void initTextToSpeech() {
        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int result = textToSpeech.setLanguage(Locale.US);
                if (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED) {
                    textToSpeech.setPitch(1.0f);
                    textToSpeech.setSpeechRate(0.95f);
                }
            }
        });
    }

    private void speakTurnGuidance(String message) {
        if (!isVoiceNavEnabled || textToSpeech == null) return;
        textToSpeech.stop();
        textToSpeech.speak(message, TextToSpeech.QUEUE_FLUSH, null, "evac_turn_" + System.currentTimeMillis());
    }

    private void stopVoiceGuidance() {
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
    }

    private void setupSanthiChat() {
        findViewById(R.id.btnBackChat).setOnClickListener(v -> closeAllOverlays());

        chatAdapter = new ChatAdapter(question -> {
            postChatMessage(question);
        });

        rvChatMessages.setLayoutManager(new LinearLayoutManager(this));
        rvChatMessages.setAdapter(chatAdapter);
        chatAdapter.setItems(repository.getChatHistory());

        // Typing listener to actively illuminate send button and ensure send icon is 100% visible
        etChatMessage.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                boolean hasText = s != null && !s.toString().trim().isEmpty();
                if (btnSendChatMessage != null) {
                    btnSendChatMessage.setActivated(hasText);
                    btnSendChatMessage.animate()
                            .scaleX(hasText ? 1.05f : 1.0f)
                            .scaleY(hasText ? 1.05f : 1.0f)
                            .setDuration(120)
                            .start();
                }
                if (ivSendChatMessage != null) {
                    ivSendChatMessage.setVisibility(View.VISIBLE);
                    ivSendChatMessage.setColorFilter(Color.WHITE);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnSendChatMessage.setOnClickListener(v -> {
            String text = etChatMessage.getText().toString().trim();
            if (!text.isEmpty()) {
                postChatMessage(text);
                etChatMessage.setText("");
            }
        });

        etChatMessage.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                btnSendChatMessage.performClick();
                return true;
            }
            return false;
        });

        // Setup suggestion chips on header
        setupChatHeaderChip(R.id.chipChatWhatToDo, R.string.santhi_chip_what_to_do);
        setupChatHeaderChip(R.id.chipChatIsSafe, R.string.santhi_chip_is_safe);
        setupChatHeaderChip(R.id.chipChatShelter, R.string.santhi_chip_nearest_shelter);
        setupChatHeaderChip(R.id.chipChatEvacuate, R.string.santhi_chip_how_to_evacuate);
        setupChatHeaderChip(R.id.chipChatCarry, R.string.santhi_chip_what_to_carry);
        setupChatHeaderChip(R.id.chipChatNoInternet, R.string.santhi_chip_no_internet);
    }

    private void setupChatHeaderChip(int chipId, int stringRes) {
        View chip = findViewById(chipId);
        if (chip != null) {
            chip.setOnClickListener(v -> postChatMessage(getString(stringRes)));
        }
    }

    private void postChatMessage(String messageText) {
        // Add only the user's message to repository history
        repository.addUserMessage(messageText);
        chatAdapter.setItems(repository.getChatHistory());
        rvChatMessages.scrollToPosition(repository.getChatHistory().size() - 1);

        // Push Citizen message to Firebase Realtime Database
        FireSafeApiClient.getInstance().sendCitizenChatMessage(messageText, null);

        // Temporary thinking placeholder
        String typingId = "typing_" + System.currentTimeMillis();
        String typingTime = new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
        ChatMessage typingMsg = new ChatMessage(
                typingId,
                "Thinking... SANthi AI analyzing sector hazards",
                false,
                typingTime,
                null,
                false
        );
        chatAdapter.addMessage(typingMsg);
        rvChatMessages.scrollToPosition(chatAdapter.getItemCount() - 1);

        // Send to Groq AI API
        GroqAiService.getInstance().sendMessage(messageText, new GroqAiService.ChatCallback() {
            @Override
            public void onSuccess(String aiReply) {
                chatAdapter.removeMessageById(typingId);
                String timestamp = new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date());
                ChatMessage aiMsg = new ChatMessage(
                        "ai_" + System.currentTimeMillis(),
                        aiReply,
                        false,
                        timestamp,
                        null,
                        true
                );
                repository.addAiMessage(aiMsg);
                chatAdapter.setItems(repository.getChatHistory());

                if (viewSanthiChat.getVisibility() == View.VISIBLE) {
                    rvChatMessages.scrollToPosition(chatAdapter.getItemCount() - 1);
                } else {
                    if (viewUnreadBellDot != null) {
                        viewUnreadBellDot.setVisibility(View.VISIBLE);
                    }
                    Toast.makeText(MainActivity.this, "🤖 SANthi AI has answered your query", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onError(String errorText) {
                chatAdapter.removeMessageById(typingId);
                // Graceful fallback to local domain safety intelligence
                ChatMessage fallbackAiMsg = repository.generateFallbackAiResponse(messageText);
                repository.addAiMessage(fallbackAiMsg);
                chatAdapter.setItems(repository.getChatHistory());

                if (viewSanthiChat.getVisibility() == View.VISIBLE) {
                    rvChatMessages.scrollToPosition(chatAdapter.getItemCount() - 1);
                }
            }
        });
    }

    private void setupSheltersDirectory() {
        findViewById(R.id.btnBackShelters).setOnClickListener(v -> closeAllOverlays());

        sheltersAdapter = new SheltersAdapter(shelter -> {
            closeAllOverlays();
            if (shelter != null) {
                openGoogleMapsNavigation(shelter.getLatitude(), shelter.getLongitude(), shelter.getName());
            } else {
                openGoogleMapsForNearestShelter();
            }
        });

        rvSheltersDirectory.setLayoutManager(new LinearLayoutManager(this));
        rvSheltersDirectory.setAdapter(sheltersAdapter);
        sheltersAdapter.setItems(repository.getShelters());
    }

    private void setupPrecautionsScreen() {
        findViewById(R.id.btnBackPrecautions).setOnClickListener(v -> closeAllOverlays());

        containerPrecautions.removeAllViews();
        List<PrecautionItem> list = repository.getPrecautions();

        for (PrecautionItem item : list) {
            MaterialCardView card = new MaterialCardView(this);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            lp.setMargins(0, 0, 0, getResources().getDimensionPixelSize(R.dimen.spacing_sm));
            card.setLayoutParams(lp);
            card.setRadius(getResources().getDimension(R.dimen.card_radius_medium));
            card.setStrokeColor(ContextCompat.getColor(this, R.color.border));
            card.setStrokeWidth(1);
            card.setCardElevation(2);

            LinearLayout content = new LinearLayout(this);
            content.setOrientation(LinearLayout.VERTICAL);
            int pad = getResources().getDimensionPixelSize(R.dimen.spacing_md);
            content.setPadding(pad, pad, pad, pad);

            TextView tvCat = new TextView(this);
            tvCat.setText(item.getCategory().getLabel().toUpperCase(Locale.ROOT));
            tvCat.setTextSize(11);
            tvCat.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            tvCat.setTypeface(null, android.graphics.Typeface.BOLD);
            content.addView(tvCat);

            TextView tvTitle = new TextView(this);
            tvTitle.setText(item.getTitle());
            tvTitle.setTextSize(17);
            tvTitle.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
            tvTitle.setTypeface(null, android.graphics.Typeface.BOLD);
            tvTitle.setPadding(0, 6, 0, 4);
            content.addView(tvTitle);

            TextView tvSummary = new TextView(this);
            tvSummary.setText(item.getSummary());
            tvSummary.setTextSize(14);
            tvSummary.setTextColor(ContextCompat.getColor(this, R.color.text_secondary));
            content.addView(tvSummary);

            // Bullet points
            for (String bp : item.getBulletPoints()) {
                TextView bullet = new TextView(this);
                bullet.setText("• " + bp);
                bullet.setTextSize(13);
                bullet.setTextColor(ContextCompat.getColor(this, R.color.text_primary));
                bullet.setPadding(12, 6, 0, 0);
                content.addView(bullet);
            }

            card.addView(content);
            containerPrecautions.addView(card);
        }
    }

    private void setupSosButton() {
        btnSosHold.setOnSosTriggeredListener(new SosHoldButton.OnSosTriggeredListener() {
            @Override
            public void onSosTriggered() {
                showSosDialog();
            }

            @Override
            public void onHoldProgress(float progress) {
                // Hold hint removed from UI — no-op
            }

            @Override
            public void onHoldCancelled() {
                // Hold hint removed from UI — no-op
            }
        });

        findViewById(R.id.btnCloseSosDialog).setOnClickListener(v -> hideSosDialog());
        btnSosCancel.setOnClickListener(v -> hideSosDialog());
        btnSosCall112.setOnClickListener(v -> makePhoneCall("112"));
        if (btnSosOpenControlRoom != null) {
            btnSosOpenControlRoom.setOnClickListener(v -> {
                hideSosDialog();
                openControlRoomScreen();
            });
        }
    }


    private int getLiveBatteryPercent() {
        try {
            IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = registerReceiver(null, ifilter);
            if (batteryStatus != null) {
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
                if (level >= 0 && scale > 0) {
                    return Math.round((level / (float) scale) * 100);
                }
            }
        } catch (Exception e) {
            Log.w("MainActivity", "Failed to read live battery", e);
        }
        return repository.getSimulatedBatteryPercent();
    }

    private void initLiveGpsTracking() {
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

        // Check if fine or coarse location permissions are granted
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // Actively prompt the user on startup for real location permission
            tvTopLocation.setText("Locating (Requesting GPS)...");
            tvTopUpdated.setText("Permission required");
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    },
                    RC_LOCATION_PERMISSION
            );
        } else {
            // Check if device location settings are enabled
            checkLocationProvidersEnabled();
            // Already granted: start continuous GPS tracking immediately
            startActiveLocationUpdates();
        }
    }

    private void checkLocationProvidersEnabled() {
        if (locationManager == null) {
            locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        }
        if (locationManager != null) {
            boolean isGpsEnabled = false;
            boolean isNetworkEnabled = false;
            try {
                isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
                isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
            } catch (Exception ignored) {}

            if (!isGpsEnabled && !isNetworkEnabled) {
                Toast.makeText(this, "Please turn ON Location (GPS) in Settings for real-time safety tracking", Toast.LENGTH_LONG).show();
                if (tvTopLocation != null) tvTopLocation.setText("Location Off (Tap to Enable)");
                if (tvTopUpdated != null) tvTopUpdated.setText("Settings required");
            }
        }
    }

    @SuppressLint("MissingPermission")
    private void startActiveLocationUpdates() {
        if (locationManager == null) {
            locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        }
        if (locationManager == null) return;

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        try {
            // 1. Immediately poll last known location from all available providers
            Location bestLastLoc = null;
            List<String> providers = locationManager.getAllProviders();
            for (String provider : providers) {
                try {
                    Location l = locationManager.getLastKnownLocation(provider);
                    if (l != null) {
                        if (bestLastLoc == null || l.getTime() > bestLastLoc.getTime()
                                || (l.hasAccuracy() && bestLastLoc.hasAccuracy() && l.getAccuracy() < bestLastLoc.getAccuracy())) {
                            bestLastLoc = l;
                        }
                    }
                } catch (SecurityException ignored) {}
            }

            if (bestLastLoc != null) {
                applyLiveLocation(bestLastLoc, false);
            }

            // 2. On Android 30+ (API 30), invoke modern getCurrentLocation for rapid GPS / Network fix
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                        locationManager.getCurrentLocation(
                                LocationManager.GPS_PROVIDER,
                                null,
                                ContextCompat.getMainExecutor(this),
                                loc -> {
                                    if (loc != null) applyLiveLocation(loc, false);
                                }
                        );
                    }
                    if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                        locationManager.getCurrentLocation(
                                LocationManager.NETWORK_PROVIDER,
                                null,
                                ContextCompat.getMainExecutor(this),
                                loc -> {
                                    if (loc != null) applyLiveLocation(loc, false);
                                }
                        );
                    }
                } catch (SecurityException ignored) {}
            }

            // 3. Register continuous live GPS updates listener
            if (liveLocationListener == null) {
                liveLocationListener = new LocationListener() {
                    @Override
                    public void onLocationChanged(@NonNull Location location) {
                        applyLiveLocation(location, true);
                    }

                    @Override
                    public void onProviderEnabled(@NonNull String provider) {
                        Log.i("MainActivity", "Location provider enabled: " + provider);
                    }

                    @Override
                    public void onProviderDisabled(@NonNull String provider) {
                        Log.w("MainActivity", "Location provider disabled: " + provider);
                    }
                };
            }

            // Request updates: 1 second interval, 1 meter threshold
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 1f, liveLocationListener);
            }
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000L, 1f, liveLocationListener);
            }
            if (locationManager.isProviderEnabled(LocationManager.PASSIVE_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.PASSIVE_PROVIDER, 1000L, 1f, liveLocationListener);
            }
        } catch (SecurityException se) {
            Log.e("MainActivity", "SecurityException requesting location updates", se);
        } catch (Exception e) {
            Log.e("MainActivity", "Error starting active location tracking", e);
        }
    }

    private void applyLiveLocation(Location loc, boolean fromListener) {
        if (loc == null) return;
        lastKnownLiveLocation = loc;
        hasRealLocationFix = true;

        final double lat = loc.getLatitude();
        final double lng = loc.getLongitude();

        // Asynchronously reverse-geocode the real location coordinates to obtain the actual city/neighborhood name
        new Thread(() -> {
            String resolvedAddress = null;
            try {
                if (Geocoder.isPresent()) {
                    Geocoder geocoder = new Geocoder(MainActivity.this, Locale.getDefault());
                    List<Address> addresses = geocoder.getFromLocation(lat, lng, 1);
                    if (addresses != null && !addresses.isEmpty()) {
                        Address addr = addresses.get(0);
                        StringBuilder sb = new StringBuilder();
                        if (addr.getSubLocality() != null && !addr.getSubLocality().isEmpty()) {
                            sb.append(addr.getSubLocality());
                        }
                        if (addr.getLocality() != null && !addr.getLocality().isEmpty()) {
                            if (sb.length() > 0) sb.append(", ");
                            sb.append(addr.getLocality());
                        } else if (addr.getSubAdminArea() != null && !addr.getSubAdminArea().isEmpty()) {
                            if (sb.length() > 0) sb.append(", ");
                            sb.append(addr.getSubAdminArea());
                        }
                        if (addr.getAdminArea() != null && !addr.getAdminArea().isEmpty()) {
                            if (sb.length() > 0) sb.append(", ");
                            sb.append(addr.getAdminArea());
                        }
                        if (sb.length() > 0) {
                            resolvedAddress = sb.toString();
                        } else if (addr.getAddressLine(0) != null) {
                            resolvedAddress = addr.getAddressLine(0);
                        }
                    }
                }
            } catch (Exception e) {
                Log.w("MainActivity", "Geocoder resolution note", e);
            }

            if (resolvedAddress == null || resolvedAddress.trim().isEmpty()) {
                resolvedAddress = String.format(Locale.US, "GPS (%.4f, %.4f)", lat, lng);
            }

            final String finalResolvedLoc = resolvedAddress;
            runOnUiThread(() -> {
                currentLiveAddress = finalResolvedLoc;
                repository.updateCurrentLocation(finalResolvedLoc, lat, lng);
                tvTopLocation.setText(finalResolvedLoc);
                tvTopUpdated.setText("Live GPS • Just now");

                if (tvCitizenLocation != null) {
                    tvCitizenLocation.setText("Live GPS: " + finalResolvedLoc);
                }

                if (fullInteractiveMapView != null) {
                    fullInteractiveMapView.updateMapFromRepository();
                }

                // If this is the initial acquisition, sync with backend for this real location
                if (!hasSyncedRealLocation) {
                    hasSyncedRealLocation = true;
                    setupRealtimeApiSync();
                }

                // If SOS is currently active, update its coordinates in Realtime DB immediately
                if (currentActiveSosEvent != null) {
                    currentActiveSosEvent.setLatitude(lat);
                    currentActiveSosEvent.setLongitude(lng);
                    currentActiveSosEvent.setAddress(finalResolvedLoc);
                    if (tvSosCoordinates != null) {
                        tvSosCoordinates.setText(String.format(Locale.US, "%.5f° N, %.5f° E (%s)", lat, lng, finalResolvedLoc));
                    }
                    if (currentSosPushKey != null && !currentSosPushKey.isEmpty()) {
                        FireSafeApiClient.getInstance().updateSosLocation(currentSosPushKey, lat, lng, finalResolvedLoc, null);
                    }
                }
            });
        }).start();
    }

    private double[] getLiveCoordinates() {
        if (hasRealLocationFix && lastKnownLiveLocation != null) {
            return new double[]{lastKnownLiveLocation.getLatitude(), lastKnownLiveLocation.getLongitude()};
        }

        try {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                if (locationManager == null) {
                    locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                }
                if (locationManager != null) {
                    Location bestLoc = null;
                    List<String> providers = locationManager.getAllProviders();
                    for (String provider : providers) {
                        try {
                            Location loc = locationManager.getLastKnownLocation(provider);
                            if (loc != null) {
                                if (bestLoc == null || loc.getTime() > bestLoc.getTime()
                                        || (loc.hasAccuracy() && bestLoc.hasAccuracy() && loc.getAccuracy() < bestLoc.getAccuracy())) {
                                    bestLoc = loc;
                                }
                            }
                        } catch (SecurityException ignored) {}
                    }
                    if (bestLoc != null) {
                        lastKnownLiveLocation = bestLoc;
                        hasRealLocationFix = true;
                        repository.updateCurrentLocation(repository.getCurrentLocationName(), bestLoc.getLatitude(), bestLoc.getLongitude());
                        return new double[]{bestLoc.getLatitude(), bestLoc.getLongitude()};
                    }
                }
            }
        } catch (Exception e) {
            Log.w("MainActivity", "Failed to read GPS location", e);
        }
        return new double[]{repository.getCurrentLatitude(), repository.getCurrentLongitude()};
    }

    private void showSosDialog() {
        viewSosDialog.setVisibility(View.VISIBLE);

        // Check runtime permissions for Location, Audio, and SMS
        List<String> neededPermissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.RECORD_AUDIO);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.SEND_SMS);
        }
        if (!neededPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, neededPermissions.toArray(new String[0]), 102);
        }

        // Kick off active location updates right now
        startActiveLocationUpdates();

        // Acquire REAL live GPS coordinates
        double[] coords = getLiveCoordinates();
        double liveLat = coords[0];
        double liveLng = coords[1];
        int liveBattery = getLiveBatteryPercent();
        String locName = (currentLiveAddress != null && !currentLiveAddress.isEmpty())
                ? currentLiveAddress
                : (hasRealLocationFix ? String.format(Locale.US, "Live GPS (%.4f, %.4f)", liveLat, liveLng) : "Acquiring live GPS fix...");
        FireRiskStatus riskStatus = repository.getCurrentRiskStatus();

        SosEvent event = repository.dispatchEmergencySos(liveLat, liveLng, locName, liveBattery, riskStatus);
        event.setPhone("+91 112");
        event.setDeviceInfo(Build.MANUFACTURER + " " + Build.MODEL + " (Android " + Build.VERSION.RELEASE + ")");
        currentActiveSosEvent = event;
        currentSosPushKey = event.getDispatchId();

        // Activate Emergency Incident Ticket in Control Room
        ControlRoomTicket sosTicket = ControlRoomManager.getInstance().activateSosTicket(liveLat, liveLng, locName, liveBattery);
        if (tvSosTicketNumber != null && sosTicket != null) {
            tvSosTicketNumber.setText("EMERGENCY TICKET #" + sosTicket.getTicketId() + " ACTIVE");
        }
        if (btnSosOpenControlRoom != null) {
            btnSosOpenControlRoom.setOnClickListener(v -> {
                hideSosDialog();
                openControlRoomScreen();
            });
        }

        if (hasRealLocationFix) {
            tvSosCoordinates.setText(String.format(Locale.US, "%.5f° N, %.5f° E (%s)",
                    event.getLatitude(), event.getLongitude(), event.getAddress()));
        } else {
            tvSosCoordinates.setText("Acquiring live satellite GPS coordinates...");
        }
        tvSosTimestamp.setText(event.getTimestamp());
        tvSosBattery.setText(event.getBatteryPercent() + "% (Live Device Battery)");

        pbSosStatus.setVisibility(View.VISIBLE);
        ivSosStatusDone.setVisibility(View.GONE);
        tvSosStatusText.setText("Transmitting live location to Realtime Database...");

        // Reset Audio & SMS status views
        if (tvSosAudioStatus != null) {
            tvSosAudioStatus.setText("Starting ambient distress audio recording...");
            tvSosAudioStatus.setTextColor(ContextCompat.getColor(this, R.color.extreme));
        }
        if (ivSosAudioStatusIcon != null) {
            ivSosAudioStatusIcon.setColorFilter(ContextCompat.getColor(this, R.color.extreme));
        }
        if (tvSosCloudinaryUrl != null) {
            tvSosCloudinaryUrl.setVisibility(View.GONE);
        }
        if (btnSosStopRecord != null) {
            btnSosStopRecord.setEnabled(true);
            btnSosStopRecord.setText("Finish & Send");
            btnSosStopRecord.setOnClickListener(v -> finishAndUploadAudioRecording(liveLat, liveLng, locName));
        }
        if (tvSosSmsStatus != null) {
            tvSosSmsStatus.setText("Dispatching immediate emergency SMS...");
        }
        
        // Dispatch SMS immediately to avoid delay!
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED) {
            dispatchEmergencySmsToContacts(liveLat, liveLng, locName, null);
        }

        // 1. Dispatch initial SOS metadata to Realtime Database and Backend Gateway
        FireSafeApiClient.getInstance().dispatchRealtimeSos(event, (success, message) -> {
            pbSosStatus.setVisibility(View.GONE);
            ivSosStatusDone.setVisibility(View.VISIBLE);
            tvSosStatusText.setText(message != null ? message : "Dispatched to Realtime Emergency Dashboard");
            event.setStatus(SosEvent.TransmissionStatus.SENT);
            if (event.getDispatchId() != null && !event.getDispatchId().isEmpty()) {
                currentSosPushKey = event.getDispatchId();
            }
        });

        // 2. Start Voice Audio Recording automatically
        startSosDistressAudioRecording(liveLat, liveLng, locName);
    }

    private void startSosDistressAudioRecording(double liveLat, double liveLng, String locName) {
        if (sosAudioRecorder == null) {
            sosAudioRecorder = SosAudioRecorder.getInstance(this);
        }

        sosAudioRecorder.startRecording(new SosAudioRecorder.RecordingCallback() {
            @Override
            public void onStarted(File audioFile) {
                currentSosAudioFilePath = audioFile.getAbsolutePath();
                if (tvSosAudioStatus != null) {
                    tvSosAudioStatus.setText("Recording distress audio... (00:00)");
                }
            }

            @Override
            public void onProgress(int secondsElapsed) {
                if (tvSosAudioStatus != null) {
                    tvSosAudioStatus.setText(String.format(Locale.US, "Recording distress audio... (00:%02d)", secondsElapsed));
                }
                // Automatically finish and upload after 8 seconds of ambient distress audio
                if (secondsElapsed >= 8) {
                    finishAndUploadAudioRecording(liveLat, liveLng, locName);
                }
            }

            @Override
            public void onCompleted(File audioFile) {
                uploadSosAudioToCloudinary(audioFile, liveLat, liveLng, locName);
            }

            @Override
            public void onError(String error) {
                if (tvSosAudioStatus != null) {
                    tvSosAudioStatus.setText("Audio capture note: " + error);
                }
                // Re-poll freshest live GPS coordinates
                double[] fresh = getLiveCoordinates();
                double finalLat = hasRealLocationFix ? fresh[0] : liveLat;
                double finalLng = hasRealLocationFix ? fresh[1] : liveLng;
                String finalLoc = (currentLiveAddress != null && !currentLiveAddress.isEmpty())
                        ? currentLiveAddress
                        : (hasRealLocationFix ? String.format(Locale.US, "GPS (%.5f, %.5f)", finalLat, finalLng) : locName);

                // SMS was already dispatched immediately, no need to wait for error
            }
        });
    }

    private void finishAndUploadAudioRecording(double liveLat, double liveLng, String locName) {
        if (sosAudioRecorder != null && sosAudioRecorder.isRecording()) {
            if (btnSosStopRecord != null) {
                btnSosStopRecord.setEnabled(false);
                btnSosStopRecord.setText("Uploading...");
            }
            if (tvSosAudioStatus != null) {
                tvSosAudioStatus.setText("Finalizing recording & uploading to Cloudinary...");
            }
            sosAudioRecorder.stopRecording();
        }
    }

    private void uploadSosAudioToCloudinary(File audioFile, double liveLat, double liveLng, String locName) {
        if (tvSosAudioStatus != null) {
            tvSosAudioStatus.setText("Uploading recording to Cloudinary CDN...");
        }

        CloudinaryUploader.uploadAudio(audioFile, new CloudinaryUploader.UploadCallback() {
            @Override
            public void onSuccess(String secureUrl, String publicId) {
                if (tvSosAudioStatus != null) {
                    tvSosAudioStatus.setText("Voice recording secured on Cloudinary");
                    tvSosAudioStatus.setTextColor(ContextCompat.getColor(MainActivity.this, R.color.safe));
                }
                if (ivSosAudioStatusIcon != null) {
                    ivSosAudioStatusIcon.setColorFilter(ContextCompat.getColor(MainActivity.this, R.color.safe));
                }
                if (tvSosCloudinaryUrl != null) {
                    tvSosCloudinaryUrl.setVisibility(View.VISIBLE);
                    tvSosCloudinaryUrl.setText("Cloudinary: " + secureUrl);
                }
                if (btnSosStopRecord != null) {
                    btnSosStopRecord.setText("Uploaded");
                    btnSosStopRecord.setEnabled(false);
                }

                // Re-poll freshest live GPS coordinates
                double[] fresh = getLiveCoordinates();
                double finalLat = hasRealLocationFix ? fresh[0] : liveLat;
                double finalLng = hasRealLocationFix ? fresh[1] : liveLng;
                String finalLoc = (currentLiveAddress != null && !currentLiveAddress.isEmpty())
                        ? currentLiveAddress
                        : (hasRealLocationFix ? String.format(Locale.US, "GPS (%.5f, %.5f)", finalLat, finalLng) : locName);

                // Update SOS in Realtime Database with Cloudinary audio URL AND fresh coordinates
                if (currentActiveSosEvent != null) {
                    currentActiveSosEvent.setLatitude(finalLat);
                    currentActiveSosEvent.setLongitude(finalLng);
                    currentActiveSosEvent.setAddress(finalLoc);
                    currentActiveSosEvent.setAudioUrl(secureUrl);
                    currentActiveSosEvent.setCloudinaryUrl(secureUrl);
                }
                if (currentSosPushKey != null && !currentSosPushKey.isEmpty()) {
                    FireSafeApiClient.getInstance().updateSosAudioUrl(currentSosPushKey, secureUrl, null);
                    if (hasRealLocationFix) {
                        FireSafeApiClient.getInstance().updateSosLocation(currentSosPushKey, finalLat, finalLng, finalLoc, null);
                    }
                }

                // SMS already dispatched immediately. Skipped secondary dispatch.
            }

            @Override
            public void onError(String error) {
                if (tvSosAudioStatus != null) {
                    tvSosAudioStatus.setText("Cloudinary: " + error);
                }
                // Re-poll freshest live GPS coordinates
                double[] fresh = getLiveCoordinates();
                double finalLat = hasRealLocationFix ? fresh[0] : liveLat;
                double finalLng = hasRealLocationFix ? fresh[1] : liveLng;
                String finalLoc = (currentLiveAddress != null && !currentLiveAddress.isEmpty())
                        ? currentLiveAddress
                        : (hasRealLocationFix ? String.format(Locale.US, "GPS (%.5f, %.5f)", finalLat, finalLng) : locName);

                // SMS already dispatched immediately. Skipped fallback.
            }
        });
    }

    private void dispatchEmergencySmsToContacts(double liveLat, double liveLng, String locName, String cloudinaryAudioUrl) {
        List<EmergencyContact> contacts = EmergencyContactsManager.getInstance(this).getContacts();
        if (contacts.isEmpty()) {
            if (tvSosSmsStatus != null) {
                tvSosSmsStatus.setText("No emergency contacts saved in Account. Add in Profile!");
            }
            return;
        }

        if (tvSosSmsStatus != null) {
            tvSosSmsStatus.setText("Dispatching multi-part SMS to " + contacts.size() + " emergency contacts...");
        }

        SosSmsDispatcher.sendEmergencySms(this, contacts, liveLat, liveLng, locName, cloudinaryAudioUrl,
                new SosSmsDispatcher.SmsCallback() {
                    @Override
                    public void onProgress(int sent, int total, String lastRecipient) {
                        if (tvSosSmsStatus != null) {
                            tvSosSmsStatus.setText("Emergency SMS sent (" + sent + "/" + total + "): " + lastRecipient);
                        }
                    }

                    @Override
                    public void onCompleted(int totalSent) {
                        if (tvSosSmsStatus != null) {
                            tvSosSmsStatus.setText("Emergency SMS sent to " + totalSent + " contacts via SmsManager");
                        }
                        if (ivSosSmsIcon != null) {
                            ivSosSmsIcon.setColorFilter(ContextCompat.getColor(MainActivity.this, R.color.safe));
                        }
                        if (currentActiveSosEvent != null) {
                            currentActiveSosEvent.setSmsDispatched(true);
                        }
                    }

                    @Override
                    public void onError(String error) {
                        if (tvSosSmsStatus != null) {
                            tvSosSmsStatus.setText("SMS dispatch: " + error);
                        }
                    }
                });
    }

    private void hideSosDialog() {
        if (sosAudioRecorder != null && sosAudioRecorder.isRecording()) {
            sosAudioRecorder.cancelRecording();
        }
        viewSosDialog.setVisibility(View.GONE);
    }


    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (viewSosDialog.getVisibility() == View.VISIBLE) {
                    hideSosDialog();
                } else if (viewSendAlertDialog != null && viewSendAlertDialog.getVisibility() == View.VISIBLE) {
                    hideSendAlertDialog();
                } else if ((viewControlRoom != null && viewControlRoom.getVisibility() == View.VISIBLE)
                        || viewEvacuation.getVisibility() == View.VISIBLE
                        || viewSanthiChat.getVisibility() == View.VISIBLE
                        || viewShelters.getVisibility() == View.VISIBLE
                        || viewPrecautions.getVisibility() == View.VISIBLE) {
                    closeAllOverlays();
                } else if (bottomNavigation.getSelectedItemId() != R.id.nav_home) {
                    bottomNavigation.setSelectedItemId(R.id.nav_home);
                } else {
                    finish();
                }
            }
        });
    }

    private void openEvacuationScreen() {
        openGoogleMapsForActiveIncident();
    }

    public void openGoogleMapsNavigation(double lat, double lng, String label) {
        if (lat == 0.0 && lng == 0.0) {
            lat = 18.5350;
            lng = 73.8320;
        }

        String destinationName = (label != null && !label.trim().isEmpty()) ? label : "Safe Evacuation Point";
        Toast.makeText(this, "Redirecting to Google Maps: " + destinationName, Toast.LENGTH_SHORT).show();

        // 1. First priority: Google Maps native turn-by-turn navigation (driving mode)
        try {
            android.net.Uri gmmIntentUri = android.net.Uri.parse(
                String.format(Locale.US, "google.navigation:q=%.6f,%.6f&mode=d", lat, lng)
            );
            Intent mapIntent = new Intent(Intent.ACTION_VIEW, gmmIntentUri);
            mapIntent.setPackage("com.google.android.apps.maps");
            startActivity(mapIntent);
            return;
        } catch (ActivityNotFoundException e) {
            // Google Maps app not found with package restriction
        } catch (Exception ignored) {
        }

        // 2. Second priority: Geo navigation URI with destination label
        try {
            String encodedLabel = android.net.Uri.encode(destinationName);
            android.net.Uri geoUri = android.net.Uri.parse(
                String.format(Locale.US, "geo:%.6f,%.6f?q=%.6f,%.6f(%s)", lat, lng, lat, lng, encodedLabel)
            );
            Intent geoIntent = new Intent(Intent.ACTION_VIEW, geoUri);
            startActivity(geoIntent);
            return;
        } catch (ActivityNotFoundException e) {
        } catch (Exception ignored) {
        }

        // 3. Third priority: Universal Google Maps web directions URL
        try {
            android.net.Uri webUri = android.net.Uri.parse(
                String.format(Locale.US, "https://www.google.com/maps/dir/?api=1&destination=%.6f,%.6f", lat, lng)
            );
            Intent webIntent = new Intent(Intent.ACTION_VIEW, webUri);
            startActivity(webIntent);
        } catch (Exception ex) {
            Toast.makeText(this, "Could not open Google Maps", Toast.LENGTH_SHORT).show();
        }
    }

    public void openGoogleMapsForActiveIncident() {
        FireAlert active = repository.getActiveNearbyAlert();
        if (active == null) {
            List<FireAlert> alerts = repository.getAlerts();
            if (alerts != null && !alerts.isEmpty()) {
                active = alerts.get(0);
            }
        }
        if (active != null) {
            openGoogleMapsNavigation(active.getLatitude(), active.getLongitude(), active.getTitle());
        } else {
            openGoogleMapsForNearestShelter();
        }
    }

    public void openGoogleMapsForNearestShelter() {
        SafeShelter nearest = repository.getNearestShelter();
        if (nearest != null) {
            openGoogleMapsNavigation(nearest.getLatitude(), nearest.getLongitude(), nearest.getName());
        } else {
            openGoogleMapsNavigation(18.4715, 73.8630, "Bibwewadi Community Relief Center & Hall");
        }
    }

    private void openSanthiChatScreen() {
        closeAllOverlays();
        viewSanthiChat.setVisibility(View.VISIBLE);
        if (bottomNavigation != null) bottomNavigation.setVisibility(View.GONE);
        if (layoutFloatingSos != null) layoutFloatingSos.setVisibility(View.GONE);
        if (topBar != null) topBar.setVisibility(View.GONE);
        if (viewUnreadBellDot != null) {
            viewUnreadBellDot.setVisibility(View.GONE);
        }
        setStatusBarAppearance(true);
        applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);
    }

    private void openSheltersDirectory() {
        closeAllOverlays();
        viewShelters.setVisibility(View.VISIBLE);
        if (bottomNavigation != null) bottomNavigation.setVisibility(View.GONE);
        if (layoutFloatingSos != null) layoutFloatingSos.setVisibility(View.GONE);
        if (topBar != null) topBar.setVisibility(View.GONE);
        setStatusBarAppearance(true);
        applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);
    }

    private void openPrecautionsScreen() {
        closeAllOverlays();
        viewPrecautions.setVisibility(View.VISIBLE);
        if (bottomNavigation != null) bottomNavigation.setVisibility(View.GONE);
        if (layoutFloatingSos != null) layoutFloatingSos.setVisibility(View.GONE);
        if (topBar != null) topBar.setVisibility(View.GONE);
        setStatusBarAppearance(true);
        applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);
    }

    private void openControlRoomScreen() {
        closeAllOverlays();
        if (viewControlRoom != null) viewControlRoom.setVisibility(View.VISIBLE);
        if (bottomNavigation != null) bottomNavigation.setVisibility(View.GONE);
        if (layoutFloatingSos != null) layoutFloatingSos.setVisibility(View.GONE);
        if (topBar != null) topBar.setVisibility(View.GONE);
        if (viewUnreadBellDot != null) {
            viewUnreadBellDot.setVisibility(View.GONE);
        }
        setStatusBarAppearance(false);
        applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);

        updateControlRoomTicketUi(ControlRoomManager.getInstance().getActiveTicket());
        if (controlRoomAdapter != null) {
            controlRoomAdapter.setItems(ControlRoomManager.getInstance().getMessages());
            if (rvControlRoomMessages != null && controlRoomAdapter.getItemCount() > 0) {
                rvControlRoomMessages.scrollToPosition(controlRoomAdapter.getItemCount() - 1);
            }
        }
    }

    private void setupControlRoom() {
        View btnBack = findViewById(R.id.btnBackControlRoom);
        if (btnBack != null) btnBack.setOnClickListener(v -> closeAllOverlays());

        View btnCall = findViewById(R.id.btnCallControlRoom);
        if (btnCall != null) btnCall.setOnClickListener(v -> makePhoneCall("112"));

        rvControlRoomMessages = findViewById(R.id.rvControlRoomMessages);
        etControlRoomMessage = findViewById(R.id.etControlRoomMessage);
        btnSendControlRoomMessage = findViewById(R.id.btnSendControlRoomMessage);

        cardTicketActiveBanner = findViewById(R.id.cardTicketActiveBanner);
        cardTicketInactiveBanner = findViewById(R.id.cardTicketInactiveBanner);
        tvActiveTicketId = findViewById(R.id.tvActiveTicketId);
        tvActiveTicketDetails = findViewById(R.id.tvActiveTicketDetails);
        tvControlRoomSubtitle = findViewById(R.id.tvControlRoomSubtitle);
        btnResolveTicket = findViewById(R.id.btnResolveTicket);
        btnBannerTriggerSos = findViewById(R.id.btnBannerTriggerSos);
        btnBannerSendAlert = findViewById(R.id.btnBannerSendAlert);

        View btnQuickAlertShortcut = findViewById(R.id.btnQuickAlertShortcut);
        if (btnQuickAlertShortcut != null) {
            btnQuickAlertShortcut.setOnClickListener(v -> showSendAlertDialog());
        }

        if (btnResolveTicket != null) {
            btnResolveTicket.setOnClickListener(v -> {
                ControlRoomManager.getInstance().resolveTicket();
                Toast.makeText(this, "Incident Ticket Marked Resolved", Toast.LENGTH_SHORT).show();
            });
        }

        if (btnBannerTriggerSos != null) {
            btnBannerTriggerSos.setOnClickListener(v -> showSosDialog());
        }

        if (btnBannerSendAlert != null) {
            btnBannerSendAlert.setOnClickListener(v -> showSendAlertDialog());
        }

        controlRoomAdapter = new ControlRoomAdapter();
        if (rvControlRoomMessages != null) {
            rvControlRoomMessages.setLayoutManager(new LinearLayoutManager(this));
            rvControlRoomMessages.setAdapter(controlRoomAdapter);
            controlRoomAdapter.setItems(ControlRoomManager.getInstance().getMessages());
        }

        if (btnSendControlRoomMessage != null) {
            btnSendControlRoomMessage.setOnClickListener(v -> {
                if (etControlRoomMessage != null) {
                    String text = etControlRoomMessage.getText().toString().trim();
                    if (!text.isEmpty()) {
                        ControlRoomManager.getInstance().postCitizenMessage(text);
                        etControlRoomMessage.setText("");
                    }
                }
            });
        }

        if (etControlRoomMessage != null) {
            etControlRoomMessage.setOnEditorActionListener((v, actionId, event) -> {
                if (actionId == EditorInfo.IME_ACTION_SEND) {
                    if (btnSendControlRoomMessage != null) btnSendControlRoomMessage.performClick();
                    return true;
                }
                return false;
            });
        }

        ControlRoomManager.getInstance().addListener(new ControlRoomManager.ControlRoomListener() {
            @Override
            public void onMessagesUpdated() {
                runOnUiThread(() -> {
                    if (controlRoomAdapter != null) {
                        controlRoomAdapter.setItems(ControlRoomManager.getInstance().getMessages());
                        if (rvControlRoomMessages != null && controlRoomAdapter.getItemCount() > 0) {
                            rvControlRoomMessages.scrollToPosition(controlRoomAdapter.getItemCount() - 1);
                        }
                    }
                });
            }

            @Override
            public void onTicketStateChanged(ControlRoomTicket ticket) {
                runOnUiThread(() -> updateControlRoomTicketUi(ticket));
            }
        });

        updateControlRoomTicketUi(ControlRoomManager.getInstance().getActiveTicket());
    }

    private void updateControlRoomTicketUi(ControlRoomTicket ticket) {
        boolean isActive = ticket != null && ticket.isActive();
        if (cardTicketActiveBanner != null) cardTicketActiveBanner.setVisibility(isActive ? View.VISIBLE : View.GONE);
        if (cardTicketInactiveBanner != null) cardTicketInactiveBanner.setVisibility(isActive ? View.GONE : View.VISIBLE);

        if (isActive) {
            if (tvActiveTicketId != null) {
                tvActiveTicketId.setText("TICKET #" + ticket.getTicketId() + " • ACTIVE");
            }
            if (tvActiveTicketDetails != null) {
                tvActiveTicketDetails.setText("Incident: " + ticket.getSource() + " (" + ticket.getSeverity() + ")\nSector: "
                        + ticket.getLocationName() + " • Assigned: " + ticket.getAssignedManager());
            }
            if (tvControlRoomSubtitle != null) {
                tvControlRoomSubtitle.setText("🟢 Active Ticket #" + ticket.getTicketId());
            }
        } else {
            if (tvControlRoomSubtitle != null) {
                tvControlRoomSubtitle.setText("Online • Disaster Incident Desk");
            }
        }
    }

    private void setupSendAlertDialog() {
        View btnCloseSendAlert = findViewById(R.id.btnCloseSendAlert);
        if (btnCloseSendAlert != null) {
            btnCloseSendAlert.setOnClickListener(v -> hideSendAlertDialog());
        }

        View btnSubmit = findViewById(R.id.btnSubmitSendAlert);
        if (btnSubmit != null) {
            btnSubmit.setOnClickListener(v -> {
                ChipGroup cgCategory = findViewById(R.id.chipGroupAlertCategory);
                String category = "🔥 Active Flames";
                if (cgCategory != null) {
                    int checkedId = cgCategory.getCheckedChipId();
                    if (checkedId == R.id.chipCategorySmoke) {
                        category = "💨 Dense Smoke Plume";
                    } else if (checkedId == R.id.chipCategoryAdvancing) {
                        category = "⚠️ Approaching Front";
                    }
                }

                ChipGroup cgSeverity = findViewById(R.id.chipGroupAlertSeverity);
                String severity = "CRITICAL";
                FireRiskStatus riskStatus = FireRiskStatus.EXTREME;
                if (cgSeverity != null) {
                    int checkedId = cgSeverity.getCheckedChipId();
                    if (checkedId == R.id.chipSevHigh) {
                        severity = "HIGH";
                        riskStatus = FireRiskStatus.HIGH;
                    } else if (checkedId == R.id.chipSevWarning) {
                        severity = "WARNING";
                        riskStatus = FireRiskStatus.WARNING;
                    }
                }

                EditText etRemarks = findViewById(R.id.etAlertRemarks);
                String remarks = etRemarks != null ? etRemarks.getText().toString().trim() : "";
                if (etRemarks != null) etRemarks.setText("");

                double[] coords = getLiveCoordinates();
                double lat = coords[0];
                double lng = coords[1];
                String locName = (currentLiveAddress != null && !currentLiveAddress.isEmpty())
                        ? currentLiveAddress
                        : (hasRealLocationFix ? String.format(Locale.US, "GPS (%.4f, %.4f)", lat, lng) : repository.getCurrentLocationName());

                // Activate Alert Ticket in Control Room
                ControlRoomTicket ticket = ControlRoomManager.getInstance().activateAlertTicket(
                        category, severity, lat, lng, locName, remarks
                );

                // Add to repository alert timeline
                FireAlert newAlert = new FireAlert(
                        ticket.getTicketId(),
                        category + " Citizen Report",
                        locName,
                        riskStatus,
                        0.9,
                        new SimpleDateFormat("hh:mm a", Locale.getDefault()).format(new Date()),
                        "North-East",
                        "Spreading along ridge • Wind 18 km/h",
                        "Evacuate away from smoke toward designated safe shelter",
                        lat,
                        lng,
                        severity.equals("CRITICAL"),
                        FireAlert.TimelineBucket.ACTIVE_NOW
                );
                repository.addCustomAlert(newAlert);

                hideSendAlertDialog();
                openControlRoomScreen();
                Toast.makeText(this, "🔥 Alert Transmitted! Emergency Ticket #" + ticket.getTicketId() + " Activated", Toast.LENGTH_LONG).show();
            });
        }
    }

    private void showSendAlertDialog() {
        if (viewSendAlertDialog != null) {
            double[] coords = getLiveCoordinates();
            TextView tvGps = findViewById(R.id.tvSendAlertGps);
            if (tvGps != null) {
                tvGps.setText(String.format(Locale.US, "Live GPS: %.5f° N, %.5f° E", coords[0], coords[1]));
            }
            TextView tvLoc = findViewById(R.id.tvSendAlertLocationName);
            if (tvLoc != null) {
                tvLoc.setText("Sector: " + ((currentLiveAddress != null && !currentLiveAddress.isEmpty()) ? currentLiveAddress : repository.getCurrentLocationName()));
            }
            viewSendAlertDialog.setVisibility(View.VISIBLE);
        }
    }

    private void hideSendAlertDialog() {
        if (viewSendAlertDialog != null) {
            viewSendAlertDialog.setVisibility(View.GONE);
        }
    }

    private void closeAllOverlays() {
        stopVoiceGuidance();
        viewEvacuation.setVisibility(View.GONE);
        viewSanthiChat.setVisibility(View.GONE);
        viewShelters.setVisibility(View.GONE);
        viewPrecautions.setVisibility(View.GONE);
        if (viewControlRoom != null) viewControlRoom.setVisibility(View.GONE);
        if (viewSendAlertDialog != null) viewSendAlertDialog.setVisibility(View.GONE);
        viewSosDialog.setVisibility(View.GONE);
        showBottomNavigationImmediately();
        if (bottomNavigation != null) bottomNavigation.setVisibility(View.VISIBLE);
        if (layoutFloatingSos != null && (viewAccount == null || viewAccount.getVisibility() != View.VISIBLE)) {
            layoutFloatingSos.setVisibility(View.VISIBLE);
        }
        if (topBar != null && (viewAccount == null || viewAccount.getVisibility() != View.VISIBLE)) {
            topBar.setVisibility(View.VISIBLE);
        }
        setStatusBarAppearance(true);
        applySystemBarInsets(cachedStatusBarHeight, cachedNavigationBarHeight);
    }

    private void makePhoneCall(String phoneNumber) {
        try {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(Uri.parse("tel:" + phoneNumber));
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(this, "Dialing " + phoneNumber, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onRiskStatusChanged(FireRiskStatus newStatus, boolean isOffline) {
        // Unread bell dot indicator when active alerts exist
        FireAlert activeAlert = repository.getActiveNearbyAlert();
        if (viewUnreadBellDot != null) {
            viewUnreadBellDot.setVisibility(activeAlert != null && newStatus != FireRiskStatus.SAFE ? View.VISIBLE : View.GONE);
        }

        // Nearest shelter preview on Home
        SafeShelter nearest = repository.getNearestShelter();
        if (nearest != null && tvHomeShelterName != null && tvHomeShelterDistTime != null) {
            tvHomeShelterName.setText(nearest.getName());
            tvHomeShelterDistTime.setText(String.format(Locale.US, "%.1f km • approx %d mins • 📍 Lat: %.4f° N, Lng: %.4f° E",
                    nearest.getDistanceKm(), nearest.getTravelTimeMinutes(), nearest.getLatitude(), nearest.getLongitude()));
        }

        // Update full interactive map
        if (fullInteractiveMapView != null) {
            fullInteractiveMapView.updateMapFromRepository();
        }
        refreshTopPriorityAlertCard();
        refreshMapRiskSummaryCard();
        refreshNotificationsList();
    }

    private boolean isDeviceOnline() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            Network network = cm.getActiveNetwork();
            if (network == null) return false;
            NetworkCapabilities cap = cm.getNetworkCapabilities(network);
            return cap != null && (
                    cap.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                    cap.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                    cap.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ||
                    cap.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET));
        } catch (Exception e) {
            Log.w("MainActivity", "Failed to check device connectivity", e);
            return true;
        }
    }

    private void updateRealNetworkStatus(boolean isOnline) {
        repository.setOffline(!isOnline);
        if (tvTopConnectionBadge != null) {
            tvTopConnectionBadge.setText(isOnline ? "ONLINE" : "NO INTERNET");
            tvTopConnectionBadge.setTextColor(ContextCompat.getColor(this, isOnline ? R.color.safe : R.color.warning));
            tvTopConnectionBadge.setBackgroundResource(isOnline ? R.drawable.bg_badge_safe : R.drawable.bg_badge_warning);
        }
        if (cardOfflineBanner != null) {
            // ONLY show the banner if network connection is REALLY lost!
            cardOfflineBanner.setVisibility(isOnline ? View.GONE : View.VISIBLE);
        }
        if (tvChatStatusBadge != null) {
            tvChatStatusBadge.setText(isOnline ? "Online" : "Offline Playbook");
            tvChatStatusBadge.setTextColor(ContextCompat.getColor(this, isOnline ? R.color.safe : R.color.warning));
        }
    }

    private void setupNetworkMonitoring() {
        updateRealNetworkStatus(isDeviceOnline());

        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) {
                NetworkRequest request = new NetworkRequest.Builder()
                        .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                        .build();

                networkCallback = new ConnectivityManager.NetworkCallback() {
                    @Override
                    public void onAvailable(Network network) {
                        runOnUiThread(() -> updateRealNetworkStatus(true));
                    }

                    @Override
                    public void onLost(Network network) {
                        runOnUiThread(() -> updateRealNetworkStatus(isDeviceOnline()));
                    }
                };

                cm.registerNetworkCallback(request, networkCallback);
            }
        } catch (Exception e) {
            Log.e("MainActivity", "Unable to register network callback", e);
        }
    }

    private final Handler wildfirePollingHandler = new Handler(Looper.getMainLooper());
    private final Runnable wildfirePollingRunnable = new Runnable() {
        @Override
        public void run() {
            pollFirebaseWildfireData();
            wildfirePollingHandler.postDelayed(this, 5000);
        }
    };

    private void pollFirebaseWildfireData() {
        FireSafeApiClient.getInstance().fetchWildfireData(new FireSafeApiClient.WildfireDataCallback() {
            @Override
            public void onReceived(com.diplomates.firesafe.data.model.WildfireData data, boolean isFromFirebase) {
                repository.syncWithWildfireData(data);
                runOnUiThread(() -> {
                    refreshTopPriorityAlertCard();
                    refreshMapRiskSummaryCard();
                    if (alertsAdapter != null) alertsAdapter.notifyDataSetChanged();
                    if (fullInteractiveMapView != null) fullInteractiveMapView.updateMapFromRepository();
                    if (evacMapView != null) evacMapView.updateMapFromRepository();
                });
            }

            @Override
            public void onError(String error) {
                // Keep current state
            }
        });
    }

    private void setupRealtimeApiSync() {
        updateRealNetworkStatus(isDeviceOnline());
        pollFirebaseWildfireData();
        FireSafeApiClient.getInstance().fetchLocationRisk(
                repository.getCurrentLocationName(),
                repository.getCurrentLatitude(),
                repository.getCurrentLongitude(),
                new FireSafeApiClient.LocationRiskCallback() {
                    @Override
                    public void onSuccess(FireSafeApiClient.LocationRiskResult result) {
                        repository.syncWithApi(result);
                        updateRealNetworkStatus(isDeviceOnline());
                        tvTopLocation.setText(result.locationName);
                        pollFirebaseWildfireData();
                    }

                    @Override
                    public void onError(String error, FireSafeApiClient.LocationRiskResult fallback) {
                        repository.syncWithApi(fallback);
                        updateRealNetworkStatus(isDeviceOnline());
                        pollFirebaseWildfireData();
                    }
                }
        );
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == RC_LOCATION_PERMISSION) {
            boolean granted = false;
            for (int res : grantResults) {
                if (res == PackageManager.PERMISSION_GRANTED) {
                    granted = true;
                    break;
                }
            }
            if (granted) {
                Toast.makeText(this, "Live GPS active — tracking real-time position", Toast.LENGTH_SHORT).show();
                startActiveLocationUpdates();
            } else {
                Toast.makeText(this, "Location permission denied — cannot acquire live GPS", Toast.LENGTH_LONG).show();
                tvTopLocation.setText("GPS Disabled (Tap to set)");
                tvTopUpdated.setText("Manual mode");
            }
        } else if (requestCode == 102) {
            boolean locGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            if (locGranted) {
                startActiveLocationUpdates();
                double[] fresh = getLiveCoordinates();
                if (currentActiveSosEvent != null) {
                    currentActiveSosEvent.setLatitude(fresh[0]);
                    currentActiveSosEvent.setLongitude(fresh[1]);
                    String addr = currentLiveAddress != null ? currentLiveAddress : repository.getCurrentLocationName();
                    tvSosCoordinates.setText(String.format(Locale.US, "%.5f° N, %.5f° E (%s)", fresh[0], fresh[1], addr));
                    if (currentSosPushKey != null && !currentSosPushKey.isEmpty()) {
                        FireSafeApiClient.getInstance().updateSosLocation(currentSosPushKey, fresh[0], fresh[1], addr, null);
                    }
                }
            }

            boolean audioGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
            if (viewSosDialog != null && viewSosDialog.getVisibility() == View.VISIBLE) {
                if (audioGranted && (sosAudioRecorder == null || !sosAudioRecorder.isRecording())) {
                    double[] coords = getLiveCoordinates();
                    String locName = currentLiveAddress != null ? currentLiveAddress : repository.getCurrentLocationName();
                    startSosDistressAudioRecording(coords[0], coords[1], locName);
                }
            }

            boolean smsGranted = ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED;
            if (smsGranted) {
                double[] coords = getLiveCoordinates();
                String locName = (currentLiveAddress != null && !currentLiveAddress.isEmpty()) ? currentLiveAddress : "GPS";
                dispatchEmergencySmsToContacts(coords[0], coords[1], locName, null);
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (locationManager != null && liveLocationListener != null) {
            try {
                locationManager.removeUpdates(liveLocationListener);
            } catch (Exception ignored) {}
        }
        repository.removeListener(this);
        sosHandler.removeCallbacksAndMessages(null);
        wildfirePollingHandler.removeCallbacksAndMessages(null);
        if (sosAudioRecorder != null && sosAudioRecorder.isRecording()) {
            sosAudioRecorder.cancelRecording();
        }
        if (networkCallback != null) {
            try {
                ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
                if (cm != null) {
                    cm.unregisterNetworkCallback(networkCallback);
                }
            } catch (Exception ignored) {}
        }
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
            } catch (Exception ignored) {}
        }
    }
}