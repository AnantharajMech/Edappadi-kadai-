const fs = require("fs");
let html = fs.readFileSync("app/src/main/assets/index.html", "utf8");

// 1. Update getLocalLyoFallbackReply to build MULTI-ITEM stacked proposals
const fallbackStart = html.indexOf("function getLocalLyoFallbackReply");
const fallbackEnd = html.indexOf("async function sendLyoAiMessage", fallbackStart);

const newFallbackFn = `function getLocalLyoFallbackReply(query, products) {
      const q = (query || "").toLowerCase();
      let matchedProds = [];
      const addedIds = new Set();

      products.forEach(p => {
        if (!p || !p.id || addedIds.has(p.id)) return;
        const nameTa = (p.tamilName || "").toLowerCase();
        const nameEn = (p.englishName || "").toLowerCase();

        let isMatch = false;
        if (q.includes("சிக்கன்") && (nameTa.includes("சிக்கன்") || nameEn.includes("chicken"))) isMatch = true;
        else if (q.includes("மட்டன்") && (nameTa.includes("மட்டன்") || nameEn.includes("mutton"))) isMatch = true;
        else if (q.includes("தக்காளி") && (nameTa.includes("தக்காளி") || nameEn.includes("tomato"))) isMatch = true;
        else if (q.includes("உருளை") && (nameTa.includes("உருளை") || nameEn.includes("potato"))) isMatch = true;
        else if (q.includes("வெங்காயம்") && (nameTa.includes("வெங்காயம்") || nameEn.includes("onion"))) isMatch = true;
        else if (q.includes("பால்") && (nameTa.includes("பால்") || nameEn.includes("milk"))) isMatch = true;
        else if (nameTa && nameTa.length > 2 && q.includes(nameTa)) isMatch = true;
        else if (nameEn && nameEn.length > 2 && q.includes(nameEn)) isMatch = true;

        if (isMatch) {
          matchedProds.push(p);
          addedIds.add(p.id);
        }
      });

      if (matchedProds.length > 0) {
        const propList = matchedProds.map(p => {
          const isPiece = isLyoPieceUnit(p.unit);
          let grams = isPiece ? 1 : 500;
          if (!isPiece) {
            if (q.includes("250") || q.includes("கால்")) grams = 250;
            else if (q.includes("750") || q.includes("முக்கால்")) grams = 750;
            else if (q.includes("1000") || q.includes("1 kg") || q.includes("1கிலோ") || q.includes("ஒரு கிலோ")) grams = 1000;
            else if (q.includes("அரை") || q.includes("500")) grams = 500;
          }
          const pricePerKg = parseFloat(p.pricePerKg) || 0;
          const price = isPiece
            ? Math.round(pricePerKg * grams)
            : Math.round((pricePerKg / 1000) * grams);

          return {
            productId: p.id,
            tamilName: p.tamilName || p.englishName,
            englishName: p.englishName || p.tamilName,
            weightGrams: grams,
            isUnit: isPiece,
            pricePerKg: pricePerKg,
            unit: p.unit || (isPiece ? "packet" : "kg"),
            totalPrice: price
          };
        });

        const propJson = JSON.stringify(propList);
        const itemNames = matchedProds.map(p => currentLang === "ta" ? p.tamilName : p.englishName).join(", ");
        return currentLang === "ta"
          ? `கீழே உள்ள விவரங்களை ஒருமுறை சரிபார்த்து 'Order Now' அல்லது 'Add All' பட்டனைத் தட்டி சட்டுனு கூடையில் சேர்த்துக் கொள்ளுங்கள், உடனே வேகமாக டெலிவரி தந்துடுறேன் அண்ணே! 👇🥦🥩\n\n[PROPOSAL_DATA_START]${propJson}[PROPOSAL_DATA_END]`
          : `Here are your requested items from Edappadi Kadai! You can adjust quantities and place your order in 1-click below: 👇🥦🥩\n\n[PROPOSAL_DATA_START]${propJson}[PROPOSAL_DATA_END]`;
      }

      if (q.includes("ஆர்டர்") || q.includes("order") || q.includes("ஸ்டேட்டஸ்")) {
        return currentLang === "ta"
          ? "உங்கள் கடைசி ஆர்டர் விவரங்களைக் காண கீழே உள்ள 'Track' டேப்பை அழுத்தவும். 📦"
          : "To track your latest order status, please switch to the 'Track' tab at the bottom. 📦";
      }
      if (q.includes("முகவரி") || q.includes("address") || q.includes("கடை")) {
        return currentLang === "ta"
          ? "நமது கடை முகவரி: பிரதான சாலை, எடப்பாடி, சேலம் மாவட்டம். 📍\nகாலை 6:00 மணி முதல் இரவு 9:00 மணி வரை இயங்கும்."
          : "Store Address: Main Road, Edappadi, Salem District. 📍\nOpen daily from 6:00 AM to 9:00 PM.";
      }
      return currentLang === "ta"
        ? "நன்றி! எடப்பாடி கடை AI உங்களுக்கு உதவ தயாராக உள்ளது. உங்களுக்கு தேவையான சிக்கன், மட்டன், காய்கறிகளை இங்கே குறிப்பிடுங்கள்! 🍗🥦"
        : "Thank you! Edappadi Kadai AI is ready to help you. Let me know what meat or vegetables you need! 🍗🥦";
    }

    `;

