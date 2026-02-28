import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { API_BASE_URL } from '../config/api';

interface ReferralModalContextType {
  showReferralModal: boolean;
  setShowReferralModal: (show: boolean) => void;
  referralCode: string;
  setReferralCode: (code: string) => void;
  submittingReferral: boolean;
  handleReferralSubmit: () => Promise<void>;
  handleSkipReferral: () => void;
  referralError: string;
  referralSuccess: boolean;
}

const ReferralModalContext = createContext<ReferralModalContextType | null>(null);

export const useReferralModal = () => {
  const context = useContext(ReferralModalContext);
  if (!context) {
    throw new Error('useReferralModal must be used within ReferralModalProvider');
  }
  return context;
};

const API_URL = API_BASE_URL;
const REFERRAL_MODAL_DISMISSED_KEY = 'myrad_referral_modal_dismissed';

export const ReferralModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { ready, authenticated, user } = usePrivy();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [submittingReferral, setSubmittingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  // Helper to get email from various Privy login methods
  const getPrivyEmail = useCallback((privyUser: any): string | null => {
    if (!privyUser) return null;
    if (privyUser.email?.address && privyUser.email.address !== 'user') return privyUser.email.address;
    if (privyUser.google?.email) return privyUser.google.email;
    if (privyUser.twitter?.username) return `@${privyUser.twitter.username}`;
    if (privyUser.apple?.email) return privyUser.apple.email;
    if (privyUser.discord?.email) return privyUser.discord.email;
    const linkedEmail = privyUser.linkedAccounts?.find((acc: any) =>
      acc.type === 'email' || acc.type === 'google_oauth' || acc.type === 'twitter_oauth'
    );
    if (linkedEmail?.email) return linkedEmail.email;
    if (linkedEmail?.username) return `@${linkedEmail.username}`;
    return null;
  }, []);

  // Reset state when user changes (logout/login with different account)
  useEffect(() => {
    const currentUserId = user?.id || null;
    
    if (lastUserIdRef.current !== currentUserId) {
      lastUserIdRef.current = currentUserId;
      
      // Reset for new user
      if (currentUserId && checkedUserId !== currentUserId) {
        setCheckedUserId(null);
        setShowReferralModal(false);
        setReferralError('');
        setReferralCode('');
      }
    }
  }, [user?.id, checkedUserId]);

  // Check if user needs to see referral modal
  useEffect(() => {
    const currentUserId = user?.id;
    
    // Skip if not ready, not authenticated, no user, or already checked THIS user
    if (!ready || !authenticated || !user || checkedUserId === currentUserId) {
      return;
    }

    // Check if already dismissed in this browser for THIS user
    const dismissed = localStorage.getItem(REFERRAL_MODAL_DISMISSED_KEY);
    if (dismissed === user.id) {
      setCheckedUserId(user.id);
      return;
    }

    const checkNewUser = async () => {
      try {
        const email = getPrivyEmail(user);
        const walletAddress = user.wallet?.address || null;
        const twitterUsername = user.twitter?.username || null;
        const token = `privy_${user.id}_${email || 'user'}`;

        const response = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            privyId: user.id,
            email,
            walletAddress,
            twitterUsername
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Show modal if user is new OR hasn't applied a referral code yet
          const shouldShowModal = (data.isNewUser && !data.wasMigrated) || !data.hasReferrer;
          
          if (shouldShowModal) {
            setShowReferralModal(true);
          }
        }
      } catch {
        // Silently fail - don't block user experience for referral modal
      } finally {
        setCheckedUserId(user.id);
      }
    };

    checkNewUser();
  }, [ready, authenticated, user, checkedUserId, getPrivyEmail]);

  const handleReferralSubmit = useCallback(async () => {
    if (!referralCode.trim() || !user) return;

    setSubmittingReferral(true);
    setReferralError('');

    try {
      const email = getPrivyEmail(user);
      const token = `privy_${user.id}_${email || 'user'}`;

      const response = await fetch(`${API_URL}/api/referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ referralCode: referralCode.trim().toUpperCase() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setReferralSuccess(true);
        setReferralCode('');
        localStorage.setItem(REFERRAL_MODAL_DISMISSED_KEY, user.id);
        
        // Dispatch custom event to trigger user data refresh
        window.dispatchEvent(new CustomEvent('referralApplied', { detail: { userId: user.id } }));
        
        setTimeout(() => {
          setShowReferralModal(false);
          setReferralSuccess(false);
        }, 1500);
      } else {
        setReferralError(data.message || 'Failed to apply referral code');
      }
    } catch {
      setReferralError('Network error. Please try again.');
    } finally {
      setSubmittingReferral(false);
    }
  }, [referralCode, user, getPrivyEmail]);

  const handleSkipReferral = useCallback(() => {
    if (user) {
      localStorage.setItem(REFERRAL_MODAL_DISMISSED_KEY, user.id);
    }
    setShowReferralModal(false);
    setReferralCode('');
    setReferralError('');
  }, [user]);

  return (
    <ReferralModalContext.Provider
      value={{
        showReferralModal,
        setShowReferralModal,
        referralCode,
        setReferralCode,
        submittingReferral,
        handleReferralSubmit,
        handleSkipReferral,
        referralError,
        referralSuccess
      }}
    >
      {children}
    </ReferralModalContext.Provider>
  );
};
