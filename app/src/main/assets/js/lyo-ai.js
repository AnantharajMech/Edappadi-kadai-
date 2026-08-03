
    function toggleGmailPassVisibility() {
      const elPass = document.getElementById('setting-gmail-pass');
      const btn = document.getElementById('btn-toggle-gmail-pass-vis');
      if (!elPass) return;
      if (elPass.type === 'password') {
        elPass.type = 'text';
        if (btn) btn.innerText = '🙈';
      } else {
        elPass.type = 'password';
        if (btn) btn.innerText = '👁️';
      }
    }

    async function loadAdminEmailOtpConfig() {
      const elUser = document.getElementById('setting-gmail-user');
      const elPass = document.getElementById('setting-gmail-pass');
      const elBadge = document.getElementById('email-otp-status-badge');

      let gmailUser = '';
      let gmailPass = '';

      if (typeof db !== 'undefined' && db) {
        try {
          const doc = await db.collection('ek_settings').doc('emailConfig').get();
          if (doc.exists) {
            const data = doc.data();
            if (data) {
              gmailUser = data.gmailUser || '';
              gmailPass = data.gmailPass || '';
            }
          }
        } catch (e) {
          console.warn('[Email OTP Settings] Could not fetch emailConfig from Firestore:', e);
        }
      }

      if (elUser) elUser.value = gmailUser;
      if (elPass) elPass.value = gmailPass;

      if (elBadge) {
        if (gmailUser && gmailPass) {
          elBadge.innerText = 'Active (Configured)';
          elBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          elBadge.style.color = '#10b981';
          elBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        } else {
          elBadge.innerText = 'Not Configured';
          elBadge.style.background = 'rgba(148, 163, 184, 0.2)';
          elBadge.style.color = '#94a3b8';
          elBadge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
        }
      }
    }

    async function saveAdminEmailOtpConfig() {
      const elUser = document.getElementById('setting-gmail-user');
      const elPass = document.getElementById('setting-gmail-pass');

      const gmailUser = elUser ? elUser.value.trim() : '';
      const gmailPass = elPass ? elPass.value.trim() : '';

      if (!gmailUser || !gmailPass) {
        showToast("Please enter both Gmail Address and Gmail App Password.", "warning");
        return;
      }

      if (typeof db !== 'undefined' && db) {
        try {
          await db.collection('ek_settings').doc('emailConfig').set({
            gmailUser: gmailUser,
            gmailPass: gmailPass,
            updatedAt: new Date().toISOString()
          });
          showToast("✅ Email OTP credentials saved successfully to ek_settings/emailConfig!", "success");
          loadAdminEmailOtpConfig();
        } catch (err) {
          console.error("Firestore emailConfig write failed:", err);
          showToast("Error saving Email OTP settings: " + err.message, "error");
        }
      } else {
        showToast("Database connection not ready.", "error");
      }
    }

    async function testAdminAiKey() {
      const elKey = document.getElementById('setting-ai-api-key');
      const elModel = document.getElementById('setting-ai-model');

      const apiKey = elKey ? elKey.value.trim() : '';
      const model = elModel ? elModel.value.trim() : '';

      let provider = 'gemini';
      if (apiKey) {
        provider = detectAiProvider(apiKey);
        if (!provider) {
          showToast("Key format not recognized. Please check you copied the correct key.", "error");
          return;
        }
      }

      showToast(`Testing ${provider.toUpperCase()} key connection... ⏳`, "info");

      try {
        const tempConfig = { provider: apiKey ? provider : 'gemini', apiKey, model };
        const res = await testAIProviderConfig(tempConfig);
        if (res && res.text) {
          showToast(`✅ ${provider.toUpperCase()} Key Test Succeeded! Response: "${res.text.substring(0, 30)}..."`, "success");
        } else {
          showToast(`❌ Test failed: Empty response from ${provider}`, "error");
        }
      } catch (err) {
        console.error("AI Key Test Error:", err);
        showToast(`❌ Test Failed: ${err.message || err}`, "error");
      }
    }

    async function testAIProviderConfig(tempConfig) {
      return await callAIProvider(
        "You are a test assistant. Respond in 1 short word.",
        [{ role: 'user', parts: [{ text: 'Hello' }] }],
        'Hello',
        tempConfig
      );
    }

    async function callAIProvider(systemInstructions, conversationContents, queryText, customConfig = null) {
      let config = customConfig || getAiProviderConfig();
      let provider = config.provider || 'gemini';
      let apiKey = (config.apiKey || '').trim();
      let model = (config.model || '').trim();

      // Attempt primary call with selected provider
      if (apiKey) {
        try {
          return await executeSingleAiCall(provider, apiKey, model, systemInstructions, conversationContents);
        } catch (primaryErr) {
          console.warn(`[AI Orchestrator] Primary provider (${provider}) failed: ${primaryErr.message}. Attempting fallback to Built-in Gemini...`);
        }
      }

      // Fallback: Built-in Gemini Key
      const builtinKey = getBuiltinGeminiApiKey();
      if (builtinKey && builtinKey !== apiKey) {
        try {
          return await executeSingleAiCall('gemini', builtinKey, '', systemInstructions, conversationContents);
        } catch (fallbackErr) {
          console.warn(`[AI Orchestrator] Builtin Gemini fallback failed: ${fallbackErr.message}`);
        }
      }

      throw new Error("AI_ORCHESTRATOR_ALL_PROVIDERS_FAILED");
    }

    async function executeSingleAiCall(provider, cleanKey, cleanModel, systemInstructions, conversationContents) {
      if (provider === 'groq') {
        const targetModel = cleanModel || 'llama-3.3-70b-versatile';
        const messages = [
          { role: 'system', content: systemInstructions },
          ...conversationContents.map(c => ({
            role: c.role === 'model' ? 'assistant' : 'user',
            content: (c.parts && c.parts[0] ? c.parts[0].text : '')
          }))
        ];
        const res = await fetchWithTimeoutAndRetry('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({ model: targetModel, messages: messages })
        }, 1, 7000);
        if (!res.ok) throw new Error(`Groq status ${res.status}`);
        const data = await res.json();
        const replyText = data?.choices?.[0]?.message?.content;
        if (!replyText) throw new Error("Empty Groq response");
        return { text: replyText };

      } else if (provider === 'openrouter') {
        const targetModel = cleanModel || 'google/gemini-2.5-flash';
        const messages = [
          { role: 'system', content: systemInstructions },
          ...conversationContents.map(c => ({
            role: c.role === 'model' ? 'assistant' : 'user',
            content: (c.parts && c.parts[0] ? c.parts[0].text : '')
          }))
        ];
        const res = await fetchWithTimeoutAndRetry('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`,
            'HTTP-Referer': 'https://edappadikadai.com'
          },
          body: JSON.stringify({ model: targetModel, messages: messages })
        }, 1, 7000);
        if (!res.ok) throw new Error(`OpenRouter status ${res.status}`);
        const data = await res.json();
        const replyText = data?.choices?.[0]?.message?.content;
        if (!replyText) throw new Error("Empty OpenRouter response");
        return { text: replyText };

      } else if (provider === 'openai' || provider === 'deepseek') {
        const targetModel = cleanModel || (provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini');
        const endpoint = provider === 'deepseek' ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const messages = [
          { role: 'system', content: systemInstructions },
          ...conversationContents.map(c => ({
            role: c.role === 'model' ? 'assistant' : 'user',
            content: (c.parts && c.parts[0] ? c.parts[0].text : '')
          }))
        ];
        const res = await fetchWithTimeoutAndRetry(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanKey}`
          },
          body: JSON.stringify({ model: targetModel, messages: messages })
        }, 1, 7000);
        if (!res.ok) throw new Error(`${provider} status ${res.status}`);
        const data = await res.json();
        const replyText = data?.choices?.[0]?.message?.content;
        if (!replyText) throw new Error(`Empty ${provider} response`);
        return { text: replyText };

      } else if (provider === 'anthropic') {
        const targetModel = cleanModel || 'claude-3-5-haiku-latest';
        const messages = conversationContents.map(c => ({
          role: c.role === 'model' ? 'assistant' : 'user',
          content: (c.parts && c.parts[0] ? c.parts[0].text : '')
        }));
        const res = await fetchWithTimeoutAndRetry('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': cleanKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: targetModel,
            max_tokens: 1024,
            system: systemInstructions,
            messages: messages
          })
        }, 1, 7000);
        if (!res.ok) throw new Error(`Anthropic status ${res.status}`);
        const data = await res.json();
        const replyText = data?.content?.[0]?.text;
        if (!replyText) throw new Error("Empty Anthropic response");
        return { text: replyText };

      } else {
        // Default: Gemini
        const geminiModels = [cleanModel || 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
        let lastError = "";

        for (const m of geminiModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`;
            const res = await fetchWithTimeoutAndRetry(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstructions }] },
                contents: conversationContents
              })
            }, 1, 7000);

            if (res.ok) {
              const data = await res.json();
              const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (replyText) return { text: replyText };
            } else {
              lastError = `Gemini status ${res.status}`;
            }
          } catch (mErr) {
            lastError = mErr.message;
          }
        }
        throw new Error(`Gemini call failed: ${lastError}`);
      }
    }

    const _aiOrderParseCache = new Map();

    async function fetchWithTimeoutAndRetry(url, options = {}, retries = 2, timeoutMs = 8000) {
      let lastErr = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
          const fetchOptions = controller ? { ...options, signal: controller.signal } : options;
          const res = await fetch(url, fetchOptions);
          if (timer) clearTimeout(timer);
          if (res.ok) return res;
          if ((res.status >= 500 || res.status === 429) && attempt < retries) {
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            continue;
          }
          return res;
        } catch (err) {
          if (timer) clearTimeout(timer);
          lastErr = err;
          if (attempt >= retries) throw err;
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
      }
      throw lastErr || new Error("FETCH_FAILED_AFTER_RETRIES");
    }

    
    // ==========================================
    // LYO AI SHOPPING UI MODULE (PRODUCTION GRADE AI COMMERCE ENGINE)
    // ====================================================================

    let _lyoChatMessages = [];
    let _lyoDraftCart = [];
    if (typeof _aiOrderParseCache === 'undefined') {
      window._aiOrderParseCache = new Map();
    }

    // 1. Synonym Dictionary & Language Mappings (Tamil, English, Tanglish, Misspellings)
    const LYO_SYNONYMS = {
      'head_curry': ['head curry', 'goat head', 'thalaikkari', 'ஆட்டுத்தலை', 'தலைக்கறி', 'ஆட்டு தலைக்கறி', 'தலை கறி', 'thalaikari', 'goat head curry', 'head meat', 'ஆட்டுத் தலைக்கறி', 'ஆட்டுத்தலை கறி', 'ஆட்டுத்தலைக்கறி'],
      'potato': ['potato', 'potatoes', 'உருளைக்கிழங்கு', 'உருளை கிழங்கு', 'உருளை', 'urulaikilangu', 'urulai', 'potatos'],
      'mutton': ['mutton', 'ஆட்டுக்கறி', 'மட்டன்', 'muttan', 'goat', 'goat mutton', 'lamb', 'ஆட்டு'],
      'chicken': ['chicken', 'சிக்கன்', 'கோழி', 'koli', 'broiler', 'nattu koli', 'country chicken', 'chiken', 'chickn', 'கோழிக்கறி'],
      'egg': ['egg', 'eggs', 'முட்டை', 'muttai', 'egg packet', 'muttai tray'],
      'milk': ['milk', 'பால்', 'paal', 'milk packet', 'pal', 'paal packet'],
      'onion': ['onion', 'onions', 'வெங்காயம்', 'vengayam', 'chinnavengayam', 'periyavengayam', 'vengaiyam', 'சின்ன வெங்காயம்', 'பெரிய வெங்காயம்'],
      'chilli': ['chilli', 'chili', 'மிளகாய்', 'milagai', 'green chilli', 'red chilli', 'பச்சை மிளகாய்'],
      'coriander': ['coriander', 'கொத்தமல்லி', 'kothamalli', 'malli', 'koththamalli', 'coriander leaves'],
      'oil': ['oil', 'எண்ணெய்', 'ennai', 'sunflower oil', 'gingelly oil', 'groundnut oil', 'coconut oil', 'தேங்காய் எண்ணெய்'],
      'curd': ['curd', 'தயிர்', 'thayir', 'curd packet'],
      'fish': ['fish', 'மீன்', 'meen', 'vanjaram', 'nethili', 'katla', 'rohu'],
      'lemon': ['lemon', 'lemons', 'எலுமிச்சை', 'elumichai'],
      'garlic': ['garlic', 'பூண்டு', 'poondhu', 'poondu'],
      'ginger': ['ginger', 'இஞ்சி', 'inji'],
      'sugar': ['sugar', 'சர்க்கரை', 'sarkarai', 'sakkarai'],
      'salt': ['salt', 'உப்பு', 'uppu'],
      'rice': ['rice', 'அரிசி', 'arisi', 'ponni rice'],
      'dal': ['dal', 'பருப்பு', 'paruppu', 'toor dal', 'urad dal']
    };

    function syncAiKnowledgeBase(customProducts = null) {
      try {
        const products = customProducts || (typeof getProductsList === 'function' ? getProductsList() : (typeof getData === 'function' ? getData('ek_products', []) : []));
        const categories = typeof getCategoriesList === 'function' ? getCategoriesList() : (typeof getData === 'function' ? getData('ek_categories', []) : []);

        const productDict = {};
        const categoryDict = {};
        const unitDict = {
          weight: ['kg', 'kilo', 'kilos', 'கிலோ', 'g', 'gm', 'gram', 'grams', 'கிராம்', '250g', '500g', '750g', '1.5kg'],
          volume: ['l', 'litre', 'litres', 'liter', 'liters', 'லிட்டர்', 'ltr', 'ml', 'milli', 'millilitre', 'மில்லி'],
          count: ['pcs', 'piece', 'pieces', 'பீஸ்', 'பீசு', 'பீஸ்கள்', 'nos', 'no', 'packet', 'packets', 'pkt', 'doz', 'dozen', 'டஜன்', 'bundle', 'box', 'bottle']
        };

        (products || []).forEach(p => {
          if (!p) return;
          const pId = p.id || p.productId;
          if (!pId) return;
          const en = (p.englishName || '').trim();
          const ta = (p.tamilName || '').trim();
          productDict[pId] = {
            id: pId,
            englishName: en,
            tamilName: ta,
            category: p.category || 'General',
            sellingPrice: Number(p.sellingPrice || p.price || 0),
            unit: p.sellingUnit || p.unit || 'kg',
            isAvailable: p.isAvailable !== false,
            discount: p.discount || 0,
            offerText: p.offerText || ''
          };

          const catName = p.category || 'General';
          if (!categoryDict[catName]) categoryDict[catName] = [];
          categoryDict[catName].push(pId);
        });

        const knowledgeBase = {
          PRODUCT_DICTIONARY: productDict,
          CATEGORY_DICTIONARY: categoryDict,
          UNIT_DICTIONARY: unitDict,
          SYNONYMS: LYO_SYNONYMS,
          TOTAL_PRODUCTS: Object.keys(productDict).length,
          TOTAL_CATEGORIES: Object.keys(categoryDict).length,
          LAST_SYNC_TIME: new Date().toISOString()
        };

        window.LYO_OFFLINE_KNOWLEDGE = knowledgeBase;
        if (typeof saveData === 'function') {
          saveData('ek_ai_offline_knowledge', knowledgeBase);
        }
        return knowledgeBase;
      } catch (err) {
        console.warn('[AI Knowledge Base Sync] Error:', err);
        return null;
      }
    }
    window.syncAiKnowledgeBase = syncAiKnowledgeBase;

    // 2. Levenshtein Distance for Misspellings
    function getLevenshteinDistance(a, b) {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    // 3. String Similarity Calculator (0.0 to 1.0)
    function calculateSimilarityScore(str1, str2) {
      if (!str1 || !str2) return 0;
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      if (s1 === s2) return 1.0;
      if (s1.includes(s2) || s2.includes(s1)) return 0.90;
      const maxLen = Math.max(s1.length, s2.length);
      if (maxLen === 0) return 1.0;
      const dist = getLevenshteinDistance(s1, s2);
      return Math.max(0, 1.0 - (dist / maxLen));
    }

    function normalizeLyoText(s) {
      if (!s) return '';
      return s.toLowerCase().replace(/[\u0BCD\u0BD7]/g, '').replace(/[^\w\u0B80-\u0BFF]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // 4. Product Matching Engine with Confidence Scoring (>95%, 70-95%, <70%)
    function matchProductWithConfidence(rawQuery, activeProducts) {
      if (!activeProducts || activeProducts.length === 0) {
        return { product: null, score: 0, candidates: [] };
      }
      const q = (rawQuery || '').toLowerCase().trim();
      const qNorm = normalizeLyoText(q);

      let bestProd = null;
      let maxScore = 0;
      const scoredCandidates = [];

      activeProducts.forEach(p => {
        const nameEn = (p.englishName || '').toLowerCase();
        const nameTa = (p.tamilName || '').toLowerCase();
        const nameEnNorm = normalizeLyoText(nameEn);
        const nameTaNorm = normalizeLyoText(nameTa);

        let currentScore = 0;

        // Exact or normalized match
        if (q === nameEn || q === nameTa || qNorm === nameEnNorm || qNorm === nameTaNorm) {
          currentScore = 1.0;
        } else {
          const qTokens = qNorm.split(' ').filter(w => w.length > 0);
          const pTokens = (nameEnNorm + ' ' + nameTaNorm).split(' ').filter(w => w.length > 0);

          // Check if any query token is an exact match to a product token
          const exactTokenMatch = qTokens.some(qt => pTokens.includes(qt));
          const wholeWordInQuery = pTokens.some(pt => pt.length > 2 && new RegExp('\\b' + pt + '\\b', 'i').test(q));
          const wholeWordInProduct = qTokens.some(qt => qt.length > 2 && new RegExp('\\b' + qt + '\\b', 'i').test(nameEn + ' ' + nameTa));

          if (exactTokenMatch || wholeWordInQuery || wholeWordInProduct) {
            currentScore = 0.95;
          } else {
            // Token overlap (exact token equality or prefix match for words >= 4 chars)
            const matchedTokens = qTokens.filter(t => pTokens.some(pt => pt === t || (t.length >= 4 && pt.startsWith(t))));
            if (qTokens.length > 0 && matchedTokens.length > 0) {
              currentScore = Math.max(currentScore, 0.70 + (matchedTokens.length / qTokens.length) * 0.25);
            }
          }
        }

          // Synonym match with strict word boundary safety
          let synonymMatched = false;
          for (const key in LYO_SYNONYMS) {
            const list = LYO_SYNONYMS[key];
            const qHasSyn = list.some(syn => {
              const sn = normalizeLyoText(syn);
              return sn && new RegExp('\\b' + sn + '\\b', 'i').test(qNorm);
            });
            const pHasSyn = list.some(syn => {
              const sn = normalizeLyoText(syn);
              return sn && new RegExp('\\b' + sn + '\\b', 'i').test(nameEnNorm + ' ' + nameTaNorm);
            });
            if (qHasSyn && pHasSyn) {
              currentScore = Math.max(currentScore, 0.98);
              synonymMatched = true;
              break;
            }
          }

          if (!synonymMatched) {
            const simEn = calculateSimilarityScore(q, nameEn);
            const simTa = calculateSimilarityScore(q, nameTa);
            currentScore = Math.max(currentScore, Math.max(simEn, simTa));
          }

        scoredCandidates.push({ product: p, score: currentScore });
        if (currentScore > maxScore) {
          maxScore = currentScore;
          bestProd = p;
        }
      });

      scoredCandidates.sort((a, b) => b.score - a.score);
      const topCandidates = scoredCandidates.slice(0, 3).filter(c => c.score > 0.25);

      return {
        product: bestProd || activeProducts[0],
        score: maxScore,
        candidates: topCandidates
      };
    }

    // 5. Smart Multi-lingual Query Parser
    function parseSingleItemText(itemText) {
      let t = (itemText || '').toLowerCase().trim();
      if (!t) return null;

      // Tamil number words to digits
      const numMap = [
        [/இருபது|irupathu/gi, '20'],
        [/ஐம்பது|aimpathu/gi, '50'],
        [/நூறு|nooru/gi, '100'],
        [/இருநூறு/gi, '200'],
        [/ஐந்நூறு/gi, '500'],
        [/ஆயிரம்/gi, '1000'],
        [/பத்து|pathu/gi, '10'],
        [/இரண்டு|ரெண்டு|ரண்டு|rendu|randu/gi, '2'],
        [/ஒன்று|ஒன்னு|onru|onnu/gi, '1'],
        [/மூன்று|மூனு|moonru|moonu/gi, '3'],
        [/நான்கு|நாலு|naangu|naalu/gi, '4'],
        [/ஐந்து|அஞ்சு|ainthu|anju/gi, '5'],
        [/ஆறு|aaru/gi, '6'],
        [/ஏழு|aelu/gi, '7'],
        [/எட்டு|ettu/gi, '8'],
        [/ஒன்பது|onbathu/gi, '9']
      ];
      numMap.forEach(([rgx, val]) => {
        t = t.replace(rgx, ' ' + val + ' ');
      });
      t = t.replace(/\s+/g, ' ').trim();

      let amountType = 'WEIGHT_KG';
      let rawQtyVal = 1;
      let unit = 'kg';

      // Rupee Pattern: 20 ரூபாய்க்கு, 20 ரூபாய், ₹20, 20 rs, 20 rupees
      const rupeeRegex = /(?:₹|rs\.?|rupees?|ரூபாய்க்கு|ரூபாய்|ரூபா|ரூ\.?)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|rupees?|ரூபாய்க்கு|ரூபாய்|ரூபா|ரூ\.?)/i;
      const rupeeMatch = t.match(rupeeRegex);

      if (rupeeMatch) {
        amountType = 'RUPEES';
        rawQtyVal = parseFloat(rupeeMatch[1] || rupeeMatch[2] || '0');
        t = t.replace(rupeeMatch[0], '').trim();
        t = t.replace(/^க்கு\s*/i, '').trim();
      } else {
        // Fractions
        if (/(அரை|arai|half|1\/2)/i.test(t)) {
          amountType = 'WEIGHT_GRAMS';
          rawQtyVal = 500;
          unit = 'g';
          t = t.replace(/(அரை|arai|half|1\/2)\s*(kilo|kg|கிலோ)?/gi, '').trim();
        } else if (/(கால்|kal|quarter|1\/4)/i.test(t)) {
          amountType = 'WEIGHT_GRAMS';
          rawQtyVal = 250;
          unit = 'g';
          t = t.replace(/(கால்|kal|quarter|1\/4)\s*(kilo|kg|கிலோ)?/gi, '').trim();
        } else if (/(முக்கால்|mukkai|mukkhal|3\/4)/i.test(t)) {
          amountType = 'WEIGHT_GRAMS';
          rawQtyVal = 750;
          unit = 'g';
          t = t.replace(/(முக்கால்|mukkai|mukkhal|3\/4)\s*(kilo|kg|கிலோ)?/gi, '').trim();
        } else if (/(ஒன்றரை|1\.5|1\s*and\s*half|1\s*1\/2)/i.test(t)) {
          amountType = 'WEIGHT_KG';
          rawQtyVal = 1.5;
          unit = 'kg';
          t = t.replace(/(ஒன்றரை|1\.5|1\s*and\s*half|1\s*1\/2)\s*(kilo|kg|கிலோ)?/gi, '').trim();
        } else {
          // Piece / Count / Unit pattern
          const pcsMatch = t.match(/(\d+(?:\.\d+)?)\s*(pcs|piece|pieces|பீஸ்|பீசு|பீஸ்கள்|nos|no|பாக்கெட்|pkt|packet|packets)/i) ||
                           t.match(/(pcs|piece|pieces|பீஸ்|பீசு|பீஸ்கள்|nos|no|பாக்கெட்|pkt|packet|packets)\s*(\d+(?:\.\d+)?)/i);
          if (pcsMatch) {
            rawQtyVal = parseFloat(pcsMatch[1] || pcsMatch[2] || '1');
            amountType = 'COUNT_PIECES';
            unit = 'pcs';
            t = t.replace(pcsMatch[0], '').trim();
          } else {
            // Standard Numbers & Units
            const qtyMatch = t.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z஀-௿]+)?/i) || t.match(/([a-zA-Z஀-௿]+)?\s*(\d+(?:\.\d+)?)/i);
            if (qtyMatch) {
              const num = parseFloat(qtyMatch[1] && !isNaN(qtyMatch[1]) ? qtyMatch[1] : (qtyMatch[2] || '1'));
              const uStr = (qtyMatch[2] && isNaN(qtyMatch[2]) ? qtyMatch[2] : (qtyMatch[1] && isNaN(qtyMatch[1]) ? qtyMatch[1] : '')).toLowerCase().trim();

              const isG = ['g', 'gm', 'gram', 'grams', 'கிராம்'].includes(uStr);
              const isKg = ['kg', 'kilo', 'kilos', 'கிலோ', 'k'].includes(uStr);
              const isL = ['l', 'litre', 'litres', 'liter', 'liters', 'லிட்டர்', 'ltr', 'ltrs'].includes(uStr);
              const isMl = ['ml', 'milli', 'millilitre', 'millilitres', 'மில்லி'].includes(uStr);
              const isDoz = ['doz', 'dozen', 'dozens', 'டஜன்'].includes(uStr);
              const isPkt = ['pkt', 'pkts', 'packet', 'packets', 'பாக்கெட்'].includes(uStr);
              const isPcs = ['pcs', 'piece', 'pieces', 'பீஸ்', 'பீசு', 'பீஸ்கள்', 'nos', 'no'].includes(uStr);

              if (isG) {
                amountType = 'WEIGHT_GRAMS'; rawQtyVal = num; unit = 'g';
                t = t.replace(qtyMatch[0], '').trim();
              } else if (isKg) {
                amountType = 'WEIGHT_KG'; rawQtyVal = num; unit = 'kg';
                t = t.replace(qtyMatch[0], '').trim();
              } else if (isL) {
                amountType = 'LIQUID_LITRE'; rawQtyVal = num; unit = 'l';
                t = t.replace(qtyMatch[0], '').trim();
              } else if (isMl) {
                amountType = 'LIQUID_ML'; rawQtyVal = num; unit = 'ml';
                t = t.replace(qtyMatch[0], '').trim();
              } else if (isDoz) {
                amountType = 'COUNT_DOZEN'; rawQtyVal = num; unit = 'doz';
                t = t.replace(qtyMatch[0], '').trim();
              } else if (isPkt) {
                amountType = 'COUNT_PACKETS'; rawQtyVal = num; unit = 'pkt';
                t = t.replace(qtyMatch[0], '').trim();
              } else if (isPcs) {
                amountType = 'COUNT_PIECES'; rawQtyVal = num; unit = 'pcs';
                t = t.replace(qtyMatch[0], '').trim();
              } else {
                // uStr is part of the product search term (e.g. 20 Eggs, 30 Tomatoes)
                rawQtyVal = num;
                if (num >= 50) {
                  amountType = 'WEIGHT_GRAMS'; unit = 'g';
                } else {
                  amountType = 'COUNT_PIECES'; unit = 'pcs';
                }
                const numberOnlyRegex = new RegExp('\\b' + num + '\\b', 'i');
                t = t.replace(numberOnlyRegex, '').trim();
              }
            }
          }
        }
      }

      t = t.replace(/[,.:;!?]/g, '').replace(/^க்கு\s*/i, '').replace(/பீஸ்|பீசு|pieces|piece|pcs/gi, '').trim();

      return {
        productSearchTerm: t || itemText,
        rawQtyVal: rawQtyVal,
        amountType: amountType,
        unit: unit
      };
    }

    // 6. Split Multi-line / WhatsApp Shopping Lists
    function parseLyoCommerceQuery(queryText) {
      if (!queryText) return [];
      const rawLines = (queryText || '').replace(/\r/g, '').split('\n');
      const items = [];
      rawLines.forEach(line => {
        const commaParts = line.split(',');
        commaParts.forEach(part => {
          const parsed = parseSingleItemText(part);
          if (parsed && parsed.productSearchTerm) {
            items.push(parsed);
          }
        });
      });
      return items;
    }

    // 7. Amount-to-Quantity & Quantity-to-Amount Calculation Engine
    function calculateLyoItemDetails(product, parsedItem) {
      const p = product;
      const unitPrice = Number(p.pricePerKg || p.sellingPrice || p.price || 40);
      const baseUnit = (p.sellingUnit || p.unit || 'kg').toLowerCase();

      let displayQty = '';
      let selectorQty = '';
      let rawQty = parsedItem.rawQtyVal || 1;
      let itemTotal = unitPrice;

      if (parsedItem.amountType === 'RUPEES') {
        const rupeeAmount = Math.max(1, parsedItem.rawQtyVal);
        if (baseUnit === 'kg' || baseUnit === 'g') {
          const qtyInKg = rupeeAmount / unitPrice;
          if (qtyInKg < 1) {
            rawQty = Math.round(qtyInKg * 1000);
            displayQty = `${rawQty}g (${qtyInKg.toFixed(2)} Kg)`;
            selectorQty = `${rawQty} g`;
          } else {
            rawQty = Number(qtyInKg.toFixed(2));
            displayQty = `${rawQty} Kg`;
            selectorQty = `${rawQty} kg`;
          }
        } else if (baseUnit === 'litre' || baseUnit === 'l' || baseUnit === 'ml') {
          const qtyInL = rupeeAmount / unitPrice;
          if (qtyInL < 1) {
            rawQty = Math.round(qtyInL * 1000);
            displayQty = `${rawQty} ml (${qtyInL.toFixed(2)} L)`;
            selectorQty = `${rawQty} ml`;
          } else {
            rawQty = Number(qtyInL.toFixed(2));
            displayQty = `${rawQty} L`;
            selectorQty = `${rawQty} L`;
          }
        } else {
          const count = Math.max(1, Math.round(rupeeAmount / unitPrice));
          rawQty = count;
          displayQty = `${count} ${baseUnit}`;
          selectorQty = `${count} ${baseUnit}`;
        }
        itemTotal = rupeeAmount;
      } else if (parsedItem.amountType === 'WEIGHT_GRAMS' || parsedItem.unit === 'g') {
        rawQty = parsedItem.rawQtyVal || 500;
        const qtyInKg = rawQty / 1000;
        displayQty = `${rawQty}g (${qtyInKg.toFixed(2)} Kg)`;
        selectorQty = `${rawQty} g`;
        itemTotal = Math.round(qtyInKg * unitPrice);
      } else if (parsedItem.amountType === 'WEIGHT_KG' || parsedItem.unit === 'kg') {
        rawQty = parsedItem.rawQtyVal || 1;
        displayQty = `${rawQty} kg (${Number(rawQty).toFixed(2)} Kg)`;
        selectorQty = `${rawQty} kg`;
        itemTotal = Math.round(rawQty * unitPrice);
      } else if (parsedItem.amountType === 'LIQUID_ML' || parsedItem.unit === 'ml') {
        rawQty = parsedItem.rawQtyVal || 500;
        const qtyInL = rawQty / 1000;
        displayQty = `${rawQty} ml (${qtyInL.toFixed(2)} L)`;
        selectorQty = `${rawQty} ml`;
        itemTotal = Math.round(qtyInL * unitPrice);
      } else if (parsedItem.amountType === 'LIQUID_LITRE' || parsedItem.unit === 'l') {
        rawQty = parsedItem.rawQtyVal || 1;
        displayQty = `${rawQty} Litre`;
        selectorQty = `${rawQty} L`;
        itemTotal = Math.round(rawQty * unitPrice);
      } else if (parsedItem.amountType === 'COUNT_DOZEN' || parsedItem.unit === 'doz') {
        const dozens = parsedItem.rawQtyVal || 1;
        rawQty = dozens * 12;
        displayQty = `${dozens} Dozen (${rawQty} pcs)`;
        selectorQty = `${dozens} doz`;
        itemTotal = Math.round(dozens * (unitPrice * 12 || unitPrice));
      } else {
        rawQty = parsedItem.rawQtyVal || 1;
        if (baseUnit === 'kg' || baseUnit === 'g') {
          const estimatedKg = Number((rawQty * 0.1).toFixed(2));
          displayQty = `${rawQty} pcs (${estimatedKg} Kg)`;
          selectorQty = `${rawQty} pcs`;
          itemTotal = Math.round(estimatedKg * unitPrice);
        } else if (baseUnit === 'l' || baseUnit === 'litre' || baseUnit === 'ml') {
          displayQty = `${rawQty} L`;
          selectorQty = `${rawQty} L`;
          itemTotal = Math.round(rawQty * unitPrice);
        } else {
          const uLabel = parsedItem.unit || baseUnit || 'pcs';
          displayQty = `${rawQty} ${uLabel}`;
          selectorQty = `${rawQty} ${uLabel}`;
          itemTotal = Math.round(rawQty * unitPrice);
        }
      }

      return {
        displayQty,
        selectorQty,
        rawQty,
        itemTotal: Math.max(1, itemTotal)
      };
    }

    async function parseOrderWithAI(queryText, activeProducts) {
      if (!queryText || !queryText.trim()) return [];
      const cacheKey = (queryText || '').toLowerCase().trim();
      if (_aiOrderParseCache.has(cacheKey)) {
        return _aiOrderParseCache.get(cacheKey);
      }
      let { provider, apiKey, model } = getAiProviderConfig();
      if (!apiKey || !apiKey.trim()) {
        apiKey = getBuiltinGeminiApiKey();
        provider = 'gemini';
      }
      const cleanKey = (apiKey || '').trim();
      const cleanModel = (model || '').trim();
      const productCatalogList = (activeProducts || []).map(p => `- ${p.englishName} (${p.tamilName}): price ${p.pricePerKg}/${p.unit||'kg'}`).join('\n');
      const systemPrompt = `You are an ultra-fast, production-grade AI Commerce Order Parser for Edappadi Kadai store.Your sole job is to parse customer shopping lists written in Tamil, English, or Tanglish into structured items matching our product catalog.STRICT CATALOG LIST:${productCatalogList}EXTRACTION RULES:1. Product Name: Match closest product from catalog (English or Tamil).2. Quantities & Units:   - "அரை" / "arai" / "half" / "1/2" -> raw_quantity_val: 0.5, amount_type: "WEIGHT_KG"   - "கால்" / "kal" / "quarter" / "1/4" -> raw_quantity_val: 0.25, amount_type: "WEIGHT_KG"   - "முக்கால்" / "mukkai" / "3/4" -> raw_quantity_val: 0.75, amount_type: "WEIGHT_KG"   - Grams (e.g. "500g", "500gm", "250g") -> raw_quantity_val: 500, amount_type: "WEIGHT_GRAMS"   - Kilograms / Litres (e.g. "1kg", "2 Litre") -> raw_quantity_val: 1, amount_type: "WEIGHT_KG"   - Count (e.g. "30 eggs", "2 packets", "5 pcs") -> raw_quantity_val: 30, amount_type: "COUNT_PIECES"3. Price / Amount-based requests ("₹20 tomato", "20 rs tomato", "100 rupees mutton", "50 ரூபாய் தக்காளி"):   - raw_quantity_val: <rupee_amount_number>   - amount_type: "RUPEES"4. Multiline or WhatsApp lists: Extract EVERY item individually.OUTPUT FORMAT:Return ONLY a JSON array of objects. Do NOT include markdown blocks or commentary.[  {    "product_name": "<matched catalog product name>",    "raw_quantity_val": <number>,    "amount_type": "WEIGHT_KG" | "WEIGHT_GRAMS" | "COUNT_PIECES" | "RUPEES"  }]`;

      let rawText = "";
      try {
        if (cleanKey) {
          const geminiModels = [cleanModel || 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
          let geminiSuccess = false;
          for (const m of geminiModels) {
            try {
              const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`;
              const response = await fetchWithTimeoutAndRetry(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  contents: [{ role: 'user', parts: [{ text: queryText }] }],
                  generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
                })
              }, 1, 6000);
              if (response.ok) {
                const data = await response.json();
                rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (rawText) {
                  geminiSuccess = true;
                  break;
                }
              }
            } catch (mErr) {
              console.warn(`Gemini model ${m} failed, trying next...`, mErr);
            }
          }
        }
        if (rawText) {
          const cleanJsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          let parsed = JSON.parse(cleanJsonStr);
          if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.items)) {
            parsed = parsed.items;
          }
          if (Array.isArray(parsed) && parsed.length > 0) {
            _aiOrderParseCache.set(cacheKey, parsed);
            return parsed;
          }
        }
      } catch (err) {
        console.warn("AI parseOrderWithAI graceful fallback to local NLP engine:", err);
      }

      return parseLyoCommerceQuery(queryText);
    }

    function getLyoAiAvatarHtml(isTyping = false) {
      const pulseCss = isTyping
        ? 'animation: lyoAvatarPulseGlow 2.2s infinite ease-in-out;'
        : 'box-shadow: 0 2px 6px rgba(16,185,129,0.3);';
      return `<div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; border: 1px solid rgba(255,255,255,0.25); ${pulseCss}"><span style="font-size: 13px; user-select: none;">✨</span></div>`;
    }

    
// ====================================================================
// INTENT CLASSIFICATION ENGINE (PRODUCTION-GRADE MULTI-LAYER INTENT FILTER)
// ====================================================================

const LYO_INTENTS = {
  SHOPPING_REQUEST: "SHOPPING_REQUEST",
  PRODUCT_SEARCH: "PRODUCT_SEARCH",
  PRODUCT_RECOMMENDATION: "PRODUCT_RECOMMENDATION",
  ORDER_TRACKING: "ORDER_TRACKING",
  ORDER_STATUS: "ORDER_STATUS",
  CUSTOMER_SUPPORT: "CUSTOMER_SUPPORT",
  APPLICATION_FEATURES: "APPLICATION_FEATURES",
  AI_QUESTIONS: "AI_QUESTIONS",
  GENERAL_QUESTIONS: "GENERAL_QUESTIONS",
  HELP: "HELP",
  GREETINGS: "GREETINGS",
  SETTINGS: "SETTINGS",
  ACCOUNT: "ACCOUNT",
  COUPONS: "COUPONS",
  DELIVERY: "DELIVERY",
  RESTAURANT_INFO: "RESTAURANT_INFO",
  NAVIGATION: "NAVIGATION",
  FEEDBACK: "FEEDBACK"
};

function buildIntentSystemPrompt(productCatalogList = "") {
  return `You are the Intent Classification Engine for Lyo AI Commerce at Edappadi Kadai store.
Your sole job is to analyze user messages written in Tamil, English, or Tanglish and classify them into EXACT INTENTS BEFORE any shopping operations execute.

STRICT INTENT CATEGORIES:
- SHOPPING_REQUEST: User is explicitly ordering items, adding products to cart, or providing a shopping list with quantities/weights/amounts to buy (e.g., "500g Chicken", "2kg Tomatoes", "Add 2 Mutton", "buy eggs", "100 rupees chicken", "1kg arisi", "30 muttai", "தக்காளி 2 கிலோ போடு").
- PRODUCT_SEARCH: Asking if a product is available, inquiring about prices or stock without explicitly adding to cart (e.g., "Do you have fresh fish?", "Is mutton available?", "Do you sell milk?").
- PRODUCT_RECOMMENDATION: Asking for recommendations, top items, suggestions (e.g., "What is good today?", "Suggest meat for biryani", "What are best sellers?").
- ORDER_TRACKING: Asking where their order is, tracking active order, order status (e.g., "Where is my order?", "Order status", "When will my delivery arrive?", "எனது ஆர்டர் எங்கே?").
- ORDER_STATUS: Asking status of order (same as ORDER_TRACKING).
- CUSTOMER_SUPPORT: Asking for support, phone number, help, reporting an issue (e.g., "Customer care number", "I need help", "How to contact support?").
- APPLICATION_FEATURES: Asking about features of this application, how app works (e.g., "What are the features of this application?", "What can this app do?", "How to use this app?").
- AI_QUESTIONS: Asking about Lyo AI, who built it, what AI does (e.g., "What is Lyo AI?", "Tell me about your AI", "Who are you?", "Are you AI?").
- GREETINGS: Hello, hi, good morning, வணக்கம், greetings (e.g., "Good morning", "Hi Lyo", "வணக்கம்").
- SETTINGS: Profile, address, password, account settings (e.g., "How to change address?", "My profile", "Account settings").
- ACCOUNT: Account profile questions (same as SETTINGS).
- COUPONS: Offer codes, discounts, promo codes (e.g., "Any discount coupons?", "Promo codes", "Offer details").
- DELIVERY: Delivery charges, zones, timings, free delivery threshold (e.g., "What is delivery fee?", "Do you deliver to Salem?", "Delivery charges").
- RESTAURANT_INFO: Store location, shop timing, open status, address (e.g., "Is shop open?", "Where is Edappadi Kadai located?", "Store hours").
- NAVIGATION: Asking to go to a screen (e.g., "Open cart", "Take me to tracking", "Show home screen").
- FEEDBACK: App feedback, ratings, complaints.
- GENERAL_QUESTIONS: Any other general question or conversation.

CRITICAL DIRECTIVES:
1. NEVER classify a question ("where is my order", "what is Lyo AI", "what features...", "do you have...") as SHOPPING_REQUEST.
2. ONLY classify as SHOPPING_REQUEST if the user is explicitly placing an order, adding items to cart, or providing item quantities/units to purchase.

JSON OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
{
  "intent": "<ONE_OF_THE_ABOVE_INTENTS>",
  "confidence": 0.98,
  "responseText": "<Friendly conversational answer in Tamil and English answering the query>",
  "action": null | "OPEN_ORDER_TRACKER" | "NAVIGATE_PROFILE" | "SHOW_COUPONS" | "SHOW_CATALOG"
}`;
}

async function classifyLyoUserIntent(queryText, activeProducts) {
  if (!queryText || !queryText.trim()) {
    return { intent: "GREETINGS", confidence: 1.0, responseText: "வணக்கம்! Good day! 🌸 How can I help you today?" };
  }

  try {
    const catalogSummary = (activeProducts || []).slice(0, 15).map(p => `- ${p.englishName} (${p.tamilName || ''})`).join('\n');
    const systemPrompt = buildIntentSystemPrompt(catalogSummary);
    const aiRes = await callAIProvider(
      systemPrompt,
      [{ role: 'user', parts: [{ text: queryText }] }],
      queryText
    );

    if (aiRes && aiRes.text) {
      const cleanJsonStr = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      if (parsed && parsed.intent) {
        const uppercaseIntent = String(parsed.intent).toUpperCase().trim();
        if (LYO_INTENTS[uppercaseIntent]) {
          return {
            intent: uppercaseIntent,
            confidence: parsed.confidence || 0.95,
            responseText: parsed.responseText || '',
            action: parsed.action || null
          };
        }
      }
    }
  } catch (err) {
    console.warn("[Lyo AI Intent] AI classification call failed, falling back to local semantic classifier:", err);
  }

  return classifyUserIntentFallback(queryText, activeProducts);
}

function classifyUserIntentFallback(queryText, activeProducts = []) {
  if (!queryText) return { intent: "GREETINGS", confidence: 0.9 };
  const q = queryText.toLowerCase().trim();

  // 1. Order Tracking / Order Status
  if (
    q.includes("where is my order") || q.includes("track order") || q.includes("order status") ||
    q.includes("my order") || q.includes("where is order") || q.includes("order tracking") ||
    q.includes("ஆர்டர் எங்கே") || q.includes("டிராக்") || q.includes("ஆர்டர் ஸ்டேட்டஸ்") ||
    q.includes("டெலிவரி எப்போது") || q.includes("track my order") || q.includes("when will my order")
  ) {
    return { intent: "ORDER_TRACKING", confidence: 0.98 };
  }

  // 2. Application Features
  if (
    q.includes("feature") || q.includes("features") || q.includes("app feature") ||
    q.includes("application feature") || q.includes("what can this app") || q.includes("how app works") ||
    q.includes("how does this app") || q.includes("about app") || q.includes("பயன்கள்") ||
    q.includes("வசதிகள்") || q.includes("செயலியின் வசதிகள்")
  ) {
    return { intent: "APPLICATION_FEATURES", confidence: 0.98 };
  }

  // 3. AI Questions
  if (
    q.includes("lyo ai") || q.includes("what is lyo") || q.includes("about lyo") ||
    q.includes("who are you") || q.includes("your ai") || q.includes("tell me about your ai") ||
    q.includes("tell me about ai") || q.includes("what is your ai") || q.includes("are you ai") ||
    q.includes("lyo பற்றி") || q.includes("ஏஐ பற்றி")
  ) {
    return { intent: "AI_QUESTIONS", confidence: 0.98 };
  }

  // 4. Greetings
  if (
    q === "hi" || q === "hello" || q === "hey" || q.includes("good morning") ||
    q.includes("good afternoon") || q.includes("good evening") || q.includes("vanakkam") ||
    q.includes("வணக்கம்") || q === "hi lyo" || q === "hello lyo"
  ) {
    return { intent: "GREETINGS", confidence: 0.95 };
  }

  // 5. Customer Support / Help
  if (
    q.includes("customer care") || q.includes("customer support") || q.includes("help") ||
    q.includes("contact") || q.includes("phone number") || q.includes("call support") ||
    q.includes("உதவி") || q.includes("தொடர்பு")
  ) {
    return { intent: "CUSTOMER_SUPPORT", confidence: 0.95 };
  }

  // 6. Coupons / Offers
  if (
    q.includes("coupon") || q.includes("coupons") || q.includes("offer") ||
    q.includes("discount") || q.includes("promo") || q.includes("promo code") ||
    q.includes("கூப்பன்") || q.includes("சலுகை") || q.includes("தள்ளுபடி")
  ) {
    return { intent: "COUPONS", confidence: 0.95 };
  }

  // 7. Delivery Info
  if (
    q.includes("delivery fee") || q.includes("delivery charge") || q.includes("delivery time") ||
    q.includes("shipping fee") || q.includes("டெலிவரி கட்டணம்") || q.includes("டெலிவரி நேரம்")
  ) {
    return { intent: "DELIVERY", confidence: 0.95 };
  }

  // 8. Restaurant / Store Info
  if (
    q.includes("shop open") || q.includes("store timing") || q.includes("opening hours") ||
    q.includes("where is shop") || q.includes("where is store") || q.includes("store location") ||
    q.includes("shop address") || q.includes("store address") || q.includes("location of store") ||
    q.includes("கடை நேரம்") || q.includes("கடை எங்கிருக்கு") || q.includes("முகவரி") ||
    q.includes("where is the store") || q.includes("where is store located")
  ) {
    return { intent: "RESTAURANT_INFO", confidence: 0.95 };
  }

  // 9. Product Search / Inquiries
  if (
    q.includes("do you have") || q.includes("is available") || q.includes("do you sell") ||
    q.includes("price of") || q.includes("cost of") || q.includes("இருக்கா") ||
    q.includes("கிடைக்குமா") || q.includes("விலை என்ன")
  ) {
    return { intent: "PRODUCT_SEARCH", confidence: 0.90 };
  }

  // 10. Product Recommendation
  if (
    q.includes("recommend") || q.includes("suggestion") || q.includes("best item") ||
    q.includes("what should i buy") || q.includes("top selling") || q.includes("சிறந்த")
  ) {
    return { intent: "PRODUCT_RECOMMENDATION", confidence: 0.90 };
  }

  // 11. Settings / Account
  if (
    q.includes("my profile") || q.includes("account settings") || q.includes("change address") ||
    q.includes("my address") || q.includes("சுயவிவரம்") || q.includes("அமைப்புகள்")
  ) {
    return { intent: "SETTINGS", confidence: 0.95 };
  }

  // 12. Explicit Shopping Request Detection
  const hasNumbersOrUnits = /(\d+|இருபது|பத்து|ஐம்பது|நூறு|இரண்டு|ரெண்டு|ரண்டு|ஒன்று|ஒன்னு|மூன்று|மூனு|நான்கு|நாலு|ஐந்து|அஞ்சு|ஆறு|ஏழு|எட்டு|ஒன்பது|kg|kilo|கிலோ|g|gm|gram|கிராம்|l|litre|லிட்டர்|ml|pcs|piece|pieces|பீஸ்|பீசு|பாக்கெட்|pkt|rupees|rs|ரூபாய்|ரூபாய்க்கு|ரூபா|₹)/i.test(q);
  const shoppingVerbs = /(add|buy|order|want|need|send|put|போடு|வாங்கு|வேணும்|வேண்டும்|சேர்)/i.test(q);

  const matchesCatalog = (activeProducts || []).some(p => {
    const en = (p.englishName || '').toLowerCase();
    const ta = (p.tamilName || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const cleanQ = q.replace(/[0-9,\.:;!?]/g, '').trim();
    if (!cleanQ) return false;
    const tokens = cleanQ.split(/\s+/).filter(w => w.length > 1);
    return tokens.some(tok => en.includes(tok) || ta.includes(tok) || cat.includes(tok) || q.includes(en) || q.includes(ta));
  });

  const foodKeywords = ['head curry', 'thalaikkari', 'தலைக்கறி', 'ஆட்டுத்தலை', 'ஆட்டு', 'கறி', 'curry', 'meat', 'potato', 'urulai', 'உருளைக்கிழங்கு', 'தக்காளி', 'வெங்காயம்', 'சிக்கன்', 'மட்டன்', 'முட்டை', 'பால்', 'நெய்', 'மீன்', 'ஈரல்', 'chicken', 'mutton', 'fish', 'egg', 'milk', 'tomato', 'onion', 'ghee', 'oil', 'paneer'];
  const hasFoodKeyword = foodKeywords.some(k => q.includes(k));

  if (hasNumbersOrUnits || shoppingVerbs || matchesCatalog || hasFoodKeyword) {
    return { intent: "SHOPPING_REQUEST", confidence: 0.98 };
  }

  return { intent: "GENERAL_QUESTIONS", confidence: 0.80 };
}

function getNonShoppingResponse(intent, queryText, aiResponseText, activeProducts = []) {
  let text = aiResponseText || "";
  let actionHtml = "";

  switch (intent) {
    case "ORDER_TRACKING":
    case "ORDER_STATUS": {
      const orders = (typeof getData === 'function') ? getData('ek_orders', []) : [];
      const activeUser = (typeof getActiveUser === 'function') ? getActiveUser() : null;
      const userOrders = activeUser
        ? orders.filter(o => o.userId === activeUser.uid || o.userPhone === activeUser.phone)
        : orders;
      const latestOrder = userOrders.length > 0 ? userOrders[userOrders.length - 1] : orders[orders.length - 1];

      if (latestOrder) {
        text = text || `📦 **ஆர்டர் நிலவரம் (Order Status):**\n` +
          `• ஆர்டர் எண்: #${latestOrder.orderId || latestOrder.id}\n` +
          `• தற்போதைய நிலை: **${latestOrder.status || 'Placed'}**\n` +
          `• மொத்த தொகை: ₹${latestOrder.totalAmount || latestOrder.grandTotal || 0}\n` +
          `• விநியோக முகவரி: ${latestOrder.deliveryZone || 'Edappadi Core'}`;
      } else {
        text = text || `📦 **ஆர்டர் நிலவரம் (Order Status):**\n` +
          `தற்போது உங்களிடம் செயலில் உள்ள ஆர்டர்கள் எதுவும் இல்லை.\n` +
          `நீங்கள் ஆர்டர் செய்தவுடன், நேரலை டிராக்கிங் மூலம் அதன் நிலவரத்தைக் கண்காணிக்கலாம்!`;
      }
      actionHtml = `<button type="button" onclick="if(typeof showScreen==='function') showScreen('screen-track');" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: #fff; font-weight: 700; font-size: 11.5px; padding: 8px 14px; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">🚚 நேரலை ஆர்டர் கண்காணிப்பு (Live Tracker)</button>`;
      break;
    }

    case "APPLICATION_FEATURES": {
      text = text || `✨ **எடப்பாடி கடை செயலியின் வசதிகள் (App Features):**\n` +
        `• 🥩 **புதிய கறி & காய்கறிகள்**: ஆட்டுக்கறி, கோழிக்கறி, மீன் மற்றும் புதிய காய்கறிகள் தினமும் நேரடி வரத்து.\n` +
        `• 🤖 **Lyo AI வர்த்தக உதவியாளர்**: தமிழ் மற்றும் ஆங்கிலத்தில் குரல் அல்லது அரட்டை மூலம் எளிதாக ஆர்டர் செய்யலாம்.\n` +
        `• ⚡ **30 நிமிட எக்ஸ்பிரஸ் டெலிவரி**: எடப்பாடி நகரம் மற்றும் சுற்றுவட்டாரப் பகுதிகளுக்கு விரைவான விநியோகம்.\n` +
        `• 💰 **பல்வேறு செலுத்து முறைகள்**: UPI (GPay/PhonePe), Cash on Delivery, Wallet & Loyalty Rewards.\n` +
        `• 🎟️ **சிறப்பு தள்ளுபடி கூப்பன்கள்**: தினமும் புதிய சலுகைகள் மற்றும் கூப்பன்கள்.\n` +
        `• 📦 **நேரலை ஆர்டர் கண்காணிப்பு**: ஆர்டர் தயாரிப்பு முதல் வீட்டை அடையும் வரை லைவ் டிராக்கிங்.`;
      break;
    }

    case "AI_QUESTIONS": {
      text = text || `🤖 **நான் Lyo AI - உங்கள் எடப்பாடி கடை வர்த்தக உதவியாளர்!**\n` +
        `நான் உங்களுக்கு எவ்வாறு உதவ முடியும்:\n` +
        `• தமிழ் அல்லது ஆங்கிலத்தில் பொருட்கள் பெயர் மற்றும் அளவைக் கூறி உடனடியாக கார்ட்டில் சேர்க்கலாம் (எ.கா: '500g சிக்கன்', '2 கிலோ தக்காளி')\n` +
        `• உங்கள் ஆர்டர் நிலவரத்தைக் கண்காணிக்கலாம்\n` +
        `• சலுகை கூப்பன்கள் மற்றும் டெலிவரி தகவல்களைத் தெரிந்துகொள்ளலாம்\n` +
        `• கடையில் உள்ள தயாரிப்புகளைத் தேடலாம்`;
      break;
    }

    case "GREETINGS": {
      text = text || `வணக்கம்! Good day! 🌸 எக்ஸ்பிரஸ் கிச்சன் Lyo AI உங்களை வரவேற்கிறது! இன்று உங்களுக்கு என்ன காய்கறி அல்லது கறி வகைகள் வேண்டும்?`;
      break;
    }

    case "CUSTOMER_SUPPORT":
    case "HELP": {
      text = text || `📞 **வாடிக்கையாளர் சேவை (Customer Support):**\n` +
        `• உதவி எண்: +91 98765 43210\n` +
        `• மின்னஞ்சல்: support@edappadikadai.com\n` +
        `• கடை முகவரி: Main Road, Edappadi Town Core, Salem\n` +
        `உங்களுக்கு ஏதேனும் உதவி தேவைப்பட்டால் எங்களை எப்போது வேண்டுமானாலும் தொடர்புகொள்ளலாம்!`;
      break;
    }

    case "COUPONS": {
      text = text || `🎟️ **இன்றைய தள்ளுபடி கூப்பன்கள் (Active Offer Coupons):**\n` +
        `• **WELCOME10**: 10% தள்ளுபடி (குறைந்தபட்ச ஆர்டர் ₹199)\n` +
        `• **FREEFRESH**: இலவச டெலிவரி (குறைந்தபட்ச ஆர்டர் ₹299)\n` +
        `• **SAVEMORE**: ₹50 உடனடி தள்ளுபடி (குறைந்தபட்ச ஆர்டர் ₹499)\n` +
        `கார்ட்டில் செக்-அவுட் செய்யும்போது இந்த கூப்பன்களைப் பயன்படுத்தி மகிழுங்கள்!`;
      actionHtml = `<button type="button" onclick="if(typeof showScreen==='function') showScreen('screen-cart');" style="background: rgba(245,158,11,0.15); border: 1px solid #f59e0b; color: #fbbf24; font-weight: 700; font-size: 11.5px; padding: 7px 12px; border-radius: 10px; cursor: pointer;">🛒 கார்ட்டில் கூப்பன் பயன்படுத்து (Apply in Cart)</button>`;
      break;
    }

    case "DELIVERY": {
      text = text || `🚚 **டெலிவரி தகவல்கள் (Delivery Info):**\n` +
        `• எடப்பாடி டவுன் கோர்: ₹15 டெலிவரி கட்டணம்\n` +
        `• ₹299-க்கு மேல் ஆர்டர் செய்தால் இலவச டெலிவரி (FREE Delivery above ₹299)!\n` +
        `• சராசரி டெலிவரி நேரம்: 20 முதல் 30 நிமிடங்கள்.`;
      break;
    }

    case "RESTAURANT_INFO": {
      text = text || `🏪 **எடப்பாடி கடை விவரங்கள் (Store Info):**\n` +
        `• வேலை நேரம்: காலை 7:00 AM - இரவு 10:00 PM (தினமும்)\n` +
        `• முகவரி: Main Road, Edappadi Town, Salem, Tamil Nadu\n` +
        `• சிறப்பு: தினமும் காலை பண்ணையிலிருந்து நேரடியாக வரும் புதிய கறி மற்றும் காய்கறிகள்!`;
      break;
    }

    case "PRODUCT_SEARCH": {
      const q = (queryText || '').toLowerCase();
      const matched = (activeProducts || []).filter(p => {
        const nameEn = (p.englishName || '').toLowerCase();
        const nameTa = (p.tamilName || '').toLowerCase();
        return q.split(' ').some(w => w.length > 2 && (nameEn.includes(w) || nameTa.includes(w)));
      });

      if (matched.length > 0) {
        text = text || `🔍 **தேடப்பட்ட தயாரிப்புகள் (Available Products):**\n` +
          matched.slice(0, 5).map(p => `• **${p.englishName}** (${p.tamilName || ''}) - ₹${p.pricePerKg || p.price}/${p.unit || 'kg'}`).join('\n') +
          `\n\nபொருட்களை ஆர்டர் செய்ய, அளவைக் குறிப்பிடவும் (எ.கா: '500g Chicken', '2kg Tomato').`;
      } else {
        text = text || `🔍 கடையில் உள்ள அனைத்து புதிய இறைச்சி மற்றும் காய்கறி வகைகளையும் ஹோம் பக்கத்தில் பார்க்கலாம்! அளவைக் கூறி ஆர்டர் செய்யலாம் (எ.கா: '1kg Mutton').`;
      }
      actionHtml = `<button type="button" onclick="if(typeof showScreen==='function') showScreen('screen-home');" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #34d399; font-weight: 700; font-size: 11.5px; padding: 7px 12px; border-radius: 10px; cursor: pointer;">🏪 அனைத்து பொருட்களையும் பார் (View Store Catalog)</button>`;
      break;
    }

    case "PRODUCT_RECOMMENDATION": {
      const topProds = (activeProducts || []).slice(0, 4);
      text = text || `🌟 **இன்றைய சிறப்பு பரிந்துரைகள் (Today's Recommendations):**\n` +
        topProds.map(p => `• **${p.englishName}** (${p.tamilName || ''}) - ₹${p.pricePerKg || p.price}/${p.unit || 'kg'}`).join('\n') +
        `\n\nதேவையான பொருட்களை ஆர்டர் செய்ய அளவைக் குறிப்பிடவும்!`;
      break;
    }

    case "SETTINGS":
    case "ACCOUNT": {
      text = text || `👤 **கணக்கு மற்றும் அமைப்புகள் (Account & Settings):**\n` +
        `உங்கள் விநியோக முகவரி, சுயவிவர விவரங்கள் மற்றும் கடவுச்சொல்லை மாற்ற சுயவிவரப் பக்கத்திற்குச் செல்லவும்.`;
      actionHtml = `<button type="button" onclick="if(typeof showScreen==='function') showScreen('screen-user');" style="background: rgba(59,130,246,0.15); border: 1px solid #3b82f6; color: #60a5fa; font-weight: 700; font-size: 11.5px; padding: 7px 12px; border-radius: 10px; cursor: pointer;">👤 சுயவிவரப் பக்கம் செல் (Open Profile)</button>`;
      break;
    }

    case "NAVIGATION": {
      text = text || `உங்களுக்குத் தேவையான பக்கத்திற்குச் செல்ல கீழேயுள்ள பொத்தானைப் பயன்படுத்தவும்:`;
      actionHtml = `<button type="button" onclick="if(typeof showScreen==='function') showScreen('screen-home');" style="background: #10b981; border: none; color: #fff; font-weight: 700; font-size: 11.5px; padding: 7px 12px; border-radius: 10px; cursor: pointer;">🏠 ஹோம் பக்கம் செல்</button>`;
      break;
    }

    default: {
      text = text || `நன்றி! உங்கள் கேள்விக்கு உதவ Lyo AI எப்போதும் தயார். கறி அல்லது காய்கறிகளை ஆர்டர் செய்ய '500g Chicken' அல்லது '2kg Tomato' என டைப் செய்யவும்!`;
      break;
    }
  }

  return { text, actionHtml };
}

function speakLyoTextMessage(btnEl) {
  const text = btnEl ? btnEl.getAttribute('data-text') : '';
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#•]/g, ''));
    utterance.lang = (typeof currentLang !== 'undefined' && currentLang === 'ta') ? 'ta-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}


function getActiveLyoProposalMsg() {
  return _lyoChatMessages.find(m => m.role === 'assistant' && m.isProposal === true && m.items && Array.isArray(m.items));
}

        function convertAiItemToManualCartItem(it) {
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
    }

    function syncLyoToManualCart() {
      if (window._isSyncingCart) return;
      window._isSyncingCart = true;
      try {
        const activeMsg = getActiveLyoProposalMsg();
        if (!activeMsg || !activeMsg.items || activeMsg.items.length === 0) {
          cart = [];
        } else {
          cart = activeMsg.items.map(it => convertAiItemToManualCartItem(it));
        }
        if (typeof saveData === 'function') saveData('ek_cart', cart);
        if (typeof updateCartBadge === 'function') updateCartBadge();
        if (typeof renderCartScreen === 'function') renderCartScreen();
      } finally {
        window._isSyncingCart = false;
      }
    }

    function persistLyoChatMessages() {
      try {
        if (typeof saveData === 'function' && Array.isArray(_lyoChatMessages)) {
          saveData('ek_lyo_chat_messages', _lyoChatMessages);
        }
      } catch (e) {}
    }

    function syncManualToLyoCart() {
      if (window._isSyncingCart) return;
      window._isSyncingCart = true;
      try {
        let activeMsg = getActiveLyoProposalMsg();
        if (cart && cart.length > 0) {
          if (!activeMsg) {
            const proposalId = 'prop_' + Date.now();
            activeMsg = {
              id: 'msg_a_' + Date.now(),
              role: 'assistant',
              text: '',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              proposalId: proposalId,
              items: [],
              deliveryCharge: 15,
              deliveryZone: 'Edappadi Mini Ward (Town Core)'
            };
            _lyoChatMessages.push(activeMsg);
          }
          const aiItems = cart.map((cItem, idx) => convertManualCartItemToAiItem(cItem, idx));
          let subtotal = 0;
          aiItems.forEach(it => subtotal += (it.itemTotal || 0));
          activeMsg.items = aiItems;
          activeMsg.text = `Sure! Updated items in your active AI shopping cart: 🎉 Total: ₹${subtotal}`;
        }
        persistLyoChatMessages();
        renderLyoAiChat();
        updateLyoDraftCartBar();
      } finally {
        window._isSyncingCart = false;
      }
    }

    function initLyoAiChat() {
      const msgContainer = document.getElementById('lyo-ai-messages');
      if (!msgContainer) return;
      
      const savedMsgs = (typeof getData === 'function') ? getData('ek_lyo_chat_messages', null) : null;
      if (Array.isArray(savedMsgs) && savedMsgs.length > 0) {
        _lyoChatMessages = savedMsgs;
      } else if (_lyoChatMessages.length === 0) {
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
          persistLyoChatMessages();
        }
      }
      renderLyoAiChat();
      updateLyoDraftCartBar();
    }

    function renderLyoAiChat() {
      const msgContainer = document.getElementById('lyo-ai-messages');
      if (!msgContainer) return;
      let html = '';
      _lyoChatMessages.forEach(msg => {
        if (msg.role === 'user') {
          html += `
            <div style="align-self: flex-end; max-width: 80%; background: #059669; border-radius: 16px 16px 2px 16px; padding: 10px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Poppins', 'Hind Madurai', sans-serif;">
              <div style="color: #ffffff; font-size: 13.5px; font-weight: 700; line-height: 1.35;">${escapeHtml(msg.text)}</div>
              <div style="color: rgba(255,255,255,0.75); font-size: 9.5px; font-weight: 600; text-align: right; margin-top: 3px;">${msg.time || ''}</div>
            </div>
          `;
        } else if (!msg.isProposal || !msg.items || msg.items.length === 0) {
          html += `
            <div style="align-self: flex-start; width: 100%; display: flex; gap: 8px; font-family: 'Poppins', 'Hind Madurai', sans-serif;">
              ${getLyoAiAvatarHtml(!!msg.isTyping)}
              <div style="flex: 1; min-width: 0; background: #121820; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.45);">
                <div style="color: #ffffff; font-size: 13.5px; font-weight: 500; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(msg.text)}</div>
                ${msg.actionHtml ? `<div style="margin-top: 10px;">${msg.actionHtml}</div>` : ''}
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05);">
                  <span style="color: #64748b; font-size: 10px;">${msg.time || ''}</span>
                  <button type="button" onclick="speakLyoTextMessage(this)" data-text="${escapeHtml(msg.text)}" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 3px 8px; font-size: 10px; font-weight: 700; color: #cbd5e1; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                    🔊 LISTEN
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          const items = msg.items || [];
          let itemsSubtotal = 0;
          items.forEach(it => itemsSubtotal += (it.itemTotal || 0));
          const activeUser = (typeof getActiveUser === 'function') ? getActiveUser() : null;
          const financials = (typeof calculateOrderFinancials === 'function')
            ? calculateOrderFinancials(itemsSubtotal, activeUser, '', false, items)
            : { subtotal: itemsSubtotal, deliveryFee: 15, grandTotal: itemsSubtotal + 15 };
          const delFee = financials.deliveryFee;
          const grandTotal = financials.grandTotal;
          const minReq = (typeof getSettings === 'function' && getSettings().minOrderAmount) ? parseFloat(getSettings().minOrderAmount) : 0;
          const minReqMet = itemsSubtotal >= minReq;

          let itemsHtml = '';
          items.forEach(it => {
            const allProds = (typeof getData === 'function') ? getData('ek_products', []) : [];
            const liveP = allProds.find(p => p.id === (it.productId || it.id));
            const displayName = liveP
              ? (liveP.tamilName ? `${liveP.tamilName} (${liveP.englishName})` : liveP.englishName)
              : (it.tamilName ? `${it.tamilName} (${it.name})` : (it.name || 'Product'));
            const displayQtyStr = it.displayQty || it.selectorQty || '1 Unit';
            const displayImg = getImageUrlWithCacheBuster(getProductThumbnailUrl(liveP || it.img || it), liveP ? liveP.updatedAt : null);
            const displayPrice = Number(it.itemTotal || it.price || 0);
            const unitPriceVal = Number(it.price || it.unitPrice || liveP?.pricePerKg || liveP?.sellingPrice || liveP?.price || 40);
            const unitLabel = String(it.unit || liveP?.sellingUnit || liveP?.unit || 'kg');
            const itemIdVal = it.id || ('it_' + (it.productId || matchedProd?.id || Math.random().toString(36).substr(2,6)));
            it.id = itemIdVal;
            it.price = unitPriceVal;
            it.unit = unitLabel;

            const extraActionHtml = `
              <button type="button" onclick="addLyoCardItemToCart('${it.productId || it.id}', ${it.rawQty || 1}, '${unitLabel}')" style="height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.35); color: #10b981; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 11.5px; font-weight: 700; cursor: pointer;" title="Add to Cart">
                <span style="font-size: 13px; display: inline-flex; align-items: center; justify-content: center;">🛒</span>
                <span style="line-height: 1;">Add</span>
              </button>
            `;

            itemsHtml += window.renderSharedCartItemCard({
              image: displayImg,
              title: displayName,
              subtitle: `${displayQtyStr} • <span style="color: #64748b;">₹${unitPriceVal}/${unitLabel}</span>`,
              totalPrice: displayPrice,
              qtyDisplay: it.selectorQty || displayQtyStr,
              onMinusClick: `changeLyoCardItemQty('${msg.proposalId}', '${itemIdVal}', -1)`,
              onPlusClick: `changeLyoCardItemQty('${msg.proposalId}', '${itemIdVal}', 1)`,
              onDeleteClick: `removeLyoCardItem('${msg.proposalId}', '${itemIdVal}')`,
              extraActionHtml: extraActionHtml
            });
          });
          let choiceChipsHtml = '';
          if (msg.lowConfidenceChoices && msg.lowConfidenceChoices.length > 0) {
            choiceChipsHtml = `
              <div style="margin-top: 10px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 10px;">
                <div style="color: #f59e0b; font-size: 11.5px; font-weight: 800; margin-bottom: 6px;">
                  ❓ எந்த பொருளை சேர்க்க வேண்டும்? / Please select:
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            `;
            msg.lowConfidenceChoices.forEach(cand => {
              choiceChipsHtml += `
                <button type="button" onclick="selectLyoProductCandidate('${msg.proposalId}', '${cand.product.id}', ${cand.rawQtyVal}, '${cand.amountType}')" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #fff; border-radius: 10px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  👉 ${escapeHtml(cand.product.tamilName || cand.product.englishName)} (₹${cand.product.pricePerKg || 40})
                </button>
              `;
            });
            choiceChipsHtml += `
                </div>
              </div>
            `;
          }

          html += `
            <div style="align-self: flex-start; width: 100%; display: flex; gap: 8px; font-family: 'Poppins', 'Hind Madurai', sans-serif;">
              <!-- Bot Avatar -->
              ${getLyoAiAvatarHtml(!!msg.isTyping)}
              <!-- Main Card -->
              <div style="flex: 1; min-width: 0; background: #121820; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.45);">
                <div style="color: #ffffff; font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 4px;">
                  ${msg.text}
                </div>
                <div style="color: #10b981; font-size: 10.5px; margin-bottom: 8px; font-weight: 700;">
                  ✨ Production Lyo AI Commerce Engine (100% Accurate Sync)
                </div>
                <!-- Product List -->
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  ${itemsHtml}
                </div>
                ${choiceChipsHtml}
                <!-- Delivery Charge Section -->
                <div style="margin-top: 10px; font-size: 11.5px; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 4px;">
                  <span>📍</span>
                  <span>Delivery fee: ₹${delFee} (${financials.zoneName || 'Edappadi Core'})</span>
                </div>
                <!-- Minimum Order Requirement Card -->
                <div style="margin-top: 8px; background: ${minReqMet ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'}; border: 1px dashed ${minReqMet ? '#10b981' : '#ef4444'}; border-radius: 10px; padding: 8px 10px;">
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #ffffff;">
                    <span>${minReqMet ? '✅' : '⚠️'}</span>
                    <span>${minReqMet ? `Minimum order requirement met! (₹${itemsSubtotal} / ₹${minReq})` : `Add ₹${minReq - itemsSubtotal} more for minimum order (₹${minReq})`}</span>
                  </div>
                  <div style="margin-top: 5px; height: 3px; background: ${minReqMet ? '#10b981' : '#ef4444'}; border-radius: 2px; width: 100%;"></div>
                </div>
                <!-- Order Now Button -->
                <button type="button" onclick="placeLyoProposalOrder('${msg.proposalId}')" style="width: 100%; height: 46px; margin-top: 10px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%); border: none; color: #ffffff; font-weight: 800; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,0.3); box-shadow: 0 4px 14px rgba(16,185,129,0.25); display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
                  🛍️ Order Now (₹${itemsSubtotal} items + ₹${delFee} del = ₹${grandTotal})
                </button>
                <!-- Add All and Discard Buttons Row -->
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <button type="button" onclick="addAllLyoProposalToCart('${msg.proposalId}')" style="flex: 1; height: 42px; border-radius: 12px; background: #10b981; border: none; color: #ffffff; font-weight: 800; font-size: 12.5px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; box-shadow: 0 3px 10px rgba(16,185,129,0.25);">
                    🛒 Add All To Cart
                  </button>
                  <button type="button" onclick="discardLyoProposal('${msg.proposalId}')" style="flex: 1; height: 42px; border-radius: 12px; background: #ef4444; border: none; color: #ffffff; font-weight: 800; font-size: 12.5px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; box-shadow: 0 3px 10px rgba(239,68,68,0.25);">
                    🗑️ Discard
                  </button>
                </div>
                <!-- Footer Timestamp & Audio Button -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 4px;">
                  <span style="color: #64748b; font-size: 10px;">${msg.time || '01:31 AM'}</span>
                  <button type="button" onclick="speakLyoMessage('${msg.proposalId}')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 4px 10px; font-size: 10px; font-weight: 700; color: #cbd5e1; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                    🔊 கேள் / LISTEN
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      });
      msgContainer.innerHTML = html;
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    
    // ==========================================
    // LYO AI CARD & SYSTEM ACTION HANDLERS
    // ==========================================

    function autoGrowLyoInput(el) {
      if (!el) return;
      if (!el.value || !el.value.trim()) {
        el.style.height = "24px";
        el.rows = 1;
        el.style.overflowY = "hidden";
        return;
      }
      el.style.height = "24px";
      const scrollH = el.scrollHeight;
      el.style.height = Math.min(Math.max(24, scrollH), 120) + "px";
      if (scrollH > 120) {
        el.style.overflowY = "auto";
      } else {
        el.style.overflowY = "hidden";
      }
    }

    function sendQuickLyoQuery(queryText) {
      if (!queryText) return;
      if (queryText === "Clear cart" || queryText === "கூடையை காலி செய்") {
        clearLyoAiCart();
        return;
      }
      const inputEl = document.getElementById("lyo-ai-input");
      if (inputEl) {
        inputEl.value = queryText;
        autoGrowLyoInput(inputEl);
      }
      if (typeof sendLyoAiMessage === "function") {
        sendLyoAiMessage();
      } else if (typeof onLyoSendBtnClick === "function") {
        onLyoSendBtnClick();
      }
    }

    function toggleLyoAiLang() {
      if (typeof currentLang === "undefined") {
        window.currentLang = "ta";
      }
      currentLang = (currentLang === "ta") ? "en" : "ta";
      const label = document.getElementById("lyo-ai-lang-label");
      if (label) {
        label.textContent = currentLang === "ta" ? "தமிழ்" : "English";
      }
      if (typeof renderLyoAiChat === "function") renderLyoAiChat();
      if (typeof showToast === "function") {
        showToast(
          currentLang === "ta" ? "மொழி தமிழ் ஆக மாற்றப்பட்டது" : "Language switched to English",
          "info"
        );
      }
    }

    function updateLyoDraftCartBar() {
      const bar = document.getElementById("lyo-ai-draft-cart-bar");
      const titleEl = document.getElementById("lyo-ai-draft-cart-title");
      const subEl = document.getElementById("lyo-ai-draft-cart-sub");
      if (!bar) return;
      const items = (typeof cart !== "undefined" && Array.isArray(cart)) ? cart : [];
      if (items.length === 0) {
        bar.style.display = "none";
        return;
      }
      let totalAmount = 0;
      items.forEach(i => {
        const price = parseFloat(i.totalPrice || i.price || i.itemTotal) || 0;
        totalAmount += price;
      });
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (titleEl) {
        titleEl.textContent = isTa
          ? `🛒 ${items.length} பொருட்கள் கார்ட்டில் உள்ளன • ₹${totalAmount.toFixed(2)}`
          : `🛒 ${items.length} Item(s) in AI Commerce Cart • ₹${totalAmount.toFixed(2)}`;
      }
      if (subEl) {
        subEl.textContent = isTa
          ? "ஆர்டர் செய்ய 'Place Order' பொத்தானை அழுத்தவும்."
          : "Tap 'Place Order' for 1-Click Checkout.";
      }
      bar.style.display = "flex";
    }

    function clearLyoAiCart() {
      if (typeof cart !== "undefined") {
        cart = [];
        if (typeof saveData === "function") saveData("ek_cart", cart);
      }
      const activeMsg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      if (activeMsg) {
        activeMsg.items = [];
      }
      persistLyoChatMessages();
      if (typeof updateLyoDraftCartBar === "function") updateLyoDraftCartBar();
      if (typeof updateCartBadge === "function") updateCartBadge();
      if (typeof updateCartUI === "function") updateCartUI();
      if (typeof renderLyoAiChat === "function") renderLyoAiChat();
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (typeof showToast === "function") {
        showToast(
          isTa ? "கூடை காலியாக்கப்பட்டது! 🛒" : "Cart cleared! 🛒",
          "info"
        );
      }
    }

    function checkoutLyoAiOrder() {
      window.isLyoAiCheckout = true;
      selectedPaymentMethod = 'Cash on Delivery';
      const items = (typeof cart !== "undefined" && Array.isArray(cart)) ? cart : [];
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (items.length === 0) {
        if (typeof showToast === "function") {
          showToast(
            isTa ? "கூடை காலியாக உள்ளது!" : "Your cart is empty!",
            "warning"
          );
        }
        return;
      }
      if (typeof switchTab === "function") {
        switchTab("cart");
      } else if (typeof openCartPage === "function") {
        openCartPage();
      } else if (typeof navigateTo === "function") {
        navigateTo("cart");
      }
    }

    function playLyoChimeSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {
        // Ignored audio ctx restriction
      }
    }

    function changeLyoCardItemQty(proposalId, itemId, delta) {
      let msg = (typeof _lyoChatMessages !== "undefined") ? _lyoChatMessages.find(m => m.proposalId === proposalId || m.id === proposalId) : null;
      if (!msg) msg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      if (!msg || !msg.items) return;
      const it = msg.items.find(i => i.id === itemId || i.productId === itemId);
      if (!it) return;

      const allProds = (typeof getData === 'function') ? getData('ek_products', []) : [];
      const liveP = allProds.find(p => p.id === (it.productId || it.id));
      const unitPrice = Number(it.price || it.unitPrice || liveP?.pricePerKg || liveP?.sellingPrice || liveP?.price || 40);
      const unit = (it.unit || liveP?.sellingUnit || liveP?.unit || "kg").toLowerCase();
      const isWeight = (unit === "kg" || unit === "g" || unit === "gram");
      const isLiquid = (unit === "litre" || unit === "l" || unit === "ml");

      if (isWeight) {
        let currentGram = (it.rawQty <= 50) ? Math.round(it.rawQty * 1000) : Math.round(it.rawQty);
        let newGram = currentGram + delta * 250;
        if (newGram < 250) newGram = 250;
        const qtyInKg = newGram / 1000;
        it.rawQty = newGram;
        it.displayQty = `${newGram}g (${qtyInKg.toFixed(2)} Kg)`;
        it.selectorQty = `${newGram} g`;
        it.itemTotal = Math.round(qtyInKg * unitPrice);
      } else if (isLiquid) {
        let currentMl = (it.rawQty <= 50) ? Math.round(it.rawQty * 1000) : Math.round(it.rawQty);
        let newMl = currentMl + delta * 250;
        if (newMl < 250) newMl = 250;
        const qtyInL = newMl / 1000;
        it.rawQty = newMl;
        it.displayQty = `${newMl} ml (${qtyInL.toFixed(2)} L)`;
        it.selectorQty = `${newMl} ml`;
        it.itemTotal = Math.round(qtyInL * unitPrice);
      } else {
        let newCount = Math.max(1, Math.round((it.rawQty || 1) + delta));
        it.rawQty = newCount;
        it.displayQty = `${newCount} ${it.unit || "pcs"}`;
        it.selectorQty = `${newCount} ${it.unit || "pcs"}`;
        it.itemTotal = Math.round(newCount * unitPrice);
      }

      saveData('ek_lyo_chat_messages', _lyoChatMessages);
      if (typeof syncLyoToManualCart === "function") syncLyoToManualCart();
      if (typeof renderLyoAiChat === "function") renderLyoAiChat();
      if (typeof updateLyoDraftCartBar === "function") updateLyoDraftCartBar();
      if (typeof updateCartBadge === "function") updateCartBadge();
      if (typeof updateCartUI === "function") updateCartUI();
    }

    function addLyoCardItemToCart(productId, rawQty, unit) {
      const products = (typeof getData === "function") ? getData("ek_products", []) : [];
      const prod = products.find(p => p.id === productId);
      if (!prod) {
        if (typeof showToast === "function") showToast("Product not found!", "error");
        return;
      }
      const unitPrice = Number(prod.pricePerKg || prod.sellingPrice || prod.price || 40);
      const isWeight = !(unit === "piece" || unit === "packet" || unit === "bunch" || unit === "dozen" || unit === "unit" || unit === "box");
      let weightGrams = rawQty || 1;
      if (isWeight) {
        weightGrams = (rawQty <= 50) ? Math.round(rawQty * 1000) : Math.round(rawQty);
      } else {
        weightGrams = Math.round(rawQty);
      }
      const totalPrice = isWeight
        ? Math.round((unitPrice / 1000) * weightGrams)
        : Math.round(unitPrice * weightGrams);

      if (typeof cart === "undefined") window.cart = [];
      const existingIdx = cart.findIndex(c => c.productId === productId);
      if (existingIdx !== -1) {
        cart[existingIdx].weightGrams += weightGrams;
        cart[existingIdx].totalPrice += totalPrice;
      } else {
        cart.push({
          productId: prod.id,
          tamilName: prod.tamilName || prod.englishName,
          englishName: prod.englishName || prod.tamilName,
          weightGrams: weightGrams,
          pricePerKg: unitPrice,
          totalPrice: totalPrice,
          unit: prod.unit || unit || "kg",
          imageUrl: prod.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop",
          isFreeDeliveryEligible: Boolean(prod.isFreeDeliveryEligible)
        });
      }
      if (typeof saveData === "function") saveData("ek_cart", cart);
      if (typeof updateCartBadge === "function") updateCartBadge();
      if (typeof updateCartUI === "function") updateCartUI();
      if (typeof updateLyoDraftCartBar === "function") updateLyoDraftCartBar();
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (typeof showToast === "function") {
        showToast(
          isTa ? `கார்ட்டில் சேர்க்கப்பட்டது: ${prod.tamilName || prod.englishName}` : `Added to cart: ${prod.englishName || prod.tamilName}`,
          "success"
        );
      }
    }

    function removeLyoCardItem(proposalId, itemId) {
      let msg = (typeof _lyoChatMessages !== "undefined") ? _lyoChatMessages.find(m => m.proposalId === proposalId || m.id === proposalId) : null;
      if (!msg) msg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      if (!msg || !msg.items) return;
      msg.items = msg.items.filter(i => i.id !== itemId);
      if (typeof syncLyoToManualCart === "function") syncLyoToManualCart();
      if (typeof renderLyoAiChat === "function") renderLyoAiChat();
      if (typeof updateLyoDraftCartBar === "function") updateLyoDraftCartBar();
      if (typeof updateCartBadge === "function") updateCartBadge();
      if (typeof updateCartUI === "function") updateCartUI();
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (typeof showToast === "function") {
        showToast(
          isTa ? "பொருள் நீக்கப்பட்டது 🗑️" : "Item removed 🗑️",
          "info"
        );
      }
    }

    function placeLyoProposalOrder(proposalId) {
      window.isLyoAiCheckout = true;
      selectedPaymentMethod = 'Cash on Delivery';
      if (typeof syncLyoToManualCart === "function") syncLyoToManualCart();
      const items = (typeof cart !== "undefined" && Array.isArray(cart)) ? cart : [];
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (items.length === 0) {
        if (typeof showToast === "function") {
          showToast(isTa ? "கூடை காலியாக உள்ளது!" : "Your cart is empty!", "warning");
        }
        return;
      }
      if (typeof switchTab === "function") {
        switchTab("cart");
      } else if (typeof openCartPage === "function") {
        openCartPage();
      }
      if (typeof showToast === "function") {
        showToast(isTa ? "கார்ட் திறக்கப்படுகிறது... 🛍️" : "Opening checkout... 🛍️", "success");
      }
    }

    function addAllLyoProposalToCart(proposalId) {
      let msg = (typeof _lyoChatMessages !== "undefined") ? _lyoChatMessages.find(m => m.proposalId === proposalId || m.id === proposalId) : null;
      if (!msg) msg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      if (!msg || !msg.items || msg.items.length === 0) return;
      msg.items.forEach(it => {
        addLyoCardItemToCart(it.productId, it.rawQty, it.unit);
      });
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (typeof showToast === "function") {
        showToast(
          isTa ? "அனைத்து பொருட்களும் கார்ட்டில் சேர்க்கப்பட்டன! 🛒" : "All items added to cart! 🛒",
          "success"
        );
      }
    }

    function discardLyoProposal(proposalId) {
      let msg = (typeof _lyoChatMessages !== "undefined") ? _lyoChatMessages.find(m => m.proposalId === proposalId || m.id === proposalId) : null;
      if (!msg) msg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      if (msg) {
        msg.items = [];
      }
      persistLyoChatMessages();
      if (typeof syncLyoToManualCart === "function") syncLyoToManualCart();
      if (typeof renderLyoAiChat === "function") renderLyoAiChat();
      if (typeof updateLyoDraftCartBar === "function") updateLyoDraftCartBar();
      if (typeof updateCartBadge === "function") updateCartBadge();
      if (typeof updateCartUI === "function") updateCartUI();
      const isTa = (typeof currentLang !== "undefined" && currentLang === "ta");
      if (typeof showToast === "function") {
        showToast(
          isTa ? "ஆர்டர் ரத்து செய்யப்பட்டது 🗑️" : "Proposal discarded 🗑️",
          "info"
        );
      }
    }

    function speakLyoMessage(proposalId) {
      let msg = (typeof _lyoChatMessages !== "undefined") ? _lyoChatMessages.find(m => m.proposalId === proposalId || m.id === proposalId) : null;
      if (!msg) msg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      const textToSpeak = msg ? msg.text : "வணக்கம்! எக்ஸ்பிரஸ் கிச்சன் Lyo AI உங்களுக்கு சேவை செய்ய தயார்.";
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/<[^>]*>?/gm, ""));
        utterance.lang = (typeof currentLang !== "undefined" && currentLang === "en") ? "en-IN" : "ta-IN";
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }

    function selectLyoProductCandidate(proposalId, productId, rawQtyVal, amountType) {
      let msg = (typeof _lyoChatMessages !== "undefined") ? _lyoChatMessages.find(m => m.proposalId === proposalId || m.id === proposalId) : null;
      if (!msg) msg = (typeof getActiveLyoProposalMsg === "function") ? getActiveLyoProposalMsg() : null;
      if (!msg) return;

      const products = (typeof getData === "function") ? getData("ek_products", []) : [];
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      const details = (typeof calculateLyoItemDetails === "function")
        ? calculateLyoItemDetails(prod, { rawQtyVal: rawQtyVal || 1, amountType: amountType || "WEIGHT_GRAMS" })
        : { displayQty: `${rawQtyVal}g`, selectorQty: `${rawQtyVal} g`, rawQty: rawQtyVal, itemTotal: 40 };

      const newItem = {
        id: "item_" + Date.now() + "_" + Math.floor(Math.random()*1000),
        productId: prod.id,
        name: prod.englishName || prod.tamilName,
        tamilName: prod.tamilName || prod.englishName,
        displayQty: details.displayQty,
        selectorQty: details.selectorQty,
        rawQty: details.rawQty,
        unit: prod.unit || "kg",
        price: prod.pricePerKg || prod.price || 40,
        itemTotal: details.itemTotal,
        img: prod.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop"
      };

      if (!msg.items) msg.items = [];
      msg.items.push(newItem);
      msg.lowConfidenceChoices = [];

      if (typeof syncLyoToManualCart === "function") syncLyoToManualCart();
      if (typeof renderLyoAiChat === "function") renderLyoAiChat();
      if (typeof updateLyoDraftCartBar === "function") updateLyoDraftCartBar();
      if (typeof updateCartBadge === "function") updateCartBadge();
      if (typeof updateCartUI === "function") updateCartUI();
    }


    function sendLyoAiMessage() {
      return onLyoSendBtnClick();
    }

async function onLyoSendBtnClick() {
  try {
    const inputEl = document.getElementById('lyo-ai-input');
    if (!inputEl) return;
    const queryText = inputEl.value.trim();
    if (!queryText) return;
    inputEl.value = '';
    inputEl.style.height = '24px';
    inputEl.rows = 1;
    if (typeof autoGrowLyoInput === 'function') autoGrowLyoInput(inputEl);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    _lyoChatMessages.push({
      id: 'msg_u_' + Date.now(),
      role: 'user',
      text: queryText,
      time: nowStr
    });

    const tempTypingId = 'msg_typing_' + Date.now();
    _lyoChatMessages.push({
      id: tempTypingId,
      role: 'assistant',
      isProposal: false,
      text: 'Lyo AI சிந்திக்கிறது... 🤖✨',
      time: nowStr,
      isTyping: true,
      items: []
    });

    renderLyoAiChat();
    if (typeof showLyoTransitLoader === 'function') showLyoTransitLoader("Lyo AI பகுப்பாய்வு செய்கிறது... 🥩🥦", 200);

    const activeProducts = (typeof getData === 'function') ? getData('ek_products', []) : [];

    // INTENT CLASSIFICATION LAYER
    const intentResult = await classifyLyoUserIntent(queryText, activeProducts);
    const intent = (intentResult.intent || 'GENERAL_QUESTIONS').toUpperCase();

    // Remove typing indicator
    _lyoChatMessages = _lyoChatMessages.filter(m => m.id !== tempTypingId);

    if (intent === LYO_INTENTS.SHOPPING_REQUEST) {
      // EXECUTE SHOPPING ENGINE ONLY FOR SHOPPING REQUESTS
      let activeProposalMsg = getActiveLyoProposalMsg();
      if (!activeProposalMsg) {
        const proposalId = 'prop_' + Date.now();
        activeProposalMsg = {
          id: 'msg_a_' + Date.now(),
          role: 'assistant',
          isProposal: true,
          text: 'உங்களுக்காக தயாரிப்புகள் சேர்க்கப்பட்டது! 🥩🥦',
          time: nowStr,
          proposalId: proposalId,
          items: [],
          deliveryCharge: 15,
          deliveryZone: 'Edappadi Mini Ward (Town Core)',
          isTyping: false
        };
        _lyoChatMessages.push(activeProposalMsg);
      } else {
        _lyoChatMessages = _lyoChatMessages.filter(m => m.id !== activeProposalMsg.id);
        activeProposalMsg.time = nowStr;
        activeProposalMsg.isProposal = true;
        activeProposalMsg.isTyping = false;
        _lyoChatMessages.push(activeProposalMsg);
      }

      let parsedItems = [];
      try {
        if (typeof parseOrderWithAI === 'function') {
          parsedItems = await parseOrderWithAI(queryText, activeProducts);
        }
      } catch (e) {
        console.warn("parseOrderWithAI failed, using fallback catalog parser:", e);
      }

      if (!parsedItems || parsedItems.length === 0) {
        parsedItems = parseLyoCommerceQuery(queryText);
      }

      parsedItems.forEach((parsed) => {
        const searchTerm = parsed.product_name || parsed.productSearchTerm || queryText;
        const matchResult = matchProductWithConfidence(searchTerm, activeProducts);

        if (matchResult && matchResult.product && (matchResult.score >= 0.3 || activeProducts.length === 1)) {
          const matchedProd = matchResult.product;
          const calcInput = {
            rawQtyVal: parsed.raw_quantity_val || parsed.rawQtyVal || 1,
            amountType: parsed.amount_type || parsed.amountType || 'WEIGHT_KG',
            unit: parsed.unit || 'kg'
          };
          const details = calculateLyoItemDetails(matchedProd, calcInput);

          const existingItem = activeProposalMsg.items.find(it => it.productId === matchedProd.id);
          if (existingItem) {
            if (isUnitWeight(matchedProd.unit)) {
              let currentGrams = (existingItem.rawQty && existingItem.rawQty <= 50) ? existingItem.rawQty * 1000 : existingItem.rawQty;
              let addedGrams = (calcInput.rawQtyVal && calcInput.rawQtyVal <= 50) ? calcInput.rawQtyVal * 1000 : calcInput.rawQtyVal;
              if (calcInput.amountType === 'AMOUNT_RS') {
                addedGrams = details.rawQty <= 50 ? details.rawQty * 1000 : details.rawQty;
              }
              const combinedGrams = currentGrams + addedGrams;
              let updatedDetails;
              if (combinedGrams >= 1000) {
                updatedDetails = calculateLyoItemDetails(matchedProd, { rawQtyVal: combinedGrams / 1000, amountType: 'WEIGHT_KG', unit: 'kg' });
                existingItem.unit = 'kg';
              } else {
                updatedDetails = calculateLyoItemDetails(matchedProd, { rawQtyVal: combinedGrams, amountType: 'WEIGHT_GRAMS', unit: 'g' });
                existingItem.unit = 'g';
              }
              existingItem.displayQty = updatedDetails.displayQty;
              existingItem.selectorQty = updatedDetails.selectorQty;
              existingItem.rawQty = updatedDetails.rawQty;
              existingItem.itemTotal = updatedDetails.itemTotal;
            } else {
              const newCount = (existingItem.rawQty || 1) + (calcInput.rawQtyVal || 1);
              const updatedDetails = calculateLyoItemDetails(matchedProd, { rawQtyVal: newCount, amountType: 'COUNT_PCS', unit: matchedProd.unit || 'pcs' });
              existingItem.displayQty = updatedDetails.displayQty;
              existingItem.selectorQty = updatedDetails.selectorQty;
              existingItem.rawQty = updatedDetails.rawQty;
              existingItem.itemTotal = updatedDetails.itemTotal;
            }
          } else {
            const prodPriceVal = Number(matchedProd.pricePerKg || matchedProd.sellingPrice || matchedProd.price || 40);
            const prodUnitVal = String(matchedProd.sellingUnit || matchedProd.unit || calcInput.unit || 'kg');
            const newCardItemId = 'it_' + matchedProd.id + '_' + Date.now();
            activeProposalMsg.items.push({
              id: newCardItemId,
              productId: matchedProd.id,
              name: matchedProd.englishName || matchedProd.name,
              tamilName: matchedProd.tamilName || '',
              displayQty: details.displayQty,
              selectorQty: details.selectorQty,
              rawQty: details.rawQty,
              unit: prodUnitVal,
              itemTotal: details.itemTotal,
              unitPrice: prodPriceVal,
              price: prodPriceVal,
              imageUrl: matchedProd.imageUrl || matchedProd.image || ''
            });
          }
        }
      });

      if (activeProposalMsg.items.length > 0) {
        const itemSummaryList = activeProposalMsg.items.map(it => `• **${it.tamilName || it.name}** (${it.displayQty} - ₹${it.itemTotal})`).join('\n');
        activeProposalMsg.text = `நன்றி! உங்கள் கட்டளைப்படி பொருட்கள் கார்ட்டில் சேர்க்கப்பட்டன! 🥩🛒\n\n${itemSummaryList}`;
      } else {
        _lyoChatMessages = _lyoChatMessages.filter(m => m.id !== activeProposalMsg.id);
        _lyoChatMessages.push({
          id: 'msg_a_' + Date.now(),
          role: 'assistant',
          isProposal: false,
          text: `மன்னிக்கவும், '${queryText}' குறித்த பொருட்கள் நமது கடையில் தற்போது இருப்பில் இல்லை. 🛒\n\nஎங்களிடம் ஆட்டுக்கறி, ஆட்டுத் தலைக்கறி, பிராய்லர் சிக்கன், நாட்டுக்கோழி, தக்காளி, உருளைக்கிழங்கு போன்ற பொருட்கள் உள்ளன.`,
          time: nowStr,
          items: []
        });
      }

      syncLyoToManualCart();
    } else {
      // NON-SHOPPING REQUEST
      // NEVER generate products.
      // NEVER modify the AI cart.
      // NEVER change quantities.
      // NEVER add items.
      // NEVER remove items.
      // NEVER trigger checkout logic.
      const responseObj = getNonShoppingResponse(intent, queryText, intentResult.responseText, activeProducts);
      _lyoChatMessages.push({
        id: 'msg_a_' + Date.now(),
        role: 'assistant',
        isProposal: false,
        text: responseObj.text,
        actionHtml: responseObj.actionHtml || '',
        time: nowStr,
        items: []
      });
    }

    renderLyoAiChat();
    const chatContainer = document.getElementById('lyo-ai-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  } catch (err) {
    console.error('Error handling Lyo AI message:', err);
  } finally {
    hideLyoTransitLoader();
  }
}