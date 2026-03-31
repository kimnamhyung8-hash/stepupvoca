/**
 * postinstall.js
 * npm install 후 자동으로 실행되어 node_modules의 호환성 문제를 수정합니다.
 */
const fs = require('fs');
const path = require('path');

const fixes = [
    {
        file: path.join(
            __dirname,
            'node_modules/@capacitor-community/in-app-review/android/build.gradle'
        ),
        from: "getDefaultProguardFile('proguard-android.txt')",
        to: "getDefaultProguardFile('proguard-android-optimize.txt')",
        description: '[Fix] in-app-review: proguard-android.txt → proguard-android-optimize.txt',
    },
];

let anyFixed = false;

for (const fix of fixes) {
    if (!fs.existsSync(fix.file)) {
        console.log(`[postinstall] Skip (file not found): ${fix.file}`);
        continue;
    }
    let content = fs.readFileSync(fix.file, 'utf8');
    if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
        fs.writeFileSync(fix.file, content, 'utf8');
        console.log(`[postinstall] ✅ ${fix.description}`);
        anyFixed = true;
    } else if (content.includes(fix.to)) {
        console.log(`[postinstall] ✔ Already patched: ${path.basename(fix.file)}`);
    } else {
        console.log(`[postinstall] ⚠ Pattern not found in: ${path.basename(fix.file)}`);
    }
}

if (!anyFixed) {
    console.log('[postinstall] All patches already applied or skipped.');
}
