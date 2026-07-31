import os

file_path = "app/src/main/assets/index.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update bottom nav label
old_nav = '<span data-translate="lyo_ai">Edappadi Kadai</span>'
new_nav = '<span data-translate="lyo_ai">Lyo AI</span>'
if old_nav in text:
    text = text.replace(old_nav, new_nav, 1)
    print("1. Updated bottom nav tab label ✓")

# 2. Update skeleton check in renderHomeScreenProducts
old_sk = "const grid = document.getElementById('home-product-grid');\n      if (!window._hasFreshCloudData) {"
new_sk = "const grid = document.getElementById('home-product-grid');\n      let rawLocalProducts = typeof getDataCached === 'function' ? getDataCached('ek_products', []) : getData('ek_products', []);\n      if ((!rawLocalProducts || rawLocalProducts.length === 0) && !window._hasFreshCloudData) {"

if old_sk in text:
    text = text.replace(old_sk, new_sk, 1)
    print("2. Updated skeleton check gatekeeper ✓")
else:
    print("WARNING: old_sk not found in text")

# 3. Add banner rendering functions before renderHomeScreen
render_home_pos = text.find("function renderHomeScreen(forceReRender = false) {")
if render_home_pos != -1:
    banner_fns = """
let _currentCarouselIndex = 0;
let _carouselAutoTimer = null;

function renderSlidingBanners() {
  const container = document.getElementById('home-sliding-carousel');
  const outerWrapper = document.getElementById('carousel-outer-wrapper');
  if (!container) return;

  const settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS);
  const banners = (settings && Array.isArray(settings.slidingBanners) && settings.slidingBanners.length > 0)
    ? settings.slidingBanners
    : (typeof DEFAULT_SETTINGS !== 'undefined' && DEFAULT_SETTINGS.slidingBanners ? DEFAULT_SETTINGS.slidingBanners : []);

  if (!banners || banners.length === 0) {
    if (outerWrapper) outerWrapper.style.display = 'none';
    return;
  }
  if (outerWrapper) outerWrapper.style.display = 'block';

  const hash = JSON.stringify(banners.map(b => (b.id || b.image))) + '_' + (typeof currentLang !== 'undefined' ? currentLang : 'en');
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

function renderAdminBannerList(force = false) {
  const listEl = document.getElementById('admin-banner-list');
  const badgeEl = document.getElementById('admin-carousel-count-badge');
  if (!listEl) return;

  const settings = typeof getDataCached === 'function' ? getDataCached('ek_settings', DEFAULT_SETTINGS) : getData('ek_settings', DEFAULT_SETTINGS);
  const banners = (settings && Array.isArray(settings.slidingBanners)) ? settings.slidingBanners : (typeof DEFAULT_SETTINGS !== 'undefined' && DEFAULT_SETTINGS.slidingBanners ? DEFAULT_SETTINGS.slidingBanners : []);

  if (badgeEl) badgeEl.innerText = `${banners.length} Slides`;

  if (!banners || banners.length === 0) {
    listEl.innerHTML = `<p style="color: var(--text-secondary); font-size: 12px; text-align: center; padding: 12px;">No sliding banners created yet.</p>`;
    return;
  }

  let html = '';
  banners.forEach((b, idx) => {
    html += `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px; display: flex; align-items: center; gap: 12px;">
        <img src="${b.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 6px;" onError="this.onerror=null;this.src='https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800';" />
        <div style="flex: 1; min-width: 0;">
          <div style="color: var(--text-primary); font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${b.titleEn || b.titleTa || 'Banner #' + (idx+1)}</div>
          <div style="color: var(--text-secondary); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${b.subEn || b.subTa || ''}</div>
        </div>
        <button onclick="deleteSlidingBanner('${b.id}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">Delete</button>
      </div>
    `;
  });
  listEl.innerHTML = html;
}
"""
    text = text[:render_home_pos] + banner_fns + text[render_home_pos:]
    print("3. Added banner rendering functions ✓")

# 4. Add instant startup pipeline script
startup_script = """
<script>
async function initializeApplicationStartup() {
  debugLog("[STARTUP] Running fast parallel startup sequence...");
  try {
    if (typeof syncSessionKeysFromAndroidStorage === 'function') syncSessionKeysFromAndroidStorage();
  } catch (e) {}

  try {
    if (typeof applyTranslations === 'function') applyTranslations();
  } catch (e) {}

  try {
    if (typeof renderHomeScreen === 'function') renderHomeScreen();
  } catch (e) {}

  try {
    const splash = document.getElementById('screen-splash');
    if (splash && splash.classList.contains('active')) {
      splash.classList.remove('active');
      const home = document.getElementById('screen-home');
      if (home) {
        home.classList.add('active');
        if (typeof currentScreen !== 'undefined') currentScreen = 'screen-home';
      }
      const bottomNav = document.getElementById('app-bottom-nav');
      if (bottomNav) bottomNav.style.display = 'flex';
    }
  } catch (e) {}

  Promise.allSettled([
    typeof fetchSettingsOnce === 'function' ? fetchSettingsOnce() : Promise.resolve(),
    typeof fetchProductsOnce === 'function' ? fetchProductsOnce() : Promise.resolve()
  ]).then(() => {
    debugLog("[STARTUP] Parallel background fetches complete ✓");
  }).catch(err => {
    console.warn("[STARTUP] Parallel background fetch notice:", err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplicationStartup);
} else {
  initializeApplicationStartup();
}
</script>
"""

body_close_pos = text.rfind("</body>")
if body_close_pos != -1:
    text = text[:body_close_pos] + startup_script + text[body_close_pos:]
    print("4. Appended fast application startup script ✓")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("SUCCESS: Performance audit fixes applied to index.html!")
