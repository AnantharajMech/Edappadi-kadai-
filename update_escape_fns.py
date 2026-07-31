import re

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    html = f.read()

escape_fns = """
    function escapeHtml(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function formatLyoResponseText(text) {
      if (!text) return "";
      let escaped = escapeHtml(text);
      escaped = escaped.replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>");
      escaped = escaped.replace(/\\*(.*?)\\*/g, "<em>$1</em>");
      return escaped;
    }

"""

target = "function initLyoAiChat("
idx = html.find(target)

if idx != -1:
    new_html = html[:idx] + escape_fns + html[idx:]
    with open("app/src/main/assets/index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("✅ Successfully added escapeHtml and formatLyoResponseText!")
else:
    print("❌ Could not find target initLyoAiChat")
