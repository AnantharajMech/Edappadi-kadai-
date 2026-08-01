
// Safe window fallbacks for cross-module or async functions
window.checkAndUpdateFreshCloudData = window.checkAndUpdateFreshCloudData || function() {};
window.syncWithCloud = window.syncWithCloud || async function() {};
window.triggerGlobalScreenRefresh = window.triggerGlobalScreenRefresh || function() {};
window.triggerGlobalScreenRefreshActual = window.triggerGlobalScreenRefreshActual || function() {};
window.setupCloudRealtimeListeners2 = window.setupCloudRealtimeListeners2 || function() {};
window.renderAdminUpiSettings = window.renderAdminUpiSettings || function() {};
window.initApp = window.initApp || function() {};
window.runAbsoluteCleanupForThreeProducts = window.runAbsoluteCleanupForThreeProducts || function() {};
window.attachInfiniteScrollListener = window.attachInfiniteScrollListener || function() {};
window.migrateBase64ImagesToStorage = window.migrateBase64ImagesToStorage || function() {};
window.runTimeScheduler = window.runTimeScheduler || function() {};

    /* jshint esversion: 8 */
    const DEBUG_MODE = false;
    function debugLog(...args) {
      if (DEBUG_MODE) console.log(...args);
    }
    function scrollToCenterHorizontal(element, container) {
      if (!element) return;
      const targetContainer = container || element.parentElement;
      if (!targetContainer) return;
      try {
        const elementOffsetLeft = element.offsetLeft;
        const elementWidth = element.offsetWidth;
        const containerWidth = targetContainer.clientWidth;
        const targetScrollLeft = elementOffsetLeft - (containerWidth / 2) + (elementWidth / 2);
        targetContainer.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      } catch (e) {
        console.error("scrollToCenterHorizontal error:", e);
      }
    }
     window.onerror = function(msg, url, line, col, error) {
      console.error("Global Error Intercepted:", msg, "at line:", line, "col:", col);
      try {
        const diagContainer = document.getElementById('splash-diagnostics');
        const diagText = document.getElementById('splash-diagnostics-text');
        if (diagContainer && diagText) {
          diagContainer.style.display = 'block';
          diagText.innerText = "Error: " + msg + "\nLine: " + line + ":" + col + "\nFile: " + (url || "").split('/').pop();
        }
      } catch (ex) {}
      try {
        let globalErrDiv = document.getElementById('global-runtime-error-toast');
        if (!globalErrDiv) {
          globalErrDiv = document.createElement('div');
          globalErrDiv.id = 'global-runtime-error-toast';
          globalErrDiv.style.cssText = "position:fixed; bottom:80px; left:20px; right:20px; background:rgba(220,38,38,0.95); border:1.5px solid #ef4444; color:#ffffff; padding:16px; border-radius:12px; font-family:'JetBrains Mono',monospace; font-size:12px; z-index:999999; box-shadow:0 10px 25px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:6px;";
          document.body.appendChild(globalErrDiv);
        }
        globalErrDiv.innerHTML = `
          <div style="font-weight:bold; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
            <span>⚠️ Runtime Exception:</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#ffffff; font-size:16px; cursor:pointer; font-weight:bold; line-height:1;">&times;</button>
          </div>
          <div style="white-space:pre-wrap; word-break:break-all;">Error: ${msg}\nLine: ${line}:${col}\nFile: ${(url || "").split('/').pop()}</div>
        `;
      } catch (errVisual) {}
      try {
        const splash = document.getElementById('screen-splash');
        if (splash && splash.classList.contains('active')) {
          console.warn("Recovering from exception by forcing home navigation...");
          splash.classList.remove('active');
          const home = document.getElementById('screen-home');
          if (home) {
            home.classList.add('active');
            currentScreen = 'screen-home';
            try { renderHomeScreen(); } catch(e) {}
          }
          const bottomNav = document.getElementById('app-bottom-nav');
          if (bottomNav) bottomNav.style.display = 'flex';
        }
      } catch (inner) {}
      return false;
    };

    window.onunhandledrejection = function(event) {
      console.error("Unhandled promise rejection:", event.reason);
      const reasonMsg = event.reason ? event.reason.message || String(event.reason) : "Empty rejection error";
      try {
        const diagContainer = document.getElementById('splash-diagnostics');
        const diagText = document.getElementById('splash-diagnostics-text');
        if (diagContainer && diagText) {
          diagText.innerText = "Unhandled Rejection: " + reasonMsg;
        }
      } catch (ex) {}

      try {
        const splash = document.getElementById('screen-splash');
        if (splash && splash.classList.contains('active')) {
          splash.classList.remove('active');
          const home = document.getElementById('screen-home');
          if (home) {
            home.classList.add('active');
            currentScreen = 'screen-home';
            try { renderHomeScreen(); } catch(e) {}
          }
          const bottomNav = document.getElementById('app-bottom-nav');
          if (bottomNav) bottomNav.style.display = 'flex';
        }
      } catch (inner) {}
    };

    window.escapeHtml = function(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[&<>"']/g, function(c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    };

    const firebaseConfig = {
      apiKey: "AIzaSyDtlKng15Cyixb6HJx-mToBXHVVy28SXSA",
      authDomain: "edappadi-kadai.firebaseapp.com",
      projectId: "edappadi-kadai",
      storageBucket: "edappadi-kadai.firebasestorage.app",
      messagingSenderId: "397565375990",
      appId: "1:397565375990:web:aa687e98bdfdf5dece83d7",
      measurementId: "G-Q0CL1WC8E8"
    };

    function sanitizeDataSecure(data) {
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          return data.map(item => sanitizeDataSecure(item));
        }
        const copy = { ...data };
        delete copy.password;
        for (const k in copy) {
          if (typeof copy[k] === 'object' && copy[k] !== null) {
            copy[k] = sanitizeDataSecure(copy[k]);
          }
        }
        return copy;
      }
      return data;
    }

    try {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (typeof value === 'string' && value.includes('"password"')) {
          try {
            const parsed = JSON.parse(value);
            value = JSON.stringify(sanitizeDataSecure(parsed));
          } catch (e) {}
        }
        return originalSetItem.call(this, key, value);
      };

      const originalSessionSetItem = sessionStorage.setItem;
      sessionStorage.setItem = function(key, value) {
        if (typeof value === 'string' && value.includes('"password"')) {
          try {
            const parsed = JSON.parse(value);
            value = JSON.stringify(sanitizeDataSecure(parsed));
          } catch (e) {}
        }
        return originalSessionSetItem.call(this, key, value);
      };
    } catch (e) {
      console.error("[Security] Interceptor initialization failed:", e);
    }

    let fbApp = null;
    let fbAnalytics = null;
    let db = null;

    try {
      window.locallyModifiedOrders = new Proxy({}, {
        get: function(target, prop) {
          try {
            const raw = localStorage.getItem('ek_locally_modified_orders');
            if (raw) {
              const parsed = JSON.parse(raw);
              return parsed[prop] || target[prop] || null;
            }
          } catch (e) {}
          return target[prop] || null;
        },
        set: function(target, prop, value) {
          target[prop] = value;
          try {
            let modified = {};
            const raw = localStorage.getItem('ek_locally_modified_orders');
            if (raw) modified = JSON.parse(raw);
            modified[prop] = value;
            localStorage.setItem('ek_locally_modified_orders', JSON.stringify(modified));
          } catch (e) {}
          return true;
        }
      });
    } catch (e) {
      console.warn("Proxy not supported, falling back to in-memory locallyModifiedOrders:", e);
      window.locallyModifiedOrders = {};
    }

    async function verifyAdminWritePermission(operation) {
      debugLog(`[Admin Permission Audit] Pre-write verification started for: ${operation}`);
      if (typeof firebase === 'undefined' || !firebase.auth) {
        console.warn(`[Admin Permission Audit] Firebase Auth library is not loaded.`);
        return false;
      }
      const user = firebase.auth().currentUser;
      if (!user) {
        console.error(`[Admin Permission Audit] DENIED: No authenticated user present.`);
        return false;
      }

      debugLog(`[Admin Permission Audit] User Info:`);
      debugLog(` - UID: ${user.uid}`);
      debugLog(` - Email: ${user.email}`);
      debugLog(` - isAnonymous: ${user.isAnonymous}`);
      debugLog(` - ProviderData: ${JSON.stringify(user.providerData)}`);

      if (user.isAnonymous) {
        console.error(`[Admin Permission Audit] DENIED: User is signed in anonymously. Admin operations are strictly forbidden for guest accounts.`);
        return false;
      }

      if (typeof db !== 'undefined' && db) {
        try {
          const docSnap = await db.collection('ek_admin_accounts').doc(user.uid).get();
          if (docSnap.exists) {
            const adminData = docSnap.data();
            debugLog(`[Admin Permission Audit] Database lookup result:`, JSON.stringify(adminData));
            if (adminData && (adminData.role === 'admin' || adminData.role === 'superadmin') && adminData.active !== false) {
              debugLog(`[Admin Permission Audit] GRANTED ✓. Safe to execute database write.`);
              return true;
            } else {
              console.error(`[Admin Permission Audit] DENIED: Account is not role=admin/superadmin or is set to inactive.`);
              return false;
            }
          } else {
            console.error(`[Admin Permission Audit] DENIED: No document found in 'ek_admin_accounts' matching UID: ${user.uid}`);
            return false;
          }
        } catch (e) {
          console.warn(`[Admin Permission Audit] Lookup failed but proceeding if offline fallback enabled:`, e);
          return true;
        }
      }
      return false;
    }

    function logProductWriteAudit(actionType, productId, sourceFunc) {
      const timestamp = new Date().toISOString();
      let uid = "Unauthenticated";
      let isAnonymous = "Unknown";
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const user = firebase.auth().currentUser;
        uid = user.uid;
        isAnonymous = user.isAnonymous;
      }
      debugLog(`[Product Write Audit] [${timestamp}]`);
      debugLog(` - Action Type: ${actionType}`);
      debugLog(` - Product ID: ${productId}`);
      debugLog(` - Auth UID: ${uid}`);
      debugLog(` - Is Anonymous: ${isAnonymous}`);
      debugLog(` - Source File/Function: ${sourceFunc}`);
    }

    function isDemoOrMockProductId(id) {
      if (!id) return false;
      const demoPrefixes = ['p_chicken_biryani', 'p_fish_', 'p_dairy_', 'p_veg_', 'p_fruit_', 'p_groceries_'];
      const exactDemoIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
      if (exactDemoIds.includes(id)) return true;
      return demoPrefixes.some(prefix => id.startsWith(prefix));
    }

    function updateCloudStatus(status, tooltip = '') {
      const colors = {
        'connected': '#22c55e', // var(--accent-green) style green
        'syncing': '#3b82f6',    // var(--accent-blue) style blue
        'error': '#ef4444',      // var(--accent-red) style red
        'offline': '#737373'    // grey
      };
      const color = colors[status] || '#eab308'; // var(--accent-yellow) style yellow

      const badgeHome = document.getElementById('cloud-status-badge-home');
      const badgeAdmin = document.getElementById('cloud-status-badge-admin');

      if (badgeHome) {
        badgeHome.style.backgroundColor = color;
        badgeHome.title = tooltip;
      }
      if (badgeAdmin) {
        badgeAdmin.style.backgroundColor = color;
        badgeAdmin.title = tooltip;
      }
      debugLog(`[Cloud Status] Status updated to: ${status} (${tooltip})`);
    }

    function syncSessionKeysFromAndroidStorage() {
      if (typeof AndroidStorage !== 'undefined' && AndroidStorage.getData) {
        try {
          const keys = [
            'ek_admin_session', 'ek_customer_session', 'ek_delivery_session',
            'ek_customer_remember_me', 'ek_admin_remember_me', 'ek_delivery_remember_me',
            'ek_remembered_credentials', 'ek_remembered_admin_credentials', 'ek_remembered_delivery_credentials',
            'ek_admin_accounts', 'ek_users', 'ek_lang'
          ];
          for (const k of keys) {
            const val = AndroidStorage.getData(k, "");
            if (val && val !== 'null' && val !== 'undefined') {
              localStorage.setItem(k, val);
            }
          }
          debugLog("[AndroidStorage Sync] Synchronous session keys sync completed before Firebase init.");
        } catch (err) {
          console.error("[AndroidStorage Sync] Error in synchronous session keys sync:", err);
        }
      }
    }
    try {
      syncSessionKeysFromAndroidStorage();
    } catch (e) {}

    let isExplicitLogoutInProgress = false;
    let explicitLogoutStartTime = 0;

    function setExplicitLogoutInProgress(val) {
      if (val) {
        isExplicitLogoutInProgress = true;
        window.isExplicitLogoutInProgress = true;
        explicitLogoutStartTime = Date.now();
      } else {
        isExplicitLogoutInProgress = false;
        window.isExplicitLogoutInProgress = false;
        explicitLogoutStartTime = 0;
      }
    }
    window.setExplicitLogoutInProgress = setExplicitLogoutInProgress;

    function checkIsExplicitLogoutInProgress() {
      if (isExplicitLogoutInProgress || window.isExplicitLogoutInProgress) {
        if (explicitLogoutStartTime > 0 && (Date.now() - explicitLogoutStartTime) > 10000) {
          console.warn("isExplicitLogoutInProgress force-reset after timeout — possible stuck logout flow");
          isExplicitLogoutInProgress = false;
          window.isExplicitLogoutInProgress = false;
          explicitLogoutStartTime = 0;
          return false;
        }
        return true;
      }
      return false;
    }
    window.checkIsExplicitLogoutInProgress = checkIsExplicitLogoutInProgress;

    if (typeof firebase !== 'undefined') {
      try {
        updateCloudStatus('syncing', 'Initializing Cloud Connection...');
        fbApp = firebase.initializeApp(firebaseConfig);
        debugLog('[Diagnostic Step 1] firebase.initializeApp SUCCEEDED! ProjectId:', firebaseConfig ? firebaseConfig.projectId : 'N/A');
        db = firebase.firestore();
        if (firebase.firestore) {
          try {
            const originalSet = firebase.firestore.DocumentReference.prototype.set;
            firebase.firestore.DocumentReference.prototype.set = function(data, options) {
              const cleanData = sanitizeDataSecure(data);
              return originalSet.call(this, cleanData, options);
            };

            const originalUpdate = firebase.firestore.DocumentReference.prototype.update;
            firebase.firestore.DocumentReference.prototype.update = function(data, ...args) {
              if (typeof data === 'object' && data !== null) {
                const cleanData = sanitizeDataSecure(data);
                return originalUpdate.call(this, cleanData, ...args);
              } else if (typeof data === 'string') {
                if (data === 'password') {
                  console.warn('[Security] Blocked password field update to Firestore.');
                  return Promise.resolve();
                }
                return originalUpdate.apply(this, [data, ...args]);
              }
              return originalUpdate.call(this, data, ...args);
            };

            const originalAdd = firebase.firestore.CollectionReference.prototype.add;
            firebase.firestore.CollectionReference.prototype.add = function(data) {
              const cleanData = sanitizeDataSecure(data);
              return originalAdd.call(this, cleanData);
            };
            debugLog("[Security] Firestore secure data filters initialized successfully.");
          } catch (secErr) {
            console.error("[Security] Failed to override Firestore methods:", secErr);
          }
        }
        debugLog("Firebase Firestore initialized successfully inside index.html PWA!");
        debugLog('[Firebase Init Diagnostic] firebase.initializeApp succeeded. ProjectId:', firebaseConfig.projectId);

        if (db) {
          db.collection('ek_products').limit(1).get()
            .then(snap => {
              debugLog('[Firebase Init Diagnostic] First Firestore read (ek_products) RESOLVED SUCCESSFULLY! Doc count:', snap.size, 'Empty:', snap.empty);
            })
            .catch(err => {
              console.error('[Firebase Init Diagnostic Error] First Firestore read (ek_products) THREW AN ERROR:', err, 'Code:', err ? err.code : 'N/A', 'Message:', err ? err.message : String(err));
            });

          db.collection('ek_settings').doc('global_config').get()
            .then(doc => {
              debugLog('[Firebase Init Diagnostic] First Firestore read (ek_settings/global_config) RESOLVED SUCCESSFULLY! Exists:', doc.exists);
            })
            .catch(err => {
              console.error('[Firebase Init Diagnostic Error] First Firestore read (ek_settings/global_config) THREW AN ERROR:', err, 'Code:', err ? err.code : 'N/A', 'Message:', err ? err.message : String(err));
            });
        }

        if (firebase.storage) {
          try {
            if (typeof firebase.storage.setMaxUploadRetryTime === 'function') {
              firebase.storage.setMaxUploadRetryTime(10000);
            }
          } catch (e) {}
          try {
            if (typeof firebase.storage === 'function' && typeof firebase.storage().setMaxUploadRetryTime === 'function') {
              firebase.storage().setMaxUploadRetryTime(10000);
            }
          } catch (e) {}
        }

        if (db && typeof db.enablePersistence === 'function') {
          db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
              debugLog("Firestore offline persistence loaded successfully! ✓");
            })
            .catch(err => {
              if (err.code === 'failed-precondition') {
                console.warn("Firestore offline persistence: multiple tabs open.");
              } else if (err.code === 'unimplemented') {
                console.warn("Firestore offline persistence: current browser does not support it.");
              } else {
                console.warn("Firestore offline persistence execution error:", err);
              }
            });
        }

        if (typeof firebase !== 'undefined' && firebase.auth) {
          window.clearSessionAndRedirectToLogin = function() {
            debugLog("[Auth] Clearing all local sessions because FirebaseAuth.currentUser is null/anonymous.");

            removeData('ek_customer_session');
            removeData('ek_admin_session');
            removeData('ek_delivery_session');
            sessionStorage.removeItem('ek_customer_session_temp');
            localStorage.removeItem('ek_customer_session');
            localStorage.removeItem('ek_admin_session');
            localStorage.removeItem('ek_delivery_session');

            removeData('ek_active_session');
            localStorage.removeItem('ek_active_session');

            if (typeof showScreen === 'function') {
              showScreen('screen-login');
            }
          };

          firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => debugLog("[Auth] Persistence configured to LOCAL successfully"))
            .catch(pe => console.warn("[Auth] Persistence configuration failed:", pe));

          firebase.auth().onAuthStateChanged(async user => {
            if (checkIsExplicitLogoutInProgress() || window.isManualLoginInProgress) {
              debugLog("[Auth State Changed] Explicit logout or manual login in progress. Suppressing auth state listener processing.");
              return;
            }

            const hasCustSession = !!getData('ek_customer_session');
            const adminSession = typeof getAdminSession === 'function' ? getAdminSession() : null;
            const deliverySession = typeof getData === 'function' ? getData('ek_delivery_session', null) : null;
            const hasAdminSession = !!(adminSession && adminSession.loggedIn);
            const hasDeliverySession = !!(deliverySession && deliverySession.loggedIn);

            debugLog("[Auth State Changed] Listener triggered:");
            try {
              if (user && !user.isAnonymous) {
                debugLog(` - UID: ${user.uid}`);
                debugLog(` - Email: ${user.email}`);
                debugLog(` - Anonymous: ${user.isAnonymous}`);
                debugLog(` - Provider ID: ${user.providerId || 'None'}`);
                debugLog(` - Local Sessions: Cust=${hasCustSession}, Admin=${hasAdminSession}, Delivery=${hasDeliverySession}`);

                updateCloudStatus('connected', 'Cloud Database Connected ✓');
                setupCloudRealtimeListeners2();

                if (hasAdminSession) {
                  debugLog("[Auth State Changed] Active Admin session detected. Performing authorization check...");
                  try {
                    const docSnap = await db.collection('ek_admin_accounts').doc(user.uid).get();
                    if (docSnap.exists) {
                      const adminData = docSnap.data();
                      debugLog("[Auth State Changed] Admin document data:", JSON.stringify(adminData));
                      if (adminData && (adminData.role === 'admin' || adminData.role === 'superadmin') && adminData.active !== false) {
                        debugLog("[Auth State Changed] Admin authorization GRANTED ✓");
                      } else {
                        console.error("[Auth State Changed] Admin document found but role is not admin/superadmin or active is false! Access DENIED ❌");
                        showToast("உரிமம் மறுக்கப்பட்டது! / Admin authorization denied.", "error");
                      }
                    } else {
                      console.warn(`[Auth State Changed] Admin document not found at ek_admin_accounts/${user.uid}!`);
                    }
                  } catch (e) {
                    console.error("[Auth State Changed] Error retrieving admin document:", e);
                  }
                } else if (hasCustSession) {
                  debugLog("[Auth State Changed] Active Customer session detected. Loading user data...");
                  await loadUserData(user.uid);
                  debugLog("[Auth State Changed] Active Customer session loaded. Splash sequence will handle routing.");
                } else if (hasDeliverySession) {
                  debugLog("[Auth State Changed] Active Delivery session detected.");
                  debugLog("[Auth State Changed] Active Delivery session loaded. Splash sequence will handle routing.");
                } else {
                  let isAdminAccount = false;
                  if (user.email && user.email.toLowerCase().startsWith('admin_') && user.email.toLowerCase().endsWith('@app.com')) {
                    isAdminAccount = true;
                  } else {
                    try {
                      const adminDoc = await db.collection('ek_admin_accounts').doc(user.uid).get();
                      if (adminDoc.exists) {
                        const adData = adminDoc.data();
                        if (adData && (adData.role === 'admin' || adData.role === 'superadmin')) {
                          isAdminAccount = true;
                        }
                      }
                    } catch (e) {
                      console.warn("[Auth State Changed] Error checking ek_admin_accounts for orphaned auth:", e);
                    }
                  }

                  let isDeliveryAccount = false;
                  if (user.email && (user.email.toLowerCase().includes('rider') || user.email.toLowerCase().endsWith('@lyo.delivery'))) {
                    isDeliveryAccount = true;
                  } else {
                    try {
                      const delivDoc = await db.collection('ek_delivery_persons').doc(user.uid).get();
                      if (delivDoc.exists) {
                        isDeliveryAccount = true;
                      } else {
                        const userDoc = await db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                          const uData = userDoc.data();
                          if (uData && (uData.role === 'RIDER' || uData.role === 'rider' || uData.role === 'delivery')) {
                            isDeliveryAccount = true;
                          }
                        }
                      }
                    } catch (e) {
                      console.warn("[Auth State Changed] Error checking delivery account collections for orphaned auth:", e);
                    }
                  }

                  if (isAdminAccount || isDeliveryAccount) {
                    debugLog(`[Auth State Changed] Orphaned ${isAdminAccount ? 'Admin' : 'Delivery'} auth detected with no local session. Signing out and redirecting to login...`);
                    try {
                      await firebase.auth().signOut();
                    } catch (soErr) {
                      console.warn("[Auth State Changed] SignOut error for orphaned staff auth:", soErr);
                    }
                    if (typeof showScreen === 'function') {
                      showScreen('screen-login');
                    }
                  } else {
                    debugLog("[Auth State Changed] Real user logged in but no local customer session found. Restoring customer session...");
                    await loadUserData(user.uid);
                    debugLog("[Auth State Changed] Real user session restored. Splash sequence will handle routing.");
                  }
                }
              } else {
                debugLog(" - User is signed out or anonymous (Null).");
                debugLog(` - Local Sessions: Cust=${hasCustSession}, Admin=${hasAdminSession}, Delivery=${hasDeliverySession}`);

                if (checkIsExplicitLogoutInProgress()) {
                  debugLog("[Auth State Changed] Explicit logout in progress. Suppressing automatic clearSessionAndRedirectToLogin.");
                } else if (hasCustSession || hasAdminSession || hasDeliverySession) {
                  debugLog("[Auth State Changed] Active local session detected. Preserving local user session across app restarts.");
                } else {
                  if (!user) {
                    debugLog("[Auth State Changed] Guest detected with no local session. Signing in anonymously to authorize cloud read permissions...");
                    try {
                      const anonRes = await firebase.auth().signInAnonymously();
                      debugLog("[Diagnostic Step 2] firebase.auth().signInAnonymously() SUCCEEDED! Resulting UID:", anonRes?.user?.uid);
                      debugLog("[Auth] Successfully signed in anonymously as guest");
                    } catch (err) {
                      console.error("[Diagnostic Step 2 ERROR] firebase.auth().signInAnonymously() FAILED! Full error:", err, "Code:", err ? err.code : 'N/A', "Message:", err ? err.message : String(err));
                      updateCloudStatus('connected', 'Cloud Database Connected (Guest Mode) ✓');
                      setupCloudRealtimeListeners2();
                      debugLog("[Auth] Anonymous sign-in completed. Splash sequence will handle routing.");
                    }
                  } else {
                    updateCloudStatus('connected', 'Cloud Database Connected (Guest Mode) ✓');
                    setupCloudRealtimeListeners2();
                    debugLog("[Auth] Guest mode verified. Splash sequence will handle routing.");
                  }
                }
              }
            } finally {
              isFirebaseAuthRestoring = false;
            }
          });
        } else {
          updateCloudStatus('connected', 'Cloud Database Connected ✓');
          setupCloudRealtimeListeners2();
        }
      } catch (e) {
        console.error("Firebase Firestore init failed: ", e);
        updateCloudStatus('error', 'Init Failed: ' + e.message);
      }

      try {
        fbAnalytics = firebase.analytics();
      } catch (ea) {
        console.warn("Firebase Analytics disabled or skipped in local asset environment: ", ea);
      }
    }

    async function loadUserData(uid) {
      if (!uid) return;
      debugLog("[Auth Autologin] Loading user data for UID:", uid);
      try {
        if (typeof db !== 'undefined' && db) {
          const docSnap = await db.collection('ek_users').doc(uid).get();
          if (docSnap.exists) {
            const userData = docSnap.data();
            debugLog("[Auth Autologin] Loaded user data:", userData);
            const users = getData('ek_users', []);
            const uIdx = users.findIndex(u => u.id === uid || u.phone === userData.phone);
            if (uIdx !== -1) {
              users[uIdx] = userData;
            } else {
              users.push(userData);
            }
            saveData('ek_users', users);

            const existingSession = getActiveSession();
            const uniqueSessionToken = (existingSession && existingSession.userId === userData.id && existingSession.sessionToken)
              ? existingSession.sessionToken
              : 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
            const session = { loggedIn: true, userId: userData.id, name: userData.name, phone: userData.phone, sessionToken: uniqueSessionToken };
            saveData('ek_customer_session', session);
            if (typeof db !== 'undefined' && db && userData.activeSessionToken !== uniqueSessionToken) {
              db.collection('ek_users').doc(userData.id).update({
                activeSessionToken: uniqueSessionToken
              }).catch(err => console.error("Error setting initial activeSessionToken on autologin:", err));
            }
            if (typeof setupCloudRealtimeListeners2 === 'function') setupCloudRealtimeListeners2();
            if (typeof registerRealFcmToken === 'function') registerRealFcmToken();
          } else {
            console.warn("[Auth Autologin] No Firestore doc under UID:", uid, "— trying phone fallback.");
            try {
              const authUser = firebase.auth().currentUser;
              if (authUser && authUser.email && authUser.email.endsWith('@app.com')) {
                const phoneFromEmail = authUser.email.replace('@app.com', '');
                const phoneSnap = await db.collection('ek_users')
                  .where('phone', '==', phoneFromEmail).get();
                if (!phoneSnap.empty) {
                  const userData = normalizeFirestoreData(phoneSnap.docs[0].data());
                  const users = getData('ek_users', []);
                  const uIdx = users.findIndex(u => u.phone === userData.phone);
                  if (uIdx !== -1) { users[uIdx] = userData; } else { users.push(userData); }
                  saveData('ek_users', users);
                  const existingSession = getActiveSession();
                  const uniqueSessionToken = (existingSession && existingSession.userId === userData.id && existingSession.sessionToken)
                    ? existingSession.sessionToken
                    : 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
                  const session = {
                    loggedIn: true,
                    userId: userData.id,
                    name: userData.name,
                    phone: userData.phone,
                    sessionToken: uniqueSessionToken
                  };
                  saveData('ek_customer_session', session);
                  if (typeof db !== 'undefined' && db && userData.activeSessionToken !== uniqueSessionToken) {
                    db.collection('ek_users').doc(userData.id).update({
                      activeSessionToken: uniqueSessionToken
                    }).catch(err => console.error("Error setting initial activeSessionToken on autologin fallback:", err));
                  }
                  if (typeof setupCloudRealtimeListeners2 === 'function') setupCloudRealtimeListeners2();
                  debugLog('[Auth Autologin] Old user found via phone fallback:', userData.name);
                }
              }
            } catch (fbErr) {
              console.warn('[Auth Autologin] Phone fallback failed:', fbErr);
            }
          }
        }
      } catch (err) {
        console.error("[Auth Autologin] Error loading user data:", err);
      }
    }

    async function resolveFirebaseUserSafely() {
      if (isFirebaseAuthRestoring) {
        showToast(currentLang === 'ta' ? "பயனர் விபரம் சரிபார்க்கப்படுகிறது... ⏳" : "Verifying user session... ⏳", "info");
      }
      let attempts = 0;
      while (isFirebaseAuthRestoring && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user && !user.isAnonymous) {
          return user;
        }
      }
      return null;
    }

    async function getAuthenticatedCustomerUser() {
      const authUser = await resolveFirebaseUserSafely();
      if (!authUser) {
        console.warn("[Diagnostic] Authentication unavailable: Firebase currentUser is null or anonymous. Falling back to active local session.");
        const localUser = getActiveUser();
        if (localUser) {
          return localUser;
        }
        return null;
      }

      const users = getData('ek_users', []);
      let user = users.find(u => u.id === authUser.uid);
      if (!user) {
        try {
          debugLog("[Diagnostic] Cache miss for uid:", authUser.uid, "- fetching from Firestore.");
          const docSnap = await db.collection('ek_users').doc(authUser.uid).get();
          if (docSnap.exists) {
            user = docSnap.data();
            users.push(user);
            saveData('ek_users', users);
          }
        } catch (err) {
          console.error("[Diagnostic] Error fetching user from Firestore:", err);
        }
      }

      if (!user) {
        const session = getActiveSession();
        if (session && session.userId === authUser.uid) {
          user = {
            id: authUser.uid,
            name: session.name || "Customer / வாடிக்கையாளர்",
            phone: session.phone || authUser.phoneNumber || "",
            email: authUser.email || "",
            loyaltyPoints: 10,
            tier: "bronze"
          };
        } else {
          user = {
            id: authUser.uid,
            name: authUser.displayName || "Customer / வாடிக்கையாளர்",
            phone: authUser.phoneNumber || "",
            email: authUser.email || "",
            loyaltyPoints: 10,
            tier: "bronze"
          };
        }
      }

      const currentSession = getData('ek_customer_session', null);
      if (!currentSession || currentSession.userId !== authUser.uid) {
        const newSession = { loggedIn: true, userId: user.id, name: user.name, phone: user.phone };
        saveData('ek_customer_session', newSession);
      }

      return user;
    }

    function navigateToHome() {
      if (typeof showScreen === 'function') {
        showScreen('screen-home');
      }
    }

    function showLoginScreen() {
      const adminSession = typeof getAdminSession === 'function' ? getAdminSession() : null;
      const deliverySession = typeof getData === 'function' ? getData('ek_delivery_session', null) : null;
      const custSession = typeof getActiveSession === 'function' ? getActiveSession() : null;
      if (adminSession && adminSession.loggedIn) {
        if (typeof showScreen === 'function') showScreen('screen-admin');
      } else if (deliverySession && deliverySession.loggedIn) {
        if (typeof showScreen === 'function') showScreen('screen-delivery');
      } else if (custSession && custSession.loggedIn) {
        if (typeof showScreen === 'function') showScreen('screen-home');
      } else {
        if (typeof showScreen === 'function') showScreen('screen-home');
      }
    }

    function normalizeFirestoreData(obj) {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== 'object') return obj;

      if (typeof obj.seconds === 'number' && typeof obj.nanoseconds === 'number') {
        const ms = obj.seconds * 1000 + Math.round((obj.nanoseconds || 0) / 1000000);
        return new Date(ms).toISOString();
      }

      if (Array.isArray(obj)) {
        return obj.map(normalizeFirestoreData);
      }

      const res = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          res[key] = normalizeFirestoreData(obj[key]);
        }
      }
      return res;
    }

    function cleanFirestoreData(obj) {
      if (obj === null || obj === undefined) return null;
      if (typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.map(cleanFirestoreData);
      }
      const res = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const val = obj[key];
          if (val === undefined) {
            res[key] = null;
          } else {
            res[key] = cleanFirestoreData(val);
          }
        }
      }
      return res;
    }

    const _dataCache = new Map();
    const _cacheTimestamps = new Map();
    const CACHE_TTL_MS = 3000; // 3 seconds - fresh-enough while skipping repeated calls
    let _categoriesListCachedValue = null;

    function getDataCached(key, defaultVal = []) {
      const now = Date.now();
      const cachedTime = _cacheTimestamps.get(key);

      if (_dataCache.has(key) && cachedTime && (now - cachedTime) < CACHE_TTL_MS) {
        return _dataCache.get(key); // Cache hit
      }

      const fresh = getData(key, defaultVal);
      _dataCache.set(key, fresh);
      _cacheTimestamps.set(key, now);
      return fresh;
    }

    function invalidateDataCache(key) {
      _dataCache.delete(key);
      _cacheTimestamps.delete(key);
      if (!key || key === 'ek_categories') {
        _categoriesListCachedValue = null;
      }
      _lastDataSnapshotHash = '';
      _lastProductsHash = '';
      _lastSpecialsHash = '';
      _lastCategoryPillsHash = '';
      _lastBannersHash = '';
    }

    function safeParseDate(val) {
      if (!val) return new Date();
      if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
      if (typeof val === 'object') {
        if (typeof val.toDate === 'function') {
          try {
            const d = val.toDate();
            if (d && !isNaN(d.getTime())) return d;
          } catch(e) {}
        }
        if (typeof val.seconds === 'number') {
          return new Date(val.seconds * 1000);
        }
        if (typeof val._seconds === 'number') {
          return new Date(val._seconds * 1000);
        }
      }
      if (typeof val === 'number') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
      }
      if (typeof val === 'string') {
        let d = new Date(val);
        if (!isNaN(d.getTime())) return d;
        const num = Number(val);
        if (!isNaN(num)) {
          d = new Date(num);
          if (!isNaN(d.getTime())) return d;
        }
      }
      return new Date();
    }

    function safeParseTime(val) {
      return safeParseDate(val).getTime();
    }

    function safeFormatDate(val, options = {}) {
      try {
        return safeParseDate(val).toLocaleDateString([], options);
      } catch (e) {
        return new Date().toLocaleDateString();
      }
    }

    function safeFormatTime(val, options = { hour: '2-digit', minute: '2-digit' }) {
      try {
        return safeParseDate(val).toLocaleTimeString([], options);
      } catch (e) {
        return new Date().toLocaleTimeString();
      }
    }

    function safeFormatDateTime(val, options = {}) {
      try {
        return safeParseDate(val).toLocaleString([], options);
      } catch (e) {
        return new Date().toLocaleString();
      }
    }

    function normalizeTimeStr(ts, defaultVal = "11:00") {
      if (!ts) return defaultVal;
      const parts = String(ts).trim().split(':');
      if (parts.length === 2) {
        return String(parts[0]).padStart(2, '0') + ':' + String(parts[1]).padStart(2, '0');
      }
      return defaultVal;
    }

    function areProductFieldsEqual(p1, p2) {
      if (!p1 || !p2) return false;
      return p1.id === p2.id &&
             Number(p1.pricePerKg || 0) === Number(p2.pricePerKg || 0) &&
             Number(p1.stockKg || 0) === Number(p2.stockKg || 0) &&
             Boolean(p1.isOutOfStock) === Boolean(p2.isOutOfStock) &&
             String(p1.englishName || "").trim() === String(p2.englishName || "").trim() &&
             String(p1.tamilName || "").trim() === String(p2.tamilName || "").trim() &&
             String(p1.category || "").trim().toLowerCase() === String(p2.category || "").trim().toLowerCase() &&
             String(p1.imageUrl || "").trim() === String(p2.imageUrl || "").trim() &&
             String(p1.unit || "").trim().toLowerCase() === String(p2.unit || "").trim().toLowerCase() &&
             String(p1.sellingUnit || "").trim().toLowerCase() === String(p2.sellingUnit || "").trim().toLowerCase() &&
             Boolean(p1.isSpecial) === Boolean(p2.isSpecial) &&
             Boolean(p1.isHidden) === Boolean(p2.isHidden) &&
             Number(p1.revision || 0) === Number(p2.revision || 0) &&
             Number(p1.order !== undefined ? p1.order : (p1.displayOrder !== undefined ? p1.displayOrder : 999)) ===
             Number(p2.order !== undefined ? p2.order : (p2.displayOrder !== undefined ? p2.displayOrder : 999));
    }

        function getProductThumbnailUrl(p) {
      if (!p) return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
      let url = (typeof p === 'string' ? p : (p.imageUrl || p.thumbnailUrl || p.thumbUrl)) || '';
      if (!url || url === 'null' || url === 'undefined') return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
      if (url.includes('images.unsplash.com')) {
        return url.replace(/w=\d+/, 'w=300');
      }
      return url;
    }
    function getProductFullImageUrl(p) {
      if (!p) return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=850';
      let url = (typeof p === 'string' ? p : (p.imageUrl || p.fullImageUrl || p.largeImageUrl)) || '';
      if (!url || url === 'null' || url === 'undefined') return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=850';
      if (url.includes('images.unsplash.com')) {
        return url.replace(/w=\d+/, 'w=850');
      }
      return url;
    }
