import re

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. New, bulletproof getLocalLyoFallbackReply
new_fallback_fn = """function getLocalLyoFallbackReply(query, products) {
      const q = (query || "").toLowerCase().trim();
      let matchedProds = [];
      const addedIds = new Set();

      if (Array.isArray(products) && products.length > 0) {
        products.forEach(p => {
          if (!p || !p.id || addedIds.has(p.id)) return;
          const nameTa = (p.tamilName || "").toLowerCase();
          const nameEn = (p.englishName || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();

          let isMatch = false;

          if ((q.includes("சிக்கன்") || q.includes("chicken")) && (nameTa.includes("சிக்கன்") || nameEn.includes("chicken") || cat.includes("chicken"))) isMatch = true;
          else if ((q.includes("மட்டன்") || q.includes("mutton")) && (nameTa.includes("மட்டன்") || nameEn.includes("mutton") || cat.includes("mutton"))) isMatch = true;
          else if ((q.includes("முட்டை") || q.includes("egg")) && (nameTa.includes("முட்டை") || nameEn.includes("egg") || cat.includes("egg"))) isMatch = true;
          else if ((q.includes("தக்காளி") || q.includes("tomato")) && (nameTa.includes("தக்காளி") || nameEn.includes("tomato") || cat.includes("vegetable"))) isMatch = true;
          else if ((q.includes("உருளை") || q.includes("potato")) && (nameTa.includes("உருளை") || nameEn.includes("potato") || cat.includes("vegetable"))) isMatch = true;
          else if ((q.includes("வெங்காயம்") || q.includes("onion")) && (nameTa.includes("வெங்காயம்") || nameEn.includes("onion") || cat.includes("vegetable"))) isMatch = true;
          else if ((q.includes("பால்") || q.includes("milk")) && (nameTa.includes("பால்") || nameEn.includes("milk") || cat.includes("dairy"))) isMatch = true;
          else if ((q.includes("மீன்") || q.includes("fish")) && (nameTa.includes("மீன்") || nameEn.includes("fish") || cat.includes("fish"))) isMatch = true;
          else if (nameTa && nameTa.length >= 2 && q.includes(nameTa)) isMatch = true;
          else if (nameEn && nameEn.length >= 2 && q.includes(nameEn)) isMatch = true;
          else if (nameTa && nameTa.length >= 2 && nameTa.split(/\\s+/).some(w => w.length >= 3 && q.includes(w))) isMatch = true;

          if (isMatch) {
            matchedProds.push(p);
            addedIds.add(p.id);
          }
        });
      }

      if (matchedProds.length > 0) {
        const propList = matchedProds.map(p => {
          const isPiece = isLyoPieceUnit(p.unit);
          let grams = isPiece ? 1 : 500;
          if (isPiece) {
            if (q.includes("2") || q.includes("இரண்டு") || q.includes("2 பாக்கெட்")) grams = 2;
            else if (q.includes("3") || q.includes("மூன்று") || q.includes("3 பாக்கெட்")) grams = 3;
            else if (q.includes("4") || q.includes("நான்கு") || q.includes("4 பாக்கெட்")) grams = 4;
            else if (q.includes("5") || q.includes("ஐந்து") || q.includes("5 பாக்கெட்")) grams = 5;
            else if (q.includes("10") || q.includes("பத்து")) grams = 10;
            else grams = 1;
          } else {
            if (q.includes("250") || q.includes("கால்")) grams = 250;
            else if (q.includes("750") || q.includes("முக்கால்")) grams = 750;
            else if (q.includes("2000") || q.includes("2 kg") || q.includes("2kg") || q.includes("2கிலோ") || q.includes("2 கிலோ") || q.includes("இரண்டு கிலோ")) grams = 2000;
            else if (q.includes("1000") || q.includes("1 kg") || q.includes("1kg") || q.includes("1கிலோ") || q.includes("1 கிலோ") || q.includes("ஒரு கிலோ")) grams = 1000;
            else if (q.includes("அரை") || q.includes("500")) grams = 500;
            else grams = 500;
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
        return currentLang === "ta"
          ? `உங்கள் தயாரிப்பு விவரங்கள் ஆர்டர் கார்டில் சேர்க்கப்பட்டுள்ளன! கீழே உள்ள 'Order Now' அல்லது 'Add All' பட்டனைத் தட்டி எளிதாக ஆர்டர் செய்யலாம் 👇🥦🥩\\n\\n[PROPOSAL_DATA_START]${propJson}[PROPOSAL_DATA_END]`
          : `Here are your requested items from Edappadi Kadai! You can adjust quantities and place your order in 1-click below: 👇🥦🥩\\n\\n[PROPOSAL_DATA_START]${propJson}[PROPOSAL_DATA_END]`;
      }

      if (q.includes("ஆர்டர்") || q.includes("order") || q.includes("ஸ்டேட்டஸ்")) {
        return currentLang === "ta"
          ? "உங்கள் கடைசி ஆர்டர் விவரங்களைக் காண கீழே உள்ள 'Track' டேப்பை அழுத்தவும். 📦"
          : "To track your latest order status, please switch to the 'Track' tab at the bottom. 📦";
      }
      if (q.includes("முகவரி") || q.includes("address") || q.includes("கடை")) {
        return currentLang === "ta"
          ? "நமது கடை முகவரி: பிரதான சாலை, எடப்பாடி, சேலம் மாவட்டம். 📍\\nகாலை 6:00 மணி முதல் இரவு 9:00 மணி வரை இயங்கும்."
          : "Store Address: Main Road, Edappadi, Salem District. 📍\\nOpen daily from 6:00 AM to 9:00 PM.";
      }
      return currentLang === "ta"
        ? "நன்றி! எடப்பாடி கடை AI உங்களுக்கு உதவ தயாராக உள்ளது. உங்களுக்கு தேவையான சிக்கன், மட்டன், காய்கறிகளை இங்கே குறிப்பிடுங்கள்! 🍗🥦"
        : "Thank you! Edappadi Kadai AI is ready to help you. Let me know what meat or vegetables you need! 🍗🥦";
    }

    """

