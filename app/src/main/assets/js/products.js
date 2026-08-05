
    function renderAdminCategoriesList(force = false) {
      const container = document.getElementById('admin-categories-list');
      if (!container) return;

      const isExpanded = force || sessionStorage.getItem('collapse_categories') === 'expanded';
      if (!isExpanded) {
        container.innerHTML = '';
        return;
      }

      const catList = getCategoriesList();

      const badge = document.getElementById('admin-categories-count-badge');
      if (badge) {
        badge.textContent = `${catList.length} ${catList.length === 1 ? 'Category' : 'Categories'}`;
      }

      container.innerHTML = catList.map((c, index) => {
        const isHidden = c.isHidden ? true : false;
        const visibleLabel = isHidden
          ? `<span style="color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">🙈 Hidden / மறைக்கப்பட்டுள்ளது</span>`
          : `<span style="color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">👁️ Visible / பார்வைக்குரியது</span>`;

        return `
          <div class="category-item-card">
            <!-- ROW 1: Identity & Reorder (Max space for names!) -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; width: 100%;">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                <span style="font-size: 24px; padding: 8px; background: ${c.accentColor || '#2E7D32'}15; border-radius: 10px; border: 1.5px solid ${c.accentColor || '#2E7D32'}25; color: ${c.accentColor || '#2E7D32'}; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; box-sizing: border-box; flex-shrink: 0;">${c.icon || '📦'}</span>
                <div style="min-width: 0; flex: 1;">
                  <span style="font-weight: 800; font-size: 16px; color: #ffffff; display: block; word-break: break-word; overflow-wrap: break-word; line-height: 1.4;">
                    ${c.nameTa || c.ta || ''}
                    <span style="font-weight: 500; font-size: 13px; color: var(--text-secondary); display: inline-block; margin-left: 4px;">(${c.nameEn || c.en || ''})</span>
                  </span>
                </div>
              </div>

              <!-- REORDER BUTTONS GROUP (FAR RIGHT) -->
              <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.4); padding: 4px; border: 1.5px solid rgba(255,255,255,0.08); border-radius: 10px; height: 38px; box-sizing: border-box; align-items: center; flex-shrink: 0;">
                <button class="btn" style="padding: 0; margin: 0; font-size: 11px; height: 30px; width: 30px; min-height: 30px; min-width: 30px; display: flex; align-items: center; justify-content: center; background: transparent; color: #94a3b8; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onclick="reorderCategoryItem(${index}, -1)" ${index === 0 ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : 'onmouseover="this.style.color=\'#fff\'; this.style.background=\'rgba(255,255,255,0.08)\'" onmouseout="this.style.color=\'#94a3b8\'; this.style.background=\'transparent\'"'}>▲</button>
                <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.12);"></div>
                <button class="btn" style="padding: 0; margin: 0; font-size: 11px; height: 30px; width: 30px; min-height: 30px; min-width: 30px; display: flex; align-items: center; justify-content: center; background: transparent; color: #94a3b8; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onclick="reorderCategoryItem(${index}, 1)" ${index === catList.length - 1 ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : 'onmouseover="this.style.color=\'#fff\'; this.style.background=\'rgba(255,255,255,0.08)\'" onmouseout="this.style.color=\'#94a3b8\'; this.style.background=\'transparent\'"'}>▼</button>
              </div>
            </div>

            <!-- ROW 2: Status Indicators & Badges -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%; box-sizing: border-box; margin-top: 2px;">
              ${visibleLabel}
              <span style="font-size: 10px; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.08); padding: 3px 10px; border-radius: 8px; font-weight: 800; text-transform: uppercase;">ORDER: ${c.order ?? index}</span>
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 10px; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.08); padding: 3px 10px; border-radius: 8px; font-weight: 800;">
                COLOR: <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${c.accentColor || '#2E7D32'}; border: 1.5px solid rgba(255,255,255,0.25);"></span> ${c.accentColor || '#2E7D32'}
              </span>
            </div>

            <!-- ROW 3: Core Action Buttons (Generous Touch Targets!) -->
            <div style="display: flex; gap: 10px; width: 100%; box-sizing: border-box; margin-top: 4px;">
              <button class="btn" style="flex: 1; font-size: 12.5px; font-weight: 800; min-height: 42px; height: auto; padding: 10px 14px; border-radius: 12px; background: ${isHidden ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)'}; color: ${isHidden ? '#ef4444' : '#10b981'}; border: 1.5px solid ${isHidden ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onclick="toggleCategoryVisibility('${c.id}')">
                <span>${isHidden ? '👁️ Show / காட்டு' : '🙈 Hide / மறை'}</span>
              </button>
              <button class="btn" style="flex: 1; font-size: 12.5px; font-weight: 800; min-height: 42px; height: auto; padding: 10px 14px; border-radius: 12px; background: rgba(255,255,255,0.06); color: #ffffff; border: 1.5px solid rgba(255,255,255,0.12); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" onclick="toggleCategoryEditForm('${c.id}')">
                <span>⚙️ Edit / திருத்து</span>
              </button>
            </div>

            <!-- Expanded Edit Form Section (Hidden by default) -->
            <div id="edit-form-${c.id}" style="display: none; border-top: 1.5px dashed rgba(255,255,255,0.08); padding-top: 14px; margin-top: 8px; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; animation: fadeInSlide 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; width: 100%; box-sizing: border-box;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 10.5px; font-weight: 700; color: var(--text-secondary, #94a3b8); display: block; text-transform: uppercase;">English Name</label>
                  <input type="text" id="edit-cat-en-${c.id}" value="${c.nameEn || c.en || ''}" class="form-control" style="font-size: 12.5px; height: 38px; padding: 6px 12px; background: var(--bg-input, #0f172a); border: 1.5px solid var(--border-color, rgba(255,255,255,0.18)); color: var(--text-primary, #ffffff); border-radius: 8px; width: 100%; box-sizing: border-box;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 10.5px; font-weight: 700; color: var(--text-secondary, #94a3b8); display: block; text-transform: uppercase;">Tamil Name (தமிழ்)</label>
                  <input type="text" id="edit-cat-ta-${c.id}" value="${c.nameTa || c.ta || ''}" class="form-control" style="font-size: 12.5px; height: 38px; padding: 6px 12px; background: var(--bg-input, #0f172a); border: 1.5px solid var(--border-color, rgba(255,255,255,0.18)); color: var(--text-primary, #ffffff); border-radius: 8px; width: 100%; box-sizing: border-box;">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; width: 100%; box-sizing: border-box;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 10.5px; font-weight: 700; color: var(--text-secondary, #94a3b8); display: block; text-transform: uppercase;">Icon / Emoji</label>
                  <input type="text" id="edit-cat-icon-${c.id}" value="${c.icon || ''}" class="form-control" style="font-size: 12.5px; height: 38px; padding: 6px 12px; background: var(--bg-input, #0f172a); border: 1.5px solid var(--border-color, rgba(255,255,255,0.18)); color: var(--text-primary, #ffffff); border-radius: 8px; text-align: center; width: 100%; box-sizing: border-box;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 10.5px; font-weight: 700; color: var(--text-secondary, #94a3b8); display: block; text-transform: uppercase;">Accent (Hex)</label>
                  <input type="text" id="edit-cat-accent-${c.id}" value="${c.accentColor || '#2E7D32'}" class="form-control" style="font-size: 12.5px; height: 38px; padding: 6px 12px; background: var(--bg-input, #0f172a); border: 1.5px solid var(--border-color, rgba(255,255,255,0.18)); color: var(--text-primary, #ffffff); border-radius: 8px; width: 100%; box-sizing: border-box;" placeholder="#2E7D32">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 10.5px; font-weight: 700; color: var(--text-secondary, #94a3b8); display: block; text-transform: uppercase;">Sort Order</label>
                  <input type="number" id="edit-cat-order-${c.id}" value="${c.order ?? index}" class="form-control" style="font-size: 12.5px; height: 38px; padding: 6px 12px; background: var(--bg-input, #0f172a); border: 1.5px solid var(--border-color, rgba(255,255,255,0.18)); color: var(--text-primary, #ffffff); border-radius: 8px; width: 100%; box-sizing: border-box;">
                </div>
              </div>

              <div style="display: flex; gap: 8px; margin-top: 4px; width: 100%; box-sizing: border-box; flex-wrap: wrap;">
                <button class="btn btn-primary" style="flex: 2; min-width: 140px; min-height: 42px; height: auto; padding: 10px 14px; font-size: 13px; font-weight: 800; margin: 0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; cursor: pointer; transition: all 0.2s;" onclick="saveEditedCategory('${c.id}')">
                  <span>💾 Save / சேமி</span>
                </button>
                <button class="btn" style="flex: 1.2; min-width: 100px; min-height: 42px; height: auto; padding: 10px 14px; font-size: 13px; font-weight: 800; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1.5px solid rgba(239, 68, 68, 0.25); margin: 0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onclick="deleteCategoryItem('${c.id}')">
                  <span>🗑️ Delete / நீக்கு</span>
                </button>
                <button class="btn" style="flex: 1; min-width: 90px; min-height: 42px; height: auto; padding: 10px 14px; font-size: 13px; font-weight: 800; background: rgba(255, 255, 255, 0.06); color: #ccc; border: 1.5px solid rgba(255, 255, 255, 0.12); margin: 0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onclick="toggleCategoryEditForm('${c.id}')">
                  <span>❌ Cancel / ரத்து</span>
                </button>
              </div>
            </div>

            <!-- Category Time Scheduler Inline Section -->
            <div style="border-top: 1.5px dashed rgba(255,255,255,0.08); padding-top: 12px; margin-top: 6px; font-size: 11px; display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <label style="display: inline-flex; align-items: center; gap: 10px; color: #e2e8f0; cursor: pointer; font-weight: 600; margin: 0; font-size: 12px; user-select: none; min-height: 32px;">
                  <input type="checkbox" onchange="toggleCategorySchedule('${c.id}', this.checked)" ${c.isScheduled ? 'checked' : ''} style="accent-color: var(--accent-orange); width: 18px; height: 18px; cursor: pointer; margin: 0; flex-shrink: 0;">
                  <span>Enable Time Schedule / நேரக் கட்டுப்பாடு</span>
                </label>
                ${c.isScheduled ? (c.isAvailable ? '<span style="color:#10b981; font-weight:800; background: rgba(16,185,129,0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.25); font-size: 10px;">🟢 Active Now</span>' : '<span style="color:#ef4444; font-weight:800; background: rgba(239,68,68,0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.25); font-size: 10px;">🔴 Scheduled Out</span>') : ''}
              </div>
              <div id="sched-inputs-${c.id}" style="display: ${c.isScheduled ? 'flex' : 'none'}; align-items: center; gap: 10px; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.05); flex-wrap: wrap; width: 100%; box-sizing: border-box; margin-top: 2px;">
                <div style="flex: 1; min-width: 90px;">
                  <label style="font-size: 9.5px; color: #94a3b8; display: block; margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">Start Time</label>
                  <input type="time" value="${c.scheduleStart || '11:00'}" onchange="updateCategoryScheduleTimes('${c.id}', this.value, document.getElementById('sched-end-${c.id}').value)" id="sched-start-${c.id}" style="width: 100%; background: #0f172a; border: 1.5px solid rgba(255,255,255,0.08); color: #ffffff; padding: 6px 8px; border-radius: 8px; font-size: 11.5px; outline: none; height: 36px; box-sizing: border-box;">
                </div>
                <div style="flex: 1; min-width: 90px;">
                  <label style="font-size: 9.5px; color: #94a3b8; display: block; margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">End Time</label>
                  <input type="time" value="${c.scheduleEnd || '15:00'}" onchange="updateCategoryScheduleTimes('${c.id}', document.getElementById('sched-start-${c.id}').value, this.value)" id="sched-end-${c.id}" style="width: 100%; background: #0f172a; border: 1.5px solid rgba(255,255,255,0.08); color: #ffffff; padding: 6px 8px; border-radius: 8px; font-size: 11.5px; outline: none; height: 36px; box-sizing: border-box;">
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function toggleCategoryEditForm(id) {
      const el = document.getElementById(`edit-form-${id}`);
      if (el) {
        el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'flex' : 'none';
      }
    }

    function saveEditedCategory(id) {
      const btn = (typeof event !== 'undefined' && event && event.target) ? event.target.closest('button, .btn') : document.querySelector(`button[onclick*="saveEditedCategory('${id}')"]`);
      if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, true);
      try {
        const enVal = document.getElementById(`edit-cat-en-${id}`).value.trim();
        const taVal = document.getElementById(`edit-cat-ta-${id}`).value.trim();
        const iconVal = document.getElementById(`edit-cat-icon-${id}`).value.trim() || '📦';
        const accentVal = document.getElementById(`edit-cat-accent-${id}`).value.trim() || '#2E7D32';
        const orderVal = parseInt(document.getElementById(`edit-cat-order-${id}`).value.trim()) || 0;

        if (!enVal || !taVal) {
          showToast("Please enter English and Tamil names", "error");
          return;
        }

        const catList = getCategoriesList();
        const matched = catList.find(c => c.id === id);
        if (matched) {
          matched.nameEn = enVal;
          matched.en = enVal;
          matched.nameTa = taVal;
          matched.ta = taVal;
          matched.icon = iconVal;
          matched.accentColor = accentVal;
          matched.order = orderVal;
          matched.updatedAt = new Date().toISOString();

          catList.sort((a, b) => {
            const orderA = Number(a.order !== undefined && a.order !== null ? a.order : 999);
            const orderB = Number(b.order !== undefined && b.order !== null ? b.order : 999);
            if (orderA !== orderB) return orderA - orderB;
            return String(a.id || "").localeCompare(String(b.id || ""));
          });
          catList.forEach((c, idx) => {
            c.order = idx;
          });

          saveData('ek_categories', catList);
          invalidateDataCache('ek_categories');

          if (typeof db !== 'undefined' && db) {
            try {
              const batch = db.batch();
              catList.forEach(c => {
                const ref = db.collection('ek_categories').doc(c.id);
                batch.set(ref, cleanFirestoreData(c));
              });
              batch.commit()
                .then(() => debugLog("[Cloud Sync] Category order batch write success on save"))
                .catch(e => console.error("[Cloud Sync] Category batch failed on save:", e));
            } catch(batchErr) {
              catList.forEach(c => {
                db.collection('ek_categories').doc(c.id).set(cleanFirestoreData(c)).catch(e => {});
              });
            }
          }

          showToast("Category updated successfully!", "success");
          renderAdminDashboard();
          renderCategoryPills();
          if (typeof populateProductCategoryOptions === 'function') {
            populateProductCategoryOptions();
          }
        }
      } finally {
        if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, false);
      }
    }

    function deleteCategoryItem(id) {
      const btn = (typeof event !== 'undefined' && event && event.target) ? event.target.closest('button, .btn') : document.querySelector(`button[onclick*="deleteCategoryItem('${id}')"]`);
      if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, true);
      try {
        const products = typeof getDataCached === 'function' ? getDataCached('ek_products', []) : getData('ek_products', []);
        const hasProducts = products.some(p => String(p.category || '').toLowerCase().trim() === String(id).toLowerCase().trim());
        if (hasProducts) {
          showToast("Cannot delete category because products are associated with it!", "error");
          showAdminSuccessModal(
            "⚠️ நீக்க முடியாது! / Cannot Delete",
            `இந்த பிரிவில் தயாரிப்புகள் (Products) இருப்பதால் இதை நீக்க முடியாது. தயவுசெய்து தயாரிப்புகளை வேறு பிரிவிற்கு மாற்றிய பின் நீக்கவும்.<br><br><span style="font-size:11.5px;color:var(--text-muted);">This category contains active products and cannot be deleted.</span>`
          );
          return;
        }

        const catList = getCategoriesList();
        const idx = catList.findIndex(c => c.id === id);
        if (idx !== -1) {
          const deleted = catList.splice(idx, 1);
          saveData('ek_categories', catList);
          _categoriesListCachedValue = null; // Clear cache

          if (typeof db !== 'undefined' && db) {
            db.collection('ek_categories').doc(id).delete()
              .then(() => debugLog(`[Cloud Sync] Category ${id} deleted from Firestore`))
              .catch(e => console.error(e));
          }

          showToast("Category deleted successfully!", "success");
          renderAdminDashboard();
          renderCategoryPills();
          if (typeof populateProductCategoryOptions === 'function') {
            populateProductCategoryOptions();
          }
        }
      } finally {
        if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, false);
      }
    }

    function toggleCategoryVisibility(id) {
      const catList = getCategoriesList();
      const matched = catList.find(c => c.id === id);
      if (matched) {
        matched.isHidden = !matched.isHidden;
        matched.updatedAt = new Date().toISOString();
        saveData('ek_categories', catList);

        if (typeof db !== 'undefined' && db) {
          db.collection('ek_categories').doc(id).set(cleanFirestoreData(matched))
            .then(() => debugLog(`[Cloud Sync] Category ${id} visibility written to cloud`))
            .catch(e => console.error(e));
        }

        showToast("Category visibility updated successfully!", "success");
        showAdminSuccessModal(
          "👁️ வெற்றிகரமாக மாற்றி அமைக்கப்பட்டது!",
          `பிரிவு <strong>${matched.nameTa} (${matched.nameEn})</strong>-இன் பார்வை நிலை (Visibility Status) வெற்றிகரமாக மாற்றி அமைக்கப்பட்டது.<br><br><span style="font-size:11.5px;color:var(--text-muted);">Successfully Updated! Category visibility status has been modified.</span>`
        );
        renderAdminDashboard();
        renderCategoryPills();
      }
    }

    function updateCategoryAvailability(c) {
      if (!c.isScheduled) {
        c.isAvailable = true;
        return;
      }
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const start = normalizeTimeStr(c.scheduleStart, "11:00");
      const end = normalizeTimeStr(c.scheduleEnd, "15:00");
      if (start <= end) {
        c.isAvailable = (currentTimeStr >= start && currentTimeStr <= end);
      } else {
        c.isAvailable = (currentTimeStr >= start || currentTimeStr <= end);
      }
    }

    function toggleCategorySchedule(id, isScheduled) {
      const catList = getCategoriesList();
      const matched = catList.find(c => c.id === id);
      if (matched) {
        matched.isScheduled = isScheduled;
        if (!matched.scheduleStart) matched.scheduleStart = "11:00";
        if (!matched.scheduleEnd) matched.scheduleEnd = "15:00";
        matched.updatedAt = new Date().toISOString();
        updateCategoryAvailability(matched);
        saveData('ek_categories', catList);
        if (typeof db !== 'undefined' && db) {
          db.collection('ek_categories').doc(id).set(cleanFirestoreData(matched)).catch(e => console.error(e));
        }
        renderAdminCategoriesList();
        if (typeof renderCategoryPills === 'function') renderCategoryPills();
      }
    }

    function updateCategoryScheduleTimes(id, start, end) {
      const catList = getCategoriesList();
      const matched = catList.find(c => c.id === id);
      if (matched) {
        matched.scheduleStart = start;
        matched.scheduleEnd = end;
        matched.updatedAt = new Date().toISOString();
        updateCategoryAvailability(matched);
        saveData('ek_categories', catList);
        if (typeof db !== 'undefined' && db) {
          db.collection('ek_categories').doc(id).set(cleanFirestoreData(matched)).catch(e => console.error(e));
        }
      }
    }

    function reorderCategoryItem(index, direction) {
      _categoriesListCachedValue = null;
      const catList = getCategoriesList();
      const targetIndex = index + direction;

      if (targetIndex >= 0 && targetIndex < catList.length) {
        const temp = catList[index];
        catList[index] = catList[targetIndex];
        catList[targetIndex] = temp;

        catList.forEach((c, idx) => {
          c.order = idx;
          c.updatedAt = new Date().toISOString();
        });

        _categoriesListCachedValue = null;
        _lastCategoryPillsHash = '';
        _lastDataSnapshotHash = '';
        saveData('ek_categories', catList);

        if (typeof db !== 'undefined' && db) {
          try {
            const batch = db.batch();
            catList.forEach(c => {
              const ref = db.collection('ek_categories').doc(c.id);
              batch.set(ref, cleanFirestoreData(c));
            });
            batch.commit()
              .then(() => debugLog("[Cloud Sync] Category order batch write success"))
              .catch(e => console.error("[Cloud Sync] Category order batch write failed", e));
          } catch (batchErr) {
            console.error("[Cloud Sync] Category order batch error, falling back to sequential set", batchErr);
            catList.forEach(c => {
              db.collection('ek_categories').doc(c.id).set(cleanFirestoreData(c)).catch(e => {});
            });
          }
        }

        showToast("Category order updated!", "success");
        renderAdminDashboard();
        renderCategoryPills();
        if (typeof renderHomeScreenProducts === 'function') {
          renderHomeScreenProducts(true);
        }
      }
    }

    async function handleCreateCategory(event) {
      if (event) event.preventDefault();

      const enInput = document.getElementById('new-cat-en');
      const taInput = document.getElementById('new-cat-ta');
      const iconInput = document.getElementById('new-cat-icon');
      const accentInput = document.getElementById('new-cat-accent');
      if (!enInput || !taInput || !iconInput) return;

      const en = enInput.value.trim();
      const ta = taInput.value.trim();
      const icon = iconInput.value.trim() || '🥩';
      const accentColor = (accentInput && accentInput.value.trim()) || '#2E7D32';

      if (!en || !ta) {
        showToast("Please enter both English and Tamil names", "error");
        return;
      }

      const list = getData('ek_categories', []);
      const newId = 'cat_' + Date.now();
      const newCat = {
        id: newId,
        en: en,
        ta: ta,
        nameEn: en,
        nameTa: ta,
        icon: icon,
        accentColor: accentColor,
        order: list.length,
        isScheduled: false,
        scheduleStart: "11:00",
        scheduleEnd: "15:00",
        isAvailable: true,
        createdAt: Date.now(),
        updatedAt: new Date().toISOString()
      };

      list.push(newCat);
      saveData('ek_categories', list);

      if (typeof db !== 'undefined' && db) {
        db.collection('ek_categories').doc(newId).set(cleanFirestoreData(newCat))
          .catch(e => console.error(e));
      }

      enInput.value = '';
      taInput.value = '';
      iconInput.value = '';
      if (accentInput) accentInput.value = '';

      showToast("🎉 New category created successfully!", "success");
      showAdminSuccessModal(
        "🎉 வெற்றிகரமாக உருவாக்கப்பட்டது!",
        `புதிய பிரிவு (Category) <strong>${ta} (${en})</strong> வெற்றிகரமாக உருவாக்கப்பட்டு உங்கள் கடையில் இணைக்கப்பட்டது.<br><br><span style="font-size:11.5px;color:var(--text-muted);">Successfully Created! The new category has been added.</span>`
      );

      if (typeof populateProductCategoryOptions === 'function') {
        populateProductCategoryOptions();
      }

      renderAdminDashboard();
      renderCategoryPills();
    }

    function hideHomeSuggestions() {
      if (window.homeSuggestionsTimeoutId) {
        clearTimeout(window.homeSuggestionsTimeoutId);
      }
      window.homeSuggestionsTimeoutId = setTimeout(() => {
        const suggestionsDiv = document.getElementById('home-search-suggestions');
        if (suggestionsDiv) {
          suggestionsDiv.style.display = 'none';
        }
      }, 250);
    }

    let _homeSearchDebounceTimer = null;
    function onHomeSearchInput() {
      if (window.homeSuggestionsTimeoutId) {
        clearTimeout(window.homeSuggestionsTimeoutId);
      }

      const searchBox = document.getElementById('home-product-search');
      if (!searchBox) return;

      const clearBtn = document.getElementById('home-search-clear-btn');
      if (clearBtn) {
        clearBtn.style.display = searchBox.value ? 'block' : 'none';
      }

      if (_homeSearchDebounceTimer) {
        clearTimeout(_homeSearchDebounceTimer);
      }

      _homeSearchDebounceTimer = setTimeout(() => {
        const query = searchBox.value.trim().toLowerCase();
        const suggestionsDiv = document.getElementById('home-search-suggestions');

        renderHomeScreenProducts();

        if (!suggestionsDiv) return;

        if (!query) {
          suggestionsDiv.style.display = 'none';
          return;
        }

        const products = getDataCached('ek_products', []).filter(p => !p.isHidden);

        const matches = products.filter(p => {
        const enName = (p.englishName || '').toLowerCase();
        const taName = (p.tamilName || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();

        let customMatch = false;
        if (query === 'mutton' || query === 'மட்டன்' || query === 'ஆடு' || query === 'goat') {
          customMatch = cat.includes('mutton') || enName.includes('mutton') || taName.includes('ஆடு') || taName.includes('மட்டன்');
        } else if (query === 'chicken' || query === 'சிக்கன்' || query === 'கோழி') {
          customMatch = cat.includes('chicken') || enName.includes('chicken') || taName.includes('கோழி') || taName.includes('சிக்கன்');
        } else if (query === 'fish' || query === 'மீன்') {
          customMatch = cat.includes('fish') || enName.includes('fish') || taName.includes('மீன்');
        } else if (query === 'beef' || query === 'மாடு' || query === 'மாட்டிறைச்சி') {
          customMatch = cat.includes('beef') || enName.includes('beef') || taName.includes('மாடு') || taName.includes('மாட்டிறைச்சி');
        }

        return enName.includes(query) || taName.includes(query) || cat.includes(query) || customMatch;
      }).slice(0, 6);

      if (matches.length === 0) {
        suggestionsDiv.innerHTML = `
          <div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 12.5px;">
            ${currentLang === 'ta' ? '🔍 தேடலுக்குப் பொருத்தமான பொருட்கள் இல்லை...' : '🔍 No matching items found...'}
          </div>
        `;
        suggestionsDiv.style.display = 'block';
        return;
      }

      let html = '';
      matches.forEach(p => {
        updateProductAvailability(p); const isOutOfStock = p.isOutOfStock || p.stockKg <= 0 || (p.isScheduled && p.isAvailable === false);
        const nameText = currentLang === 'ta' ? p.tamilName : cleanProductName(p.englishName);
        const subText = currentLang === 'ta' ? cleanProductName(p.englishName) : p.tamilName;
        const priceText = getProductPriceText(p, currentLang);

        html += `
          <div class="search-suggestion-item"
               style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 10px; cursor: pointer; transition: all 0.2s; gap: 10px;"
               onmouseenter="this.style.background='rgba(245,158,11,0.08)'"
               onmouseleave="this.style.background='transparent'"
               onmousedown="selectHomeSearchSuggestion('${p.id}', '${nameText.replace(/'/g, "\\'")}')">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex-grow: 1;">
              <img src="${getImageUrlWithCacheBuster(getProductThumbnailUrl(p), p.updatedAt)}" width="36" height="36" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;" loading="lazy" decoding="async" />
              <div style="min-width: 0; display: flex; flex-direction: column;">
                <span style="font-size: 13px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nameText}</span>
                <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subText}</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
              <span style="font-size: 12.5px; font-weight: 800; color: var(--accent-orange);">${priceText}</span>
              ${isOutOfStock ? `<span style="font-size: 9px; color: var(--accent-red); font-weight: 700;">OUT OF STOCK</span>` : `<span style="font-size: 9px; color: #10b981; font-weight: 700;">AVAILABLE</span>`}
            </div>
          </div>
        `;
      });

      suggestionsDiv.innerHTML = html;
      suggestionsDiv.style.display = 'block';
    }, 200);
  }

    function selectHomeSearchSuggestion(productId, name) {
      const searchBox = document.getElementById('home-product-search');
      if (searchBox) {
        searchBox.value = name;
      }
      const suggestionsDiv = document.getElementById('home-search-suggestions');
      if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
      }
      renderHomeScreenProducts();
      openProductModalDetail(productId);
    }

    let _homeRenderTimer = null;
    function scheduleHomeRender(force = false) {
      if (_homeRenderTimer) clearTimeout(_homeRenderTimer);
      _homeRenderTimer = setTimeout(() => {
        _homeRenderTimer = null;
        if (typeof currentScreen !== 'undefined' && currentScreen === 'screen-home') {
          renderHomeScreen(force);
        }
      }, 100);
    }

    
let _currentCarouselIndex = 0;
let _carouselAutoTimer = null;

function renderSlidingBanners() {
  const container = document.getElementById('home-sliding-carousel');
  const outerWrapper = document.getElementById('carousel-outer-wrapper');
  if (!container) return;

  const settings = (typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS)) || {};
  let banners = [];
  if (settings && Array.isArray(settings.slidingBanners) && settings.slidingBanners.length > 0) {
    banners = settings.slidingBanners;
  }
  if ((!banners || banners.length === 0) && typeof DEFAULT_SETTINGS !== 'undefined' && Array.isArray(DEFAULT_SETTINGS.slidingBanners)) {
    banners = DEFAULT_SETTINGS.slidingBanners;
  }

  if (!banners || banners.length === 0) {
    if (outerWrapper) outerWrapper.style.display = 'none';
    return;
  }
  if (outerWrapper) outerWrapper.style.display = 'block';

  const hash = JSON.stringify(banners) + '_' + (typeof currentLang !== 'undefined' ? currentLang : 'en');
  if (window._lastBannersHash === hash && container.children.length > 0) {
    return;
  }
  window._lastBannersHash = hash;

  let html = '';
  banners.forEach((b, idx) => {
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
    const title = lang === 'ta' ? (b.titleTa || b.titleEn || '') : (b.titleEn || b.titleTa || '');
    const sub = lang === 'ta' ? (b.subTa || b.subEn || '') : (b.subEn || b.subTa || '');
    const imgUrl = b.image || 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800';
    html += `
      <div class="carousel-slide" style="min-width: 100%; flex: 0 0 100%; position: relative; height: 140px; overflow: hidden; border-radius: 20px;">
        <img src="${imgUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75);" loading="eager" decoding="async" onError="this.onerror=null;this.src='https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800';" />
        <div style="position: absolute; bottom: 0; left: 0; right: 0; top: 0; background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%); padding: 14px 16px; display: flex; flex-direction: column; justify-content: flex-end;">
          ${title ? `<h3 style="color: #ffffff; font-size: 15px; font-weight: 800; margin: 0 0 2px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${title}</h3>` : ''}
          ${sub ? `<p style="color: rgba(255,255,255,0.88); font-size: 11px; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.6); line-height: 1.3;">${sub}</p>` : ''}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;

  const dotsContainer = document.getElementById('carousel-dots-container');
  if (dotsContainer) {
    let dotsHtml = '';
    banners.forEach((_, idx) => {
      dotsHtml += `<div id="carousel-dot-${idx}" onclick="goToCarouselSlide(${idx})" style="width: ${idx === 0 ? '18px' : '6px'}; height: 6px; border-radius: 3px; background: ${idx === 0 ? '#10b981' : 'rgba(255,255,255,0.4)'}; transition: all 0.3s ease; cursor: pointer;"></div>`;
    });
    dotsContainer.innerHTML = dotsHtml;
  }

  _currentCarouselIndex = 0;
  updateCarouselPosition();
  startCarouselAutoSlide(banners.length);
}

