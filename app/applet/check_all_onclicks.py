import re

with open('app/src/main/assets/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

fn_def_pattern = r'(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\('
defined_fns = set(re.findall(fn_def_pattern, text))

var_def_pattern = r'(?:window\.|var\s+|let\s+|const\s+)([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:function|\()'
defined_vars = set(re.findall(var_def_pattern, text))

all_defined = defined_fns.union(defined_vars)

onclicks = re.findall(r'onclick=[\"\'](.*?)[\"\']', text)
print(f"Total onclick attributes: {len(onclicks)}")

missing_onclick_fns = set()
for oc in onclicks:
    calls = re.findall(r'([a-zA-Z0-9_$]+)\s*\(', oc)
    for fn in calls:
        if fn not in ["if", "for", "while", "switch", "catch", "typeof", "alert", "confirm", "prompt", "parseInt", "parseFloat"]:
            if fn not in all_defined:
                missing_onclick_fns.add(fn)

print("Remaining missing functions from ALL onclick attributes in index.html:")
for mfn in sorted(missing_onclick_fns):
    print(" - ", mfn)
