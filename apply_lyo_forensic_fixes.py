import sys
import re

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update ProductMatchingEngine.matchProduct
new_matching_engine = '''ProductMatchingEngine: {
        matchProduct(query, activeProducts) {
          if (!query || !activeProducts || activeProducts.length === 0) {
            return { bestMatch: null, confidenceScore: 0, candidates: [], needsDisambiguation: false };
          }
          const rawClean = query.toLowerCase().trim();
          const cleanQueryAlpha = rawClean.replace(/[^a-zA-Z0-9\u0b80-\u0bff\s]/g, '').trim();
          if (!cleanQueryAlpha) {
            return { bestMatch: null, confidenceScore: 0, candidates: [], needsDisambiguation: false };
          }

          const queryTokens = new Set(cleanQueryAlpha.split(/\s+/));
          const SPECIFIC_MODIFIERS = {
            'broiler': ['broiler', 'பிராய்லர்'],
            'country': ['country', 'nattu', 'நாட்டு', 'சுவையான'],
            'nattu': ['country', 'nattu', 'நாட்டு'],
            'goat': ['goat', 'aattu', 'ஆட்டு', 'mutton', 'மட்டன்'],
            'mutton': ['mutton', 'goat', 'aattu', 'ஆட்டு', 'மட்டன்'],
            'tender': ['tender', 'சுடச்சுட'],
            'cow': ['cow', 'pasu', 'பசு'],
            'coconut': ['coconut', 'தேங்காய்'],
            'groundnut': ['groundnut', 'கடலை'],
            'sunflower': ['sunflower', 'சூரியகாந்தி'],
            'white': ['white', 'பண்ணை'],
            'brown': ['brown']
          };

          const scoredCandidates = [];

          for (const product of activeProducts) {
            const eng = (product.englishName || "").toLowerCase();
            const tam = (product.tamilName || "").toLowerCase();
            const cat = (product.category || "").toLowerCase();

            const engAlpha = eng.replace(/[^a-zA-Z0-9\s]/g, '');
            const tamAlpha = tam.replace(/[^\u0b80-\u0bff\s]/g, '');
            const prodTokens = new Set([...engAlpha.split(/\s+/), ...tamAlpha.split(/\s+/)]);

            let score = 0;

            // Exact match boosts
            if (engAlpha === cleanQueryAlpha || tamAlpha === cleanQueryAlpha) {
              score += 1000;
            } else if (engAlpha.includes(cleanQueryAlpha) || cleanQueryAlpha.includes(engAlpha)) {
              score += 500;
            }

            // Token overlap
            let overlapCount = 0;
            queryTokens.forEach(t => {
              if (prodTokens.has(t)) overlapCount++;
            });
            score += overlapCount * 150;

            // Specific modifier checks
            for (const [mod, modSynonyms] of Object.entries(SPECIFIC_MODIFIERS)) {
              const queryHasMod = queryTokens.has(mod) || modSynonyms.some(s => cleanQueryAlpha.includes(s));
              if (queryHasMod) {
                const prodHasMod = modSynonyms.some(s => eng.includes(s) || tam.includes(s));
                if (prodHasMod) {
                  score += 300;
                } else {
                  score -= 250;
                }
              }
            }

            if (cat && queryTokens.has(cat)) {
              score += 50;
            }

            if (score > 0) {
              scoredCandidates.push({ product, score });
            }
          }

          scoredCandidates.sort((a, b) => b.score - a.score);

          if (scoredCandidates.length === 0) {
            let bestFallback = null;
            if (typeof findBestProductMatch === 'function') {
              bestFallback = findBestProductMatch(query, activeProducts);
            }
            return {
              bestMatch: bestFallback,
              confidenceScore: bestFallback ? 50 : 0,
              candidates: bestFallback ? [bestFallback] : [],
              needsDisambiguation: false
            };
          }

          const topMatch = scoredCandidates[0];
          const secondMatch = scoredCandidates[1] || null;
          const isLowConfidence = topMatch.score < 80;
          const isCloseContender = secondMatch && (topMatch.score - secondMatch.score <= 30);
          const needsDisambiguation = (isLowConfidence || isCloseContender) && scoredCandidates.length > 1;

          return {
            bestMatch: topMatch.product,
            confidenceScore: topMatch.score,
            candidates: scoredCandidates.slice(0, 4).map(c => c.product),
            needsDisambiguation: needsDisambiguation
          };
        }
      }'''

pos_pme = text.find("ProductMatchingEngine: {")
if pos_pme != -1:
    pos_pme_end = text.find("UnitQuantityConversionEngine: {", pos_pme)
    if pos_pme_end != -1:
        text = text[:pos_pme] + new_matching_engine + ",\n      // 4. " + text[pos_pme_end:]
        print("Updated ProductMatchingEngine successfully!")
    else:
        print("Error: UnitQuantityConversionEngine marker not found!")