function getImageUrlWithCacheBuster(url, updatedAt) {
      if (!url) return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200';
      if (url.startsWith('data:')) return url;

      if (!updatedAt) return url; // Preserve native browser image caching

      let buster = null;
      const parsed = new Date(updatedAt).getTime();
      if (!isNaN(parsed)) {
        buster = Math.floor(parsed / 1000);
      } else {
        return url;
      }

      if (url.match(/([?&])(t|v)=\d+/)) {
        return url.replace(/([?&])(t|v)=\d+/, '$1$2=' + buster);
      }

      if (url.includes('?')) {
        return url + '&v=' + buster;
      } else {
        return url + '?v=' + buster;
      }
    }

    const _originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      _dataCache.delete(key);
      _cacheTimestamps.delete(key);
      try {
        _originalSetItem.call(localStorage, key, value);
      } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22)) {
          console.warn("[Storage Safeguard] LocalStorage quota limit reached. Clearing temporary logs & non-essential cache...");
          ['ek_pending_syncs', 'ek_notifications', 'ek_temp_logs', 'ek_search_history'].forEach(k => {
            try { _originalRemoveItem.call(localStorage, k); } catch(_) {}
          });
          try {
            _originalSetItem.call(localStorage, key, value);
          } catch(retryErr) {
            console.error("[Storage Safeguard] Secondary setItem failed:", retryErr);
          }
        } else {
          throw e;
        }
      }
    };

    const _originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      _dataCache.delete(key);
      _cacheTimestamps.delete(key);
      _originalRemoveItem.call(localStorage, key);
    };

    function canOverwriteOrderStatus(existingStatus, incomingStatus) {
      if (!existingStatus) return true;
      const cur = String(existingStatus).toUpperCase();
      const inc = String(incomingStatus).toUpperCase();

      const curTerminal = (cur === 'CANCELLED' || cur === 'DELIVERED' || cur === 'REJECTED' || cur === 'CANCELED');
      const incTerminal = (inc === 'CANCELLED' || inc === 'DELIVERED' || inc === 'REJECTED' || inc === 'CANCELED');

      if (curTerminal && !incTerminal) {
        return false;
      }
      return true;
    }

    function getData(key, defaultVal = []) {
      try {
        let val = null;
        if (typeof AndroidStorage !== 'undefined') {
          val = AndroidStorage.getData(key, "");
        }
        if (!val) {
          val = localStorage.getItem(key);
        }
        let parsed = val ? JSON.parse(val) : defaultVal;
        if (parsed === null || parsed === undefined) {
          parsed = defaultVal;
        }
        if (key === 'ek_orders' && Array.isArray(parsed)) {
          let deletedIds = [];
          try {
            let delVal = null;
            if (typeof AndroidStorage !== 'undefined') {
              delVal = AndroidStorage.getData('ek_deleted_order_ids', "");
            }
            if (!delVal) {
              delVal = localStorage.getItem('ek_deleted_order_ids');
            }
            deletedIds = delVal ? JSON.parse(delVal) : [];
          } catch(err) {
            deletedIds = [];
          }
          if (deletedIds && Array.isArray(deletedIds) && deletedIds.length > 0) {
            parsed = parsed.filter(o => {
              if (o && o.id && deletedIds.includes(o.id)) {
                const status = (o.status || '').toLowerCase().trim();
                return ['completed', 'delivered', 'cancelled', 'archived'].includes(status);
              }
              return true;
            });
          }
        }
        if (key === 'ek_users' && Array.isArray(parsed)) {
          const uniqueMap = new Map();
          parsed.forEach(u => {
            if (!u || !u.phone) return;
            const existing = uniqueMap.get(u.phone);
            if (!existing) {
              uniqueMap.set(u.phone, u);
            } else {
              const timeExisting = existing.updatedAt ? new Date(existing.updatedAt).getTime() : (existing.joinedAt ? new Date(existing.joinedAt).getTime() : 0);
              const timeU = u.updatedAt ? new Date(u.updatedAt).getTime() : (u.joinedAt ? new Date(u.joinedAt).getTime() : 0);
              if (timeU > timeExisting) {
                uniqueMap.set(u.phone, u);
              }
            }
          });
          parsed = Array.from(uniqueMap.values());
        }
        _dataCache.set(key, parsed);
        return parsed;
      } catch (e) {
        try {
          const val = localStorage.getItem(key);
          let parsed = val ? JSON.parse(val) : defaultVal;
          if (parsed === null || parsed === undefined) {
            parsed = defaultVal;
          }
          if (key === 'ek_orders' && Array.isArray(parsed)) {
            let deletedIds = [];
            try {
              let delVal = null;
              if (typeof AndroidStorage !== 'undefined') {
                delVal = AndroidStorage.getData('ek_deleted_order_ids', "");
              }
              if (!delVal) {
                delVal = localStorage.getItem('ek_deleted_order_ids');
              }
              deletedIds = delVal ? JSON.parse(delVal) : [];
            } catch(err) {
              deletedIds = [];
            }
            if (deletedIds && Array.isArray(deletedIds) && deletedIds.length > 0) {
              parsed = parsed.filter(o => {
                if (o && o.id && deletedIds.includes(o.id)) {
                  const status = (o.status || '').toLowerCase().trim();
                  return ['completed', 'delivered', 'cancelled', 'archived'].includes(status);
                }
                return true;
              });
            }
          }
          if (key === 'ek_users' && Array.isArray(parsed)) {
            const uniqueMap = new Map();
            parsed.forEach(u => {
              if (!u || !u.phone) return;
              const existing = uniqueMap.get(u.phone);
              if (!existing) {
                uniqueMap.set(u.phone, u);
              } else {
                const timeExisting = existing.updatedAt ? new Date(existing.updatedAt).getTime() : (existing.joinedAt ? new Date(existing.joinedAt).getTime() : 0);
                const timeU = u.updatedAt ? new Date(u.updatedAt).getTime() : (u.joinedAt ? new Date(u.joinedAt).getTime() : 0);
                if (timeU > timeExisting) {
                  uniqueMap.set(u.phone, u);
                }
              }
            });
            parsed = Array.from(uniqueMap.values());
          }
          _dataCache.set(key, parsed);
          return parsed;
        } catch (err) {
          return defaultVal;
        }
      }
    }

    function isUnitWeight(unit) {
      if (!unit) return true;
      const u = unit.toLowerCase();
      if (u === 'piece' || u === 'pc' || u === 'packet' || u === 'pack' ||
          u === 'bunch' || u === 'dozen' || u === 'unit' || u === 'bottle' ||
          u === 'box' || u === 'bundle' || u === 'tray' || u === 'can' ||
          u === 'tin' || u === 'cup' || u === 'loaf' || u === 'roll' || u === 'set') {
        return false;
      }
      return true;
    }

    function getUnitDisplay(unit, isTa = false, qty = 1) {
      if (!unit) return isTa ? 'கிலோ' : 'Kg';
      const u = unit.toLowerCase();
      if (typeof isTa !== 'boolean') {
        isTa = (isTa === 'ta');
      }

      const mapping = {
        'kg': { sEn: 'Kg', pEn: 'Kg', sTa: 'கிலோ', pTa: 'கிலோ' },
        'kilogram': { sEn: 'Kg', pEn: 'Kg', sTa: 'கிலோ', pTa: 'கிலோ' },
        'g': { sEn: 'g', pEn: 'g', sTa: 'கிராம்', pTa: 'கிராம்' },
        'gram': { sEn: 'g', pEn: 'g', sTa: 'கிராம்', pTa: 'கிராம்' },
        'litre': { sEn: 'Litre', pEn: 'Litres', sTa: 'லிட்டர்', pTa: 'லிட்டர்' },
        'litres': { sEn: 'Litre', pEn: 'Litres', sTa: 'லிட்டர்', pTa: 'லிட்டர்' },
        'ml': { sEn: 'ml', pEn: 'ml', sTa: 'மி.லி', pTa: 'மி.லி' },
        'milli litre': { sEn: 'ml', pEn: 'ml', sTa: 'மி.லி', pTa: 'மி.லி' },
        'milli litres': { sEn: 'ml', pEn: 'ml', sTa: 'மி.லி', pTa: 'மி.லி' },
        'piece': { sEn: 'Piece', pEn: 'Pieces', sTa: 'பீஸ்', pTa: 'பீஸ்' },
        'pc': { sEn: 'Piece', pEn: 'Pieces', sTa: 'பீஸ்', pTa: 'பீஸ்' },
        'packet': { sEn: 'Packet', pEn: 'Packets', sTa: 'பாக்கெட்', pTa: 'பாக்கெட்டுகள்' },
        'pack': { sEn: 'Packet', pEn: 'Packets', sTa: 'பாக்கெட்', pTa: 'பாக்கெட்டுகள்' },
        'bottle': { sEn: 'Bottle', pEn: 'Bottles', sTa: 'பாட்டில்', pTa: 'பாட்டில்கள்' },
        'box': { sEn: 'Box', pEn: 'Boxes', sTa: 'பெட்டி', pTa: 'பெட்டிகள்' },
        'bunch': { sEn: 'Bunch', pEn: 'Bunches', sTa: 'கட்டு', pTa: 'கட்டுகள்' },
        'bundle': { sEn: 'Bundle', pEn: 'Bundles', sTa: 'கட்டு', pTa: 'கட்டுகள்' },
        'dozen': { sEn: 'Dozen', pEn: 'Dozens', sTa: 'டஜன்', pTa: 'டஜன்' },
        'tray': { sEn: 'Tray', pEn: 'Trays', sTa: 'தட்டு', pTa: 'தட்டுகள்' },
        'can': { sEn: 'Can', pEn: 'Cans', sTa: 'கேன்', pTa: 'கேன்கள்' },
        'tin': { sEn: 'Tin', pEn: 'Tins', sTa: 'டின்', pTa: 'டின்கள்' },
        'cup': { sEn: 'Cup', pEn: 'Cups', sTa: 'கோப்பை', pTa: 'கோப்பைகள்' },
        'loaf': { sEn: 'Loaf', pEn: 'Loaves', sTa: 'ரொட்டி துண்டு', pTa: 'ரொட்டி துண்டுகள்' },
        'roll': { sEn: 'Roll', pEn: 'Rolls', sTa: 'சுருள்', pTa: 'சுருள்கள்' },
        'set': { sEn: 'Set', pEn: 'Sets', sTa: 'செட்', pTa: 'செட்கள்' },
        'unit': { sEn: 'Unit', pEn: 'Units', sTa: 'அலகு', pTa: 'அலகுகள்' }
      };

      const matched = mapping[u];
      if (matched) {
        if (isTa) {
          return qty === 1 ? matched.sTa : matched.pTa;
        } else {
          return qty === 1 ? matched.sEn : matched.pEn;
        }
      }
      return unit;
    }

    function cleanProductName(name) {
      if (!name) return "";
      return name.replace(/\s*\((packet|bunch|piece|kg|pkt|bundle|pcs|dozen|dozens|litre|liter|l|bottle|box|cup|units)\)/gi, "").trim();
    }

    function getProductPriceText(p, isTa = false) {
      if (!p) return "";
      const price = p.pricePerKg || 0;
      const unit = p.sellingUnit || p.unit || 'kg';
      if (typeof isTa !== 'boolean') {
        isTa = (isTa === 'ta');
      }
      const uDisplay = getUnitDisplay(unit, isTa, 1);
      return `₹${price} / ${uDisplay}`;
    }

    function getProductStockText(p, isTa = false) {
      if (!p) return "0";
      const stock = p.stockKg || 0;
      const unit = p.sellingUnit || p.unit || 'kg';
      if (typeof isTa !== 'boolean') {
        isTa = (isTa === 'ta');
      }
      const uDisplay = getUnitDisplay(unit, isTa, stock);
      return `${stock} ${uDisplay}`;
    }

    function getFormattedItemQty(it, isTa = false) {
      if (!it) return "0";
      const unit = it.sellingUnit || it.unit || 'kg';
      const isWeight = isUnitWeight(unit);
      const qty = it.weightGrams || 0;
      if (typeof isTa !== 'boolean') {
        isTa = (isTa === 'ta');
      }

      if (isWeight) {
        const uLower = unit.toLowerCase();
        if (uLower === 'g' || uLower === 'gram') {
          return qty + (isTa ? ' கிராம்' : ' g');
        } else if (uLower === 'ml' || uLower === 'milli litre' || uLower === 'milli litres') {
          return qty + (isTa ? ' மி.லி' : ' ml');
        } else {
          const isLitre = (uLower === 'litre' || uLower === 'litres');
          const unitSingle = isLitre ? (isTa ? ' லிட்டர்' : ' Litre') : (isTa ? ' கிலோ' : ' Kg');
          const unitSmall = isLitre ? (isTa ? ' மி.லி' : ' ml') : (isTa ? ' கி' : ' g');
          if (qty >= 1000) {
            return (qty / 1000).toFixed(2).replace(/\.00$/, '') + unitSingle;
          } else {
            return qty + unitSmall + ` (${(qty / 1000).toFixed(2)}` + unitSingle + `)`;
          }
        }
      } else {
        const uText = getUnitDisplay(unit, isTa, qty);
        return `${qty} ${uText}`;
      }
    }

    function onProductUnitChanged(val, prefix = 'add-prod') {
      const priceLabel = document.getElementById(`${prefix}-price-label`);
      const stockLabel = document.getElementById(`${prefix}-stock-label`);
      if (!priceLabel || !stockLabel) return;

      const isTa = currentLang === 'ta';
      const unitSingularEn = getUnitDisplay(val, false, 1);
      const unitSingularTa = getUnitDisplay(val, true, 1);
      const unitPluralEn = getUnitDisplay(val, false, 2);
      const unitPluralTa = getUnitDisplay(val, true, 2);

      priceLabel.innerText = isTa
        ? `விலை (1 ${unitSingularTa}) (₹) *`
        : `Price per ${unitSingularEn} (₹) *`;
      stockLabel.innerText = isTa
        ? `இருப்பு அளவு (${unitPluralTa}) *`
        : `Current Stock (${unitPluralEn}) *`;
    }

    function getSettings() {
      return getDataCached('ek_settings', DEFAULT_SETTINGS);
    }

    function getDeletedOrderIds() {
      let list = getData('ek_deleted_order_ids', []);
      if (!list || !Array.isArray(list)) list = [];
      return list;
    }
    function pruneLocalDeletedOrders() {
      const deletedOrderIds = getDeletedOrderIds();
      if (deletedOrderIds.length === 0) return;
      const orders = getData('ek_orders', []);
      const filtered = orders.filter(o => {
        if (deletedOrderIds.includes(o.id)) {
          const status = (o.status || '').toLowerCase().trim();
          return ['completed', 'delivered', 'cancelled', 'archived'].includes(status);
        }
        return true;
      });
      if (orders.length !== filtered.length) {
        saveData('ek_orders', filtered);
        debugLog(`[Safeguard] Pruned ${orders.length - filtered.length} deleted active/draft orders from local cache.`);
      }
    }
    function markOrderAsDeleted(orderId) {
      const list = getDeletedOrderIds();
      if (!list.includes(orderId)) {
        list.push(orderId);
        saveData('ek_deleted_order_ids', list);
      }
      pruneLocalDeletedOrders();
    }
    function getCustomerHiddenOrderIds() {
      let val = null;
      if (typeof AndroidStorage !== 'undefined') {
        val = AndroidStorage.getData('ek_customer_hidden_order_ids', "");
      }
      if (!val) {
        val = localStorage.getItem('ek_customer_hidden_order_ids');
      }
      let list = [];
      try {
        list = val ? JSON.parse(val) : [];
      } catch (e) {
        list = [];
      }
      if (!list || !Array.isArray(list)) list = [];
      return list;
    }
    function markOrderAsHiddenByCustomer(orderId) {
      if (typeof selectedTrackOrderId !== "undefined" && selectedTrackOrderId === orderId) {
        selectedTrackOrderId = null;
      }
      const list = getCustomerHiddenOrderIds();
      if (!list.includes(orderId)) {
        list.push(orderId);
        if (typeof AndroidStorage !== 'undefined') {
          AndroidStorage.saveData('ek_customer_hidden_order_ids', JSON.stringify(list));
        } else {
          localStorage.setItem('ek_customer_hidden_order_ids', JSON.stringify(list));
        }
      }
    }
    function getDeletedProductIds() {
      let list = getData('ek_deleted_product_ids', []);
      if (!list || !Array.isArray(list)) list = [];
      return list;
    }
    function pruneLocalDeletedProducts() {
      const deletedProdIds = getDeletedProductIds();
      if (deletedProdIds.length === 0) return;
      const products = getData('ek_products', []);
      const filtered = products.filter(p => !deletedProdIds.includes(p.id));
      if (products.length !== filtered.length) {
        saveData('ek_products', filtered);
        debugLog(`[Safeguard] Pruned ${products.length - filtered.length} deleted products from local cache.`);
      }
    }
    function markProductAsDeleted(productId) {
      const list = getDeletedProductIds();
      if (!list.includes(productId)) {
        list.push(productId);
        saveData('ek_deleted_product_ids', list);
      }
      pruneLocalDeletedProducts();
    }
    function getDeletedUserIds() {
      let list = getData('ek_deleted_user_ids', []);
      if (!list || !Array.isArray(list)) list = [];
      return list;
    }
    function pruneLocalDeletedUsers() {
      const deletedUserIds = getDeletedUserIds();
      if (deletedUserIds.length === 0) return;
      const users = getData('ek_users', []);
      const filtered = users.filter(u => !deletedUserIds.includes(u.id) && !deletedUserIds.includes(u.phone));
      if (users.length !== filtered.length) {
        saveData('ek_users', filtered);
        debugLog(`[Safeguard] Pruned ${users.length - filtered.length} deleted users from local cache.`);
      }
    }
    function markUserAsDeleted(userId) {
      const list = getDeletedUserIds();
      if (!list.includes(userId)) {
        list.push(userId);
        saveData('ek_deleted_user_ids', list);
      }
      pruneLocalDeletedUsers();
    }
    function unmarkUserAsDeleted(userIdOrPhone) {
      let list = getDeletedUserIds();
      list = list.filter(id => id !== userIdOrPhone);
      saveData('ek_deleted_user_ids', list);
    }

    function getDeletedRiderIds() {
      let list = getData('ek_deleted_rider_ids', []);
      if (!list || !Array.isArray(list)) list = [];
      if (!list.includes('d1')) list.push('d1');
      if (!list.includes('d2')) list.push('d2');
      return list;
    }
    function pruneLocalDeletedRiders() {
      const deletedRiderIds = getDeletedRiderIds();
      if (deletedRiderIds.length === 0) return;
      const riders = getData('ek_delivery_persons', []);
      const filtered = riders.filter(r => !deletedRiderIds.includes(r.id));
      if (riders.length !== filtered.length) {
        saveData('ek_delivery_persons', filtered);
        debugLog(`[Safeguard] Pruned ${riders.length - filtered.length} deleted riders from local cache.`);
      }
    }
    function markRiderAsDeleted(riderId) {
      const list = getDeletedRiderIds();
      if (!list.includes(riderId)) {
        list.push(riderId);
        saveData('ek_deleted_rider_ids', list);
      }
      pruneLocalDeletedRiders();
    }
    function unmarkRiderAsDeleted(riderId) {
      let list = getDeletedRiderIds();
      list = list.filter(id => id !== riderId);
      saveData('ek_deleted_rider_ids', list);
    }

    function getDeletedAdminIds() {
      return getData('ek_deleted_admin_ids', []);
    }
    function markAdminAsDeleted(adminIdOrPhone) {
      const list = getDeletedAdminIds();
      if (!list.includes(adminIdOrPhone)) {
        list.push(adminIdOrPhone);
        saveData('ek_deleted_admin_ids', list);
      }
    }
    function unmarkAdminAsDeleted(adminIdOrPhone) {
      let list = getDeletedAdminIds();
      list = list.filter(id => id !== adminIdOrPhone);
      saveData('ek_deleted_admin_ids', list);
    }

    function saveData(key, data) {
      try {
        invalidateDataCache(key); // Invalidate cache first so subsequent reads fetch fresh data

        if (key === 'ek_orders' && Array.isArray(data)) {
          const deletedOrderIds = getDeletedOrderIds();
          data = data.filter(o => {
            if (deletedOrderIds.includes(o.id)) {
              const status = (o.status || '').toLowerCase().trim();
              return ['completed', 'delivered', 'cancelled', 'archived'].includes(status);
            }
            return true;
          });
        } else if (key === 'ek_products' && Array.isArray(data)) {
          const deletedProductIds = typeof getDeletedProductIds === 'function' ? getDeletedProductIds() : [];
          data = data.filter(p => !deletedProductIds.includes(p.id));
        } else if (key === 'ek_users' && Array.isArray(data)) {
          const deletedUserIds = typeof getDeletedUserIds === 'function' ? getDeletedUserIds() : [];
          data = data.filter(u => !deletedUserIds.includes(u.id || u.phone));
        } else if (key === 'ek_delivery_persons' && Array.isArray(data)) {
          const deletedRiderIds = typeof getDeletedRiderIds === 'function' ? getDeletedRiderIds() : [];
          data = data.filter(r => !deletedRiderIds.includes(r.id));
        }

        if (key === 'ek_settings' && typeof data === 'object' && data !== null) {
          if (!data.updatedAt) {
            data.updatedAt = "1970-01-01T00:00:00.000Z";
          }
        }

        if (typeof sanitizeDataSecure === 'function') {
          data = sanitizeDataSecure(data);
        }

        const jsonStr = JSON.stringify(data);
        if (typeof AndroidStorage !== 'undefined') {
          AndroidStorage.saveData(key, jsonStr);
        }
        localStorage.setItem(key, jsonStr);

        if (key === 'ek_settings' && typeof db !== 'undefined' && db && data && data._isAdminModified === true) {
          db.collection('ek_settings').doc('global_config').set(cleanFirestoreData(data))
            .then(() => debugLog("[Cloud Sync] Settings auto-synced with Firestore!"))
            .catch(e => console.error("[Cloud Sync] Settings auto-sync failed:", e));
        }

        if (key === 'ek_orders') {
          window.dispatchEvent(new CustomEvent('ek-orders-updated', { detail: data }));
        }

        if (key === 'ek_categories') {
          _categoriesListCachedValue = null;
          _lastCategoryPillsHash = '';
          _lastDataSnapshotHash = '';
        }

        if (['ek_products', 'ek_settings', 'ek_orders', 'ek_users', 'ek_delivery_persons', 'ek_admin_accounts', 'ek_remembered_credentials', 'ek_categories'].includes(key)) {
          const timeStr = Date.now().toString();
          localStorage.setItem('ek_last_update', timeStr);
          if (typeof clientLastSyncTime !== 'undefined') {
            clientLastSyncTime = parseInt(timeStr);
          }
          if (typeof AndroidStorage !== 'undefined') {
            AndroidStorage.saveData('ek_last_update', timeStr);
          }
        }

        if (db) {
          setTimeout(() => {
            try {
              if (['ek_deleted_product_ids', 'ek_deleted_order_ids', 'ek_deleted_user_ids', 'ek_deleted_rider_ids'].includes(key)) {
                if (Array.isArray(data) && data.length > 0) {
                  db.collection('ek_tombstones').doc(key).set({
                    ids: firebase.firestore.FieldValue.arrayUnion(...data),
                    updatedAt: new Date().toISOString()
                  }, { merge: true })
                  .then(() => debugLog(`[Tombstone Sync] Sync successful for ${key}`))
                  .catch(err => console.error(`[Tombstone Sync] Sync fail for ${key}:`, err));
                }
              } else if (['ek_users', 'ek_orders', 'ek_products', 'ek_delivery_persons', 'ek_admin_accounts', 'ek_categories'].includes(key) && Array.isArray(data)) {
                const now = Date.now();
                const deletedOrderIds = getDeletedOrderIds();
                const deletedProductIds = typeof getDeletedProductIds === 'function' ? getDeletedProductIds() : [];
                const deletedUserIds = typeof getDeletedUserIds === 'function' ? getDeletedUserIds() : [];
                const deletedRiderIds = typeof getDeletedRiderIds === 'function' ? getDeletedRiderIds() : [];

                data.forEach(item => {
                  const itemId = item.id || item.phone;
                  if (!itemId) return;

                  if (key === 'ek_orders' && deletedOrderIds.includes(itemId)) {
                    const matchedOrd = data.find(o => (o.id || o.phone) === itemId);
                    const status = matchedOrd ? (matchedOrd.status || '').toLowerCase().trim() : '';
                    if (!['completed', 'delivered', 'cancelled', 'archived'].includes(status)) {
                      return;
                    }
                  }
                  if (key === 'ek_products' && deletedProductIds.includes(itemId)) return;
                  if (key === 'ek_users' && deletedUserIds.includes(itemId)) return;
                  if (key === 'ek_delivery_persons' && deletedRiderIds.includes(itemId)) return;

                  const lastUpdated = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
                  const isRecent = Math.abs(now - lastUpdated) < 15000;

                  if (!item.updatedAt || isRecent) {
                    const docId = (key === 'ek_users' || key === 'ek_admin_accounts') ? (item.id || item.phone) : item.id;
                    if (docId) {
                      db.collection(key).doc(docId).set(cleanFirestoreData(item))
                        .catch(err => console.error(`Firestore Cloud auto-upload fail for ${key} [Doc: ${docId}]:`, err));
                    }
                  }
                });
              } else if (key === 'ek_settings') {
                db.collection('ek_settings').doc('global_config').set(cleanFirestoreData(data))
                  .catch(err => console.error("Firestore settings auto-upload fail:", err));
              }
            } catch (err) {
              console.error("Non-blocking background sync fail:", err);
            }
          }, 50);
        }
      } catch (e) {
        console.error("Storage write error", e);
      }
    }

    function removeData(key) {
      try {
        invalidateDataCache(key);
        if (typeof AndroidStorage !== 'undefined') {
          AndroidStorage.removeData(key);
        }
        localStorage.removeItem(key);
      } catch (e) {
        console.error("Storage remove error", e);
      }
    }

    function syncAndroidStorageToLocalStorageWithRetry(attempt = 1) {
      if (typeof AndroidStorage !== 'undefined') {
        debugLog(`[AndroidStorage Sync] Bridge available (attempt ${attempt}). Syncing session keys...`);
        try {
          const keys = [
            'ek_customer_session', 'ek_admin_session', 'ek_delivery_session',
            'ek_customer_remember_me', 'ek_admin_remember_me', 'ek_delivery_remember_me',
            'ek_remembered_credentials', 'ek_remembered_admin_credentials', 'ek_remembered_delivery_credentials',
            'ek_lang'
          ];
          for (const k of keys) {
            const val = AndroidStorage.getData ? AndroidStorage.getData(k) : null;
            if (val) {
              localStorage.setItem(k, val);
            }
          }
          debugLog("[AndroidStorage Sync] Session keys sync from AndroidStorage succeeded.");
          return true;
        } catch (err) {
          console.error("[AndroidStorage Sync] Error syncing keys from AndroidStorage:", err);
        }
      } else {
        if (attempt <= 5) {
          debugLog(`[AndroidStorage Sync] Bridge not immediately available (attempt ${attempt}/5). Retrying in 100ms...`);
          setTimeout(() => syncAndroidStorageToLocalStorageWithRetry(attempt + 1), 100);
        } else {
          console.warn("[AndroidStorage Sync] Bridge not available after 5 attempts. Proceeding with standard localStorage.");
        }
      }
      return false;
    }

    // Run AndroidStorage bridge sync with retry immediately on script load
    try {
      syncAndroidStorageToLocalStorageWithRetry(1);
    } catch (e) {}

    async function safelyClearUserCacheOnLogout() {
      debugLog("[Logout Cache Clear] Running data-loss guarded cache cleanup...");
      try {
        if (typeof flushPendingSyncs === 'function') {
          await flushPendingSyncs();
        }
      } catch (fe) {
        console.warn("[Logout Cache Clear] Error flushing pending syncs before logout:", fe);
      }

      const pendingSyncs = getData('ek_pending_syncs', []) || [];
      const pendingOrderIds = new Set(
        pendingSyncs
          .filter(item => item && item.collectionName === 'ek_orders' && item.docId)
          .map(item => item.docId)
      );

      const currentOrders = getData('ek_orders', []) || [];
      if (Array.isArray(currentOrders)) {
        const ordersToKeep = currentOrders.filter(order => order && order.id && pendingOrderIds.has(order.id));
        if (ordersToKeep.length === 0) {
          removeData('ek_orders');
        } else {
          saveData('ek_orders', ordersToKeep);
        }
        if (ordersToKeep.length < currentOrders.length) {
          debugLog(`[Logout Cache Clear] Cleared ${currentOrders.length - ordersToKeep.length} synced orders. Kept ${ordersToKeep.length} pending unsynced orders.`);
        }
      } else {
        removeData('ek_orders');
      }

      const pendingCartSyncs = pendingSyncs.filter(item => item && item.collectionName === 'ek_cart');
      if (pendingCartSyncs.length === 0) {
        cart = [];
        removeData('ek_cart');
      } else {
        console.warn("[Logout Cache Clear] Pending cart syncs exist, retaining local cart until sync completes.");
      }

      removeData('ek_users');
    }

    const renderQuickTestLogins = async () => {
      try {
        const container = document.getElementById('quick-login-container');
        const list = document.getElementById('quick-login-list');
        if (container) container.style.display = 'none';
        return;

        let users = getData('ek_users', []);

        if (users.length === 0 && typeof db !== 'undefined' && db) {
          try {
            const snap = await db.collection('ek_users').limit(15).get();
            if (!snap.empty) {
              snap.forEach(doc => {
                const data = doc.data();
                if (data && data.phone) users.push(data);
              });
              saveData('ek_users', users);
            }
          } catch (err) {
            console.warn("Could not fetch remote users for quick-login preview:", err);
          }
        }

        if (users.length === 0) {
          container.style.display = 'none';
          return;
        }

        container.style.display = 'block';
        list.innerHTML = '';

        const testUsers = users.slice(0, 12);
        testUsers.forEach(u => {
          if (!u.phone || !u.name) return;
          const cleanPh = u.phone.trim();
          const pBadge = document.createElement('div');
          pBadge.style.cssText = `
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.25);
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 11px;
            color: #ffffff;
            cursor: pointer;
            font-weight: 600;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.2s;
            text-align: center;
            min-width: 85px;
          `;
          pBadge.onmouseover = () => { pBadge.style.background = 'rgba(245, 158, 11, 0.22)'; pBadge.style.borderColor = 'rgba(245, 158, 11, 0.5)'; };
          pBadge.onmouseout = () => { pBadge.style.background = 'rgba(245, 158, 11, 0.08)'; pBadge.style.borderColor = 'rgba(245, 158, 11, 0.25)'; };
          pBadge.onclick = () => {
            const idInput = document.getElementById('login-identifier');
            const passInput = document.getElementById('login-password');
            if (idInput) idInput.value = cleanPh;
            if (passInput) passInput.value = cleanPh; // prefill phone number as password directly for convenience!
            showToast(`Auto-filled: ${u.name} (Phone: ${cleanPh}) ✓`, "success");
            passInput.classList.add('pulse');
            setTimeout(() => { passInput.classList.remove('pulse'); }, 1000);
          };
          pBadge.innerHTML = `
            <span style="color: var(--accent-orange); font-size: 10.5px; font-weight: 700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80px;">${u.name}</span>
            <span style="font-size: 9.5px; color: var(--text-muted); margin-top: 1px;">${cleanPh}</span>
          `;
          list.appendChild(pBadge);
        });
      } catch (e) {
        console.error("renderQuickTestLogins error:", e);
      }
    };

    window.renderSharedCartItemCard = function(opts) {
      opts = opts || {};
      const imgUrl = opts.image || 'images/placeholder.jpg';
      const titleText = (typeof escapeHtml === 'function') ? escapeHtml(opts.title || '') : (opts.title || '');
      const subtitleText = opts.subtitle || '';
      const priceVal = opts.totalPrice !== undefined ? opts.totalPrice : 0;
      const qtyText = (typeof escapeHtml === 'function') ? escapeHtml(opts.qtyDisplay || '1') : (opts.qtyDisplay || '1');
      const animDelayStyle = opts.animationDelay ? `animation-delay: ${opts.animationDelay};` : '';
      const extraClass = opts.extraClass ? ` ${opts.extraClass}` : '';

      return `
        <div class="card cart-item-entrance shared-cart-product-card${extraClass}" style="background: #182028; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); ${animDelayStyle}">
          <!-- Row 1: Left Image, Middle Info, Right Price -->
          <div style="display: flex; align-items: flex-start; gap: 10px; width: 100%;">
            <!-- Image (Left) -->
            <img src="${imgUrl}" alt="${titleText}" style="width: 46px; height: 46px; border-radius: 10px; object-fit: cover; background: #222d3a; flex-shrink: 0;" loading="lazy" decoding="async" />

            <!-- Product Info Column (Middle) -->
            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: flex-start;">
              <!-- Product Name -->
              <div style="color: #ffffff; font-size: 13.5px; font-weight: 700; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
                ${titleText}
              </div>

              <!-- Qty/Unit Subtitle -->
              ${subtitleText ? `
                <div style="color: #94a3b8; font-size: 11px; font-weight: 600; line-height: 1.2; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${subtitleText}
                </div>
              ` : ''}

              <!-- Extra Info (e.g. Cut Style, Prep Text, Notes) -->
              ${opts.extraInfoHtml || ''}
            </div>

            <!-- Total Price (Top Right) -->
            <div style="margin-left: auto; text-align: right; flex-shrink: 0; white-space: nowrap; padding-left: 6px;">
              <div style="color: #10b981; font-size: 15px; font-weight: 800; line-height: 1.2;">₹${priceVal}</div>
            </div>
          </div>

          <!-- Row 2: Quantity Controller & Action Buttons -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 8px; margin-top: 2px;">
            <!-- Quantity Controller (- qty +) -->
            <div style="background: #0e1319; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; height: 32px; padding: 0 3px; display: flex; align-items: center; justify-content: space-between; gap: 4px; flex: 1; max-width: 140px; box-sizing: border-box;">
              <button type="button" onclick="${opts.onMinusClick}" style="width: 26px; height: 26px; border-radius: 6px; background: #252e39; border: none; color: #ffffff; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;" title="Decrease Quantity">-</button>
              <span style="color: #ffffff; font-weight: 700; font-size: 11px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${qtyText}</span>
              <button type="button" onclick="${opts.onPlusClick}" style="width: 26px; height: 26px; border-radius: 6px; background: #10b981; border: none; color: #ffffff; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;" title="Increase Quantity">+</button>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              ${opts.extraActionHtml || ''}
              <button type="button" onclick="${opts.onDeleteClick}" style="height: 32px; width: 32px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer;" title="Delete">
                <span style="display: inline-flex; align-items: center; justify-content: center;">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      `;
    };