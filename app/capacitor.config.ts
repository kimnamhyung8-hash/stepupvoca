import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stepup.vocaquest',
  appName: 'VocaQuest',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      // K-Account Real App IDs
      androidAppId: 'ca-app-pub-6224627094460293~1345014713',
      iosAppId: 'ca-app-pub-6224627094460293~8590112124',
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
