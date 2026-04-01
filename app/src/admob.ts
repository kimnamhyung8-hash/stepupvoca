import { AD_TEST_MODE } from './constants/appConstants';
import { pauseMainBGM } from './bgm';

// AdMob Unit IDs - K-Account
const AD_IDS = {
    // Real IDs (Google provided)
    banner: {
        android: 'ca-app-pub-6224627094460293/5694958301',
        ios: 'ca-app-pub-6224627094460293/1859783323',
    },
    interstitial: {
        android: 'ca-app-pub-6224627094460293/5848334101',
        ios: 'ca-app-pub-6224627094460293/7697704419',
    },
    rewarded_interstitial: {
        android: 'ca-app-pub-6224627094460293/1390214344',
        ios: 'ca-app-pub-6224627094460293/9324609298',
    },
    // Official Test IDs
    test: {
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
        rewarded_interstitial: 'ca-app-pub-3940256099942544/5354046379'
    }
};

const getAdId = (type: 'banner' | 'interstitial' | 'rewarded_interstitial', platform: 'android' | 'ios') => {
    if (AD_TEST_MODE) {
        return AD_IDS.test[type];
    }
    return AD_IDS[type][platform];
};

let AdMob: any = null;
let isAdMobReady = false;
let isShowingAd = false; // Global flag to prevent multiple ads

import { Capacitor } from '@capacitor/core';

// Platform detection
const isNative = (): boolean => {
    return Capacitor.isNativePlatform();
};

const getPlatform = (): 'android' | 'ios' => {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    return 'android';
};

/**
 * Initialize AdMob - call once on app start
 */
export const initAdMob = async (): Promise<boolean> => {
    if (!isNative()) {
        console.log('[AdMob] Running in web - ads disabled');
        return false;
    }

    try {
        const admobModule = await import('@capacitor-community/admob');
        AdMob = admobModule.AdMob;

        await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: [],
            initializeForTesting: false, // Set to false for production
        });

        isAdMobReady = true;
        console.log('[AdMob] Initialized successfully');
        return true;
    } catch (err) {
        console.warn('[AdMob] Failed to initialize:', err);
        return false;
    }
};

/**
 * Show Banner Ad (bottom of screen)
 */
export const showBannerAd = async (): Promise<void> => {
    if (!isAdMobReady || !AdMob) return;
    
    // Do not show if user is premium or has ad-free pass
    if (localStorage.getItem('vq_premium') === 'true') {
        console.log('[AdMob] User is Premium, securely blocking banner ad.');
        return;
    }
    // [Fix] In TEST MODE, we always show to verify UI layout and integration (unless premium)
    if (!AD_TEST_MODE && isAdFreeActive()) {
        console.log('[AdMob] User is ad-free, skipping banner');
        return;
    }

    try {
        const { BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
        const platform = getPlatform();

        await AdMob.showBanner({
            adId: getAdId('banner', platform),
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: AD_TEST_MODE,
        });
    } catch (err) {
        console.warn('[AdMob] Banner error:', err);
    }
};

/**
 * Hide Banner Ad
 */
export const hideBannerAd = async (): Promise<void> => {
    if (!isAdMobReady || !AdMob) return;
    try {
        await AdMob.hideBanner();
    } catch (err) {
        console.warn('[AdMob] Hide banner error:', err);
    }
};

/**
 * Show Interstitial Ad (full screen, after level test)
 */
export const showInterstitialAd = async (): Promise<boolean> => {
    if (localStorage.getItem('vq_premium') === 'true') {
        console.log('[AdMob] User is Premium, securely blocking interstitial ad.');
        return true;
    }
    if (!isAdMobReady || !AdMob || isShowingAd) return false;

    pauseMainBGM();
    isShowingAd = true;
    try {
        const { InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
        const platform = getPlatform();

        await AdMob.prepareInterstitial({
            adId: getAdId('interstitial', platform),
            isTesting: AD_TEST_MODE,
        });

        return new Promise<boolean>(async (resolve) => {
            const listeners: any[] = [];
            const cleanup = () => {
                listeners.forEach(l => l.remove());
                isShowingAd = false;
            };

            listeners.push(await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
                console.log('[AdMob] Interstitial dismissed');
                cleanup();
                resolve(true);
            }));

            listeners.push(await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (err: any) => {
                console.warn('[AdMob] Interstitial failed to show:', err);
                cleanup();
                resolve(false);
            }));

            listeners.push(await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err: any) => {
                console.warn('[AdMob] Interstitial failed to load:', err);
                cleanup();
                resolve(false);
            }));

            console.log('[AdMob] Showing interstitial...');
            await AdMob.showInterstitial();
        });
    } catch (err) {
        console.warn('[AdMob] Interstitial error:', err);
        isShowingAd = false;
        return false;
    }
};

/**
 * Show Rewarded Interstitial Ad (500 pts reward)
 * Returns true if user completed watching, false otherwise
 */
