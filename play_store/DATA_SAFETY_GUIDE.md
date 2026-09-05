# 🛡️ Google Play Console - Data Safety Form Answers
## எடப்பாடி கடை (Edappadi Kadai) - கூகுள் ப்ளே ஸ்டோர் டேட்டா பாதுகாப்பு படிவம்

Google Play Console requires developers to declare data collection, sharing, and security practices.
Fill out the **App Content > Data Safety** section using the exact answers provided below:

---

### Question 1: Data Collection & Security
- **Does your app collect or share any of the required user data types?**  
  👉 **Yes**
- **Is all of the user data collected by your app encrypted in transit?**  
  👉 **Yes** (All requests use HTTPS/TLS encrypted network traffic).
- **Do you provide a way for users to request that their data be deleted?**  
  👉 **Yes** (Users can delete their account directly via the in-app Delete Account option or by contacting admin support).

---

### Question 2: Location (இருப்பிடம்)
1. **Approximate location (Network-based):**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Ephemeral?** 👉 No (Stored with delivery order)
   - **Required or Optional?** 👉 Required for order delivery
   - **Purpose:** 👉 App functionality (Delivery route & calculating delivery charges to customer home)

2. **Precise location (GPS-based):**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Ephemeral?** 👉 No
   - **Required or Optional?** 👉 Optional (User can also type address manually)
   - **Purpose:** 👉 App functionality (Accurate pinpoint delivery in rural villages)

---

### Question 3: Personal Info (தனிநபர் விவரங்கள்)
1. **Name:**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Purpose:** 👉 App functionality, Account management, Personalization

2. **Email address:**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Purpose:** 👉 App functionality, Account management (Authentication & Password reset)

3. **Phone number:**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Purpose:** 👉 App functionality, Account management, Order status SMS/WhatsApp communication

4. **Address:**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Purpose:** 👉 App functionality (Order delivery fulfillment)

---

### Question 4: Financial Info (பரிவர்த்தனை விவரங்கள்)
1. **Purchase history:**
   - **Collected?** 👉 Yes (List of items ordered, order amounts)
   - **Shared?** 👉 No
   - **Purpose:** 👉 App functionality (Displaying order history, invoice receipts)
   - *Note: Payment card details, UPI PINs, or bank passwords are NOT collected or stored by the app. UPI apps handle payments externally.*

---

### Question 5: Device or Other IDs (சாதன விவரங்கள்)
1. **Device or other IDs (Firebase FCM Notification Token):**
   - **Collected?** 👉 Yes
   - **Shared?** 👉 No
   - **Purpose:** 👉 App functionality (Sending push notifications about order status, delivery dispatch, and store offers)

---

### Question 6: Target Audience & Content
- **Target Age:** 👉 18 and over (or 13+)
- **News App:** 👉 No
- **COVID-19 Contact Tracing:** 👉 No
- **Government App:** 👉 No
- **Financial Features:** 👉 None (Pure e-commerce shopping)
- **Ads:** 👉 No (The app does not contain third-party ads)
