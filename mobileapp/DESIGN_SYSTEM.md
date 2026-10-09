# FireSafe Citizen Android Application - Phase 1

**Version**: 1.0 (Phase 1: UI/UX Design System + Main Dashboard)  
**Package**: `com.diplomates.firesafe`  
**Target SDK**: 37 (Android 15 / 16 Ready, Min SDK 24)  
**Style Benchmark**: Uber-level minimalist clarity + High-reliability emergency response  

---

## 1. Product Overview & Citizen Journey
When a citizen opens the **FireSafe** app in a crisis, they immediately get clear answers to the 6 critical life-safety questions within 2 seconds:
1. **Where am I?** → Top location bar (`Pune, Maharashtra`, "Updated just now", high-accuracy GPS dot on map).
2. **Am I safe?** → Instant **Dynamic Safety Status Card** (Green: `YOU ARE CURRENTLY SAFE` vs Amber: `FIRE WATCH` vs Orange: `HIGH RISK` vs Pulsing Red: `EVACUATE NOW`).
3. **Is there an active fire near me?** → Active Fire Alert Card (4.2 km away, direction, spread rate, detected time) + Live Map canvas.
4. **What should I do?** → Recommended immediate action + Turn-by-turn safe instructions + Wildfire Precautions Guide.
5. **Where is the safest place to go?** → Nearest verified open safe shelter (`Shivaji Community Safe Hall`, 2.4 km, 8 min) + Safe Route avoiding danger zones.
6. **How can I call for emergency help?** → Prominent floating **3-second hold SOS button** with real-time transmission feedback & 1-tap call to **112 / 101**.

---

## 2. Design System & Tokens

### Color Palette
- **Monochrome Base**:
  - Primary: `#111111`
  - Background: `#F7F7F7`
  - Surface: `#FFFFFF`
  - Surface Variant: `#F2F2F2`
  - Border / Divider: `#E5E5E5`
  - Secondary Text: `#6B6B6B`
  - Tertiary Text: `#9E9E9E`
- **Emergency Severity Tokens** (Strictly functional):
  - **Extreme / Danger**: `#E53935` (Used **ONLY** for active danger / emergency / SOS)
  - **High Danger**: `#FF6D00` (Used for nearby fire risk)
  - **Warning / Moderate**: `#FFB300` (Used for elevated risk / offline warning)
  - **Safe**: `#20A464` (Used **ONLY** for safe states / verified open shelters / safe routes)

### Typography Hierarchy (Inter / Modern Sans-Serif)
- **Page Heading**: 32sp, bold / black
- **Section Heading**: 21sp, semibold
- **Card Heading**: 17sp, semibold
- **Body Text**: 15sp regular / medium
- **Secondary Body**: 14sp
- **Metadata**: 13sp
- **Caption**: 12sp
- **CTA Buttons**: 16sp, semibold

### Layout & Sizing
- **Card Corner Radius**: 18–22dp (generous, modern curved surfaces)
- **Pill Radius**: 999dp (badges and filter chips)
- **Minimum Touch Targets**: 48dp+ (designed for stressed, shaking hands)
- **Primary Action Buttons**: 56dp height with high contrast
- **Elevation**: Subtle 2dp shadows with 1dp crisp borders

---

## 3. Architecture & Code Structure

```
mobileapp/app/src/main/
├── AndroidManifest.xml
├── java/com/diplomates/firesafe/
│   ├── MainActivity.java                # Orchestrates tabs, overlays, simulation strip, back stack
│   ├── data/
│   │   ├── model/
│   │   │   ├── FireRiskStatus.java      # SAFE, WARNING, HIGH, EXTREME enum with colors & badges
│   │   │   ├── FireAlert.java           # Alert payload with metrics & timeline buckets
│   │   │   ├── SafeShelter.java         # Verified shelters with capacity, distance, amenities
│   │   │   ├── ChatMessage.java         # Chat model supporting suggestion chips & formatting
│   │   │   ├── SosEvent.java            # Multi-stage SOS transmission state model
│   │   │   ├── EvacuationStep.java      # Turn-by-turn guidance model with hazard flags
│   │   │   └── PrecautionItem.java      # Wildfire preparedness & response guide
│   │   └── repository/
│   │       └── FireSafeRepository.java  # Central reactive data layer with live listeners & demo simulator
│   ├── ui/
│   │   ├── custom/
│   │   │   ├── SosHoldButton.java       # Custom 3s hold-to-activate circular SOS button with haptics
│   │   │   └── InteractiveFireMapView.java # Custom high-performance vector Canvas map view
│   │   └── adapters/
│   │       ├── AlertsAdapter.java       # Chronological timeline alerts adapter
│   │       ├── SheltersAdapter.java     # Safe shelters directory adapter
│   │       ├── ChatAdapter.java         # SANthi AI chat conversation adapter
│   │       └── EvacuationStepsAdapter.java # Turn-by-turn safe navigation adapter
└── res/
    ├── drawable/                        # 25+ clean vector drawables & shape badges
    ├── layout/
    │   ├── activity_main.xml            # Top bar, simulation strip, container, floating SOS, bottom nav
    │   ├── layout_home.xml              # Main Home Dashboard
    │   ├── layout_map.xml               # Full-screen interactive Map screen with layer toggles
    │   ├── layout_alerts.xml            # Categorized alerts timeline
    │   ├── layout_account.xml           # Citizen profile, "I'm Safe" broadcast, emergency contacts
    │   ├── layout_evacuation.xml        # Dedicated Safe Evacuation Navigation screen
    │   ├── layout_santhi_chat.xml       # SANthi AI chatbot interface
    │   ├── layout_shelters_directory.xml# Safe shelters directory list
    │   ├── layout_precautions.xml       # Wildfire precautions guidebook
    │   ├── layout_sos_dialog.xml        # Emergency distress transmission modal
    │   ├── item_alert_card.xml
    │   ├── item_shelter_card.xml
    │   ├── item_chat_message.xml
    │   └── item_evacuation_step.xml
    ├── menu/
    │   └── bottom_nav_menu.xml          # Home, Map, Alerts, Account
    └── values/
        ├── colors.xml                   # Complete design system color tokens
        ├── dimens.xml                   # Spacing, typography, and corner radius tokens
        ├── strings.xml                  # Localized copy, emergency notices, and action labels
        └── themes.xml                   # Material 3 styling tokens
```

---

## 4. Key Citizen Screens & Features

### 1. Main Home Dashboard
- **Location & Sync**: Shows current location with "Updated just now" and online/offline status.
- **Demo State Selector**: Built-in horizontal chip strip (`[SAFE]`, `[WARNING]`, `[HIGH]`, `[EXTREME]`, `[OFFLINE]`) for instant evaluator preview of all dynamic UI behaviors.
- **Dynamic Safety Status Card**:
  - Safe: Green shield, "YOU ARE CURRENTLY SAFE", "No active threat detected near your location".
  - High: Orange flame, "FIRE RISK: HIGH", "An active fire has been detected 4.2 km away."
  - Extreme: Red pulsing card, "EVACUATE NOW", "Active wildfire detected near your location.", prominent "START EVACUATION" CTA.
- **Active Fire Alert Card**: Distance, detection time, wind/direction, spread rate, recommended action, "View Safe Evacuation Route" button.
- **Map Preview**: Live vector canvas showing user location, fire hotspot, risk polygons, safe zone, and safe route.
- **Quick Action Grid**: 4 large scannable cards (Safe Shelters, Precautions, Offline Map, SANthi AI).
- **Nearest Safe Shelter**: Shivaji Community Safe Hall (2.4 km, 8 min, verified open).

### 2. Floating 3-Second Hold SOS
- Large red circular button with white SOS typography.
- Press-and-hold interaction requiring **3 seconds continuous hold** to prevent accidental pocket dials.
- Circular progress animation ring and haptic vibration feedback on completion.
- Multi-stage transmission dialog showing GPS coordinates, timestamp, battery level (84%), and fallback states (Sending → Sent via AI Gateway → SMS fallback).

### 3. Full-Screen Interactive Live Fire Map
- Panning and pinch-to-zoom vector canvas.
- Layer toggles: Hotspots, Risk Polygons, Safe Shelters, Safe Route.
- Recenter GPS button.
- Floating bottom risk summary sheet with direct "Evacuate Safely" trigger.

### 4. Dedicated Safe Evacuation Screen
- Route stats: Origin to Shivaji Community Safe Hall (2.4 km, 8 mins).
- Canvas map showing danger zones and **green route avoiding fire risk** (not just shortest path).
- Voice guidance toggle (`Voice: ON / OFF`).
- Precaution banner: *"Stay away from smoke and active fire zones. Keep windows closed."*
- Turn-by-turn guidance list with hazard avoidance callouts.

### 5. SANthi AI Safety Chatbot
- Emergency assistant interface with conversation history.
- Quick suggestion chips:
  - "What should I do now?"
  - "Is my area safe?"
  - "Where is the nearest shelter?"
  - "How do I evacuate?"
  - "What should I carry?"
  - "What should I do if I have no internet?"
- Offline safety playbook response generation.

### 6. Account & Family "I'm Safe" Check-In
- Citizen medical ID (Blood group, inhaler usage notes).
- **1-Tap "I'm Safe" Check-in**: Broadcasts instant SMS with GPS coordinates and battery level to registered contacts.
- Quick dial buttons for family, Fire Brigade 101, and National Emergency 112.
- Offline maps cache manager (45 MB local pack).

---

## 5. Verification & Build
The mobile application compiles successfully with Gradle:
```bash
./gradlew.bat assembleDebug
```
Output APK generated: `mobileapp/app/build/outputs/apk/debug/app-debug.apk` (7.08 MB).
