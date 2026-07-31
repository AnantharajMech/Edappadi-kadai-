import sys

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add Email Field to Profile Form HTML
target_phone = 'id="prof-edit-phone" class="form-control" placeholder="Enter mobile number"'
pos_phone = text.find(target_phone)
if pos_phone != -1:
    pos_end_div = text.find("</div>", pos_phone)
    if pos_end_div != -1:
        email_field_html = '''
        <!-- Field 2b: Email Address -->
        <div class="form-group" style="margin-bottom: 0; display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 12.5px; font-weight: 600; color: #9ca3af; font-family: 'Poppins', sans-serif;">Email Address</label>
          <div style="display: flex; gap: 8px;">
            <input type="email" id="prof-edit-email" class="form-control" placeholder="Enter email address" style="font-size: 14px; height: 46px; padding: 0 16px; background: rgba(255, 255, 255, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 12px; color: #ffffff; width: 100%; box-sizing: border-box; outline: none;" readonly />
            <button type="button" onclick="openChangeEmailModal()" style="padding: 0 14px; height: 46px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; color: var(--accent-orange); font-size: 12px; font-weight: 700; white-space: nowrap; cursor: pointer;">✉️ Change</button>
          </div>
        </div>'''
        text = text[:pos_end_div+6] + email_field_html + text[pos_end_div+6:]
        print("Successfully added Email field to Profile Form.")

# 2. Inject Change Email Modal HTML before </body>
if "id=\"change-email-modal\"" not in text:
    change_email_modal_html = '''
    <!-- CHANGE EMAIL MODAL -->
    <div id="change-email-modal" class="modal-backdrop" onclick="hideChangeEmailModal()" style="align-items: center; padding: 20px; display: none; z-index: 10005;">
      <div style="background: #111111; color: #ffffff; border: 1.5px solid var(--border-color); border-radius: 28px; width: 100%; max-width: 400px; padding: 24px; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.85); display: flex; flex-direction: column;" onclick="event.stopPropagation()">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--accent-orange); margin: 0;">✉️ Change Email Address</h3>
          <button onclick="hideChangeEmailModal()" style="background: #222222; color: #ffffff; width: 32px; height: 32px; border-radius: 50%; border: none; font-size: 18px; cursor: pointer;">×</button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Re-authenticate with your current password to update your registered email securely.</p>
        <div class="form-group" style="margin-bottom: 12px;">
          <label style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Current Password</label>
          <input type="password" id="ce-current-password" class="form-control" placeholder="Enter current password" style="margin-top: 4px; padding: 10px; font-size: 13px;">
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">New Email Address</label>
          <input type="email" id="ce-new-email" class="form-control" placeholder="Enter new email address" style="margin-top: 4px; padding: 10px; font-size: 13px;">
        </div>
        <button class="btn btn-primary" onclick="submitChangeEmail()" style="padding: 14px; width: 100%; font-weight: 700;">Update Email</button>
      </div>
    </div>
'''
    if "</body>" in text:
        text = text.replace("</body>", change_email_modal_html + "\n</body>", 1)
        print("Injected Change Email Modal HTML.")

