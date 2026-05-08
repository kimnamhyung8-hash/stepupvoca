# VocaQuest 트러블슈팅 기록
> 작성일: 2026-05-09 | 담당: AI Agent

---

## 1. iOS 구글 로그인 "FirebaseAuthentication plugin is not implemented on ios" (UNIMPLEMENTED)

### 증상
- 구글 로그인 버튼 클릭 시 즉시 에러 다이얼로그 출력
- 에러 메시지: `"FirebaseAuthentication" plugin is not implemented on ios`
- Capacitor 에러 코드: `UNIMPLEMENTED`

### 진짜 원인
**`Podfile`에서 `:subspecs => ['Lite', 'Google']` 사용 시 CocoaPods 버그 발생**

- CocoaPods가 `CapacitorFirebaseAuthentication`을 앱의 링커 플래그(`OTHER_LDFLAGS`)에 포함시키지 않음
- 결과: `-framework "CapacitorFirebaseAuthentication"` 자체가 앱 바이너리에 링크되지 않음
- `NSClassFromString("FirebaseAuthenticationPlugin")` → `nil` 반환
- Capacitor 브리지가 플러그인을 찾지 못해 UNIMPLEMENTED 에러 발생

### 확인 방법
```bash
# OTHER_LDFLAGS에 CapacitorFirebaseAuthentication이 있는지 확인
grep "CapacitorFirebaseAuthentication" \
  "ios/App/Pods/Target Support Files/Pods-App/Pods-App.debug.xcconfig"
```
- **정상**: `-framework "CapacitorFirebaseAuthentication"` 포함
- **비정상**: 해당 항목 없음 → 이 버그

### 해결책 (Podfile 수정)
```ruby
# ❌ 잘못된 방식 (subspecs 사용 → 링크 누락 버그 발생)
pod 'CapacitorFirebaseAuthentication', :path => '../../node_modules/@capacitor-firebase/authentication', :subspecs => ['Lite', 'Google']

# ✅ 올바른 방식
pod 'CapacitorFirebaseAuthentication', :path => '../../node_modules/@capacitor-firebase/authentication'
pod 'GoogleSignIn', '9.0.0'  # Google 로그인용 명시적 의존성

# post_install 훅에서 Swift 플래그와 검색 경로 직접 주입
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      if target.name == 'CapacitorFirebaseAuthentication'
        existing_flags = config.build_settings['OTHER_SWIFT_FLAGS'] || '$(inherited)'
        unless existing_flags.include?('RGCFA_INCLUDE_GOOGLE')
          config.build_settings['OTHER_SWIFT_FLAGS'] = "#{existing_flags} -DRGCFA_INCLUDE_GOOGLE"
        end
        existing_paths = config.build_settings['FRAMEWORK_SEARCH_PATHS'] || '$(inherited)'
        unless existing_paths.include?('GoogleSignIn')
          config.build_settings['FRAMEWORK_SEARCH_PATHS'] = "#{existing_paths} \"$(PODS_CONFIGURATION_BUILD_DIR)/GoogleSignIn\""
        end
      end
    end
  end
end
```

### 왜 이렇게 되는가
- `CapacitorFirebaseAuthentication.podspec`의 `default_subspec = 'Lite'`
- `Lite` 서브스펙: Google Sign-In 코드를 `#if RGCFA_INCLUDE_GOOGLE` 블록으로 조건부 컴파일
- `Google` 서브스펙: `OTHER_SWIFT_FLAGS`에 `-DRGCFA_INCLUDE_GOOGLE` 추가 + `GoogleSignIn` 의존성
- `:subspecs` 지정 시 CocoaPods가 별도 서브스펙 타겟으로 분리 → 메인 pod이 링크 목록에서 누락되는 버그

---

## 2. Android 구글 로그인 실패

### 증상
- Android에서 구글 로그인 시도 시 실패
- SHA-1 서명 검증 오류

### 원인
- `capacitor.config.ts`의 `skipNativeAuth: false` 설정
- Android native Firebase SDK가 SHA-1 지문 검증을 시도하지만 실패

### 해결책 (LoginScreen.tsx)
```typescript
// Android의 경우 skipNativeAuth: true로 native Firebase SDK 서명 검증 우회
const result = await FirebaseAuthentication.signInWithGoogle(
    { skipNativeAuth: true }  // iOS/Android 모두 적용
);
```

### 참고
- `capacitor.config.ts`의 전역 `skipNativeAuth: false`는 유지
- 각 `signInWithGoogle()` 호출 시 `{ skipNativeAuth: true }` per-call 오버라이드 적용
- `skipNativeAuth: true` = GIDSignIn으로 credential만 획득 후 JS Firebase SDK로 처리

