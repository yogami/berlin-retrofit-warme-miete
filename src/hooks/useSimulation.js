import { useState, useEffect } from 'react';

export function useSimulation(params) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        })
            .then(res => {
                if (!res.ok) throw new Error('Simulation failed');
                return res.json();
            })
            .then(result => {
                if (isMounted && result.success) {
                    setData(result.data);
                } else if (isMounted) {
                    setError(result.error);
                }
            })
            .catch(err => {
                console.error('Sim Error:', err);
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [params]);

    return { data, loading, error };
}