# 3. Add JS functions for Change Email
if "function openChangeEmailModal()" not in text:
    js_functions = '''
function openChangeEmailModal() {
  const pEmail = document.getElementById('ce-current-password');
  const nEmail = document.getElementById('ce-new-email');
  if (pEmail) pEmail.value = '';
  if (nEmail) nEmail.value = '';
  const modal = document.getElementById('change-email-modal');
  if (modal) modal.style.display = 'flex';
}
function hideChangeEmailModal() {
  const modal = document.getElementById('change-email-modal');
  if (modal) modal.style.display = 'none';
}
async function submitChangeEmail() {
  const currentPass = document.getElementById('ce-current-password') ? document.getElementById('ce-current-password').value : '';
  const newEmail = document.getElementById('ce-new-email') ? document.getElementById('ce-new-email').value.trim().toLowerCase() : '';
  const isTa = currentLang === 'ta';
  
  if (!currentPass) {
    showToast(isTa ? "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்." : "Please enter your current password.", "error");
    return;
  }
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    showToast(isTa ? "செல்லுபடியாகும் புதிய மின்னஞ்சலை உள்ளிடவும்." : "Please enter a valid new email address.", "error");
    return;
  }
  
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      showToast(isTa ? "உள்நுழையவில்லை." : "User not logged in.", "error");
      return;
    }
    
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPass);
    await user.reauthenticateWithCredential(cred);
    
    if (typeof user.verifyBeforeUpdateEmail === 'function') {
      await user.verifyBeforeUpdateEmail(newEmail);
      showToast(isTa ? "புதிய மின்னஞ்சலுக்கு சரிபார்ப்பு இணைப்பு அனுப்பப்பட்டது! 📩" : "Verification link sent to your new email! 📩", "success");
    } else {
      await user.updateEmail(newEmail);
      showToast(isTa ? "மின்னஞ்சல் வெற்றிகரமாக மாற்றப்பட்டது! ✓" : "Email updated successfully! ✓", "success");
    }
    
    if (typeof db !== 'undefined' && db && user.uid) {
      await db.collection('ek_users').doc(user.uid).update({
        email: newEmail,
        updatedAt: new Date().toISOString()
      }).catch(e => console.warn("Firestore email update sync warning:", e));
    }
    
    const activeSession = getActiveSession();
    if (activeSession) {
      activeSession.email = newEmail;
      saveData('ek_customer_session', activeSession);
    }
    const profEditEmail = document.getElementById('prof-edit-email');
    if (profEditEmail) profEditEmail.value = newEmail;
    
    hideChangeEmailModal();
  } catch (err) {
    console.error("submitChangeEmail error:", err);
    showToast(isTa ? "மின்னஞ்சல் மாற்ற தோல்வி: " + err.message : "Failed to change email: " + err.message, "error");
  }
}
'''
    text = text.replace("function saveProfileChanges() {", js_functions + "\nfunction saveProfileChanges() {", 1)
    print("Injected Change Email JS functions.")

# 4. Populate prof-edit-email inside renderProfileScreen
if "const profEditEmail =" not in text:
    render_profile_target = "if (profEditPhone) profEditPhone.value = user.phone || '';"
    render_profile_replacement = "if (profEditPhone) profEditPhone.value = user.phone || '';\n      const profEditEmail = document.getElementById('prof-edit-email');\n      if (profEditEmail) profEditEmail.value = user.email || (firebase.auth().currentUser ? firebase.auth().currentUser.email : '');"
    text = text.replace(render_profile_target, render_profile_replacement, 1)
    print("Updated renderProfileScreen to populate prof-edit-email.")

# 5. Update sendForgotPasswordOtp to use firebase.auth().sendPasswordResetEmail
pos_fp = text.find("async function sendForgotPasswordOtp()")
if pos_fp != -1:
    pos_next = text.find("async function verifyOtpAndResetPassword()", pos_fp)
    if pos_next != -1:
        new_send_fp_otp = '''async function sendForgotPasswordOtp() {
  const emailVal = document.getElementById('fp-email-input').value.trim().toLowerCase();
  const isTa = currentLang === 'ta';
  if (!emailVal) {
    showToast(
      isTa ? "தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்." : "Please enter your registered email address.",
      "error"
    );
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailVal)) {
    showToast(
      isTa ? "செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்." : "Please enter a valid email address.",
      "error"
    );
    return;
  }
  
  const stage1 = document.getElementById('fp-stage-1'); if (stage1) stage1.style.display = 'none';
  const stageLoading = document.getElementById('fp-stage-loading'); if (stageLoading) stageLoading.style.display = 'block';
  
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().sendPasswordResetEmail(emailVal);
      if (stageLoading) stageLoading.style.display = 'none';
      
      const stageLink = document.getElementById('fp-stage-link');
      if (stageLink) {
        stageLink.style.display = 'block';
      } else {
        hideForgotPasswordModal();
      }
      
      showToast(
        isTa ? "கடவுச்சொல் மீட்டமைப்பு மின்னஞ்சல் அனுப்பப்பட்டது! உங்கள் மின்னஞ்சலை சரிபார்க்கவும். ✉️"
             : "Password reset email sent! Please check your inbox or spam folder. ✉️",
        "success"
      );
    } else {
      throw new Error("Firebase Auth service unavailable.");
    }
  } catch (err) {
    console.error("Password reset error:", err);
    if (stageLoading) stageLoading.style.display = 'none';
    if (stage1) stage1.style.display = 'block';
    showToast(isTa ? "பிழை: " + err.message : "Failed to send reset email: " + err.message, "error");
  }
}

'''
        text = text[:pos_fp] + new_send_fp_otp + text[pos_next:]
        print("Updated sendForgotPasswordOtp function.")

with open("app/src/main/assets/index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Applied clean fixes successfully!")
