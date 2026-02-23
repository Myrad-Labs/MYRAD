import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Loader2, X, AlertCircle, CheckCircle, PlayCircle, RefreshCw, UtensilsCrossed, Github, Clapperboard } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import QRCode from 'react-qr-code';
// Toast notification type
type ToastType = 'success' | 'error' | 'info';
interface ToastState {
  show: boolean;
  type: ToastType;
  title: string;
  message: string;
}

/**
 * Extract a stable identifier from a Privy user object.
 * Priority:
 *   1. Real email (email login, Google, Apple, Discord, linkedAccounts)
 *   2. Twitter handle as @username (stored in DB email column for reconciliation)
 *   3. null (wallet-only users — reconciled by wallet address on backend)
 */
function getPrivyEmail(user: any): string | null {
  if (!user) return null;

  // 1. Direct email login
  if (user.email?.address) return user.email.address;

  // 2. Google login
  if (user.google?.email) return user.google.email;

  // 3. Twitter login (sometimes has email — rare)
  if (user.twitter?.email) return user.twitter.email;

  // 4. Apple login
  if (user.apple?.email) return user.apple.email;

  // 5. Discord login
  if (user.discord?.email) return user.discord.email;

  // 6. Search through linkedAccounts array for email
  if (Array.isArray(user.linkedAccounts)) {
    for (const account of user.linkedAccounts) {
      if (account.type === 'email' && account.address) return account.address;
      if (account.type === 'google_oauth' && account.email) return account.email;
      if (account.type === 'twitter_oauth' && account.email) return account.email;
      if (account.type === 'apple_oauth' && account.email) return account.email;
      if (account.type === 'discord_oauth' && account.email) return account.email;
      if (account.email) return account.email;
    }
  }

  // 7. Twitter handle as fallback identifier (no email available)
  //    Stored as @username in the DB email column for reconciliation
  if (user.twitter?.username) return `@${user.twitter.username}`;
  if (Array.isArray(user.linkedAccounts)) {
    for (const account of user.linkedAccounts) {
      if (account.type === 'twitter_oauth' && account.username) return `@${account.username}`;
    }
  }

  return null;
}

// Provider configurations
const PROVIDERS = [
  {
    id: 'zomato',
    name: 'Zomato',
    description: 'Order History',
    providerId: import.meta.env.VITE_ZOMATO_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
    points: 10,
    dataType: 'zomato_order_history',
    icon: UtensilsCrossed,
    iconColor: '#ffffff',
    iconBg: '#cb202d', // Zomato Red
    logoUrl: 'https://play-lh.googleusercontent.com/Zqv3j3gWCWrxuHW1VkRKNWso3beRsrwPCj58kG_Ile6iGGSf1YfkPYhKExXKY7_L0lU'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Developer Profile',
    providerId: import.meta.env.VITE_GITHUB_PROVIDER_ID || '',
    color: '#000000', // GitHub Black
    bgGradient: 'linear-gradient(135deg, #24292e 0%, #0d1117 100%)',
    points: 15,
    dataType: 'github_profile',
    icon: Github,
    iconColor: '#ffffff',
    iconBg: '#24292e',
    logoUrl: 'https://play-lh.googleusercontent.com/PCpXdqvUWfCW1mXhH1Y_98yBpgsWxuTSTofy3NGMo9yBTATDyzVkqU580bfSln50bFU'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    description: 'Watch History & Ratings',
    providerId: import.meta.env.VITE_NETFLIX_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #E50914 0%, #B81D24 100%)',
    points: 20,
    dataType: 'netflix_watch_history',
    icon: Clapperboard,
    iconColor: '#ffffff',
    iconBg: '#e50914', // Netflix Red
    logoUrl: 'https://play-lh.googleusercontent.com/TBRwjS_qfJCSj1m7zZB93FnpJM5fSpMA_wUlFDLxWAb45T9RmwBvQd5cWR5viJJOhkI'
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    description: 'Order History',
    providerId: import.meta.env.VITE_UBEREATS_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #06C167 0%, #000000 100%)',
    points: 10,
    dataType: 'ubereats_order_history',
    icon: UtensilsCrossed,
    iconColor: '#ffffff',
    iconBg: '#06C167', // Uber Eats Green
    logoUrl: 'https://play-lh.googleusercontent.com/kDzXydb6ZT4LUj0RiU-GyptnVgCzzk9snN1FVxj2YfqFb4PpRdQRBKzdz4jzUOxAS9-d'
  },
  {
    id: 'strava',
    name: 'Strava',
    description: 'Fitness Activities',
    providerId: import.meta.env.VITE_STRAVA_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #FC4C02 0%, #000000 100%)',
    points: 25,
    dataType: 'strava_fitness',
    icon: PlayCircle, // Using PlayCircle as activity icon
    iconColor: '#ffffff',
    iconBg: '#FC4C02', // Strava Orange
    logoUrl: 'https://play-lh.googleusercontent.com/j-ZV144PlVuTVsLuBzIKyEw9CbFnmWw9ku2NJ1ef0gZJh-iiIN1nrNPmAtvgAteyDqU'
  },
  {
    id: 'blinkit',
    name: 'Blinkit',
    description: 'Last 10 Orders',
    providerId: import.meta.env.VITE_BLINKIT_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #F8CB46 0%, #000000 100%)',
    points: 10,
    dataType: 'blinkit_order_history',
    icon: UtensilsCrossed, // Using same icon as food delivery
    iconColor: '#000000',
    iconBg: '#F8CB46', // Blinkit Yellow
    hidden: true // Hide Blinkit from frontend
  },
  {
    id: 'uber_rides',
    name: 'Uber Rides',
    description: 'Ride History',
    providerId: import.meta.env.VITE_UBER_RIDES_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #000000 0%, #276EF1 100%)',
    points: 15,
    dataType: 'uber_ride_history',
    icon: PlayCircle, // Using as transportation icon
    iconColor: '#ffffff',
    iconBg: '#000000', // Uber Black
    logoUrl: 'https://play-lh.googleusercontent.com/AQtSF5Sl18yp3mQ2tcbOrBLekb7cyP3kyg5BB1uUuc55zfcnbkCDLHFTBwZfYiu1aDI'
  },
  {
    id: 'zepto',
    name: 'Zepto',
    description: 'Order History',
    providerId: import.meta.env.VITE_ZEPTO_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #000000 100%)',
    points: 10,
    dataType: 'zepto_order_history',
    icon: UtensilsCrossed, // Using same icon as grocery delivery
    iconColor: '#ffffff',
    iconBg: '#8B5CF6', // Zepto Purple
    logoUrl: 'https://play-lh.googleusercontent.com/jrtmMFv4qjtgMPQeaQzUFZ3EYBkHd_8OFYl6O1Ngt5Pey52RJAR4u8K4IoPILkJz76a7s5U3DNaY3r3xnl7t8X4'
  }
];


const DashboardPage = () => {
  const { ready, authenticated, user } = usePrivy();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [points, setPoints] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contributing, setContributing] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [verificationStartTime, setVerificationStartTime] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasLoadedData = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'info', title: '', message: '' });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verification progress state
  const [verificationProgress, setVerificationProgress] = useState(false);
  const [verificationProgressText, setVerificationProgressText] = useState('This will take a few seconds...');
  const [verificationProgressComplete, setVerificationProgressComplete] = useState(false);

  // Success modal state
  const [successModal, setSuccessModal] = useState<{ show: boolean; provider: string; points: number }>({
    show: false,
    provider: '',
    points: 0
  });

  // Referral modal state
const [showReferralModal, setShowReferralModal] = useState(false);
const [referralCode, setReferralCode] = useState('');
const [submittingReferral, setSubmittingReferral] = useState(false);


  const showToast = (type: ToastType, title: string, message: string, persistent = false) => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setToast({ show: true, type, title, message });

    // Only auto-dismiss if not persistent
    if (!persistent) {
      toastTimeoutRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
        toastTimeoutRef.current = null;
      }, 5000);
    }
  };

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Helper function to log errors to server (Render logs)
  const logErrorToServer = async (error: any, context: string, additionalData?: any) => {
    try {
      await fetch(`${API_URL}/api/logs/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error?.message || String(error),
          error: error?.toString() || String(error),
          stack: error?.stack || null,
          location: context,
          userAgent: navigator.userAgent,
          userId: user?.id || null,
          timestamp: new Date().toISOString(),
          context: additionalData || null
        })
      }).catch(() => {
        // Silently fail if logging fails (don't break user experience)
      });
    } catch (e) {
      // Silently fail
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/');
    }
  }, [ready, authenticated, navigate]);

  // Handle proof data from Reclaim callback redirect (mobile deep-link recovery)
  // Also listen for hash changes since redirect may happen after initial load
  useEffect(() => {
    const processRedirectProof = async () => {
      const hash = window.location.hash;

      // #region agent log
      fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processRedirect.entry', message: 'processRedirectProof called', data: { hash: hash.substring(0, 100), hasReclaimProof: hash.includes('reclaim_proof='), userId: user?.id, ready, authenticated }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run6', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion

      if (hash.includes('reclaim_proof=')) {
        const encodedProof = hash.split('reclaim_proof=')[1]?.split('&')[0];
        if (encodedProof && user?.id) {
          try {
            const proofData = JSON.parse(atob(encodedProof));
            console.log('📲 Recovered proof from redirect:', proofData);

            // Clear the hash immediately to avoid re-processing
            window.history.replaceState(null, '', window.location.pathname);

            // Helper function to recursively find orders in deeply nested structures
            const findOrdersInObject = (obj: any, depth = 0): any[] => {
              if (depth > 10 || !obj) return [];
              if (Array.isArray(obj)) {
                if (obj.length > 0 && obj[0] && typeof obj[0] === 'object' &&
                  (obj[0].items || obj[0].restaurant || obj[0].price || obj[0].timestamp)) {
                  return obj;
                }
                for (const item of obj) {
                  const found = findOrdersInObject(item, depth + 1);
                  if (found.length > 0) return found;
                }
              }
              if (typeof obj === 'object' && obj !== null) {
                if (obj.items && obj.restaurant) return [obj];
                if (obj.orders && Array.isArray(obj.orders)) return obj.orders;
                for (const key of Object.keys(obj)) {
                  if (key.length > 100 && key.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(key);
                      const found = findOrdersInObject(parsed, depth + 1);
                      if (found.length > 0) return found;
                    } catch (e) {
                      const orderMatches = key.match(/\{"items":[^}]+,"price":[^}]+,"timestamp":[^}]+,"restaurant":[^}]+\}/g);
                      if (orderMatches && orderMatches.length > 0) {
                        try { return orderMatches.map(m => JSON.parse(m)); } catch (e2) { /* ignore */ }
                      }
                    }
                  }
                  const found = findOrdersInObject(obj[key], depth + 1);
                  if (found.length > 0) return found;
                }
              }
              if (typeof obj === 'string' && (obj.startsWith('{') || obj.startsWith('['))) {
                try {
                  const parsed = JSON.parse(obj);
                  return findOrdersInObject(parsed, depth + 1);
                } catch (e) {
                  const orderMatches = obj.match(/\{"items":[^}]+,"price":[^}]+,"timestamp":[^}]+,"restaurant":[^}]+\}/g);
                  if (orderMatches && orderMatches.length > 0) {
                    try { return orderMatches.map(m => JSON.parse(m)); } catch (e2) { /* ignore */ }
                  }
                }
              }
              return [];
            };

            // Process the proof - extract data and submit to backend
            let extractedData: any = {};
            const proof = Array.isArray(proofData) ? proofData[0] : proofData;

            if (proof?.claimData?.context) {
              const context = typeof proof.claimData.context === 'string'
                ? JSON.parse(proof.claimData.context)
                : proof.claimData.context;
              extractedData = context.extractedParameters || {};
            }
            if (proof?.extractedParameterValues) {
              extractedData = { ...extractedData, ...proof.extractedParameterValues };
            }
            if (proof?.publicData) {
              extractedData = { ...extractedData, ...proof.publicData };
            }

            // If no orders found, search the entire proof object
            if (!extractedData.orders || extractedData.orders.length === 0) {
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processRedirect.searchingOrders', message: 'Searching for orders in redirect proof', data: { proofDataKeys: Object.keys(proofData || {}), proofDataStringified: JSON.stringify(proofData).substring(0, 2000) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run5', hypothesisId: 'H' }) }).catch(() => { });
              // #endregion

              const foundOrders = findOrdersInObject(proofData);
              if (foundOrders.length > 0) {
                extractedData.orders = foundOrders;
                console.log('📲 Found orders via deep search:', foundOrders.length);
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processRedirect.foundOrders', message: 'Found orders via deep search', data: { ordersFound: foundOrders.length, firstOrder: foundOrders[0] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run5', hypothesisId: 'H' }) }).catch(() => { });
                // #endregion
              } else {
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processRedirect.noOrdersFound', message: 'No orders found in deep search', data: { proofDataStringified: JSON.stringify(proofData).substring(0, 3000) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run5', hypothesisId: 'H' }) }).catch(() => { });
                // #endregion
              }
            }

            // Determine provider from proof data
            const providerHint = proof?.claimData?.provider || proof?.provider || '';
            const detectedProvider = PROVIDERS.find(p =>
              providerHint.toLowerCase().includes(p.id) ||
              p.providerId === proof?.claimData?.templateId
            ) || PROVIDERS[0];

            const walletAddress = user?.wallet?.address || null;
            const token = `privy_${user.id}_${getPrivyEmail(user) || 'user'}`;

            showToast('info', 'Processing verification...', `Submitting ${detectedProvider.name} data`, true);

            const response = await fetch(`${API_URL}/api/contribute`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                anonymizedData: {
                  ...extractedData,
                  provider: detectedProvider.id,
                  providerName: detectedProvider.name,
                  timestamp: new Date().toISOString(),
                  walletAddress: walletAddress,
                  recoveredFromMobileRedirect: true
                },
                dataType: detectedProvider.dataType,
                reclaimProofId: proof?.identifier || `reclaim-mobile-${Date.now()}`
              })
            });

            const data = await response.json();

            if (data.success) {
              // Reload page to refresh all data (simpler than calling fetchUserData before it's declared)
              showToast('success', `${detectedProvider.name} Verified!`, `+${data.contribution?.pointsAwarded || 500} points earned`);
              setTimeout(() => window.location.reload(), 1500);
            } else {
              showToast('error', 'Verification Failed', data.message || 'Backend error');
            }
          } catch (e) {
            console.error('Failed to process redirect proof:', e);
            showToast('error', 'Verification Error', 'Could not process the verification data');
          }
        }
      } else if (hash.includes('reclaim_error=')) {
        window.history.replaceState(null, '', window.location.pathname);
        showToast('error', 'Verification Error', 'The verification could not be completed. Please try again.');
      }
    };

    // Only process if user is ready
    if (ready && authenticated && user?.id) {
      processRedirectProof();
    }

    // Also listen for hash changes (redirect may happen after page is already loaded)
    const handleHashChange = () => {
      // #region agent log
      fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.hashChange', message: 'Hash changed event fired', data: { newHash: window.location.hash.substring(0, 100), userId: user?.id, ready, authenticated }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run6', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion

      if (ready && authenticated && user?.id) {
        processRedirectProof();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, user?.id, API_URL]);

  // Show onboarding on each login (unless dismissed in current session)
  useEffect(() => {
    console.log('Onboarding effect:', { ready, authenticated, userId: user?.id });
    if (ready && authenticated && user?.id) {
      const dismissedThisSession = sessionStorage.getItem('onboardingDismissed');
      console.log('Dismissed this session:', dismissedThisSession);
      if (!dismissedThisSession) {
        // Small delay to ensure user data is fully loaded
        setTimeout(() => {
          console.log('Showing onboarding');
          setShowOnboarding(true);
        }, 500);
      }
    } else if (!authenticated) {
      // Reset when user logs out and clear session storage
      console.log('User logged out, resetting onboarding');
      setShowOnboarding(false);
      sessionStorage.removeItem('onboardingDismissed');
    }
  }, [ready, authenticated, user?.id]);

  // Handle video playback
  useEffect(() => {
    if (isExpanded && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    } else if (!isExpanded && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isExpanded]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('onboardingDismissed', 'true');
  };



  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || null;

const handleReferralSubmit = async () => {
  if (!referralCode.trim()) {
    showToast('error', 'Invalid Code', 'Please enter a referral code');
    return;
  }

  if (referralCode.length !== 8) {
    showToast('error', 'Invalid Code', 'Referral code must be 8 characters');
    return;
  }

  setSubmittingReferral(true);

  try {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const res = await fetch(`${API_URL}/api/referral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        referral_code: referralCode,
      }),
    });

    const data = await res.json();
    console.log('Referral response:', data);

    if (res.ok) {
      showToast('success', 'Referral Successful!', 'Referral code applied successfully');
      setReferralCode('');
      setShowReferralModal(false);
      // Optionally refresh user data to show updated points
      setTimeout(() => fetchUserData(true), 1000);
    } else {
      // Handle different error messages from backend
      const errorMsg = data.message || 'Failed to apply referral code';
      showToast('error', 'Referral Failed', errorMsg);
    }
  } catch (err) {
    console.error('Referral submission error:', err);
    showToast('error', 'Error', 'An error occurred while processing your referral');
  } finally {
    setSubmittingReferral(false);
  }
};


  // Fetch user data
  const fetchUserData = useCallback(async (showRefresh = false) => {
    if (!user?.id) {
      console.warn('Cannot fetch user data: user not authenticated');
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = `privy_${user.id}_${getPrivyEmail(user) || 'user'}`;
      const email = getPrivyEmail(user);
      const walletAddr = user?.wallet?.address || null;

      // Verify/create user (send email and wallet address in body)
// Verify/create user (send email and wallet address in body)
const verifyRes = await fetch(`${API_URL}/api/auth/verify`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: email,
    walletAddress: walletAddr
  })
});

