import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stepup.vocaquest',
  appName: 'VocaQuest',
  webDir: 'build_dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    AdMob: {
      // Test App IDs - Replace with real IDs for production
      androidAppId: 'ca-app-pub-6224627094460293~1345014713',
      iosAppId: 'ca-app-pub-3940256099942544~1458002511',
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '806999527929-reao0rmomija5d2m738ligum2r2gvu46.apps.googleusercontent.com',
      iosClientId: '806999527929-h7t4ftee1gdud4d2hqichsgpkkrk2d0v.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com"],
      iosClientId: "806999527929-h7t4ftee1gdud4d2hqichsgpkkrk2d0v.apps.googleusercontent.com",
      serverClientId: "806999527929-reao0rmomija5d2q0o04279s4e9455d3.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
      scopes: ["profile", "email"]
    }
  }
};

export default config;
// append to config
