export function registerServiceWorker() {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', async () => {
        try {
            sessionStorage.removeItem('elinks-sw-reloaded');
            const registration = await navigator.serviceWorker.register('/sw.js', {
                updateViaCache: 'none',
            });
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing || sessionStorage.getItem('elinks-sw-reloaded') === '1') return;
                refreshing = true;
                sessionStorage.setItem('elinks-sw-reloaded', '1');
                window.location.reload();
            });
            await registration.update();
        } catch (error) {
            console.warn('Service worker registration failed:', error);
        }
    });
}
