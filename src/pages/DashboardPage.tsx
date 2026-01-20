import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Loader2, X, AlertCircle, CheckCircle, PlayCircle } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import QRCode from 'react-qr-code';
import github from "../assets/github.png";
import zomato from "../assets/zomato.png";
import netflix from "../assets/netflix.png";
// Toast notification type
type ToastType = 'success' | 'error' | 'info';
interface ToastState {
  show: boolean;
  type: ToastType;
  title: string;
  message: string;
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
    points: 10, // Updated to match new reward system (base points)
    dataType: 'zomato_order_history',
    logo: zomato
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Developer Profile',
    providerId: import.meta.env.VITE_GITHUB_PROVIDER_ID || '',
    color: '#000000',
    bgGradient: 'linear-gradient(135deg, #24292e 0%, #0d1117 100%)',
    points: 15,
    dataType: 'github_profile',
    logo: github

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
    logo: netflix
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
  const [isHoveringOnboarding, setIsHoveringOnboarding] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [verificationStartTime, setVerificationStartTime] = useState<number | null>(null);

  const hasLoadedData = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'info', title: '', message: '' });

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processRedirect.entry',message:'processRedirectProof called',data:{hash:hash.substring(0,100),hasReclaimProof:hash.includes('reclaim_proof='),userId:user?.id,ready,authenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'I'})}).catch(()=>{});
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
              fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processRedirect.searchingOrders',message:'Searching for orders in redirect proof',data:{proofDataKeys:Object.keys(proofData||{}),proofDataStringified:JSON.stringify(proofData).substring(0,2000)},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
              // #endregion
              
              const foundOrders = findOrdersInObject(proofData);
              if (foundOrders.length > 0) {
                extractedData.orders = foundOrders;
                console.log('📲 Found orders via deep search:', foundOrders.length);
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processRedirect.foundOrders',message:'Found orders via deep search',data:{ordersFound:foundOrders.length,firstOrder:foundOrders[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
                // #endregion
              } else {
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processRedirect.noOrdersFound',message:'No orders found in deep search',data:{proofDataStringified:JSON.stringify(proofData).substring(0,3000)},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'H'})}).catch(()=>{});
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
            const token = `privy_${user.id}_${user?.email?.address || 'user'}`;

            showToast('info', 'Processing verification...', `Submitting ${detectedProvider.name} data`);

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
      fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.hashChange',message:'Hash changed event fired',data:{newHash:window.location.hash.substring(0,100),userId:user?.id,ready,authenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'I'})}).catch(()=>{});
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

  // Handle video playback on hover
  useEffect(() => {
    if (isHoveringOnboarding && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    } else if (!isHoveringOnboarding && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHoveringOnboarding]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('onboardingDismissed', 'true');
  };



  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || null;


  // Fetch user data
  const fetchUserData = useCallback(async (showRefresh = false) => {
    if (!user?.id) return;

    try {
      if (!showRefresh) setLoading(true);

      const token = `privy_${user.id}_${user?.email?.address || 'user'}`;
      const email = user?.email?.address || user?.email || null;
      const walletAddr = user?.wallet?.address || null;

      // Verify/create user (send email and wallet address in body)
      await fetch(`${API_URL}/api/auth/verify`, {
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

      // Fetch all data in parallel
      const [profileRes, pointsRes, contribRes] = await Promise.all([
        fetch(`${API_URL}/api/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/user/points`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/user/contributions`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [profileData, pointsData, contribData] = await Promise.all([
        profileRes.json(),
        pointsRes.json(),
        contribRes.json()
      ]);

      setProfile(profileData.profile);
      setPoints(pointsData.points);
      setContributions(contribData.contributions || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      logErrorToServer(error, 'DashboardPage.fetchUserData');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email?.address, API_URL]);

  // Fetch on mount
  useEffect(() => {
    if (authenticated && user?.id && !hasLoadedData.current) {
      hasLoadedData.current = true;
      fetchUserData();
    }
  }, [authenticated, user?.id, fetchUserData]);

  // Monitor tab visibility changes to handle background verification
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      
      // Log tab visibility changes during verification
      if (activeProvider) {
        fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.visibilityChange',message:'Tab visibility changed',data:{isVisible:visible,activeProvider,hasVerificationUrl:!!verificationUrl,timeSinceStart:verificationStartTime ? Date.now() - verificationStartTime : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        
        // When tab becomes visible again, check if verification completed successfully
        if (visible && verificationStartTime && (Date.now() - verificationStartTime) > 10000) {
          // Tab was hidden for at least 10 seconds - verification might have completed
          // Check if we have captured proof data
          const capturedProof = (window as any).__reclaimCapturedProof;
          if (capturedProof && capturedProof.length > 0) {
            fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.visibilityChange',message:'Tab visible - found captured proof',data:{activeProvider,hasCapturedProof:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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

      const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, provider.providerId, {
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
      fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.handleContribute',message:'Setting callback URL with session',data:{callbackUrl,verificationSessionId,apiUrl:API_URL,windowOrigin,isProduction,hostname:typeof window !== 'undefined' ? window.location.hostname : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run10',hypothesisId:'M'})}).catch(()=>{});
      
      console.log('📱 Setting Reclaim callback URL:', callbackUrl);
      reclaimProofRequest.setAppCallbackUrl(callbackUrl);
      console.log('✅ Callback URL set successfully with sessionId:', verificationSessionId);

      const requestUrl = await reclaimProofRequest.getRequestUrl();
      setVerificationUrl(requestUrl);

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
          
          // #region agent log - RAW PROOFS RECEIVED
          fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.rawProofs',message:'RAW proofs received from SDK',data:{provider:provider.id,proofsType:typeof proofs,isArray:Array.isArray(proofs),proofsLength:Array.isArray(proofs)?proofs.length:null,proofsKeys:proofs&&typeof proofs==='object'?Object.keys(proofs):[],rawProofsStringified:JSON.stringify(proofs).substring(0,3000)},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'E'})}).catch(()=>{});
          // #endregion

          // CRITICAL: When using callback URL, the SDK returns a string message instead of proof data
          // The actual proof is sent to the callback URL and stored on the backend
          // We need to poll the backend to fetch the stored proof
          if (typeof proofs === 'string') {
            // #region agent log
            fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.callbackMode',message:'Callback URL mode detected - polling for proof',data:{provider:provider.id,message:proofs},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'J'})}).catch(()=>{});
            // #endregion
            
            showToast('info', 'Processing...', 'Verification complete, fetching your data...');
            
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
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.pollForProof',message:'Polling for MY specific proof',data:{attempt:attempts,mySessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run10',hypothesisId:'M'})}).catch(()=>{});
                // #endregion
                
                // Directly fetch THIS user's proof using their specific session ID
                const proofRes = await fetch(`${API_URL}/api/reclaim-proof/${encodeURIComponent(mySessionId)}`);
                const proofData = await proofRes.json();
                
                if (proofData.success && proofData.proof) {
                  // #region agent log
                  fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.pollForProof.found',message:'MY proof found via polling',data:{mySessionId,proofKeys:Object.keys(proofData.proof||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run10',hypothesisId:'M'})}).catch(()=>{});
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
                // Helper function to recursively find data in deeply nested structures
                const findDataInObject = (obj: any, depth = 0, providerType?: string): any => {
                  if (depth > 15 || !obj) return null;
                  
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
                      const usernameMatch = obj.match(/"username":\s*"([^"]+)"/);
                      const followersMatch = obj.match(/"followers":\s*"?(\d+)"?/);
                      const contribMatch = obj.match(/"contributions":\s*"?(\d+)"?/) || obj.match(/"contributionsLastYear":\s*"?(\d+)"?/);
                      if (usernameMatch || followersMatch) {
                        return {
                          username: usernameMatch?.[1] || 'unknown',
                          followers: followersMatch?.[1] || '0',
                          contributions: contribMatch?.[1] || '0'
                        };
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
                      if (pv.username || pv.login || pv.followers !== undefined) {
                        return {
                          username: pv.username || pv.login,
                          followers: pv.followers || '0',
                          contributions: pv.contributions || pv.contributionsLastYear || '0'
                        };
                      }
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
                    
                    // Recurse into object keys
                    for (const key of Object.keys(obj)) {
                      // Handle malformed keys that are actually JSON strings
                      if (key.length > 50 && (key.startsWith('{') || key.startsWith('['))) {
                        try {
                          const parsed = JSON.parse(key);
                          const found = findDataInObject(parsed, depth + 1, providerType);
                          if (found) return found;
                        } catch (e) {
                          // Try regex extraction for orders
                          const orderMatches = key.match(/\{"items":[^}]+,"price":[^}]+,"timestamp":[^}]+,"restaurant":[^}]+\}/g);
                          if (orderMatches && orderMatches.length > 0) {
                            try { return { orders: orderMatches.map(m => JSON.parse(m)) }; } catch (e2) { /* ignore */ }
                          }
                          // Try regex extraction for GitHub from malformed key
                          if (providerType === 'github') {
                            const usernameMatch = key.match(/"username":\s*"([^"]+)"/);
                            const followersMatch = key.match(/"followers":\s*"?(\d+)"?/);
                            const contribMatch = key.match(/"contributions":\s*"?(\d+)"?/);
                            if (usernameMatch || followersMatch) {
                              return {
                                username: usernameMatch?.[1] || 'unknown',
                                followers: followersMatch?.[1] || '0',
                                contributions: contribMatch?.[1] || '0'
                              };
                            }
                          }
                        }
                      }
                      const found = findDataInObject(obj[key], depth + 1, providerType);
                      if (found) return found;
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
                
                // Deep search for provider-specific data if not found
                const needsDeepSearch = 
                  (provider.id === 'zomato' && (!extractedData.orders || extractedData.orders.length === 0)) ||
                  (provider.id === 'github' && !extractedData.username && !extractedData.login && !extractedData.followers) ||
                  (provider.id === 'netflix' && (!extractedData.titles || extractedData.titles.length === 0));
                
                if (needsDeepSearch) {
                  // #region agent log
                  fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processPolledProof.deepSearch',message:'Starting deep search for provider data',data:{provider:provider.id,currentKeys:Object.keys(extractedData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run9',hypothesisId:'L'})}).catch(()=>{});
                  // #endregion
                  
                  const foundData = findDataInObject(proofData, 0, provider.id);
                  if (foundData) {
                    extractedData = { ...extractedData, ...foundData };
                    // #region agent log
                    fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processPolledProof.foundData',message:'Found data via deep search',data:{provider:provider.id,foundKeys:Object.keys(foundData),ordersCount:foundData.orders?.length,titlesCount:foundData.titles?.length,hasUsername:!!foundData.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run9',hypothesisId:'L'})}).catch(()=>{});
                    // #endregion
                  }
                }
                
                const walletAddress = user?.wallet?.address || null;
                const token = `privy_${user?.id}_${user?.email?.address || 'user'}`;
                
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processPolledProof.submitting',message:'Submitting polled proof to backend',data:{provider:provider.id,hasOrders:!!extractedData.orders,ordersLength:extractedData.orders?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'J'})}).catch(()=>{});
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
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processPolledProof.responseStatus',message:'Backend response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run8',hypothesisId:'K'})}).catch(()=>{});
                // #endregion
                
                const result = await response.json();
                
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processPolledProof.result',message:'Backend result parsed',data:{success:result.success,pointsAwarded:result.pointsAwarded,error:result.error,message:result.message,contributionId:result.contribution?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run8',hypothesisId:'K'})}).catch(()=>{});
                // #endregion
                
                setVerificationUrl(null);
                setActiveProvider(null);
                
                // Points can be in result.pointsAwarded OR result.contribution.pointsAwarded
                const pointsAwarded = result.contribution?.pointsAwarded || result.pointsAwarded || 0;
                
                if (result.success || pointsAwarded > 0) {
                  showToast('success', 'Success!', `You earned ${pointsAwarded} points!`);
                  fetchUserData();
                } else {
                  showToast('error', 'Error', result.message || 'Failed to process contribution');
                }
              } catch (error: any) {
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.processPolledProof.error',message:'Error in processPolledProof',data:{errorMessage:error?.message||String(error),errorStack:error?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run8',hypothesisId:'K'})}).catch(()=>{});
                // #endregion
                
                console.error('Process polled proof error:', error);
                setVerificationUrl(null);
                setActiveProvider(null);
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
          fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.fullProofStructure',message:'FULL proof object structure',data:{provider:provider.id,proofKeys:Object.keys(proof||{}),hasClaimData:!!proof.claimData,claimDataKeys:proof.claimData?Object.keys(proof.claimData):[],hasContext:!!proof.claimData?.context,contextType:typeof proof.claimData?.context,hasExtractedParameterValues:!!proof.extractedParameterValues,extractedParamKeys:proof.extractedParameterValues?Object.keys(proof.extractedParameterValues):[],hasPublicData:!!proof.publicData,publicDataKeys:proof.publicData?Object.keys(proof.publicData):[],identifier:proof.identifier,id:proof.id,proofStringified:JSON.stringify(proof).substring(0,3000)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
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
              fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.contextParsed',message:'Context parsed from claimData',data:{provider:provider.id,contextKeys:Object.keys(context||{}),hasExtractedParams:!!context.extractedParameters,extractedParamKeys:context.extractedParameters?Object.keys(context.extractedParameters):[],contextStringified:JSON.stringify(context).substring(0,2000)},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              
              extractedData = context.extractedParameters || {};
            }

            // Extract from extractedParameterValues
            if (proof.extractedParameterValues) {
              extractedData = { ...extractedData, ...proof.extractedParameterValues };
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.extractFromParameterValues',message:'Data merged from extractedParameterValues',data:{provider:provider.id,extractedKeys:Object.keys(extractedData),hasOrders:!!extractedData.orders,ordersLength:Array.isArray(extractedData.orders)?extractedData.orders.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
            }

            // Extract from publicData (contains order history)
            if (proof.publicData) {
              extractedData = { ...extractedData, ...proof.publicData };
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.extractFromPublicData',message:'Data merged from publicData',data:{provider:provider.id,extractedKeys:Object.keys(extractedData),hasOrders:!!extractedData.orders,ordersLength:Array.isArray(extractedData.orders)?extractedData.orders.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
            }

            // If no orders found yet, search the entire proof object for orders
            if (!extractedData.orders || extractedData.orders.length === 0) {
              // #region agent log
              fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.searchingForOrders',message:'No orders in standard locations, searching entire proof',data:{provider:provider.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
              // #endregion
              
              const foundOrders = findOrdersInObject(proof);
              if (foundOrders.length > 0) {
                extractedData.orders = foundOrders;
                // #region agent log
                fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.foundOrdersDeep',message:'Found orders in deep search',data:{provider:provider.id,ordersFound:foundOrders.length,firstOrder:foundOrders[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
                // #endregion
              }
            }

            // #region agent log - FINAL DATA BEFORE SEND
            fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.finalDataBeforeSend',message:'FINAL extracted data being sent to backend',data:{provider:provider.id,extractedDataKeys:Object.keys(extractedData),hasOrders:!!extractedData.orders,ordersLength:Array.isArray(extractedData.orders)?extractedData.orders.length:0,firstOrderSample:Array.isArray(extractedData.orders)&&extractedData.orders.length>0?extractedData.orders[0]:null,extractedDataStringified:JSON.stringify(extractedData).substring(0,2000),proofIdentifier:proof?.identifier,proofId:proof?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          } catch (e) {
            console.error('Error extracting data');
            // #region agent log
            const errorMessage = e instanceof Error ? e.message : String(e);
            fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.extractionError',message:'Error during data extraction',data:{provider:provider.id,error:errorMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }

          const token = `privy_${user.id}_${user?.email?.address || 'user'}`;

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
          fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.onSuccess.backendResponse',message:'Backend response received',data:{provider:provider.id,success:data.success,contributionId:data.contribution?.id,pointsAwarded:data.contribution?.pointsAwarded,orderCount:data.contribution?.orderCount,error:data.error,message:data.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
          // #endregion

          if (data.success) {
            // Immediately refresh data
            await fetchUserData(true);
            showToast('success', `${provider.name} Verified!`, `+${data.contribution?.pointsAwarded || 500} points earned`);
          } else {
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
          
          // Check if tab is hidden - if so, don't show error yet (verification might still be in progress)
          const tabHidden = document.hidden || !isTabVisible;
          const timeSinceStart = verificationStartTime ? Date.now() - verificationStartTime : 0;
          
          // Log to server with tab visibility info
          fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.handleContribute.onError',message:'Reclaim error triggered',data:{provider:provider.id,errorMessage:error?.message || error?.toString(),tabHidden,isTabVisible,timeSinceStart,verificationUrl:verificationUrl || null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          
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
          
          // CRITICAL FIX: If tab is hidden, don't show error immediately
          // Verification might still be in progress in Reclaim app
          // Wait and check again when tab becomes visible
          if (tabHidden && (timeSinceStart < 120000)) { // Less than 2 minutes - likely still in progress
            fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.handleContribute.onError',message:'Tab hidden - deferring error display',data:{provider:provider.id,errorMessage,tabHidden,timeSinceStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            
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

                  const token = `privy_${user.id}_${user?.email?.address || 'user'}`;

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

                  const token = `privy_${user.id}_${user?.email?.address || 'user'}`;

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
          
          fetch(`${API_URL}/api/logs/debug`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.handleContribute.onError.final',message:'Final error handling',data:{provider:provider.id,tabHidden:tabHiddenFinal,timeSinceStart:timeSinceStartFinal},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          
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

      {/* Shared Dashboard Header */}
      <DashboardHeader />

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
            className="onboarding-card"
            onMouseEnter={() => setIsHoveringOnboarding(true)}
            onMouseLeave={() => setIsHoveringOnboarding(false)}
          >
            <button
              className="onboarding-close"
              onClick={dismissOnboarding}
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
                      <li>Install the Reclaim verified app from the Google Play Store or App Store</li>
                      <li>Connect your accounts (Zomato, GitHub, Netflix) to verify your data anonymously</li>
                      <li>Login and complete your verification securely</li>
                      <li>Start contributing by sharing verified proofs through the app</li>
                      <li>Each successful contribution earns you points</li>
                      <li>Earn more points to climb higher on the leaderboard</li>
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
            <p style={{ fontSize: 16, fontWeight: 500 }}>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <section className="stats-grid animate-enter">
              <div className="stat-card">
                  <span className="stat-label">Total Points</span>
                  <span className="stat-value">{points?.balance?.toLocaleString() || 0}</span>
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
                <h2>Contribute & Earn</h2>
                <p>Connect your accounts to verify data and earn rewards.</p>
              </div>

              <div className="providers-grid">
                {PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    className={`provider-card ${activeProvider === provider.id ? "active" : ""}`}
                  >
                    <div className="provider-header">
                      <img src={provider.logo} alt={`${provider.name} logo`} className="provider-logo" />
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
                          <>Connect</>
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
                    const provider = getProviderInfo(contrib.dataType);
                    // Get expected points based on dataType and data
                    let expectedPoints = 0;
                    if (contrib.dataType === 'github_profile') {
                      expectedPoints = 20;
                    } else if (contrib.dataType === 'netflix_watch_history') {
                      const titles = contrib.totalTitles || contrib.sellableData?.metadata?.data_quality?.completeness || 0;
                      expectedPoints = 50 + (parseInt(titles) || 0) * 10;
                    } else if (contrib.dataType === 'zomato_order_history') {
                      const orders = contrib.totalOrders || contrib.sellableData?.order_metrics?.total_orders || 0;
                      expectedPoints = 50 + (parseInt(orders) || 0) * 10;
                    }
                    
                    // Match points from history - find closest match within 30 seconds for this specific contribution
                    const contribTime = new Date(contrib.createdAt).getTime();
                    const matchedPoints = points?.history?.find((p: any) => {
                      const pointsTime = new Date(p.createdAt).getTime();
                      const diff = Math.abs(pointsTime - contribTime);
                      // Tighter time window (30 seconds) to avoid cross-matching
                      return p.reason === 'data_contribution' && diff < 30 * 1000;
                    });
                    // Use matched points if found, otherwise use expected points based on contribution data
                    const pointsAmount = matchedPoints?.points || expectedPoints;
                    return (
                      <div key={contrib.id} className="activity-item">
                        <div className="activity-info">
                          <span className="activity-title">{provider.name} Verification</span>
                          <span className="activity-time">{new Date(contrib.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        {pointsAmount > 0 && (
                          <div className="activity-points">+{pointsAmount}</div>
                        )}
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08);
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
  }

  .provider-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    border-color: #e5e7eb;
    border-top-color: #111827;
  }

  .provider-header { display: flex; align-items: center; gap: 12px; margin-bottom: 2px; }
  .provider-logo { width: 32px; height: 32px; object-fit: contain; border-radius: 8px; }
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

  .onboarding-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

  .onboarding-card:hover .onboarding-content {
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

  .onboarding-card:hover .onboarding-description {
    opacity: 1;
    max-height: 300px;
    margin-bottom: 16px;
  }
  
  .onboarding-line-break {
    display: none;
  }

  .onboarding-card:hover .onboarding-line-break {
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

  .onboarding-card:hover .onboarding-video-container {
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
    .onboarding-card:hover .onboarding-content {
      grid-template-columns: 1fr 400px;
      gap: 32px;
    }

    .onboarding-card:hover .onboarding-video-container {
      max-height: 225px;
      padding-bottom: 56.25%;
    }
  }

  @media (max-width: 768px) {
    .onboarding-card {
      padding: 32px 24px;
    }

    .onboarding-card:hover .onboarding-content {
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

    .onboarding-card:hover .onboarding-video-container {
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

  .onboarding-card:hover .onboarding-hover-hint {
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
    .stats-grid { grid-template-columns: 1fr; }
    .providers-grid { grid-template-columns: repeat(2, 1fr); }
    .welcome-section { flex-direction: column; align-items: flex-start; gap: 16px; }
    .onboarding-content {
      grid-template-columns: 1fr;
      gap: 20px;
      min-height: 40px;
    }
    .onboarding-card:hover .onboarding-content {
      align-items: start;
    }
    .onboarding-video-container {
      grid-column: 1;
      grid-row: auto;
      max-height: 197px;
      margin-top: 20px;
    }
    .onboarding-card:hover .onboarding-video-container {
      max-height: 197px;
    }
    .onboarding-card {
      padding: 12px;
      min-height: 48px;
      margin-bottom: 20px;
    }
    .onboarding-card:hover {
      padding: 20px;
      min-height: 180px;
    }
  }
  
  @media (max-width: 480px) {
    .providers-grid { grid-template-columns: 1fr; }
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
`;

export default DashboardPage;