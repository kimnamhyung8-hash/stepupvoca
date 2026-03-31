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
      // Test App IDs - Replace with real IDs for production
      androidAppId: 'ca-app-pub-6224627094460293~1345014713',
      iosAppId: 'ca-app-pub-3940256099942544~1458002511',
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    }
  }
};

export default config;
