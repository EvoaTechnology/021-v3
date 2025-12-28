import { useAuthStore } from "@/app/store/authStore";
import { useEffect, useState } from "react";

// Mock function to check if user is pro - replace with actual logic when available
const checkIsPro = (user: any) => {
    // Check for pro plan in user metadata or subscription table
    // For now, return false unless specifically set
    return user?.app_metadata?.plan === 'pro' || user?.user_metadata?.plan === 'pro';
};

export const useAccessControl = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [isTrialActive, setIsTrialActive] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);

    useEffect(() => {
        if (!user || !isAuthenticated) {
            setIsTrialActive(false);
            setDaysRemaining(0);
            setIsPro(false);
            setIsRestricted(true); // Default to restricted if not logged in
            return;
        }

        const createdAt = new Date(user.created_at || Date.now());
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Trial is 7 days
        const trialDays = 7;
        const remaining = Math.max(0, trialDays - diffDays);
        const trialActive = diffDays <= trialDays;

        const proStatus = checkIsPro(user);

        setIsTrialActive(trialActive);
        setDaysRemaining(remaining);
        setIsPro(proStatus);

        // Restricted if not pro AND trial expired
        setIsRestricted(!proStatus && !trialActive);

    }, [user, isAuthenticated]);

    return {
        isTrialActive,
        daysRemaining,
        isPro,
        isRestricted,
        // Helper checks
        canCreateChat: (currentChatCount: number) => {
            if (isPro || isTrialActive) return true;
            return currentChatCount < 3;
        },
        canSendMessage: () => {
            if (isPro || isTrialActive) return true;
            return !isRestricted;
        },
        // Permission to access specific investors (controlled in UI, helper here)
        canAccessInvestor: (index: number, categoryIndex: number = 0) => {
            if (isPro || isTrialActive) return true;
            // Unlock first investor (index 0) of every category
            return index === 0;
        },
        canAccessResource: (index: number) => {
            if (isPro || isTrialActive) return true;
            // Unlock first resource (index 0)
            return index === 0;
        }
    };
};
