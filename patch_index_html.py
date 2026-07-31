import sys
import re

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Load temp_test.js functions
with open("temp_test.js", "r", encoding="utf-8") as f:
    temp_code = f.read()

# Extract completeOrderPlacement from temp_test.js
cop_start = temp_code.find("async function completeOrderPlacement")
cop_end = temp_code.find("function updateRiderLiveLocation", cop_start)
if cop_end == -1:
    cop_end = temp_code.find("function parseAndroidUpiPaymentResult", cop_start)

complete_order_placement_code = temp_code[cop_start:cop_end].strip()

# Extract parseAndroidUpiPaymentResult, window.onAndroidUpiPaymentResult, resetUpiPlacingOrderState
upi_start = temp_code.find("function parseAndroidUpiPaymentResult")
upi_end = temp_code.find("async function completeOrderPlacement", upi_start)
upi_code = temp_code[upi_start:upi_end].strip()

# 1. Inject missing functions right before function updateRiderLiveLocation()
target_str = "function updateRiderLiveLocation()"
if target_str in text:
    injected_code = f"""
/* =========================================================
   INJECTED PRODUCTION FIXES: completeOrderPlacement & UPI Callback
   ========================================================= */
{upi_code}

{complete_order_placement_code}

"""
    text = text.replace(target_str, injected_code + target_str)
    print("Successfully injected completeOrderPlacement and UPI callback functions!")
else:
    print("Error: Target function updateRiderLiveLocation not found!")

# 2. Update checkoutLyoAiOrder and placeLyoProposalOrder to enforce COD
text = text.replace(
    "function checkoutLyoAiOrder() {",
    "function checkoutLyoAiOrder() {\n      window.isLyoAiCheckout = true;\n      selectedPaymentMethod = 'Cash on Delivery';"
)

text = text.replace(
    "function placeLyoProposalOrder(proposalId) {",
    "function placeLyoProposalOrder(proposalId) {\n      window.isLyoAiCheckout = true;\n      selectedPaymentMethod = 'Cash on Delivery';"
)

# 3. Update actualPlaceOrder to force COD for Lyo AI orders
actual_place_order_target = "if (selectedPaymentMethod === 'UPI' || selectedPaymentMethod === 'Online')"
actual_place_order_replacement = """if (window.isLyoAiCheckout || order.orderSource === 'AI_ASSISTANT') {
        selectedPaymentMethod = 'Cash on Delivery';
        order.paymentMethod = 'Cash on Delivery';
        order.orderSource = 'AI_ASSISTANT';
      }
      if (selectedPaymentMethod === 'UPI' || selectedPaymentMethod === 'Online')"""

text = text.replace(actual_place_order_target, actual_place_order_replacement, 1)

# Save patched index.html
with open("app/src/main/assets/index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Patching completed successfully!")