---

## 3. iOS 빌드 파이프라인 (작업 표준 절차)

### 코드 변경 후 iOS 반영 순서
```bash
# 1. 웹 번들 빌드
npm run build

# 2. Capacitor iOS 동기화
npx cap sync ios

# 3. Xcode 빌드 (clean 포함)
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App \
  -configuration Debug \
  -destination 'platform=iOS,id=00008101-00094C493429003A' \
  clean build

# 4. 기기에 직접 설치 (Xcode 디버거 미첨부)
xcrun devicectl device install app \
  --device 00008101-00094C493429003A \
  "/Users/macbook/Library/Developer/Xcode/DerivedData/App-gzalvxllxmuexmepxnnrgltzjarj/Build/Products/Debug-iphoneos/App.app"

# 5. 앱 실행
xcrun devicectl device process launch \
  --device 00008101-00094C493429003A \
  com.stepup.vocaquest
```

### Podfile 변경 시 추가 필요
```bash
cd ios/App && pod install
# → pod install 후 위 3~5 단계 진행
```

---

## 4. iOS Xcode 디버그 세션 "signal 9: Terminated" 현상

### 증상
- Xcode 콘솔에서 `Debug session ended with code 9: Terminated due to signal 9` 출력
- Google 로그인 버튼 클릭 후 발생

### 원인
- **앱 크래시가 아님**
- Google Sign-In이 `ASWebAuthenticationSession` (Safari 기반 OAuth) 를 열 때
  Xcode 디버거가 프로세스 컨텍스트 전환을 감지하고 디버그 세션 강제 종료
- 앱 자체는 계속 실행 중

### 대응
- Xcode 없이 홈 화면에서 앱 직접 실행하여 테스트
- `xcrun devicectl device process launch` 명령으로 Xcode 없이 실행 가능

---

## 5. PWA Service Worker 빌드 실패 (terser timeout)

### 증상
```
Error: Unable to write the service worker file.
'Unexpected early exit... (terser) renderChunk'
```

### 원인
- Node.js v24와 `vite-plugin-pwa`의 `workbox-build` 내부 `terser` 비호환

### 해결책 (vite.config.ts)
```typescript
VitePWA({
  outDir: 'build_dist',
  registerType: 'autoUpdate',
  minify: false,  // ← 이 줄 추가
  // ...
})
```

---

## 6. 핵심 설정 파일 위치

| 파일 | 역할 |
|------|------|
| `capacitor.config.ts` | Capacitor 플러그인 전역 설정 |
| `ios/App/Podfile` | iOS CocoaPods 의존성 |
| `ios/App/App/GoogleService-Info.plist` | Firebase iOS 설정 (CLIENT_ID, REVERSED_CLIENT_ID 등) |
| `ios/App/App/Info.plist` | URL 스킴 설정 (REVERSED_CLIENT_ID 등록 필요) |
| `ios/App/App/AppDelegate.swift` | Firebase 초기화 (`FirebaseApp.configure()`) |
| `src/LoginScreen.tsx` | 로그인 처리 로직 |
| `src/firebase.ts` | Firebase JS SDK 초기화 |

### Info.plist URL 스킴 (Google Sign-In 필수)
```xml
<key>CFBundleURLSchemes</key>
<array>
    <string>com.googleusercontent.apps.806999527929-h7t4ftee1gdud4d2hqichsgpkkrk2d0v</string>
</array>
```

---

## 7. 테스트 기기 정보

| 항목 | 값 |
|------|-----|
| Device ID | `00008101-00094C493429003A` |
| 모델 | iPhone 12 mini (iPhone13,1) |
| OS | iOS 26.4.2 (23E261) |
| Bundle ID | `com.stepup.vocaquest` |

---

## 8. 주의사항

1. **`cap sync ios` 실행 시 Podfile이 덮어써지지 않음** — Podfile은 직접 관리
2. **`cap sync ios`가 pod install을 자동 실행함** — Podfile 변경 후에는 별도 `pod install` 권장
3. **Xcode DerivedData 경로**: `~/Library/Developer/Xcode/DerivedData/App-gzalvxllxmuexmepxnnrgltzjarj/`
4. **`skipNativeAuth` 전역 설정은 `false`로 유지** — per-call에서 `true`로 오버라이드
5. **iOS 26에서 Google Sign-In**: `ASWebAuthenticationSession` 사용으로 Xcode 디버거 세션이 끊기는 것은 정상