else:
    print("Error: ProductMatchingEngine marker not found!")

# 2. Update convertAiItemToManualCartItem and convertManualCartItemToAiItem
new_converters = '''    function convertAiItemToManualCartItem(it) {
      const products = (typeof getData === 'function') ? getData('ek_products', []) : [];
      const prod = products.find(p => p.id === (it.productId || it.id));
      if (!prod) {
        console.warn("[Lyo AI Sync] Product document not found in ek_products for ID:", it.productId || it.id);
      }
      const unitPrice = Number(prod ? (prod.pricePerKg || prod.price || prod.sellingPrice || 0) : (it.price || 0));
      const unitStr = prod ? (prod.sellingUnit || prod.unit || 'kg') : (it.unit || 'kg');
      const isWeight = isUnitWeight ? isUnitWeight(unitStr) : !(unitStr === 'piece' || unitStr === 'packet' || unitStr === 'unit' || unitStr === 'box' || unitStr === 'bunch');
      
      let weightGrams = it.rawQty || it.weightGrams || 1;
      if (isWeight) {
        weightGrams = (weightGrams <= 50) ? Math.round(weightGrams * 1000) : Math.round(weightGrams);
      } else {
        weightGrams = Math.round(weightGrams);
      }
      
      const totalPrice = isWeight
        ? Math.round((unitPrice / 1000) * weightGrams)
        : Math.round(unitPrice * weightGrams);

      const resolvedImg = prod ? (prod.imageUrl || '') : (it.img || it.imageUrl || '');
      
      return {
        productId: prod ? prod.id : (it.productId || it.id),
        tamilName: prod ? (prod.tamilName || prod.englishName) : (it.tamilName || it.name || 'பொருள்'),
        englishName: prod ? (prod.englishName || prod.tamilName) : (it.name || 'Item'),
        weightGrams: weightGrams,
        unit: unitStr,
        sellingUnit: unitStr,
        cutStyle: it.cutStyle || 'Standard Fresh Cut',
        category: prod ? (prod.category || 'meat') : (it.category || 'meat'),
        specialNote: '',
        pricePerKg: unitPrice,
        imageUrl: resolvedImg,
        totalPrice: Number(totalPrice) || 0
      };
    }

    function convertManualCartItemToAiItem(cItem, idx) {
      const products = (typeof getData === 'function') ? getData('ek_products', []) : [];
      const prod = products.find(p => p.id === cItem.productId) || {
        id: cItem.productId,
        englishName: cItem.englishName,
        tamilName: cItem.tamilName,
        pricePerKg: cItem.pricePerKg,
        unit: cItem.unit || 'kg',
        sellingUnit: cItem.sellingUnit || cItem.unit || 'kg',
        imageUrl: cItem.imageUrl
      };
      
      const unitStr = prod.sellingUnit || prod.unit || cItem.sellingUnit || cItem.unit || 'kg';
      const isWeight = isUnitWeight ? isUnitWeight(unitStr) : true;
      let rawQty = cItem.weightGrams;
      if (isWeight) {
        rawQty = cItem.weightGrams / 1000;
      }
      const calcInput = {
        rawQtyVal: rawQty,
        amountType: isWeight ? 'WEIGHT_KG' : 'COUNT_PCS',
        unit: unitStr
      };
      const details = calculateLyoItemDetails(prod, calcInput);
      return {
        id: 'it_sync_' + (prod.id || idx) + '_' + idx,
        productId: prod.id,
        name: prod.englishName || cItem.englishName || 'Item',
        tamilName: prod.tamilName || cItem.tamilName || 'பொருள்',
        displayQty: details.displayQty,
        selectorQty: details.selectorQty,
        rawQty: details.rawQty,
        unit: unitStr,
        price: Number(prod.pricePerKg || cItem.pricePerKg || 0),
        itemTotal: Number(cItem.totalPrice || details.itemTotal || 0),
        img: prod.imageUrl || cItem.imageUrl
      };
    }'''

pos_conv = text.find("function convertAiItemToManualCartItem")
if pos_conv != -1:
    pos_conv_end = text.find("function syncLyoToManualCart()", pos_conv)
    if pos_conv_end != -1:
        text = text[:pos_conv] + new_converters + "\n\n    " + text[pos_conv_end:]
        print("Updated convertAiItemToManualCartItem and convertManualCartItemToAiItem successfully!")

