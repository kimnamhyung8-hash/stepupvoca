/**
 * Google Play / App Store Billing for VocaQuest
 * Uses RevenueCat for cross-platform in-app purchases
 * Falls back gracefully in web browser
 */

let Purchases: any = null;
let isBillingReady = false;

// RevenueCat API Keys - Replace with your real keys
const RC_API_KEYS = {
    android: 'goog_rEkHYKXXMwEFTepFEDnorjwlJPb',
    ios: 'appl_YOUR_REVENUECAT_IOS_KEY',
};

// Product IDs (must match Google Play Console / App Store Connect)
export const PRODUCTS = {
    // Consumables (point packs)
    POINTS_1000: 'vocaquest_points_1000',

    // Subscriptions
    PREMIUM_MONTHLY: 'vocaquest_premium_monthly',
    PREMIUM_YEARLY: 'vocaquest_premium_yearly',

    // Non-consumables
    AD_REMOVE: 'vocaquest_remove_ads',
};

export interface ProductInfo {
    id: string;
    packageId?: string;
    fullId?: string;
    title: string;
    price: string;
    description: string;
}

export interface PurchaseResult {
    success: boolean;
    productId?: string;
    message?: string;
}

// Platform detection
const isNative = (): boolean => {
    return typeof (window as any).Capacitor !== 'undefined';
};

const getPlatform = (): 'android' | 'ios' => {
    const cap = (window as any).Capacitor;
    if (cap && cap.getPlatform() === 'ios') return 'ios';
    return 'android';
};

/**
 * Initialize billing - call once on app start
 */
export const initBilling = async (): Promise<boolean> => {
    if (!isNative()) {
        console.log('[Billing] Running in web - purchases disabled');
        return false;
    }

    try {
        const rcModule = await import('@revenuecat/purchases-capacitor');
        Purchases = rcModule.Purchases;

        const platform = getPlatform();
        const apiKey = RC_API_KEYS[platform];

        console.log(`[Billing] Configuring with ${platform} key...`);

        await Purchases.configure({
            apiKey: apiKey,
        });

        isBillingReady = true;
        console.log('[Billing] Initialized successfully');
        return true;
    } catch (err: any) {
        console.error('[Billing] Failed to initialize:', err);
        // Store the error for later use if needed
        (window as any)._billing_init_error = err;
        return false;
    }
};

/**
 * Get available products with prices
 */
export const getProducts = async (lang: string = 'ko'): Promise<ProductInfo[]> => {
    if (!isBillingReady || !Purchases) {
        // Return mock products for web testing localized by language
        const mockPrices: Record<string, Record<string, string>> = {
            'ko': { p1000: '₩1,100', monthly: '₩3,300', yearly: '₩19,900', ad: '₩14,000' },
            'ja': { p1000: '¥100', monthly: '¥300', yearly: '¥1,900', ad: '¥1,400' },
            'en': { p1000: '$0.99', monthly: '$2.99', yearly: '$19.99', ad: '$9.99' },
            'zh': { p1000: '¥7.00', monthly: '¥21.00', yearly: '¥138.00', ad: '¥98.00' },
            'tw': { p1000: '$33', monthly: '$100', yearly: '$600', ad: '$450' },
            'vi': { p1000: '25.000₫', monthly: '75.000₫', yearly: '450.000₫', ad: '350.000₫' }
        };

        const p = mockPrices[lang] || mockPrices['en'];

        return [
            { id: PRODUCTS.POINTS_1000, title: '1,000 Points', price: p.p1000, description: '1,000 VocaQuest Points' },
            { id: PRODUCTS.PREMIUM_MONTHLY, title: 'Premium Monthly', price: p.monthly, description: 'Ad-free + AI Reports + All Levels' },
            { id: PRODUCTS.PREMIUM_YEARLY, title: 'Premium Yearly', price: p.yearly, description: 'Ad-free + AI Reports + All Levels (Save 44%)' },
            { id: PRODUCTS.AD_REMOVE, title: 'Remove Ads', price: p.ad, description: 'Enjoy ad-free learning for 1 year' },
        ];
    }

    try {
        const offerings = await Purchases.getOfferings();
        const packages = offerings.current?.availablePackages || [];

        return packages.map((pkg: any) => {
            // Find the cleanest store ID (remove the plan suffix if present)
            const cleanId = pkg.product.identifier.split(':')[0];
            return {
                id: cleanId, // Should match PRODUCTS constants
                packageId: pkg.identifier,
                fullId: pkg.product.identifier,
                title: pkg.product.title,
                price: pkg.product.priceString,
                description: pkg.product.description,
            };
        });
    } catch (err) {
        console.warn('[Billing] Get products error:', err);
        return [];
    }
};

