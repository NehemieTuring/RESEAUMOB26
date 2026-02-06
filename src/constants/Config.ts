/**
 * FleetMan Mobile - Configuration
 * API URLs and app settings with automatic IP detection
 */

// List of possible backend IP addresses to try
// Add your IPs here - the app will automatically use the first one that works
const POSSIBLE_API_HOSTS = [
    'http://localhost:9080',          // Web/localhost
    'http://192.168.170.96:9080',    // WiFi actuel ✅
    'http://192.168.79.96:9080',     // Ancien WiFi
    'http://192.168.86.96:9080',     // Ancien WiFi
    'http://172.16.3.122:9080',      // Réseau alternatif
    'http://10.0.2.2:9080',          // Android Emulator (localhost)
];

// Current active API URL (will be updated after detection)
let activeApiBaseUrl = POSSIBLE_API_HOSTS[0] + '/api';

// Function to test if an API endpoint is reachable
const testApiConnection = async (baseUrl: string): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(`${baseUrl}/api/organizations`, {
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

    for (const host of POSSIBLE_API_HOSTS) {
        console.log(`[Config] Testing ${host}...`);
        const isReachable = await testApiConnection(host);

        if (isReachable) {
            const newUrl = `${host}/api`;
            setApiBaseUrl(newUrl);
            console.log(`[Config] ✅ API found at: ${activeApiBaseUrl}`);
            return activeApiBaseUrl;
        }
    }

    // If no host works, use the first one as fallback
    console.log('[Config] ⚠️ No working API found, using default');
    const fallbackUrl = `${POSSIBLE_API_HOSTS[0]}/api`;
    setApiBaseUrl(fallbackUrl);
    return activeApiBaseUrl;
};

// Get the current API base URL
export const getApiBaseUrl = (): string => {
    return activeApiBaseUrl;
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
    possibleHosts: POSSIBLE_API_HOSTS,

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
