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
    }
  }
};

export default config;
