/**
 * FleetMan Mobile - Configuration
 * API URLs and app settings with automatic IP detection
 */

// List of possible backend IP addresses to try
// Add your IPs here - the app will automatically use the first one that works
// Pointe vers FleetMan-DES-Backend (port 8085)
const POSSIBLE_API_BASE_URLS = [
    'http://localhost:8081/api',        // Simulateur Web / iOS (FORCED DEFAULT)
    'https://fleetman.yowyob.com/fleet-api', // Serveur distant
    'http://10.0.2.2:8081/api',        // Émulateur Android
    'http://192.168.254.96:8081/api',  // Téléphone physique sur le même réseau Wi-Fi
];

// Current active API URL (will be updated after detection)
let activeApiBaseUrl = POSSIBLE_API_BASE_URLS[0];

// Function to test if an API endpoint is reachable
const testApiConnection = async (baseUrl: string): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        // Utilise l'endpoint de santé du DES-Backend pour vérifier la connexion
        const response = await fetch(`${baseUrl}/v1/health/public-stats`, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        // Any HTTP response means server is reachable (even 500 errors)
        return true;
    } catch (error) {
        return false;
    }
};

// Function to find and set the working API URL
export const detectApiUrl = async (): Promise<string> => {
    console.log('[Config] Detecting working API URL...');

    const results = await Promise.all(
        POSSIBLE_API_BASE_URLS.map(async (url) => ({
            url,
            ok: await testApiConnection(url),
        }))
    );
    const found = results.find((r) => r.ok);
    if (found) {
        setApiBaseUrl(found.url);
        console.log(`[Config] ✅ API found at: ${activeApiBaseUrl}`);
        return activeApiBaseUrl;
    }

    console.log('[Config] ⚠️ No working API found, using default (mode hors-ligne)');
    setApiBaseUrl(POSSIBLE_API_BASE_URLS[0]);
    return activeApiBaseUrl;
};

// Get the current API base URL
export const getApiBaseUrl = (): string => {
    return activeApiBaseUrl;
};

/** Transforme un chemin local (`/api/v1/files/...`, `uploads/...`) en URL affichable. */
export const resolvePublicMediaUrl = (path?: string | null): string | null => {
    if (!path) {
        return null;
    }
    if (
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('blob:') ||
        path.startsWith('file:') ||
        path.startsWith('data:')
    ) {
        return path;
    }
    const origin = getApiBaseUrl().replace(/\/api\/?$/, '');
    if (path.startsWith('/')) {
        return `${origin}${path}`;
    }
    return `${origin}/api/v1/files/${path}`;
};

// Export for backward compatibility (using let to allow updates)
export let API_BASE_URL = activeApiBaseUrl;

// Helper to update API_BASE_URL dynamically
export const setApiBaseUrl = (url: string) => {
    activeApiBaseUrl = url;
    API_BASE_URL = url; // Also update the exported variable
};

export const Config = {
    // API Endpoints
    apiBaseUrl: activeApiBaseUrl,
    possibleHosts: POSSIBLE_API_BASE_URLS,

    // Auth endpoints (dynamically generated)
    get authEndpoints() {
        return {
            adminLogin: `${activeApiBaseUrl}/auth/admin/login`,
            fleetManagerLogin: `${activeApiBaseUrl}/auth/fleet-manager/login`,
            driverLogin: `${activeApiBaseUrl}/auth/driver/login`,
        };
    },

    // Fleet endpoints (dynamically generated)
    get fleetEndpoints() {
        return {
            vehicles: `${activeApiBaseUrl}/vehicles`,
            drivers: `${activeApiBaseUrl}/drivers`,
            trips: `${activeApiBaseUrl}/trips`,
            geofences: `${activeApiBaseUrl}/geofences`,
            fleets: `${activeApiBaseUrl}/fleets`,
            incidents: `${activeApiBaseUrl}/incidents`,
        };
    },

    // Map settings
    mapConfig: {
        defaultLatitude: 3.848,
        defaultLongitude: 11.502,
        defaultZoom: 13,
    },

    // App settings
    appSettings: {
        appName: 'FleetMan',
        version: '1.0.0',
        refreshInterval: 30000, // 30 seconds
        maxRetries: 3,
        connectionTimeout: 5000, // 5 seconds
    },
};

export default Config;