/**
 * Purchase a product
 */
export const purchaseProduct = async (productId: string): Promise<PurchaseResult> => {
    if (!isBillingReady || !Purchases) {
        if (!isNative()) {
            console.log('[Billing] Web simulation for:', productId);
            return { success: true, productId, message: 'Web test purchase' };
        }
        const initErr = (window as any)._billing_init_error;
        return {
            success: false,
            message: `로그인/결제 초기화 실패: ${initErr?.message || '구글 플레이 서비스나 네트워크 상태를 확인해 주세요.'}`
        };
    }

    try {
        console.log('[Billing] Starting purchase for:', productId);
        const offerings = await Purchases.getOfferings();

        // Find current or fallback to default
        const offering = offerings.current || offerings.all?.default || offerings.all?.standard;
        if (!offering) {
            return { success: false, message: '상점 정보를 불러올 수 없습니다. RevenueCat 대시보드에서 Offering 설정을 확인해 주세요.' };
        }

        const packages = offering.availablePackages || [];

        // Robust matching: Try exact, then startsWith, then substring
        let targetPkg = packages.find((pkg: any) =>
            pkg.product.identifier === productId ||
            pkg.product.identifier.startsWith(productId) ||
            productId.includes(pkg.product.identifier)
        );

        if (!targetPkg) {
            console.warn('[Billing] Package not found. Available:', packages.map((p: any) => p.product.identifier));
            return {
                success: false,
                message: `상품을 찾을 수 없습니다: ${productId}\n대시보드에서 'Product'가 'Package'에 잘 연결되었는지 확인해 주세요.`
            };
        }

        console.log('[Billing] Found matching set, launching drawer:', targetPkg.product.identifier);
        const result = await Purchases.purchasePackage({ aPackage: targetPkg });

        if (result.customerInfo) {
            console.log('[Billing] Purchase successful:', productId);
            return { success: true, productId };
        }

        return { success: false, message: '결제가 취소되었습니다.' };
    } catch (err: any) {
        if (err.code === 1 || err.readableErrorCode === 'PurchaseCancelledError') {
            return { success: false, message: '구매가 취소되었습니다.' };
        }

        console.error('[Billing] Detailed Error:', JSON.stringify(err));

        // Build user-friendly error string
        const errorType = err.readableErrorCode || 'Error';
        const errorDetail = err.underlyingErrorMessage || err.message || 'Unknown error';

        return {
            success: false,
            message: `결제 중 오류 발생 (${errorType}):\n${errorDetail}\n\n*구글 계정 로그인 상태와 카드를 확인해 주세요.`
        };
    }
};

/**
 * Check if user has active premium subscription
 */
export const isPremiumUser = async (): Promise<boolean> => {
    if (!isBillingReady || !Purchases) {
        return false;
    }

    try {
        const info = await Purchases.getCustomerInfo();
        const entitlements = info.customerInfo?.entitlements?.active;
        return !!entitlements?.premium;
    } catch (err) {
        console.warn('[Billing] Check premium error:', err);
        return false;
    }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
    if (!isBillingReady || !Purchases) {
        console.log('[Billing] Not ready for restore');
        return false;
    }

    try {
        const info = await Purchases.restorePurchases();
        console.log('[Billing] Purchases restored:', info);
        return true;
    } catch (err) {
        console.warn('[Billing] Restore error:', err);
        return false;
    }
};

/**
 * Get points amount for a product
 */
export const getPointsForProduct = (productId: string): number => {
    switch (productId) {
        case PRODUCTS.POINTS_1000: return 1000;
        default: return 0;
    }
};

/**
 * Check if billing is available
 */
export const isBillingAvailable = (): boolean => {
    return isBillingReady;
};