const verifyData = await verifyRes.json();

// 🔥 SHOW REFERRAL MODAL ONLY FOR GENUINELY NEW USERS
// Migrated users (wasMigrated=true) should NOT see this popup again
if (verifyData.isNewUser && !verifyData.wasMigrated) {
  setShowReferralModal(true);
}


      // Fetch all data in parallel with cache-busting for refresh
      const [profileRes, pointsRes, contribRes] = await Promise.all([
        fetch(`${API_URL}/api/user/profile?_t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: showRefresh ? 'no-cache' : 'default'
        }),
        fetch(`${API_URL}/api/user/points?_t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: showRefresh ? 'no-cache' : 'default'
        }),
        fetch(`${API_URL}/api/user/contributions?_t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: showRefresh ? 'no-cache' : 'default'
        })
      ]);

      const [profileData, pointsData, contribData] = await Promise.all([
        profileRes.json(),
        pointsRes.json(),
        contribRes.json()
      ]);

      setProfile(profileData.profile);
      setPoints(pointsData.points);

      // Merge contributions and referral/points history into a single recent-activity list
      try {
        const pointsHistory = (pointsData?.points?.history) || [];

        // Map referral/points entries into activity-like objects
        const referralActivities = pointsHistory
          .filter((ph: any) => ph && ph.reason === 'referral_bonus')
          .map((ph: any) => ({
            id: ph.id ? `points_${ph.id}` : `points_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
            createdAt: ph.createdAt || ph.created_at || new Date().toISOString(),
            dataType: 'referral',
            providerName: 'Referral',
            pointsAwarded: ph.points,
            reason: ph.reason
          }));

        const contributionActivities = (contribData.contributions || []).map((c: any) => ({ ...c, activityType: 'contribution' }));

        // Merge and sort by createdAt desc
        const merged = [...contributionActivities, ...referralActivities].sort((a: any, b: any) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return tb - ta;
        });

        setContributions(merged);
      } catch (mergeErr) {
        console.error('Error merging referral history into contributions:', mergeErr);
        setContributions(contribData.contributions || []);
      }

    } catch (error) {
      console.error('Error verifying user:', error);
      logErrorToServer(error, 'DashboardPage.fetchUserData');
    } finally {
      if (showRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email?.address, user?.google?.email, user?.twitter?.username, user?.wallet?.address, API_URL]);

  // Fetch on mount
  useEffect(() => {
    if (authenticated && user?.id && !hasLoadedData.current) {
      hasLoadedData.current = true;
      fetchUserData();
    }
  }, [authenticated, user?.id, fetchUserData]);

  // Sync wallet address to backend when it becomes available AFTER initial load.
  // Privy creates embedded wallets asynchronously after login,
  // so user?.wallet?.address may not be available on initial auth/verify call.
  // Skip on first render — fetchUserData already handles the initial sync.
  const hasRunInitialFetch = useRef(false);
  useEffect(() => {
    if (!hasRunInitialFetch.current) {
      // Mark that the first render has passed; fetchUserData handles initial sync
      hasRunInitialFetch.current = true;
      return;
    }
    const walletAddr = user?.wallet?.address;
    if (!walletAddr || !authenticated || !user?.id) return;

    const token = `privy_${user.id}_${getPrivyEmail(user) || 'user'}`;
    fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: getPrivyEmail(user),
        walletAddress: walletAddr
      })
    }).catch(err => console.error('Wallet sync error:', err));
  }, [user?.wallet?.address]); // eslint-disable-line react-hooks/exhaustive-deps


  // Monitor tab visibility changes to handle background verification
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);

      // Log tab visibility changes during verification
      if (activeProvider) {
        fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.visibilityChange', message: 'Tab visibility changed', data: { isVisible: visible, activeProvider, hasVerificationUrl: !!verificationUrl, timeSinceStart: verificationStartTime ? Date.now() - verificationStartTime : null }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });

        // When tab becomes visible again, check if verification completed successfully
        if (visible && verificationStartTime && (Date.now() - verificationStartTime) > 10000) {
          // Tab was hidden for at least 10 seconds - verification might have completed
          // Check if we have captured proof data
          const capturedProof = (window as any).__reclaimCapturedProof;
          if (capturedProof && capturedProof.length > 0) {
            fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.visibilityChange', message: 'Tab visible - found captured proof', data: { activeProvider, hasCapturedProof: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
            // Proof might be available - user can check manually or we can retry
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeProvider, verificationUrl, verificationStartTime]);

  const handleContribute = async (provider: typeof PROVIDERS[0]) => {
    if (!user) return;

    try {
      setContributing(provider.id);
      setActiveProvider(provider.id);
      setVerificationUrl(null);
      setVerificationStartTime(Date.now());

      const { ReclaimProofRequest } = await import('@reclaimprotocol/js-sdk');

      const APP_ID = import.meta.env.VITE_RECLAIM_APP_ID;
      const APP_SECRET = import.meta.env.VITE_RECLAIM_APP_SECRET;

      if (!APP_ID || !APP_SECRET) {
        showToast('error', 'Configuration Error', 'Reclaim configuration incomplete. Check your .env file.');
        setContributing(null);
        return;
      }

      if (!provider.providerId || provider.providerId.trim() === '') {
        showToast('error', 'Configuration Error', `${provider.name} provider ID is not configured. Please set VITE_${provider.id.toUpperCase()}_PROVIDER_ID in your .env file.`);
        setContributing(null);
        return;
      }

      console.log(`🚀 Initializing Reclaim for ${provider.name}...`);

      let reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, provider.providerId, {
        log: true,
        acceptAiProviders: true
      });

      // Set callback URL to backend endpoint for mobile reliability
      // The backend will receive the POST and redirect to dashboard with proof in URL hash
      // CRITICAL: Use absolute URL - Reclaim SDK needs full URL, not relative path
      // The SDK might default to current page origin if callback URL is not properly set
      let callbackUrl: string;
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      const windowOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.myradhq.xyz';

      if (isProduction) {
        // In production, backend is on a different domain (e.g., Render backend URL)
        // Use the backend API URL directly, or if backend serves /api on same domain, use origin
        if (API_URL && API_URL.startsWith('http') && !API_URL.includes('localhost')) {
          // Use provided API_URL if it's a full production URL
          callbackUrl = `${API_URL}/api/reclaim-callback`;
        } else {
          // Backend serves /api on same domain (e.g., Vercel/Netlify proxy)
          // Or use production backend URL - check environment
          const backendUrl = import.meta.env.VITE_BACKEND_URL || windowOrigin;
          callbackUrl = `${backendUrl}/api/reclaim-callback`;
        }
      } else {
        // Development: use API_URL or localhost
        callbackUrl = `${API_URL}/api/reclaim-callback`;
      }

      // Ensure callback URL is absolute and valid
      if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        // If somehow we got a relative URL, make it absolute
        callbackUrl = `${windowOrigin}${callbackUrl.startsWith('/') ? callbackUrl : '/' + callbackUrl}`;
      }

      // Generate a unique session ID for this verification request
      // This ensures multiple concurrent users don't interfere with each other
      const verificationSessionId = `${user?.id || 'anon'}_${provider.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Add session ID to callback URL so backend can associate the proof with this user
      callbackUrl = `${callbackUrl}?sessionId=${encodeURIComponent(verificationSessionId)}`;

      // Store the session ID so we can poll for it later
      (window as any).__currentVerificationSessionId = verificationSessionId;

      // Log callback URL configuration for debugging
      fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.handleContribute', message: 'Setting callback URL with session', data: { callbackUrl, verificationSessionId, apiUrl: API_URL, windowOrigin, isProduction, hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run10', hypothesisId: 'M' }) }).catch(() => { });

      // For development with localhost, the Reclaim mobile app can't access localhost URLs
      // So we'll only set the callback URL if it's a public URL (not localhost)
      // When callback URL is not set, the SDK will use the redirect flow (proof in URL hash)
      const isLocalhost = callbackUrl.includes('localhost') || callbackUrl.includes('127.0.0.1');

      // Store isLocalhost for use in error handler
      (window as any).__reclaimIsLocalhost = isLocalhost;

      if (!isLocalhost) {
        console.log('📱 Setting Reclaim callback URL:', callbackUrl);
        try {
          reclaimProofRequest.setAppCallbackUrl(callbackUrl);
          console.log('✅ Callback URL set successfully with sessionId:', verificationSessionId);
        } catch (callbackError) {
          console.warn('⚠️ Failed to set callback URL, continuing without it:', callbackError);
          // Continue without callback URL - will use redirect flow instead
          // Clear the session ID since we won't be using polling
          (window as any).__currentVerificationSessionId = null;
        }
      } else {
        console.log('ℹ️ Skipping callback URL for localhost (mobile app can\'t access it)');
        console.log('ℹ️ Will use redirect flow instead (proof will be in URL hash)');
        // Clear the session ID since we won't be using polling
        (window as any).__currentVerificationSessionId = null;
      }

      // Get request URL - wrap in try-catch in case SDK validation fails
      let requestUrl: string;
      try {
        requestUrl = await reclaimProofRequest.getRequestUrl();
        setVerificationUrl(requestUrl);
      } catch (urlError: any) {
        console.error('❌ Failed to get request URL:', urlError);
        // If it's a callback URL validation error and we're on localhost, try without callback URL
        if (isLocalhost && (urlError?.message?.includes('callback') || urlError?.message?.includes('url') || urlError?.name === 'ProofSubmissionFailedError')) {
          console.log('🔄 Retrying without callback URL...');
          // Create a new instance without callback URL
          const newReclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, provider.providerId, {
            log: true,
            acceptAiProviders: true
          });
          // Don't set callback URL - use redirect flow
          requestUrl = await newReclaimProofRequest.getRequestUrl();
          setVerificationUrl(requestUrl);
          // Update the reference
          reclaimProofRequest = newReclaimProofRequest;
        } else {
          throw urlError; // Re-throw if it's a different error
        }
      }

      // Intercept console.log to capture proof data from SDK's internal logs
      // Using window global so it persists and can be checked in onError
      (window as any).__reclaimCapturedProof = null;
      let capturedProofData: any = null;
      const originalConsoleLog = console.log;

      console.log = (...args: any[]) => {
        originalConsoleLog.apply(console, args);

        // Check ALL args for any that look like proof data
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          const argStr = typeof arg === 'string' ? arg : '';

          // Debug: Log when we see the key phrases
          if (argStr.includes('not verified') || argStr.includes('identifier')) {
            originalConsoleLog('🔍 DEBUG: Found potential proof log at arg', i, 'type:', typeof arg, 'length:', argStr.length);
          }

          // Method 1: String contains proof JSON
          if (typeof arg === 'string' && arg.includes('identifier') && arg.includes('publicData')) {
            try {
              // Find JSON array with more flexible matching
              const match = arg.match(/\[\s*\{[\s\S]*?"identifier"[\s\S]*?"publicData"[\s\S]*?\}\s*\]/);
              if (match) {
                capturedProofData = JSON.parse(match[0]);
                (window as any).__reclaimCapturedProof = capturedProofData;
                originalConsoleLog('🔄 CAPTURED: Proof data via regex match!');
                break;
              }
            } catch (e) {
              // Try simpler approach
              const startIdx = arg.indexOf('[{"');
              if (startIdx !== -1) {
                const endIdx = arg.lastIndexOf('}]');
                if (endIdx > startIdx) {
                  try {
                    const jsonStr = arg.substring(startIdx, endIdx + 2);
                    capturedProofData = JSON.parse(jsonStr);
                    (window as any).__reclaimCapturedProof = capturedProofData;
                    originalConsoleLog('🔄 CAPTURED: Proof data via substring!');
                    break;
                  } catch (e2) {
                    originalConsoleLog('⚠️ Parse failed:', e2);
                  }
                }
              }
            }
          }

          // Method 2: Direct array/object
          if (Array.isArray(arg) && arg.length > 0 && arg[0]?.identifier) {
            capturedProofData = arg;
            (window as any).__reclaimCapturedProof = capturedProofData;
            originalConsoleLog('🔄 CAPTURED: Direct array!');
            break;
          }

          if (typeof arg === 'object' && arg !== null && arg?.identifier) {
            capturedProofData = [arg];
            (window as any).__reclaimCapturedProof = capturedProofData;
            originalConsoleLog('🔄 CAPTURED: Direct object!');
            break;
          }
        }
      };

      await reclaimProofRequest.startSession({
        onSuccess: async (proofs: any) => {
          // Restore original console.log
          console.log = originalConsoleLog;

          // Show verification progress when proof is received
          setVerificationProgress(true);
          setVerificationProgressComplete(false);
          setVerificationProgressText('This will take a few seconds...');

          // #region agent log - RAW PROOFS RECEIVED
          fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.rawProofs', message: 'RAW proofs received from SDK', data: { provider: provider.id, proofsType: typeof proofs, isArray: Array.isArray(proofs), proofsLength: Array.isArray(proofs) ? proofs.length : null, proofsKeys: proofs && typeof proofs === 'object' ? Object.keys(proofs) : [], rawProofsStringified: JSON.stringify(proofs).substring(0, 3000) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run5', hypothesisId: 'E' }) }).catch(() => { });
          // #endregion

          // CRITICAL: When using callback URL, the SDK returns a string message instead of proof data
          // The actual proof is sent to the callback URL and stored on the backend
          // We need to poll the backend to fetch the stored proof
          if (typeof proofs === 'string') {
            // #region agent log
            fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.callbackMode', message: 'Callback URL mode detected - polling for proof', data: { provider: provider.id, message: proofs }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run7', hypothesisId: 'J' }) }).catch(() => { });
            // #endregion

            // Show verification progress
            setVerificationProgress(true);
            setVerificationProgressComplete(false);
            setVerificationProgressText('Verification complete, validating your contribution...');
            showToast('info', 'Processing...', 'Verification complete, validating your contribution...', true);

            // Poll the backend for the stored proof using THIS user's specific session ID
            let attempts = 0;
            const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
            const pollInterval = 2000;

            // Get the session ID that was set when starting this verification
            const mySessionId = (window as any).__currentVerificationSessionId;

            const pollForProof = async () => {
              attempts++;
              try {
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.pollForProof', message: 'Polling for MY specific proof', data: { attempt: attempts, mySessionId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run10', hypothesisId: 'M' }) }).catch(() => { });
                // #endregion

                // Directly fetch THIS user's proof using their specific session ID
                const proofRes = await fetch(`${API_URL}/api/reclaim-proof/${encodeURIComponent(mySessionId)}`);
                const proofData = await proofRes.json();

                if (proofData.success && proofData.proof) {
                  // #region agent log
                  fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.pollForProof.found', message: 'MY proof found via polling', data: { mySessionId, proofKeys: Object.keys(proofData.proof || {}) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run10', hypothesisId: 'M' }) }).catch(() => { });
                  // #endregion

                  // Clear the session ID
                  (window as any).__currentVerificationSessionId = null;

                  // Process the proof - reuse the redirect processing logic
                  await processPolledProof(proofData.proof, provider);
                  return;
                }

                // Continue polling if not found yet (proof might not have arrived yet)
                if (attempts < maxAttempts) {
                  setTimeout(pollForProof, pollInterval);
                } else {
                  setVerificationUrl(null);
                  setActiveProvider(null);
                  (window as any).__currentVerificationSessionId = null;
                  showToast('error', 'Timeout', 'Could not retrieve verification data. Please try again.');
                }
              } catch (error) {
                console.error('Polling error:', error);
                if (attempts < maxAttempts) {
                  setTimeout(pollForProof, pollInterval);
                } else {
                  setVerificationUrl(null);
                  setActiveProvider(null);
                  (window as any).__currentVerificationSessionId = null;
                  showToast('error', 'Error', 'Failed to retrieve verification data.');
                }
              }
            };

            // Helper function to process polled proof
            const processPolledProof = async (proofData: any, provider: any) => {
              try {
                // #region agent log - Log the FULL proof structure
                const proofStr = JSON.stringify(proofData);
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.entry', message: 'Full proof data received', data: { provider: provider.id, proofType: typeof proofData, isArray: Array.isArray(proofData), proofKeys: Object.keys(proofData || {}), proofLength: proofStr.length, proofSample: proofStr.substring(0, 2000) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run11', hypothesisId: 'N' }) }).catch(() => { });
                // #endregion

                // Helper function to recursively find data in deeply nested structures
                const findDataInObject = (obj: any, depth = 0, providerType?: string): any => {
                  if (depth > 15 || !obj) return null;

                  // For Strava, first check if allTimeActivity exists directly in the object
                  if (providerType === 'strava') {
                    const allTimeActivity = obj.allTimeActivity || obj.all_time_activity;
                    if (Array.isArray(allTimeActivity) && allTimeActivity.length > 0) {
                      const stravaData: any = {
                        allTimeActivity: allTimeActivity,
                        athlete_name: obj.athlete_name || obj.name,
                        athlete_location: obj.athlete_location || obj.location
                      };
                      console.log(`🏃 Found Strava allTimeActivity array directly in object with ${allTimeActivity.length} activities`);
                      return stravaData;
                    }
                  }
                  // For Uber Rides, first check if rides array exists directly in the object
                  if (providerType === 'uber_rides') {
                    const rides = obj.rides || obj.ride_history || obj.trips;
                    if (Array.isArray(rides) && rides.length > 0) {
                      console.log(`🚗 Found Uber Rides array directly in object with ${rides.length} rides`);
                      return { rides };
                    }
                  }

                  // Handle _rawProofString from backend (contains full undecoded proof)
                  if (obj._rawProofString && typeof obj._rawProofString === 'string') {
                    const rawStr = obj._rawProofString;
                    // Extract ALL orders using regex from the raw string
                    const orderMatches = rawStr.match(/\{"items":"[^"]+","price":"[^"]+","timestamp":"[^"]+","restaurant":"[^"]+"\}/g);
                    if (orderMatches && orderMatches.length > 0) {
                      try {
                        const orders = orderMatches.map((m: string) => JSON.parse(m));
                        return { orders };
                      } catch (e) { /* ignore parse errors */ }
                    }
                    // For GitHub - extract username, followers, and contributions
                    if (providerType === 'github') {
                      // Try multiple patterns to find GitHub data
                      const usernameMatch = rawStr.match(/"username":\s*"([^"]+)"/) ||
                        rawStr.match(/"login":\s*"([^"]+)"/) ||
                        rawStr.match(/username["\s]*[:=]["\s]*([^",\s}]+)/);
                      const followersMatch = rawStr.match(/"followers":\s*"?(\d+)"?/) ||
                        rawStr.match(/followers["\s]*[:=]["\s]*(\d+)/);
                      const contribMatch = rawStr.match(/"contributions":\s*"?(\d+)"?/) ||
                        rawStr.match(/"contributionsLastYear":\s*"?(\d+)"?/) ||
                        rawStr.match(/contributions["\s]*[:=]["\s]*(\d+)/);

                      if (usernameMatch || followersMatch || contribMatch) {
                        const githubData = {
                          username: usernameMatch?.[1] || 'unknown',
                          followers: followersMatch?.[1] || '0',
                          contributions: contribMatch?.[1] || '0'
                        };
                        console.log(`🔷 Extracted GitHub data:`, githubData);
                        return githubData;
                      }
                    }
                    // For Netflix - extract full watch history objects with title and date
                    if (providerType === 'netflix') {
                      // Try to extract full watch history objects first (title + date)
                      const fullMatches = rawStr.match(/\{"title":"[^"]+","date":"[^"]+"\}/g);
                      if (fullMatches && fullMatches.length > 0) {
                        try {
                          const watchHistory = fullMatches.map((m: string) => JSON.parse(m));
                          console.log(`📺 Extracted ${watchHistory.length} Netflix titles with dates`);
                          return { watchHistory };
                        } catch (e) { /* try fallback */ }
                      }
                      // Fallback: extract just titles
                      const titleMatches = rawStr.match(/\{"title":"[^"]+"/g);
                      if (titleMatches && titleMatches.length > 0) {
                        try {
                          const watchHistory = titleMatches.map((m: string) => {
                            const titleMatch = m.match(/"title":"([^"]+)"/);
                            return { title: titleMatch?.[1] || 'Unknown', date: null };
                          });
                          console.log(`📺 Extracted ${watchHistory.length} Netflix titles (no dates)`);
                          return { watchHistory };
                        } catch (e) { /* ignore */ }
                      }
                    }
                    // For Uber Eats - extract order history (similar to Zomato format)
                    if (providerType === 'ubereats') {
                      // First, try to find orders array in the raw string (structured JSON)
                      try {
                        const parsed = JSON.parse(rawStr);
                        const orders = parsed.orders || parsed.order_history ||
                          parsed.claimData?.parameters?.orders ||
                          parsed.claimData?.parameters?.order_history;

                        if (Array.isArray(orders) && orders.length > 0) {
                          console.log(`🍔 Extracted Uber Eats orders array with ${orders.length} orders from structured JSON`);
                          return { orders };
                        }
                      } catch (e) {
                        // If parsing fails, continue with regex fallback
                      }

                      // Fallback: Try various Uber Eats order formats using regex
                      const orderMatches = rawStr.match(/\{"items":"[^"]+","price":"[^"]+","timestamp":"[^"]+","restaurant":"[^"]+"\}/g) ||
                        rawStr.match(/\{"restaurant":"[^"]+","items":"[^"]+","total":"[^"]+","date":"[^"]+"\}/g) ||
                        rawStr.match(/\{"restaurant_name":"[^"]+","order_items":"[^"]+","amount":"[^"]+","order_date":"[^"]+"\}/g);
                      if (orderMatches && orderMatches.length > 0) {
                        try {
                          const orders = orderMatches.map((m: string) => JSON.parse(m));
                          console.log(`🍔 Extracted ${orders.length} Uber Eats orders (legacy format)`);
                          return { orders };
                        } catch (e) { /* ignore parse errors */ }
                      }
                    }
                    // For Strava - extract fitness activity data
                    if (providerType === 'strava') {
                      // First, try to find allTimeActivity array in the raw string (structured JSON)
                      try {
                        // Try to parse the entire raw string as JSON to find structured data
                        const parsed = JSON.parse(rawStr);
                        const allTimeActivity = parsed.allTimeActivity || parsed.all_time_activity ||
                          parsed.claimData?.parameters?.allTimeActivity ||
                          parsed.claimData?.parameters?.all_time_activity;

                        if (Array.isArray(allTimeActivity) && allTimeActivity.length > 0) {
                          const stravaData: any = {
                            allTimeActivity: allTimeActivity,
                            athlete_name: parsed.athlete_name || parsed.name || parsed.claimData?.parameters?.athlete_name,
                            athlete_location: parsed.athlete_location || parsed.location || parsed.claimData?.parameters?.athlete_location
                          };
                          console.log(`🏃 Extracted Strava allTimeActivity array with ${allTimeActivity.length} activities`);
                          return stravaData;
                        }
                      } catch (e) {
                        // If parsing fails, continue with regex fallback
                      }

                      // Fallback: Try to extract allTimeActivity array using regex
                      const allTimeActivityMatch = rawStr.match(/"allTimeActivity"\s*:\s*\[([^\]]+)\]/) ||
                        rawStr.match(/"all_time_activity"\s*:\s*\[([^\]]+)\]/);

                      if (allTimeActivityMatch) {
                        try {
                          const activitiesStr = `[${allTimeActivityMatch[1]}]`;
                          const activities = JSON.parse(activitiesStr);
                          if (Array.isArray(activities) && activities.length > 0) {
                            const stravaData: any = {
                              allTimeActivity: activities,
                              athlete_name: rawStr.match(/"athlete_name"\s*:\s*"([^"]+)"/)?.[1] || null,
                              athlete_location: rawStr.match(/"athlete_location"\s*:\s*"([^"]+)"/)?.[1] || null
                            };
                            console.log(`🏃 Extracted Strava allTimeActivity array via regex with ${activities.length} activities`);
                            return stravaData;
                          }
                        } catch (e) {
                          // Continue to legacy regex extraction
                        }
                      }

                      // Legacy fallback: Try to extract fitness stats using regex
                      const runningMatch = rawStr.match(/running[_\s]?total["\s:]+["']?([\d.]+)/i);
                      const cyclingMatch = rawStr.match(/(?:cycling|ride)[_\s]?total["\s:]+["']?([\d.]+)/i);
                      const walkingMatch = rawStr.match(/walking[_\s]?total["\s:]+["']?([\d.]+)/i);
                      const activitiesMatch = rawStr.match(/total[_\s]?activities["\s:]+["']?(\d+)/i);
                      const locationMatch = rawStr.match(/(?:location|city|country|athlete_location)["\s:]+["']?([^"',}]+)/i);
                      const nameMatch = rawStr.match(/(?:name|username|athlete_name)["\s:]+["']?([^"',}]+)/i);

                      if (runningMatch || cyclingMatch || activitiesMatch) {
                        const stravaData = {
                          running_total: runningMatch?.[1] || '0',
                          cycling_total: cyclingMatch?.[1] || '0',
                          walking_total: walkingMatch?.[1] || '0',
                          total_activities: activitiesMatch?.[1] || '0',
                          location: locationMatch?.[1] || null,
                          name: nameMatch?.[1] || null
                        };
                        console.log(`🏃 Extracted Strava fitness data (legacy format):`, stravaData);
                        return stravaData;
                      }
                    }
                    // For Blinkit - extract grocery order history
                    if (providerType === 'blinkit') {
                      // First, try to find orders array in the raw string (structured JSON)
                      try {
                        const parsed = JSON.parse(rawStr);
                        const orders = parsed.orders || parsed.order_history ||
                          parsed.claimData?.parameters?.orders ||
                          parsed.claimData?.parameters?.order_history;

                        if (Array.isArray(orders) && orders.length > 0) {
                          console.log(`🛒 Extracted Blinkit orders array with ${orders.length} orders from structured JSON`);
                          return { orders };
                        }
                      } catch (e) {
                        // If parsing fails, continue with regex fallback
                      }

                      // Fallback: Try various Blinkit order formats using regex
                      const orderMatches = rawStr.match(/\{"items":"[^"]+","(?:price|total)":"[^"]+","(?:timestamp|date)":"[^"]+"\}/g) ||
                        rawStr.match(/\{"order_items":"[^"]+","order_total":"[^"]+","order_date":"[^"]+"\}/g);
                      if (orderMatches && orderMatches.length > 0) {
                        try {
                          const orders = orderMatches.map((m: string) => JSON.parse(m));
                          console.log(`🛒 Extracted ${orders.length} Blinkit orders (legacy format)`);
                          return { orders };
                        } catch (e) { /* ignore parse errors */ }
                      }
                    }
                    // For Zepto - extract grocery order history
                    if (providerType === 'zepto') {
                      // First, try to find orders array in the raw string (structured JSON)
                      try {
                        const parsed = JSON.parse(rawStr);
                        const orders = parsed.orders || parsed.order_history ||
                          parsed.claimData?.parameters?.orders ||
                          parsed.claimData?.parameters?.order_history;

                        if (Array.isArray(orders) && orders.length > 0) {
                          console.log(`🛍️ Extracted Zepto orders array with ${orders.length} orders from structured JSON`);
                          return { orders };
                        }
                      } catch (e) {
                        // If parsing fails, continue with regex fallback
                      }

                      // Fallback: Try various Zepto order formats using regex
                      const orderMatches = rawStr.match(/\{"items":"[^"]+","(?:price|total|amount)":"[^"]+","(?:timestamp|date)":"[^"]+"\}/g) ||
                        rawStr.match(/\{"product":"[^"]+","quantity":"[^"]+","price":"[^"]+"\}/g);
                      if (orderMatches && orderMatches.length > 0) {
                        try {
                          const orders = orderMatches.map((m: string) => JSON.parse(m));
                          console.log(`🛍️ Extracted ${orders.length} Zepto orders (legacy format)`);
                          return { orders };
                        } catch (e) { /* ignore parse errors */ }
                      }
                    }
                    // For Uber Rides - extract ride history
                    if (providerType === 'uber_rides') {
                      // First, try to find rides array in the raw string (structured JSON)
                      try {
                        // Try to parse the entire raw string as JSON to find structured data
                        const parsed = JSON.parse(rawStr);
                        const rides = parsed.rides || parsed.ride_history || parsed.trips ||
                          parsed.claimData?.parameters?.rides ||
                          parsed.claimData?.parameters?.ride_history ||
                          parsed.claimData?.parameters?.trips;

                        if (Array.isArray(rides) && rides.length > 0) {
                          console.log(`🚗 Extracted Uber Rides array with ${rides.length} rides from structured JSON`);
                          return { rides };
                        }
                      } catch (e) {
                        // If parsing fails, continue with regex fallback
                      }

                      // Fallback: Try to extract rides array using regex
                      const ridesArrayMatch = rawStr.match(/"rides"\s*:\s*\[([^\]]+)\]/) ||
                        rawStr.match(/"ride_history"\s*:\s*\[([^\]]+)\]/) ||
                        rawStr.match(/"trips"\s*:\s*\[([^\]]+)\]/);

                      if (ridesArrayMatch) {
                        try {
                          const ridesStr = `[${ridesArrayMatch[1]}]`;
                          const rides = JSON.parse(ridesStr);
                          if (Array.isArray(rides) && rides.length > 0) {
                            console.log(`🚗 Extracted Uber Rides array via regex with ${rides.length} rides`);
                            return { rides };
                          }
                        } catch (e) {
                          // Continue to legacy regex extraction
                        }
                      }

                      // Legacy fallback: Try various Uber ride formats using regex
                      const rideMatches = rawStr.match(/\{"(?:fare|total)":"[^"]+","(?:timestamp|date|pickup_time)":"[^"]+"\}/g) ||
                        rawStr.match(/\{"trip_id":"[^"]+","fare":"[^"]+"\}/g) ||
                        rawStr.match(/\{"fare":"[^"]+","date":"[^"]+","pickup":"[^"]+","dropoff":"[^"]+"\}/g);
                      if (rideMatches && rideMatches.length > 0) {
                        try {
                          const rides = rideMatches.map((m: string) => JSON.parse(m));
                          console.log(`🚗 Extracted ${rides.length} Uber rides (legacy format)`);
                          return { rides };
                        } catch (e) { /* ignore parse errors */ }
                      }
                    }
                  }

                  // Try to parse JSON strings
                  if (typeof obj === 'string') {
                    if (obj.startsWith('{') || obj.startsWith('[')) {
                      try {
                        const parsed = JSON.parse(obj);
                        return findDataInObject(parsed, depth + 1, providerType);
                      } catch (e) { /* not JSON */ }
                    }
                    // For GitHub: extract from paramValues in the string
                    if (providerType === 'github' && obj.includes('paramValues')) {
                      const usernameMatch = obj.match(/"username":\s*"([^"]+)"/) ||
                        obj.match(/"login":\s*"([^"]+)"/) ||
                        obj.match(/username["\s]*[:=]["\s]*([^",\s}]+)/);
                      const followersMatch = obj.match(/"followers":\s*"?(\d+)"?/) ||
                        obj.match(/followers["\s]*[:=]["\s]*(\d+)/);
                      const contribMatch = obj.match(/"contributions":\s*"?(\d+)"?/) ||
                        obj.match(/"contributionsLastYear":\s*"?(\d+)"?/) ||
                        obj.match(/contributions["\s]*[:=]["\s]*(\d+)/);
                      if (usernameMatch || followersMatch || contribMatch) {
                        const githubData = {
                          username: usernameMatch?.[1] || 'unknown',
                          followers: followersMatch?.[1] || '0',
                          contributions: contribMatch?.[1] || '0'
                        };
                        console.log(`🔷 Extracted GitHub data from paramValues:`, githubData);
                        return githubData;
                      }
                    }
                    return null;
                  }

                  if (typeof obj !== 'object' || obj === null) return null;

                  // Check if this object contains the data we need
                  if (Array.isArray(obj)) {
                    // Check for Zomato orders array
                    if (obj.length > 0 && obj[0] && (obj[0].items || obj[0].restaurant || obj[0].price)) {
                      return { orders: obj };
                    }
                    // Check for Netflix titles array
                    if (obj.length > 0 && obj[0] && (obj[0].title || obj[0].showTitle || obj[0].name)) {
                      return { titles: obj };
                    }
                    // Recurse into array items
                    for (const item of obj) {
                      const found = findDataInObject(item, depth + 1, providerType);
                      if (found) return found;
                    }
                  } else {
                    // Check for paramValues (common in Reclaim proofs)
                    if (obj.paramValues) {
                      const pv = typeof obj.paramValues === 'string' ? JSON.parse(obj.paramValues) : obj.paramValues;
                      // Zepto-specific: grandTotalAmount, itemQuantityCount, productsNamesAndCounts
                      if (providerType === 'zepto' && (pv.grandTotalAmount !== undefined || pv.itemQuantityCount !== undefined || pv.productsNamesAndCounts !== undefined)) {
                        console.log(`🛒 Found Zepto paramValues:`, { grandTotalAmount: pv.grandTotalAmount, itemQuantityCount: pv.itemQuantityCount });
                        return {
                          grandTotalAmount: pv.grandTotalAmount,
                          itemQuantityCount: pv.itemQuantityCount,
                          productsNamesAndCounts: pv.productsNamesAndCounts
                        };
                      }
                      // Blinkit-specific: similar structure
                      if (providerType === 'blinkit' && (pv.grandTotalAmount !== undefined || pv.itemQuantityCount !== undefined || pv.productsNamesAndCounts !== undefined)) {
                        console.log(`🛒 Found Blinkit paramValues:`, { grandTotalAmount: pv.grandTotalAmount, itemQuantityCount: pv.itemQuantityCount });
                        return {
                          grandTotalAmount: pv.grandTotalAmount,
                          itemQuantityCount: pv.itemQuantityCount,
                          productsNamesAndCounts: pv.productsNamesAndCounts
                        };
                      }
                      if (pv.username || pv.login || pv.followers !== undefined) {
                        return {
                          username: pv.username || pv.login,
                          followers: pv.followers || '0',
                          contributions: pv.contributions || pv.contributionsLastYear || '0'
                        };
                      }
                    }
                    // Check for Zepto data directly (grandTotalAmount, itemQuantityCount, productsNamesAndCounts)
                    if (providerType === 'zepto' && (obj.grandTotalAmount !== undefined || obj.itemQuantityCount !== undefined || obj.productsNamesAndCounts !== undefined)) {
                      console.log(`🛒 Found Zepto data directly:`, { grandTotalAmount: obj.grandTotalAmount, itemQuantityCount: obj.itemQuantityCount });
                      return {
                        grandTotalAmount: obj.grandTotalAmount,
                        itemQuantityCount: obj.itemQuantityCount,
                        productsNamesAndCounts: obj.productsNamesAndCounts
                      };
                    }
                    // Check for Blinkit data directly
                    if (providerType === 'blinkit' && (obj.grandTotalAmount !== undefined || obj.itemQuantityCount !== undefined || obj.productsNamesAndCounts !== undefined)) {
                      console.log(`🛒 Found Blinkit data directly:`, { grandTotalAmount: obj.grandTotalAmount, itemQuantityCount: obj.itemQuantityCount });
                      return {
                        grandTotalAmount: obj.grandTotalAmount,
                        itemQuantityCount: obj.itemQuantityCount,
                        productsNamesAndCounts: obj.productsNamesAndCounts
                      };
                    }
                    // Check for GitHub data directly
                    if (obj.username || obj.login || obj.followers !== undefined || obj.contributions !== undefined) {
                      return {
                        username: obj.username || obj.login,
                        followers: obj.followers || '0',
                        contributions: obj.contributions || obj.contributionsLastYear || '0',
                        created_at: obj.created_at || obj.createdAt
                      };
                    }
                    // Check for nested orders
                    if (obj.orders && Array.isArray(obj.orders)) return { orders: obj.orders };
                    // Check for nested titles
                    if (obj.titles && Array.isArray(obj.titles)) return { titles: obj.titles };
                    if (obj.watchHistory && Array.isArray(obj.watchHistory)) return { titles: obj.watchHistory };
                    // Check for Strava allTimeActivity
                    if (providerType === 'strava') {
                      const allTimeActivity = obj.allTimeActivity || obj.all_time_activity;
                      if (Array.isArray(allTimeActivity) && allTimeActivity.length > 0) {
                        const stravaData: any = {
                          allTimeActivity: allTimeActivity,
                          athlete_name: obj.athlete_name || obj.name,
                          athlete_location: obj.athlete_location || obj.location
                        };
                        console.log(`🏃 Found Strava allTimeActivity in nested object with ${allTimeActivity.length} activities`);
                        return stravaData;
                      }
                    }
                    // Check for Uber Rides
                    if (providerType === 'uber_rides') {
                      const rides = obj.rides || obj.ride_history || obj.trips;
                      if (Array.isArray(rides) && rides.length > 0) {
                        console.log(`🚗 Found Uber Rides in nested object with ${rides.length} rides`);
                        return { rides };
                      }
                    }

                    // Recurse into object keys - check ALL keys for data
                    const allKeys = Object.keys(obj);
                    let collectedOrders: any[] = [];
                    let collectedTitles: any[] = [];

                    for (const key of allKeys) {
                      // Check if this key contains Zomato order data (items, price, restaurant pattern)
                      if (key.includes('"items"') && key.includes('"price"') && key.includes('"restaurant"')) {
                        const orderMatches = key.match(/\{"items":"[^"]+","price":"[^"]+","timestamp":"[^"]+","restaurant":"[^"]+"\}/g);
                        if (orderMatches && orderMatches.length > 0) {
                          try {
                            const parsedOrders = orderMatches.map((m: string) => JSON.parse(m));
                            collectedOrders.push(...parsedOrders);
                          } catch (e2) { /* ignore parse errors */ }
                        }
                      }

                      // Check if this key contains Netflix title data
                      if (key.includes('"title"') && providerType === 'netflix') {
                        // Try full objects first
                        const fullMatches = key.match(/\{"title":"[^"]+","date":"[^"]+"\}/g);
                        if (fullMatches && fullMatches.length > 0) {
                          try {
                            const parsed = fullMatches.map((m: string) => JSON.parse(m));
                            collectedTitles.push(...parsed);
                          } catch (e2) { /* try fallback */ }
                        }
                        // Fallback to just titles
                        if (collectedTitles.length === 0) {
                          const titleMatches = key.match(/\{"title":"[^"]+"/g);
                          if (titleMatches && titleMatches.length > 0) {
                            try {
                              const parsedTitles = titleMatches.map((m: string) => {
                                const titleMatch = m.match(/"title":"([^"]+)"/);
                                return { title: titleMatch?.[1] || 'Unknown', date: null };
                              });
                              collectedTitles.push(...parsedTitles);
                            } catch (e2) { /* ignore */ }
                          }
                        }
                      }

                      // Handle malformed keys that are actually JSON strings
                      if (key.length > 50 && (key.startsWith('{') || key.startsWith('['))) {
                        try {
                          const parsed = JSON.parse(key);
                          const found = findDataInObject(parsed, depth + 1, providerType);
                          if (found) {
                            if (found.orders) collectedOrders.push(...found.orders);
                            else if (found.watchHistory) collectedTitles.push(...found.watchHistory);
                            else if (found.titles) collectedTitles.push(...found.titles);
                            else return found;
                          }
                        } catch (e) {
                          // Try regex extraction for Zomato orders from malformed JSON key
                          const orderMatches = key.match(/\{"items":"[^"]+","price":"[^"]+","timestamp":"[^"]+","restaurant":"[^"]+"\}/g);
                          if (orderMatches && orderMatches.length > 0) {
                            try {
                              const parsedOrders = orderMatches.map((m: string) => JSON.parse(m));
                              collectedOrders.push(...parsedOrders);
                            } catch (e2) { /* ignore */ }
                          }
                          // Try regex extraction for Netflix titles from malformed key
                          if (providerType === 'netflix' && key.includes('"title"')) {
                            // Try full objects first
                            const fullMatches = key.match(/\{"title":"[^"]+","date":"[^"]+"\}/g);
                            if (fullMatches && fullMatches.length > 0) {
                              try {
                                const parsed = fullMatches.map((m: string) => JSON.parse(m));
                                collectedTitles.push(...parsed);
                              } catch (e2) { /* try fallback */ }
                            }
                            // Fallback to just titles
                            if (collectedTitles.length === 0) {
                              const titleMatches = key.match(/\{"title":"[^"]+"/g);
                              if (titleMatches && titleMatches.length > 0) {
                                try {
                                  const parsedTitles = titleMatches.map((m: string) => {
                                    const titleMatch = m.match(/"title":"([^"]+)"/);
                                    return { title: titleMatch?.[1] || 'Unknown', date: null };
                                  });
                                  collectedTitles.push(...parsedTitles);
                                } catch (e2) { /* ignore */ }
                              }
                            }
                          }
                          // Try regex extraction for GitHub from malformed key
                          if (providerType === 'github') {
                            const usernameMatch = key.match(/"username":\s*"([^"]+)"/) ||
                              key.match(/"login":\s*"([^"]+)"/) ||
                              key.match(/username["\s]*[:=]["\s]*([^",\s}]+)/);
                            const followersMatch = key.match(/"followers":\s*"?(\d+)"?/) ||
                              key.match(/followers["\s]*[:=]["\s]*(\d+)/);
                            const contribMatch = key.match(/"contributions":\s*"?(\d+)"?/) ||
                              key.match(/"contributionsLastYear":\s*"?(\d+)"?/) ||
                              key.match(/contributions["\s]*[:=]["\s]*(\d+)/);
                            if (usernameMatch || followersMatch || contribMatch) {
                              const githubData = {
                                username: usernameMatch?.[1] || 'unknown',
                                followers: followersMatch?.[1] || '0',
                                contributions: contribMatch?.[1] || '0'
                              };
                              console.log(`🔷 Extracted GitHub data from key:`, githubData);
                              return githubData;
                            }
                          }
                        }
                      }
                      const found = findDataInObject(obj[key], depth + 1, providerType);
                      if (found) {
                        if (found.orders) collectedOrders.push(...found.orders);
                        else if (found.watchHistory) collectedTitles.push(...found.watchHistory);
                        else if (found.titles) collectedTitles.push(...found.titles);
                        else return found;
                      }
                    }

                    // Return collected data if any were found
                    if (collectedOrders.length > 0) {
                      return { orders: collectedOrders };
                    }
                    if (collectedTitles.length > 0) {
                      return { watchHistory: collectedTitles };
                    }
                  }
                  return null;
                };

                const proof = Array.isArray(proofData) ? proofData[0] : proofData;
                let extractedData: any = {};

                // Try standard extraction paths first
                if (proof?.claimData?.context) {
                  const context = typeof proof.claimData.context === 'string'
                    ? JSON.parse(proof.claimData.context)
                    : proof.claimData.context;
                  extractedData = context.extractedParameters || {};
                }
                if (proof?.extractedParameterValues) {
                  extractedData = { ...extractedData, ...proof.extractedParameterValues };
                }
                if (proof?.publicData) {
                  extractedData = { ...extractedData, ...proof.publicData };
                }
                // For Strava, also check claimData.parameters for allTimeActivity
                if (provider.id === 'strava' && proof?.claimData?.parameters) {
                  const params = typeof proof.claimData.parameters === 'string'
                    ? JSON.parse(proof.claimData.parameters)
                    : proof.claimData.parameters;
                  if (params.allTimeActivity || params.all_time_activity) {
                    extractedData = {
                      ...extractedData,
                      allTimeActivity: params.allTimeActivity || params.all_time_activity,
                      athlete_name: params.athlete_name || extractedData.athlete_name,
                      athlete_location: params.athlete_location || extractedData.athlete_location
                    };
                    console.log(`🏃 Found Strava allTimeActivity in claimData.parameters with ${extractedData.allTimeActivity?.length || 0} activities`);
                  }
                }
                // For Uber Rides, also check claimData.parameters for rides
                if (provider.id === 'uber_rides' && proof?.claimData?.parameters) {
                  const params = typeof proof.claimData.parameters === 'string'
                    ? JSON.parse(proof.claimData.parameters)
                    : proof.claimData.parameters;
                  if (params.rides || params.ride_history || params.trips) {
                    extractedData = {
                      ...extractedData,
                      rides: params.rides || params.ride_history || params.trips
                    };
                    console.log(`🚗 Found Uber Rides data in claimData.parameters with ${extractedData.rides?.length || 0} rides`);
                  }
                }
                // For Zepto/Blinkit, check claimData.parameters for paramValues
                if ((provider.id === 'zepto' || provider.id === 'blinkit') && proof?.claimData?.parameters) {
                  try {
                    const params = typeof proof.claimData.parameters === 'string'
                      ? JSON.parse(proof.claimData.parameters)
                      : proof.claimData.parameters;
                    if (params.paramValues) {
                      const pv = typeof params.paramValues === 'string' ? JSON.parse(params.paramValues) : params.paramValues;
                      if (pv.grandTotalAmount !== undefined || pv.itemQuantityCount !== undefined) {
                        extractedData = {
                          ...extractedData,
                          grandTotalAmount: pv.grandTotalAmount,
                          itemQuantityCount: pv.itemQuantityCount,
                          productsNamesAndCounts: pv.productsNamesAndCounts
                        };
                        console.log(`🛒 Found ${provider.id} data in claimData.parameters.paramValues:`, { grandTotalAmount: pv.grandTotalAmount, itemQuantityCount: pv.itemQuantityCount });
                      }
                    }
                  } catch (e) { /* ignore parse errors */ }
                }
                // Handle _rawProofString (callback mode) - parse and extract paramValues for Zepto/Blinkit
                if ((provider.id === 'zepto' || provider.id === 'blinkit') && proof?._rawProofString) {
                  try {
                    const rawProof = typeof proof._rawProofString === 'string'
                      ? JSON.parse(proof._rawProofString)
                      : proof._rawProofString;
                    if (rawProof?.claimData?.parameters) {
                      const params = typeof rawProof.claimData.parameters === 'string'
                        ? JSON.parse(rawProof.claimData.parameters)
                        : rawProof.claimData.parameters;
                      if (params.paramValues) {
                        const pv = typeof params.paramValues === 'string' ? JSON.parse(params.paramValues) : params.paramValues;
                        if (pv.grandTotalAmount !== undefined || pv.itemQuantityCount !== undefined) {
                          extractedData = {
                            ...extractedData,
                            grandTotalAmount: pv.grandTotalAmount,
                            itemQuantityCount: pv.itemQuantityCount,
                            productsNamesAndCounts: pv.productsNamesAndCounts
                          };
                          console.log(`🛒 Found ${provider.id} data in _rawProofString.paramValues:`, { grandTotalAmount: pv.grandTotalAmount, itemQuantityCount: pv.itemQuantityCount });
                        }
                      }
                    }
                  } catch (e) {
                    console.log(`⚠️ Error parsing _rawProofString for ${provider.id}:`, e);
                  }
                }

                // Deep search for provider-specific data if not found
                const needsDeepSearch =
                  (provider.id === 'zomato' && (!extractedData.orders || extractedData.orders.length === 0)) ||
                  (provider.id === 'github' && !extractedData.username && !extractedData.login && !extractedData.followers) ||
                  (provider.id === 'netflix' && (!extractedData.titles || extractedData.titles.length === 0)) ||
                  (provider.id === 'strava' && (!extractedData.allTimeActivity && !extractedData.all_time_activity && !extractedData.running_total && !extractedData.total_activities)) ||
                  (provider.id === 'uber_rides' && (!extractedData.rides || extractedData.rides.length === 0)) ||
                  (provider.id === 'ubereats' && (!extractedData.orders || extractedData.orders.length === 0)) ||
                  (provider.id === 'blinkit' && (!extractedData.orders || extractedData.orders.length === 0)) ||
                  (provider.id === 'zepto' && (!extractedData.orders || extractedData.orders.length === 0));

                if (needsDeepSearch) {
                  // #region agent log
                  const proofDataStr = JSON.stringify(proofData);
                  const proofKeys = Object.keys(proofData || {});
                  fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.deepSearch', message: 'Starting deep search for provider data', data: { provider: provider.id, currentKeys: Object.keys(extractedData), proofDataType: typeof proofData, proofDataLength: proofDataStr.length, proofKeyCount: proofKeys.length, firstKeyLength: proofKeys[0]?.length || 0, firstKeySample: (proofKeys[0] || '').substring(0, 500), hasOrdersInKey: proofKeys[0]?.includes('"items"') }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run9', hypothesisId: 'L' }) }).catch(() => { });
                  // #endregion

                  const foundData = findDataInObject(proofData, 0, provider.id);
                  if (foundData) {
                    extractedData = { ...extractedData, ...foundData };
                    // #region agent log
                    fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.foundData', message: 'Found data via deep search', data: { provider: provider.id, foundKeys: Object.keys(foundData), ordersCount: foundData.orders?.length, titlesCount: foundData.titles?.length, hasUsername: !!foundData.username }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run9', hypothesisId: 'L' }) }).catch(() => { });
                    // #endregion
                  }
                }

                const walletAddress = user?.wallet?.address || null;
                const token = `privy_${user?.id}_${getPrivyEmail(user) || 'user'}`;

                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.submitting', message: 'Submitting polled proof to backend', data: { provider: provider.id, hasOrders: !!extractedData.orders, ordersLength: extractedData.orders?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run7', hypothesisId: 'J' }) }).catch(() => { });
                // #endregion

                const response = await fetch(`${API_URL}/api/contribute`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    userId: user?.id,
                    dataType: provider.dataType,
                    anonymizedData: {
                      ...extractedData,
                      provider: provider.id,
                      providerName: provider.name,
                      timestamp: new Date().toISOString(),
                      walletAddress
                    },
                    reclaimProofId: proof?.identifier || `polled_${Date.now()}`,
                    walletAddress
                  })
                });

                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.responseStatus', message: 'Backend response received', data: { status: response.status, statusText: response.statusText, ok: response.ok }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run8', hypothesisId: 'K' }) }).catch(() => { });
                // #endregion

                const result = await response.json();

                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.result', message: 'Backend result parsed', data: { success: result.success, pointsAwarded: result.pointsAwarded, error: result.error, message: result.message, contributionId: result.contribution?.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run8', hypothesisId: 'K' }) }).catch(() => { });
                // #endregion

                setVerificationUrl(null);
                setActiveProvider(null);

                // Points can be in result.pointsAwarded OR result.contribution.pointsAwarded
                const pointsAwarded = result.contribution?.pointsAwarded || result.pointsAwarded || 0;

                // Complete the progress bar first
                setVerificationProgressComplete(true);

                // Small delay to show progress completion, then hide indicator
                setTimeout(() => {
                  setVerificationProgress(false);
                  setVerificationProgressComplete(false);
                }, 300);

                // Replace processing toast with success/error (non-persistent, will auto-dismiss)
                if (result.success || pointsAwarded > 0) {
                  showToast('success', 'Success!', `You earned ${pointsAwarded} points!`);
                  fetchUserData();
                } else {
                  showToast('error', 'Error', result.message || 'Failed to process contribution');
                }
              } catch (error: any) {
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.processPolledProof.error', message: 'Error in processPolledProof', data: { errorMessage: error?.message || String(error), errorStack: error?.stack?.substring(0, 500) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run8', hypothesisId: 'K' }) }).catch(() => { });
                // #endregion

                console.error('Process polled proof error:', error);
                setVerificationUrl(null);
                setActiveProvider(null);

                // Complete progress bar on error
                setVerificationProgressComplete(true);

                // Small delay then hide
                setTimeout(() => {
                  setVerificationProgress(false);
                  setVerificationProgressComplete(false);
                }, 300);

                showToast('error', 'Error', 'Failed to process verification data');
              }
            };

            // Start polling after a short delay (give backend time to receive the callback)
            setTimeout(pollForProof, 3000);
            return;
          }

          // Proof received successfully (direct mode, not callback URL)
          setVerificationUrl(null);
          setActiveProvider(null);

          const proof = Array.isArray(proofs) ? proofs[0] : proofs;
          if (!proof) {
            alert('No proof data received');
            return;
          }

          // #region agent log - FULL PROOF STRUCTURE
          fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.fullProofStructure', message: 'FULL proof object structure', data: { provider: provider.id, proofKeys: Object.keys(proof || {}), hasClaimData: !!proof.claimData, claimDataKeys: proof.claimData ? Object.keys(proof.claimData) : [], hasContext: !!proof.claimData?.context, contextType: typeof proof.claimData?.context, hasExtractedParameterValues: !!proof.extractedParameterValues, extractedParamKeys: proof.extractedParameterValues ? Object.keys(proof.extractedParameterValues) : [], hasPublicData: !!proof.publicData, publicDataKeys: proof.publicData ? Object.keys(proof.publicData) : [], identifier: proof.identifier, id: proof.id, proofStringified: JSON.stringify(proof).substring(0, 3000) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion

          let extractedData: any = {};
          try {
            // Helper function to recursively find orders in deeply nested structures
            const findOrdersInObject = (obj: any, depth = 0): any[] => {
              if (depth > 10 || !obj) return []; // Prevent infinite recursion

              // If it's an array of order-like objects, return it
              if (Array.isArray(obj)) {
                if (obj.length > 0 && obj[0] && typeof obj[0] === 'object' &&
                  (obj[0].items || obj[0].restaurant || obj[0].price || obj[0].timestamp)) {
                  return obj;
                }
                // Search inside array elements
                for (const item of obj) {
                  const found = findOrdersInObject(item, depth + 1);
                  if (found.length > 0) return found;
                }
              }

              // If it's an object, search its values
              if (typeof obj === 'object' && obj !== null) {
                // Check if this object itself looks like an order
                if (obj.items && obj.restaurant) {
                  return [obj];
                }

                // Check for 'orders' key
                if (obj.orders && Array.isArray(obj.orders)) {
                  return obj.orders;
                }

                // Search all values
                for (const key of Object.keys(obj)) {
                  // Skip if key is a long JSON string (malformed structure)
                  if (key.length > 100 && key.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(key);
                      const found = findOrdersInObject(parsed, depth + 1);
                      if (found.length > 0) return found;
                    } catch (e) {
                      // Try to extract orders from the key string directly
                      const orderMatches = key.match(/\{"items":[^}]+,"price":[^}]+,"timestamp":[^}]+,"restaurant":[^}]+\}/g);
                      if (orderMatches && orderMatches.length > 0) {
                        try {
                          return orderMatches.map(m => JSON.parse(m));
                        } catch (e2) { /* ignore */ }
                      }
                    }
                  }

                  const found = findOrdersInObject(obj[key], depth + 1);
                  if (found.length > 0) return found;
                }
              }

              // If it's a string that looks like JSON, try to parse it
              if (typeof obj === 'string' && (obj.startsWith('{') || obj.startsWith('['))) {
                try {
                  const parsed = JSON.parse(obj);
                  return findOrdersInObject(parsed, depth + 1);
                } catch (e) {
                  // Try to extract orders from the string directly using regex
                  const orderMatches = obj.match(/\{"items":[^}]+,"price":[^}]+,"timestamp":[^}]+,"restaurant":[^}]+\}/g);
                  if (orderMatches && orderMatches.length > 0) {
                    try {
                      return orderMatches.map(m => JSON.parse(m));
                    } catch (e2) { /* ignore */ }
                  }
                }
              }

              return [];
            };

            // Extract from context.extractedParameters
            if (proof.claimData?.context) {
              const context = typeof proof.claimData.context === 'string'
                ? JSON.parse(proof.claimData.context)
                : proof.claimData.context;

              // #region agent log - CONTEXT PARSED
              fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.contextParsed', message: 'Context parsed from claimData', data: { provider: provider.id, contextKeys: Object.keys(context || {}), hasExtractedParams: !!context.extractedParameters, extractedParamKeys: context.extractedParameters ? Object.keys(context.extractedParameters) : [], contextStringified: JSON.stringify(context).substring(0, 2000) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion

              extractedData = context.extractedParameters || {};
            }

            // Extract from extractedParameterValues
            if (proof.extractedParameterValues) {
              extractedData = { ...extractedData, ...proof.extractedParameterValues };
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.extractFromParameterValues', message: 'Data merged from extractedParameterValues', data: { provider: provider.id, extractedKeys: Object.keys(extractedData), hasOrders: !!extractedData.orders, ordersLength: Array.isArray(extractedData.orders) ? extractedData.orders.length : 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion
            }

            // Extract from publicData (contains order history)
            if (proof.publicData) {
              extractedData = { ...extractedData, ...proof.publicData };
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.extractFromPublicData', message: 'Data merged from publicData', data: { provider: provider.id, extractedKeys: Object.keys(extractedData), hasOrders: !!extractedData.orders, ordersLength: Array.isArray(extractedData.orders) ? extractedData.orders.length : 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion
            }

            // If no orders found yet, search the entire proof object for orders
            if (!extractedData.orders || extractedData.orders.length === 0) {
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.searchingForOrders', message: 'No orders in standard locations, searching entire proof', data: { provider: provider.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'F' }) }).catch(() => { });
              // #endregion

              const foundOrders = findOrdersInObject(proof);
              if (foundOrders.length > 0) {
                extractedData.orders = foundOrders;
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.foundOrdersDeep', message: 'Found orders in deep search', data: { provider: provider.id, ordersFound: foundOrders.length, firstOrder: foundOrders[0] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'F' }) }).catch(() => { });
                // #endregion
              }
            }

            // #region agent log - FINAL DATA BEFORE SEND
            fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.finalDataBeforeSend', message: 'FINAL extracted data being sent to backend', data: { provider: provider.id, extractedDataKeys: Object.keys(extractedData), hasOrders: !!extractedData.orders, ordersLength: Array.isArray(extractedData.orders) ? extractedData.orders.length : 0, firstOrderSample: Array.isArray(extractedData.orders) && extractedData.orders.length > 0 ? extractedData.orders[0] : null, extractedDataStringified: JSON.stringify(extractedData).substring(0, 2000), proofIdentifier: proof?.identifier, proofId: proof?.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion
          } catch (e) {
            console.error('Error verifying contribution');
            // #region agent log
            const errorMessage = e instanceof Error ? e.message : String(e);
            fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.extractionError', message: 'Error during data extraction', data: { provider: provider.id, error: errorMessage }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion
          }

          const token = `privy_${user.id}_${getPrivyEmail(user) || 'user'}`;

          const response = await fetch(`${API_URL}/api/contribute`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              anonymizedData: {
                ...extractedData,
                provider: provider.id,
                providerName: provider.name,
                timestamp: new Date().toISOString(),
                walletAddress: walletAddress || null
              },
              dataType: provider.dataType,
              reclaimProofId: proof.identifier || proof.id || `reclaim-${Date.now()}`
            })
          });

          const data = await response.json();

          // #region agent log - BACKEND RESPONSE
          fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.onSuccess.backendResponse', message: 'Backend response received', data: { provider: provider.id, success: data.success, contributionId: data.contribution?.id, pointsAwarded: data.contribution?.pointsAwarded, orderCount: data.contribution?.orderCount, error: data.error, message: data.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'C' }) }).catch(() => { });
          // #endregion

          if (data.success) {
            // Complete the progress bar first
            setVerificationProgressComplete(true);

            // Small delay to show progress completion, then show modal
            setTimeout(() => {
              // Show prominent success modal
              setSuccessModal({
                show: true,
                provider: provider.name,
                points: data.contribution?.pointsAwarded || 0
              });

              // Hide progress indicator
              setVerificationProgress(false);
              setVerificationProgressComplete(false);
            }, 300); // 300ms delay for smooth transition

            // Refresh data in the background (don't await)
            fetchUserData(true).catch(err => console.error('Error refreshing data:', err));

            // Also show toast for consistency
            showToast('success', `${provider.name} Verified!`, `+${data.contribution?.pointsAwarded || 500} points earned`);
          } else {
            // Complete progress bar on error
            setVerificationProgressComplete(true);

            // Small delay then hide
            setTimeout(() => {
              setVerificationProgress(false);
              setVerificationProgressComplete(false);
            }, 300);

            // Log backend error to server
            logErrorToServer(new Error(data.message || 'Unknown error'), `DashboardPage.handleContribute.${provider.id}.backendError`, {
              provider: provider.id,
              response: data
            });
            showToast('error', 'Verification Failed', data.message || 'Unknown error');
          }
        },
        onError: async (error: any) => {
          // Restore original console.log
          console.log = originalConsoleLog;

          console.error('Reclaim error:', error);
          console.error('Error details:', {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
            toString: error?.toString()
          });

          // Check if tab is hidden - if so, don't show error yet (verification might still be in progress)
          const tabHidden = document.hidden || !isTabVisible;
          const timeSinceStart = verificationStartTime ? Date.now() - verificationStartTime : 0;

          // Log to server with tab visibility info
          fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.handleContribute.onError', message: 'Reclaim error triggered', data: { provider: provider.id, errorMessage: error?.message || error?.toString(), errorName: error?.name, tabHidden, isTabVisible, timeSinceStart, verificationUrl: verificationUrl || null, isLocalhost: callbackUrl?.includes('localhost') || false }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });

          logErrorToServer(error, `DashboardPage.handleContribute.${provider.id}.onError`, {
            provider: provider.id,
            providerName: provider.name,
            verificationUrl: verificationUrl || null,
            tabHidden,
            isTabVisible,
            timeSinceStart
          });

          // Mobile-specific error handling
          const errorMessage = error?.message || error?.toString() || 'Unknown error';
          const errorName = error?.name || '';
          const isLocalhostError = (window as any).__reclaimIsLocalhost || false;

          // Handle ProofSubmissionFailedError specifically - this usually means callback URL validation failed
          if (errorName === 'ProofSubmissionFailedError' || errorMessage.includes('ProofSubmissionFailed') || errorMessage.includes('callback')) {
            console.log('🔍 ProofSubmissionFailedError detected - likely callback URL issue');
            console.log('🔍 Is localhost:', isLocalhostError);

            // If we're on localhost and this error occurs, it's expected - the mobile app can't reach localhost
            if (isLocalhostError) {
              console.log('ℹ️ This is expected for localhost - mobile app cannot access localhost URLs');
              console.log('ℹ️ The verification should still work via redirect flow (proof in URL hash)');

              // Don't show error immediately - wait a bit to see if redirect flow works
              if (timeSinceStart < 10000) { // Less than 10 seconds - might still be processing
                console.log('⏳ Waiting a bit longer - verification might still succeed via redirect');
                // Don't clear state - let the redirect flow complete
                return; // Exit early - don't show error yet
              }
            }
          }

          // CRITICAL FIX: If tab is hidden, don't show error immediately
          // Verification might still be in progress in Reclaim app
          // Wait and check again when tab becomes visible
          if (tabHidden && (timeSinceStart < 120000)) { // Less than 2 minutes - likely still in progress
            fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.handleContribute.onError', message: 'Tab hidden - deferring error display', data: { provider: provider.id, errorMessage, tabHidden, timeSinceStart }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });

            // Don't clear state or show error - wait for tab to become visible again
            // The verification might complete successfully
            return; // Exit early - don't show error while tab is hidden
          }

          // Check for common mobile-specific errors
          if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
            // Only show error if tab is visible OR it's been more than 2 minutes
            if (!tabHidden || timeSinceStart > 120000) {
              showToast('error', 'Network Error', 'Please check your internet connection and try again. Mobile networks can be slower.');
              setVerificationUrl(null);
              setActiveProvider(null);
              setContributing(null);
            }
            return;
          }

          // "Interval ended without receiving proofs" - user completed verification on mobile
          // Proof often arrives via callback; show friendly message instead of scary error
          if (errorMessage.includes('Interval ended without receiving proofs') || errorMessage.includes('without receiving proofs')) {
            showToast('info', 'Verification may have completed', 'If you finished verification on your phone, refresh the page to see your contributions.');
            setVerificationUrl(null);
            setActiveProvider(null);
            setContributing(null);
            return;
          }

          if (errorMessage.includes('cancelled') || errorMessage.includes('user')) {
            // Only show cancellation if tab is visible - user might still be in Reclaim app
            if (!tabHidden) {
              showToast('info', 'Verification Cancelled', 'You can try again when ready.');
              setVerificationUrl(null);
              setActiveProvider(null);
              setContributing(null);
            }
            return;
          }

          // Use captured proof data from SDK logs (Identifier Mismatch workaround)
          // Check both local capture and window global fallback
          const capturedParams = capturedProofData || (window as any).__reclaimCapturedProof;

          if (capturedParams && capturedParams.length > 0) {
            console.log('🔄 Using captured proof data from SDK logs...');
            const proof = capturedParams[0];

            if (proof && (proof.publicData || proof.claimData)) {
              try {
                let extractedData: any = {};

                // Extract from context.extractedParameters
                if (proof.claimData?.context) {
                  const context = typeof proof.claimData.context === 'string'
                    ? JSON.parse(proof.claimData.context)
                    : proof.claimData.context;
                  extractedData = context.extractedParameters || {};
                }

                // Extract from publicData
                if (proof.publicData) {
                  extractedData = { ...extractedData, ...proof.publicData };
                }

                if (Object.keys(extractedData).length > 0) {
                  console.log('✅ Successfully extracted data:', Object.keys(extractedData));

                  const token = `privy_${user.id}_${getPrivyEmail(user) || 'user'}`;

                  const response = await fetch(`${API_URL}/api/contribute`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      anonymizedData: {
                        ...extractedData,
                        provider: provider.id,
                        providerName: provider.name,
                        timestamp: new Date().toISOString(),
                        walletAddress: walletAddress || null,
                        recoveredFromSdkLogs: true
                      },
                      dataType: provider.dataType,
                      reclaimProofId: proof.identifier || `reclaim-recovered-${Date.now()}`
                    })
                  });

                  const data = await response.json();

                  if (data.success) {
                    await fetchUserData(true);
                    setVerificationUrl(null);
                    setActiveProvider(null);
                    showToast('success', `${provider.name} Verified!`, `+${data.contribution?.pointsAwarded || 500} points earned`);
                    return; // Exit - recovery successful
                  } else {
                    // Log backend error to server
                    logErrorToServer(new Error(data.message || 'Backend error'), `DashboardPage.handleContribute.${provider.id}.recoveryBackendError`, {
                      provider: provider.id,
                      recoveryType: 'sdkLogs',
                      response: data
                    });
                    showToast('error', 'Verification Failed', data.message || 'Backend error');
                  }
                }
              } catch (recoveryError) {
                console.error('Error processing captured proof:', recoveryError);
                logErrorToServer(recoveryError, `DashboardPage.handleContribute.${provider.id}.recoveryError`, {
                  provider: provider.id,
                  recoveryType: 'sdkLogs'
                });
              }
            }
          }

          // Fallback: Check if error contains proof data directly
          const errorProofs = error?.proof || error?.proofs || error?.data;
          if (errorProofs) {
            console.log('Found proof data in error object, attempting to process...');
            const proof = Array.isArray(errorProofs) ? errorProofs[0] : errorProofs;

            if (proof && (proof.publicData || proof.claimData)) {
              try {
                let extractedData: any = {};

                // Extract from context.extractedParameters
                if (proof.claimData?.context) {
                  const context = typeof proof.claimData.context === 'string'
                    ? JSON.parse(proof.claimData.context)
                    : proof.claimData.context;
                  extractedData = context.extractedParameters || {};
                }

                // Extract from publicData
                if (proof.publicData) {
                  extractedData = { ...extractedData, ...proof.publicData };
                }

                if (Object.keys(extractedData).length > 0) {
                  console.log('Successfully extracted data from error proof:', Object.keys(extractedData));

                  const token = `privy_${user.id}_${getPrivyEmail(user) || 'user'}`;

                  const response = await fetch(`${API_URL}/api/contribute`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      anonymizedData: {
                        ...extractedData,
                        provider: provider.id,
                        providerName: provider.name,
                        timestamp: new Date().toISOString(),
                        walletAddress: walletAddress || null,
                        recoveredFromError: true // Flag to indicate this was recovered
                      },
                      dataType: provider.dataType,
                      reclaimProofId: proof.identifier || proof.id || `reclaim-recovered-${Date.now()}`
                    })
                  });

                  const data = await response.json();

                  if (data.success) {
                    await fetchUserData(true);
                    setVerificationUrl(null);
                    setActiveProvider(null);
                    showToast('success', `${provider.name} Verified!`, `+${data.contribution?.pointsAwarded || 500} points earned`);
                    return; // Exit early - recovery successful
                  } else {
                    // Log backend error to server
                    logErrorToServer(new Error(data.message || 'Backend error'), `DashboardPage.handleContribute.${provider.id}.errorObjectBackendError`, {
                      provider: provider.id,
                      recoveryType: 'errorObject',
                      response: data
                    });
                  }
                }
              } catch (recoveryError) {
                console.error('Error recovering proof from error object:', recoveryError);
                logErrorToServer(recoveryError, `DashboardPage.handleContribute.${provider.id}.errorRecovery`, {
                  provider: provider.id,
                  recoveryType: 'errorObject'
                });
              }
            }
          }

          // Check if tab was hidden when error occurred - if so, wait and check again
          const tabHiddenFinal = document.hidden || !isTabVisible;
          const timeSinceStartFinal = verificationStartTime ? Date.now() - verificationStartTime : 0;

          fetch(`${API_URL}/api/logs/debug`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'DashboardPage.handleContribute.onError.final', message: 'Final error handling', data: { provider: provider.id, tabHidden: tabHiddenFinal, timeSinceStart: timeSinceStartFinal }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });

          // Only show error if tab is visible OR it's been more than 2 minutes
          if (!tabHiddenFinal || timeSinceStartFinal > 120000) {
            setVerificationUrl(null);
            setActiveProvider(null);

            // More helpful error message for mobile
            const isMobileDeviceFinal = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobileDeviceFinal) {
              showToast('error', 'Verification Failed', 'If verification keeps failing on mobile, try using a desktop browser or ensure you have the Reclaim app installed.');
            } else {
              showToast('error', 'Verification Failed', 'Reclaim verification issue. Please try again or contact support.');
            }
          } else {
            // Tab is hidden and not enough time has passed - don't show error yet
            // Verification might still be in progress
          }
        }
      });

    } catch (error: any) {
      console.error('Error:', error);

      // Log to server (Render logs)
      logErrorToServer(error, `DashboardPage.handleContribute.${provider?.id || 'unknown'}.catch`, {
        provider: provider?.id || null,
        providerName: provider?.name || null
      });

      setVerificationUrl(null);
      setActiveProvider(null);

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const errorMsg = error?.message || String(error);

      // Mobile-specific error messages
      if (isMobileDevice && (errorMsg.includes('timeout') || errorMsg.includes('network'))) {
        showToast('error', 'Network Error', 'Mobile connection may be slow. Please try again or use WiFi.');
      } else {
        showToast('error', 'Error', errorMsg);
      }
    } finally {
      setContributing(null);
    }
  };

  const getProviderInfo = (dataType: string) => {
    return PROVIDERS.find(p => p.dataType === dataType) || { name: dataType, color: '#888' };
  };

  // Loading state (only show if authenticated, otherwise redirect handles it)
  if (!ready || (authenticated && !hasLoadedData.current && !profile)) {
    return (
      <div className="dashboard-loading">
        <style>{styles}</style>
        <Loader2 className="spin" size={40} color="#fff" />
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, we return null as the useEffect will redirect
  if (!authenticated) {
    return null;
  }

  return (
    <div className="dashboard">
      <style>{styles}</style>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Bounty Banner */}
      <a
        href="https://app.firstdollar.money/company/myrad/bounty/myrad-user-experience-bounty"
        target="_blank"
        rel="noopener noreferrer"
        className="bounty-banner"
      >
        <span className="bounty-banner-text">
          🏆 Myrad User Experience Bounty is now live on EarnFirstDollar. Check it out now →
        </span>
      </a>

      {/* Verification Progress Indicator */}
      {verificationProgress && (
        <div className="verification-progress-overlay">
          <div className="verification-progress-container">
            <h3 className="verification-progress-title">Verification Processing</h3>
            <p className="verification-progress-text">{verificationProgressText}</p>
            <div className="verification-progress-bar">
              <div className={`verification-progress-fill ${verificationProgressComplete ? 'complete' : ''}`}></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.show && (
        <div className="success-modal-overlay" onClick={() => setSuccessModal({ show: false, provider: '', points: 0 })}>
          <div className="success-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-icon">
              <CheckCircle size={64} />
            </div>
            <h2 className="success-modal-title">Verification Successful!</h2>
            <p className="success-modal-provider">{successModal.provider} verified successfully</p>
            <div className="success-modal-points">
              <span className="success-modal-points-label">Points Earned</span>
              <span className="success-modal-points-value">+{successModal.points}</span>
            </div>
            <button
              className="success-modal-button"
              onClick={() => {
                setSuccessModal({ show: false, provider: '', points: 0 });
                setVerificationUrl(null);
                setActiveProvider(null);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className="toast-content">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => setToast(prev => ({ ...prev, show: false }))}>
            <X size={16} />
          </button>
        </div>
      )}
{/* Referral Modal */}
{showReferralModal && (
  <div className="success-modal-overlay">
    <div className="success-modal-container">
      <h2 className="success-modal-title">Enter Referral Code</h2>
      <p className="success-modal-provider">
        If someone invited you, enter their 8-digit code to get bonus points!
      </p>

      <input
        type="text"
        maxLength={8}
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
        placeholder="Enter code (8 characters)"
        disabled={submittingReferral}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: referralCode.length === 8 ? '2px solid #10b981' : '1px solid #e5e7eb',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: '500',
          letterSpacing: '0.1em',
          opacity: submittingReferral ? 0.6 : 1,
          cursor: submittingReferral ? 'not-allowed' : 'text',
          transition: 'all 0.3s ease'
        }}
      />

      {referralCode.length > 0 && referralCode.length < 8 && (
        <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', textAlign: 'center' }}>
          Code must be 8 characters
        </p>
      )}

      <button
        className="success-modal-button"
        onClick={handleReferralSubmit}
        disabled={submittingReferral || referralCode.length !== 8}
        style={{
          opacity: submittingReferral || referralCode.length !== 8 ? 0.6 : 1,
          cursor: submittingReferral || referralCode.length !== 8 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {submittingReferral ? (
          <>
            <Loader2 size={16} className="spin" />
            Processing...
          </>
        ) : (
          'Apply Code'
        )}
      </button>

      <button
        onClick={() => {
          setShowReferralModal(false);
          setReferralCode('');
        }}
        disabled={submittingReferral}
        style={{
          width: '100%',
          padding: '12px',
          marginTop: '12px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          color: '#6b7280',
          cursor: submittingReferral ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          opacity: submittingReferral ? 0.5 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        Skip for Now
      </button>
    </div>
  </div>
)}

      {/* Shared Dashboard Header */}
      <DashboardHeader onOptOutSuccess={() => fetchUserData(true)} />

      <main className="dashboard-main">
        {/* Welcome */}
        <div className="welcome-section animate-enter">
          <div className="welcome-text">
            <h1>Dashboard</h1>
            <p>Welcome back, track your contributions and rewards.</p>
          </div>
        </div>

        {/* Onboarding Card */}
        {showOnboarding && (
          <div
            className={`onboarding-card ${isExpanded ? 'expanded' : ''}`}
            onMouseEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsExpanded(true);
              }
            }}
            onMouseLeave={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsExpanded(false);
              }
            }}
            onClick={() => {
              // Toggle on click (works for mobile tap and desktop click)
              // For desktop, hover handles open, so click could close it or do nothing
              // For mobile, click is the only way
              setIsExpanded(prev => !prev);
            }}
          >
            <button
              className="onboarding-close"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                dismissOnboarding();
              }}
              aria-label="Dismiss onboarding"
            >
              <X size={18} />
            </button>

            <div className="onboarding-content">
              <div className="onboarding-left">
                <div className="onboarding-header">


                  <div className="onboarding-text">
                    <h2 className="onboarding-title">How to Contribute</h2>
                    <br className="onboarding-line-break" />
                    <ul className="onboarding-description">
                      <li>Install the Reclaim Verifier app from the Play Store or App Store (required)</li>
                      <li>Click Verify on any provider card in the dashboard</li>
                      <li>Verify your accounts (Zomato, GitHub, Netflix) to prove ownership anonymously</li>
                      <li>Log in and complete the secure verification</li>
                      <li>Earn points for each successful verification</li>
                      <li>Gain more points to move up the leaderboard</li>

                    </ul>

                  </div>
                </div>

                <div className="onboarding-hover-hint">
                  <PlayCircle size={16} />
                  <span>Hover to play tutorial</span>
                </div>
              </div>

              <div className="onboarding-video-container">
                <video
                  ref={videoRef}
                  className="onboarding-video"
                  src="/tutorial.mp4"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state animate-enter">
            <Loader2 className="spin" size={40} color="#111827" />
            <p style={{ fontSize: 16, fontWeight: 500 }}>...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <section className="stats-grid animate-enter">
              <div className="stat-card" style={{ position: 'relative' }}>
                <span className="stat-label">Total Points</span>
                <span className="stat-value">{points?.balance?.toLocaleString() || 0}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!verificationUrl && !activeProvider && !loading && !refreshing) {
                      fetchUserData(true);
                    }
                  }}
                  disabled={!!verificationUrl || !!activeProvider || loading || refreshing}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'none',
                    border: 'none',
                    cursor: (verificationUrl || activeProvider || loading || refreshing) ? 'not-allowed' : 'pointer',
                    opacity: (verificationUrl || activeProvider || loading || refreshing) ? 0.5 : 1,
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s'
                  }}
                  title="Refresh points"
                >
                  <RefreshCw
                    size={18}
                    color="#6b7280"
                    className={(loading || refreshing) ? 'spin' : ''}
                  />
                </button>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Contributions</span>
                <span className="stat-value">{contributions.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Account Status</span>
                <span className="stat-value" style={{ color: '#059669' }}>Active</span>
              </div>
            </section>

            {/* Contribute Section */}
            <section className="contribute-section animate-enter">
              <div className="section-header">
                <h2>Verify & Earn</h2>
                <p>Verify your accounts to earn rewards.</p>
              </div>

              <div className="providers-grid">
                {PROVIDERS.filter(p => !p.hidden).map((provider) => (
                  <div
                    key={provider.id}
                    className={`provider-card ${activeProvider === provider.id ? "active" : ""}`}
                  >
                    <div className="provider-header">
                      {provider.logoUrl ? (
                        <img
                          src={provider.logoUrl}
                          alt={provider.name}
                          className="provider-logo"
                        />
                      ) : (
                        <div className="provider-icon-wrapper" style={{ background: provider.iconBg }}>
                          <provider.icon size={20} color={provider.iconColor} />
                        </div>
                      )}
                      <h3 className="provider-name">{provider.name}</h3>
                    </div>

                    <p className="provider-desc">{provider.description}</p>

                    {/* QR Code Section */}
                    {activeProvider === provider.id && verificationUrl && (
                      <div className="qr-section">
                        {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                          // Mobile: Show direct link button instead of QR code
                          <>
                            <p className="qr-title" style={{ marginBottom: '16px' }}>Verifying on mobile...</p>
                            <a
                              href={verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="qr-link"
                              style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                background: '#000',
                                color: '#fff',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: 600,
                                marginBottom: '12px'
                              }}
                            >
                              Open Verification Link
                            </a>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px', marginBottom: '16px' }}>
                              The verification page will open in a new tab. Complete the verification there.
                            </p>
                            <button onClick={() => { setVerificationUrl(null); setActiveProvider(null); setContributing(null); }} className="qr-cancel">
                              Cancel
                            </button>
                          </>
                        ) : (
                          // Desktop: Show QR code
                          <>
                            <p className="qr-title">Scan to verify</p>
                            <div className="qr-container">
                              <QRCode value={verificationUrl} size={120} level="M" />
                            </div>
                            <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="qr-link">
                              Open Link
                            </a>
                            <button onClick={() => { setVerificationUrl(null); setActiveProvider(null); setContributing(null); }} className="qr-cancel">
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Only show Connect button if this card is not active AND no other card is active */}
                    {!(activeProvider === provider.id && verificationUrl) && (
                      <button
                        onClick={() => handleContribute(provider)}
                        disabled={contributing !== null || activeProvider !== null}
                        className="btn-verify"
                        style={{ display: activeProvider && activeProvider !== provider.id ? 'none' : 'flex' }}
                      >
                        {contributing === provider.id ? (
                          <><Loader2 size={16} className="spin" /> Verifying...</>
                        ) : (
                          <>Verify</>
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {/* Coming Soon Card */}
                <div className="provider-card coming-soon">
                  <div className="provider-header">
                    <span className="coming-soon-text">More Coming Soon</span>
                  </div>
                  <p className="coming-soon-desc">New integrations are on the way.</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="activity-section animate-enter">
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>

              <div className="activity-list">
                {contributions.length > 0 ? (
                  contributions.slice(0, 10).map((contrib: any) => {
                    // Determine dataType if not set - check sellable_data for dataset_id
                    let dataType = contrib.dataType;
                    if (!dataType && contrib.sellableData?.dataset_id) {
                      if (contrib.sellableData.dataset_id.includes('zepto')) {
                        dataType = 'zepto_order_history';
                      } else if (contrib.sellableData.dataset_id.includes('zomato')) {
                        dataType = 'zomato_order_history';
                      } else if (contrib.sellableData.dataset_id.includes('github')) {
                        dataType = 'github_profile';
                      } else if (contrib.sellableData.dataset_id.includes('netflix')) {
                        dataType = 'netflix_watch_history';
                      } else if (contrib.sellableData.dataset_id.includes('blinkit')) {
                        dataType = 'blinkit_order_history';
                      } else if (contrib.sellableData.dataset_id.includes('ubereats')) {
                        dataType = 'ubereats_order_history';
                      } else if (contrib.sellableData.dataset_id.includes('uber_rides')) {
                        dataType = 'uber_ride_history';
                      } else if (contrib.sellableData.dataset_id.includes('strava')) {
                        dataType = 'strava_fitness';
                      }
                    }
                    const provider = getProviderInfo(dataType || 'general');
                    const title = contrib.providerName || provider.name || (dataType || 'Activity');
                    return (
                      <div key={contrib.id} className="activity-item">
                        <div className="activity-info">
                          <span className="activity-title">{title} Verification</span>
                          <span className="activity-time">{new Date(contrib.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <p>No contributions yet</p>
                    <span>Verify your data above to earn points!</span>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

// Styles
const styles = `
  @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .dashboard {
    min-height: 100vh;
    background: #ffffff;
    color: #111827;
    font-family: 'Satoshi', sans-serif;
    padding-left: 70px;
    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Bounty Banner */
  .bounty-banner {
    display: block;
    width: 100%;
    background-image: url('/earnfirstdollar.png');
    background-size: cover;
    background-position: center;
    background-repeat: repeat;
    background-color: #1e40af; /* Fallback blue color */
    color: #ffffff;
    text-decoration: none;
    padding: 12px 24px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    position: relative;
    z-index: 10;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .bounty-banner:hover {
    opacity: 0.95;
    transform: translateY(0);
  }

  .bounty-banner-text {
    display: inline-block;
    letter-spacing: 0.2px;
  }

  @media (max-width: 768px) {
    .bounty-banner {
      padding: 10px 16px;
      font-size: 13px;
    }
  }

  /* Animations */
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-enter { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  
  .dashboard-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;
  }
  
  .welcome-text h1 { font-size: 36px; font-weight: 700; color: #111827; margin-bottom: 8px; letter-spacing: -0.02em; }
  .welcome-text p { color: #6b7280; font-size: 16px; font-weight: 500; }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #e5e7eb;
  }
  
  .stat-label { font-size: 14px; font-weight: 500; color: #6b7280; }
  .stat-value { font-size: 36px; font-weight: 700; color: #111827; letter-spacing: -0.02em; line-height: 1; }

  /* Contribute Section */
  .section-header { margin-bottom: 24px; }
  .section-header h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.01em; }
  .section-header p { color: #6b7280; font-size: 15px; }

  .providers-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 48px;
  }

  .provider-card {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    border-top: 4px solid transparent;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .provider-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border-color: #e5e7eb;
    border-top-color: #111827;
  }



  .provider-header { display: flex; align-items: center; gap: 12px; margin-bottom: 2px; }
  
  .provider-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .provider-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .provider-name { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
  
  .provider-desc { font-size: 13px; color: #6b7280; line-height: 1.5; margin-bottom: auto; }

  .btn-verify {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: #111827;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
  }

  .btn-verify:hover { background: #000000; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .btn-verify:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

  .provider-card.active { border-color: #111827; background: #fff; }
  .provider-card.coming-soon { 
    border-style: dashed; 
    background: #f9fafb; 
    align-items: center;
    justify-content: center;
    opacity: 0.8; 
    min-height: 200px;
  }
  
  .provider-card.coming-soon:hover {
    transform: none;
    box-shadow: none;
    border-color: #f3f4f6; /* Keep original subtle border */
    border-top-color: transparent;
    cursor: default;
  }

  .coming-soon-text { font-size: 16px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
  .coming-soon-desc { font-size: 13px; color: #9ca3af; text-align: center; margin: 0; }

  /* Activity List */
  .activity-section { margin-top: 24px; }
  .activity-list {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .activity-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: #f9fafb; }

  .activity-info { display: flex; flex-direction: column; gap: 2px; }
  .activity-title { font-weight: 600; font-size: 14px; color: #111827; }
  .activity-time { font-size: 12px; color: #9ca3af; }
  .activity-points { font-size: 14px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 4px 10px; border-radius: 100px; }

  /* QR Section */
  .qr-section { 
    background: #f9fafb; 
    border-radius: 16px; 
    padding: 20px; 
    text-align: center; 
    margin-top: 16px; 
    border: 1px solid #e5e7eb; 
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .qr-container { background: #fff; padding: 12px; border-radius: 12px; display: inline-block; margin: 12px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .qr-link { display: inline-flex; align-items: center; justify-content: center; gap: 6px; color: #111827; font-weight: 600; font-size: 13px; text-decoration: none; margin-bottom: 12px; width: 100%; }
  .qr-link:hover { text-decoration: underline; }
  .qr-cancel { background: transparent; border: none; color: #ef4444; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; margin: 0 auto; width: 100%; }
  .qr-title { font-weight: 600; font-size: 13px; color: #374151; width: 100%; }

  /* Onboarding Card */
  .onboarding-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 16px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    min-height: 60px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .onboarding-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0.6;
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .onboarding-card:hover, .onboarding-card.expanded {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #d1d5db;
    padding: 24px;
    min-height: 200px;
  }

  .onboarding-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .onboarding-close:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
    color: #374151;
  }

  .onboarding-content {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: start;
  }

  .onboarding-card:hover .onboarding-content, .onboarding-card.expanded .onboarding-content {
    grid-template-columns: 1fr 500px;
    gap: 40px;
  }

  .onboarding-left {
    display: flex;
    flex-direction: column;
  }

  .onboarding-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .onboarding-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
  }

  .onboarding-text {
    flex: 1;
    padding-top: 4px;
  }

  .onboarding-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .onboarding-description {
    color: #6b7280;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 0;
    max-width: 600px;
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding-left: 20px;
    list-style-type: disc;
  }

  .onboarding-description li {
    margin-bottom: 8px;
  }

  .onboarding-description li:last-child {
    margin-bottom: 0;
  }

  .onboarding-card:hover .onboarding-description, .onboarding-card.expanded .onboarding-description {
    opacity: 1;
    max-height: 300px;
    margin-bottom: 16px;
  }
  
  .onboarding-line-break {
    display: none;
  }

  .onboarding-card:hover .onboarding-line-break, .onboarding-card.expanded .onboarding-line-break {
    display: block;
  }

  .onboarding-video-container {
    border-radius: 12px;
    overflow: hidden;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 0;
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: center;
    justify-self: center;
  }

  .onboarding-card:hover .onboarding-video-container, .onboarding-card.expanded .onboarding-video-container {
    opacity: 1;
    transform: scale(1);
    max-height: 225px; /* 400px * 0.5625 for 16:9 */
    padding-bottom: 56.25%; /* Maintain 16:9 aspect ratio */
  }

  .onboarding-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 12px;
  }

  @media (max-width: 1024px) {
    .onboarding-card:hover .onboarding-content, .onboarding-card.expanded .onboarding-content {
      grid-template-columns: 1fr 400px;
      gap: 32px;
    }

    .onboarding-card:hover .onboarding-video-container, .onboarding-card.expanded .onboarding-video-container {
      max-height: 225px;
      padding-bottom: 56.25%;
    }
  }

  @media (max-width: 768px) {
    .onboarding-card {
      padding: 32px 24px;
    }

    .onboarding-card:hover .onboarding-content, .onboarding-card.expanded .onboarding-content {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .onboarding-header {
      flex-direction: row;
      gap: 12px;
    }

    .onboarding-title {
      font-size: 24px;
    }

    .onboarding-description {
    font-size: 14px;
    }

    .onboarding-icon {
      width: 48px;
      height: 48px;
    }

    .onboarding-card:hover .onboarding-video-container, .onboarding-card.expanded .onboarding-video-container {
      max-height: 225px;
      padding-bottom: 56.25%;
      transform: scale(1);
    }

    .onboarding-video-container {
      transform: translateY(20px) scale(0.95);
    }
  }

  .onboarding-hover-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 13px;
    margin-top: 16px;
    opacity: 1;
    max-height: 40px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .onboarding-card:hover .onboarding-hover-hint, .onboarding-card.expanded .onboarding-hover-hint {
    opacity: 0;
    max-height: 0;
    margin-top: 0;
  }

  /* Misc */
  .loading-state { padding: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9ca3af; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .empty-state { padding: 64px; text-align: center; color: #6b7280; }
  
  @media (max-width: 1024px) {
    .providers-grid { grid-template-columns: repeat(3, 1fr); }
  }
  
    @media (max-width: 768px) {
      .dashboard {
          padding-left: 0 !important;
          padding-bottom: 80px;
      }
      .dashboard-main {
          padding: 20px 16px !important;
      }
      .welcome-text h1 { font-size: 28px; }
      .stats-grid { grid-template-columns: 1fr; }
    .providers-grid { grid-template-columns: repeat(2, 1fr); }
    .welcome-section { flex-direction: column; align-items: flex-start; gap: 16px; }
    .stat-card {
        padding: 20px !important;
    }
    .stat-value {
        font-size: 28px !important;
    }
    .provider-card {
        padding: 20px !important;
    }
    .toast {
        top: 16px !important;
        right: 16px !important;
        left: 16px !important;
        max-width: none !important;
    }
    .verification-progress-container {
        padding: 32px 24px !important;
        width: 95% !important;
    }
    .onboarding-content {
      grid-template-columns: 1fr;
      gap: 20px;
      min-height: 40px;
    }
    .onboarding-card:hover .onboarding-content, .onboarding-card.expanded .onboarding-content {
      align-items: start;
    }
    .onboarding-video-container {
      grid-column: 1;
      grid-row: auto;
      max-height: 197px;
      margin-top: 20px;
    }
    .onboarding-card:hover .onboarding-video-container, .onboarding-card.expanded .onboarding-video-container {
      max-height: 197px;
    }
    .onboarding-card {
      padding: 12px;
      min-height: 48px;
      margin-bottom: 20px;
    }
    .onboarding-card:hover, .onboarding-card.expanded {
      padding: 20px;
      min-height: 180px;
    }
  }
  
  @media (max-width: 480px) {
    .providers-grid { grid-template-columns: 1fr; }
    .dashboard-main {
        padding: 16px 12px !important;
    }
    .welcome-text h1 { font-size: 24px !important; }
    .welcome-text p { font-size: 14px !important; }
    .stat-card {
        padding: 16px !important;
    }
    .stat-value {
        font-size: 24px !important;
    }
    .stat-label {
        font-size: 12px !important;
    }
    .provider-card {
        padding: 16px !important;
    }
    .section-header h2 {
        font-size: 20px !important;
    }
    .section-header p {
        font-size: 13px !important;
    }
    .verification-progress-container {
        padding: 24px 20px !important;
    }
  }

  /* Keep Toast Styles as is, they are fine */
  .toast { position: fixed; top: 24px; right: 24px; display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; border-radius: 12px; background: rgba(20, 20, 20, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); z-index: 10000; max-width: 400px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
  .toast-success { border-color: #22C55E; } .toast-success .toast-icon { color: #22C55E; }
  .toast-error { border-color: #EF4444; } .toast-error .toast-icon { color: #EF4444; }
  .toast-info { border-color: #3B82F6; } .toast-info .toast-icon { color: #3B82F6; }
  .toast-icon { flex-shrink: 0; margin-top: 2px; }
  .toast-content { flex: 1; }
  .toast-content strong { display: block; font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 2px; }
  .toast-content p { font-size: 13px; color: rgba(255, 255, 255, 0.6); margin: 0; line-height: 1.4; }
  .toast-close { flex-shrink: 0; background: none; border: none; color: rgba(255, 255, 255, 0.4); cursor: pointer; padding: 4px; border-radius: 4px; }
  .toast-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

  /* Verification Progress Overlay */
  .verification-progress-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .verification-progress-container {
    background: #ffffff;
    border-radius: 24px;
    padding: 48px 56px;
    text-align: center;
    max-width: 420px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .verification-progress-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
    letter-spacing: -0.01em;
  }

  .verification-progress-text {
    font-size: 15px;
    color: #6b7280;
    margin: 0 0 32px 0;
    font-weight: 500;
  }

  .verification-progress-bar {
    width: 100%;
    height: 6px;
    background: #f3f4f6;
    border-radius: 100px;
    overflow: hidden;
    position: relative;
  }

  .verification-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #111827 0%, #374151 100%);
    border-radius: 100px;
    width: 0%;
    transition: width 0.3s ease;
    animation: progressFill 2.5s linear forwards;
  }

  .verification-progress-fill.complete {
    animation: none;
    width: 100%;
  }

  @keyframes progressFill {
    from {
      width: 0%;
    }
    to {
      width: 95%;
    }
  }

  /* Success Modal */
  .success-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    animation: fadeIn 0.3s ease;
  }

  .success-modal-container {
    background: #ffffff;
    border-radius: 24px;
    padding: 56px 64px;
    text-align: center;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .success-modal-icon {
    color: #22C55E;
    margin: 0 auto 24px;
    display: block;
    animation: checkmarkPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }

  @keyframes checkmarkPop {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .success-modal-title {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
  }

  .success-modal-provider {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 32px 0;
    font-weight: 500;
  }

  .success-modal-points {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border: 2px solid #22C55E;
    border-radius: 16px;
    padding: 24px 32px;
    margin: 0 0 32px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .success-modal-points-label {
    font-size: 14px;
    font-weight: 600;
    color: #059669;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .success-modal-points-value {
    font-size: 48px;
    font-weight: 700;
    color: #059669;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .success-modal-button {
    width: 100%;
    padding: 16px 24px;
    background: #111827;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Satoshi', sans-serif;
  }

  .success-modal-button:hover {
    background: #000000;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .success-modal-button:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .verification-progress-container,
    .success-modal-container {
      padding: 40px 32px;
    }

    .success-modal-title {
      font-size: 28px;
    }

    .success-modal-points-value {
      font-size: 40px;
    }
  }
`;

export default DashboardPage;