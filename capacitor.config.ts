import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stepup.vocaquest',
  appName: 'VocaQuest',
  webDir: 'build_dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // url: 'http://10.0.2.2:5173', // 안드로이드 에뮬레이터용 빌드
    // url: 'http://192.168.0.39:5173', // 실제 기기 연결 시 (Vite 로컬 환경)
    cleartext: true
  },
  ios: {
    dependencyManager: 'cocoapods'
  },
  android: {
    path: 'android'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    AdMob: {
      // Test App IDs - Replace with real IDs for production
      androidAppId: 'ca-app-pub-8125662823247706~1345014713',
      iosAppId: 'ca-app-pub-8125662823247706~6554814026',
    },
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com", "apple.com"],
      iosClientId: "806999527929-h7t4ftee1gdud4d2hqichsgpkkrk2d0v.apps.googleusercontent.com",
      serverClientId: "806999527929-reao0rmomija5d2m738ligum2r2gvu46.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
      scopes: ["profile", "email"]
    }
  }
};

export default config;
// append to config
