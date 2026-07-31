import re

with open('app/src/main/assets/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

fn_def_pattern = r'(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\('
defined_fns = set(re.findall(fn_def_pattern, text))

var_def_pattern = r'(?:window\.|var\s+|let\s+|const\s+)([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:function|\()'
defined_vars = set(re.findall(var_def_pattern, text))

all_defined = defined_fns.union(defined_vars)

print(f"Total defined functions in index.html: {len(all_defined)}")

lyo_refs = set(re.findall(r'\b([a-zA-Z0-9_$]*Lyo[a-zA-Z0-9_$]*)\b', text))

lyo_fn_calls = set()
for ref in lyo_refs:
    if re.search(rf'\b{ref}\s*\(', text) or re.search(rf'onclick=[\"\'].*?\b{ref}\b', text):
        lyo_fn_calls.add(ref)

print(f"Total unique Lyo functions invoked: {len(lyo_fn_calls)}")

missing_lyo_fns = []
for fn in sorted(lyo_fn_calls):
    if fn not in all_defined:
        missing_lyo_fns.append(fn)
        print(f" ❌ MISSING FUNCTION: {fn}")
    else:
        print(f" ✓ DEFINED FUNCTION: {fn}")

print("\n" + "="*50)
print("Checking specific user requested & Lyo AI runtime error items:")

user_terms = [
    "updateLyoDraftCartBar",
    "sendQuickLyoQuery",
    "changeLyoCardItemQty",
    "addLyoCardItemToCart",
    "removeLyoCardItem",
    "placeLyoProposalOrder",
    "addAllLyoProposalToCart",
    "discardLyoProposal",
    "speakLyoMessage",
    "toggleLyoAiLang",
    "clearLyoAiCart",
    "checkoutLyoAiOrder",
    "autoGrowLyoInput",
    "onLyoSendBtnClick"
]

for term in user_terms:
    status = "✓ DEFINED" if term in all_defined else "❌ MISSING"
    print(f"  {term}: {status}")