# Replace getLocalLyoFallbackReply function
fb_start = html.find("function getLocalLyoFallbackReply")
fb_end = html.find("async function sendLyoAiMessage", fb_start)

if fb_start != -1 and fb_end != -1:
    html = html[:fb_start] + new_fallback_fn + html[fb_end:]
    print("✅ Replaced getLocalLyoFallbackReply!")
else:
    print("❌ Could not locate getLocalLyoFallbackReply bounds")

# 2. Update sendLyoAiMessage proposal parsing to merge with active proposal card
target_parse_start = html.find("// Parse proposal JSON if present")
target_parse_end = html.find("lyoAiChatHistory.push({", target_parse_start)

new_parse_code = """// Parse proposal JSON if present
        let proposalData = null;
        if (aiReplyText.includes("[PROPOSAL_DATA_START]") && aiReplyText.includes("[PROPOSAL_DATA_END]")) {
          try {
            const jsonStr = aiReplyText.substring(
              aiReplyText.indexOf("[PROPOSAL_DATA_START]") + "[PROPOSAL_DATA_START]".length,
              aiReplyText.indexOf("[PROPOSAL_DATA_END]")
            ).trim();
            proposalData = JSON.parse(jsonStr);
            aiReplyText = aiReplyText.substring(0, aiReplyText.indexOf("[PROPOSAL_DATA_START]")).trim();
          } catch (pErr) {
            console.error("Proposal JSON parse error:", pErr);
          }
        }

        // UNIFIED CARD MERGING: Find existing active proposal items from older messages
        let existingProposalItems = [];
        lyoAiChatHistory.forEach(m => {
          if (m && Array.isArray(m.proposalData) && m.proposalData.length > 0) {
            existingProposalItems = existingProposalItems.concat(m.proposalData);
            m.proposalData = null; // Clear old proposal card so ONLY the latest message renders the single card!
          }
        });

        // Merge existing and new items into one consolidated map
        let unifiedMap = new Map();
        existingProposalItems.forEach(item => {
          if (item && item.productId && !item.unavailable) {
            unifiedMap.set(item.productId, { ...item });
          }
        });

        if (Array.isArray(proposalData) && proposalData.length > 0) {
          proposalData.forEach(newItem => {
            if (!newItem || !newItem.productId || newItem.unavailable) return;
            if (unifiedMap.has(newItem.productId)) {
              const existing = unifiedMap.get(newItem.productId);
              const isPiece = isLyoPieceUnit(newItem.unit || existing.unit);
              existing.weightGrams = newItem.weightGrams || existing.weightGrams;
              existing.pricePerKg = newItem.pricePerKg || existing.pricePerKg;
              existing.totalPrice = isPiece
                ? Math.round(existing.pricePerKg * existing.weightGrams)
                : Math.round((existing.pricePerKg / 1000) * existing.weightGrams);
              unifiedMap.set(newItem.productId, existing);
            } else {
              unifiedMap.set(newItem.productId, { ...newItem });
            }
          });
        }

        const finalMergedList = Array.from(unifiedMap.values());
        proposalData = finalMergedList.length > 0 ? finalMergedList : null;

        // Remove typing indicator
        lyoAiChatHistory = lyoAiChatHistory.filter(m => m.id !== typingId);
        """

