const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'src/main/assets/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== EDAPPADI KADAI AUDIT ===');
console.log('File size:', html.length, 'bytes');

// 1. Check getElementById vs DOM IDs
const getElemRegex = /document\.getElementById\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
let match;
const searchedIds = new Set();
while ((match = getElemRegex.exec(html)) !== null) {
  searchedIds.add(match[1]);
}

const idRegex = /\bid\s*=\s*['"]([^'"]+)['"]/gi;
const existingIds = new Set();
while ((match = idRegex.exec(html)) !== null) {
  existingIds.add(match[1]);
}

const missingIds = [];
searchedIds.forEach(id => {
  if (id.includes('${')) return; // dynamically created template ID
  if (!existingIds.has(id)) {
    missingIds.push(id);
  }
});

console.log('\n[1] getElementById Audit:');
console.log('Found', searchedIds.size, 'searched IDs and', existingIds.size, 'DOM elements with IDs.');
console.log('Missing DOM IDs referenced by getElementById:', missingIds);

// 2. Check for missing event handler functions
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let scriptCode = '';
while ((match = scriptRegex.exec(html)) !== null) {
  if (match[1].trim()) scriptCode += match[1] + '\n;';
}

const windowGlobals = new Set();
const funcDeclRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
while ((match = funcDeclRegex.exec(scriptCode)) !== null) windowGlobals.add(match[1]);
const windowSetRegex = /window\.([a-zA-Z0-9_$]+)\s*=/g;
while ((match = windowSetRegex.exec(scriptCode)) !== null) windowGlobals.add(match[1]);

const constLetSet = new Set();
const varRegex = /\b(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/g;
while ((match = varRegex.exec(scriptCode)) !== null) constLetSet.add(match[2]);

const handlerRegex = /on[a-z]+\s*=\s*"([^"]+)"/gi;
const calls = new Set();
while ((match = handlerRegex.exec(html)) !== null) {
  const code = match[1];
  const callRegex = /([a-zA-Z0-9_$]+)\s*\(/g;
  let cm;
  while ((cm = callRegex.exec(code)) !== null) {
    calls.add(cm[1]);
  }
}

const builtins = new Set([
  'console','log','warn','error','alert','confirm','prompt','parseInt','parseFloat',
  'encodeURIComponent','decodeURIComponent','event','stopPropagation','preventDefault',
  'Math','Date','String','Array','Object','Boolean','JSON','setTimeout','setInterval',
  'clearTimeout','clearInterval','rgba','var','translateY','scale','child','if','focus',
  'remove','slice','replace','click','print','this','fetch','eval','makeDebounced','getElementById','toUpperCase','querySelector'
]);

console.log('\n[2] Inline Event Handlers Audit:');
const missingHandlers = [];
const constOnlyHandlers = [];
calls.forEach(fn => {
  if (builtins.has(fn)) return;
  if (!windowGlobals.has(fn)) {
    if (constLetSet.has(fn)) {
      constOnlyHandlers.push(fn);
    } else {
      missingHandlers.push(fn);
    }
  }
});
console.log('Declared as const/let (needs window assignment for inline HTML):', constOnlyHandlers);
console.log('Missing handler functions completely:', missingHandlers);

// 3. Check for specific functionality checks
console.log('\n[3] Feature presence check:');
console.log('updateLyoDraftCartBar:', scriptCode.includes('function updateLyoDraftCartBar'));
console.log('clearLyoAiCart:', scriptCode.includes('function clearLyoAiCart'));
console.log('checkoutLyoAiOrder:', scriptCode.includes('function checkoutLyoAiOrder'));
console.log('applyQuickOrderResolutions:', scriptCode.includes('function applyQuickOrderResolutions'));