function updateCarouselPosition() {
  const container = document.getElementById('home-sliding-carousel');
  if (!container) return;
  container.style.transform = `translate3d(-${_currentCarouselIndex * 100}%, 0, 0)`;

  const dotsContainer = document.getElementById('carousel-dots-container');
  if (dotsContainer) {
    const children = dotsContainer.children;
    for (let i = 0; i < children.length; i++) {
      if (i === _currentCarouselIndex) {
        children[i].style.width = '18px';
        children[i].style.background = '#10b981';
      } else {
        children[i].style.width = '6px';
        children[i].style.background = 'rgba(255,255,255,0.4)';
      }
    }
  }
}

function slideCarouselNext() {
  const container = document.getElementById('home-sliding-carousel');
  if (!container || !container.children.length) return;
  const count = container.children.length;
  _currentCarouselIndex = (_currentCarouselIndex + 1) % count;
  updateCarouselPosition();
}

function slideCarouselPrev() {
  const container = document.getElementById('home-sliding-carousel');
  if (!container || !container.children.length) return;
  const count = container.children.length;
  _currentCarouselIndex = (_currentCarouselIndex - 1 + count) % count;
  updateCarouselPosition();
}

function goToCarouselSlide(index) {
  _currentCarouselIndex = index;
  updateCarouselPosition();
}

function startCarouselAutoSlide(count) {
  if (_carouselAutoTimer) clearInterval(_carouselAutoTimer);
  if (count <= 1) return;
  _carouselAutoTimer = setInterval(() => {
    slideCarouselNext();
  }, 4000);
}

window._editingBannerId = null;

function compressAndCacheBannerImage(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Str = e.target.result;
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      
      const urlInp = document.getElementById('admin-banner-url-input');
      const previewImg = document.getElementById('admin-banner-preview-img');
      const previewContainer = document.getElementById('admin-banner-preview-container');
      if (urlInp) urlInp.value = compressed;
      if (previewImg) previewImg.src = compressed;
      if (previewContainer) previewContainer.style.display = 'block';
    };
    img.src = base64Str;
  };
  reader.readAsDataURL(file);
}

function updateAdminBannerUrlPreview() {
  const urlInp = document.getElementById('admin-banner-url-input');
  const previewImg = document.getElementById('admin-banner-preview-img');
  const previewContainer = document.getElementById('admin-banner-preview-container');
  if (urlInp && previewImg && previewContainer) {
    const val = urlInp.value.trim();
    if (val) {
      previewImg.src = val;
      previewContainer.style.display = 'block';
    } else {
      previewContainer.style.display = 'none';
    }
  }
}

function deleteSelectedBannerPhoto() {
  const fileInp = document.getElementById('admin-banner-file-input');
  const urlInp = document.getElementById('admin-banner-url-input');
  const previewImg = document.getElementById('admin-banner-preview-img');
  const previewContainer = document.getElementById('admin-banner-preview-container');
  if (fileInp) fileInp.value = '';
  if (urlInp) urlInp.value = '';
  if (previewImg) previewImg.src = '';
  if (previewContainer) previewContainer.style.display = 'none';
}

function addNewSlidingBanner() {
  const urlInp = document.getElementById('admin-banner-url-input');
  const previewImg = document.getElementById('admin-banner-preview-img');
  const titleTaInp = document.getElementById('admin-banner-title-ta');
  const titleEnInp = document.getElementById('admin-banner-title-en');
  const subTaInp = document.getElementById('admin-banner-sub-ta');
  const subEnInp = document.getElementById('admin-banner-sub-en');

  let imgUrl = (urlInp ? urlInp.value.trim() : '') || (previewImg ? previewImg.src : '');
  if (!imgUrl) {
    showToast(typeof currentLang !== 'undefined' && currentLang === 'ta' ? "தயவுசெய்து விளம்பரப் படத்தை தேர்ந்தெடுக்கவும்!" : "Please choose or enter a banner image!", "warning");
    return;
  }

  const titleTa = titleTaInp ? titleTaInp.value.trim() : '';
  const titleEn = titleEnInp ? titleEnInp.value.trim() : '';
  const subTa = subTaInp ? subTaInp.value.trim() : '';
  const subEn = subEnInp ? subEnInp.value.trim() : '';

  let settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS);
  if (!settings) settings = { ...DEFAULT_SETTINGS };
  if (!Array.isArray(settings.slidingBanners)) settings.slidingBanners = [];

  if (window._editingBannerId) {
    const idx = settings.slidingBanners.findIndex(b => b && b.id === window._editingBannerId);
    if (idx >= 0) {
      settings.slidingBanners[idx] = {
        ...settings.slidingBanners[idx],
        image: imgUrl,
        titleTa: titleTa,
        titleEn: titleEn,
        subTa: subTa,
        subEn: subEn
      };
    }
  } else {
    if (settings.slidingBanners.length >= 10) {
      showToast(typeof currentLang !== 'undefined' && currentLang === 'ta' ? "அதிகபட்சமாக 10 பேனர்கள் மட்டுமே சேர்க்க முடியும்!" : "Maximum 10 banners allowed!", "warning");
      return;
    }
    settings.slidingBanners.push({
      id: 'b_' + Date.now(),
      image: imgUrl,
      titleTa: titleTa,
      titleEn: titleEn,
      subTa: subTa,
      subEn: subEn
    });
  }

  settings.updatedAt = new Date().toISOString();
  settings._isAdminModified = true;

  saveData('ek_settings', settings);
  if (typeof invalidateDataCache === 'function') invalidateDataCache('ek_settings');
  window._lastBannersHash = '';

  if (typeof db !== 'undefined' && db) {
    try {
      db.collection('ek_settings').doc('global_config').set(cleanFirestoreData(settings))
        .then(() => debugLog('[Banner Admin] Saved banner settings to Firestore'))
        .catch(err => console.error('[Banner Admin] Firestore save error:', err));
    } catch(e) {}
  }

  cancelEditSlidingBanner();
  renderAdminBannerList(true);
  renderSlidingBanners();

  showToast(typeof currentLang !== 'undefined' && currentLang === 'ta' ? "ஸ்லைடிங் பேனர் வெற்றிகரமாக சேமிக்கப்பட்டது! 🖼️" : "Sliding banner saved successfully! 🖼️", "success");
}

function editSlidingBanner(bannerId) {
  let settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS);
  if (!settings || !Array.isArray(settings.slidingBanners)) return;

  const b = settings.slidingBanners.find(x => x && x.id === bannerId);
  if (!b) return;

  window._editingBannerId = bannerId;

  const urlInp = document.getElementById('admin-banner-url-input');
  const previewImg = document.getElementById('admin-banner-preview-img');
  const previewContainer = document.getElementById('admin-banner-preview-container');
  const titleTaInp = document.getElementById('admin-banner-title-ta');
  const titleEnInp = document.getElementById('admin-banner-title-en');
  const subTaInp = document.getElementById('admin-banner-sub-ta');
  const subEnInp = document.getElementById('admin-banner-sub-en');
  const formTitle = document.getElementById('admin-banner-form-title');
  const submitBtn = document.getElementById('admin-banner-submit-btn');
  const cancelBtn = document.getElementById('admin-banner-cancel-btn');

  if (urlInp) urlInp.value = b.image || '';
  if (previewImg) previewImg.src = b.image || '';
  if (previewContainer) previewContainer.style.display = b.image ? 'block' : 'none';

  if (titleTaInp) titleTaInp.value = b.titleTa || '';
  if (titleEnInp) titleEnInp.value = b.titleEn || '';
  if (subTaInp) subTaInp.value = b.subTa || '';
  if (subEnInp) subEnInp.value = b.subEn || '';

  if (formTitle) formTitle.innerText = "✏️ பேனர் திருத்த / Edit Banner";
  if (submitBtn) submitBtn.innerHTML = "<span>💾 UPDATE CAROUSEL</span>";
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  const formSection = document.getElementById('admin-banner-form-title');
  if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelEditSlidingBanner() {
  window._editingBannerId = null;
  deleteSelectedBannerPhoto();

  const titleTaInp = document.getElementById('admin-banner-title-ta');
  const titleEnInp = document.getElementById('admin-banner-title-en');
  const subTaInp = document.getElementById('admin-banner-sub-ta');
  const subEnInp = document.getElementById('admin-banner-sub-en');
  const formTitle = document.getElementById('admin-banner-form-title');
  const submitBtn = document.getElementById('admin-banner-submit-btn');
  const cancelBtn = document.getElementById('admin-banner-cancel-btn');

  if (titleTaInp) titleTaInp.value = '';
  if (titleEnInp) titleEnInp.value = '';
  if (subTaInp) subTaInp.value = '';
  if (subEnInp) subEnInp.value = '';

  if (formTitle) formTitle.innerText = "⚡ புதிய பேனர் சேர்க்க / Add New Slide";
  if (submitBtn) submitBtn.innerHTML = "<span>➕ ADD TO CAROUSEL</span>";
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function deleteSlidingBanner(bannerId) {
  const btn = (typeof event !== 'undefined' && event && event.target) ? event.target.closest('button, .btn') : document.querySelector(`button[onclick*="deleteSlidingBanner('${bannerId}')"]`);
  if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, true);
  try {
    let settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS);
    if (!settings) settings = { ...DEFAULT_SETTINGS };
    if (!Array.isArray(settings.slidingBanners)) settings.slidingBanners = [];

    settings.slidingBanners = settings.slidingBanners.map((b, i) => {
      if (!b) return null;
      return {
        ...b,
        id: b.id || ('b_' + (i + 1))
      };
    }).filter(Boolean);

    settings.slidingBanners = settings.slidingBanners.filter(b => b.id !== bannerId && String(b.id) !== String(bannerId));
    settings.updatedAt = new Date().toISOString();
    settings._isAdminModified = true;

    saveData('ek_settings', settings);
    if (typeof invalidateDataCache === 'function') invalidateDataCache('ek_settings');
    window._lastBannersHash = '';

    if (typeof db !== 'undefined' && db) {
      try {
        db.collection('ek_settings').doc('global_config').set(cleanFirestoreData(settings))
          .then(() => debugLog('[Banner Admin] Saved banner deletion to Firestore'))
          .catch(err => console.error('[Banner Admin] Firestore deletion save error:', err));
      } catch(e) {}
    }

    if (window._editingBannerId === bannerId) {
      cancelEditSlidingBanner();
    }

    renderAdminBannerList(true);
    renderSlidingBanners();

    showToast(typeof currentLang !== 'undefined' && currentLang === 'ta' ? "பானர் நீக்கப்பட்டது ✓" : "Banner removed ✓", "info");
  } finally {
    if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, false);
  }
}