if target_parse_start != -1 and target_parse_end != -1:
    html = html[:target_parse_start] + new_parse_code + html[target_parse_end:]
    print("✅ Updated sendLyoAiMessage proposal parsing with Unified Card Merging!")
else:
    print("❌ Could not locate proposal parsing bounds in sendLyoAiMessage")

# 3. Update renderLyoProposalCardHtml to display minimum order indicator and clear totals
card_render_start = html.find("function renderLyoProposalCardHtml")
card_render_end = html.find("function toggleLyoAiLang", card_render_start)
if card_render_end == -1:
    card_render_end = html.find("function initLyoAiChat", card_render_start)

new_render_card_code = """function renderLyoProposalCardHtml(msg, msgIdx) {
      if (!msg.proposalData || msg.proposalData.length === 0) return "";
      let cardTotal = 0;
      let itemsHtml = "";

      msg.proposalData.forEach((p, pIdx) => {
        if (p.unavailable) {
          itemsHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: rgba(22, 27, 34, 0.8); border: 1px dashed rgba(239, 68, 68, 0.35); border-radius: 12px; margin-bottom: 8px;">
              <div style="min-width: 0; flex: 1;">
                <div style="font-weight: 800; font-size: 13.5px; color: #fff;">
                  ${currentLang === "ta" ? escapeHtml(p.tamilName || p.englishName) : escapeHtml(p.englishName || p.tamilName)}
                </div>
                <div style="font-size: 11.5px; color: #ef4444; font-weight: 700; margin-top: 2px;">
                  Unavailable ❌
                </div>
              </div>
              <button onclick="discardInlineLyoItem(${msgIdx}, ${pIdx})" style="width: 34px; height: 34px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Remove">
                🗑️
              </button>
            </div>
          `;
          return;
        }

        cardTotal += (p.totalPrice || 0);
        const isPiece = isLyoPieceUnit(p.unit);
        const weightKg = (p.weightGrams / 1000).toFixed(2);
        const qtyText = isPiece
          ? `${p.weightGrams || p.qty || 1} ${p.unit || (currentLang==="ta"?"பாக்கெட்":"packets")}`
          : `${p.weightGrams}g (${weightKg} Kg)`;

        itemsHtml += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(18, 24, 32, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 8px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);">
            <div style="min-width: 0; flex: 1; padding-right: 8px;">
              <div style="font-weight: 800; font-size: 13.5px; color: #ffffff; line-height: 1.2;">
                ${currentLang === "ta" ? escapeHtml(p.tamilName || p.englishName) : escapeHtml(p.englishName || p.tamilName)}
              </div>
              <div style="font-size: 11.5px; margin-top: 3px; font-weight: 700; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="color: #f59e0b;">${qtyText}</span>
                <span style="color: rgba(255,255,255,0.25);">|</span>
                <span style="color: #10b981; font-weight: 800;">₹${p.totalPrice || 0}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 2px 4px; display: flex; align-items: center; gap: 4px;">
                <button onclick="adjustInlineLyoItem(${msgIdx}, ${pIdx}, -1)" style="width: 24px; height: 24px; border-radius: 6px; background: transparent; border: none; color: #fff; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                <span style="font-size: 11.5px; font-weight: 800; color: #fff; min-width: 28px; text-align: center;">${p.weightGrams || p.qty || 1}</span>
                <button onclick="adjustInlineLyoItem(${msgIdx}, ${pIdx}, 1)" style="width: 24px; height: 24px; border-radius: 6px; background: transparent; border: none; color: #fff; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
              </div>
              <button onclick="addSingleLyoProposalItemToCart(${msgIdx}, ${pIdx})" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px;" title="Add to Cart">
                🛒
              </button>
              <button onclick="discardInlineLyoItem(${msgIdx}, ${pIdx})" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px;" title="Remove">
                🗑️
              </button>
            </div>
          </div>
        `;
      });

      const user = typeof getActiveUser === "function" ? getActiveUser() : null;
      let fin = { deliveryFee: 15, zoneName: "Edappadi Mini Ward (Town Core)" };
      if (typeof calculateOrderFinancials === "function") {
        fin = calculateOrderFinancials(cardTotal, user);
      }
      const grandTotal = cardTotal + (fin.deliveryFee || 0);

      const deliveryBannerText = (user && (user.tier || "").toLowerCase() === "gold") || fin.deliveryFee === 0
        ? "🏅 Gold Member: FREE Delivery for you!"
        : `📍 ${currentLang === "ta" ? "டெலிவரி கட்டணம்" : "Delivery charge"}: ₹${fin.deliveryFee || 15} (${fin.zoneName || "Edappadi Mini Ward"})`;

      const minOrderVal = 100;
      const isMinMet = cardTotal >= minOrderVal;
      const minBadgeHtml = isMinMet
        ? `<div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.35); border-radius: 10px; padding: 8px 12px; font-size: 11.5px; font-weight: 700; color: #34d399; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>${currentLang === "ta" ? "✅ குறைந்தபட்ச ஆர்டர் தகுதி பெறப்பட்டது!" : "✅ Minimum order requirement met!"} (₹${cardTotal} / ₹${minOrderVal})</span>
          </div>`
        : `<div style="background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 8px 12px; font-size: 11.5px; font-weight: 700; color: #f59e0b; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>${currentLang === "ta" ? `⚠️ இன்னும் ₹${minOrderVal - cardTotal} சேர்த்தால் ஆர்டர் செய்யலாம்` : `⚠️ Add ₹${minOrderVal - cardTotal} more for minimum order (₹${minOrderVal})`}</span>
          </div>`;

      return `
        <div style="margin-top: 10px; padding: 12px; background: rgba(12, 16, 22, 0.95); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
          <!-- Accumulated Product List -->
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; color: #94a3b8; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>🛒 ${currentLang === "ta" ? "தேர்ந்தெடுக்கப்பட்ட பொருட்கள்" : "Selected Items"} (${msg.proposalData.length})</span>
            <span style="color: #10b981; font-weight: 900; font-size: 12.5px;">₹${cardTotal}</span>
          </div>

          ${itemsHtml}

          <!-- Delivery Charge Banner -->
          <div style="font-size: 11.5px; font-weight: 700; color: #84cc16; margin: 10px 0 6px 0; display: flex; align-items: center; gap: 4px;">
            ${deliveryBannerText}
          </div>

          <!-- Minimum Order Status Badge -->
          ${minBadgeHtml}

          <!-- Main Big Order Now Button -->
          <button onclick="checkoutAllLyoProposalItems(${msgIdx})" style="width: 100%; padding: 13px 16px; border-radius: 14px; background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%); border: none; color: #ffffff; font-size: 13.5px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.3); margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            <span>🛍️ ${currentLang === "ta" ? `உடனே ஆர்டர் செய்ய (₹${cardTotal} + ₹${fin.deliveryFee || 0} டெலிவரி = ₹${grandTotal})` : `Order Now (₹${cardTotal} items + ₹${fin.deliveryFee || 0} del = ₹${grandTotal})`}</span>
          </button>

          <!-- Secondary Action Buttons Row -->
          <div style="display: flex; gap: 10px;">
            <button onclick="addAllLyoProposalItems(${msgIdx})" style="flex: 1; padding: 11px; border-radius: 12px; background: #f59e0b; border: none; color: #000000; font-size: 12.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(245,158,11,0.25); display: flex; align-items: center; justify-content: center; gap: 6px;">
              🛒 ${currentLang === "ta" ? "கூடையில் சேர்" : "Add All"}
            </button>
            <button onclick="discardAllLyoProposalItems(${msgIdx})" style="flex: 1; padding: 11px; border-radius: 12px; background: #ea580c; border: none; color: #ffffff; font-size: 12.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(234,88,12,0.25); display: flex; align-items: center; justify-content: center; gap: 6px;">
              🗑️ ${currentLang === "ta" ? "நீக்குக" : "Discard"}
            </button>
          </div>
        </div>
      `;
    }

    """

if card_render_start != -1 and card_render_end != -1:
    html = html[:card_render_start] + new_render_card_code + html[card_render_end:]
    print("✅ Updated renderLyoProposalCardHtml with minimum order check and accumulated header!")
else:
    print("❌ Could not locate renderLyoProposalCardHtml bounds")

with open("app/src/main/assets/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("🎉 Successfully written all updates to index.html!")
