import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Initialize GA4 explicitly when this module is imported
ReactGA.initialize('G-GLNCY3YKGD');

const Analytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Track page views on route change
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }, [location]);

    return null;
};

export default Analytics;