export const showRewardedInterstitialAd = async (): Promise<boolean> => {
    if (localStorage.getItem('vq_premium') === 'true') {
        console.log('[AdMob] User is Premium, securely blocking rewarded ad.');
        return true; // Pretend watched so no error breaks flow
    }
    if (!isAdMobReady || !AdMob) {
        console.log('[AdMob] Rewarded Interstitial: not ready, simulating reward');
        return true;
    }

    if (isShowingAd) {
        console.log('[AdMob] Ad already showing, skipping');
        return false;
    }

    pauseMainBGM();
    isShowingAd = true;
    try {
        const { RewardInterstitialAdPluginEvents } = await import('@capacitor-community/admob');
        const platform = getPlatform();

        return new Promise<boolean>(async (resolve) => {
            let earnedReward = false;
            const listeners: any[] = [];

            const cleanup = () => {
                listeners.forEach(l => l.remove());
                isShowingAd = false;
            };

            // Listen for reward event
            listeners.push(await AdMob.addListener(RewardInterstitialAdPluginEvents.Rewarded, () => {
                console.log('[AdMob] Rewarded Interstitial: earned reward!');
                earnedReward = true;
            }));

            // Listen for dismiss
            listeners.push(await AdMob.addListener(RewardInterstitialAdPluginEvents.Dismissed, () => {
                console.log('[AdMob] Rewarded Interstitial dismissed');
                cleanup();
                resolve(earnedReward);
            }));

            // Listen for failures
            listeners.push(await AdMob.addListener(RewardInterstitialAdPluginEvents.FailedToShow, (err: any) => {
                console.warn('[AdMob] Rewarded Interstitial failed to show:', err);
                cleanup();
                resolve(false);
            }));

            listeners.push(await AdMob.addListener(RewardInterstitialAdPluginEvents.FailedToLoad, (err: any) => {
                console.warn('[AdMob] Rewarded Interstitial failed to load:', err);
                cleanup();
                resolve(false);
            }));

            try {
                console.log('[AdMob] Preparing rewarded interstitial...');
                await AdMob.prepareRewardInterstitialAd({
                    adId: getAdId('rewarded_interstitial', platform),
                    isTesting: AD_TEST_MODE,
                });

                console.log('[AdMob] Showing rewarded interstitial...');
                await AdMob.showRewardInterstitialAd();
            } catch (err) {
                console.warn('[AdMob] Rewarded Interstitial internal error:', err);
                cleanup();
                resolve(false);
            }
        });
    } catch (err) {
        console.warn('[AdMob] Rewarded Interstitial error:', err);
        isShowingAd = false;
        return false;
    }
};

/**
 * Check if AdMob is available
 */
export const isAdMobAvailable = (): boolean => {
    return isAdMobReady;
};

// --- AD-FREE PASS SYSTEM ---
// Users can get ad-free time by watching rewarded ads or as a streak reward.

export const getAdFreeUntil = (): number => {
    const until = localStorage.getItem('vq_ad_free_until');
    return until ? parseInt(until, 10) : 0;
};

export const isAdFreeActive = (): boolean => {
    // Premium users are always ad-free
    if (localStorage.getItem('vq_premium') === 'true') return true;

    // Check if temporary ad-free pass is active
    const until = getAdFreeUntil();
    return Date.now() < until;
};

export const grantAdFreePass = (hours: number) => {
    const currentUntil = getAdFreeUntil();
    const startTime = Math.max(Date.now(), currentUntil);
    const newUntil = startTime + (hours * 60 * 60 * 1000);
    localStorage.setItem('vq_ad_free_until', newUntil.toString());

    // Dispatch event to update UI (like removing banner padding)
    window.dispatchEvent(new Event('vocaquest_state_changed'));
};

export const showAdIfFree = async (): Promise<boolean> => {
    // 1. Check if user has any form of ad-free status (Premium or Pass)
    if (isAdFreeActive()) {
        console.log('[AdMob] Ad-free active, skipping');
        return true;
    }

    // 2. Check cooldown timer
    const AD_COOLDOWN_MS = 5 * 60 * 1000; 
    const lastAdTimeStr = localStorage.getItem('vq_last_ad_time');
    const lastAdTime = lastAdTimeStr ? parseInt(lastAdTimeStr, 10) : 0;
    const now = Date.now();

    if (now - lastAdTime < AD_COOLDOWN_MS) {
        const remaining = Math.ceil((AD_COOLDOWN_MS - (now - lastAdTime)) / 1000);
        console.log(`[AdMob] Cooldown active. ${remaining}s remaining.`);
        return true;
    }

    // 3. Update timer BEFORE showing to prevent double triggers during animations/transitions
    localStorage.setItem('vq_last_ad_time', Date.now().toString());

    // 4. Show ad
    console.log('[AdMob] Triggering auto-interstitial');
    const result = await showInterstitialAd();

    return result;
};
