import { useEffect } from 'react';

interface GTMScriptProps {
    gtmId: string;
}

const GTMScript = ({ gtmId }: GTMScriptProps) => {
    useEffect(() => {
        if (!gtmId) return;

        // Remove existing tags if ID changes (allows admin to test live without refresh)
        const existingScript = document.getElementById('dynamic-gtm-script');
        if (existingScript) existingScript.remove();

        // Clean up ID string
        const id = gtmId.trim();

        // 1. Initialize dataLayer if it doesn't exist
        window.dataLayer = window.dataLayer || [];
        function gtag(..._args: any[]) {
            // eslint-disable-next-line prefer-rest-params
            window.dataLayer.push(arguments as unknown as Record<string, unknown>);
        }

        // 2. Inject the script element
        const scriptId = 'dynamic-gtm-script';
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;

        // Support both GTM- and G- syntax out of the box
        if (id.startsWith('GTM-')) {
            // Classic Tag Manager Snippet
            script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
            window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
        } else if (id.startsWith('G-')) {
            // Modern GA4 Data Stream Snippet
            script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
            gtag('js', new Date());
            gtag('config', id);
        }

        document.head.appendChild(script);
        console.log(`✅ [Analytics] Injected dynamically for ID: ${id}`);

        return () => {
            const s = document.getElementById('dynamic-gtm-script');
            if (s) s.remove();
        };
    }, [gtmId]);

    return null; // This component doesn't render anything visible
};

export default GTMScript;