# 3. Clean up initLyoAiChat when cart is empty
pos_init = text.find("function initLyoAiChat()")
if pos_init != -1:
    pos_init_end = text.find("function renderLyoAiChat()", pos_init)
    if pos_init_end != -1:
        clean_init = '''function initLyoAiChat() {
      const msgContainer = document.getElementById('lyo-ai-messages');
      if (!msgContainer) return;
      if (_lyoChatMessages.length === 0) {
        let existingCart = (typeof getData === 'function') ? getData('ek_cart', []) : (typeof cart !== 'undefined' ? cart : []);
        if (existingCart && existingCart.length > 0) {
          cart = existingCart;
          syncManualToLyoCart();
        } else {
          _lyoChatMessages = [
            {
              id: 'msg_welcome_' + Date.now(),
              role: 'assistant',
              text: currentLang === 'ta'
                ? 'வணக்கம்! எடப்பாடி கடை AI வர்த்தக உதவியாளருக்கு நல்வரவு. 🛒✨ உங்கள் வணிகப் பட்டியலைத் தட்டச்சு செய்யவும் (எ.கா. "500g Mutton, 1kg Chicken, 20 Tomato, 1L Milk, 30 Eggs").'
                : 'Welcome to Edappadi Kadai AI Commerce Assistant! 🛒✨ Type your shopping list (e.g. "500g Mutton, 1kg Chicken, ₹20 Tomato, 1L Milk, 30 Eggs").',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
      }
      renderLyoAiChat();
      updateLyoDraftCartBar();
    }'''
        text = text[:pos_init] + clean_init + "\n\n    " + text[pos_init_end:]
        print("Updated initLyoAiChat successfully!")

# 4. Update renderLyoAiChat to always render images using getProductThumbnailUrl and getImageUrlWithCacheBuster from live ek_products document
pos_render_lyo = text.find("function renderLyoAiChat()")
if pos_render_lyo != -1:
    target_img_code = '''<img src="${it.img || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop'}" alt="${escapeHtml(it.name)}" style="width: 46px; height: 46px; border-radius: 10px; object-fit: cover; background: #222d3a; flex-shrink: 0;" />'''
    replacement_img_code = '''<%
              const allProds = (typeof getData === 'function') ? getData('ek_products', []) : [];
              const liveP = allProds.find(p => p.id === it.productId);
              const displayImg = getImageUrlWithCacheBuster(getProductThumbnailUrl(liveP || it.img || it), liveP ? liveP.updatedAt : null);
            %><img src="${displayImg}" alt="${escapeHtml(liveP ? liveP.englishName : it.name)}" style="width: 46px; height: 46px; border-radius: 10px; object-fit: cover; background: #222d3a; flex-shrink: 0;" />'''
    
    # Wait, renderLyoAiChat uses standard template literal strings in JS, not ASP/EJS. Let us format as JS code inside renderLyoAiChat loop!
    
# Let us inspect renderLyoAiChat items.forEach loop
pos_item_loop = text.find("items.forEach(it => {", pos_render_lyo)
if pos_item_loop != -1:
    pos_item_loop_end = text.find("itemsHtml +=", pos_item_loop)
    if pos_item_loop_end != -1:
        new_loop_header = '''items.forEach(it => {
            const allProds = (typeof getData === 'function') ? getData('ek_products', []) : [];
            const liveP = allProds.find(p => p.id === (it.productId || it.id));
            const displayName = liveP
              ? (liveP.tamilName ? `${liveP.tamilName} (${liveP.englishName})` : liveP.englishName)
              : (it.tamilName ? `${it.tamilName} (${it.name})` : it.name);
            const displayQtyStr = it.displayQty || it.selectorQty || '1 Unit';
            const displayImg = getImageUrlWithCacheBuster(getProductThumbnailUrl(liveP || it.img || it), liveP ? liveP.updatedAt : null);
            const displayPrice = Number(it.itemTotal || it.price || 0);'''
            
        pos_img_tag = text.find("<img src=\"${it.img ||", pos_item_loop_end)
        if pos_img_tag != -1:
            pos_img_tag_end = text.find("/>", pos_img_tag)
            if pos_img_tag_end != -1:
                old_img_snippet = text[pos_img_tag:pos_img_tag_end+2]
                new_img_snippet = '''<img src="${displayImg}" alt="${escapeHtml(displayName)}" style="width: 46px; height: 46px; border-radius: 10px; object-fit: cover; background: #222d3a; flex-shrink: 0;" />'''
                
                # Replace the snippet
                text = text[:pos_img_tag] + new_img_snippet + text[pos_img_tag_end+2:]
                text = text[:pos_item_loop] + new_loop_header + text[pos_item_loop_end:]
                print("Updated renderLyoAiChat item loop and image source to live product document!")

with open("app/src/main/assets/index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Finished applying Lyo AI forensic fixes!")