html = html.substring(0, fallbackStart) + newFallbackFn + html.substring(fallbackEnd);

// 2. Replace Proposal Card Renderer & Inline Actions
const cardCodeStart = html.indexOf("function adjustInlineLyoItem");
const cardCodeEnd = html.indexOf("function initLyoAiChat");

const newCardCode = `function addSingleLyoProposalItemToCart(msgIdx, pIdx) {
      if (!lyoAiChatHistory[msgIdx] || !lyoAiChatHistory[msgIdx].proposalData) return;
      const p = lyoAiChatHistory[msgIdx].proposalData[pIdx];
      if (!p || p.unavailable) return;

      const products = getData("ek_products", []);
      const prod = products.find(pr => pr.id === p.productId) || p;
      const isPiece = isLyoPieceUnit(p.unit || prod.unit);
      const weightGrams = p.weightGrams || (isPiece ? 1 : 500);
      const pricePerKg = parseFloat(p.pricePerKg || prod.pricePerKg) || 0;
      const price = isPiece
        ? Math.round(pricePerKg * weightGrams)
        : Math.round((pricePerKg / 1000) * weightGrams);

      const existingIdx = cart.findIndex(c => c.productId === (p.productId || prod.id) && c.weightGrams === weightGrams);
      if (existingIdx !== -1) {
        cart[existingIdx].weightGrams = weightGrams;
        cart[existingIdx].totalPrice = price;
      } else {
        cart.push({
          productId: p.productId || prod.id,
          tamilName: p.tamilName || prod.tamilName || "பொருள்",
          englishName: p.englishName || prod.englishName || "Item",
          weightGrams: weightGrams,
          cutStyle: "Standard Cut",
          category: prod.category || "General",
          unit: p.unit || prod.unit || (isPiece ? "piece" : "kg"),
          totalPrice: price,
          pricePerKg: pricePerKg
        });
      }
      saveCart();
      updateLyoAiStickyCart();
      if (typeof renderCartScreen === "function") renderCartScreen();
      if (typeof updateCartBadge === "function") updateCartBadge();
      showToast(
        currentLang === "ta"
          ? \`\${escapeHtml(p.tamilName || p.englishName)} கூடையில் சேர்க்கப்பட்டது 🛒\`
          : \`\${escapeHtml(p.englishName || p.tamilName)} added to cart 🛒\`,
        "success"
      );
    }

    function discardInlineLyoItem(msgIdx, pIdx) {
      if (!lyoAiChatHistory[msgIdx] || !lyoAiChatHistory[msgIdx].proposalData) return;
      lyoAiChatHistory[msgIdx].proposalData.splice(pIdx, 1);
      if (lyoAiChatHistory[msgIdx].proposalData.length === 0) {
        lyoAiChatHistory[msgIdx].proposalData = null;
      }
      renderLyoAiMessages();
    }

    function discardAllLyoProposalItems(msgIdx) {
      if (lyoAiChatHistory[msgIdx]) {
        lyoAiChatHistory[msgIdx].proposalData = null;
        renderLyoAiMessages();
        if (typeof showToast === "function") {
          showToast(
            currentLang === "ta" ? "பரிந்துரைப் பட்டியல் நீக்கப்பட்டது 🗑️" : "Proposal items discarded 🗑️",
            "info"
          );
        }
      }
    }

    function adjustInlineLyoItem(msgIdx, pIdx, delta) {
      if (!lyoAiChatHistory[msgIdx] || !lyoAiChatHistory[msgIdx].proposalData) return;
      const item = lyoAiChatHistory[msgIdx].proposalData[pIdx];
      if (!item || item.unavailable) return;
      const isPiece = isLyoPieceUnit(item.unit);
      const step = isPiece ? 1 : 250;
      const minVal = isPiece ? 1 : 250;
      let currentGrams = item.weightGrams || item.qty || (isPiece ? 1 : 500);
      let newGrams = currentGrams + (delta * step);
      if (newGrams < minVal) newGrams = minVal;
      item.weightGrams = newGrams;
      const pricePerKg = parseFloat(item.pricePerKg) || 0;
      item.totalPrice = isPiece
        ? Math.round(pricePerKg * newGrams)
        : Math.round((pricePerKg / 1000) * newGrams);
      renderLyoAiMessages();
    }

    function addAllLyoProposalItems(msgIdx) {
      if (!lyoAiChatHistory[msgIdx] || !lyoAiChatHistory[msgIdx].proposalData) return;
      const items = lyoAiChatHistory[msgIdx].proposalData;
      if (!Array.isArray(items) || items.length === 0) return;
      const products = getData("ek_products", []);
      let addedCount = 0;
      items.forEach(p => {
        if (p.unavailable) return;
        const prod = products.find(pr => pr.id === p.productId) || p;
        const isPiece = isLyoPieceUnit(p.unit || prod.unit);
        const weightGrams = p.weightGrams || (isPiece ? 1 : 500);
        const pricePerKg = parseFloat(p.pricePerKg || prod.pricePerKg) || 0;
        const price = isPiece
          ? Math.round(pricePerKg * weightGrams)
          : Math.round((pricePerKg / 1000) * weightGrams);

        const existingIdx = cart.findIndex(c => c.productId === (p.productId || prod.id) && c.weightGrams === weightGrams);
        if (existingIdx !== -1) {
          cart[existingIdx].weightGrams = weightGrams;
          cart[existingIdx].totalPrice = price;
        } else {
          cart.push({
            productId: p.productId || prod.id,
            tamilName: p.tamilName || prod.tamilName || "பொருள்",
            englishName: p.englishName || prod.englishName || "Item",
            weightGrams: weightGrams,
            cutStyle: "Standard Cut",
            category: prod.category || "General",
            unit: p.unit || prod.unit || (isPiece ? "piece" : "kg"),
            totalPrice: price,
            pricePerKg: pricePerKg
          });
          addedCount++;
        }
      });
      saveCart();
      updateLyoAiStickyCart();
      if (typeof renderCartScreen === "function") renderCartScreen();
      if (typeof updateCartBadge === "function") updateCartBadge();
      showToast(
        currentLang === "ta"
          ? \`\${addedCount > 0 ? addedCount + ' ' : ''}பொருட்கள் கார்ட்டில் சேர்க்கப்பட்டன 🛒\`
          : \`\${addedCount > 0 ? addedCount + ' ' : ''}items added to cart 🛒\`,
        "success"
      );
    }

    function checkoutAllLyoProposalItems(msgIdx) {
      addAllLyoProposalItems(msgIdx);
      if (typeof showTab === "function") {
        showTab("tab-cart");
      } else if (typeof showScreen === "function") {
        showScreen("screen-cart");
      }
    }

    function renderLyoProposalCardHtml(msg, msgIdx) {
      if (!msg.proposalData || msg.proposalData.length === 0) return "";
      let cardTotal = 0;
      let itemsHtml = "";

      msg.proposalData.forEach((p, pIdx) => {
        if (p.unavailable) {
          itemsHtml += \`
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: rgba(22, 27, 34, 0.8); border: 1px dashed rgba(239, 68, 68, 0.35); border-radius: 12px; margin-bottom: 8px;">
              <div style="min-width: 0; flex: 1;">
                <div style="font-weight: 800; font-size: 13.5px; color: #fff;">
                  \${currentLang === "ta" ? escapeHtml(p.tamilName || p.englishName) : escapeHtml(p.englishName || p.tamilName)}
                </div>
                <div style="font-size: 11.5px; color: #ef4444; font-weight: 700; margin-top: 2px;">
                  Unavailable ❌
                </div>
              </div>
              <button onclick="discardInlineLyoItem(\${msgIdx}, \${pIdx})" style="width: 34px; height: 34px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Remove">
                🗑️
              </button>
            </div>
          \`;
          return;
        }

        cardTotal += (p.totalPrice || 0);
        const isPiece = isLyoPieceUnit(p.unit);
        const weightKg = (p.weightGrams / 1000).toFixed(2);
        const qtyText = isPiece
          ? \`\${p.weightGrams || p.qty || 1} \${p.unit || (currentLang==="ta"?"பாக்கெட்":"packets")}\`
          : \`\${p.weightGrams}g (\${weightKg} Kg)\`;

        itemsHtml += \`
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(18, 24, 32, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 8px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);">
            <div style="min-width: 0; flex: 1; padding-right: 8px;">
              <div style="font-weight: 800; font-size: 13.5px; color: #ffffff; line-height: 1.2;">
                \${currentLang === "ta" ? escapeHtml(p.tamilName || p.englishName) : escapeHtml(p.englishName || p.tamilName)}
              </div>
              <div style="font-size: 11.5px; margin-top: 3px; font-weight: 700; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="color: #f59e0b;">\${qtyText}</span>
                <span style="color: rgba(255,255,255,0.25);">|</span>
                <span style="color: #10b981; font-weight: 800;">₹\${p.totalPrice || 0}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 2px 4px; display: flex; align-items: center; gap: 4px;">
                <button onclick="adjustInlineLyoItem(\${msgIdx}, \${pIdx}, -1)" style="width: 24px; height: 24px; border-radius: 6px; background: transparent; border: none; color: #fff; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                <span style="font-size: 11.5px; font-weight: 800; color: #fff; min-width: 28px; text-align: center;">\${p.weightGrams || p.qty || 1}</span>
                <button onclick="adjustInlineLyoItem(\${msgIdx}, \${pIdx}, 1)" style="width: 24px; height: 24px; border-radius: 6px; background: transparent; border: none; color: #fff; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
              </div>
              <button onclick="addSingleLyoProposalItemToCart(\${msgIdx}, \${pIdx})" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px;" title="Add to Cart">
                🛒
              </button>
              <button onclick="discardInlineLyoItem(\${msgIdx}, \${pIdx})" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px;" title="Remove">
                🗑️
              </button>
            </div>
          </div>
        \`;
      });

      const user = typeof getActiveUser === "function" ? getActiveUser() : null;
      let fin = { deliveryFee: 15, zoneName: "Edappadi Mini Ward (Town Core)" };
      if (typeof calculateOrderFinancials === "function") {
        fin = calculateOrderFinancials(cardTotal, user);
      }
      const grandTotal = cardTotal + (fin.deliveryFee || 0);

      const deliveryBannerText = (user && (user.tier || "").toLowerCase() === "gold") || fin.deliveryFee === 0
        ? "🏅 Gold Member: FREE Delivery for you!"
        : \`📍 Delivery charge for your location is ₹\${fin.deliveryFee || 15} (\${fin.zoneName || "Edappadi Mini Ward (Town Core)"})\`;

      return \`
        <div style="margin-top: 10px; padding: 12px; background: rgba(12, 16, 22, 0.9); border: 1px solid rgba(16,185,129,0.25); border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
          \${itemsHtml}

          <!-- Delivery Charge Banner -->
          <div style="font-size: 11.5px; font-weight: 700; color: #84cc16; margin: 10px 0 6px 0; display: flex; align-items: center; gap: 4px;">
            \${deliveryBannerText}
          </div>

          <!-- Minimum Order Status Badge -->
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.35); border-radius: 10px; padding: 8px 12px; font-size: 11.5px; font-weight: 700; color: #34d399; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>\${currentLang === "ta" ? "✅ குறைந்தபட்ச ஆர்டர் தகுதி பெறப்பட்டது!" : "✅ Minimum order requirement met!"} (\${cardTotal} / ₹0)</span>
          </div>

          <!-- Main Big Order Now Button -->
          <button onclick="checkoutAllLyoProposalItems(\${msgIdx})" style="width: 100%; padding: 13px 16px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%); border: none; color: #ffffff; font-size: 13.5px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.3); margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            <span>🛍️ \${currentLang === "ta" ? \`உடனே ஆர்டர் செய்ய (₹\${cardTotal} + ₹\${fin.deliveryFee || 0} டெலிவரி = ₹\${grandTotal})\` : \`Order Now (₹\${cardTotal} items + ₹\${fin.deliveryFee || 0} del = ₹\${grandTotal})\`}</span>
          </button>

          <!-- Secondary Action Buttons Row -->
          <div style="display: flex; gap: 10px;">
            <button onclick="addAllLyoProposalItems(\${msgIdx})" style="flex: 1; padding: 11px; border-radius: 12px; background: #f59e0b; border: none; color: #000000; font-size: 12.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(245,158,11,0.25); display: flex; align-items: center; justify-content: center; gap: 6px;">
              🛒 \${currentLang === "ta" ? "கூடையில் சேர்" : "Add All"}
            </button>
            <button onclick="discardAllLyoProposalItems(\${msgIdx})" style="flex: 1; padding: 11px; border-radius: 12px; background: #ea580c; border: none; color: #ffffff; font-size: 12.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(234,88,12,0.25); display: flex; align-items: center; justify-content: center; gap: 6px;">
              🗑️ \${currentLang === "ta" ? "நீக்குக" : "Discard"}
            </button>
          </div>
        </div>
      \`;
    }

    `;

html = html.substring(0, cardCodeStart) + newCardCode + html.substring(cardCodeEnd);

fs.writeFileSync("app/src/main/assets/index.html", html, "utf8");
console.log("🎉 Successfully applied update_lyo.js!");
