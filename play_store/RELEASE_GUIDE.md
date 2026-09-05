# 🚀 Google Play Store Release & Publishing Guide
## எடப்பாடி கடை செயலியை கூகுள் ப்ளே ஸ்டோரில் வெளியிடுவதற்கான முழு வழிகாட்டி

This comprehensive guide details everything needed to successfully launch **Edappadi Kadai** on the Google Play Store.

---

### 📋 Phase 1: Pre-requisites (முன் தேவைகள்)

1. **Google Play Developer Account:**
   - Go to [Google Play Console](https://play.google.com/console/signup)
   - Pay the one-time $25 registration fee.
   - Complete developer identity verification.

2. **Store Listing Assets:**
   - **App Icon:** 512 x 512 px (PNG, up to 1 MB)
   - **Feature Graphic:** 1024 x 500 px (PNG/JPG, up to 15 MB)
   - **Phone Screenshots:** At least 2-4 screenshots (minimum 1080x1920 or standard phone resolution)
   - *Tip: Open `play_store/generate_store_assets.html` in your browser to instantly generate and download the 512x512 icon and 1024x500 banner with one click!*

3. **Public Privacy Policy URL:**
   - Google requires a live URL. You can host `app/src/main/assets/privacy_policy.html` on GitHub Pages, Firebase Hosting, or your store domain:
     - Example: `https://<your-username>.github.io/edappadi-kadai/privacy_policy.html`

---

### 🛠️ Phase 2: Building the Release App Bundle (.aab)

Google Play Store requires an **Android App Bundle (.aab)** signed with a release upload key.

1. **Run the automated build script:**
   ```bash
   ./play_store/build_play_store_bundle.sh
   ```
   - This script will:
     - Automatically create `my-upload-key.jks` if you don't already have one.
     - Compile and bundle the app via Gradle: `:app:bundleRelease`
     - Optimize code using ProGuard/R8.
     - Output the final ready-to-upload bundle file at:
       `app/build/outputs/bundle/release/app-release.aab`

2. **Alternative manual Gradle command:**
   ```bash
   STORE_PASSWORD=your_password KEY_PASSWORD=your_password gradle :app:bundleRelease
   ```

---

### 🌐 Phase 3: Setting Up the App in Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create App**:
   - **App Name:** `Edappadi Kadai` (or `Edappadi`)
   - **Default Language:** English (United States) or English (India)
   - **App or Game:** App
   - **Free or Paid:** Free
   - Accept the Developer Program Policies and US Export Laws.

3. **Set up Store Listing (Main Store Listing):**
   - Copy-paste the **Short Description** and **Full Description** from `play_store/PLAY_STORE_METADATA.md`.
   - Upload the **512x512 App Icon**.
   - Upload the **1024x500 Feature Graphic**.
   - Upload 4-8 phone screenshots taken from the app emulator.

4. **Complete "App Content" Declarations:**
   - **Privacy Policy:** Enter your live Privacy Policy URL.
   - **App Access:** Select "All functionality is available without restrictions" (or provide demo test phone/email).
   - **Ads:** Select "No, my app does not contain ads".
   - **Content Rating:** Fill out the questionnaire (Rating will be Everyone / 3+).
   - **Target Audience:** Select 18 and over (or 13+).
   - **News Apps:** Select "No".
   - **COVID-19 Contact Tracing:** Select "No".
   - **Data Safety:** Fill out using the exact answers in `play_store/DATA_SAFETY_GUIDE.md`.
   - **Government Apps:** Select "No".
   - **Financial Features:** Select "My app doesn't provide any financial features".

---

### 🚀 Phase 4: Uploading the Bundle & Release Tracks

1. Go to **Release > Production** (or **Testing > Closed Testing**).
2. Click **Create new release**.
3. Under **App bundles**, click **Upload** and select:
   `app/build/outputs/bundle/release/app-release.aab`
4. **Release Name:** `8.0.0 (Version Code 8)`
5. **Release Notes:**
   ```text
   • எடப்பாடி கடை புதிய பதிப்பு!
   • அதிவேக பிரஷ் இறைச்சி, நாட்டுக்கோழி, மீன் & காய்கறி டோர் டெலிவரி.
   • லைவ் ஆர்டர் டிராக்கிங் & மேம்படுத்தப்பட்ட வாடிக்கையாளர் வசதிகள்.
   ```
6. Click **Next**, review summary, and click **Save**.
7. Submit for Google Review! (Google usually reviews and approves within 1 to 3 business days).
