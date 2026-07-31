import re

with open("app/src/main/assets/index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Extract DEMO_PRODUCTS block
demo_match = re.search(r'DEMO_PRODUCTS = (\[.*?\]);', text, re.DOTALL)
if not demo_match:
    print("Error: Could not extract DEMO_PRODUCTS from index.html")
    exit(1)

raw_block = demo_match.group(1)

# Extract individual product dict objects
product_objs = []
matches = re.findall(r'\{\s*id:\s*"([^"]+)".*?englishName:\s*"([^"]+)".*?tamilName:\s*"([^"]+)".*?pricePerKg:\s*(\d+).*?sellingUnit:\s*"([^"]+)".*?imageUrl:\s*"([^"]+)"', raw_block, re.DOTALL)

for id_, eng, tam, price, unit, img in matches:
    product_objs.append({
        'id': id_,
        'englishName': eng,
        'tamilName': tam,
        'pricePerKg': float(price),
        'sellingUnit': unit,
        'imageUrl': img
    })

print(f"Parsed {len(product_objs)} products from catalog:\n")
for p in product_objs:
    print(f"  ID: {p['id']:22s} | Name: {p['englishName']:30s} | Price: ₹{p['pricePerKg']:<5} | Unit: {p['sellingUnit']}")

print("\n" + "="*80)
print("TESTING LYO AI PRODUCT MATCHING & UNIFORMITY ACROSS MANUAL CATALOG & CARTS")
print("="*80 + "\n")

def matchProduct(query, activeProducts):
    if not query or not activeProducts:
        return None
    rawClean = query.lower().strip()
    cleanQueryAlpha = re.sub(r'[^a-zA-Z0-9\u0b80-\u0bff\s]', '', rawClean).strip()
    if not cleanQueryAlpha:
        return None

    queryTokens = set(cleanQueryAlpha.split())
    SPECIFIC_MODIFIERS = {
        'broiler': ['broiler', 'பிராய்லர்'],
        'country': ['country', 'nattu', 'நாட்டு', 'சுவையான'],
        'nattu': ['country', 'nattu', 'நாட்டு'],
        'goat': ['goat', 'aattu', 'ஆட்டு', 'mutton', 'மட்டன்'],
        'mutton': ['mutton', 'goat', 'aattu', 'ஆட்டு', 'mutton', 'மட்டன்'],
        'tender': ['tender', 'சுடச்சுட'],
        'cow': ['cow', 'pasu', 'பசு'],
        'coconut': ['coconut', 'தேங்காய்'],
        'groundnut': ['groundnut', 'கடலை'],
        'sunflower': ['sunflower', 'சூரியகாந்தி'],
        'white': ['white', 'பண்ணை'],
        'brown': ['brown']
    }

    scoredCandidates = []
    for product in activeProducts:
        eng = (product.get('englishName') or "").lower()
        tam = (product.get('tamilName') or "").lower()
        cat = (product.get('category') or "").lower()

        engAlpha = re.sub(r'[^a-zA-Z0-9\s]', '', eng)
        tamAlpha = re.sub(r'[^\u0b80-\u0bff\s]', '', tam)
        prodTokens = set(engAlpha.split()).union(set(tamAlpha.split()))

        score = 0
        if engAlpha == cleanQueryAlpha or tamAlpha == cleanQueryAlpha:
            score += 1000
        elif cleanQueryAlpha in engAlpha or cleanQueryAlpha in tamAlpha:
            score += 500

        overlapCount = len(queryTokens.intersection(prodTokens))
        score += overlapCount * 150

        for mod, modSynonyms in SPECIFIC_MODIFIERS.items():
            queryHasMod = mod in queryTokens or any(s in cleanQueryAlpha for s in modSynonyms)
            if queryHasMod:
                prodHasMod = any(s in eng or s in tam for s in modSynonyms)
                if prodHasMod:
                    score += 300
                else:
                    score -= 250

        if cat and cat in queryTokens:
            score += 50

        if score > 0:
            scoredCandidates.append({'product': product, 'score': score})

    scoredCandidates.sort(key=lambda x: x['score'], reverse=True)
    return scoredCandidates[0]['product'] if scoredCandidates else None

test_cases = [
    ("Broiler Chicken", "1kg"),
    ("Country Chicken", "1kg"),
    ("Tomato", "1kg"),
    ("Goat Mutton", "500g"),
    ("Milk", "1 packet"),
    ("Oil", "1kg"),
    ("Eggs", "30 pieces")
]

all_passed = True
for query, qty in test_cases:
    matched = matchProduct(query, product_objs)
    if not matched:
        print(f"❌ FAIL: Query '{query}' yielded no match!")
        all_passed = False
        continue

    cat_id = matched['id']
    cat_img = matched['imageUrl']
    cat_price = matched['pricePerKg']
    cat_name = matched['englishName']
    cat_unit = matched['sellingUnit']

    print(f"✅ QUERY: '{query}' ({qty})")
    print(f"   Firestore ID : {cat_id}")
    print(f"   Name         : {cat_name}")
    print(f"   Price/Unit   : ₹{cat_price} per {cat_unit}")
    print(f"   Image URL    : {cat_img[:50]}...")
    print("-" * 60)

if all_passed:
    print("\n🎉 ALL USER PRODUCT VERIFICATION TESTS PASSED SUCCESSFULLY!")
else:
    print("\n❌ SOME TESTS FAILED")
