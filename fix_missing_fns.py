import re

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    html = f.read()

target = "async function sendLyoAiMessage()"
idx = html.find(target)

missing_fns = """
    function autoGrowLyoInput(el) {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }

    function onLyoSendBtnClick() {
      sendLyoAiMessage();
    }

    function sendQuickLyoQuery(queryText) {
      if (!queryText) return;
      if (queryText === "Clear cart") {
        if (typeof clearCart === "function") {
          clearCart();
        } else {
          cart = [];
          saveCart();
          if (typeof updateCartBadge === "function") updateCartBadge();
        }
        showToast(currentLang === "ta" ? "கூடை காலி செய்யப்பட்டது 🗑️" : "Cart cleared 🗑️", "info");
        return;
      }
      const inputEl = document.getElementById("lyo-ai-input");
      if (inputEl) {
        inputEl.value = queryText;
        autoGrowLyoInput(inputEl);
      }
      sendLyoAiMessage();
    }

    """

if idx != -1:
    new_html = html[:idx] + missing_fns + html[idx:]
    with open("app/src/main/assets/index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("✅ Successfully added autoGrowLyoInput, onLyoSendBtnClick, and sendQuickLyoQuery!")
else:
    print("❌ Could not find target async function sendLyoAiMessage()")