window.compressAndCacheBannerImage = compressAndCacheBannerImage;
window.updateAdminBannerUrlPreview = updateAdminBannerUrlPreview;
window.deleteSelectedBannerPhoto = deleteSelectedBannerPhoto;
window.addNewSlidingBanner = addNewSlidingBanner;
window.editSlidingBanner = editSlidingBanner;
window.cancelEditSlidingBanner = cancelEditSlidingBanner;
window.deleteSlidingBanner = deleteSlidingBanner;
window.renderAdminBannerList = renderAdminBannerList;
window.renderAdminCategoriesList = renderAdminCategoriesList;
window.handleCreateCategory = handleCreateCategory;
window.saveEditedCategory = saveEditedCategory;
window.deleteCategoryItem = deleteCategoryItem;
window.toggleCategoryVisibility = toggleCategoryVisibility;
window.toggleCategoryEditForm = toggleCategoryEditForm;
window.toggleCategorySchedule = toggleCategorySchedule;
window.updateCategoryScheduleTimes = updateCategoryScheduleTimes;
window.reorderCategoryItem = reorderCategoryItem;

function renderAdminBannerList(force = false) {
  const listEl = document.getElementById('admin-banner-list');
  const badgeEl = document.getElementById('admin-carousel-count-badge');
  if (!listEl) return;

  const isCloudSynced = window._hasFreshCloudData || window._hasFreshSettings || getData('ek_settings_synced') === true || getData('ek_cloud_synced') === true;
  const settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS);
  let banners = [];
  if (settings && Array.isArray(settings.slidingBanners)) {
    banners = settings.slidingBanners;
  } else if (!isCloudSynced && typeof DEFAULT_SETTINGS !== 'undefined' && Array.isArray(DEFAULT_SETTINGS.slidingBanners)) {
    banners = DEFAULT_SETTINGS.slidingBanners;
  }

  if (badgeEl) badgeEl.innerText = `${banners.length} Slides`;

  if (!banners || banners.length === 0) {
    listEl.innerHTML = `<p style="color: var(--text-secondary); font-size: 12px; text-align: center; padding: 12px;">No sliding banners created yet.</p>`;
    return;
  }

  function reorderSlidingBanner(index, dir) {
    let settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : {};
    let banners = settings.slidingBanners || [];
    if (!Array.isArray(banners) || banners.length < 2) return;
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const temp = banners[index];
    banners[index] = banners[newIndex];
    banners[newIndex] = temp;

    settings.slidingBanners = banners;
    if (typeof saveData === 'function') saveData('ek_settings', settings);
    if (typeof db !== 'undefined' && db) {
      db.collection('ek_settings').doc('global_config').set({ slidingBanners: banners }, { merge: true })
        .catch(err => console.error("Error saving reordered banners:", err));
    }
    renderAdminBannerList();
    if (typeof renderSlidingBanners === 'function') renderSlidingBanners(true);
  }
  window.reorderSlidingBanner = reorderSlidingBanner;

  let html = '';
  banners.forEach((b, idx) => {
    if (!b) return;
    const bId = b.id || ('b_' + (idx + 1));
    const titleText = (b.titleTa || b.titleEn || ('Banner #' + (idx+1))).replace(/"/g, '&quot;');
    const subText = (b.subTa || b.subEn || '').replace(/"/g, '&quot;');
    html += `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; width: 100%;">
        <img src="${b.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" onError="this.onerror=null;this.src='https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800';" />
        <div style="flex: 1; min-width: 0;">
          <div style="color: var(--text-primary); font-size: 12.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titleText}</div>
          <div style="color: var(--text-secondary); font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subText}</div>
        </div>
        <div style="display: flex; gap: 2px; background: rgba(0,0,0,0.4); padding: 3px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; align-items: center; flex-shrink: 0;">
          <button type="button" class="btn" style="padding: 0; margin: 0; font-size: 10px; height: 26px; width: 26px; min-height: 26px; min-width: 26px; display: flex; align-items: center; justify-content: center; background: transparent; color: #94a3b8; border: none; border-radius: 6px; cursor: pointer;" onclick="reorderSlidingBanner(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>▲</button>
          <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.12);"></div>
          <button type="button" class="btn" style="padding: 0; margin: 0; font-size: 10px; height: 26px; width: 26px; min-height: 26px; min-width: 26px; display: flex; align-items: center; justify-content: center; background: transparent; color: #94a3b8; border: none; border-radius: 6px; cursor: pointer;" onclick="reorderSlidingBanner(${idx}, 1)" ${idx === banners.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>▼</button>
        </div>
        <button type="button" onclick="editSlidingBanner('${bId}')" style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0;">Edit</button>
        <button type="button" onclick="deleteSlidingBanner('${bId}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0;">Delete</button>
      </div>
    `;
  });
  listEl.innerHTML = html;
}
function renderHomeScreen(forceReRender = false) {
      _categoriesListCachedValue = null;
      window._categoriesListCachedValue = null;
      if (forceReRender) {
        _lastBannersHash = '';
        _lastCategoryPillsHash = '';
        _lastDataSnapshotHash = '';
        _lastSpecialsHash = '';
      }
      try {
        localStorage.setItem('hide_hero_banner', 'false');
        localStorage.setItem('hide_specials_section', 'false');
        const carousel = document.getElementById('carousel-outer-wrapper');
        if (carousel) carousel.style.display = 'block';
        const specialsSec = document.getElementById('specials-section');
        if (specialsSec) specialsSec.style.display = 'block';
        const specialsWrap = document.getElementById('specials-collapse-wrapper');
        if (specialsWrap) specialsWrap.style.display = 'block';
      } catch (e) {}

      const debugProds = typeof getDataCached === 'function' ? getDataCached('ek_products', []) : getData('ek_products', []);
      const debugCats = typeof getCategoriesList === 'function' ? getCategoriesList() : [];
      debugLog('[Home Debug] Products count:', debugProds.length, 'Categories count:', debugCats.length);

      try {
        const config = getCategoryConfig(activeCategory);
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
          homeScreen.style.setProperty('--category-accent-color', config.color);
        }
      } catch (e) {
        console.warn("[renderHomeScreen] Failed to set initial accent color:", e);
      }
      try {
        renderSlidingBanners();
      } catch (carouselErr) {
        console.error("renderSlidingBanners failed:", carouselErr);
      }

      try {
        renderCategoryPills();
      } catch (pillsErr) {
        console.error("renderCategoryPills failed:", pillsErr);
      }

      try {
        renderHomeScreenProducts();
      } catch (productsRenderErr) {
        console.error("renderHomeScreenProducts failed:", productsRenderErr);
      }

      const settings = getDataCached('ek_settings', {});

      const custSession = getActiveSession();
      const guestBanner = document.getElementById('home-guest-banner');
      if (guestBanner) {
        if (custSession && custSession.loggedIn) {
          guestBanner.style.display = 'none';
        } else {
          guestBanner.style.display = 'block';
        }
      }
      const loyaltyPtsSpan = document.getElementById('home-loyalty-pts');
      if (loyaltyPtsSpan) {
        if (custSession && custSession.loggedIn) {
          const activeUser = getActiveUser();
          const pts = activeUser ? (activeUser.loyaltyPoints || 0) : 0;
          loyaltyPtsSpan.innerText = Math.round(pts);
        } else {
          loyaltyPtsSpan.innerText = '0';
        }
      }

      const shopBadge = document.getElementById('shop-status-badge');
      if (shopBadge) {
        const isOpen = settings.shopOpen !== false;
        shopBadge.style.transition = 'all 0.3s ease';
        if (settings.leaveMode) {
          shopBadge.className = 'badge';
          shopBadge.style.background = 'rgba(245,158,11,0.15)';
          shopBadge.style.color = '#f59e0b';
          shopBadge.style.border = '1px solid rgba(245,158,11,0.3)';
          shopBadge.innerText = currentLang === 'ta' ? '🌴 விடுமுறை (Holiday)' : '🌴 ON HOLIDAY';
        } else if (isOpen) {
          shopBadge.className = 'badge';
          shopBadge.style.background = 'rgba(16,185,129,0.15)';
          shopBadge.style.color = 'var(--accent-green)';
          shopBadge.style.border = '1px solid rgba(16,185,129,0.3)';
          shopBadge.innerText = currentLang === 'ta' ? '✅ கடை திறந்துள்ளது' : '✅ STORE OPEN';
        } else {
          shopBadge.className = 'badge';
          shopBadge.style.background = 'rgba(239,68,68,0.15)';
          shopBadge.style.color = 'var(--accent-red)';
          shopBadge.style.border = '1px solid rgba(239,68,68,0.3)';
          shopBadge.innerText = currentLang === 'ta' ? '🔴 கடை மூடப்பட்டுள்ளது' : '🔴 STORE CLOSED';
        }
      }

      const elLeaveBanner = document.getElementById('home-leave-banner');
      const elLeaveBannerText = document.getElementById('home-leave-banner-text');
      if (elLeaveBanner && elLeaveBannerText) {
        if (settings.leaveMode) {
          elLeaveBanner.style.display = 'block';
          elLeaveBannerText.innerText = settings.leaveNotice || (currentLang === 'ta' ? "மன்னிக்கவும்! கடை தற்காலிகமாக விடுமுறையில் உள்ளது." : "Sorry, the shop is currently closed on holiday.");
        } else {
          elLeaveBanner.style.display = 'none';
        }
      }
    }

    function syncActiveCategoryPillScroll(catId) {
      setTimeout(() => {
        const pillsContainer = document.querySelector('#screen-home .filter-pills') || document.querySelector('.filter-pills');
        if (!pillsContainer) return;
        const activeBtn = pillsContainer.querySelector('button.pill.active');
        if (activeBtn && typeof scrollToCenterHorizontal === 'function') {
          scrollToCenterHorizontal(activeBtn, pillsContainer);
        }
      }, 50);
    }

    function filterHomeProducts(catId, btn) {
      activeCategory = catId;
      try {
        const config = getCategoryConfig(catId);
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
          homeScreen.style.setProperty('--category-accent-color', config.color);
        }
      } catch (e) {
        console.warn("[filterHomeProducts] Failed to update CSS accent color:", e);
      }
      renderCategoryPills();
      renderHomeScreenProducts();

      if (btn && typeof scrollToCenterHorizontal === 'function') {
        scrollToCenterHorizontal(btn, btn.parentElement);
      } else {
        syncActiveCategoryPillScroll(catId);
      }
    }

    let homeSwipeStartX = 0;
    let homeSwipeStartY = 0;

    function handleHomeCategorySwipe(direction) {
      const catList = Array.isArray(window._currentHomeCategories) && window._currentHomeCategories.length > 0
        ? window._currentHomeCategories
        : [{ id: 'all' }];

      if (!catList || catList.length === 0) return;

      const currentIndex = catList.findIndex(c => String(c.id) === String(activeCategory));
      if (currentIndex === -1) return;

      let targetIndex = currentIndex;
      if (direction === 'next') {
        targetIndex = currentIndex + 1;
      } else if (direction === 'prev') {
        targetIndex = currentIndex - 1;
      }

      if (targetIndex < 0 || targetIndex >= catList.length) return;

      const targetCategory = catList[targetIndex];
      if (!targetCategory || targetCategory.id === undefined) return;

      const grid = document.getElementById('home-product-grid');
      if (grid) {
        grid.style.transition = 'opacity 0.15s ease-in-out';
        grid.style.opacity = '0.35';
        setTimeout(() => {
          grid.style.opacity = '1';
        }, 150);
      }

      filterHomeProducts(String(targetCategory.id));
    }

    function setupHomeCategorySwipeListeners() {
      const targets = [
        document.getElementById('home-product-grid'),
        document.getElementById('home-search-wrapper')
      ].filter(Boolean);

      targets.forEach(target => {
        target.addEventListener('touchstart', function(e) {
          if (typeof currentScreen !== 'undefined' && currentScreen !== 'screen-home') return;
          if (e.touches && e.touches.length === 1) {
            homeSwipeStartX = e.touches[0].clientX;
            homeSwipeStartY = e.touches[0].clientY;
          }
        }, { passive: true });

        target.addEventListener('touchend', function(e) {
          if (typeof currentScreen !== 'undefined' && currentScreen !== 'screen-home') return;
          if (!e.changedTouches || e.changedTouches.length === 0) return;

          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;

          const deltaX = endX - homeSwipeStartX;
          const deltaY = endY - homeSwipeStartY;

          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (absX >= 60 && absX >= 1.5 * absY) {
            if (deltaX < 0) {
              handleHomeCategorySwipe('next');
            } else {
              handleHomeCategorySwipe('prev');
            }
          }
        }, { passive: true });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupHomeCategorySwipeListeners);
    } else {
      setupHomeCategorySwipeListeners();
    }

    function handleProductImageError(img, category) {
      console.warn("[Image Error Handled] Failed to load product image, category:", category);
      const container = img.closest('.lazy-image-container');
      if (container) {
        const categoryConfig = getCategoryConfig(category);
        container.innerHTML = `<span style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));">${categoryConfig.icon}</span>`;
        container.classList.remove('lazy-image-container');
        container.classList.add('product-card-img-container');
        container.style.background = `${categoryConfig.color}15`;
        container.style.border = `1px solid ${categoryConfig.color}25`;
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
      }
    }

    function getBlurPlaceholderUrl(url) {
      return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'><rect width='100%' height='100%' fill='%230b0f19'/><rect x='20' y='20' width='360' height='210' rx='10' fill='%23141b2b' opacity='0.5'/></svg>";
    }

    let _globalImageObserver = null;

    function lazyLoadImages() {
      const lazyImages = document.querySelectorAll('.lazy-image-main:not([data-lyo-observed])');
      if (lazyImages.length === 0) return;

      if ('IntersectionObserver' in window) {
        if (!_globalImageObserver) {
          _globalImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const image = entry.target;
                const src = image.getAttribute('data-src');
                if (src) {
                  image.onload = function() {
                    if (image.classList.contains('loaded')) return;
                    image.classList.add('loaded');
                    const container = image.closest('.lazy-image-container');
                    if (container) {
                      const placeholder = container.querySelector('.lazy-image-placeholder');
                      if (placeholder) {
                        placeholder.style.opacity = '0';
                        setTimeout(() => {
                          placeholder.style.display = 'none';
                        }, 350);
                      }
                    }
                  };
                  image.src = src;
                  image.removeAttribute('data-src');
                  if (image.complete) {
                    image.onload();
                  }
                }
                observer.unobserve(image);
              }
            });
          }, {
            rootMargin: '600px 0px 800px 0px', // Sane balanced loading boundaries to prevent memory thrashing
            threshold: 0.01
          });
        }

        lazyImages.forEach(image => {
          image.setAttribute('data-lyo-observed', 'true');
          _globalImageObserver.observe(image);
        });
      } else {
        lazyImages.forEach(image => {
          image.setAttribute('data-lyo-observed', 'true');
          const src = image.getAttribute('data-src');
          if (src) {
            image.onload = function() {
              if (image.classList.contains('loaded')) return;
              image.classList.add('loaded');
              const container = image.closest('.lazy-image-container');
              if (container) {
                const placeholder = container.querySelector('.lazy-image-placeholder');
                if (placeholder) {
                  placeholder.style.display = 'none';
                }
              }
            };
            image.src = src;
            image.removeAttribute('data-src');
            if (image.complete) {
              image.onload();
            }
          }
        });
      }
    }

    const PRODUCTS_PER_BATCH = 24;
    let _currentRenderedCount = 0;
    let _currentFilteredProducts = [];
    let _lastDataSnapshotHash = null;
    let _lastSpecialsHash = null;
    let isProductsLoading = false;
    let productsLoadError = null;
    let isCategoriesLoading = false;
    let categoriesLoadError = null;

    function updateCatalogSyncIndicator(isFromCache) {
      let badge = document.getElementById('catalog-sync-indicator');
      if (!badge) {
        const container = document.getElementById('home-product-search-container') || document.querySelector('.search-wrapper') || document.getElementById('home-product-grid')?.parentElement;
        if (container) {
          badge = document.createElement('div');
          badge.id = 'catalog-sync-indicator';
          badge.style.cssText = 'display:none; align-items:center; justify-content:center; gap:6px; font-size:11px; font-weight:600; color:var(--text-muted, #94a3b8); padding:4px 12px; border-radius:20px; background:rgba(255,255,255,0.05); margin:6px auto; width:fit-content; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s ease; z-index:5;';
          badge.innerHTML = `<span class="spinner-dual" style="width:12px; height:12px; border-width:2px; display:inline-block;"></span> <span>${typeof currentLang !== 'undefined' && currentLang === 'ta' ? 'அண்மைய தகவல்கள் புதுப்பிக்கப்படுகின்றன...' : 'Updating catalog...'}</span>`;
          if (container.firstChild) {
            container.insertBefore(badge, container.firstChild);
          } else {
            container.appendChild(badge);
          }
        }
      }
      if (badge) {
        badge.style.display = isFromCache ? 'inline-flex' : 'none';
      }
    }
    window.updateCatalogSyncIndicator = updateCatalogSyncIndicator;

    function retryCloudSync() {
      productsLoadError = null;
      categoriesLoadError = null;
      if (typeof fetchProductsOnce === 'function') fetchProductsOnce();
      if (typeof setupCloudRealtimeListeners2 === 'function') setupCloudRealtimeListeners2();
    }
    window.retryCloudSync = retryCloudSync;

    function buildGroupedRenderList(filteredProds) {
      return filteredProds.map(p => ({
        type: 'product',
        data: p
      }));
    }

    function renderHomeScreenProducts(force = false) {
      const deletedProdIds = typeof getDeletedProductIds === 'function' ? getDeletedProductIds() : [];
      if (force) {
        _lastProductsHash = '';
        _lastSpecialsHash = '';
      }
      const grid = document.getElementById('home-product-grid');
      let rawLocalProducts = typeof getDataCached === 'function' ? getDataCached('ek_products', []) : getData('ek_products', []);
      const isDemoEnabled = typeof ENABLE_DEMO_SEED_DATA !== 'undefined' && ENABLE_DEMO_SEED_DATA === true;
      if (!isDemoEnabled && Array.isArray(rawLocalProducts) && typeof DEMO_PRODUCTS !== 'undefined' && Array.isArray(DEMO_PRODUCTS)) {
        const demoIds = new Set(DEMO_PRODUCTS.map(p => p.id));
        rawLocalProducts = rawLocalProducts.filter(p => p && p.id && !demoIds.has(p.id));
      }
      const demoList = (isDemoEnabled && typeof DEMO_PRODUCTS !== 'undefined' && Array.isArray(DEMO_PRODUCTS)) ? DEMO_PRODUCTS : [];
      if ((!rawLocalProducts || rawLocalProducts.length === 0) && demoList.length > 0) {
        rawLocalProducts = demoList.filter(p => p && p.id && !deletedProdIds.includes(p.id));
        if (rawLocalProducts.length > 0) {
          saveData('ek_products', rawLocalProducts);
          if (typeof invalidateDataCache === 'function') invalidateDataCache('ek_products');
        }
      }
      if ((!rawLocalProducts || rawLocalProducts.length === 0) && !window._hasFreshCloudData && (isProductsLoading || window.isProductsLoading)) {
        if (grid) {
          let skeletonCardsHtml = '';
          for (let i = 0; i < 6; i++) {
            skeletonCardsHtml += `
              <div class="product-skeleton-card" style="background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color); padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; position: relative;">
                <div style="width: 100%; height: 110px; border-radius: 12px; background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                <div style="width: 70%; height: 14px; border-radius: 6px; background: rgba(255,255,255,0.06); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                <div style="width: 40%; height: 12px; border-radius: 6px; background: rgba(255,255,255,0.04); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <div style="width: 50%; height: 18px; border-radius: 6px; background: rgba(255,255,255,0.06); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.08); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                </div>
              </div>
            `;
          }
          grid.innerHTML = skeletonCardsHtml;
        }
        const loadMoreIndicator = document.getElementById('product-load-more-indicator');
        if (loadMoreIndicator) loadMoreIndicator.style.display = 'none';
        const specialsSec = document.getElementById('specials-section');
        if (specialsSec) specialsSec.style.display = 'none';
        return;
      }
      try {
        let products = (rawLocalProducts || []).filter(p => p && p.id && !deletedProdIds.includes(p.id));
        if (Array.isArray(products)) { products.forEach(p => { if (p) updateProductAvailability(p); }); }
        const catList = getCategoriesList() || [];
        const grid = document.getElementById('home-product-grid');

        if ((!products || products.length === 0) && isDemoEnabled && typeof DEMO_PRODUCTS !== 'undefined' && Array.isArray(DEMO_PRODUCTS)) {
          products = DEMO_PRODUCTS.filter(p => p && p.id && !deletedProdIds.includes(p.id));
          if (products.length > 0) {
            saveData('ek_products', products);
            if (typeof invalidateDataCache === 'function') invalidateDataCache('ek_products');
          }
        }

        // Show connection error UI with Retry button if load failed and no local data
        if (productsLoadError && (!rawLocalProducts || rawLocalProducts.length === 0) && (!products || products.length === 0)) {
          if (grid) {
            grid.innerHTML = `
              <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;">
                <div style="font-size: 42px;">📡</div>
                <p style="color: var(--text-color); font-size: 15px; font-weight: 600; margin: 0;">
                  ${currentLang === 'ta' ? 'இணைப்பில் சிக்கல் - மீண்டும் முயற்சிக்க' : 'Connection error - Tap to retry'}
                </p>
                <button onclick="retryCloudSync()" style="padding: 10px 22px; background: var(--primary-color, #16a34a); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                  🔄 ${currentLang === 'ta' ? 'மீண்டும் முயற்சிக்க' : 'Retry'}
                </button>
              </div>
            `;
          }
          const loadMoreIndicator = document.getElementById('product-load-more-indicator');
          if (loadMoreIndicator) loadMoreIndicator.style.display = 'none';
          return;
        }

        // Show loading spinner ONLY if products load is active AND local product storage is empty
        if (isProductsLoading && (!rawLocalProducts || rawLocalProducts.length === 0) && (!products || products.length === 0)) {
          if (grid) {
            grid.innerHTML = `
              <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                <div class="spinner-dual" style="margin-bottom: 8px;"></div>
                <p style="color: var(--text-muted); font-size: 14px; font-weight: 500; margin: 0;">
                  ${currentLang === 'ta' ? 'தயாரிப்புகள் ஏற்றப்படுகின்றன...' : 'Loading products...'}
                </p>
              </div>
            `;
          }
          const loadMoreIndicator = document.getElementById('product-load-more-indicator');
          if (loadMoreIndicator) loadMoreIndicator.style.display = 'none';
          return;
        }

        let specials = (products || []).filter(p => p && p.isSpecial && !p.isHidden);
        if (specials.length === 0 && (products || []).length > 0) {
          specials = products.filter(p => p && !p.isHidden).slice(0, 4);
        }

        const unavailableCategoriesSet = new Set((catList || []).filter(c => c && c.isScheduled && c.isAvailable === false).map(c => String(c.id)));

        const specialsContainer = document.getElementById('specials-container');
        const specialsSec = document.getElementById('specials-section');

        if (specialsContainer && specialsSec) {
          if (!specials || specials.length === 0) {
            specialsSec.style.display = 'none';
            _lastSpecialsHash = '';
          } else {
            specialsSec.style.display = 'block';
            const specialsHash = currentLang + '::' + specials.map(p => `${p ? p.id : ''}:${p ? p.stockKg : ''}:${p ? p.isOutOfStock : ''}:${p ? p.pricePerKg : ''}:${p ? (p.updatedAt || p.createdAt || '') : ''}:${(p && p.imageUrl ? String(p.imageUrl) : '').slice(-15)}`).join('|');
            if (specialsHash === _lastSpecialsHash && specialsContainer.querySelectorAll('.special-card').length > 0) {
              // fast skip if already rendered
            } else {
              _lastSpecialsHash = specialsHash;
              let specialsHtml = '';
              specials.forEach(p => {
                if (!p) return;
                const pidStr = String(p.id || '');
                const pCatStr = String(p.category || '');
                const isCategoryUnavailable = unavailableCategoriesSet.has(pCatStr);
                const isOutOfStock = p.isOutOfStock || (p.stockKg !== undefined && p.stockKg <= 0) || (p.isScheduled && p.isAvailable === false) || isCategoryUnavailable;
                const overlayHtml = isOutOfStock ? `<div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; color:var(--accent-red); font-weight:700; font-size:11px;">OUT OF STOCK</div>` : '';

                const imgUrl = String(p.imageUrl || '').trim();
                const hasRealSpecImage = imgUrl !== '' && imgUrl !== 'null' && imgUrl !== 'undefined' && !imgUrl.toLowerCase().includes('placeholder') && !imgUrl.toLowerCase().includes('default');
                const categoryConfig = getCategoryConfig(pCatStr);
                let specImgHtml = '';
                if (hasRealSpecImage) {
                  specImgHtml = `
                    <div class="lazy-image-container" style="height: 78px; border-radius: 10px; margin: 6px 6px 0 6px; overflow: hidden; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center;" ${isOutOfStock ? '' : `onclick="openProductModalDetail('${pidStr}')"`}>
                      <img src="${getImageUrlWithCacheBuster(getProductThumbnailUrl(p), p.updatedAt)}" data-src="${getImageUrlWithCacheBuster(getProductThumbnailUrl(p), p.updatedAt)}" width="120" height="78" class="lazy-image-main special-img" style="height: 78px; width: 100%; object-fit: cover; border-radius: 10px;" alt="${cleanProductName(String(p.englishName || ''))}" loading="lazy" decoding="async" onerror="handleProductImageError(this, '${pCatStr}')">
                    </div>
                  `;
                } else {
                  specImgHtml = `
                    <div class="product-card-img-container" style="height: 78px; border-radius: 10px; margin: 6px 6px 0 6px; overflow: hidden; position: relative; cursor: pointer; background: ${categoryConfig.color}15; border: 1px solid ${categoryConfig.color}25; display: flex; align-items: center; justify-content: center;" ${isOutOfStock ? '' : `onclick="openProductModalDetail('${pidStr}')"`}>
                      <span style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));">${categoryConfig.icon}</span>
                    </div>
                  `;
                }

                const isFav = isProductFavorite(pidStr);
                const favHeart = `<span class="fav-heart-btn" data-id="${pidStr}" onclick="event.stopPropagation(); toggleFavoriteProduct('${pidStr}', event)" style="position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 13px; padding: 3px; display: inline-flex; align-items: center; justify-content: center; height: 24px; width: 24px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: 0 2px 6px rgba(0,0,0,0.15); z-index: 10;" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${isFav ? '❤️' : '🤍'}</span>`;

                const cardHtml = `
                  <div class="special-card" id="card-special-${pidStr}" style="height: 182px; width: 142px; flex: 0 0 142px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                    ${overlayHtml}
                    ${favHeart}
                    ${specImgHtml}
                    <div class="special-detail" style="padding: 6px 8px 8px 8px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; height: 98px !important; box-sizing: border-box;">
                      <div>
                        <h5 style="font-size:11.5px; font-weight:700; color:#ffffff; margin: 0; word-break: break-word; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-height: 2.5em;">${cleanProductName(String(p.englishName || ''))}</h5>
                        <p class="tamil-text" style="font-size:10.5px !important; color:var(--accent-orange) !important; font-weight:600 !important; margin: 2px 0 0 0; word-break: break-word; line-height: 1.3 !important; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${String(p.tamilName || '')}</p>
                      </div>
                      <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-top: auto; padding-top: 2px;">
                        <strong style="font-size:11.5px; color:var(--text-primary); font-weight: 700;">${getProductPriceText(p, currentLang)}</strong>
                        <button class="btn btn-primary" style="width:auto !important; min-width:unset !important; min-height:28px !important; height:auto !important; padding:4px 10px !important; font-size:10.5px !important; font-weight:800; border-radius:12px !important; display:inline-flex; align-items:center; justify-content:center; gap:2px; backdrop-filter:blur(10px) !important; -webkit-backdrop-filter:blur(10px) !important; background: linear-gradient(135deg, #06b6d4 0%, #0d9488 100%) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; box-shadow: 0 4px 10px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important; color:#ffffff !important; text-shadow: 0 1px 1px rgba(0,0,0,0.15) !important;" ${isOutOfStock ? 'disabled' : ''} onclick="openProductModalDetail('${pidStr}')">
                          <span>Buy ➔</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                specialsHtml += cardHtml;
              });
              specialsContainer.innerHTML = specialsHtml;
            }
          }
        }

        if (!grid) {
          return;
        }

        const searchBox = document.getElementById('home-product-search');
        const searchQuery = searchBox ? String(searchBox.value || '').toLowerCase().trim() : '';

        let filtered = (products || []).filter(p => p && !p.isHidden);

        if (String(activeCategory) === 'favorites') {
          filtered = filtered.filter(p => p && isProductFavorite(p.id));
        } else if (String(activeCategory) !== 'all') {
          const activeCatLower = String(activeCategory).toLowerCase().trim();
          filtered = filtered.filter(p => p && String(p.category || '').toLowerCase().trim() === activeCatLower);
        }

        if (filtered.length === 0 && String(activeCategory) !== 'all' && !searchQuery) {
          activeCategory = 'all';
          filtered = (products || []).filter(p => p && !p.isHidden);
        }

        if (searchQuery) {
          filtered = filtered.filter(p => {
            if (!p) return false;
            const enName = String(p.englishName || '').toLowerCase();
            const taName = String(p.tamilName || '').toLowerCase();
            const cat = String(p.category || '').toLowerCase();
            let customMatch = false;
            if (searchQuery === 'mutton' || searchQuery === 'மட்டன்' || searchQuery === 'ஆடு' || searchQuery === 'goat') {
              customMatch = cat.includes('mutton') || enName.includes('mutton') || taName.includes('ஆடு') || taName.includes('மட்டன்');
            } else if (searchQuery === 'chicken' || searchQuery === 'சிக்கன்' || searchQuery === 'கோழி') {
              customMatch = cat.includes('chicken') || enName.includes('chicken') || taName.includes('கோழி') || taName.includes('சிக்கன்');
            } else if (searchQuery === 'fish' || searchQuery === 'மீன்') {
              customMatch = cat.includes('fish') || enName.includes('fish') || taName.includes('மீன்');
            } else if (searchQuery === 'beef' || searchQuery === 'மாடு' || searchQuery === 'மாட்டிறைச்சி') {
              customMatch = cat.includes('beef') || enName.includes('beef') || taName.includes('மாடு') || taName.includes('மாட்டிறைச்சி');
            }
            return enName.includes(searchQuery) || taName.includes(searchQuery) || cat.includes(searchQuery) || customMatch;
          });
        }

        const catListForSorting = getCategoriesList() || [];
        const catOrderMap = new Map();
        catListForSorting.forEach((c, idx) => {
          const catKey = String(c.id || '').toLowerCase().trim();
          catOrderMap.set(catKey, c.order !== undefined && c.order !== null ? Number(c.order) : idx);
        });

        filtered.sort((a, b) => {
          const catA = String(a.category || '').toLowerCase().trim();
          const catB = String(b.category || '').toLowerCase().trim();
          const orderA = catOrderMap.has(catA) ? catOrderMap.get(catA) : 999;
          const orderB = catOrderMap.has(catB) ? catOrderMap.get(catB) : 999;
          if (orderA !== orderB) return orderA - orderB;

          const prodOrderA = Number(a.order !== undefined && a.order !== null ? a.order : (a.displayOrder !== undefined ? a.displayOrder : 999));
          const prodOrderB = Number(b.order !== undefined && b.order !== null ? b.order : (b.displayOrder !== undefined ? b.displayOrder : 999));
          if (prodOrderA !== prodOrderB) return prodOrderA - prodOrderB;

          return String(a.id || '').localeCompare(String(b.id || ''));
        });

        const categoryOrdersHash = catListForSorting.map(c => `${c.id}:${c.order}`).join(',');
        const favsHash = (String(activeCategory) === 'favorites') ? '::favs:' + (getData('ek_customer_favorites', []) || []).join(',') : '';
        const filterKey = String(activeCategory) + '::' + searchQuery + '::' + categoryOrdersHash + favsHash;
        const dataHash = filtered.map(p => `${p ? p.id : ''}:${p ? p.stockKg : ''}:${p ? p.isOutOfStock : ''}:${p ? p.pricePerKg : ''}:${p ? String(p.imageUrl || '').trim() : ''}:${p ? String(p.englishName || '').trim() : ''}:${p ? (p.sellingUnit || p.unit || '') : ''}:${p ? String(p.category || '') : ''}:${p ? !!p.isHidden : ''}`).join('|');
        const combinedKey = filterKey + '::' + dataHash;
        if (filtered.length === 0) {
          grid.innerHTML = `            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">              <div style="font-size: 40px; filter: grayscale(1);">🛒</div>              <p style="color: var(--text-muted); font-size: 14px; font-weight: 500; margin: 0;">                ${currentLang === 'ta' ? 'தயாரிப்புகள் இன்னும் சேர்க்கப்படவில்லை.' : 'No products available yet.'}              </p>              <p style="color: var(--text-muted); font-size: 11px; margin: 0; opacity: 0.7;">                ${currentLang === 'ta' ? 'அட்மின் பேனலில் இருந்து புதிய தயாரிப்புகளை சேர்க்கவும்.' : 'Add products from the Admin Panel.'}              </p>            </div>          `;
          const loadMoreIndicator = document.getElementById('product-load-more-indicator');
          if (loadMoreIndicator) loadMoreIndicator.style.display = 'none';
          _lastDataSnapshotHash = combinedKey;
          return;
        }
        if (combinedKey === _lastDataSnapshotHash && grid.querySelectorAll('.product-grid-card').length > 0) {
          lazyLoadImages();
          return;
        }
        const prevKey = (grid.dataset && grid.dataset.filterKey) || grid.getAttribute('data-filter-key');
        const isFilterChange = (prevKey !== filterKey);
        if (grid.dataset) grid.dataset.filterKey = filterKey;
        grid.setAttribute('data-filter-key', filterKey);
        _lastDataSnapshotHash = combinedKey;
        _currentRenderedCount = 0;
        _currentFilteredProducts = buildGroupedRenderList(filtered);
        const currentCardCount = grid.querySelectorAll('.product-grid-card').length;
        if (isFilterChange || currentCardCount === 0) {
          grid.innerHTML = '';
        } else {
          const validProductIds = new Set(
            _currentFilteredProducts
              .filter(item => item && item.type === 'product' && item.data && item.data.id)
              .map(item => String(item.data.id))
          );
          grid.querySelectorAll('.product-grid-card').forEach(card => {
            const cardId = card.id.replace('card-prod-', '');
            if (!validProductIds.has(cardId)) {
              card.remove();
            }
          });
        }
        const renderTargetCount = _currentFilteredProducts.length;
        while (_currentRenderedCount < renderTargetCount && _currentRenderedCount < _currentFilteredProducts.length) {
          renderNextProductBatch();
        }
      } catch (err) {
        console.error("renderHomeScreenProducts exception caught safely:", err);
      }
    }

    function renderNextProductBatch() {
      try {
        const grid = document.getElementById('home-product-grid');
        if (!grid) return;

        const catList = getCategoriesList() || [];
        const unavailableCategoriesSet = new Set(catList.filter(c => c && c.isScheduled && c.isAvailable === false).map(c => String(c.id)));

        const startIdx = _currentRenderedCount;
        const endIdx = Math.min(startIdx + PRODUCTS_PER_BATCH, _currentFilteredProducts.length);
        if (startIdx >= endIdx) return; // All loaded

        let batchHtml = '';
        for (let i = startIdx; i < endIdx; i++) {
          const item = _currentFilteredProducts[i];
          if (!item) continue;
          if (item.type === 'header') {
            const badgeColor = `var(--category-${item.id}, var(--accent-orange))`;
            const headerHtml = `
              <div class="category-sticky-header" style="--category-color: ${badgeColor};">
                <h4>${String(item.nameEn || '')}</h4>
                <p>${String(item.nameTa || '')}</p>
              </div>
            `;
            batchHtml += headerHtml;
          } else {
            const p = item.data;
            if (!p) continue;
            const pidStr = String(p.id || '');
            const pCatStr = String(p.category || '');
            const isCategoryUnavailable = unavailableCategoriesSet.has(pCatStr);
            const isOutOfStock = p.isOutOfStock || (p.stockKg !== undefined && p.stockKg <= 0) || (p.isScheduled && p.isAvailable === false) || isCategoryUnavailable;

            const categoryConfig = getCategoryConfig(pCatStr);
            const imgUrl = String(p.imageUrl || '').trim();
            const hasRealImage = imgUrl !== '' && imgUrl !== 'null' && imgUrl !== 'undefined' && !imgUrl.toLowerCase().includes('placeholder') && !imgUrl.toLowerCase().includes('default');
            let imgHtml = '';
            if (hasRealImage) {
              imgHtml = `
                <div class="product-card-img-container lazy-image-container">
                  <img src="${getImageUrlWithCacheBuster(getProductThumbnailUrl(p), p.updatedAt)}" data-src="${getImageUrlWithCacheBuster(getProductThumbnailUrl(p), p.updatedAt)}" width="90" height="90" class="lazy-image-main" style="width: 100%; height: 100%; object-fit: cover;" alt="${cleanProductName(String(p.englishName || ''))}" loading="lazy" decoding="async" onerror="handleProductImageError(this, '${pCatStr}')">
                </div>
              `;
            } else {
              imgHtml = `
                <div class="product-card-img-container" style="background: ${categoryConfig.color}15; border: 1px solid ${categoryConfig.color}25;">
                  <span style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));">${categoryConfig.icon}</span>
                </div>
              `;
            }

            const overlayHtml = isOutOfStock ? `<div class="stock-overlay-light">${currentLang === 'ta' ? 'கையிருப்பு இல்லை' : 'Out Of Stock'}</div>` : '';
            const sDescStr = String(p.shortDescription || '').trim();
            const hasShortDesc = sDescStr !== '' && sDescStr !== 'undefined' && sDescStr !== 'null';
            const shortDescHtml = hasShortDesc ? `<span style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sDescStr}</span>` : '';

            const isFav = isProductFavorite(pidStr);

            const uVal = String(p.sellingUnit || p.unit || 'kg').toLowerCase();
            const isGram = (uVal === 'g' || uVal === 'gram');
            const prefix = isGram ? '' : '1 ';
            const weightText = prefix + getUnitDisplay(uVal, currentLang === 'ta', 1);

            const weightHtml = `<span style="font-size: 10px; color: var(--text-muted); font-weight: 600; background: rgba(0,0,0,0.04); padding: 2px 6px; border-radius: 6px; display: inline-block; white-space: nowrap;">${weightText}</span>`;

            const cardHtml = `
              <div class="product-grid-card" id="card-prod-${pidStr}" data-image-url="${imgUrl}" onclick="openProductModalDetail('${pidStr}')">
                ${overlayHtml}
                ${imgHtml}
                <div class="product-card-details" style="display: flex !important; flex-direction: column !important; justify-content: center !important; gap: 2px !important; flex-grow: 1 !important; min-width: 0 !important; min-height: 90px !important; height: auto !important; padding: 0 !important;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px; width: 100%;">
                    <h4 style="margin: 0; flex-grow: 1; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-height: 2.5em; line-height: 1.25;">${cleanProductName(String(p.englishName || ''))}</h4>
                  </div>
                  <p class="tamil-text" style="margin: 0;">${String(p.tamilName || '')}</p>
                  <div style="margin-top: 2px; display: flex; align-items: center; gap: 4px; overflow: hidden; max-width: 100%;">
                    ${shortDescHtml}
                  </div>
                  <div style="margin-top: 4px;">
                    <span class="product-price">${getProductPriceText(p, currentLang)}</span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; align-self: stretch !important; flex-shrink: 0; padding-right: 4px; padding-top: 4px; padding-bottom: 4px;">
                  <span class="fav-heart-btn" data-id="${pidStr}" onclick="event.stopPropagation(); toggleFavoriteProduct('${pidStr}', event)" style="cursor: pointer; font-size: 15px; padding: 4px; display: inline-flex; align-items: center; justify-content: center; height: 26px; width: 26px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-right: 4px; z-index: 10;" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFav ? '❤️' : '🤍'}
                  </span>
                  <button class="btn-add-orange" ${isOutOfStock ? 'disabled' : ''} onclick="event.stopPropagation(); openProductModalDetail('${pidStr}')">
                    <span>+ ADD</span>
                  </button>
                </div>
              </div>
            `;
            const existingCard = document.getElementById('card-prod-' + pidStr);
            if (existingCard) {
              const oldImgUrl = existingCard.getAttribute('data-image-url') || '';
              if (oldImgUrl !== imgUrl) {
                existingCard.setAttribute('data-image-url', imgUrl);
                const oldImgContainer = existingCard.querySelector('.product-card-img-container');
                if (oldImgContainer) {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = imgHtml.trim();
                  if (tempDiv.firstElementChild) {
                    oldImgContainer.replaceWith(tempDiv.firstElementChild);
                  }
                }
              }
              const priceEl = existingCard.querySelector('.product-price');
              if (priceEl) priceEl.innerText = getProductPriceText(p, currentLang);

              const titleEl = existingCard.querySelector('h4');
              if (titleEl) titleEl.innerText = cleanProductName(String(p.englishName || ''));

              const taEl = existingCard.querySelector('.tamil-text');
              if (taEl) taEl.innerText = String(p.tamilName || '');

              const addBtn = existingCard.querySelector('.btn-add-orange');
              if (addBtn) {
                if (isOutOfStock) {
                  addBtn.disabled = true;
                  if (typeof addBtn.setAttribute === 'function') addBtn.setAttribute('disabled', 'true');
                } else {
                  addBtn.disabled = false;
                  if (typeof addBtn.removeAttribute === 'function') addBtn.removeAttribute('disabled');
                }
              }

              let overlayEl = existingCard.querySelector('.stock-overlay-light');
              if (isOutOfStock && !overlayEl) {
                existingCard.insertAdjacentHTML('afterbegin', `<div class="stock-overlay-light">${currentLang === 'ta' ? 'கையிருப்பு இல்லை' : 'Out Of Stock'}</div>`);
              } else if (!isOutOfStock && overlayEl) {
                overlayEl.remove();
              }
            } else {
              batchHtml += cardHtml;
            }
          }
        }

        grid.insertAdjacentHTML('beforeend', batchHtml);
        _currentRenderedCount = endIdx;

        lazyLoadImages();
        updateLoadMoreIndicator();
      } catch (err) {
        console.error("renderNextProductBatch exception caught safely:", err);
      }
    }

    function updateLoadMoreIndicator() {
      const grid = document.getElementById('home-product-grid');
      if (!grid) return;
      let indicator = document.getElementById('product-load-more-indicator');
      const hasMore = _currentRenderedCount < _currentFilteredProducts.length;

      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'product-load-more-indicator';
        indicator.style.cssText = 'grid-column: span 2; text-align:center; padding: 16px; color: var(--text-muted); font-size: 11px; font-weight: 500; font-family: "Poppins", "Hind Madurai", sans-serif;';
        grid.parentElement.appendChild(indicator);
      }

      indicator.style.display = hasMore ? 'block' : 'none';
      if (hasMore) {
        const remaining = _currentFilteredProducts.length - _currentRenderedCount;
        indicator.textContent = currentLang === 'ta'
          ? `மேலும் ${remaining} பொருட்கள் கீழே... (Scroll down to load)`
          : `More ${remaining} items below... (Scroll down to load)`;
      }

      if (window.__refreshInfiniteScrollObserver) {
        window.__refreshInfiniteScrollObserver();
      }
    }

    /*
    function pruneDistantProductCards() {
      const screenHome = document.getElementById('screen-home');
      if (!screenHome) return;

      const cards = document.querySelectorAll('.product-grid-card');
      const viewportTop = screenHome.scrollTop;
      const viewportBottom = viewportTop + screenHome.clientHeight;
      const PRUNE_DISTANCE = 2000; // pixels safe zone

      cards.forEach(card => {
        const cardTop = card.offsetTop;
        if (cardTop < viewportTop - PRUNE_DISTANCE || cardTop > viewportBottom + PRUNE_DISTANCE) {
          const img = card.querySelector('.lazy-image-main.loaded');
          if (img && img.src) {
            card.dataset.savedSrc = img.src;
            img.removeAttribute('src'); // Unload from memory
            img.classList.remove('loaded');
          }
        } else if (card.dataset.savedSrc) {
          const img = card.querySelector('.lazy-image-main');
          if (img && !img.src) {
            img.src = card.dataset.savedSrc;
            img.classList.add('loaded');
          }
        }
      });
    }
    */

    let pickerLeafletMap = null;
    let pickerTileLayer = null;
    let pickerMapTheme = 'standard';
    let pickerMarker = null;

    function setPickerMapTheme(theme) {
      pickerMapTheme = theme;

      const btnStandard = document.getElementById('picker-map-theme-standard');
      const btnSatellite = document.getElementById('picker-map-theme-satellite');

      if (theme === 'satellite') {
        if (btnSatellite) {
          btnSatellite.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)';
          btnSatellite.style.borderColor = 'rgba(255,255,255,0.3)';
          btnSatellite.style.color = '#fff';
          btnSatellite.style.fontWeight = '900';
          btnSatellite.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)';
        }
        if (btnStandard) {
          btnStandard.style.background = 'rgba(20, 20, 22, 0.6)';
          btnStandard.style.borderColor = 'rgba(255,255,255,0.06)';
          btnStandard.style.color = '#a0aec0';
          btnStandard.style.fontWeight = '600';
          btnStandard.style.boxShadow = 'none';
        }
      } else {
        if (btnStandard) {
          btnStandard.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)';
          btnStandard.style.borderColor = 'rgba(255,255,255,0.3)';
          btnStandard.style.color = '#fff';
          btnStandard.style.fontWeight = '900';
          btnStandard.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)';
        }
        if (btnSatellite) {
          btnSatellite.style.background = 'rgba(20, 20, 22, 0.6)';
          btnSatellite.style.borderColor = 'rgba(255,255,255,0.06)';
          btnSatellite.style.color = '#a0aec0';
          btnSatellite.style.fontWeight = '600';
          btnSatellite.style.boxShadow = 'none';
        }
      }

      if (pickerLeafletMap && pickerTileLayer) {
        let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        if (theme === 'satellite') {
          tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
        }
        pickerTileLayer.setUrl(tileUrl);
      }
    }

    function openMapAddressPicker(targetId) {
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const oldModal = document.getElementById('map-picker-modal');
      if (oldModal) oldModal.remove();

      const modal = document.createElement('div');
      modal.id = 'map-picker-modal';
      modal.className = 'modal-backdrop';
      modal.style.zIndex = '999999';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.padding = '15px';

      let currentLat = parseFloat(targetInput.getAttribute('data-lat')) || 11.5815;
      let currentLng = parseFloat(targetInput.getAttribute('data-lng')) || 77.8488;

      const isAdminActive = getAdminSession() ? true : false;
      let adminWarningHtml = "";
      if (isAdminActive) {
        adminWarningHtml = `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1.5px solid rgba(239, 68, 68, 0.45); padding: 8px 12px; border-radius: 12px; font-size: 11px; color: #f87171; line-height: 1.45; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 4px 10px rgba(239,68,68,0.15); margin-bottom: 2px;">
            <span style="font-weight: 850; display: flex; align-items: center; gap: 4px; color: #ef4444;">🚨 கஸ்டமர் கேர் எச்சரிக்கை / ADMIN GUARD MODE</span>
            <span>நீங்கள் அட்மின்/ஸ்டாஃப் கணக்கில் உள்ளீர்கள். <b>"என் இருப்பிடம் / Locate Me"</b> பட்டனை அழுத்தினால் அது கடையின் (உங்களது) கைபேசி இருப்பிடத்தை எடுக்கும், வாடிக்கையாளரின் முகவரியை அல்ல! எனவே, மேலே உள்ள தேடுதல் பெட்டியைப் பயன்படுத்திக் கஸ்டமர் ஏரியாவை தேடிக் கண்டறியவும்.</span>
          </div>
        `;
      }

      modal.innerHTML = `
        <div class="bottom-sheet" style="width: 95%; max-width: 600px; border-radius: 24px; border: 1.5px solid #2d2d2d; background: #0c0c0e; padding: 22px; box-shadow: 0 12px 35px rgba(0,0,0,0.85); transform: scale(0.9); transition: all 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.28); display: flex; flex-direction: column; gap: 14px; max-height: 95vh; box-sizing: border-box;">

          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">🗺️</span>
              <div>
                <h4 style="color: #ffffff; font-size: 13px; font-weight: 800; margin: 0; text-transform: uppercase;">SELECT LOCATION / வரைபடம்</h4>
                <p style="font-size: 10px; color: var(--text-muted); margin: 0;">Search area, drag pin, or tap directly</p>
              </div>
            </div>
            <button onclick="closeMapAddressPicker()" style="background: transparent; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 4px;">✕</button>
          </div>

          ${adminWarningHtml}

          <!-- Interactive Search Container -->
          <div style="position: relative; display: flex; gap: 8px; width: 100%; box-sizing: border-box;">
            <input type="text" id="map-search-input" enterkeyhint="search" onkeydown="if(event.key === 'Enter' || event.keyCode === 13) { event.preventDefault(); searchMapAddress(); }" placeholder="${currentLang === 'ta' ? '🔍 தெரு அல்லது பகுதி பெயரைத் தேடுங்கள்...' : '🔍 Search street, village, or area name...'}" style="flex: 1; min-width: 0; height: 42px; background: #141416; border: 1.5px solid #2d2d2d; border-radius: 12px; padding: 0 12px; color: #fff; font-size: 13px; font-weight: 600; box-sizing: border-box;" />
            <button onclick="searchMapAddress()" style="background: linear-gradient(135deg, rgba(245,158,11,0.85) 0%, rgba(232,113,10,0.95) 100%); color: #fff; text-shadow:0 1px 1px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); font-weight: 900; border-radius: 12px; width: auto; min-width: 82px; height: 42px; padding: 0 12px; font-size: 11.5px; cursor: pointer; flex-shrink: 0; box-shadow: 0 3px 8px rgba(245,158,11,0.2); transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.96)'" onmouseup="this.style.transform='none'">SEARCH</button>
          </div>
          <div id="map-search-results" style="display: none; background: #141416; border: 1.5px solid #2d2d2d; border-radius: 12px; max-height: 120px; overflow-y: auto; padding: 6px; font-size: 11.5px; color: #fff; flex-direction: column; gap: 4px; box-sizing: border-box; z-index: 10001;"></div>

          <div style="position: relative; width: 100%; height: 280px; border-radius: 14px; overflow: hidden; border: 1.5px solid #222;">
            <div id="picker-map" style="width: 100%; height: 100%; background: #141414; border: none; position: relative; z-index: 100;"></div>
            <!-- Standard / Satellite selector overlay style -->
            <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 4px; z-index: 10001; background: rgba(12,12,14,0.85); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 4px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 10px rgba(0,0,0,0.4); contain: layout style paint;">
              <button id="picker-map-theme-standard" onclick="setPickerMapTheme('standard')" style="background: var(--accent-orange); color: #000; border: none; padding: 4px 10.5px; font-size: 9.5px; font-weight: 750; border-radius: 6px; cursor: pointer; transition: all 0.2s;">🗺️ standard</button>
              <button id="picker-map-theme-satellite" onclick="setPickerMapTheme('satellite')" style="background: #141416; color: #fff; border: none; padding: 4px 10.5px; font-size: 9.5px; font-weight: 500; border-radius: 6px; cursor: pointer; transition: all 0.2s;">🌍 satellite</button>
            </div>
            <!-- Satellite GPS Target accuracy locating crosshair button -->
            <button type="button" onclick="locateUserInPickerMap()" style="position: absolute; bottom: 12px; right: 12px; z-index: 10001; background: linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.95) 100%); color: white; border: 1px solid rgba(255,255,255,0.25); padding: 5px 12px; font-size: 9.5px; font-weight: 800; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(16,185,129,0.35); text-shadow: 0 1px 1px rgba(0,0,0,0.4); transition: transform 0.15s ease;" onmousedown="this.style.transform='scale(0.96)'" onmouseup="this.style.transform='none'">
              <span>🎯 GPS LOCATE ME / என் இருப்பிடம்</span>
            </button>
          </div>

          <div style="background: #121214; border: 1px solid #222; border-radius: 12px; padding: 10px 14px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 9px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">📍 PINPOINT SATELLITE ADDRESS</span>
              <div id="picker-accuracy-badge" style="font-size: 8.5px; font-weight: 800; padding: 2px 7px; border-radius: 4px; background: rgba(245,158,11,0.15); color: var(--accent-orange); transition: all 0.2s; text-transform: uppercase;">📡 GPS SIGNAL WAITING</div>
            </div>
            <div id="picker-address-text" style="color: #fff; font-size: 12.5px; margin-top: 4px; line-height:1.45; font-weight: 600;">Searching satellite coordinates...</div>
            <div id="picker-coords-text" style="color: var(--accent-orange); font-size: 10px; font-family: 'JetBrains Mono', monospace; margin-top: 4px;">11.58150, 77.84880</div>
          </div>

          <button class="btn btn-primary" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(220, 38, 38, 0.95) 100%); border: 1px solid rgba(255, 255, 255, 0.25); height: 38px; border-radius: 20px; font-weight: 800; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; margin: 0; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(249,115,22,0.3); text-shadow: 0 1px 1px rgba(0,0,0,0.4); transition: transform 0.15s ease;" onclick="confirmMapAddress('${targetId}')" onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='none'">
            CONFIRM THIS LOCATION / இருப்பிடத்தை உறுதிசெய் ✅
          </button>

        </div>
      `;

      document.body.appendChild(modal);

      setTimeout(() => {
        modal.classList.add('active');
        const sheet = modal.querySelector('.bottom-sheet');
        if (sheet) sheet.style.transform = 'scale(1)';

        const searchInp = document.getElementById('map-search-input');
        if (searchInp) {
          searchInp.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              searchMapAddress();
            }
          });
        }
      }, 10);

      setTimeout(() => {
        try {
          if (typeof L === 'undefined') {
            console.error("Leaflet is not defined, unable to initialize picker map.");
            const addressText = document.getElementById('picker-address-text');
            if (addressText) addressText.innerText = "⚠️ Map library failed to load. Check your internet connection!";
            return;
          }
          pickerLeafletMap = L.map('picker-map', {
            zoomControl: true,
            attributionControl: false,
            preferCanvas: true
          }).setView([currentLat, currentLng], 15);

          let initialTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
          if (pickerMapTheme === 'satellite') {
            initialTileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
          }

          pickerTileLayer = L.tileLayer(initialTileUrl, {
            maxZoom: 20,
            updateWhenIdle: true,
            keepBuffer: 2
          }).addTo(pickerLeafletMap);

          setTimeout(() => {
            setPickerMapTheme(pickerMapTheme);
          }, 30);

          const storeIcon = L.divIcon({
            html: `<div style="background: #111; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #f59e0b; box-shadow: 0 4px 15px rgba(245,158,11,0.55); font-size: 18px; line-height: 1;">🏪</div>`,
            className: 'custom-store-pin',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });
          const storeMarker = L.marker([11.5815, 77.8488], {
            draggable: false,
            icon: storeIcon
          }).addTo(pickerLeafletMap);
          storeMarker.bindPopup(`<strong>நம்ம கடை / Edappadi Kadai (Base Store)</strong><br><span style="font-size:11px; color:#aaa;">எடப்பாடி காவண்டம்பட்டி கடை மெயின் லொகேஷன்</span>`);

          const customMarkerIcon = L.divIcon({
            html: `<div style="background: #f97316; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(249,115,22,0.6); font-size: 18px; line-height: 1;">📍</div>`,
            className: 'custom-map-icon',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });

          pickerMarker = L.marker([currentLat, currentLng], {
            draggable: true,
            icon: customMarkerIcon
          }).addTo(pickerLeafletMap);

          updateAddressText(currentLat, currentLng);

          pickerMarker.on('dragend', function (e) {
            const pt = pickerMarker.getLatLng();
            updateAddressText(pt.lat, pt.lng);
          });

          pickerLeafletMap.on('click', function(e) {
            const pt = e.latlng;
            pickerMarker.setLatLng(pt);
            updateAddressText(pt.lat, pt.lng);
          });

          setTimeout(() => {
            if (pickerLeafletMap) pickerLeafletMap.invalidateSize();
          }, 400);

          if (!targetInput.getAttribute('data-lat') && !targetInput.getAttribute('data-lng')) {
            const isAdminActive = getAdminSession() ? true : false;
            if (!isAdminActive) {
              setTimeout(() => {
                actualLocateUserInPickerMap();
              }, 450);
            }
          }

        } catch (mapErr) {
          console.error("Error creating picker leaflet map:", mapErr);
        }
      }, 200);
    }

    function locateUserInPickerMap() {
      const isAdminActive = getAdminSession() ? true : false;
      if (isAdminActive) {
        showCustomConfirm(
          currentLang === 'ta' ? "⚠️ அட்மின் எச்சரிக்கை" : "⚠️ Admin Mode Warning",
          currentLang === 'ta'
            ? "நீங்கள் அட்மின்/மின்னஞ்சல் பயன்முறையில் உள்ளீர்கள்! ஜிபிஎஸ் கொண்டு இருப்பிடத்தை கண்டறிந்தால் அது உங்களது கடையின் லொகேஷனைத் தான் காட்டும், வாடிக்கையாளரின் முகவரியை அல்ல! \n\nஎனினும் உங்களது தற்போதைய GPS இருப்பிடத்தை லோட் செய்ய விரும்புகிறீர்களா?"
            : "You are actively in Admin/Staff Mode! Detecting your location via GPS coordinates will determine YOUR current physical office/shop location, NOT the customer's actual address!\n\nDo you still want to run GPS location override?",
          () => {
            actualLocateUserInPickerMap();
          }
        );
      } else {
        actualLocateUserInPickerMap();
      }
    }

    function actualLocateUserInPickerMap() {
      showToast(currentLang === 'ta' ? "📡 ஜிபிஎஸ் செயற்கைக்கோள் இருப்பிடம் அடையாளம் காணப்படுகிறது..." : "📡 Interfacing with GPS satellites for precise location...", "info");

      if (typeof AndroidStorage !== 'undefined' && typeof AndroidStorage.getNativeLocation === 'function') {
        const res = AndroidStorage.getNativeLocation();
        if (res && res !== "PERMISSION_REQUIRED" && res !== "SECURITY_ERROR" && res !== "NO_LOCATION" && !res.startsWith("ERROR") && res !== "NO_LOCATION_SERVICE") {
          try {
            const loc = JSON.parse(res);
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);
            const accuracy = parseFloat(loc.accuracy || 15);

            const accBadge = document.getElementById('picker-accuracy-badge');
            if (accBadge) {
              accBadge.innerText = currentLang === 'ta'
                ? `🎯 துல்லியம்: ±${Math.round(accuracy)}m`
                : `🎯 Accuracy: ±${Math.round(accuracy)}m`;
              accBadge.style.background = 'rgba(16,185,129,0.2)';
              accBadge.style.color = '#10b981';
            }

            if (pickerLeafletMap && pickerMarker) {
              pickerLeafletMap.setView([lat, lng], 17, { animate: false });
              pickerMarker.setLatLng([lat, lng]);
              if (window.pickerAccuracyCircle) {
                pickerLeafletMap.removeLayer(window.pickerAccuracyCircle);
              }
              window.pickerAccuracyCircle = L.circle([lat, lng], {
                radius: accuracy,
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4'
              }).addTo(pickerLeafletMap);

              updateAddressText(lat, lng);
              showToast(
                currentLang === 'ta'
                  ? `✅ இருப்பிடம் அக்குரேசியாக கண்டறியப்பட்டது (துல்லியம்: ±${Math.round(accuracy)}m)`
                  : `✅ Pinpoint location loaded (Accuracy: ±${Math.round(accuracy)}m)`,
                "success"
              );
            }
            return;
          } catch(e) {
            console.warn("Native location parse error in picker:", e);
          }
        } else if (res === "PERMISSION_REQUIRED") {
          showToast(currentLang === 'ta' ? "இருப்பிட அனுமதி தேவை! அனுமதி வழங்கப்பட்டதும் மீண்டும் முயற்சிக்கவும்." : "Location permission is required! Please grant permission and retry.", "warning");
          return;
        }
      }

      if (!navigator.geolocation) {
        showToast("Your browser/device does not support GPS Geolocation! ❌", "error");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          const accBadge = document.getElementById('picker-accuracy-badge');
          if (accBadge) {
            accBadge.innerText = currentLang === 'ta'
              ? `🎯 துல்லியம்: ±${Math.round(accuracy)}m`
              : `🎯 Accuracy: ±${Math.round(accuracy)}m`;
            if (accuracy < 15) {
              accBadge.style.background = 'rgba(16,185,129,0.2)';
              accBadge.style.color = '#10b981';
            } else if (accuracy <= 50) {
              accBadge.style.background = 'rgba(245,158,11,0.2)';
              accBadge.style.color = 'var(--accent-orange)';
            } else {
              accBadge.style.background = 'rgba(239,68,68,0.2)';
              accBadge.style.color = '#f87171';
              showToast(currentLang === 'ta'
                ? "⚠️ ஜிபிஎஸ் துல்லியம் குறைவாக உள்ளது. தயவுசெய்து மேப்பில் மேனுவலாக பின் செய்யவும்."
                : "⚠️ Low GPS accuracy under poor signal conditions. Manual pinning recommended.", "warning");
            }
          }

          if (pickerLeafletMap && pickerMarker) {
            pickerLeafletMap.setView([lat, lng], 17, { animate: false });
            pickerMarker.setLatLng([lat, lng]);

            if (window.pickerAccuracyCircle) {
              pickerLeafletMap.removeLayer(window.pickerAccuracyCircle);
            }
            window.pickerAccuracyCircle = L.circle([lat, lng], {
              radius: accuracy,
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 4'
            }).addTo(pickerLeafletMap);

            updateAddressText(lat, lng);
            showToast(
              currentLang === 'ta'
                ? `✅ இருப்பிடம் அக்குரேசியாக கண்டறியப்பட்டது (துல்லியம்: ±\s*${Math.round(accuracy)}m)`
                : `✅ Pinpoint location loaded (Accuracy: ±\s*${Math.round(accuracy)}m)`,
              "success"
            );
          }
        },
        (err) => {
          console.warn("GPS Locate Me failed:", err);
          let errMsgen = "GPS signal lost or permission denied! ❌";
          let errMsgta = "ஜிபிஎஸ் சிக்னல் கிடைக்கவில்லை அல்லது அனுமதி மறுக்கப்பட்டது! ❌";

          if (err.code === 1) {
            errMsgen = "GPS permission denied! Please check device settings. 🔓";
            errMsgta = "இருப்பிட அனுமதி மறுக்கப்பட்டது! அமைப்புகளில் மாற்றிப்பார்க்கவும். 🔓";
          } else if (err.code === 2) {
            errMsgen = "GPS network connection unavailable. 📡";
            errMsgta = "நெറ്റ്‌വർக்கு/ஜிபிஎஸ் சிக்னல் இல்லை. திறந்தவெளியில் முயற்சிக்கவும். 📡";
          }
          showToast(currentLang === 'ta' ? errMsgta : errMsgen, "error");
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0 // Disable cache to get maximum accuracy
        }
      );
    }

    async function updateAddressText(lat, lng) {
      const coordsDiv = document.getElementById('picker-coords-text');
      const addressDiv = document.getElementById('picker-address-text');
      if (coordsDiv) coordsDiv.innerText = "Satellite GPS Lock Active ✓";
      if (addressDiv) addressDiv.innerText = "🌀 Fetching satellite address details...";

      try {
        const res = await reverseGeocodeWithRetry(lat, lng);
        if (res && res.displayName) {
          const displayName = res.displayName;
          if (addressDiv) addressDiv.innerText = displayName;
          if (pickerMarker) {
            pickerMarker.bindPopup(`<strong>Your Selected Location</strong><br><span style="font-size:11px;">${displayName}</span>`);
          }
        } else {
          if (addressDiv) addressDiv.innerText = "Selected Location, Edappadi, Salem, Tamil Nadu";
        }
      } catch (e) {
        if (addressDiv) addressDiv.innerText = "Selected Location, Edappadi, Salem, Tamil Nadu";
      }
    }

    async function searchMapAddress() {
      const input = document.getElementById('map-search-input');
      const resultsDiv = document.getElementById('map-search-results');
      if (!input || !resultsDiv) return;

      const query = input.value.trim();
      if (!query) return;

      resultsDiv.innerHTML = `<span style="color:var(--text-muted); padding:4px;">Searching...</span>`;
      resultsDiv.style.display = 'flex';

      try {
        const searchQuery = query.toLowerCase().includes('salem') || query.toLowerCase().includes('edappadi') ? query : `${query}, Edappadi, Salem, Tamil Nadu`;
        const geocodeFn = getCloudFunction('geocodeDeliveryAddress');
        if (!geocodeFn) {
          resultsDiv.innerHTML = `<span style="color:var(--accent-red); padding:4px;">${currentLang === 'ta' ? "சர்வர் சேவை இன்னும் செயல்படுத்தப்படவில்லை. தயவுசெய்து பின்னர் முயற்சிக்கவும்." : "Server service is not deployed yet. Please try again later."}</span>`;
          return;
        }
        const res = await geocodeFn({ address: searchQuery });

        resultsDiv.innerHTML = '';
        if (res && res.data && res.data.latitude) {
          const item = res.data;
          const row = document.createElement('div');
          row.style.padding = '8px 10px';
          row.style.cursor = 'pointer';
          row.style.borderBottom = '1px solid #222';
          row.style.borderRadius = '6px';
          row.innerHTML = `<strong style="color:var(--accent-orange);">Located Area</strong> - <span style="font-size:10.5px; color:#aaa;">${item.displayName}</span>`;
          row.onmouseover = () => row.style.background = '#222';
          row.onmouseout = () => row.style.background = 'transparent';
          row.onclick = () => {
            const lat = parseFloat(item.latitude);
            const lon = parseFloat(item.longitude);
            if (pickerLeafletMap && pickerMarker) {
              pickerLeafletMap.setView([lat, lon], 16);
              pickerMarker.setLatLng([lat, lon]);
              updateAddressText(lat, lon);
            }
            resultsDiv.style.display = 'none';
          };
          resultsDiv.appendChild(row);
        } else {
          resultsDiv.innerHTML = `<span style="color:var(--accent-red); padding:4px;">No matching locations found. Try another search.</span>`;
        }
      } catch (err) {
        const isNotDeployed = err && (err.code === 'not-found' || err.message?.includes('not-found') || err.code === 'unimplemented');
        const errMsg = isNotDeployed
          ? (currentLang === 'ta' ? "சர்வர் சேவை இன்னும் செயல்படுத்தப்படவில்லை. தயவுசெய்து பின்னர் முயற்சிக்கவும்." : "Server service is not deployed yet. Please try again later.")
          : (currentLang === 'ta' ? "தேடல் தோல்வியடைந்தது. நெட்வொர்க் இணைப்பைச் சரிபார்க்கவும்." : "Search failed. Check network connection.");
        resultsDiv.innerHTML = `<span style="color:var(--accent-red); padding:4px;">${errMsg}</span>`;
        console.error(err);
      }
    }

    function confirmMapAddress(targetId) {
      if (!pickerMarker) return;
      const pos = pickerMarker.getLatLng();
      const addressText = document.getElementById('picker-address-text');
      const addressVal = addressText ? addressText.innerText : `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;

      if (typeof syncPrimaryUserAddress === 'function') {
        syncPrimaryUserAddress(addressVal, pos.lat, pos.lng);
      } else {
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
          targetInput.setAttribute('data-lat', pos.lat);
          targetInput.setAttribute('data-lng', pos.lng);
          targetInput.value = addressVal;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      closeMapAddressPicker();
    }

    function closeMapAddressPicker() {
      const modal = document.getElementById('map-picker-modal');
      if (modal) {
        const sheet = modal.querySelector('.bottom-sheet');
        if (sheet) sheet.style.transform = 'scale(0.9)';
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          if (pickerLeafletMap) {
            pickerLeafletMap.remove();
            pickerLeafletMap = null;
          }
          pickerMarker = null;
        }, 200);
      }
    }

    function expandProductPhotoFullscreen() {
      if (!activeProduct) return;
      const lightbox = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-img');
      const caption = document.getElementById('lightbox-caption');

      if (lightbox && img && caption) {
        img.src = getImageUrlWithCacheBuster(getProductFullImageUrl(activeProduct), activeProduct ? activeProduct.updatedAt : null);
        caption.innerHTML = `${activeProduct.tamilName}<br><small style="color:var(--text-muted); font-size:11px;">${cleanProductName(activeProduct.englishName)}</small>`;
        lightbox.style.display = 'flex';
      }
    }

    function closeLightboxModal() {
      const lightbox = document.getElementById('lightbox-modal');
      if (lightbox) {
        lightbox.style.display = 'none';
      }
    }

    function updateProductModalLayoutForUnitChange(prod, isWeight) {
      const isTa = (currentLang === 'ta');
      const unit = prod.sellingUnit || prod.unit || 'kg';

      const presetLabel = document.querySelector('#product-detail-modal label[style*="font-size: 13px"]');
      if (presetLabel) {
        presetLabel.innerText = isWeight
          ? (isTa ? "அளவுத் தேர்வு (விற்பனை எடை)" : "Select Preset Weight")
          : (isTa ? "எண்ணிக்கை தேர்வு செய்க" : "Select Preset Quantity");
      }

      const sliderLabel = document.querySelector('#product-detail-modal label[style*="custom-weight-input"]');
      const backupSliderLabel = document.querySelector('#product-detail-modal label[style*="font-size: 13px"] + div + div label'); // or direct search

      const labels = document.querySelectorAll('#product-detail-modal label');
      labels.forEach(lbl => {
        if (lbl.innerText.includes("Custom Weight") || lbl.innerText.includes("தனிப்பயன் எடை")) {
          lbl.innerText = isWeight
            ? (isTa ? "தனிப்பயன் எடை (வார்த்தைகளில்/கிராம்)" : "Custom Weight (grams)")
            : (isTa ? "தனிப்பயன் எண்ணிக்கை" : "Custom Quantity");
        }
      });

      const weightInput = document.getElementById('custom-weight-input');
      const weightSlider = document.getElementById('custom-weight-slider');

      if (weightInput && weightSlider) {
        if (isWeight) {
          weightInput.min = "50";
          weightInput.max = "5000";
          weightInput.step = "50";

          weightSlider.min = "50";
          weightSlider.max = "5000";
          weightSlider.step = "50";
        } else {
          weightInput.min = "1";
          weightInput.max = "100";
          weightInput.step = "1";

          weightSlider.min = "1";
          weightSlider.max = "100";
          weightSlider.step = "1";
        }
      }

      const sliderSpans = document.querySelectorAll('#product-detail-modal input[type="range"] + div span');
      if (sliderSpans && sliderSpans.length === 3) {
        if (isWeight) {
          const uLower = unit.toLowerCase();
          const isLitre = (uLower === 'litre' || uLower === 'litres' || uLower === 'ml' || uLower === 'milli litre' || uLower === 'milli litres');
          const unitSingle = isLitre ? (isTa ? 'லிட்டர்' : 'Litre') : (isTa ? 'கிலோ' : 'Kg');
          const unitSmall = isLitre ? (isTa ? 'மி.லி' : 'ml') : (isTa ? 'கி' : 'g');
          sliderSpans[0].innerText = `50${unitSmall} (min)`;
          sliderSpans[1].innerText = `2.5 ${unitSingle}`;
          sliderSpans[2].innerText = `5 ${unitSingle} (max)`;
        } else {
          sliderSpans[0].innerText = "1 (min)";
          sliderSpans[1].innerText = "50";
          sliderSpans[2].innerText = "100 (max)";
        }
      }

      const presets = isWeight ? [250, 500, 1000, 1500, 2000] : [1, 2, 5, 10, 12];
      const buttons = document.querySelectorAll('#product-detail-modal .btn-selector');

      let bIdx = 0;
      buttons.forEach((btn) => {
        if (bIdx < 5) {
          const val = presets[bIdx];
          btn.setAttribute('onclick', `selectPresetWeight(${val})`);

          if (isWeight) {
            const uLower = unit.toLowerCase();
            const isLitre = (uLower === 'litre' || uLower === 'litres' || uLower === 'ml' || uLower === 'milli litre' || uLower === 'milli litres');
            const unitLabel = isLitre ? 'Litre' : 'Kg';
            const unitSmall = isLitre ? 'ml' : 'g';
            btn.innerText = val >= 1000 ? `${(val/1000).toFixed(1).replace('.0','')} ${unitLabel}` : `${val}${unitSmall}`;
          } else {
            const unitTextEn = getUnitDisplay(unit, false, val);
            btn.innerText = `${val} ${unitTextEn}`;
          }
          bIdx++;
        }
      });
    }

    window.openProductModalDetail = function(productId) {
      if (!productId) return;

      let products = (typeof getDataCached === 'function' ? getDataCached('ek_products', []) : []) || [];
      if (!products || products.length === 0) products = (typeof getData === 'function' ? getData('ek_products', []) : []);
      let prod = products.find(p => p && String(p.id) === String(productId));
      if (!prod && typeof DEMO_PRODUCTS !== 'undefined' && Array.isArray(DEMO_PRODUCTS)) {
        prod = DEMO_PRODUCTS.find(p => p && String(p.id) === String(productId));
      }
      if (!prod && window._currentFilteredProducts && Array.isArray(window._currentFilteredProducts)) {
        prod = window._currentFilteredProducts.find(p => p && String(p.id) === String(productId));
      }
      if (!prod) {
        if (typeof showToast === "function") {
          showToast(currentLang === "ta" ? "தயாரிப்பு விவரங்கள் ஏற்றப்படுகின்றன..." : "Loading product details...", "info");
        }
        return;
      }
      activeProduct = prod;

      const engNameEl = document.getElementById('modal-english-name');
      if (engNameEl) engNameEl.innerText = cleanProductName(prod.englishName) || '';
      const tamNameEl = document.getElementById('modal-tamil-name');
      if (tamNameEl) tamNameEl.innerText = prod.tamilName || '';
      const priceKgEl = document.getElementById('calc-price-kg');
      if (priceKgEl) priceKgEl.innerText = getProductPriceText(prod, currentLang);
      const imgEl = document.getElementById('modal-product-img');
      if (imgEl) imgEl.src = getImageUrlWithCacheBuster(getProductFullImageUrl(prod), prod.updatedAt);

      const noteEl = document.getElementById('modal-special-notes');
      if (noteEl) noteEl.value = '';

      const unit = prod.sellingUnit || prod.unit || 'kg';
      const isWeight = isUnitWeight(unit);
      updateProductModalLayoutForUnitChange(prod, isWeight);

      const user = getActiveUser();
      const userDefault = (user && user.defaultCut) ? user.defaultCut : 'Curry Cut';
      const profile = getPreparationProfile(prod);
      if (profile && profile.options && profile.options.length > 0) {
        const hasMatch = profile.options.some(opt => opt.id.toLowerCase() === userDefault.toLowerCase());
        selectedCutStyle = hasMatch ? userDefault : profile.options[0].id;
      } else {
        selectedCutStyle = '';
      }
      updateCutStyleSelector();

      const cutGroup = document.getElementById('modal-cut-group');
      if (cutGroup) {
        cutGroup.style.display = profile ? 'block' : 'none';
      }

      if (isWeight) {
        selectPresetWeight(500);
      } else {
        selectPresetWeight(1);
      }

      const catList = getCategoriesList();
      const unavailableCategoriesSet = new Set(catList.filter(c => c.isScheduled && c.isAvailable === false).map(c => c.id));
      const isCategoryUnavailable = unavailableCategoriesSet.has(prod.category);
      const isOutOfStock = prod.isOutOfStock || prod.stockKg <= 0 || (prod.isScheduled && prod.isAvailable === false) || isCategoryUnavailable;

      const cartBtn = document.getElementById('modal-add-to-cart-btn');
      if (cartBtn) {
        if (isOutOfStock) {
          cartBtn.disabled = true;
          cartBtn.innerText = currentLang === 'ta' ? 'இல்லை (Out of Stock)' : 'Out of Stock 🔴';
          cartBtn.style.background = 'rgba(239,68,68,0.2)';
          cartBtn.style.color = 'var(--accent-red)';
          cartBtn.style.borderColor = 'rgba(239,68,68,0.4)';
        } else {
          cartBtn.disabled = false;
          cartBtn.innerText = currentLang === 'ta' ? 'கார்ட்டில் சேர் →' : 'Add to Cart →';
          cartBtn.style.background = '';
          cartBtn.style.color = '';
          cartBtn.style.borderColor = '';
        }
      }

      const backdrop = document.getElementById('product-detail-modal');
      if (backdrop) {
        backdrop.style.display = 'flex';
        backdrop.style.zIndex = '10005';
        backdrop.style.opacity = '1';
        backdrop.style.pointerEvents = 'auto';
        backdrop.classList.add('active');
        const sheet = backdrop.querySelector('.bottom-sheet');
        if (sheet) {
          sheet.style.transform = 'translateY(0)';
        }
      }
    };

    function closeProductModalDetail() {
      const backdrop = document.getElementById('product-detail-modal');
      if (backdrop) {
        const sheet = backdrop.querySelector('.bottom-sheet');
        if (sheet) sheet.style.transform = 'translateY(100%)';
        setTimeout(() => {
          backdrop.classList.remove('active');
          backdrop.style.display = 'none';
        }, 180);
      }
      activeProduct = null;
    }

    function closeProductModal(event) {
      if (event.target === document.getElementById('product-detail-modal') || event.target === document.getElementById('lightbox-modal')) {
        closeProductModalDetail();
        closeLightboxModal();
      }
    }

    function selectPresetWeight(grams) {
      if (!activeProduct) return;
      const unit = activeProduct.sellingUnit || activeProduct.unit || 'kg';
      const isWeight = isUnitWeight(unit);

      selectedWeight = grams;
      document.getElementById('custom-weight-input').value = grams;
      document.getElementById('custom-weight-slider').value = grams;

      const presets = isWeight ? [250, 500, 1000, 1500, 2000] : [1, 2, 5, 10, 12];
      const matchIdx = presets.indexOf(grams);

      document.querySelectorAll('#product-detail-modal .btn-selector').forEach((btn, i) => {
        if (i < 5) {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
          if (i === matchIdx) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
          }
        }
      });

      updateSelectedWeightCalculation();
    }

    function handleWeightSlider(val) {
      selectedWeight = parseInt(val);
      document.getElementById('custom-weight-input').value = val;
      clearPresetButtonHighlight();
      updateSelectedWeightCalculation();
    }

    function handleWeightInput(val) {
      if (!activeProduct) return;
      const unit = activeProduct.sellingUnit || activeProduct.unit || 'kg';
      const isWeight = isUnitWeight(unit);

      let v = parseInt(val) || 1;
      if (isWeight) {
        v = Math.max(50, Math.min(5000, v));
      } else {
        v = Math.max(1, Math.min(100, v));
      }

      selectedWeight = v;
      document.getElementById('custom-weight-slider').value = v;
      clearPresetButtonHighlight();
      updateSelectedWeightCalculation();
    }

    function clearPresetButtonHighlight() {
      document.querySelectorAll('#product-detail-modal .btn-selector').forEach((btn, i) => {
        if (i < 5) {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    }

    function getPreparationProfile(prod) {
      if (!prod) return null;
      const category = (prod.category || '').toLowerCase();
      const nameEn = (prod.englishName || '').toLowerCase();
      const unit = (prod.sellingUnit || prod.unit || 'kg').toLowerCase();
      const isWeight = isUnitWeight(unit);

      const profiles = {
        meat: {
          type: 'meat',
          options: [
            { id: 'Curry Cut', en: 'Curry Cut', ta: 'குழம்பு கட்' },
            { id: 'Boneless', en: 'Boneless', ta: 'எலும்பில்லாதது (Boneless)' },
            { id: 'Whole Piece', en: 'Whole Piece', ta: 'முழு இறைச்சி (Whole Piece)' }
          ],
          keywords: ['meat', 'chicken', 'mutton', 'lamb', 'beef', 'pork', 'poultry', 'turkey', 'duck', 'goat', 'organ', 'steak', 'paya', 'boti']
        },
        fish: {
          type: 'fish',
          options: [
            { id: 'Whole Fish', en: 'Whole Fish', ta: 'முழு மீன்' },
            { id: 'Curry Cut', en: 'Curry Cut', ta: 'குழம்பு துண்டு' },
            { id: 'Fillet', en: 'Fillet', ta: 'முள் இல்லாத துண்டு (Fillet)' }
          ],
          keywords: ['fish', 'seafood', 'marine', 'prawn', 'shrimp', 'crab', 'lobster', 'squid', 'octopus', 'clam', 'nethili', 'sankara', 'vanjaram']
        },
        veg: {
          type: 'veg',
          options: [
            { id: 'Whole', en: 'Whole', ta: 'முழு காய்' },
            { id: 'Chopped', en: 'Chopped', ta: 'பொடியாக நறுக்கியது (Chopped)' },
            { id: 'Sliced', en: 'Sliced', ta: 'துண்டுகளாக (Sliced)' }
          ],
          keywords: ['veg', 'vegetable', 'vegetables', 'greens', 'spinach', 'onion', 'tomato', 'potato', 'carrot', 'chilli', 'garlic', 'ginger', 'cabbage', 'cauliflower', 'brinjal', 'drumstick', 'okra', 'ladiesfinger', 'beans']
        },
        fruit: {
          type: 'fruit',
          options: [
            { id: 'Whole', en: 'Whole', ta: 'முழு பழம்' },
            { id: 'Cut Pieces', en: 'Cut Pieces', ta: 'துண்டுகளாக (Cut Pieces)' },
            { id: 'Peeled', en: 'Peeled', ta: 'தோல் நீக்கியது (Peeled)' }
          ],
          keywords: ['fruit', 'fruits', 'apple', 'banana', 'mango', 'orange', 'grape', 'papaya', 'melon', 'watermelon', 'berry', 'strawberry', 'pineapple', 'guava', 'pomegranate', 'citrus']
        }
      };

      if (profiles[category]) {
        return profiles[category];
      }
      if (category === 'chicken' || category === 'mutton' || category === 'poultry') {
        return profiles.meat;
      }
      if (category === 'seafood') {
        return profiles.fish;
      }

      for (const key in profiles) {
        if (profiles[key].keywords.some(kw => category.includes(kw))) {
          return profiles[key];
        }
      }

      for (const key in profiles) {
        if (profiles[key].keywords.some(kw => nameEn.includes(kw))) {
          return profiles[key];
        }
      }

      if (isWeight) {
        const exceptions = ['dairy', 'milk', 'egg', 'bakery', 'bread', 'grocery', 'groceries', 'beverage', 'beverages', 'snack', 'snacks', 'oil', 'ghee', 'spices', 'masala', 'rice', 'dal'];
        const isExcluded = exceptions.some(ex => category.includes(ex) || nameEn.includes(ex));
        if (!isExcluded) {
          if (category.includes('leaf') || category.includes('herb') || category.includes('garden') || category.includes('fresh')) {
            return profiles.veg;
          }
        }
      }

      return null;
    }

    function getPrepIcon(type, id) {
      if (type === 'meat') {
        if (id === 'Curry Cut') return '🍲';
        if (id === 'Boneless') return '🥩';
        if (id === 'Whole Piece') return '🍗';
      } else if (type === 'fish') {
        if (id === 'Whole Fish') return '🐟';
        if (id === 'Curry Cut') return '🍲';
        if (id === 'Fillet') return '🔪';
      } else if (type === 'veg') {
        if (id === 'Whole') return '🥦';
        if (id === 'Chopped') return '🔪';
        if (id === 'Sliced') return '🥗';
      } else if (type === 'fruit') {
        if (id === 'Whole') return '🍎';
        if (id === 'Cut Pieces') return '🥣';
        if (id === 'Peeled') return '🔪';
      }
      return '🔪';
    }

    function selectCutStyle(style) {
      selectedCutStyle = style;
      updateCutStyleSelector();
    }

    function updateModalCutStyleLabels() {
      if (!activeProduct) return;
      const isTa = (currentLang === 'ta');
      const titleEl = document.getElementById('modal-cut-title');
      const container = document.getElementById('modal-cut-options-container');
      if (!titleEl || !container) return;

      const profile = getPreparationProfile(activeProduct);
      const cutGroup = document.getElementById('modal-cut-group');

      if (!profile) {
        if (cutGroup) cutGroup.style.display = 'none';
        return;
      }

      if (cutGroup) cutGroup.style.display = 'block';

      if (profile.type === 'meat') {
        titleEl.innerText = isTa ? "இறைச்சி தயாரிப்பு முறை" : "Meat Preparation Style";
      } else if (profile.type === 'fish') {
        titleEl.innerText = isTa ? "மீன் தயாரிப்பு முறை" : "Fish Preparation Style";
      } else if (profile.type === 'veg') {
        titleEl.innerText = isTa ? "காய்கறி தயாரிப்பு முறை" : "Vegetables Preparation Style";
      } else if (profile.type === 'fruit') {
        titleEl.innerText = isTa ? "பழங்கள் தயாரிப்பு முறை" : "Fruits Preparation Style";
      }

      let html = '';
      profile.options.forEach((opt, idx) => {
        const isActive = (selectedCutStyle && selectedCutStyle.toLowerCase() === opt.id.toLowerCase());
        const icon = getPrepIcon(profile.type, opt.id);
        html += `
          <button class="btn-selector cut-options ${isActive ? 'active' : ''}"
                  id="prep-opt-${idx}"
                  onclick="selectCutStyle('${opt.id}')"
                  aria-pressed="${isActive ? 'true' : 'false'}"
                  style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px; height: auto; min-height: 54px; font-size: 11px; line-height: 1.2;">
            <span style="font-size: 16px;">${icon}</span>
            <span style="font-weight: 700;">${isTa ? opt.ta : opt.en}</span>
          </button>
        `;
      });
      container.innerHTML = html;
    }

    function getLocalizedPrepareText(cutValue, category, forceEn = false) {
      if (!cutValue) return "";
      const isTa = forceEn ? false : (currentLang === 'ta');

      const dummyProd = { category: category, englishName: '' };
      const profile = getPreparationProfile(dummyProd);
      if (!profile) return "";

      const opt = profile.options.find(o => o.id.toLowerCase() === cutValue.toLowerCase());
      if (opt) {
        return isTa ? opt.ta : opt.en;
      }
      return cutValue;
    }

    function updateCutStyleSelector() {
      updateModalCutStyleLabels();
    }

    function updateSelectedWeightCalculation() {
      if (!activeProduct) return;
      const unit = activeProduct.sellingUnit || activeProduct.unit || 'kg';
      const isWeight = isUnitWeight(unit);
      const isTa = (currentLang === 'ta');

      const qtyEl = document.getElementById('calc-qty');
      const priceKgEl = document.getElementById('calc-price-kg');
      const formulaEl = document.getElementById('calc-total-formula');
      const qtyLabelEl = document.getElementById('calc-qty-label');
      const priceLabelEl = document.getElementById('calc-price-label');

      const uLabelEn = getUnitDisplay(unit, false, 1);
      const uLabelTa = getUnitDisplay(unit, true, 1);

      if (qtyLabelEl) {
        qtyLabelEl.innerText = isTa ? "தேர்ந்தெடுக்கப்பட்ட அளவு" : "Selected Quantity";
      }

      if (priceLabelEl) {
        priceLabelEl.innerText = isTa ? `விலை (ஒரு ${uLabelTa})` : `Price per ${uLabelEn}`;
      }

      if (qtyEl) {
        qtyEl.innerText = getFormattedItemQty({ sellingUnit: unit, weightGrams: selectedWeight }, currentLang);
      }

      if (priceKgEl) {
        priceKgEl.innerText = getProductPriceText(activeProduct, currentLang);
      }

      let total = 0;
      if (isWeight) {
        total = Math.round((activeProduct.pricePerKg / 1000) * selectedWeight);
        if (formulaEl) {
          const uLower = unit.toLowerCase();
          const isLitre = (uLower === 'litre' || uLower === 'litres' || uLower === 'ml' || uLower === 'milli litre' || uLower === 'milli litres');
          const unitSingle = isLitre ? 'Litre' : 'Kg';
          formulaEl.innerText = `₹${activeProduct.pricePerKg} × ${(selectedWeight/1000).toFixed(3)} ${unitSingle} = ₹${total}`;
        }
      } else {
        total = Math.round(activeProduct.pricePerKg * selectedWeight);
        if (formulaEl) {
          const uLabel = getUnitDisplay(unit, isTa, selectedWeight);
          formulaEl.innerText = `₹${activeProduct.pricePerKg} × ${selectedWeight} ${uLabel} = ₹${total}`;
        }
      }

      document.getElementById('modal-footer-price').innerText = `₹${total}`;
    }

    function sanitizeCart(cartArr) {
      if (!Array.isArray(cartArr)) return [];
      const validItems = [];
      const seenKeys = new Map();

      cartArr.forEach(item => {
        if (!item || !item.productId) return;
        const pid = String(item.productId);
        const cut = String(item.cutStyle || 'Small Pieces');
        const note = String(item.specialNote || '').trim();
        const key = `${pid}___${cut}___${note}`;

        const unitPrice = parseFloat(item.pricePerKg || item.price) || 0;
        const unitStr = item.sellingUnit || item.unit || 'kg';
        const isWeight = isUnitWeight ? isUnitWeight(unitStr) : !(unitStr === 'piece' || unitStr === 'packet' || unitStr === 'unit' || unitStr === 'box' || unitStr === 'bunch');
        const grams = Math.max(1, parseFloat(item.weightGrams) || 1);
        const totalPrice = isWeight
          ? Math.round((unitPrice / 1000) * grams)
          : Math.round(unitPrice * grams);

        if (seenKeys.has(key)) {
          const existing = seenKeys.get(key);
          existing.weightGrams = grams; // update to latest selected weight
          existing.pricePerKg = unitPrice;
          existing.totalPrice = isWeight
            ? Math.round((unitPrice / 1000) * grams)
            : Math.round(unitPrice * grams);
          existing.price = existing.totalPrice;
        } else {
          const cleanItem = {
            ...item,
            productId: pid,
            pricePerKg: unitPrice,
            weightGrams: grams,
            unit: unitStr,
            sellingUnit: unitStr,
            cutStyle: cut,
            specialNote: note,
            totalPrice: totalPrice,
            price: totalPrice
          };
          seenKeys.set(key, cleanItem);
          validItems.push(cleanItem);
        }
      });

      return validItems;
    }
    window.sanitizeCart = sanitizeCart;

    function addToCart() {
      const btn = (typeof event !== 'undefined' && event && event.target) ? event.target.closest('button, .btn') : document.getElementById('modal-add-btn');
      if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, true);
      try {
        if (!activeProduct) return;

        const catList = getCategoriesList();
        const unavailableCategoriesSet = new Set(catList.filter(c => c.isScheduled && c.isAvailable === false).map(c => c.id));
        const isCategoryUnavailable = unavailableCategoriesSet.has(activeProduct.category);
        const isOutOfStock = activeProduct.isOutOfStock || activeProduct.stockKg <= 0 || (activeProduct.isScheduled && activeProduct.isAvailable === false) || isCategoryUnavailable;

        if (isOutOfStock) {
          showToast(currentLang === 'ta' ? "இந்த பொருள் தற்காலிகமாக ஸ்டாக்கில் இல்லை அல்லது நேரம் முடிந்துவிட்டது!" : "This product is currently out of stock or scheduled out!", "error");
          return;
        }

        if (typeof getActiveSession === 'function' && !getActiveSession()) {
          showToast(currentLang === 'ta' ? "பொருட்களை வாங்க முதலில் லாகின் அல்லது பதிவு செய்யவும்! 🛍️" : "Please login or register first to purchase products! 🛍️", "warning");
          closeProductModalDetail();
          showScreen('screen-login');
          return;
        }

        const unit = activeProduct.sellingUnit || activeProduct.unit || 'kg';
        const note = document.getElementById('modal-special-notes')?.value?.trim() || '';
        const cut = selectedCutStyle || 'Small Pieces';

        if (typeof cart === 'undefined') window.cart = [];

        const existingIdx = cart.findIndex(c => 
          String(c.productId) === String(activeProduct.id) && 
          String(c.cutStyle || 'Small Pieces') === String(cut) && 
          String(c.specialNote || '').trim() === String(note)
        );

        if (existingIdx !== -1) {
          cart[existingIdx].weightGrams = selectedWeight;
          cart[existingIdx].pricePerKg = activeProduct.pricePerKg;
        } else {
          const cartItem = {
            productId: activeProduct.id,
            tamilName: activeProduct.tamilName || activeProduct.englishName,
            englishName: activeProduct.englishName || activeProduct.tamilName,
            weightGrams: selectedWeight,
            unit: activeProduct.unit || 'kg',
            sellingUnit: unit,
            cutStyle: cut,
            category: activeProduct.category,
            specialNote: note,
            pricePerKg: activeProduct.pricePerKg,
            imageUrl: activeProduct.imageUrl,
            isFreeDeliveryEligible: Boolean(activeProduct.isFreeDeliveryEligible)
          };
          cart.push(cartItem);
        }

        saveCart();

        const standardCard = document.getElementById(`card-prod-${activeProduct.id}`);
        if (standardCard) {
          standardCard.classList.remove('product-card-pop');
          void standardCard.offsetWidth; // Force CSS reflow
          standardCard.classList.add('product-card-pop');
          setTimeout(() => {
            standardCard.classList.remove('product-card-pop');
          }, 1200);
        }
        const specialCard = document.getElementById(`card-special-${activeProduct.id}`);
        if (specialCard) {
          specialCard.classList.remove('product-card-pop');
          void specialCard.offsetWidth; // Force CSS reflow
          specialCard.classList.add('product-card-pop');
          setTimeout(() => {
            specialCard.classList.remove('product-card-pop');
          }, 1200);
        }

        const currentItem = cart.find(c => String(c.productId) === String(activeProduct.id)) || activeProduct;
        showToast(`${activeProduct.englishName} added to checkout cart!`, "success");
        closeProductModalDetail();
        showAddConfirmation(currentItem);
      } finally {
        if (btn && typeof setButtonLoading === 'function') setButtonLoading(btn, false);
      }
    }

    let addConfTimer = null;

    function showAddConfirmation(cartItem) {
      document.getElementById('add-conf-img').src = cartItem.imageUrl || '';
      document.getElementById('add-conf-name-en').innerText = cartItem.englishName || '';
      document.getElementById('add-conf-name-ta').innerText = cartItem.tamilName || cartItem.englishName || '';

      document.getElementById('add-conf-qty').innerText = getFormattedItemQty(cartItem, currentLang);

      document.getElementById('add-conf-cut').innerText = cartItem.cutStyle || 'Small Pieces';
      document.getElementById('add-conf-price').innerText = '₹' + cartItem.totalPrice;

      const modal = document.getElementById('add-confirmation-modal');
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
      }

      if (addConfTimer) clearTimeout(addConfTimer);
      addConfTimer = setTimeout(() => {
        closeAddConfirmationModal();
      }, 2000);
    }

    function closeAddConfirmationModal() {
      if (addConfTimer) {
        clearTimeout(addConfTimer);
        addConfTimer = null;
      }
      const modal = document.getElementById('add-confirmation-modal');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    }

    function goToCartFromConf() {
      closeAddConfirmationModal();
      showTab('tab-cart');
    }

    function saveCart() {
      if (typeof cart === 'undefined') window.cart = [];
      if (typeof sanitizeCart === 'function') {
        cart = sanitizeCart(cart);
      }
      saveData('ek_cart', cart);
      updateCartBadge();
      triggerCartPulse();
      if (typeof updateLyoDraftCartBar === 'function') updateLyoDraftCartBar();
      if (typeof recalculateBill === 'function') recalculateBill();
      if (!window._isSyncingCart && typeof syncManualToLyoCart === 'function') {
        syncManualToLyoCart();
      }
      if (typeof updateAllProductCardCartQty === 'function') {
        updateAllProductCardCartQty();
      }
    }
    window.saveCart = saveCart;

    function updateAllProductCardCartQty() {
      const currentCart = (typeof cart !== 'undefined' && Array.isArray(cart)) ? cart : [];
      const cartQtyMap = {};
      currentCart.forEach(item => {
        if (!item || !item.productId) return;
        const pid = String(item.productId);
        cartQtyMap[pid] = (cartQtyMap[pid] || 0) + 1;
      });

      document.querySelectorAll('.product-grid-card, .special-card').forEach(card => {
        const cardId = card.id || '';
        const pid = cardId.replace('card-prod-', '').replace('card-special-', '');
        if (!pid) return;

        const count = cartQtyMap[pid] || 0;
        const btn = card.querySelector('.btn-add-orange, .btn-primary');
        if (btn) {
          if (count > 0) {
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            btn.style.boxShadow = '0 3px 10px rgba(16,185,129,0.3)';
            const btnSpan = btn.querySelector('span');
            if (btnSpan) {
              btnSpan.innerText = `✓ IN CART (${count})`;
            } else {
              btn.innerText = `✓ IN CART (${count})`;
            }
          } else {
            btn.style.background = '';
            btn.style.boxShadow = '';
            const btnSpan = btn.querySelector('span');
            if (btnSpan) {
              btnSpan.innerText = btn.classList.contains('btn-primary') ? 'Buy ➔' : '+ ADD';
            }
          }
        }
      });
    }
    window.updateAllProductCardCartQty = updateAllProductCardCartQty;

    function triggerCartPulse() {
      const elNavBtn = document.getElementById('nav-btn-cart');
      if (elNavBtn) {
        elNavBtn.classList.remove('cart-pulse-active');
        void elNavBtn.offsetWidth; // Force CSS reflow
        elNavBtn.classList.add('cart-pulse-active');
      }
      const elWrapper = document.getElementById('nav-cart-icon-wrapper');
      if (elWrapper) {
        elWrapper.classList.remove('cart-pulse-active');
        void elWrapper.offsetWidth; // Force CSS reflow
        elWrapper.classList.add('cart-pulse-active');
      }
      const badge = document.getElementById('tab-cart-badge');
      if (badge && cart.length > 0) {
        badge.classList.remove('badge-spring-active');
        void badge.offsetWidth; // Force CSS reflow
        badge.classList.add('badge-spring-active');
      }
    }

    function updateCartBadge() {
      const badge = document.getElementById('tab-cart-badge');
      if (badge) {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? 'block' : 'none';
      }
    }

    function renderCartScreen() {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const authUser = firebase.auth().currentUser;
        if (authUser) {
          debugLog("[Diagnostic] auth UID when checkout opens: " + authUser.uid);
        } else {
          console.warn("[Diagnostic] auth UID when checkout opens: None (User is signed out or anonymous guest). Reason: Firebase currentUser is null or anonymous.");
        }
      } else {
        console.error("[Diagnostic] auth UID when checkout opens: None. Reason: Firebase SDK is not loaded.");
      }

      const container = document.getElementById('cart-items-container');
      const billingSect = document.getElementById('cart-billing-container');
      const emptyState = document.getElementById('cart-empty-state');

      if (!container) return;

      if (cart.length === 0) {
        container.innerHTML = '';
        if (billingSect) billingSect.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';
      if (billingSect) billingSect.style.display = 'block';
      let cartHtml = '';
      cart.forEach((item, index) => {
        const prep = getLocalizedPrepareText(item.cutStyle, item.category);
        const displayName = item.tamilName
          ? `${item.tamilName} (${cleanProductName(item.englishName)})`
          : cleanProductName(item.englishName);
        const displayQtyStr = getFormattedItemQty(item, currentLang);
        const displayImg = getImageUrlWithCacheBuster(getProductThumbnailUrl(item), item.updatedAt);

        let extraInfoHtml = '';
        if (item.category === 'meat' || item.category === 'fish') {
          extraInfoHtml += `
            <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700;">✂️ ${currentLang==='ta'?'வெட்டும் முறை:':'Cut style:'}</span>
              <select onchange="updateCartItemCutStyle(${index}, this.value)" style="background: #0e1319; color: var(--accent-orange); border: 1.1px solid rgba(245,158,11,0.35); border-radius: 6px; padding: 2px 6px; font-size: 10px; font-weight: 800; outline: none; cursor: pointer; height: auto; font-family: inherit; max-width: 140px;">
                <option value="Small Pieces" ${(!item.cutStyle || item.cutStyle === 'Small Pieces') ? 'selected' : ''}>🔪 Small Pieces (${currentLang==='ta'?'சிறிய':'Small'})</option>
                <option value="Curry Cut" ${item.cutStyle === 'Curry Cut' ? 'selected' : ''}>🍲 Curry Cut (${currentLang==='ta'?'குழம்பு':'Curry'})</option>
                <option value="Whole" ${item.cutStyle === 'Whole' ? 'selected' : ''}>🍗 Whole Meat (${currentLang==='ta'?'முழு':'Whole'})</option>
              </select>
            </div>
          `;
        } else if (prep) {
          extraInfoHtml += `<p style="font-size: 10.5px; margin-top: 2px; font-weight: 500; color: #94a3b8;">${escapeHtml(prep)}</p>`;
        }
        if (item.specialNote) {
          extraInfoHtml += `<p style="font-size: 10px; color: #cbd5e1; font-style: italic; margin-top: 3px;">Note: ${escapeHtml(item.specialNote)}</p>`;
        }

        const unitPriceStr = item.price ? ` • <span style="color: #64748b;">₹${item.price}/${item.unit || 'kg'}</span>` : '';
        const subtitleText = `${displayQtyStr}${unitPriceStr}`;

        const itemCard = window.renderSharedCartItemCard({
          image: displayImg,
          title: displayName,
          subtitle: subtitleText,
          totalPrice: item.totalPrice,
          qtyDisplay: displayQtyStr,
          onMinusClick: `adjustCartItemWeight(${index}, -1)`,
          onPlusClick: `adjustCartItemWeight(${index}, 1)`,
          onDeleteClick: `removeFromCart(${index})`,
          extraInfoHtml: extraInfoHtml,
          animationDelay: `${index * 0.05}s`
        });

        cartHtml += itemCard;
      });
      container.innerHTML = cartHtml;

      const user = getActiveUser();
      if (user) {
        const addressTextarea = document.getElementById('cart-delivery-address');
        if (addressTextarea) {
          if (user.address) {
            addressTextarea.value = user.address;
            if (user.latitude && user.longitude) {
              addressTextarea.setAttribute('data-lat', user.latitude);
              addressTextarea.setAttribute('data-lng', user.longitude);
            } else {
              addressTextarea.removeAttribute('data-lat');
              addressTextarea.removeAttribute('data-lng');
            }
            updateCartAddressSummary(user.address);
            hideInteractiveLocationSection();
          } else {
            showInteractiveLocationSection();
          }
          if (addressTextarea.value === user.address && user.latitude && user.longitude) {
            if (!addressTextarea.getAttribute('data-lat')) {
              addressTextarea.setAttribute('data-lat', user.latitude);
            }
            if (!addressTextarea.getAttribute('data-lng')) {
              addressTextarea.setAttribute('data-lng', user.longitude);
            }
          }
          if (!addressTextarea.dataset.bound) {
            addressTextarea.dataset.bound = "true";
            let geocodeTimeout = null;
            addressTextarea.addEventListener('input', () => {
              if (window.isProgrammaticAddressSync) {
                recalculateBill();
                return;
              }
              if (user && addressTextarea.value !== user.address) {
                addressTextarea.removeAttribute('data-lat');
                addressTextarea.removeAttribute('data-lng');
                if (addressTextarea.dataset) {
                  delete addressTextarea.dataset.lat;
                  delete addressTextarea.dataset.lng;
                }
              }
              recalculateBill();

              if (geocodeTimeout) clearTimeout(geocodeTimeout);
              const textVal = addressTextarea.value.trim();
              if (textVal.length > 5) {
                geocodeTimeout = setTimeout(async () => {
                  try {
                    const geocodeFn = getCloudFunction('geocodeDeliveryAddress');
                    if (geocodeFn) {
                      const res = await geocodeFn({ address: textVal + ', Edappadi, Salem, Tamil Nadu' });
                      if (res && res.data && res.data.latitude) {
                        const lat = parseFloat(res.data.latitude);
                        const lng = parseFloat(res.data.longitude);
                        addressTextarea.setAttribute('data-lat', lat);
                        addressTextarea.setAttribute('data-lng', lng);
                        recalculateBill();
                        debugLog(`[Debounced Geocode] Auto-geocoded address successfully to: (${lat}, ${lng})`);
                      }
                    }
                  } catch (e) {
                    console.warn("[Debounced Geocode] Auto-geocoding failed:", e);
                  }
                }, 1500);
              }
            });
          }
        }

        const ptBal = document.getElementById('cart-loyalty-balance');
        if (ptBal) ptBal.innerText = Math.round(user.loyaltyPoints);
        const ptVal = document.getElementById('cart-loyalty-value');
        if (ptVal) ptVal.innerText = Math.round(user.loyaltyPoints / 10);
      }

      if (typeof renderAllAddressCards === 'function') {
        renderAllAddressCards();
      }

      const userObj = getActiveUser();
      if (userObj) {
        const deliveryAddress = (userObj.address || "").trim();
        if (!deliveryAddress || deliveryAddress === 'Salem, Tamil Nadu') {
          setTimeout(() => {
            showToast(
              currentLang === 'ta'
                ? "தயவுசெய்து முதலில் உங்கள் வீட்டு முகவரியை சேர்க்கவும் (Please add your delivery address first)"
                : "Please add your delivery address first",
              "error"
            );
            if (typeof openSimpleAddressEditor === 'function') {
              openSimpleAddressEditor();
            }
          }, 300);
        }
      }

      document.querySelectorAll('.slot-btns').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${selectedDeliverySlot}'`)) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        }
      });

      document.querySelectorAll('.pay-btns').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${selectedPaymentMethod}'`)) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        }
      });

      recalculateBill();

      if (typeof populateCartSavedAddresses === 'function') {
        populateCartSavedAddresses();
      }
    }

    function removeFromCart(idx) {
      cart.splice(idx, 1);
      saveCart();
      renderCartScreen();
      showToast(currentLang === 'ta' ? "பொருள் கார்டிலிருந்து நீக்கப்பட்டது 🗑️" : "Item removed from checkout cart! 🗑️", "info");
    }

    function adjustCartItemWeight(idx, direction) {
      const item = cart[idx];
      if (!item) return;

      const unit = item.sellingUnit || item.unit || 'kg';
      const isWeight = isUnitWeight(unit);

      if (isWeight) {
        let nextWeight = item.weightGrams + (direction * 50);
        if (nextWeight < 50) nextWeight = 50;
        if (nextWeight > 5000) nextWeight = 5000;

        item.weightGrams = nextWeight;
        item.totalPrice = Math.round((item.pricePerKg / 1000) * nextWeight);
      } else {
        let nextQty = item.weightGrams + direction;
        if (nextQty < 1) nextQty = 1;
        if (nextQty > 100) nextQty = 100;

        item.weightGrams = nextQty;
        item.totalPrice = Math.round(item.pricePerKg * nextQty);
      }

      saveCart();
      renderCartScreen();
    }

    function updateCartItemCutStyle(idx, value) {
      if (cart[idx]) {
        cart[idx].cutStyle = value;
        saveCart();
      }
    }

    function toggleFreeGreeneryGift() {
      const checkbox = document.getElementById('cart-free-greenery');
      if (checkbox && checkbox.checked) {
        showToast(currentLang === 'ta' ? "நறுமண கறிவேப்பிலை & மல்லி தழை இலவசமாக சேர்க்கப்பட்டது! 🌿" : "Coriander & Curry Leaves bouquet added to your order for free! 🌿", "success");
      } else {
        showToast(currentLang === 'ta' ? "இலவச கறிவேப்பிலை & மல்லி தழை நீக்கப்பட்டது." : "Free coriander bouquet removed.", "info");
      }
    }

    /**
     * Infallible order financial calculation formula to ensure identical values everywhere,
     * including Subtotal, Delivery Fee, Loyalty Discount, Coupon Discount, and Grand Total.
     */
    function calculateOrderFinancials(subtotal, user, appliedCouponCode, useLoyaltyPts, cartItems = null) {
      const numericSubtotal = Math.max(0, parseFloat(subtotal) || 0);

      if (numericSubtotal <= 0) {
        return {
          subtotal: 0,
          deliveryFee: 0,
          isFreeDelivery: false,
          freeDeliveryReason: null,
          loyaltyDiscount: 0,
          couponDiscount: 0,
          grandTotal: 0,
          distance: null,
          zoneName: 'Empty Cart'
        };
      }

      const settings = getSettings();
      const currentCart = Array.isArray(cartItems) ? cartItems : (typeof cart !== 'undefined' ? cart : []);

      let deliveryFee = settings.deliveryCharge !== undefined ? parseFloat(settings.deliveryCharge) : 40;
      let distance = null;
      let zoneName = 'Flat Rate';

      let isFreeDel = false;
      let freeDelReason = null;

      if (typeof LyoAiEngine !== 'undefined' && LyoAiEngine.DeliveryChargeCalculator) {
        const delRes = LyoAiEngine.DeliveryChargeCalculator.calculateDelivery(numericSubtotal, currentCart, settings);
        isFreeDel = delRes.isFreeDelivery;
        freeDelReason = delRes.freeDeliveryReason;
      } else {
        const subtotalFree = numericSubtotal >= 500;
        const allEligible = currentCart.length > 0 && currentCart.every(item => item && item.isFreeDeliveryEligible === true);
        isFreeDel = subtotalFree || allEligible;
        freeDelReason = allEligible ? 'product' : (subtotalFree ? 'subtotal' : null);
      }

      if (user && (user.tier || '').toLowerCase() === 'gold') {
        deliveryFee = 0;
        zoneName = 'Gold Member Free Delivery';
      } else if (isFreeDel) {
        deliveryFee = 0;
        zoneName = freeDelReason === 'product' ? 'Free Delivery - Eligible Product(s)' : 'Free Delivery';
      } else if (settings.useDynamicDistancePricing) {
        const dynFee = getDynamicDeliveryCharge(numericSubtotal, user);
        deliveryFee = parseFloat(dynFee.charge) || 0;
        distance = dynFee.distance;
        zoneName = dynFee.zoneName;
      }

      let loyaltyDiscount = 0;
      if (useLoyaltyPts && user && user.loyaltyPoints > 0) {
        const maxPointsDiscount = Math.floor(parseFloat(user.loyaltyPoints) / 10) || 0;
        loyaltyDiscount = Math.min(maxPointsDiscount, numericSubtotal);
      }

      let couponDiscount = 0;

      if (appliedCouponCode) {
        const coupons = getCoupons();
        const c = coupons.find(x => x.code === appliedCouponCode);
        if (c) {
          const minAmt = parseFloat(c.minAmount) || 0;
          if (numericSubtotal >= minAmt) {
            const couponRate = parseFloat(c.rate) || 0;
            if (c.type === 'percentage') {
              couponDiscount = Math.round((numericSubtotal * couponRate) / 100);
            } else if (c.type === 'fixed') {
              couponDiscount = couponRate;
            } else if (c.type === 'freeship') {
              deliveryFee = 0;
            }

            const maxRemainingSubtotal = Math.max(0, numericSubtotal - loyaltyDiscount);
            couponDiscount = Math.min(maxRemainingSubtotal, couponDiscount);
            couponDiscount = Math.max(0, couponDiscount);
          }
        }
      }

      const baseSum = numericSubtotal + deliveryFee;
      const totalDiscounts = loyaltyDiscount + couponDiscount;
      const grandTotal = Math.max(0, Math.round(baseSum - totalDiscounts));

      return {
        subtotal: numericSubtotal,
        deliveryFee: Math.round(deliveryFee),
        isFreeDelivery: isFreeDel,
        freeDeliveryReason: freeDelReason,
        loyaltyDiscount: Math.round(loyaltyDiscount),
        couponDiscount: Math.round(couponDiscount),
        grandTotal: grandTotal,
        distance: distance,
        zoneName: zoneName
      };
    }

    function recalculateBill() {
      let subtotal = cart.reduce((acc, curr) => acc + curr.totalPrice, 0);
      const user = getActiveUser();

      if (appliedCouponCode) {
        const coupons = getCoupons();
        const activeCoupon = coupons.find(x => x.code === appliedCouponCode);
        if (activeCoupon && subtotal < parseFloat(activeCoupon.minAmount || 0)) {
          appliedCouponCode = null;
          showToast(currentLang === 'ta'
            ? "கூப்பன் குறைந்தபட்ச ஆர்டர் தேவை பூர்த்தி செய்யப்படாததால் நீக்கப்பட்டது."
            : "Coupon removed as subtotal falls below minimum requirement.",
            "info"
          );
        }
      }

      const usePointsCheckbox = document.getElementById('cart-use-loyalty');
      const useLoyaltyPts = usePointsCheckbox && usePointsCheckbox.checked;

      const financials = calculateOrderFinancials(subtotal, user, appliedCouponCode, useLoyaltyPts, cart);

      const subtotalEl = document.getElementById('bill-subtotal');
      if (subtotalEl) subtotalEl.innerText = `₹${financials.subtotal}`;

      const deliveryEl = document.getElementById('bill-delivery');
      if (deliveryEl) {
        if (financials.deliveryFee === 0) {
          deliveryEl.innerText = currentLang === 'ta' ? 'இலவசம் 🎉' : 'FREE 🎉';
        } else {
          deliveryEl.innerText = `₹${financials.deliveryFee}`;
        }
      }

      let deliveryNoteEl = document.getElementById('bill-delivery-note');
      if (!deliveryNoteEl && deliveryEl && deliveryEl.parentElement) {
        deliveryNoteEl = document.createElement('div');
        deliveryNoteEl.id = 'bill-delivery-note';
        deliveryNoteEl.style.fontSize = '11px';
        deliveryNoteEl.style.fontWeight = '700';
        deliveryNoteEl.style.textAlign = 'right';
        deliveryNoteEl.style.marginTop = '2px';
        deliveryNoteEl.style.marginBottom = '6px';
        deliveryEl.parentElement.insertAdjacentElement('afterend', deliveryNoteEl);
      }

      if (deliveryNoteEl) {
        if (financials.isFreeDelivery && financials.freeDeliveryReason === 'product') {
          deliveryNoteEl.style.display = 'block';
          deliveryNoteEl.style.color = 'var(--accent-green, #10b981)';
          deliveryNoteEl.innerText = currentLang === 'ta'
            ? '🎉 இலவச டெலிவரி - தகுதியான பொருள்'
            : '🎉 Free Delivery - Eligible Product(s) in Cart';
        } else if (financials.isFreeDelivery && financials.freeDeliveryReason === 'subtotal') {
          deliveryNoteEl.style.display = 'block';
          deliveryNoteEl.style.color = 'var(--accent-green, #10b981)';
          deliveryNoteEl.innerText = currentLang === 'ta'
            ? '🎉 ₹500 மேலான ஆர்டர்களுக்கு இலவச டெலிவரி'
            : '🎉 Free Delivery on orders above ₹500';
        } else {
          deliveryNoteEl.style.display = 'none';
        }
      }

      const discountRow = document.getElementById('bill-discount-row');
      const discountEl = document.getElementById('bill-discount');
      if (discountRow && discountEl) {
        if (financials.loyaltyDiscount > 0) {
          discountRow.style.display = 'flex';
          discountEl.innerText = `-₹${financials.loyaltyDiscount}`;
        } else {
          discountRow.style.display = 'none';
        }
      }

      const couponRow = document.getElementById('bill-coupon-row');
      const couponCodeLabel = document.getElementById('bill-coupon-code-label');
      const couponDiscountEl = document.getElementById('bill-coupon-discount');
      const couponPill = document.getElementById('cart-applied-coupon-pill');
      const couponPillVal = document.getElementById('cart-applied-coupon-value');

      if (couponRow && couponDiscountEl && couponCodeLabel) {
        if (financials.couponDiscount > 0 || (appliedCouponCode && financials.deliveryFee === 0 && getCoupons().find(x => x.code === appliedCouponCode)?.type === 'freeship')) {
          couponRow.style.display = 'flex';
          couponCodeLabel.innerText = appliedCouponCode;
          couponDiscountEl.innerText = `-₹${financials.couponDiscount}`;
          if (couponPill && couponPillVal) {
            couponPill.style.display = 'flex';
            couponPillVal.innerText = `${appliedCouponCode} (-₹${financials.couponDiscount})`;
          }
        } else {
          couponRow.style.display = 'none';
          if (couponPill) couponPill.style.display = 'none';
        }
      } else {
         if (couponPill) {
           if (appliedCouponCode) {
             couponPill.style.display = 'flex';
             couponPillVal.innerText = `${appliedCouponCode} (-₹${financials.couponDiscount})`;
           } else {
             couponPill.style.display = 'none';
           }
         }
      }

      const grandTotalEl = document.getElementById('bill-grand-total');
      if (grandTotalEl) grandTotalEl.innerText = `₹${financials.grandTotal}`;

      const pathIndicator = document.getElementById('distance-path-indicator');
      const zoneBadge = document.getElementById('indicator-zone-badge');
      const distanceText = document.getElementById('indicator-distance-text');
      const chargeText = document.getElementById('indicator-charge-text');
      const durationText = document.getElementById('indicator-duration-text');
      const distBadge = document.getElementById('distance-indicator-badge');

      if (financials.distance !== null && financials.distance !== undefined) {
        if (pathIndicator) pathIndicator.style.display = 'block';
        if (zoneBadge) zoneBadge.innerText = financials.zoneName;
        if (distanceText) distanceText.innerText = `${financials.distance.toFixed(2)} km`;
        if (chargeText) chargeText.innerText = `₹${financials.deliveryFee}`;

        let estDuration = '~15 MINS';
        if (financials.distance > 3) estDuration = `~${Math.round(financials.distance * 4)} MINS`;
        if (durationText) durationText.innerText = estDuration;

        if (distBadge) {
          distBadge.style.display = 'inline-block';
          distBadge.innerText = `${financials.distance.toFixed(2)} km`;
        }
      } else {
        if (pathIndicator) pathIndicator.style.display = 'none';
        if (distBadge) distBadge.style.display = 'none';
      }

      const elConfirmBtn = document.querySelector('button[onclick="placeOrder()"]');
      if (elConfirmBtn) {
        const settings = getSettings();
        if (settings.leaveMode) {
          elConfirmBtn.disabled = true;
          elConfirmBtn.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
          elConfirmBtn.style.color = '#9ca3af';
          elConfirmBtn.style.cursor = 'not-allowed';
          elConfirmBtn.innerHTML = "Shop on Holiday 🌴";
        } else {
          const addressTextarea = document.getElementById('cart-delivery-address');
          const deliveryAddress = addressTextarea ? addressTextarea.value.trim() : (user ? (user.address || "") : "");
          const isAddressInvalid = !deliveryAddress || deliveryAddress === 'Salem, Tamil Nadu';
          if (isAddressInvalid) {
            elConfirmBtn.disabled = true;
            elConfirmBtn.style.background = 'linear-gradient(135deg, #374151 0%, #1f2937 100%)';
            elConfirmBtn.style.color = '#9ca3af';
            elConfirmBtn.style.boxShadow = 'none';
            elConfirmBtn.style.cursor = 'not-allowed';
            elConfirmBtn.innerHTML = `<span>Add Address First</span> <span style="font-size: 15px;">📍</span>`;
          } else {
            elConfirmBtn.disabled = false;
            elConfirmBtn.style.background = 'linear-gradient(135deg, #16C47F 0%, #0F9D58 100%)';
            elConfirmBtn.style.color = '#ffffff';
            elConfirmBtn.style.boxShadow = '0 4px 12px rgba(22, 196, 127, 0.3)';
            elConfirmBtn.style.cursor = 'pointer';
            elConfirmBtn.innerHTML = `<span>Place Order</span> <span style="font-size: 15px; font-weight: 700; margin-left: 2px;">→</span>`;
          }
        }
      }

      const addressTextarea = document.getElementById('cart-delivery-address');
      if (addressTextarea) {
        updateCartAddressSummary(addressTextarea.value, financials.distance);
      }

      if (typeof updateLyoDeliveryBanner === 'function') {
        try { updateLyoDeliveryBanner(); } catch(e) {}
      }
    }

    function clearCart() {
      if (typeof cart !== 'undefined' && cart.length > 0) {
        cart = [];
        if (typeof appliedCouponCode !== 'undefined') appliedCouponCode = null;
        if (typeof saveCart === 'function') saveCart();
        if (typeof renderCartScreen === 'function') renderCartScreen();
        if (typeof updateCartBadge === 'function') updateCartBadge();
        if (typeof showToast === 'function') {
          showToast(typeof currentLang !== 'undefined' && currentLang === 'ta' ? "கார்ட் காலியாக்கப்பட்டது 🗑️" : "Cart cleared 🗑️", "info");
        }
      } else {
        if (typeof showToast === 'function') {
          showToast(typeof currentLang !== 'undefined' && currentLang === 'ta' ? "கார்ட் ஏற்கனவே காலியாக உள்ளது!" : "Cart is already empty!", "info");
        }
      }
    }