"use client"

import { useEffect, useState } from "react";
import { SystemConfig } from "../api/types/discoveryType";

export default function useFetchSystem() {
    const [systems, setSystems] = useState<SystemConfig[] | number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSystems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/discovery");

                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
                }

                const result = await res.json();

                if (result.success && Array.isArray(result.systems)) {
                    setSystems(result.systems);
                } else {
                    throw new Error("Invalid response format");
                }
            } catch {
                setError("Error occurred in discovery; try to reload the page");
            } finally {
                setIsLoading(false);
            }
        };

        loadSystems();
    }, []);

    return { systems, isLoading, error };
}
