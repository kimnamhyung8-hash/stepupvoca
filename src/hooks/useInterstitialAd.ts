import { useEffect, useCallback, useRef } from 'react';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { isAdMobAvailable, isAdFreeActive } from '../admob';

const AD_IDS = {
    android: 'ca-app-pub-6224627094460293/5848334101',
    ios: 'ca-app-pub-6224627094460293/7697704419',
};

const FREQUENCY_LIMIT_MS = 5 * 60 * 1000; // Increased to 5 minutes

export const useInterstitialAd = () => {
    const isLoaded = useRef(false);
    const lastAdShownTime = useRef<number>(0);

    // Platform detection (matching admob.ts logic)
    const getPlatform = () => {
        const cap = (window as any).Capacitor;
        if (cap && cap.getPlatform() === 'ios') return 'ios';
        return 'android';
    };

    /**
     * Preload the interstitial ad
     */
    const preload = useCallback(async () => {
        if (!isAdMobAvailable()) return;

        try {
            const platform = getPlatform() as 'android' | 'ios';
            await AdMob.prepareInterstitial({
                adId: AD_IDS[platform],
                isTesting: true, // Use false for production
            });
            isLoaded.current = true;
            console.log('[AdMob] Interstitial preloaded');
        } catch (err) {
            console.warn('[AdMob] Failed to preload interstitial:', err);
            isLoaded.current = false;
        }
    }, []);

    /**
     * Show the interstitial ad if ready and frequency limit passed
     * Returns true if ad was shown, false otherwise
     */
    const show = useCallback(async (): Promise<boolean> => {
        const now = Date.now();

        // 1. Check if AdMob is available
        if (!isAdMobAvailable() || isAdFreeActive()) return false;

        // 2. Check Frequency Capping
        if (now - lastAdShownTime.current < FREQUENCY_LIMIT_MS) {
            console.log('[AdMob] Too soon for another interstitial. Skipping.');
            return false;
        }

        // 3. Try showing if loaded, else skip (prevent blocking user flow)
        try {
            return new Promise<boolean>(async (resolve) => {
                const dismissListener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
                    dismissListener.remove();
                    lastAdShownTime.current = Date.now();
                    isLoaded.current = false;
                    preload(); // Preload next one
                    resolve(true);
                });

                const failedListener = await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
                    failedListener.remove();
                    isLoaded.current = false;
                    preload();
                    resolve(false);
                });

                await AdMob.showInterstitial();
            });
        } catch (err) {
            console.warn('[AdMob] Show error:', err);
            return false;
        }
    }, [preload]);

    // Initial preload
    useEffect(() => {
        preload();
    }, [preload]);

    return { preload, show };
};
