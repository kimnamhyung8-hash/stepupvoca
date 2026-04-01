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

// [Fix] Add SPM compatibility for @capacitor-community/speech-recognition (Capacitor 8)
const speechPluginDir = path.join(__dirname, 'node_modules/@capacitor-community/speech-recognition');
const packageSwiftPath = path.join(speechPluginDir, 'Package.swift');

if (fs.existsSync(speechPluginDir) && !fs.existsSync(packageSwiftPath)) {
    const packageSwiftContent = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunitySpeechRecognition",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorCommunitySpeechRecognition",
            targets: ["SpeechRecognitionPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "SpeechRecognitionPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin")
    ]
)
`;
    fs.writeFileSync(packageSwiftPath, packageSwiftContent, 'utf8');
    console.log('[postinstall] 📦 Generated Package.swift for @capacitor-community/speech-recognition (SPM bypass)');
}

// [Fix] Inject CAPBridgedPlugin into SpeechRecognition Plugin.swift so it registers properly without Plugin.m
const pluginSwiftPath = path.join(speechPluginDir, 'ios/Plugin/Plugin.swift');
if (fs.existsSync(pluginSwiftPath)) {
    let swiftContent = fs.readFileSync(pluginSwiftPath, 'utf8');
    if (!swiftContent.includes('CAPBridgedPlugin')) {
        swiftContent = swiftContent.replace('public class SpeechRecognition: CAPPlugin {',
`public class SpeechRecognition: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechRecognitionPlugin"
    public let jsName = "SpeechRecognition"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSupportedLanguages", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAllListeners", returnType: CAPPluginReturnPromise)
    ]`);
        fs.writeFileSync(pluginSwiftPath, swiftContent, 'utf8');
        console.log('[postinstall] 🛠 Injected CAPBridgedPlugin into SpeechRecognition Plugin.swift');
        
        // Remove mixed-language ObjC files because Capacitor 8 SPM completely rejects mixed language targets
        const pluginM = path.join(speechPluginDir, 'ios/Plugin/Plugin.m');
        const pluginH = path.join(speechPluginDir, 'ios/Plugin/Plugin.h');
        if (fs.existsSync(pluginM)) fs.unlinkSync(pluginM);
        if (fs.existsSync(pluginH)) fs.unlinkSync(pluginH);
        console.log('[postinstall] 🗑 Removed legacy Plugin.m and Plugin.h for strict SPM compatibility');
    }
}
