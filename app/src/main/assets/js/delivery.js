
    function isLyoPieceUnit(unit) {
      if (!unit) return false;
      const u = unit.toLowerCase();
      return (u === "piece" || u === "unit" || u === "pcs" || u === "packet" || u === "bunch" || u === "bundle" || u === "bottle" || u === "box" || u === "cup" || u === "கட்டு" || u === "பீஸ்" || u === "லிட்டர்" || u === "பாக்கெட்" || u === "பக்கெட்");
    }

    function getLyoAiAvatarHtml(size = 28) {
      return `
        <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; font-size: ${Math.round(size * 0.55)}px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(16,185,129,0.3); border: 1.5px solid rgba(255,255,255,0.2);">
          🤖
        </div>
      `;
    }

    function autoGrowLyoInput(textarea) {
      if (!textarea) return;
      textarea.style.height = "24px";
      const scrollH = textarea.scrollHeight;
      textarea.style.height = Math.min(Math.max(24, scrollH), 160) + "px";
      if (scrollH > 160) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }

    function formatLyoMsgTime(date) {
      return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function toggleLyoAiLang() {
      currentLang = (currentLang === "ta") ? "en" : "ta";
      const label = document.getElementById("lyo-ai-lang-label");
      if (label) {
        label.innerText = currentLang === "ta" ? "தமிழ் / EN" : "English / தமிழ்";
      }
      if (typeof applyTranslations === "function") {
        applyTranslations();
      }
      renderLyoAiMessages();
    }

    function updateLyoDraftCartBar() {
      const bar = document.getElementById('lyo-ai-draft-cart-bar');
      const titleEl = document.getElementById('lyo-ai-draft-cart-title');
      const subEl = document.getElementById('lyo-ai-draft-cart-sub');
      if (!bar) return;

      const items = (typeof cart !== 'undefined' && Array.isArray(cart)) ? cart : [];
      if (items.length === 0) {
        bar.style.display = 'none';
        return;
      }

      let totalAmount = 0;
      items.forEach(i => {
        const price = parseFloat(i.totalPrice || i.price) || 0;
        totalAmount += price;
      });

      if (titleEl) {
        titleEl.textContent = currentLang === 'ta'
          ? `🛒 ${items.length} பொருட்கள் கார்ட்டில் உள்ளன • ₹${totalAmount.toFixed(2)}`
          : `🛒 ${items.length} Item(s) in AI Commerce Cart • ₹${totalAmount.toFixed(2)}`;
      }
      if (subEl) {
        subEl.textContent = currentLang === 'ta'
          ? "ஆர்டர் செய்ய 'Place Order' பொத்தானை அழுத்தவும்."
          : "Tap 'Place Order' for 1-Click Checkout.";
      }
      bar.style.display = 'flex';
    }

    function clearLyoAiCart() {
      if (typeof cart !== 'undefined') {
        cart = [];
        saveData('ek_cart', cart);
      }
      updateLyoDraftCartBar();
      if (typeof updateCartBadge === 'function') updateCartBadge();
      if (typeof updateCartUI === 'function') updateCartUI();

      showToast(
        currentLang === 'ta' ? 'கூடை காலியாக்கப்பட்டது! 🛒' : 'Cart cleared! 🛒',
        'info'
      );
    }

    function checkoutLyoAiOrder() {
      window.isLyoAiCheckout = true;
      selectedPaymentMethod = 'Cash on Delivery';
      const items = (typeof cart !== 'undefined' && Array.isArray(cart)) ? cart : [];
      if (items.length === 0) {
        showToast(
          currentLang === 'ta' ? 'கூடை காலியாக உள்ளது! 🛒' : 'Your cart is empty! 🛒',
          'warning'
        );
        return;
      }
      if (typeof openQuickOrderScreen === 'function') {
        openQuickOrderScreen();
      } else if (typeof reviewQuickOrder === 'function') {
        reviewQuickOrder();
      } else if (typeof showScreen === 'function') {
        showScreen('screen-cart');
      }
    }

    function renderLyoAiMessages() {
      const container = document.getElementById("lyo-ai-messages");
      if (!container) return;

      if (lyoAiChatHistory.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 30px 16px;">
            <div style="font-size: 42px; margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(16,185,129,0.3));">⚡</div>
            <p style="font-weight: 800; font-size: 14px; color: #fff; margin-bottom: 6px;">
              ${currentLang === "ta" ? "எடப்பாடி கடை AI வணிக என்ஜின்" : "Edappadi Kadai AI Commerce Engine"}
            </p>
            <p style="font-size: 11.5px; color: #cbd5e1; line-height: 1.5; max-width: 300px; margin: 0 auto 16px auto;">
              ${currentLang === "ta" 
                ? "வாட்ஸ்ஆப் பட்டியல், தமிழ், இங்கிலீஷ் அல்லது தங்க்லீஷில் உள்ளிடவும். AI தானாகவே கார்ட்டை தயாரித்து கணக்கிடும்!" 
                : "Paste your WhatsApp shopping list, Tamil, English, or Tanglish text. AI auto-builds your cart instantly!"}
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px; max-width: 280px; margin: 0 auto;">
              <button onclick="sendQuickLyoQuery('500g mutton, half litre milk, 30 eggs, ₹20 tomato')" class="btn" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #34d399; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; text-align: left;">
                📋 500g Mutton, Half litre milk, 30 eggs, ₹20 tomato
              </button>
              <button onclick="sendQuickLyoQuery('அரை கிலோ ஆட்டுக்கறி, 1 கிலோ தக்காளி, 30 முட்டை')" class="btn" style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; text-align: left;">
                🍗 அரை கிலோ ஆட்டுக்கறி, 1 கிலோ தக்காளி, 30 முட்டை
              </button>
            </div>
          </div>
        `;
        return;
      }

      let html = "";
      lyoAiChatHistory.forEach(msg => {
        const isUser = msg.sender === "user";
        html += `
          <div style="display: flex; gap: 8px; justify-content: ${isUser ? "flex-end" : "flex-start"}; align-items: flex-end; margin-bottom: 8px;">
            ${!isUser ? getLyoAiAvatarHtml(24) : ""}
            <div style="max-width: 88%; padding: 10px 14px; border-radius: ${isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px"}; background: ${isUser ? "linear-gradient(135deg, var(--accent-orange) 0%, #059669 100%)" : "rgba(22, 27, 34, 0.95)"}; color: #fff; border: 1px solid ${isUser ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.12)"}; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
              <div style="margin: 0; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${msg.text}</div>
              <div style="font-size: 9px; color: rgba(255,255,255,0.5); text-align: right; margin-top: 4px;">${msg.time}</div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    }

    function onLyoSendBtnClick() {
      const input = document.getElementById("lyo-ai-input");
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      lyoAiChatHistory.push({
        id: Date.now(),
        sender: "user",
        text: text,
        time: formatLyoMsgTime(new Date())
      });
      renderLyoAiMessages();
      input.value = "";
      input.style.height = "auto";
      sendLyoAiMessage(text);
    }

    function sendQuickLyoQuery(queryText) {
      if (!queryText) return;
      if (queryText === 'Clear cart' || queryText === 'கூடை காலியாக்கு' || queryText === 'கூடை காலி செய்') {
        clearLyoAiCart();
        return;
      }
      const input = document.getElementById("lyo-ai-input");
      if (input) input.value = queryText;
      onLyoSendBtnClick();
    }

    async function sendLyoAiMessage(text) {
      if (lyoIsReplying) return;
      lyoIsReplying = true;
      const typingId = "typing_" + Date.now();
      lyoAiChatHistory.push({
        id: typingId,
        sender: "assistant",
        text: currentLang === "ta" ? "AI வணிக பகுப்பாய்வு செய்கிறது... ⚡" : "AI Processing Commerce Intelligence... ⚡",
        time: formatLyoMsgTime(new Date()),
        isTyping: true
      });
      renderLyoAiMessages();

      try {
        let aiReply = "";
        aiReply = await generateAiResponse(text);

        lyoAiChatHistory = lyoAiChatHistory.filter(msg => msg.id !== typingId);
        lyoAiChatHistory.push({
          id: Date.now(),
          sender: "assistant",
          text: aiReply,
          time: formatLyoMsgTime(new Date())
        });
      } catch (err) {
        console.error("sendLyoAiMessage error:", err);
        lyoAiChatHistory = lyoAiChatHistory.filter(msg => msg.id !== typingId);
        lyoAiChatHistory.push({
          id: Date.now(),
          sender: "assistant",
          text: currentLang === "ta" ? "மன்னிக்கவும்! ஒரு பிழை ஏற்பட்டது." : "Sorry! An error occurred while processing your shopping list.",
          time: formatLyoMsgTime(new Date())
        });
      } finally {
        lyoIsReplying = false;
        renderLyoAiMessages();
        updateLyoDraftCartBar();
      }
    }

    function findClosestAlternativeProduct(unavailableProduct, activeProducts) {
      if (!unavailableProduct || !activeProducts || activeProducts.length === 0) return null;

      const targetCategory = (unavailableProduct.category || "").toLowerCase();

      const availableInCat = activeProducts.filter(p => {
        if (p.id === unavailableProduct.id) return false;
        const isOutOfStock = p.isOutOfStock || (p.stockKg !== undefined && p.stockKg <= 0) || p.isAvailable === false;
        if (isOutOfStock) return false;
        return (p.category || "").toLowerCase() === targetCategory;
      });

      if (availableInCat.length > 0) {
        return availableInCat[0];
      }

      const anyAvailable = activeProducts.filter(p => {
        if (p.id === unavailableProduct.id) return false;
        return !(p.isOutOfStock || (p.stockKg !== undefined && p.stockKg <= 0) || p.isAvailable === false);
      });

      return anyAvailable.length > 0 ? anyAvailable[0] : null;
    }

    function selectDisambiguatedProduct(productId, rawVal, amountType) {
      const allProducts = (typeof getDataCached === 'function')
        ? getDataCached('ek_products', [])
        : ((typeof getData === 'function') ? getData('ek_products', []) : []);
      const product = allProducts.find(p => p.id === productId);
      if (!product) return;

      const qtyData = LyoAiEngine.UnitQuantityConversionEngine.convertQuantity(rawVal, amountType, product);
      const cartItem = LyoAiEngine.CartBuilderEngine.buildCartItem(product, qtyData, {});

      if (typeof cart !== 'undefined') {
        LyoAiEngine.CartBuilderEngine.mergeIntoCart(cart, [cartItem]);
        saveData('ek_cart', cart);
        if (typeof updateCartBadge === 'function') updateCartBadge();
        if (typeof updateCartUI === 'function') updateCartUI();
        if (typeof updateLyoDraftCartBar === 'function') updateLyoDraftCartBar();
      }

      showToast(
        currentLang === 'ta' ? `கார்ட்டில் சேர்க்கப்பட்டது: ${product.tamilName}` : `Added to cart: ${product.englishName}`,
        'success'
      );
    }

    async function generateAiResponse(inputText) {
      const allProducts = (typeof getDataCached === 'function')
        ? getDataCached('ek_products', [])
        : ((typeof getData === 'function') ? getData('ek_products', []) : []);

      const activeProducts = allProducts.filter(p => p.isActive !== false);

      if (!activeProducts || activeProducts.length === 0) {
        return currentLang === 'ta'
          ? "மன்னிக்கவும்! கடையில் பொருட்கள் எதுவும் தற்பொழுது கிடைக்கவில்லை."
          : "Sorry, no active products are currently available in the store catalog.";
      }

      // Step 1: Gemini AI Orchestrator extracts intent
      const parsedItems = await LyoAiEngine.GeminiAiOrchestrator.orchestrateParse(inputText, activeProducts);

      if (!parsedItems || parsedItems.length === 0) {
        return currentLang === 'ta'
          ? "மன்னிக்கவும்! உங்கள் பட்டியலில் உள்ள பொருட்களை என்னால் அடையாளம் காண முடியவில்லை. உதாரணம்: '500g Mutton, ₹20 Tomato, Half litre milk, 30 eggs'."
          : "Could not identify items in your list. Try typing items like: '500g Mutton, ₹20 Tomato, Half litre milk, 30 eggs, 1kg Chicken'.";
      }

      // Step 2: Error Recovery & Validation Engine resolves matching, stock, and disambiguation
      const { resolvedCartItems, unavailableNotes, disambiguationPrompts } = LyoAiEngine.ErrorRecoveryValidationEngine.validateAndRecover(parsedItems, activeProducts);

      // Handle Disambiguation UI if low confidence items exist
      let disambiguationHtml = "";
      if (disambiguationPrompts.length > 0) {
        disambiguationPrompts.forEach(dp => {
          disambiguationHtml += `
            <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 10px; margin-bottom: 8px;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #fbbf24;">
                🤔 ${currentLang === 'ta' ? `"${dp.queryName}" - எந்த பொருளைத் தேர்வு செய்ய வேண்டும்?` : `Which product did you mean for "${dp.queryName}"?`}
              </p>
              <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
                ${dp.candidates.map(c => `
                  <button onclick="selectDisambiguatedProduct('${c.id}', ${dp.rawVal}, '${dp.amountType}')" class="btn" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; white-space: nowrap;">
                    ${c.englishName} (₹${c.pricePerKg}/${c.unit||'kg'})
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        });
      }

      if (resolvedCartItems.length === 0 && disambiguationPrompts.length === 0) {
        return currentLang === 'ta'
          ? "மன்னிக்கவும்! நீங்கள் கேட்ட பொருட்கள் தற்பொழுது ஸ்டாக்கில் இல்லை."
          : "Sorry! None of the requested items are currently available in stock.";
      }

      // Step 3: Cart Builder Engine merges resolved items into active cart
      if (resolvedCartItems.length > 0 && typeof cart !== 'undefined') {
        LyoAiEngine.CartBuilderEngine.mergeIntoCart(cart, resolvedCartItems);
        saveData('ek_cart', cart);
        if (typeof updateCartBadge === 'function') updateCartBadge();
        if (typeof updateCartUI === 'function') updateCartUI();
        if (typeof updateLyoDraftCartBar === 'function') updateLyoDraftCartBar();
      }

      // Step 4: Pricing, Offers & Delivery Charge Engine
      const settings = (typeof getData === 'function') ? getData('ek_settings', DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
      const subtotal = resolvedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

      const pricing = LyoAiEngine.PricingOfferEngine.calculatePricing(subtotal, settings);

      let html = `
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 14px; padding: 12px; margin-top: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 10px;">
            <span style="font-weight: 800; font-size: 12.5px; color: #10b981; display: flex; align-items: center; gap: 6px;">
              ⚡ ${currentLang === 'ta' ? 'AI வணிக மேலாண்மை கார்ட் தயாரிக்கப்பட்டது' : 'AI Commerce Cart Generated'}
            </span>
            <span style="font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 8px; border-radius: 10px; font-weight: 700;">
              ${resolvedCartItems.length} ${currentLang === 'ta' ? 'பொருட்கள்' : 'Items'}
            </span>
          </div>

          ${disambiguationHtml}

          <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;">
      `;

      resolvedCartItems.forEach(item => {
        const isW = isUnitWeight ? isUnitWeight(item.unit) : true;
        const displayQty = isW
          ? (item.weightGrams >= 1000 ? `${(item.weightGrams/1000).toFixed(2)} kg` : `${item.weightGrams}g`)
          : `${item.quantity} ${item.unit || 'pcs'}`;

        html += `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 8px 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
              ${item.imageUrl ? `<img src="${item.imageUrl}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);" />` : `<div style="width:32px; height:32px; border-radius:6px; background:#1c1c1e; display:flex; align-items:center; justify-content:center; font-size:14px;">🛍️</div>`}
              <div style="overflow: hidden;">
                <div style="font-weight: 700; font-size: 11.5px; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                  ${item.englishName} <span style="font-size: 10px; color: var(--text-muted);">(${item.tamilName})</span>
                </div>
                <div style="font-size: 10px; color: #34d399; margin-top: 1px;">
                  ${displayQty} • <span style="color: var(--text-muted);">₹${item.pricePerKg}/${item.unit}</span>
                  ${item.isSubstituted ? `<span style="display:inline-block; margin-left:4px; font-size:9px; background:rgba(245,158,11,0.2); color:#fbbf24; padding:1px 4px; border-radius:4px;">⚠️ ${currentLang === 'ta' ? 'மாற்றுப் பொருள்' : 'Substituted'}</span>` : ''}
                </div>
              </div>
            </div>
            <div style="font-weight: 800; font-size: 12px; color: #fff; flex-shrink: 0; margin-left: 6px;">
              ₹${item.totalPrice}
            </div>
          </div>
        `;
      });

      html += `</div>`;

      if (unavailableNotes.length > 0) {
        html += `
          <div style="font-size: 10px; color: #f87171; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 6px 10px; margin-bottom: 8px;">
            ⚠️ ${currentLang === 'ta' ? 'கிடைக்காதவை' : 'Not available'}: ${unavailableNotes.join(', ')}
          </div>
        `;
      }

      html += `
        <div style="background: rgba(0,0,0,0.35); border-radius: 8px; padding: 8px 10px; font-size: 11px; color: #ccc; display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between;">
            <span>${currentLang === 'ta' ? 'பொருட்கள் தொகை' : 'Items Subtotal'}</span>
            <span style="font-weight: 700; color: #fff;">₹${pricing.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>${currentLang === 'ta' ? 'டெலிவரி கட்டணம்' : 'Delivery Charge'}</span>
            <span style="font-weight: 700; color: ${pricing.isFreeDelivery ? '#34d399' : '#fff'};">
              ${pricing.isFreeDelivery ? (currentLang === 'ta' ? 'இலவசம் 🎉' : 'FREE 🎉') : `₹${pricing.deliveryCharge}`}
            </span>
          </div>
          ${pricing.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; color: #34d399;">
            <span>${currentLang === 'ta' ? 'தள்ளுபடி' : 'Discount Applied'}</span>
            <span style="font-weight: 700;">-₹${pricing.discount}</span>
          </div>
          ` : ''}
          <div style="border-top: 1px dashed rgba(255,255,255,0.15); margin-top: 2px; padding-top: 4px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 800; color: #fff;">
            <span>${currentLang === 'ta' ? 'மொத்தம் செலுத்த வேண்டிய தொகை' : 'Final Payable Amount'}</span>
            <span style="color: #10b981;">₹${pricing.finalPayable}</span>
          </div>
        </div>
      `;

      if (!pricing.meetsMinOrder) {
        const diff = pricing.minOrderAmount - pricing.subtotal;
        html += `
          <div style="font-size: 10.5px; color: #fbbf24; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); border-radius: 8px; padding: 6px; text-align: center; margin-bottom: 8px;">
            ⚠️ ${currentLang === 'ta' ? `குறைந்தபட்ச ஆர்டர் தொகையை எட்ட மேலும் ₹${diff} சேர்க்கவும்.` : `Add ₹${diff} more to meet minimum order requirement of ₹${pricing.minOrderAmount}.`}
          </div>
        `;
      }

      html += `
        <button onclick="checkoutLyoAiOrder()" class="btn btn-success" style="width: 100%; padding: 12px; font-size: 13px; font-weight: 800; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; border: 1px solid rgba(255,255,255,0.2) !important; box-shadow: 0 4px 15px rgba(16,185,129,0.3) !important; color: #fff; cursor: pointer;">
          ⚡ ${currentLang === 'ta' ? `ஒரு கிளிக் ஆர்டர் செய்க (₹${pricing.finalPayable})` : `Proceed to 1-Click Checkout (₹${pricing.finalPayable})`}
        </button>
      </div>
      `;

      return html;
    }

function updateRiderLiveLocation() {
      const session = getData('ek_delivery_session', null);
      if (!session) return;

      debugLog("[Rider Tracker] Attempting to fetch rider coordinates dynamically...");

      const successCallback = (lat, lng, accuracy) => {
        const list = getData('ek_delivery_persons', []);
        const idx = list.findIndex(x => x.id === session.id);
        if (idx !== -1) {
          list[idx].latitude = lat;
          list[idx].longitude = lng;
          list[idx].accuracy = accuracy || 15;
          list[idx].lastLiveUpdate = new Date().toISOString();
          saveData('ek_delivery_persons', list);

          if (typeof AndroidStorage !== 'undefined' && typeof AndroidStorage.saveData === 'function') {
            AndroidStorage.saveData('ek_delivery_persons', JSON.stringify(list));
          }

          if (db) {
            db.collection('ek_delivery_persons').doc(session.id).set({
              latitude: lat,
              longitude: lng,
              accuracy: accuracy || 15,
              lastLiveUpdate: new Date().toISOString()
            }, { merge: true })
            .then(() => debugLog("[Rider Tracker] Cloud GPS updated!"))
            .catch(err => {
              console.warn("Cloud GPS update failed:", err);
              queueFailedSync('ek_delivery_persons', session.id, 'set', {
                latitude: lat,
                longitude: lng,
                accuracy: accuracy || 15,
                lastLiveUpdate: new Date().toISOString()
              });
            });
          } else {
            queueFailedSync('ek_delivery_persons', session.id, 'set', {
              latitude: lat,
              longitude: lng,
              accuracy: accuracy || 15,
              lastLiveUpdate: new Date().toISOString()
            });
          }

          const activeBtn = document.querySelector('#screen-delivery .admin-tab.active');
          const isAssignedSelected = activeBtn && activeBtn.id === 'btn-delivery-filter-assigned';
          if (isAssignedSelected) {
            const orders = getData('ek_orders', []);
            const assignedActive = orders.filter(o =>
              (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) &&
              ['ready', 'delivering'].includes(o.status)
            );
            const activeOrder = assignedActive.find(o => o.status === 'delivering') || assignedActive.find(o => o.status === 'ready');
            if (activeOrder && typeof initDeliveryRiderMap === 'function') {
              initDeliveryRiderMap(activeOrder);
            }
          }
        }
      };

      if (typeof AndroidStorage !== 'undefined' && typeof AndroidStorage.getNativeLocation === 'function') {
        const res = AndroidStorage.getNativeLocation();
        if (res && res !== "PERMISSION_REQUIRED" && res !== "SECURITY_ERROR" && res !== "NO_LOCATION" && !res.startsWith("ERROR") && res !== "NO_LOCATION_SERVICE") {
          try {
            const loc = JSON.parse(res);
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);
            const accuracy = parseFloat(loc.accuracy || 15);
            if (!isNaN(lat) && !isNaN(lng)) {
              successCallback(lat, lng, accuracy);
              return;
            }
          } catch(e) {
            console.warn("[Rider Tracker] Passive native coordinate parse error:", e);
          }
        } else if (res === "PERMISSION_REQUIRED") {
          console.warn("[Rider Tracker] Native permissions requested or not granted yet.");
        }
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = pos.coords.accuracy;
            successCallback(lat, lng, acc);
          },
          (err) => {
            console.warn("[Rider Tracker] HTML5 GPS fallback failed:", err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }

    function updateRiderLiveLocationManual() {
      const session = getData('ek_delivery_session', null);
      if (!session) {
        showToast(currentLang === 'ta' ? "அனுமதி மறுக்கப்பட்டது! முதலில லாகின் செய்யவும்." : "Access Denied! Please login first.", "error");
        return;
      }

      showToast(currentLang === 'ta' ? "📡 ஜிபிஎஸ் லொகேஷன் தேடப்படுகிறது..." : "📡 Scanning satellite GPS location...", "info");

      const successManual = (lat, lng, accuracy) => {
        const list = getData('ek_delivery_persons', []);
        const idx = list.findIndex(x => x.id === session.id);
        if (idx !== -1) {
          list[idx].latitude = lat;
          list[idx].longitude = lng;
          list[idx].accuracy = accuracy || 15;
          list[idx].lastLiveUpdate = new Date().toISOString();
          saveData('ek_delivery_persons', list);

          if (typeof AndroidStorage !== 'undefined' && typeof AndroidStorage.saveData === 'function') {
            AndroidStorage.saveData('ek_delivery_persons', JSON.stringify(list));
          }

          if (db) {
            db.collection('ek_delivery_persons').doc(session.id).set({
              latitude: lat,
              longitude: lng,
              accuracy: accuracy || 15,
              lastLiveUpdate: new Date().toISOString()
            }, { merge: true })
            .then(() => {
              showToast(currentLang === 'ta'
                ? `✅ ஜிபிஎஸ் லொகேஷன் வெற்றிகரமாக புதுப்பிக்கப்பட்டது! (` + Math.round(accuracy) + `m துல்லியம்)`
                : `✅ GPS location updated successfully! (` + Math.round(accuracy) + `m accuracy)`, "success");
              renderDeliveryScreen();
            })
            .catch(err => {
              console.warn("Cloud GPS update failed:", err);
              showToast("Location updated locally (Cloud update pending)", "info");
              renderDeliveryScreen();
            });
          } else {
            showToast("Location updated locally (Offline)", "info");
            renderDeliveryScreen();
          }
        }
      };

      if (typeof AndroidStorage !== 'undefined' && typeof AndroidStorage.getNativeLocation === 'function') {
        const res = AndroidStorage.getNativeLocation();
        if (res && res !== "PERMISSION_REQUIRED" && res !== "SECURITY_ERROR" && res !== "NO_LOCATION" && !res.startsWith("ERROR") && res !== "NO_LOCATION_SERVICE") {
          try {
            const loc = JSON.parse(res);
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);
            const accuracy = parseFloat(loc.accuracy || 15);
            if (!isNaN(lat) && !isNaN(lng)) {
              successManual(lat, lng, accuracy);
              return;
            }
          } catch(e) {
            console.warn("[Rider Tracker] Manual native location parse error:", e);
          }
        } else if (res === "PERMISSION_REQUIRED") {
          showToast(currentLang === 'ta' ? "இருப்பிட அனுமதி தேவை! அனுமதி வழங்கியதும் முயற்சிக்கவும்." : "Location permission is required! Please grant and retry.", "warning");
          return;
        } else if (res === "NO_LOCATION_SERVICE") {
          showToast(currentLang === 'ta' ? "மொபைல் போனில் ஜிபிஎஸ் லொகேஷனை ஆன் செய்யவும்!" : "Please turn on GPS/Location Services in settings!", "warning");
          return;
        }
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = pos.coords.accuracy;
            successManual(lat, lng, acc);
          },
          (err) => {
            console.warn("[Rider Tracker] HTML5 Manual GPS failed:", err);
            let errMsg = currentLang === 'ta'
              ? "ஜிபிஎஸ் சிக்னல் இல்லை! திறந்தவெளிக்குச் சென்று முயற்சிக்கவும்."
              : "GPS signal unavailable! Please move to an open area and retry.";
            if (err.code === 1) {
              errMsg = currentLang === 'ta' ? "இருப்பிட அனுமதி மறுக்கப்பட்டது! அமைப்புகளில் மாற்றவும்." : "Location permission denied! Please check phone settings.";
            }
            showToast(errMsg, "error");
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        showToast("Your browser/device does not support GPS Geolocation! ❌", "error");
      }
    }

    function renderDeliveryScreen() {
      const session = getData('ek_delivery_session', null);
      if (!session) {
        showScreen('screen-login');
        return;
      }

      updateRiderLiveLocation();
      if (!window.riderLiveCoordInterval) {
        window.riderLiveCoordInterval = setInterval(updateRiderLiveLocation, 15000);
      }

      document.getElementById('delivery-exec-header-name').innerText = `Rider: ${session.name}`;
      document.getElementById('delivery-exec-name-display').innerText = `Rider: ${session.name} 🏍️`;

      const rawOrders = getDataCached('ek_orders', []);
      const deletedOrderIds = getDeletedOrderIds();
      const orders = rawOrders.filter(o => !deletedOrderIds.includes(o.id) && o.hiddenByAdmin !== true);

      const completedToday = orders.filter(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) && isDeliveredOrderStatus(o.status));
      const assignedActive = orders.filter(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) && (isReadyOrderStatus(o.status) || isPendingOrderStatus(o.status)));

      let cashToCollect = 0;
      assignedActive.forEach(o => {
        const isUpi = o.paymentMethod && (o.paymentMethod.toUpperCase().includes('UPI') || o.paymentMethod.toUpperCase().includes('ONLINE') || o.upiTxnId);
        if (!isUpi && (o.paymentMethod === 'Cash on Delivery' || o.paymentMethod === 'Cash' || !o.paymentMethod)) {
          cashToCollect += o.totalAmount;
        }
      });

      const allExecutives = getDataCached('ek_delivery_persons', []);
      const riderConfig = allExecutives.find(e => e.id === session.id);

      const salaryType = riderConfig?.salaryType || 'per_order';
      const salaryRate = parseFloat(riderConfig?.salaryRate || 35);

      const completedAllTime = orders.filter(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) && isDeliveredOrderStatus(o.status));

      let todayEarnings = 0;
      if (salaryType === 'per_order') {
        todayEarnings = completedToday.length * salaryRate;
      } else {
        todayEarnings = Math.round((salaryRate / 30) * completedToday.length * 10) / 10;
      }

      document.getElementById('delivery-exec-count').innerText = completedToday.length;
      document.getElementById('delivery-exec-cash').innerText = `₹${cashToCollect}`;

      const earningsEl = document.getElementById('delivery-exec-earnings');
      if (earningsEl) {
        if (salaryType === 'per_order') {
          earningsEl.innerText = `₹${todayEarnings}`;
        } else {
          earningsEl.innerText = `₹${salaryRate}`;
        }
      }

      const bannerEl = document.getElementById('delivery-exec-salary-banner');
      if (bannerEl) {
        let typeText = salaryType === 'per_order'
          ? `Per Order (₹${salaryRate})`
          : `Fixed Monthly (₹${salaryRate})`;

        let earnText = salaryType === 'per_order'
          ? `₹${completedAllTime.length * salaryRate}`
          : `₹${salaryRate} Guaranteed`;

        bannerEl.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #222;">
            <span style="color:#888; font-size:12px;">💼 Payout Plan:</span>
            <span style="color:#fff; font-weight:bold; font-size:13px; text-align:right;">${typeText}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #222;">
            <span style="color:#888; font-size:12px;">📦 Completed Total:</span>
            <span style="color:#2ecc71; font-weight:bold; font-size:13px; text-align:right;">${completedAllTime.length} orders</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #222;">
            <span style="color:#888; font-size:12px;">💰 Accumulated Earnings:</span>
            <span style="color:#f59e0b; font-weight:bold; font-size:13px; text-align:right;">${earnText}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #222;">
            <span style="color:#888; font-size:12px;">⭐ Service Rating:</span>
            <span style="color:#f59e0b; font-weight:bold; font-size:13px; text-align:right;">
              ${riderConfig?.averageRating ? `★ ${riderConfig.averageRating} (${riderConfig.totalRatings || 0} reviews)` : 'No ratings yet'}
            </span>
          </div>
        `;
      }

      const readyForPick = orders.filter(o => !(o.assignedExecutiveId || o.deliveryExecutiveId) && isReadyOrderStatus(o.status));
      const assignedRider = orders.filter(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) && !isDeliveredOrderStatus(o.status) && !isCancelledOrderStatus(o.status));
      const historyRider = orders.filter(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) && isDeliveredOrderStatus(o.status));

      document.getElementById('count-delivery-assigned').innerText = assignedRider.length;
      document.getElementById('count-delivery-ready').innerText = readyForPick.length;
      const histBadg = document.getElementById('count-delivery-history');
      if (histBadg) histBadg.innerText = historyRider.length;

      document.querySelectorAll('#screen-delivery .admin-tab').forEach(btn => {
        btn.classList.remove('active');
      });
      const activeBtnId = `btn-delivery-filter-${currentDeliveryFilter}`;
      const activeBtn = document.getElementById(activeBtnId);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }

      const activeDeliveringOrder = assignedRider.find(o => o.status === 'delivering') || assignedRider.find(o => o.status === 'ready');
      if (activeDeliveringOrder && currentDeliveryFilter === 'assigned') {
        initDeliveryRiderMap(activeDeliveringOrder);
      } else {
        initDeliveryRiderMap(null);
      }

      const container = document.getElementById('delivery-orders-list');
      if (!container) return;
      container.innerHTML = '';

      let rawListToDisplay = [];
      if (currentDeliveryFilter === 'assigned') {
        rawListToDisplay = assignedRider;
      } else if (currentDeliveryFilter === 'ready') {
        rawListToDisplay = readyForPick;
      } else if (currentDeliveryFilter === 'history') {
        rawListToDisplay = historyRider;
      }

      const seenOrderIds = new Set();
      let listToDisplay = [];
      rawListToDisplay.forEach(o => {
        if (!o || !o.id) return;
        if (seenOrderIds.has(o.id)) {
          console.warn("[Rider System Developer Assert] Duplicate orderId detected in renderDeliveryScreen: ", o.id);
        } else {
          seenOrderIds.add(o.id);
          listToDisplay.push(o);
        }
      });

      listToDisplay.sort((a, b) => safeParseTime(b.createdAt) - safeParseTime(a.createdAt));

      if (listToDisplay.length === 0) {
        container.innerHTML = `
          <div class="card" style="text-align:center; padding:30px; border-color:#222; color:var(--text-muted); font-size:13px;">
            No orders in this category! 📦
          </div>
        `;
        return;
      }

      let ordersHtml = '';
      window.expandedDeliveryOrders = window.expandedDeliveryOrders || {};

      if (currentDeliveryFilter === 'history') {
        ordersHtml += `
          <div style="background: rgba(245, 158, 11, 0.05); border: 1.5px solid rgba(245, 158, 11, 0.15); border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <span style="font-size: 11px; color: #aaa; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px;">📜 ${currentLang === 'ta' ? "விவரக் கட்டுப்பாடு" : "History Tools"}</span>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn" style="background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.12); color: #fff; font-size: 11px; font-weight: 850; padding: 4px 10px; border-radius: 8px; cursor: pointer; height: auto; margin: 0;" onclick="toggleAllDeliveryOrders(true)">
                ➕ ${currentLang === 'ta' ? "விரிவாக்கு" : "Expand All"}
              </button>
              <button type="button" class="btn" style="background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.12); color: #fff; font-size: 11px; font-weight: 850; padding: 4px 10px; border-radius: 8px; cursor: pointer; height: auto; margin: 0;" onclick="toggleAllDeliveryOrders(false)">
                ➖ ${currentLang === 'ta' ? "சுருக்கு" : "Collapse All"}
              </button>
            </div>
          </div>
        `;
      }

      listToDisplay.forEach(o => {
        const dateStr = new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        let statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 10px; font-weight: bold; background: rgba(59, 130, 246, 0.15); color: #3b82f6; white-space: nowrap;">READY 📦</span>`;
        if (o.status === 'delivering') {
          statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 10px; font-weight: bold; background: rgba(245, 158, 11, 0.15); color: #f59e0b; white-space: nowrap;">DELIVERING 🚴</span>`;
        } else if (o.status === 'delivered') {
          statusBadge = `<span style="font-size: 11px; padding: 4px 8px; border-radius: 10px; font-weight: bold; background: rgba(34, 197, 94, 0.15); color: #2ecc71; white-space: nowrap;">DELIVERED ✅</span>`;
        }

        const itemsList = o.items.map(i => {
          const prep = getLocalizedPrepareText(i.cutStyle, i.category, true);
          const prepStr = prep ? ` [${prep}]` : '';
          return `• ${i.englishName || i.tamilName} - <strong>${getFormattedItemQty(i, currentLang)}</strong>${prepStr}`;
        }).join('<br>');

        let actionBtn = '';
        if (currentDeliveryFilter === 'ready') {
          actionBtn = `
            <button class="btn" style="background: #f59e0b; border: none; color: #000; font-size: 14px; font-weight: bold; min-height: 46px; height: auto; padding: 10px 16px; border-radius: 12px; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(245,158,11,0.25); box-sizing: border-box;" onclick="claimOrderForDelivery('${o.id}')">
              🙋‍♂️ Claim Order
            </button>
          `;
        } else if (currentDeliveryFilter === 'assigned') {
          if (o.status === 'ready') {
            actionBtn = `
              <button class="btn" style="background: #3b82f6; border: none; color: #fff; font-size: 14px; font-weight: bold; min-height: 46px; height: auto; padding: 10px 16px; border-radius: 12px; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(59,130,246,0.25); box-sizing: border-box;" onclick="updateDeliveryOrderStatus('${o.id}', 'delivering')">
                🚴‍♂️ Start Delivery
              </button>
            `;
          } else if (o.status === 'delivering') {
            actionBtn = `
              <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                <button class="btn" style="background: #2ecc71; border: none; color: #fff; font-size: 14px; font-weight: bold; min-height: 48px; height: auto; padding: 12px 18px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(46,204,113,0.3); box-sizing: border-box;" onclick="quickCompleteDelivery('${o.id}')">
                  📦 Mark Delivered
                </button>
                <button class="btn" style="background: #1a1a2e; border: 1px solid #444; color: #fff; font-size: 13px; font-weight: 600; min-height: 42px; height: auto; padding: 10px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;" onclick="openDeliveryVerification('${o.id}')">
                  ✍️ Customer Signature
                </button>
              </div>
            `;
          }
        }

        let proofHtml = '';
        if (o.status === 'delivered') {
          if (o.customerSignature && o.customerSignature.startsWith('data:image')) {
            proofHtml = `
              <div style="margin-top: 10px; border:1px solid #1c1c1e; padding:6px 10px; border-radius:8px; background:#050505; display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:11px; color:var(--text-muted);">✍️ Signature Proof:</span>
                <img src="${o.customerSignature}" style="max-height:28px; max-width:110px; filter: hue-rotate(140deg); background:#000; border-radius:4px; padding:1.5px; border:1px solid #222;" />
              </div>
            `;
          } else {
            proofHtml = `
              <div style="margin-top: 10px; border:1px solid #1c1c1e; padding:6px 10px; border-radius:8px; background:#050505; display:flex; align-items:center; justify-content:space-between;">
                <span style="font-size:11px; color:var(--text-muted);">✍️ Proof status:</span>
                <span class="badge" style="background:rgba(34,197,94,0.12); color:var(--accent-green); font-size:9.5px; border:1px solid rgba(34,197,94,0.3);">✓ Done</span>
              </div>
            `;
          }
        }

        let borderLeftColor = 'var(--accent-blue)';
        if (o.status === 'delivering') {
          borderLeftColor = 'var(--accent-orange)';
        } else if (o.status === 'delivered') {
          borderLeftColor = 'var(--accent-green)';
        }

        const isUpi = o.paymentMethod && (o.paymentMethod.toUpperCase().includes('UPI') || o.paymentMethod.toUpperCase().includes('ONLINE') || o.upiTxnId);
        const paymentBadge = isUpi 
          ? `<span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid rgba(16, 185, 129, 0.4); color: #10b981; font-weight: 800; font-size: 10px; padding: 2.5px 6.5px; border-radius: 6px; text-transform: uppercase;">📱 UPI PAY (PAID)</span>`
          : `<span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1.5px solid rgba(245, 158, 11, 0.4); color: #f59e0b; font-weight: 800; font-size: 10px; padding: 2.5px 6.5px; border-radius: 6px; text-transform: uppercase;">💵 COD (CASH)</span>`;

        const mapQuery = encodeURIComponent(o.deliveryAddress);
        const isCollapsed = currentDeliveryFilter === 'history' && !window.expandedDeliveryOrders[o.id];

        let cardHtml = '';
        if (isCollapsed) {
          cardHtml = `
            <div class="card" onclick="toggleDeliveryOrderCollapse('${o.id}')" style="margin-bottom:8px; padding:12px; border-color:#222; border-left:4px solid ${borderLeftColor}; cursor:pointer; background:#111; transition: transform 0.15s ease, background-color 0.15s ease; contain: layout style paint;" onmouseover="this.style.background='#131317'" onmouseout="this.style.background='#111'">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; margin-right:10px;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <strong style="color:#f59e0b; font-family:'JetBrains Mono',monospace; font-size:14px;">#${o.id}</strong>
                    <span style="font-size:10px; color:#666;">${dateStr}</span>
                  </div>
                  <div style="font-size:12px; color:#fff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    👤 ${escapeHtml(o.customerName)} <span style="font-size:10px; color:#888; font-weight:normal;">(${o.items.length} items)</span>
                  </div>
                </div>
                <div style="text-align:right; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                  ${statusBadge}
                  <strong style="color:#2ecc71; font-size:13px; font-weight:bold;">₹${o.totalAmount}</strong>
                  ${paymentBadge}
                </div>
              </div>
              <div style="display:flex; justify-content:center; align-items:center; margin-top:8px; border-top:1px solid #1c1c1e; padding-top:6px; font-size:10px; font-weight:800; color:var(--accent-orange); text-transform:uppercase; letter-spacing:0.3px; gap:4px;">
                <span>📂 ${currentLang === 'ta' ? "விவரத்தைக் காட்ட அழுத்தவும்" : "TAP TO REVEAL DETAILS"} ➔</span>
              </div>
            </div>
          `;
        } else {
          cardHtml = `
            <div class="card" style="margin-bottom:12px; padding:12px; border-color:${o.status === 'delivering' ? 'var(--accent-orange)' : (o.status === 'delivered' ? '#18181b' : '#222')}; border-left:4px solid ${borderLeftColor}; contain: layout style paint;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px dashed #222; padding-bottom:6px;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <strong style="color:#f59e0b; font-family:'JetBrains Mono',monospace; font-size:15px;">${o.id}</strong>
                  <span style="font-size:11px; color:#888;">${dateStr}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  ${paymentBadge}
                  ${statusBadge}
                </div>
              </div>

              <div style="font-size:13px; margin-bottom:10px;">
                <p style="font-weight:700; color:#fff; font-size:14px; margin-bottom:4px; display:flex; align-items:center; gap:6px;">👤 ${escapeHtml(o.customerName)}</p>
                <p id="addr-${o.id}" onclick="this.style.webkitLineClamp = this.style.webkitLineClamp === 'unset' ? '2' : 'unset'; this.style.display = this.style.webkitLineClamp === 'unset' ? 'block' : '-webkit-box';" style="color:#888; font-size:12px; line-height:1.45; margin-bottom:6px; cursor:pointer; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; text-overflow:ellipsis; font-family:inherit;" title="Tap to expand">📍 ${escapeHtml(o.deliveryAddress)}</p>
                <p style="color:#888; font-size:11px; display:flex; align-items:center; gap:8px; margin-bottom:0; flex-wrap:wrap; overflow:hidden; text-overflow:ellipsis;">
                  <span>⏱️ Slot: <strong>${o.deliveryTimeSlot}</strong></span> | 
                  <span>💳 Pay:</span>
                  ${isUpi
                    ? `<span style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid rgba(16, 185, 129, 0.35); color: #10b981; font-size: 10px; padding: 1.5px 6px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 2.5px;">📱 UPI PAYMENT (PAID / செலுத்தப்பட்டது)</span>`
                    : `<span style="background: rgba(245, 158, 11, 0.15); border: 1.5px solid rgba(245, 158, 11, 0.35); color: #f59e0b; font-size: 10px; padding: 1.5px 6px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 2.5px;">💵 CASH ON DELIVERY (COD / ரொக்கம்)</span>`
                  }
                </p>
              </div>

              <div style="background:#1a1a1a; border-radius:10px; padding:10px; margin-bottom:12px; border:1px solid #222;">
                <span style="font-size:11px; color:#f59e0b; text-transform:uppercase; font-weight:600; display:block; margin-bottom:6px; letter-spacing:0.5px;">BASKET</span>
                <div style="margin:0; line-height:1.6; font-size:12px; color: #ddd;">${itemsList}</div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="color:#888; font-size:13px;">
                  ${(o.paymentMethod && (o.paymentMethod.toUpperCase().includes('UPI') || o.paymentMethod.toUpperCase().includes('ONLINE') || o.upiTxnId))
                    ? (o.status === 'delivered' ? 'Total Collected (Paid Online):' : 'Collection Target (Already Paid):')
                    : (o.status === 'delivered' ? 'Total Collected (COD Cash):' : 'Collection Target (Collect Cash):')
                  }
                </span>
                <span style="color:${(o.paymentMethod && (o.paymentMethod.toUpperCase().includes('UPI') || o.paymentMethod.toUpperCase().includes('ONLINE') || o.upiTxnId)) ? '#10b981' : '#2ecc71'}; font-size:16px; font-weight:bold; text-align:right;">
                  ${(o.paymentMethod && (o.paymentMethod.toUpperCase().includes('UPI') || o.paymentMethod.toUpperCase().includes('ONLINE') || o.upiTxnId))
                    ? '₹0 (Paid Online / ஆன்லைன்)'
                    : `₹${o.totalAmount}`
                  }
                </span>
              </div>

              <div style="display:flex; gap:8px; margin-bottom:10px;">
                <a href="tel:${o.customerPhone}" class="btn" style="flex:1; min-height:40px; height:auto; border-radius:10px; background:#1a73e8; border:none; color:#fff; font-size:13px; font-weight:600; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:6px; padding: 8px 12px; white-space: nowrap; box-shadow:0 3px 8px rgba(26,115,232,0.25);" onclick="event.stopPropagation();">📞 Call</a>
                <a href="https://wa.me/${formatIndianPhoneForWhatsApp(o.customerPhone)}?text=${encodeURIComponent('Hello ' + o.customerName + ', your order (' + o.id + ') from Edappadi Chicken & Mutton is out for delivery! 🏍️💨')}" target="_blank" class="btn" style="flex:1; min-height:40px; height:auto; border-radius:10px; background:#25D366; border:none; color:#fff; font-size:13px; font-weight:600; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:6px; padding: 8px 12px; white-space: nowrap; box-shadow:0 3px 8px rgba(37,211,102,0.25);" onclick="event.stopPropagation();">💬 WA</a>
                <button onclick="event.stopPropagation(); openGoogleMapsNavigation('${o.id}')" class="btn" style="flex:1; min-height:40px; height:auto; border-radius:10px; background:#FFA500; border:none; color:#000; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; padding: 8px 12px; white-space: nowrap; box-shadow:0 3px 8px rgba(255,165,0,0.25); cursor:pointer;">📍 Map</button>
              </div>

              ${o.status !== 'delivered' ? `
              <div style="display:grid; grid-template-columns: 1fr; margin-top:6px;">
                ${actionBtn}
              </div>
              ` : ''}

              ${proofHtml}
              ${o.rating ? `
                <div style="margin-top: 8px; border:1px solid rgba(245,158,11,0.15); padding:8px 10px; border-radius:8.5px; background:rgba(245,158,11,0.02)">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:10.5px; color:var(--text-muted);">⭐ Rating:</span>
                    <span style="font-size:11px; color:var(--accent-orange); font-weight:700;">${'★'.repeat(o.rating)}${'☆'.repeat(5 - o.rating)}</span>
                  </div>
                  ${o.feedbackComment ? `
                    <p style="margin:4px 0 0 0; font-size:11px; color:rgba(255,255,255,0.7); font-style:italic;">"${escapeHtml(o.feedbackComment)}"</p>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Collapse option back to header view -->
              ${currentDeliveryFilter === 'history' ? `
                <button type="button" class="btn" style="background:#1c1c1e; border:1px solid #333; color:#aaa; font-weight:700; font-size:11px; height:34px; border-radius:8px; margin-top:10px; width:100%; display:flex; align-items:center; justify-content:center; gap:4px; box-sizing: border-box;" onclick="toggleDeliveryOrderCollapse('${o.id}')">
                  <span>👆 ${currentLang === 'ta' ? "சுருக்கு / Collapse Details" : "COLLAPSE DETAILS"}</span>
                </button>
              ` : ''}
            </div>
          `;
        }
        ordersHtml += cardHtml;
      });
      container.innerHTML = ordersHtml;
    }

    function toggleDeliveryOrderCollapse(orderId) {
      window.expandedDeliveryOrders = window.expandedDeliveryOrders || {};
      window.expandedDeliveryOrders[orderId] = !window.expandedDeliveryOrders[orderId];
      renderDeliveryScreen();
    }

    function toggleAllDeliveryOrders(expand) {
      window.expandedDeliveryOrders = window.expandedDeliveryOrders || {};
      const orders = getData('ek_orders', []);
      const session = getData('ek_delivery_session', null);
      if (session) {
        const historyRider = orders.filter(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id) && o.status === 'delivered');
        historyRider.forEach(o => {
          window.expandedDeliveryOrders[o.id] = expand;
        });
      }
      renderDeliveryScreen();
    }

    function filterDeliveryOrders(filterType, btnElement) {
      currentDeliveryFilter = filterType;
      document.querySelectorAll('#screen-delivery .admin-tab').forEach(btn => btn.classList.remove('active'));
      if (btnElement) btnElement.classList.add('active');
      renderDeliveryScreen();
    }

    let riderStatusOnline = true;
    function toggleRiderDutyStatus() {
      riderStatusOnline = !riderStatusOnline;
      const badge = document.getElementById('delivery-exec-status');
      if (badge) {
        if (riderStatusOnline) {
          badge.className = "badge badge-success";
          badge.innerText = "Online 🟢";
          badge.style.background = "rgba(34,197,94,0.15)";
          badge.style.color = "var(--accent-green)";
          showToast("You are now ONLINE. You will receive active delivery tickets! 🏍️", "success");
        } else {
          badge.className = "badge badge-danger";
          badge.innerText = "Offline 🔴 (Break)";
          badge.style.background = "rgba(239,68,68,0.15)";
          badge.style.color = "var(--accent-red)";
          showToast("Duty set to OFFLINE. Enjoy your break! ☕", "info");
        }
      }
    }

    function syncDeliveryOrders() {
      const session = getData('ek_delivery_session', null);
      if (!session) {
        renderDeliveryScreen();
        return;
      }
      showToast("Syncing with Cloud real-time database...", "info");
      if (typeof db !== 'undefined' && db) {
        const q1 = db.collection('ek_orders').where('assignedExecutiveId', '==', session.id).get();
        const q2 = db.collection('ek_orders').where('assignedDeliveryPartnerUid', '==', session.id).get();
        const q3 = db.collection('ek_orders').where('riderUid', '==', session.id).get();

        Promise.all([q1, q2, q3])
          .then(([snap1, snap2, snap3]) => {
            const localOrders = getData('ek_orders', []);
            const localOrdersMap = new Map(localOrders.map(o => [o.id, o]));

            const list = [];
            [snap1, snap2, snap3].forEach(snap => {
              if (snap && !snap.empty) {
                snap.forEach(doc => {
                  const data = normalizeFirestoreData(doc.data());
                  data.id = doc.id;
                  list.push(data);
                });
              }
            });

            list.forEach(order => {
              localOrdersMap.set(order.id, order);
            });

            saveData('ek_orders', Array.from(localOrdersMap.values()));
            showToast("Cloud micro-sync successful! 🎉", "success");
            renderDeliveryScreen();
          })
          .catch(err => {
            console.error("Cloud micro-sync error:", err);
            showToast("Cloud connection weak, showing cached orders.", "info");
            renderDeliveryScreen();
          });
      } else {
        renderDeliveryScreen();
      }
    }

    function playNewOrderSound() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain1.gain.setValueAtTime(0, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15); // D6 pitch jump!
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
        gain2.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.6);
      } catch (e) {
        console.warn("New order notification chime ignored:", e);
      }
    }

    window.lastTriggeredAssignAlertId = null;

    function triggerNewOrderAssignedAlert(order) {
      if (!order) return;

      if (window.lastTriggeredAssignAlertId === order.id) return;
      window.lastTriggeredAssignAlertId = order.id;

      window.activeDeliveryAlertOrder = order;

      const elId = document.getElementById('alert-order-id');
      const elName = document.getElementById('alert-customer-name');
      const elAddr = document.getElementById('alert-customer-address');
      const elAmt = document.getElementById('alert-order-amount');
      const modal = document.getElementById('delivery-assignment-alert-modal');

      if (elId) elId.innerText = "#" + order.id;
      if (elName) elName.innerText = order.customerName || "N/A";
      if (elAddr) elAddr.innerText = order.deliveryAddress || "Store Pickup Mode";
      if (elAmt) elAmt.innerText = "₹" + (order.totalAmount || 0);

      if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.classList.add('active-alert');
        }, 30);
      }

      playNewOrderSound();
      setTimeout(playNewOrderSound, 850);
      setTimeout(playNewOrderSound, 1700);

      showToast("📢 புதிய ஆர்டர் வந்துள்ளது! / NEW TICKET RECEIVED!", "success");
    }

    function closeDeliveryAssignmentAlert() {
      const modal = document.getElementById('delivery-assignment-alert-modal');
      if (modal) {
        modal.classList.remove('active-alert');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 150);
      }
    }

    function handleDeliveryAlertAction() {
      const order = window.activeDeliveryAlertOrder;
      closeDeliveryAssignmentAlert();

      showScreen('screen-delivery');

      currentDeliveryFilter = 'assigned';
      document.querySelectorAll('#screen-delivery .admin-tab').forEach(btn => btn.classList.remove('active'));
      const activeTabBtn = document.getElementById('btn-delivery-filter-assigned');
      if (activeTabBtn) {
        activeTabBtn.classList.add('active');
      }

      if (order && order.id) {
        window.expandedDeliveryOrders = window.expandedDeliveryOrders || {};
        window.expandedDeliveryOrders[order.id] = true;
      }

      renderDeliveryScreen();

      setTimeout(() => {
        const targetCard = document.getElementById('addr-' + (order ? order.id : ''));
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }

    function claimOrderForDelivery(orderId) {
      window.locallyModifiedOrders = window.locallyModifiedOrders || {};
      window.locallyModifiedOrders[orderId] = Date.now() + 8000;

      const session = getData('ek_delivery_session', null);
      if (!session) return;

      if (!db) {
        const orders = getData('ek_orders', []);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) return;
        orders[idx].assignedDeliveryPartnerUid = session.id;
        orders[idx].assignedDeliveryPartnerName = session.name;
        orders[idx].riderUid = session.id;
        orders[idx].riderId = session.id;
        orders[idx].deliveryPartnerUid = session.id;
        orders[idx].assignedExecutiveId = session.id;
        orders[idx].assignedExecutiveName = session.name;
        orders[idx].assignedExecutivePhone = session.phone;
        orders[idx].deliveryExecutiveId = session.id;
        orders[idx].deliveryExecutiveName = session.name;
        orders[idx].deliveryExecutivePhone = session.phone;
        orders[idx].updatedAt = new Date().toISOString();
        saveData('ek_orders', orders);
        showToast("Order claimed locally! 🏍️", "success");
        renderDeliveryScreen();
        return;
      }

      showToast("மாற்று விண்ணப்பத்தை சரிபார்க்கிறது... / Verifying claim status...", "info");

      db.runTransaction((transaction) => {
        const orderRef = db.collection('ek_orders').doc(orderId);
        return transaction.get(orderRef).then((doc) => {
          if (!doc.exists) {
            throw "not_exist";
          }
          const orderData = doc.data();
          if (orderData.status === 'rejected' || orderData.status === 'canceled') {
            throw "cancelled";
          }
          if (orderData.status === 'delivered') {
            throw "already_delivered";
          }
          if (orderData.assignedExecutiveId && orderData.assignedExecutiveId !== session.id) {
            throw "already_claimed";
          }
          transaction.update(orderRef, {
            assignedDeliveryPartnerUid: session.id,
            assignedDeliveryPartnerName: session.name,
            riderUid: session.id,
            riderId: session.id,
            deliveryPartnerUid: session.id,
            assignedExecutiveId: session.id,
            assignedExecutiveName: session.name,
            assignedExecutivePhone: session.phone,
            deliveryExecutiveId: session.id,
            deliveryExecutiveName: session.name,
            deliveryExecutivePhone: session.phone,
            updatedAt: new Date().toISOString()
          });
        });
      }).then(() => {
        const orders = getData('ek_orders', []);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          orders[idx].assignedDeliveryPartnerUid = session.id;
          orders[idx].assignedDeliveryPartnerName = session.name;
          orders[idx].riderUid = session.id;
          orders[idx].riderId = session.id;
          orders[idx].deliveryPartnerUid = session.id;
          orders[idx].assignedExecutiveId = session.id;
          orders[idx].assignedExecutiveName = session.name;
          orders[idx].assignedExecutivePhone = session.phone;
          orders[idx].deliveryExecutiveId = session.id;
          orders[idx].deliveryExecutiveName = session.name;
          orders[idx].deliveryExecutivePhone = session.phone;
          orders[idx].updatedAt = new Date().toISOString();
          saveData('ek_orders', orders);
        }
        removePendingSync('ek_orders', orderId);
        showToast("ஆர்டர் வெற்றிகரமாக உங்களுக்கு ஒதுக்கப்பட்டது! மழையிலும் நிதானமாக ஓட்டவும்! 🏍️", "success");
        renderDeliveryScreen();
      }).catch((error) => {
        console.error("Transaction failed: ", error);
        if (error === 'already_claimed') {
          const orders = getData('ek_orders', []);
          const idx = orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
             orders[idx].assignedExecutiveId = "other_rider";
             saveData('ek_orders', orders);
          }
          showToast("மன்னிக்கவும், இந்த ஆர்டர் ஏற்கனவே வேறொருவருக்கு ஒதுக்கப்பட்டுவிட்டது! ❌", "error");
        } else if (error === 'cancelled') {
          showToast("மன்னிக்கவும், இந்த ஆர்டர் ஏற்கனவே ரத்து செய்யப்பட்டுவிட்டது! / This order has already been cancelled! ❌", "error");
        } else if (error === 'already_delivered') {
          showToast("மன்னிக்கவும், இந்த ஆர்டர் ஏற்கனவே விநியோகிக்கப்பட்டுவிட்டது! / This order has already been delivered! ❌", "error");
        } else if (error === 'not_exist') {
          showToast("இந்த ஆர்டர் நீக்கப்பட்டுவிட்டது! / Order no longer exists! ❌", "error");
        } else {
          showToast("பிணைய பிழை / Claim failed due to network issue. Please retry. 📶", "error");
        }
        renderDeliveryScreen();
      });
    }

    function updateDeliveryOrderStatus(orderId, nextStatus) {
      showToast("சரிபார்க்கிறது... / Verifying...", "info");

      if (typeof db !== 'undefined' && db) {
        db.collection('ek_orders').doc(orderId).get().then((docSnap) => {
          if (!docSnap.exists) {
            showToast("Error: Order not found.", "error");
            return;
          }
          const cloudOrder = normalizeFirestoreData(docSnap.data());
          if (cloudOrder.status === 'rejected') {
            showToast("மன்னிக்கவும்! இந்த ஆர்டர் ஏற்கனவே வாடிக்கையாளரால் ரத்து செய்யப்பட்டுவிட்டது. / This order was already cancelled by the customer.", "error");
            const orders = getData('ek_orders', []);
            const idx = orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
              orders[idx].status = 'rejected';
              orders[idx].rejectionReason = cloudOrder.rejectionReason;
              orders[idx].updatedAt = cloudOrder.updatedAt;
              saveData('ek_orders', orders);
              renderDeliveryScreen();
            }
            return;
          }

          proceedWithUpdateDeliveryOrderStatus(orderId, nextStatus);
        }).catch(err => {
          console.warn("Error verifying delivery order status in cloud, proceeding locally:", err);
          showToast("ஆர்டர் நிலை மாற்றப்படுகிறது... / Updating status locally...", "info");
          proceedWithUpdateDeliveryOrderStatus(orderId, nextStatus);
        });
      } else {
        proceedWithUpdateDeliveryOrderStatus(orderId, nextStatus);
      }
    }

    function proceedWithUpdateDeliveryOrderStatus(orderId, nextStatus) {
      window.locallyModifiedOrders = window.locallyModifiedOrders || {};
      window.locallyModifiedOrders[orderId] = Date.now() + 8000;

      const orders = getData('ek_orders', []);
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx === -1) return;

      const oldStatus = orders[idx].status;
      orders[idx].status = nextStatus;
      orders[idx].updatedAt = new Date().toISOString();

      saveData('ek_orders', orders);

      try {
        sendFcmPushNotification(orders[idx], oldStatus, nextStatus);
      } catch (fcmErr) {
        console.warn("FCM push notify skipped or exception:", fcmErr);
      }

      if (db) {
        db.collection('ek_orders').doc(orderId).set(orders[idx], { merge: true })
          .then(() => {
            debugLog(`Order status of ${orderId} successfully updated to ${nextStatus}.`);
            removePendingSync('ek_orders', orderId);

            const currentOrders = getData('ek_orders', []);
            const currentIdx = currentOrders.findIndex(o => o.id === orderId);
            if (currentIdx !== -1 && currentOrders[currentIdx].status !== nextStatus) {
              console.warn(`[Correction] Local status reverted to ${currentOrders[currentIdx].status}. Resetting back to ${nextStatus}.`);
              currentOrders[currentIdx].status = nextStatus;
              saveData('ek_orders', currentOrders);
              renderDeliveryScreen();
            }
          })
          .catch(err => {
            console.error("Cloud status update failed, queuing for retry:", err);
            window.locallyModifiedOrders[orderId] = Date.now() + 8000;
            queueFailedSync('ek_orders', orderId, 'set', orders[idx]);
          });
      } else {
        queueFailedSync('ek_orders', orderId, 'set', orders[idx]);
      }

      showToast(`Order status updated to ${nextStatus.toUpperCase()}!`, "success");
      renderDeliveryScreen();
    }

    function quickCompleteDelivery(orderId) {
      showCustomConfirm(
        "Confirm Delivery?",
        "Are you sure you want to confirm that this order has been successfully delivered?",
        function() {
          showToast("சரிபார்க்கிறது... / Verifying...", "info");

          if (typeof db !== 'undefined' && db) {
            db.collection('ek_orders').doc(orderId).get().then((docSnap) => {
              if (!docSnap.exists) {
                showToast("Error: Order not found.", "error");
                return;
              }
              const cloudOrder = normalizeFirestoreData(docSnap.data());
              if (cloudOrder.status === 'rejected') {
                showToast("மன்னிக்கவும்! இந்த ஆர்டர் ஏற்கனவே வாடிக்கையாளரால் ரத்து செய்யப்பட்டுவிட்டது. / This order was already cancelled by the customer.", "error");
                const orders = getData('ek_orders', []);
                const idx = orders.findIndex(o => o.id === orderId);
                if (idx !== -1) {
                  orders[idx].status = 'rejected';
                  orders[idx].rejectionReason = cloudOrder.rejectionReason;
                  orders[idx].updatedAt = cloudOrder.updatedAt;
                  saveData('ek_orders', orders);
                  renderDeliveryScreen();
                }
                return;
              }

              proceedWithQuickCompleteDelivery(orderId);
            }).catch(err => {
              console.warn("Error verifying delivery order status in cloud, proceeding locally:", err);
              showToast("ஆர்டர் நிலை மாற்றப்படுகிறது... / Updating status locally...", "info");
              proceedWithQuickCompleteDelivery(orderId);
            });
          } else {
            proceedWithQuickCompleteDelivery(orderId);
          }
        }
      );
    }

    function proceedWithQuickCompleteDelivery(orderId) {
      window.locallyModifiedOrders = window.locallyModifiedOrders || {};
      window.locallyModifiedOrders[orderId] = Date.now() + 8000;

      const orders = getData('ek_orders', []);
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx === -1) return;

      const oldStatus = orders[idx].status || 'delivering';
      orders[idx].status = 'delivered';
      orders[idx].customerSignature = "Quick delivered by Delivery Partner";
      orders[idx].updatedAt = new Date().toISOString();

      saveData('ek_orders', orders);

      try {
        sendFcmPushNotification(orders[idx], oldStatus, 'delivered');
      } catch (fcmErr) {
        console.error("FCM push notify failed in quickCompleteDelivery:", fcmErr);
      }

      try {
        checkAndProcessReferralRewards(orders[idx]);
      } catch (refErr) {
        console.error("Referral rewards processing error:", refErr);
      }

      if (db) {
        db.collection('ek_orders').doc(orderId).set(orders[idx], { merge: true })
          .then(() => {
            debugLog(`Order ${orderId} quick delivered successfully.`);
            removePendingSync('ek_orders', orderId);
          })
          .catch(err => {
            console.error("Cloud status update failed, queuing for retry:", err);
            queueFailedSync('ek_orders', orderId, 'set', orders[idx]);
          });
      } else {
        queueFailedSync('ek_orders', orderId, 'set', orders[idx]);
      }

      showToast("Delivered! Order status updated successfully ✓", "success");
      renderDeliveryScreen();
    }

    let isDrawingSignature = false;
    let signatureCanvas = null;
    let signatureCtx = null;

    function openDeliveryVerification(orderId) {
      const orders = getData('ek_orders', []);
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      let modal = document.getElementById('delivery-verify-modal');
      if (modal) {
        modal.remove();
      }

      modal = document.createElement('div');
      modal.id = 'delivery-verify-modal';
      modal.className = 'modal-backdrop';
      modal.style.zIndex = '99999';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.padding = '15px';

      modal.innerHTML = `
        <div class="bottom-sheet" style="width: 100%; max-width: 360px; border-radius: 24px; border: 1.5px solid #2d2d2d; background: #0c0c0e; padding: 20px; box-shadow: 0 12px 35px rgba(0,0,0,0.85); transform: scale(0.9); transition: all 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.28); display: flex; flex-direction: column; gap: 14px;">

          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">🛡️</span>
              <div>
                <h4 style="color: #ffffff; font-size: 14px; font-weight: 800; margin: 0; text-transform: uppercase; font-family: 'Poppins', sans-serif;">PRO VALIDATION / சரிபார்ப்பு</h4>
                <p style="font-size: 10px; color: var(--text-muted); margin: 0;">Secure Digital Proof of Delivery</p>
              </div>
            </div>
            <button onclick="closeDeliveryVerification()" style="background: transparent; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 4px;">✕</button>
          </div>

          <div style="background: #121214; border: 1px solid #222; border-radius: 12px; padding: 10px 14px; text-align: left; font-size: 12.5px;">
            <span style="font-size: 9px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">CUSTOMER TICKET</span>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <strong style="color: var(--accent-orange); font-size: 15px; font-family: 'JetBrains Mono', monospace;">${order.id}</strong>
              <span style="color: var(--accent-green); font-size: 16px; font-weight: 800;">₹${order.totalAmount}</span>
            </div>
            <div style="color: #e5e7eb; font-size: 13px; font-weight: 700; margin-top: 4px;">👤 ${escapeHtml(order.customerName)}</div>
            <div style="color: var(--text-muted); font-size: 11px; margin-top: 2px;">📞 ${order.customerPhone}</div>
          </div>

          <div style="text-align: left;">
            <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 6px;">
              ${currentLang === 'ta' ? '1. கட்டணம் பெற்றதை உறுதி செய்க' : '1. Confirm Payment Received'}
            </label>
            <div style="display: flex; gap: 8px;">
              <label style="flex: 1; border: 1.5px solid var(--accent-green); background: rgba(34,197,94,0.06); border-radius: 10px; padding: 8px; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <input type="radio" name="pay_verify" value="cash" checked style="accent-color: var(--accent-green);">
                <span style="font-size: 11.5px; font-weight: 700; color: #fff;">
                  ${currentLang === 'ta' ? '👍 பெற்றேன்' : '👍 Collected'}
                </span>
              </label>
              <label style="flex: 1; border: 1.5px solid #222; background: #121214; border-radius: 10px; padding: 8px; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;" id="online-pay-label">
                <input type="radio" name="pay_verify" value="gpay" style="accent-color: var(--accent-green);">
                <span style="font-size: 11.5px; font-weight: 700; color: var(--text-secondary);">
                  ${currentLang === 'ta' ? '💳 ஆன்லைன் பே' : '💳 Online Pay'}
                </span>
              </label>
            </div>
          </div>

          <div style="text-align: left;">
            <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 6px;">
              ${currentLang === 'ta' ? '2. கைபேசியின் கடைசி 4 எண்கள்' : '2. Enter Last 4 Digits of Mobile'}
            </label>
            <input type="number" id="verification-otp" class="form-control" style="background: #121214; border: 1.5px solid #222; letter-spacing: 4px; font-size: 16px; text-align: center; font-weight: 700; color: #fff;" placeholder="----" maxlength="4" oninput="if(this.value.length > 4) this.value = this.value.slice(0, 4)">
          </div>

          <div style="text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin: 0;">
                ${currentLang === 'ta' ? '3. வாடிக்கையாளர் கையொப்பம்' : '3. Customer Signature'}
              </label>
              <button onclick="clearSignatureCanvas()" style="background: transparent; border: none; color: var(--accent-red); font-size: 11px; font-weight: 700; cursor: pointer;">
                ${currentLang === 'ta' ? 'அழி 🔄' : 'CLEAR 🔄'}
              </button>
            </div>
            <div style="border: 1.5px solid #2d2d2d; border-radius: 12px; overflow: hidden; background: #000; position: relative;">
              <canvas id="sig-pad" width="316" height="110" style="display: block; cursor: crosshair; touch-action: none;"></canvas>
            </div>
          </div>

          <button class="btn btn-success" style="background: var(--accent-green); height: 46px; border-radius: 12px; font-weight: 800; font-size: 13.5px; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="submitDeliverySignature('${order.id}')">
            ${currentLang === 'ta' ? 'விநியோகத்தை முடி ✅' : 'COMPLETE VERIFIED DELIVERY ✅'}
          </button>

        </div>
      `;

      document.body.appendChild(modal);

      const isOnlinePay = order.paymentMethod && (order.paymentMethod.toLowerCase().includes('online') || order.paymentMethod.toLowerCase().includes('gpay') || order.paymentMethod.toLowerCase().includes('card') || order.paymentMethod.toLowerCase().includes('upi'));
      if (isOnlinePay) {
        const uLabel = document.getElementById('online-pay-label');
        if (uLabel) {
          uLabel.style.borderColor = "var(--accent-green)";
          uLabel.style.background = "rgba(34,197,94,0.06)";
          const input = uLabel.querySelector('input');
          if (input) input.checked = true;
        }
      }

      setTimeout(() => {
        modal.classList.add('active');
        const sheet = modal.querySelector('.bottom-sheet');
        if (sheet) sheet.style.transform = 'scale(1)';
      }, 10);

      initSignatureCanvas();
    }

    function closeDeliveryVerification() {
      const modal = document.getElementById('delivery-verify-modal');
      if (modal) {
        modal.classList.remove('active');
        const sheet = modal.querySelector('.bottom-sheet');
        if (sheet) sheet.style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 200);
      }
    }

    function initSignatureCanvas() {
      signatureCanvas = document.getElementById('sig-pad');
      if (!signatureCanvas) return;
      signatureCtx = signatureCanvas.getContext('2d');
      if (!signatureCtx) return;

      signatureCtx.strokeStyle = '#60a5fa';
      signatureCtx.lineJoin = 'round';
      signatureCtx.lineCap = 'round';
      signatureCtx.lineWidth = 3;

      const getPos = (e) => {
        const rect = signatureCanvas.getBoundingClientRect();
        let clientX = 0, clientY = 0;
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const startDraw = (e) => {
        isDrawingSignature = true;
        const pos = getPos(e);
        signatureCtx.beginPath();
        signatureCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
      };

      const drawMove = (e) => {
        if (!isDrawingSignature) return;
        const pos = getPos(e);
        signatureCtx.lineTo(pos.x, pos.y);
        signatureCtx.stroke();
        e.preventDefault();
      };

      const stopDraw = () => {
        isDrawingSignature = false;
      };

      signatureCanvas.addEventListener('mousedown', startDraw);
      signatureCanvas.addEventListener('mousemove', drawMove);
      signatureCanvas.addEventListener('mouseup', stopDraw);
      signatureCanvas.addEventListener('mouseleave', stopDraw);

      signatureCanvas.addEventListener('touchstart', startDraw, { passive: false });
      signatureCanvas.addEventListener('touchmove', drawMove, { passive: false });
      signatureCanvas.addEventListener('touchend', stopDraw);
    }

    function clearSignatureCanvas() {
      if (signatureCanvas && signatureCtx) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      }
    }

    function submitDeliverySignature(orderId) {
      const orders = getData('ek_orders', []);
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx === -1) return;

      const order = orders[idx];

      const rawPhone = order.customerPhone ? order.customerPhone.toString().trim() : "";
      const expectedDigits = rawPhone.slice(-4);
      const inputDigits = document.getElementById('verification-otp').value.trim();

      if (expectedDigits && inputDigits !== expectedDigits) {
        showToast("Incorrect mobile verification digits! Please check and try again.", "error");
        return;
      }

      let sigData = "";
      if (signatureCanvas) {
        const blank = document.createElement('canvas');
        blank.width = signatureCanvas.width;
        blank.height = signatureCanvas.height;
        if (signatureCanvas.toDataURL() !== blank.toDataURL()) {
          sigData = signatureCanvas.toDataURL();
        }
      }

      showToast("சரிபார்க்கிறது... / Verifying...", "info");

      if (typeof db !== 'undefined' && db) {
        db.collection('ek_orders').doc(orderId).get().then((docSnap) => {
          if (!docSnap.exists) {
            showToast("Error: Order not found.", "error");
            return;
          }
          const cloudOrder = normalizeFirestoreData(docSnap.data());
          if (cloudOrder.status === 'rejected') {
            showToast("மன்னிக்கவும்! இந்த ஆர்டர் ஏற்கனவே வாடிக்கையாளரால் ரத்து செய்யப்பட்டுவிட்டது. / This order was already cancelled by the customer.", "error");
            const ordersList = getData('ek_orders', []);
            const oIdx = ordersList.findIndex(o => o.id === orderId);
            if (oIdx !== -1) {
              ordersList[oIdx].status = 'rejected';
              ordersList[oIdx].rejectionReason = cloudOrder.rejectionReason;
              ordersList[oIdx].updatedAt = cloudOrder.updatedAt;
              saveData('ek_orders', ordersList);
              renderDeliveryScreen();
            }
            closeDeliveryVerification();
            return;
          }

          proceedWithSubmitDeliverySignature(orderId, sigData);
        }).catch(err => {
          console.warn("Error verifying delivery order status in signature submit, proceeding locally:", err);
          showToast("ஆர்டர் நிலை மாற்றப்படுகிறது... / Updating status locally...", "info");
          proceedWithSubmitDeliverySignature(orderId, sigData);
        });
      } else {
        proceedWithSubmitDeliverySignature(orderId, sigData);
      }
    }

    function proceedWithSubmitDeliverySignature(orderId, sigData) {
      window.locallyModifiedOrders = window.locallyModifiedOrders || {};
      window.locallyModifiedOrders[orderId] = Date.now() + 8000;

      const orders = getData('ek_orders', []);
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx === -1) return;

      const oldStatus = orders[idx].status || 'delivering';
      const verifyType = document.querySelector('input[name="pay_verify"]:checked').value;
      if (verifyType === 'gpay') {
        orders[idx].paymentMethod = 'Online Paid';
      }

      orders[idx].status = 'delivered';
      orders[idx].customerSignature = sigData || "Signed digitally";
      orders[idx].updatedAt = new Date().toISOString();

      saveData('ek_orders', orders);

      try {
        sendFcmPushNotification(orders[idx], oldStatus, 'delivered');
      } catch (fcmErr) {
        console.error("FCM push notify failed in submitDeliverySignature:", fcmErr);
      }

      try {
        checkAndProcessReferralRewards(orders[idx]);
      } catch (refErr) {
        console.error("Referral rewards processing error in submitDeliverySignature:", refErr);
      }

      if (db) {
        db.collection('ek_orders').doc(orderId).set(orders[idx], { merge: true })
          .then(() => {
            debugLog(`Order ${orderId} verified and delivered successfully.`);
            removePendingSync('ek_orders', orderId);
          })
          .catch(err => {
            console.error("Cloud status update failed, queuing for retry:", err);
            queueFailedSync('ek_orders', orderId, 'set', orders[idx]);
          });
      } else {
        queueFailedSync('ek_orders', orderId, 'set', orders[idx]);
      }

      closeDeliveryVerification();
      showToast("Delivered! Order status updated successfully ✓", "success");
      renderDeliveryScreen();
    }

    function proceedWithCustomerCancellation(orderId, orderData) {
      if (typeof db === 'undefined' || !db) {
        showToast(currentLang === 'ta' ? "ஆர்டரை ரத்து செய்ய இணைய இணைப்பு தேவை!" : "Internet connection required to cancel this order", "warning");
        return;
      }

      showToast(currentLang === 'ta' ? "ஆர்டர் ரத்து செய்யப்படுகிறது... ⏳" : "Processing order cancellation... ⏳", "info");

      const orderRef = db.collection('ek_orders').doc(orderId);

      orderRef.get().then(async (docSnap) => {
        if (!docSnap.exists) {
          throw "ORDER_NOT_FOUND";
        }
        const cloudOrder = normalizeFirestoreData(docSnap.data());
        const status = String(cloudOrder.status || '').toUpperCase();

        const acceptedStatuses = ['ACCEPTED', 'PREPARING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        if (acceptedStatuses.includes(status) || status === 'READY') {
          throw "ORDER_ALREADY_ACCEPTED";
        }

        if (status === 'CANCELLED' || status === 'REJECTED' || status === 'CANCELED') {
          throw "ORDER_ALREADY_CANCELLED";
        }

        const allowedStatuses = ['PENDING', 'PLACED', 'NEW', 'READY_FOR_ACCEPTANCE'];
        if (!allowedStatuses.includes(status)) {
          throw "CANCELLATION_NOT_ALLOWED";
        }

        const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();
        await orderRef.update({
          status: 'CANCELLED',
          cancelledBy: 'customer',
          cancelledAt: serverTimestamp,
          updatedAt: serverTimestamp
        });

        return cloudOrder;
      }).then((cloudOrder) => {

        const products = getData('ek_products', []);
        if (cloudOrder.items && Array.isArray(cloudOrder.items)) {
          cloudOrder.items.forEach(item => {
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
              const unit = prod.unit || 'kg';
              const isWeight = !(unit === 'piece' || unit === 'packet' || unit === 'bunch' || unit === 'dozen' || unit === 'unit');
              const returnedQty = isWeight ? (item.weightGrams / 1000) : item.weightGrams;
              prod.stockKg = parseFloat((prod.stockKg + returnedQty).toFixed(3));
              prod.isOutOfStock = false;
              prod.updatedAt = new Date().toISOString();
            }
          });
        }
        saveData('ek_products', products);

        const users = getData('ek_users', []);
        const userIdx = users.findIndex(u => u.id === cloudOrder.customerId);
        if (userIdx !== -1) {
          const user = users[userIdx];
          const accruedPoints = cloudOrder.accruedPoints || Math.floor(cloudOrder.totalAmount / 100) * 10;
          const pointsRefunded = (cloudOrder.loyaltyDiscount || 0) * 10;
          user.loyaltyPoints = Math.max(0, user.loyaltyPoints - accruedPoints + pointsRefunded);
          user.tier = computeLoyaltyTier(user.loyaltyPoints);

          users[userIdx] = user;
          saveData('ek_users', users);

          db.collection('ek_users').doc(user.id).set(user)
            .catch(err => console.error("Cloud user profile points refund error:", err));
        }

        window.locallyModifiedOrders = window.locallyModifiedOrders || {};
        window.locallyModifiedOrders[orderId] = Date.now() + 8000; // Shield from sync overwrites!

        const orders = getData('ek_orders', []);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          orders[idx].status = 'CANCELLED';
          orders[idx].cancelledBy = 'customer';
          orders[idx].cancelledAt = new Date().toISOString();
          orders[idx].updatedAt = new Date().toISOString();
          saveData('ek_orders', orders);
        } else {
          const updatedOrderObject = {
            ...cloudOrder,
            status: 'CANCELLED',
            cancelledBy: 'customer',
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          orders.push(updatedOrderObject);
          saveData('ek_orders', orders);
        }

        showToast(currentLang === 'ta' ? "ஆர்டர் வெற்றிகரமாக ரத்து செய்யப்பட்டது! 🛑" : "Order Cancelled! 🛑", "error");
        renderTrackerScreen();
        try { renderProfileScreen(); } catch(e) { console.error(e); }
        try { renderCartScreen(); } catch(e) { console.error(e); }
      }).catch((err) => {
        console.error("Customer cancellation transaction failed:", err);

        const cancelBtn = document.getElementById('track-btn-cancel');
        if (cancelBtn) {
          cancelBtn.disabled = false;
          cancelBtn.style.opacity = '1';
          cancelBtn.style.cursor = 'pointer';
          cancelBtn.innerHTML = currentLang === 'ta' ? "🛑 ஆர்டரை ரத்து செய்" : "🛑 Cancel Order";
        }
        const codCancelBtn = document.getElementById('cod-cancel-btn');
        if (codCancelBtn) {
          codCancelBtn.disabled = false;
          codCancelBtn.style.opacity = '1';
          codCancelBtn.style.cursor = 'pointer';
          codCancelBtn.innerHTML = currentLang === 'ta' ? "🛑 Cancel Order / ஆர்டரை ரத்து செய்" : "🛑 Cancel Order / ஆர்டரை ரத்து செய்";
        }

        if (err === 'ORDER_ALREADY_ACCEPTED') {
          showToast(currentLang === 'ta' ? "இந்த ஆர்டர் ஏற்கனவே உணவகத்தால் ஏற்றுக்கொள்ளப்பட்டது. ரத்து செய்ய உணவகத்தை நேரடியாக தொடர்பு கொள்ளவும்." : "This order has already been accepted by the restaurant. Please contact the restaurant directly for cancellation.", "warning");
        } else if (err === 'ORDER_ALREADY_CANCELLED') {
          showToast(currentLang === 'ta' ? "ஆர்டர் ஏற்கனவே ரத்து செய்யப்பட்டுவிட்டது." : "This order has already been cancelled.", "warning");
        } else if (err === 'CANCELLATION_NOT_ALLOWED') {
          showToast("Cancellation is not allowed for this order status.", "error");
        } else if (err === 'ORDER_NOT_FOUND') {
          showToast("Order not found.", "error");
        } else {
          showToast("Cancellation failed: " + err, "error");
        }
        if (typeof db !== 'undefined' && db) {
          db.collection('ek_orders').doc(orderId).get().then((docSnap) => {
            if (docSnap.exists) {
              const cloudOrder = normalizeFirestoreData(docSnap.data());
              const orders = getData('ek_orders', []);
              const idx = orders.findIndex(o => o.id === orderId);
              if (idx !== -1) {
                orders[idx] = cloudOrder;
                saveData('ek_orders', orders);
                renderTrackerScreen();
              }
            }
          });
        }
      });
    }

    function customerCancelOrder(orderId) {
      const confirmTitle = currentLang === 'ta' ? "ஆர்டரை ரத்து செய்யவா?" : "Cancel Order?";
      const confirmMsg = currentLang === 'ta'
        ? "இந்த ஆர்டரை ரத்து செய்ய விரும்புகிறீர்களா? தயாரிப்பு இருப்பு மற்றும் லாயல்டி புள்ளிகள் திரும்பப் பெறப்படும்."
        : "Are you sure you want to cancel this order? Item stocks and loyalty points will be reverted.";

      showCustomConfirm(
        confirmTitle,
        confirmMsg,
        function() {
          if (typeof db === 'undefined' || !db) {
            showToast(currentLang === 'ta' ? "ஆர்டரை ரத்து செய்ய இணைய இணைப்பு தேவை!" : "Internet connection required to cancel this order", "warning");
            return;
          }

          const cancelBtn = document.getElementById('track-btn-cancel');
          if (cancelBtn) {
            cancelBtn.disabled = true;
            cancelBtn.style.opacity = '0.5';
            cancelBtn.style.cursor = 'not-allowed';
            cancelBtn.innerHTML = currentLang === 'ta' ? "⏳ ரத்து செய்யப்படுகிறது..." : "⏳ Cancelling...";
          }
          const codCancelBtn = document.getElementById('cod-cancel-btn');
          if (codCancelBtn) {
            codCancelBtn.disabled = true;
            codCancelBtn.style.opacity = '0.5';
            codCancelBtn.style.cursor = 'not-allowed';
            codCancelBtn.innerHTML = currentLang === 'ta' ? "⏳ ரத்து செய்யப்படுகிறது..." : "⏳ Cancelling...";
          }

          proceedWithCustomerCancellation(orderId, null);
        }
      );
    }

    window.selectRiderRatingVisual = function(rating) {
      window.tempRiderRating = rating;
      const stars = document.querySelectorAll('.celebration-star');
      stars.forEach((star, i) => {
        if (i < rating) {
          star.innerHTML = '★';
          star.style.color = 'var(--accent-orange)';
        } else {
          star.innerHTML = '☆';
          star.style.color = '#555';
        }
      });
      const submitBtn = document.getElementById('submit-rider-rating-btn');
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
    };

    function submitRiderRating(orderId, rating = null, feedback = null) {
      const finalRating = rating !== null ? rating : (window.tempRiderRating || 0);
      if (!finalRating) {
        showToast(currentLang === 'ta' ? "தயவுசெய்து ஒரு மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்!" : "Please select a rating star first!", "warning");
        return;
      }

      const feedbackInput = document.getElementById('rider-feedback-input');
      const finalFeedback = feedback !== null ? feedback : (feedbackInput ? feedbackInput.value.trim() : (window.tempRiderFeedback || ''));

      const orders = getData('ek_orders', []);
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx].riderRating = finalRating;
        orders[idx].riderFeedback = finalFeedback;
        saveData('ek_orders', orders);
      }

      if (typeof db !== 'undefined' && db) {
        db.collection('ek_orders').doc(orderId).update({
          riderRating: finalRating,
          riderFeedback: finalFeedback
        })
          .then(() => debugLog(`Rider rating ${finalRating} and feedback "${finalFeedback}" saved to cloud for order ${orderId}`))
          .catch(err => console.error("Rider rating cloud update failed:", err));
      }

      window.tempRiderRating = null;
      window.tempRiderFeedback = null;

      const stars = document.querySelectorAll('.celebration-star');
      stars.forEach((star, i) => {
        star.onclick = null;
        star.style.cursor = 'default';
        star.onmouseover = null;
        star.onmouseout = null;
        if (i < finalRating) {
          star.innerHTML = '★';
          star.style.color = 'var(--accent-orange)';
        } else {
          star.innerHTML = '☆';
          star.style.color = '#555';
        }
      });

      const section = document.getElementById('rider-feedback-section');
      if (section) {
        section.innerHTML = `
          <div style="margin-top: 10px; padding: 10px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; text-align: center;">
            <p style="font-size: 12px; color: #10b981; font-weight: 700; margin-bottom: 2px;">
              ${currentLang === 'ta' ? '✓ மதிப்பீடு பதியப்பட்டது! மிக்க நன்றி.' : '✓ Rating submitted! Thank you so much.'}
            </p>
            ${finalFeedback ? `<p style="font-size: 11px; color: #bbb; font-style: italic; margin-top: 4px;">"${finalFeedback}"</p>` : ''}
          </div>
        `;
      }

      showToast(currentLang === 'ta' ? "நன்றி! உங்கள் கருத்து பதியப்பட்டது. ⭐" : "Thank you! Your rating has been submitted. ⭐", "success");
    }

    function closeDeliveredTracker() {
      const orders = getData('ek_orders', []);
      const activeIdx = orders.findIndex(o => o.id === selectedTrackOrderId);
      if (activeIdx !== -1) {
        orders[activeIdx].isArchived = true;
        saveData('ek_orders', orders);
        if (typeof db !== 'undefined' && db) {
          db.collection('ek_orders').doc(orders[activeIdx].id).update({ isArchived: true })
            .catch(err => console.error("Archive order error:", err));
        }
      }
      selectedTrackOrderId = null;
      renderTrackerScreen();
      showToast(currentLang === 'ta' ? "டிராக்கர் மூடப்பட்டது." : "Tracker closed.", "info");
    }

    function deleteOrderFromDb(orderId, isCustomerSide = false) {
      const orders = getData('ek_orders');
      const o = orders.find(ord => ord.id === orderId);

      if (isCustomerSide && o && o.status && o.status.toLowerCase() === 'pending') {
        showCustomConfirm(
          currentLang === 'ta' ? "ஆர்டரை ரத்து செய்து நீக்கவா?" : "Cancel & Delete Order?",
          currentLang === 'ta'
            ? "இந்த ஆர்டரை ரத்து செய்துவிட்டு வரலாற்றிலிருந்து நீக்க விரும்புகிறீர்களா? பொருட்கள் இருப்பு மற்றும் லாயல்டி புள்ளிகள் திரும்பப் பெறப்படும்."
            : "Are you sure you want to cancel and delete this order from history? Stock levels and loyalty points will be reverted.",
          function() {
            if (typeof db === 'undefined' || !db) {
              showToast(currentLang === 'ta' ? "இணைய இணைப்பு தேவை!" : "Internet connection required!", "warning");
              return;
            }
            showToast(currentLang === 'ta' ? "ஆர்டர் ரத்து செய்யப்படுகிறது... ⏳" : "Processing cancellation... ⏳", "info");
            const orderRef = db.collection('ek_orders').doc(orderId);

            db.runTransaction(async (transaction) => {
              const docSnap = await transaction.get(orderRef);
              if (!docSnap.exists) {
                throw "ORDER_NOT_FOUND";
              }
              const cloudOrder = normalizeFirestoreData(docSnap.data());
              const status = String(cloudOrder.status || '').toUpperCase();

              const acceptedStatuses = ['ACCEPTED', 'PREPARING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'READY'];
              if (acceptedStatuses.includes(status)) {
                throw "ORDER_ALREADY_ACCEPTED";
              }
              if (status === 'CANCELLED' || status === 'REJECTED' || status === 'CANCELED') {
                throw "ORDER_ALREADY_CANCELLED";
              }

              if (cloudOrder.items && Array.isArray(cloudOrder.items)) {
                const productSnaps = await Promise.all(
                  cloudOrder.items.map(item => transaction.get(db.collection('ek_products').doc(item.productId)))
                );

                cloudOrder.items.forEach((item, i) => {
                  const prodSnap = productSnaps[i];
                  if (prodSnap.exists) {
                    const prodData = prodSnap.data();
                    const serverStock = parseFloat(prodData.stockKg || 0);
                    const unit = prodData.unit || 'kg';
                    const isWeight = !(unit === 'piece' || unit === 'packet' || unit === 'bunch' || unit === 'dozen' || unit === 'unit');
                    const returnedQty = isWeight ? (item.weightGrams / 1000) : item.weightGrams;
                    const newStock = parseFloat((serverStock + returnedQty).toFixed(3));
                    transaction.update(prodSnap.ref, {
                      stockKg: newStock,
                      isOutOfStock: false,
                      updatedAt: new Date().toISOString()
                    });
                  }
                });
              }

              const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();
              transaction.update(orderRef, {
                status: 'CANCELLED',
                cancelledBy: 'customer',
                hiddenByCustomer: true,
                cancelledAt: serverTimestamp,
                updatedAt: serverTimestamp
              });

              return cloudOrder;
            }).then((cloudOrder) => {
              const products = getData('ek_products', []);
              if (cloudOrder.items && Array.isArray(cloudOrder.items)) {
                cloudOrder.items.forEach(item => {
                  const prod = products.find(p => p.id === item.productId);
                  if (prod) {
                    const unit = prod.unit || 'kg';
                    const isWeight = !(unit === 'piece' || unit === 'packet' || unit === 'bunch' || unit === 'dozen' || unit === 'unit');
                    const returnedQty = isWeight ? (item.weightGrams / 1000) : item.weightGrams;
                    prod.stockKg = parseFloat((prod.stockKg + returnedQty).toFixed(3));
                    prod.isOutOfStock = false;
                    prod.updatedAt = new Date().toISOString();
                  }
                });
              }
              saveData('ek_products', products);

              const users = getData('ek_users', []);
              const userIdx = users.findIndex(u => u.id === cloudOrder.customerId);
              if (userIdx !== -1) {
                const user = users[userIdx];
                const accruedPoints = cloudOrder.accruedPoints || Math.floor(cloudOrder.totalAmount / 100) * 10;
                const pointsRefunded = (cloudOrder.loyaltyDiscount || 0) * 10;
                user.loyaltyPoints = Math.max(0, user.loyaltyPoints - accruedPoints + pointsRefunded);
                user.tier = computeLoyaltyTier(user.loyaltyPoints);
                users[userIdx] = user;
                saveData('ek_users', users);
                db.collection('ek_users').doc(user.id).set(user).catch(err => console.error(err));
              }

              window.locallyModifiedOrders = window.locallyModifiedOrders || {};
              window.locallyModifiedOrders[orderId] = Date.now() + 8000;

              markOrderAsHiddenByCustomer(orderId);
              showToast(currentLang === 'ta' ? "ஆர்டர் ரத்து செய்யப்பட்டு நீக்கப்பட்டது ✓" : "Order cancelled and deleted!", "success");
              closeCustomerOrderDetailModalDetail();
              renderTrackerScreen();
              try { renderProfileScreen(); } catch(e) { console.error(e); }
              try { renderCartScreen(); } catch(e) { console.error(e); }
            }).catch((err) => {
              console.error("Cancellation & deletion failed:", err);
              if (err === 'ORDER_ALREADY_ACCEPTED') {
                showToast(currentLang === 'ta' ? "ஆர்டர் ஏற்கனவே ஏற்றுக்கொள்ளப்பட்டது, நீக்க முடியாது!" : "Order already accepted, cannot be deleted!", "error");
              } else {
                showToast("Failed: " + err, "error");
              }
            });
          }
        );
        return;
      }

      showCustomConfirm(
        isCustomerSide ? (currentLang === 'ta' ? "வரலாற்றை நீக்கவா?" : "Remove from History?") : "Delete Order Record?",
        isCustomerSide
          ? (currentLang === 'ta'
              ? `உங்கள் ஆர்டர் வரலாற்றிலிருந்து இந்த பதிவை நீக்க விரும்புகிறீர்களா?<br><strong>ஆர்டர் ஐடி: ${orderId}</strong>`
              : `Are you sure you want to remove this order from your order history?<br><strong>Order ID: ${orderId}</strong>`)
          : `Are you sure you want to permanently delete order record (<strong>${orderId}</strong>)? This cannot be undone.`,
        function() {
          if (isCustomerSide) {
            const orders = getData('ek_orders');
            const matchedOrd = orders.find(o => o.id === orderId);
            if (matchedOrd) {
              matchedOrd.hiddenByCustomer = true;
              matchedOrd.updatedAt = new Date().toISOString();
              saveData('ek_orders', orders);

              if (typeof db !== 'undefined' && db) {
                db.collection('ek_orders').doc(orderId).update({
                  hiddenByCustomer: true,
                  updatedAt: new Date().toISOString()
                }).then(() => {
                  debugLog(`[Cloud Sync] Customer hidden flag synced for order: ${orderId}`);
                }).catch(e => {
                  db.collection('ek_orders').doc(orderId).set(matchedOrd, { merge: true });
                });
              }
            }

            markOrderAsHiddenByCustomer(orderId);

            showToast(currentLang === 'ta' ? "ஆர்டர் விவரம் நீக்கப்பட்டது ✓" : "Order hidden from history!", "success");
            closeCustomerOrderDetailModalDetail();
            renderTrackerScreen();
            try { renderProfileScreen(); } catch(e) { console.error(e); }
            try { renderCartScreen(); } catch(e) { console.error(e); }
          } else {
            markOrderAsDeleted(orderId);

            const orders = getData('ek_orders');
            const matched = orders.find(o => o.id === orderId);
            if (matched) {
              matched.hiddenByAdmin = true;
              matched.updatedAt = new Date().toISOString();
              saveData('ek_orders', orders);

              if (typeof db !== 'undefined' && db) {
                db.collection('ek_orders').doc(orderId).update({
                  hiddenByAdmin: true,
                  updatedAt: new Date().toISOString()
                }).then(() => debugLog(`[Cloud Sync] Order doc ${orderId} hidden/soft-deleted from history by Admin.`))
                .catch(e => {
                  db.collection('ek_orders').doc(orderId).set(matched, { merge: true });
                });
              }
            }

            showToast(currentLang === 'ta' ? "ஆர்டர் வரலாறு நீக்கப்பட்டது ✓" : "Order hidden from history!", "success");
            invalidateDataCache('ek_orders');
            renderAdminDashboard();
            try { if (typeof renderAdminOrders === 'function') renderAdminOrders(); } catch(e) {}
          }
        }
      );
    }

    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
      if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
      if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
      if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c; // Distance in km
      return parseFloat(d.toFixed(2));
    }

    function getDeliveryZones() {
      let zones = typeof getData === 'function' ? getData('ek_delivery_zones', null) : null;
      if (!zones || !Array.isArray(zones) || zones.length === 0) {
        const settings = typeof getData === 'function' ? getData('ek_settings', typeof DEFAULT_SETTINGS !== 'undefined' ? DEFAULT_SETTINGS : {}) : {};
        if (settings && Array.isArray(settings.deliveryZones) && settings.deliveryZones.length > 0) {
          zones = settings.deliveryZones;
        } else if (typeof DEFAULT_SETTINGS !== 'undefined' && Array.isArray(DEFAULT_SETTINGS.deliveryZones)) {
          zones = DEFAULT_SETTINGS.deliveryZones;
        } else {
          zones = [
            { id: 'zone_1', nameEn: 'Local Town', nameTa: 'உள்ளூர் நகரம்', maxKm: 3, charge: 20 },
            { id: 'zone_2', nameEn: 'Suburbs Near', nameTa: 'அருகிலுள்ள புறநகர்', maxKm: 6, charge: 45 },
            { id: 'zone_3', nameEn: 'Suburbs Far', nameTa: 'தொலைதூர புறநகர்', maxKm: 10, charge: 75 },
            { id: 'zone_4', nameEn: 'Outer Boundary', nameTa: 'வெளிப்புற எல்லை', maxKm: 15, charge: 110 }
          ];
        }
      }
      return zones;
    }

    function getDynamicDeliveryCharge(subtotal, user) {
      const settings = getData('ek_settings', DEFAULT_SETTINGS);
      const rainAdd = (settings.rainMode || settings.rainSurchargeEnabled) ? (parseFloat(settings.rainCharge) || parseFloat(settings.rainSurchargeFee) || 20) : 0;

      if (user && user.tier === 'gold') {
        return { charge: 0, distance: 0, zoneName: 'Gold Member Free Delivery' }; // Gold tier always gets FREE delivery
      }

      const textAddress = document.getElementById('cart-delivery-address');
      let custLat = textAddress ? parseFloat(textAddress.getAttribute('data-lat')) : null;
      let custLng = textAddress ? parseFloat(textAddress.getAttribute('data-lng')) : null;

      if (!custLat && user) {
        custLat = user.latitude;
        custLng = user.longitude;
      }

      if (settings.useDynamicDistancePricing) {
        let dist = null;
        if (custLat && custLng) {
          const storeLat = 11.5815;
          const storeLng = 77.8488;
          dist = calculateDistanceKm(storeLat, storeLng, custLat, custLng);
        }

        const zones = getDeliveryZones();
        const sortedZones = [...zones].sort((a, b) => parseFloat(a.maxKm) - parseFloat(b.maxKm));

        if (dist !== null && dist !== undefined && !isNaN(dist)) {
          let matchedZone = null;
          for (const zone of sortedZones) {
            if (dist <= parseFloat(zone.maxKm)) {
              matchedZone = zone;
              break;
            }
          }

          if (matchedZone) {
            const zName = (matchedZone.nameTa || matchedZone.nameEn || matchedZone.name || 'GPS Zone') + (rainAdd > 0 ? ' 🌧️ (Rain Surge)' : '');
            return {
              charge: (parseFloat(matchedZone.charge) || 0) + rainAdd,
              distance: dist,
              zoneName: zName
            };
          } else if (sortedZones.length > 0) {
            const lastZone = sortedZones[sortedZones.length - 1];
            const basePrice = parseFloat(lastZone.charge) || (parseFloat(settings.deliveryBasePrice) || 20);
            const extraKm = dist - parseFloat(lastZone.maxKm);
            const mult = parseFloat(settings.deliveryKmMultiplier) || 12;
            const computed = Math.round(basePrice + (extraKm * mult)) + rainAdd;
            return {
              charge: computed,
              distance: dist,
              zoneName: 'Outer Limits' + (rainAdd > 0 ? ' 🌧️ (Rain Surge)' : '')
            };
          }
        } else {
          // If distance unavailable, use first zone charge as base rate
          const firstZone = sortedZones[0];
          const baseCharge = firstZone ? (parseFloat(firstZone.charge) || 20) + rainAdd : (parseFloat(settings.deliveryCharge) || 40) + rainAdd;
          const zoneTitle = firstZone ? (firstZone.nameTa || firstZone.nameEn || 'Zone 1') + (rainAdd > 0 ? ' 🌧️ (Rain Surge)' : '') : 'Flat Rate';
          return { charge: baseCharge, distance: null, zoneName: zoneTitle };
        }
      }

      const baseCharge = (parseFloat(settings.deliveryCharge) || 40) + rainAdd;
      return { charge: baseCharge, distance: null, zoneName: 'Flat Rate' + (rainAdd > 0 ? ' 🌧️ (Rain Surge)' : '') };
    }

    window.getDeliveryZones = getDeliveryZones;
    window.getDynamicDeliveryCharge = getDynamicDeliveryCharge;

    function updateLyoDeliveryBanner() {
      try {
        const u = typeof getActiveUser === 'function' ? getActiveUser() : null;
        const addrStrip = document.getElementById('lyo-ai-delivery-indicator-strip');
        const addrLbl = document.getElementById('lyo-delivery-address-lbl');
        const distLbl = document.getElementById('lyo-delivery-distance-lbl');
        const badgeLbl = document.getElementById('lyo-delivery-badge-lbl');

        if (!addrStrip || !addrLbl) return;

        const cartAddr = document.getElementById('cart-delivery-address');
        let addressText = cartAddr ? cartAddr.value : '';

        if (!addressText && u) {
          addressText = u.address || '';
        }

        if (!addressText) {
          addrLbl.innerText = (typeof currentLang !== 'undefined' && currentLang === 'ta')
            ? "முகவரி இன்னும் அமைக்கப்படவில்லை. டெலிவரி கட்டணத்தை கணக்கிட முகவரியை அமைக்கவும் 📍"
            : "Delivery address not set. Configure your address to see accurate charge 📍";

          if (distLbl) distLbl.style.display = 'none';
          if (badgeLbl) badgeLbl.innerText = "₹ --";
          return;
        }

        const dummySubtotal = 500;
        const chargeInfo = (typeof getDynamicDeliveryCharge === 'function')
          ? getDynamicDeliveryCharge(dummySubtotal, u)
          : { charge: 40, distance: null, zoneName: 'Flat Rate' };

        addrLbl.innerText = ((typeof currentLang !== 'undefined' && currentLang === 'ta') ? "டெலிவரி முகவரி: " : "Delivery to: ") + addressText;
        if (distLbl) distLbl.style.display = 'flex';

        if (distLbl) {
          if (chargeInfo && chargeInfo.distance !== null && chargeInfo.distance !== undefined) {
            const dText = (typeof currentLang !== 'undefined' && currentLang === 'ta')
              ? `📏 கடைக்கு இடைப்பட்ட தூரம்: ${chargeInfo.distance.toFixed(2)} KM (${chargeInfo.zoneName})`
              : `📏 Distance to store: ${chargeInfo.distance.toFixed(2)} KM (${chargeInfo.zoneName})`;

            const extraText = (typeof currentLang !== 'undefined' && currentLang === 'ta')
              ? "🚚 நீங்கள் வாங்கும் பொருள்களுக்கு மேல் இந்த டெலிவரி சார்ஜ் சேர்க்கப்படும்"
              : "🚚 Added on top of products you ordered";

            distLbl.innerHTML = `<span>${dText}</span><span style="color: rgba(245, 158, 11, 0.95); font-size: 10px; font-weight: 850; margin-top: 3px; display: block; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.12); padding: 5px 10px; border-radius: 6px;">${extraText}</span>`;
          } else {
            distLbl.innerHTML = (typeof currentLang !== 'undefined' && currentLang === 'ta')
              ? "📏 தொலைவு கணக்கிடப்படவில்லை (Flat Rate)"
              : "📏 Distance not measured (Flat Rate)";
          }
        }

        if (badgeLbl) {
          badgeLbl.innerText = (chargeInfo && chargeInfo.charge === 0)
            ? ((typeof currentLang !== 'undefined' && currentLang === 'ta') ? "இலவசம்" : "FREE")
            : `₹${chargeInfo ? chargeInfo.charge : 40}`;
        }

        const elAiConfirmBtn = document.getElementById('lyo-ai-place-order-btn');
        if (elAiConfirmBtn && typeof getSettings === 'function') {
          const settings = getSettings();
          if (settings && settings.leaveMode) {
            elAiConfirmBtn.disabled = true;
            elAiConfirmBtn.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
            elAiConfirmBtn.style.color = '#9ca3af';
            elAiConfirmBtn.style.cursor = 'not-allowed';
            elAiConfirmBtn.innerHTML = (typeof currentLang !== 'undefined' && currentLang === 'ta') ? "கடை லீவு 🌴" : "Shop Holiday 🌴";
          } else {
            elAiConfirmBtn.disabled = false;
            elAiConfirmBtn.style.background = 'linear-gradient(135deg, var(--accent-orange), #10b981)';
            elAiConfirmBtn.style.color = '#ffffff';
            elAiConfirmBtn.style.cursor = 'pointer';
            elAiConfirmBtn.innerHTML = (typeof currentLang !== 'undefined' && currentLang === 'ta') ? "ஆர்டர் செய்ய ✅" : "Place Order ✅";
          }
        }
      } catch (e) {
        console.warn('updateLyoDeliveryBanner warning:', e);
      }
    }

    function getOrderCoordinates(order) {
      const storeLat = 11.5815;
      const storeLng = 77.8488;

      let customerLat = parseFloat(order.deliveryLatitude || order.customerLat);
      let customerLng = parseFloat(order.deliveryLongitude || order.customerLng);

      if (isNaN(customerLat) || isNaN(customerLng)) {
        console.warn("[Map Debug] Order has no valid coordinates. Using deterministic synthetic fallback location for order ID: " + order.id);
        let hash = 0;
        for (let i = 0; i < order.id.length; i++) {
          hash = order.id.charCodeAt(i) + ((hash << 5) - hash);
        }

        const latOffset = ((Math.abs(hash) % 150) - 75) / 10000;
        const lngOffset = (((Math.abs(hash) >> 8) % 150) - 75) / 10000;

        customerLat = storeLat + latOffset;
        customerLng = storeLng + lngOffset;
      }

      return {
        store: [storeLat, storeLng],
        customer: [customerLat, customerLng]
      };
    }

    let deliveryLeafletMap = null;
    let deliveryTileLayer = null;
    let deliveryMapTheme = 'standard';
    let deliveryStoreMarker = null;
    let deliveryCustomerMarker = null;
    let deliveryRoutePolyline = null;
    let deliveryRiderMarker = null;

    function setDeliveryMapTheme(theme) {
      deliveryMapTheme = theme;

      const btnStandard = document.getElementById('delivery-map-theme-standard');
      const btnSatellite = document.getElementById('delivery-map-theme-satellite');

      if (theme === 'satellite') {
        if (btnSatellite) {
          btnSatellite.style.background = 'var(--accent-orange)';
          btnSatellite.style.color = '#000';
          btnSatellite.style.fontWeight = '700';
        }
        if (btnStandard) {
          btnStandard.style.background = '#141416';
          btnStandard.style.color = '#fff';
          btnStandard.style.fontWeight = '500';
        }
      } else {
        if (btnStandard) {
          btnStandard.style.background = 'var(--accent-orange)';
          btnStandard.style.color = '#000';
          btnStandard.style.fontWeight = '700';
        }
        if (btnSatellite) {
          btnSatellite.style.background = '#141416';
          btnSatellite.style.color = '#fff';
          btnSatellite.style.fontWeight = '500';
        }
      }

      if (deliveryLeafletMap && deliveryTileLayer) {
        let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        if (theme === 'satellite') {
          tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
        }
        deliveryTileLayer.setUrl(tileUrl);
      }
    }

    function initDeliveryRiderMap(order) {
      const mapContainer = document.getElementById('delivery-live-map-container');
      const deliveryMapBox = document.getElementById('delivery-map-box');
      if (!mapContainer || !deliveryMapBox) return;

      if (!order || (order.status !== 'delivering' && order.status !== 'ready')) {
        deliveryMapBox.style.display = 'none';
        return;
      }

      deliveryMapBox.style.display = 'block';

      const coords = getOrderCoordinates(order);
      const storePos = coords.store;
      const custPos = coords.customer;

      const targetEl = document.getElementById('delivery-map-target');
      if (targetEl) {
        targetEl.innerHTML = `📍 Customer: ${escapeHtml(order.customerName)} (${escapeHtml(order.deliveryAddress)})`;
      }

      const easyNavBtn = document.getElementById('btn-delivery-easy-nav');
      if (easyNavBtn) {
        easyNavBtn.onclick = () => openGoogleMapsNavigation(order.id);
      }
      const simulateGpsBtn = document.getElementById('btn-delivery-simulate-gps');
      if (simulateGpsBtn) {
        if (order.status === 'delivering') {
          simulateGpsBtn.style.display = 'flex';
        } else {
          simulateGpsBtn.style.display = 'none';
        }
      }
      const realGpsBtn = document.getElementById('btn-delivery-real-gps');
      if (realGpsBtn) {
        if (order.status === 'delivering') {
          realGpsBtn.style.display = 'flex';
        } else {
          realGpsBtn.style.display = 'none';
        }
      }
      const easyCallBtn = document.getElementById('btn-delivery-easy-call');
      if (easyCallBtn) {
        easyCallBtn.onclick = () => {
          const phone = order.customerPhone || "9042681532";
          window.open(`tel:${phone}`, '_blank');
        };
      }
      const easyChatBtn = document.getElementById('btn-delivery-easy-chat');
      if (easyChatBtn) {
        easyChatBtn.onclick = () => {
          const phone = order.customerPhone || "9042681532";
          const formattedPhone = formatIndianPhoneForWhatsApp(phone);
          window.open(`https://wa.me/${formattedPhone}`, '_blank');
        };
      }

      if (typeof L === 'undefined') {
        mapContainer.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:15px; color:var(--text-muted);">
            <p style="font-size:12px;">Map Engine loading... Ensure internet connection. 🌐</p>
          </div>`;
        return;
      }

      const session = getData('ek_delivery_session', null);

      const storeIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div class="map-pin-store" style="background:#e65100; color:#fff; font-size:16px; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.5); z-index:100;">🏪</div>
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const custIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div class="map-pin-customer" style="background:#3b82f6; color:#fff; font-size:14px; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.5); z-index:100;">🏠</div>
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (deliveryLeafletMap) {
        setTimeout(() => {
          if (deliveryLeafletMap) deliveryLeafletMap.invalidateSize();
        }, 150);

        if (deliveryStoreMarker) {
          deliveryStoreMarker.setLatLng(storePos);
        } else {
          deliveryStoreMarker = L.marker(storePos, { icon: storeIcon }).addTo(deliveryLeafletMap)
            .bindPopup("<strong>Lyo Food Delivery (நம்ம கடை) - Kavandampatti, Edappadi 🏪🍖</strong>");
        }

        if (deliveryCustomerMarker) {
          deliveryCustomerMarker.setLatLng(custPos);
        } else {
          deliveryCustomerMarker = L.marker(custPos, { icon: custIcon }).addTo(deliveryLeafletMap)
            .bindPopup(`<strong>${escapeHtml(order.customerName)} / வாடிக்கையாளர் இல்லம் 🏠</strong>`);
        }

        if (deliveryRoutePolyline) {
          deliveryRoutePolyline.setLatLngs([storePos, custPos]);
        } else {
          deliveryRoutePolyline = L.polyline([storePos, custPos], {
            color: '#ff9800',
            weight: 4,
            opacity: 0.7,
            dashArray: '6, 12'
          }).addTo(deliveryLeafletMap);
        }

        if (deliveryRiderMarker && session) {
          const dps = getData('ek_delivery_persons', []);
          const dpi = dps.find(x => x.id === session.id);
          if (dpi && dpi.latitude && dpi.longitude) {
            deliveryRiderMarker.setLatLng([dpi.latitude, dpi.longitude]);
          }
        } else if (session) {
          const dps = getData('ek_delivery_persons', []);
          const dpi = dps.find(x => x.id === session.id);
          if (dpi && dpi.latitude && dpi.longitude) {
            const riderIdIcon = L.divIcon({
              html: `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
                  <div class="map-pin-rider" style="background:#10b981; color:#fff; font-size:16px; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.5); z-index:9999;">🏍️</div>
                </div>
              `,
              className: 'custom-map-icon',
              iconSize: [44, 44],
              iconAnchor: [22, 22]
            });
            deliveryRiderMarker = L.marker([dpi.latitude, dpi.longitude], { icon: riderIdIcon }).addTo(deliveryLeafletMap)
              .bindPopup(currentLang === 'ta' ? "<strong>உங்களது தற்போதைய இடம்</strong> 🏍️" : "<strong>Your Current Position</strong> 🏍️");
          }
        }

        try {
          const markerList = [];
          if (deliveryStoreMarker) markerList.push(deliveryStoreMarker);
          if (deliveryCustomerMarker) markerList.push(deliveryCustomerMarker);
          if (deliveryRiderMarker) markerList.push(deliveryRiderMarker);
          if (markerList.length > 0) {
            const group = new L.featureGroup(markerList);
            deliveryLeafletMap.fitBounds(group.getBounds().pad(0.2));
          }
        } catch (err) {}
        return;
      }

      try {
        deliveryLeafletMap = L.map('delivery-live-map-container', {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true
        }).setView(storePos, 14);

        let initialTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        if (deliveryMapTheme === 'satellite') {
          initialTileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
        }

        deliveryTileLayer = L.tileLayer(initialTileUrl, {
          maxZoom: 20,
          updateWhenIdle: true,
          keepBuffer: 2
        }).addTo(deliveryLeafletMap);

        setTimeout(() => {
          setDeliveryMapTheme(deliveryMapTheme);
        }, 30);

        deliveryStoreMarker = L.marker(storePos, { icon: storeIcon }).addTo(deliveryLeafletMap)
          .bindPopup("<strong>Lyo Food Delivery (நம்ம கடை) - Kavandampatti, Edappadi 🏪🍖</strong>");

        deliveryCustomerMarker = L.marker(custPos, { icon: custIcon }).addTo(deliveryLeafletMap)
          .bindPopup(`<strong>${escapeHtml(order.customerName)} / வாடிக்கையாளர் இல்லம் 🏠</strong>`);

        deliveryRoutePolyline = L.polyline([storePos, custPos], {
          color: '#ff9800',
          weight: 4,
          opacity: 0.7,
          dashArray: '6, 12'
        }).addTo(deliveryLeafletMap);

        if (session) {
          const dps = getData('ek_delivery_persons', []);
          const dpi = dps.find(x => x.id === session.id);
          if (dpi && dpi.latitude && dpi.longitude) {
            const riderIdIcon = L.divIcon({
              html: `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
                  <div class="map-pin-rider" style="background:#10b981; color:#fff; font-size:16px; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.5); z-index:9999;">🏍️</div>
                </div>
              `,
              className: 'custom-map-icon',
              iconSize: [44, 44],
              iconAnchor: [22, 22]
            });
            deliveryRiderMarker = L.marker([dpi.latitude, dpi.longitude], { icon: riderIdIcon }).addTo(deliveryLeafletMap)
              .bindPopup(currentLang === 'ta' ? "<strong>உங்களது தற்போதைய இடம்</strong> 🏍️" : "<strong>Your Current Position</strong> 🏍️");
          }
        }

        const markerList = [];
        if (deliveryStoreMarker) markerList.push(deliveryStoreMarker);
        if (deliveryCustomerMarker) markerList.push(deliveryCustomerMarker);
        if (deliveryRiderMarker) markerList.push(deliveryRiderMarker);
        if (markerList.length > 0) {
          const group = new L.featureGroup(markerList);
          deliveryLeafletMap.fitBounds(group.getBounds().pad(0.15));
        }

        setTimeout(() => {
          if (deliveryLeafletMap) {
            deliveryLeafletMap.invalidateSize();
          }
        }, 250);

      } catch (err) {
        console.error("Rider map initialization failed:", err);
      }
    }

    window.activeGpsSimulationInterval = null;
    window.simGpsOrderStatusUnsub = null;
    window.lastSimGpsTime = 0;
    window.lastSimGpsLat = null;
    window.lastSimGpsLng = null;
    window.hasShownSimFixToast = false;

    function stopRiderGpsSimulation(showNotification = true) {
      if (window.activeGpsSimulationInterval) {
        clearInterval(window.activeGpsSimulationInterval);
        window.activeGpsSimulationInterval = null;
        if (showNotification) {
          showToast("Simulation stopped. / சிமுலேஷன் நிறுத்தப்பட்டது.", "info");
        }
        const btn = document.getElementById('btn-delivery-simulate-gps');
        if (btn) btn.innerHTML = "🛰️ ஜிபிஎஸ் சிமுலேட்டர் (Simulate Trip Coordinates)";
      }
      if (window.simGpsOrderStatusUnsub) {
        try { window.simGpsOrderStatusUnsub(); } catch(e) {}
        window.simGpsOrderStatusUnsub = null;
      }
      window.lastSimGpsTime = 0;
      window.lastSimGpsLat = null;
      window.lastSimGpsLng = null;
      window.hasShownSimFixToast = false;
    }
    window.stopRiderGpsSimulation = stopRiderGpsSimulation;

    function startRiderGpsSimulation() {
      const session = getData('ek_delivery_session', null);
      if (!session) {
        stopRiderGpsSimulation(false);
        return;
      }
      const orders = getData('ek_orders', []);
      const activeOrder = orders.find(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id || o.riderUid === session.id) && o.status === 'delivering');
      if (!activeOrder) {
        showToast("No active delivering orders to simulate!", "error");
        stopRiderGpsSimulation(false);
        return;
      }

      if (window.activeGpsSimulationInterval) {
        stopRiderGpsSimulation(true);
        return;
      }

      if (window.activeRealGpsWatchId !== null) {
        stopRealRiderGpsTracking(false);
      }

      const coords = getOrderCoordinates(activeOrder);
      const storePos = coords.store;
      const custPos = coords.customer;

      let currentStep = 0;
      const totalSteps = 15;

      showToast("🚀 சிமுலேஷன் தொடங்கப்பட்டது! (Starting GPS simulation...)", "success");
      const btn = document.getElementById('btn-delivery-simulate-gps');
      if (btn) btn.innerHTML = "⏹️ நிறுத்தவும் (Stop Simulation)";

      window.lastSimGpsTime = 0;
      window.lastSimGpsLat = null;
      window.lastSimGpsLng = null;
      window.hasShownSimFixToast = false;

      if (window.simGpsOrderStatusUnsub) {
        try { window.simGpsOrderStatusUnsub(); } catch(e) {}
        window.simGpsOrderStatusUnsub = null;
      }
      if (typeof db !== 'undefined' && db) {
        try {
          window.simGpsOrderStatusUnsub = db.collection('ek_orders').doc(activeOrder.id).onSnapshot(doc => {
            if (!doc || !doc.exists) {
              stopRiderGpsSimulation(true);
              return;
            }
            const ordData = typeof normalizeFirestoreData === 'function' ? normalizeFirestoreData(doc.data()) : doc.data();
            if (ordData && ordData.status !== 'delivering') {
              showToast("Order status updated away from delivering. Simulation stopped.", "info");
              stopRiderGpsSimulation(false);
            }
          }, err => {
            console.warn("[Simulation GPS] Order status listener error:", err);
          });
        } catch(e) {}
      }

      window.activeGpsSimulationInterval = setInterval(() => {
        currentStep++;
        const f = currentStep / totalSteps;
        const simLat = storePos[0] + (custPos[0] - storePos[0]) * f;
        const simLng = storePos[1] + (custPos[1] - storePos[1]) * f;

        session.latitude = simLat;
        session.longitude = simLng;
        saveData('ek_delivery_session', session);

        const now = Date.now();
        const timeDiff = now - window.lastSimGpsTime;
        let distMeters = 0;
        if (window.lastSimGpsLat !== null && window.lastSimGpsLng !== null) {
          const distKm = typeof calculateDistanceKm === 'function'
            ? calculateDistanceKm(window.lastSimGpsLat, window.lastSimGpsLng, simLat, simLng)
            : null;
          if (distKm !== null) distMeters = distKm * 1000;
        }

        const isFirstTick = (window.lastSimGpsTime === 0 || window.lastSimGpsLat === null);
        const passTimeCheck = (timeDiff >= 8000);
        const passDistanceCheck = (distMeters >= 15);

        if (!isFirstTick && !passTimeCheck && !passDistanceCheck && currentStep < totalSteps) {
          return;
        }

        window.lastSimGpsTime = now;
        window.lastSimGpsLat = simLat;
        window.lastSimGpsLng = simLng;

        const list = getData('ek_delivery_persons', []);
        const idx = list.findIndex(e => e.id === session.id);
        if (idx !== -1) {
          list[idx].latitude = simLat;
          list[idx].longitude = simLng;
          list[idx].updatedAt = new Date().toISOString();
          saveData('ek_delivery_persons', list);

          if (typeof db !== 'undefined' && db) {
            db.collection('ek_delivery_persons').doc(session.id).set(list[idx])
              .then(() => {
                debugLog("[Simulation GPS] Pushed simulation coords to rider profile:", simLat, simLng);
              })
              .catch(err => {
                console.error("Simulation GPS push error for rider profile:", err);
              });

            db.collection('ek_orders').doc(activeOrder.id).update({
              riderLatitude: simLat,
              riderLongitude: simLng,
              updatedAt: new Date().toISOString()
            }).then(() => {
              debugLog("[Simulation GPS] Coords synchronized to active order:", simLat, simLng);
            }).catch(err => {
              console.warn("Simulation GPS push error for active order:", err);
            });
          }
        }

        if (typeof currentScreen !== 'undefined' && currentScreen === 'screen-delivery') {
          if (typeof renderDeliveryScreen === 'function') renderDeliveryScreen();
        }

        if (!window.hasShownSimFixToast) {
          window.hasShownSimFixToast = true;
          showToast("📍 Simulation Position Updated!", "success");
        }

        if (currentStep >= totalSteps) {
          stopRiderGpsSimulation(false);
          showToast("🏁 சிமுலேஷன் முடிவடைந்தது! (Simulation finished!)", "success");
        }
      }, 3000);
    }

    window.activeRealGpsWatchId = null;
    window.realGpsOrderStatusUnsub = null;
    window.lastRealGpsTime = 0;
    window.lastRealGpsLat = null;
    window.lastRealGpsLng = null;
    window.hasShownGpsFixToast = false;
    window.realGpsWasTrackingBeforeBackground = false;

    function stopRealRiderGpsTracking(showNotification = true) {
      if (window.activeRealGpsWatchId !== null) {
        try {
          navigator.geolocation.clearWatch(window.activeRealGpsWatchId);
        } catch(e) {}
        window.activeRealGpsWatchId = null;
        if (showNotification) {
          showToast("சாதன ஜிபிஎஸ் முடக்கப்பட்டது. (Real GPS stopped.)", "info");
        }
        const btn = document.getElementById('btn-delivery-real-gps');
        if (btn) {
          btn.innerHTML = "🛰️ சாதன ஜிபிஎஸ் (Real GPS)";
          btn.style.background = "rgba(232, 113, 10, 0.15)";
        }
      }
      if (window.realGpsOrderStatusUnsub) {
        try { window.realGpsOrderStatusUnsub(); } catch(e) {}
        window.realGpsOrderStatusUnsub = null;
      }
      window.lastRealGpsTime = 0;
      window.lastRealGpsLat = null;
      window.lastRealGpsLng = null;
      window.hasShownGpsFixToast = false;
    }
    window.stopRealRiderGpsTracking = stopRealRiderGpsTracking;

    function startRealRiderGpsTracking() {
      const session = getData('ek_delivery_session', null);
      if (!session) {
        stopRealRiderGpsTracking(false);
        return;
      }
      const orders = getData('ek_orders', []);
      const activeOrder = orders.find(o => (o.assignedExecutiveId === session.id || o.deliveryExecutiveId === session.id || o.riderUid === session.id) && o.status === 'delivering');
      if (!activeOrder) {
        showToast("No active delivering orders to track with real GPS!", "error");
        stopRealRiderGpsTracking(false);
        return;
      }

      if (window.activeRealGpsWatchId !== null) {
        stopRealRiderGpsTracking(true);
        return;
      }

      if (window.activeGpsSimulationInterval) {
        stopRiderGpsSimulation(false);
      }

      showToast("🛰️ சாதனம் ஜிபிஎஸ் இயக்கப்பட்டது! (Connecting real phone GPS...)", "info");

      if (!navigator.geolocation) {
        showToast("சாதனம் ஜிபிஎஸ் உங்கள் போனில் ஆதரிக்கவில்லை! / GPS unsupported.", "error");
        return;
      }

      const btn = document.getElementById('btn-delivery-real-gps');
      if (btn) {
        btn.innerHTML = "⏹️ சாதன ஜிபிஎஸ் (Stop Real GPS)";
        btn.style.background = "rgba(232, 113, 10, 0.35)";
      }

      window.lastRealGpsTime = 0;
      window.lastRealGpsLat = null;
      window.lastRealGpsLng = null;
      window.hasShownGpsFixToast = false;

      if (window.realGpsOrderStatusUnsub) {
        try { window.realGpsOrderStatusUnsub(); } catch(e) {}
        window.realGpsOrderStatusUnsub = null;
      }
      if (typeof db !== 'undefined' && db) {
        try {
          window.realGpsOrderStatusUnsub = db.collection('ek_orders').doc(activeOrder.id).onSnapshot(doc => {
            if (!doc || !doc.exists) {
              stopRealRiderGpsTracking(true);
              return;
            }
            const ordData = typeof normalizeFirestoreData === 'function' ? normalizeFirestoreData(doc.data()) : doc.data();
            if (ordData && ordData.status !== 'delivering') {
              showToast("Order status updated away from delivering. GPS tracking stopped.", "info");
              stopRealRiderGpsTracking(false);
            }
          }, err => {
            console.warn("[Real GPS Watch] Order status listener error:", err);
          });
        } catch(e) {
          console.warn("[Real GPS Watch] Failed to attach order listener:", e);
        }
      }

      window.activeRealGpsWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const simLat = position.coords.latitude;
          const simLng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          debugLog("[Real GPS Watch] Latitude:", simLat, "Longitude:", simLng, "Accuracy:", accuracy);

          session.latitude = simLat;
          session.longitude = simLng;
          saveData('ek_delivery_session', session);

          const now = Date.now();
          const timeDiff = now - window.lastRealGpsTime;
          let distMeters = 0;
          if (window.lastRealGpsLat !== null && window.lastRealGpsLng !== null) {
            const distKm = typeof calculateDistanceKm === 'function'
              ? calculateDistanceKm(window.lastRealGpsLat, window.lastRealGpsLng, simLat, simLng)
              : null;
            if (distKm !== null) distMeters = distKm * 1000;
          }

          const isFirstFix = (window.lastRealGpsTime === 0 || window.lastRealGpsLat === null);
          const passTimeCheck = (timeDiff >= 8000);
          const passDistanceCheck = (distMeters >= 15);

          if (!isFirstFix && !passTimeCheck && !passDistanceCheck) {
            return;
          }

          window.lastRealGpsTime = now;
          window.lastRealGpsLat = simLat;
          window.lastRealGpsLng = simLng;

          const list = getData('ek_delivery_persons', []);
          const idx = list.findIndex(e => e.id === session.id);
          if (idx !== -1) {
            list[idx].latitude = simLat;
            list[idx].longitude = simLng;
            list[idx].updatedAt = new Date().toISOString();
            saveData('ek_delivery_persons', list);

            if (typeof db !== 'undefined' && db) {
              db.collection('ek_delivery_persons').doc(session.id).set(list[idx])
                .then(() => {
                  debugLog("[Real GPS Push] Coords synchronized to rider profile:", simLat, simLng);
                })
                .catch(err => {
                  console.error("Firestore GPS update failure for rider profile:", err);
                });

              db.collection('ek_orders').doc(activeOrder.id).update({
                riderLatitude: simLat,
                riderLongitude: simLng,
                updatedAt: new Date().toISOString()
              }).then(() => {
                debugLog("[Real GPS Push] Coords synchronized to active order:", simLat, simLng);
              }).catch(err => {
                console.warn("Firestore GPS update failure for active order:", err);
              });
            }
          }

          if (typeof currentScreen !== 'undefined' && currentScreen === 'screen-delivery') {
            if (typeof renderDeliveryScreen === 'function') renderDeliveryScreen();
          }

          if (!window.hasShownGpsFixToast) {
            window.hasShownGpsFixToast = true;
            showToast(`📍 GPS Updated! (Accuracy: ±${Math.round(accuracy)}m)`, "success");
          }
        },
        (err) => {
          console.error("Real GPS watch error:", err);
          showToast("ஜிபிஎஸ் சிக்னல் குறைவு! / Weak GPS signal or permission denied. Please verify settings.", "warning");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }