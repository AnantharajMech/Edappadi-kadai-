const fs = require('fs');
const file = 'app/src/main/assets/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Remove dangling async line around line 28368
html = html.replace(/\n\s*async\s*\n\s*\/\/\s*=+?\n\s*\/\/\s*DEDICATED PUSH NOTIFICATIONS/g, "\n\n    // ==========================================\n    // DEDICATED PUSH NOTIFICATIONS");

// 2. Fix end of file cutoff if present
const cutoffTarget = `<button id="lyo-order-btn-\${idx}" onclick="checkoutAllLyoProposalItems(\${idx})" class="btn" style="width: 100%; height: 42px; min-height: 42px; border-radius: 12px; font-family:'Poppins','Hind Madurai',sans-serif; font`;

const pos = html.indexOf(cutoffTarget);
if (pos !== -1) {
  const replacement = `<button id="lyo-order-btn-\${idx}" onclick="checkoutAllLyoProposalItems(\${idx})" class="btn" style="width: 100%; height: 42px; min-height: 42px; border-radius: 12px; font-family:'Poppins','Hind Madurai',sans-serif; font-size: 13px; font-weight: 800; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  <span>🛍️</span>
                  <span>\${currentLang === 'ta' ? 'அனைத்தையும் கூடையில் சேர் / ஆர்டர் செய்' : 'Add All to Cart & Checkout'}</span>
                </button>
              </div>
            \`;
          }

          html += \`
            <div class="lyo-msg-row lyo-ai-row" style="display: flex; justify-content: flex-start; align-items: flex-end; gap: 8px; margin-bottom: 12px;">
              \${getLyoAiAvatarHtml(28)}
              <div style="max-width: 82%; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 12px; border-radius: 14px 14px 14px 2px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);">
                <p style="margin: 0; font-size: 13.5px; line-height: 1.4; font-family:'Poppins','Hind Madurai',sans-serif; white-space: pre-wrap;">\${escapeHtml(msg.text)}</p>
                \${propHtml}
                <div style="font-size: 8px; color: rgba(255,255,255,0.5); margin-top: 6px; text-align: right; font-weight:600;">\${msg.timestamp}</div>
              </div>
            </div>
          \`;
        }
      });

      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.warn("[Lyo AI Messages Render Error]:", err);
    }
  }

  function parseOfflineOrderProposal(text) {
    if (!text) return null;
    const products = getData('ek_products', []);
    if (!Array.isArray(products) || products.length === 0) return null;

    const detectedItems = [];
    const lower = text.toLowerCase();

    products.forEach(p => {
      if (!p || !p.id) return;
      const eName = (p.englishName || '').toLowerCase();
      const tName = (p.tamilName || '').toLowerCase();

      if ((eName && lower.includes(eName)) || (tName && lower.includes(tName))) {
        const existing = detectedItems.find(x => x.product_id === p.id);
        if (!existing) {
          detectedItems.push({
            product_id: p.id,
            product_name: p.englishName,
            tamilName: p.tamilName,
            price: p.pricePerKg || p.price || 0,
            unit: p.sellingUnit || p.unit || "kg",
            raw_quantity_val: 1,
            amount_type: "COUNT_PIECES"
          });
        }
      }
    });
    if (detectedItems.length === 0) return null;
    return detectedItems;
  }
  window.parseOfflineOrderProposal = parseOfflineOrderProposal;
</script>
</body>
</html>`;
  html = html.substring(0, pos) + replacement;
}

fs.writeFileSync(file, html, 'utf8');
console.log('Fix script finished.');

// Perform strict JS & HTML validation
const vm = require('vm');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
let hasJsError = false;

while ((match = scriptRegex.exec(html)) !== null) {
  scriptIdx++;
  const jsCode = match[1];
  try {
    new vm.Script("async function __testAll() {\n" + jsCode + "\n}");
    console.log(`Script #${scriptIdx} (${jsCode.length} chars): SYNTAX OK ✅`);
  } catch (err) {
    console.error(`Script #${scriptIdx} SYNTAX ERROR:`, err.message);
    hasJsError = true;
  }
}

const tagsToTest = ["script", "style", "div", "form", "body", "html", "head", "button", "select", "option", "label", "table", "tr", "td", "th"];
console.log("\n--- TAG BALANCE CHECK ---");
let hasTagMismatch = false;
tagsToTest.forEach(tag => {
  const openRegex = new RegExp('<' + tag + '\\b[^>]*>', 'gi');
  const closeRegex = new RegExp('</' + tag + '>', 'gi');
  const opens = (html.match(openRegex) || []).length;
  const closes = (html.match(closeRegex) || []).length;
  if (opens !== closes) {
    console.log(`⚠️ ${tag}: opens = ${opens}, closes = ${closes} MISMATCH`);
    hasTagMismatch = true;
  } else {
    console.log(`✅ ${tag}: opens = ${opens}, closes = ${closes} OK`);
  }
});

if (!hasJsError && !hasTagMismatch) {
  console.log("\n🎉 ALL HTML AND JS SYNTAX CHECKS PASSED 100% PERFECTLY!");
} else {
  console.log("\n❌ ISSUES DETECTED!");
}
