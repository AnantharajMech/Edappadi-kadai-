import re

with open('app/src/main/assets/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Onclick check
onclicks = re.findall(r'onclick=[\"\'](.*?)[\"\']', text)
print(f'Total onclick attributes in index.html: {len(onclicks)}')

fn_names = set()
for oc in onclicks:
    m = re.match(r'^\s*([a-zA-Z0-9_$]+)\s*\(', oc)
    if m:
        fn_names.add(m.group(1))

print(f'Unique functions called in onclick: {len(fn_names)}')

missing_onclick_fns = []
for fn in sorted(fn_names):
    pattern = rf'(function\s+{fn}\b|const\s+{fn}\s*=|let\s+{fn}\s*=|var\s+{fn}\s*=|window\.{fn}\s*=)'
    if not re.search(pattern, text):
        missing_onclick_fns.append(fn)

print('Missing functions called in onclick attributes:')
for mfn in missing_onclick_fns:
    print(' - ', mfn)

print('\n' + '='*50 + '\n')

# 2. Check all Lyo AI specific function calls across script tags
# Search for functions starting with lyo, Lyo, sendLyo, updateLyo, changeLyo, addLyo, removeLyo, speakLyo, placeLyo, discardLyo, clearLyo, checkoutLyo, autoGrowLyo
lyo_calls = set(re.findall(r'\b([a-zA-Z0-9_$]*Lyo[a-zA-Z0-9_$]*)\s*\(', text))
print(f'Found {len(lyo_calls)} Lyo function calls:')
missing_lyo_fns = []
for fn in sorted(lyo_calls):
    pattern = rf'(function\s+{fn}\b|const\s+{fn}\s*=|let\s+{fn}\s*=|var\s+{fn}\s*=|window\.{fn}\s*=)'
    found = re.search(pattern, text)
    if not found:
        missing_lyo_fns.append(fn)
        print(f' ❌ {fn} IS MISSING!')
    else:
        print(f' ✓ {fn}')

