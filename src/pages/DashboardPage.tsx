import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Copy, X, ExternalLink, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
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
  const { ready, authenticated, user, logout } = usePrivy();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [points, setPoints] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contributing, setContributing] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedData = useRef(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'info', title: '', message: '' });

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/');
    }
  }, [ready, authenticated, navigate]);

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || null;
  const shortWalletAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
    : null;

  // Fetch user data
  const fetchUserData = useCallback(async (showRefresh = false) => {
    if (!user?.id) return;

    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const token = `privy_${user.id}_${user?.email?.address || 'user'}`;

      // Verify/create user
      await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.email?.address, API_URL]);

  // Fetch on mount
  useEffect(() => {
    if (authenticated && user?.id && !hasLoadedData.current) {
      hasLoadedData.current = true;
      fetchUserData();
    }
  }, [authenticated, user?.id, fetchUserData]);

  const handleContribute = async (provider: typeof PROVIDERS[0]) => {
    if (!user) return;

    try {
      setContributing(provider.id);
      setActiveProvider(provider.id);
      setVerificationUrl(null);

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

      const requestUrl = await reclaimProofRequest.getRequestUrl();
      console.log('📎 Request URL:', requestUrl);
      setVerificationUrl(requestUrl);

      await reclaimProofRequest.startSession({
        onSuccess: async (proofs: any) => {
          console.log('✅ Proof received:', proofs);
          setVerificationUrl(null);
          setActiveProvider(null);

          const proof = Array.isArray(proofs) ? proofs[0] : proofs;
          if (!proof) {
            alert('No proof data received');
            return;
          }

          let extractedData: any = {};
          try {
            // DEBUG: Log full proof structure
            console.log('🔍 DEBUG - Full proof object:', JSON.stringify(proof, null, 2));
            console.log('🔍 DEBUG - proof.claimData:', proof.claimData);
            console.log('🔍 DEBUG - proof.publicData:', proof.publicData);

            // Extract from context.extractedParameters
            if (proof.claimData?.context) {
              const context = typeof proof.claimData.context === 'string'
                ? JSON.parse(proof.claimData.context)
                : proof.claimData.context;
              console.log('🔍 DEBUG - Parsed context:', context);
              extractedData = context.extractedParameters || {};
            }

            // Extract from extractedParameterValues
            if (proof.extractedParameterValues) {
              console.log('🔍 DEBUG - extractedParameterValues:', proof.extractedParameterValues);
              extractedData = { ...extractedData, ...proof.extractedParameterValues };
            }

            // IMPORTANT: Extract from publicData (contains order history!)
            if (proof.publicData) {
              console.log('🔍 DEBUG - publicData:', proof.publicData);
              extractedData = { ...extractedData, ...proof.publicData };
            }

            console.log('🔍 DEBUG - Final extractedData:', extractedData);
          } catch (e) {
            console.error('Error extracting data:', e);
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
          console.log('📨 Backend response:', data);

          if (data.success) {
            // Immediately refresh data
            await fetchUserData(true);
            showToast('success', `${provider.name} Verified!`, `+${data.contribution?.pointsAwarded || 500} points earned`);
          } else {
            showToast('error', 'Verification Failed', data.message || 'Unknown error');
          }
        },
        onError: (error: any) => {
          console.error('Reclaim error:', error);
          setVerificationUrl(null);
          setActiveProvider(null);
          showToast('error', 'Verification Failed', error.message || 'Unknown error');
        }
      });

    } catch (error: any) {
      console.error('Error:', error);
      setVerificationUrl(null);
      setActiveProvider(null);
      showToast('error', 'Error', error.message || String(error));
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

      {/* Custom Dashboard Header */}
      <header className="dashboard-header">
        <img src="/images/navlogo.jpg" alt="MYRAD" className="dash-logo" />
        <div className="header-right">
          {shortWalletAddress && (
            <button onClick={copyWalletAddress} className="wallet-badge">
              {copiedAddress ? 'Copied!' : shortWalletAddress}
              <Copy size={12} />
            </button>
          )}
          <button onClick={() => fetchUserData(true)} className="btn-refresh" disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </button>
          <button onClick={logout} className="btn-logout">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Welcome */}
        <div className="welcome-text">
          <h1>Dashboard</h1>
          <p>Welcome back</p>
        </div>


        {loading ? (
          <div className="loading-state">
            <Loader2 className="spin" size={32} color="#fff" />
            <p>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Points</span>
                <span className="stat-value">{points?.balance?.toLocaleString() || 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Contributions</span>
                <span className="stat-value">{contributions.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Status</span>
                <span className="stat-value">Active</span>
              </div>
            </section>

            {/* Contribute Section */}
            <section className="contribute-section">
              <div className="section-header">
                <h2>Contribute & Earn</h2>
                <p>Verify your data to earn points</p>
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

                    {/* QR Code Section */}
                    {activeProvider === provider.id && verificationUrl && (
                      <div className="qr-section">
                        <p className="qr-title">Scan to verify</p>
                        <div className="qr-container">
                          <QRCode value={verificationUrl} size={120} level="M" />
                        </div>
                        <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="qr-link">
                          <ExternalLink size={14} /> Open Link
                        </a>
                        <button onClick={() => { setVerificationUrl(null); setActiveProvider(null); }} className="qr-cancel">
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleContribute(provider)}
                      disabled={contributing !== null}
                      className="btn-verify"
                    >
                      {contributing === provider.id ? (
                        <><Loader2 size={16} className="spin" /> Verifying...</>
                      ) : (
                        <>Connect</>
                      )}
                    </button>
                  </div>
                ))}

                {/* Coming Soon Card */}
                <div className="provider-card coming-soon">
                  <div className="provider-header">
                    <span className="coming-soon-text">Coming Soon</span>
                  </div>
                  <p className="coming-soon-desc">More integrations on the way</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>

              <div className="activity-list">
                {contributions.length > 0 ? (
                  contributions.slice(0, 10).map((contrib: any) => {
                    const provider = getProviderInfo(contrib.dataType);
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
                        <div className="activity-points">+500</div>
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
.provider-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.provider-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.provider-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.provider-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.provider-desc {
  font-size: 13px;
  opacity: 0.7;
}

  .dashboard {
    min-height: 100vh;
    background: #ffffff;
    color: #111827;
    font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .dashboard-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: #ffffff;
    color: #374151;
    font-family: 'Satoshi', sans-serif;
  }
  
  .auth-card {
    text-align: center;
    padding: 48px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 24px;
    max-width: 400px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  
  .auth-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: rgba(79, 70, 229, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  
  .auth-card h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
  }
  
  .auth-card .brand { color: #4F46E5; }
  
  .auth-card p {
    color: #666;
    margin-bottom: 32px;
    line-height: 1.6;
  }
  
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: #1a1a1a;
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); }
  
  .back-link {
    display: block;
    margin-top: 24px;
    color: #666;
    text-decoration: none;
    font-size: 14px;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .dash-logo {
    height: 24px;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .wallet-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    color: rgba(0, 0, 0, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .points-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(79, 70, 229, 0.08);
    border: 1px solid rgba(79, 70, 229, 0.2);
    border-radius: 100px;
    color: #4F46E5;
    font-size: 14px;
    font-weight: 600;
  }
  
  .btn-logout {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #374151;
    border: 1px solid #374151;
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-logout:hover { background: #1f2937; }
  
  .dashboard-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
  }
  
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  
  .welcome-text {
    margin-bottom: 32px;
  }
  
  .welcome-text h1 {
    font-size: 32px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }
  
  .welcome-text p {
    color: #6b7280;
    font-size: 14px;
  }
  
  .btn-refresh {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    color: #666;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-refresh:hover { background: rgba(0, 0, 0, 0.1); color: #1a1a1a; }
  
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px;
    gap: 16px;
    color: #666;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr; }
  }
  
  .stat-card {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-label { font-size: 14px; color: #6b7280; }
  .stat-value { font-size: 32px; font-weight: 700; color: #111827; }
  
  .contribute-section, .activity-section {
    margin-bottom: 32px;
  }
  
  .section-header {
    margin-bottom: 20px;
  }
  
  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  .section-header p {
    color: #666;
    font-size: 14px;
  }
  
  .providers-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 900px) {
    .providers-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .providers-grid { grid-template-columns: 1fr; }
  }
  
  .provider-card {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .provider-card:hover {
    border-color: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  }
  
  .provider-card.active {
    border-color: #374151;
  }
  
  .provider-card.coming-soon {
    border-style: dashed;
    background: #f9fafb;
  }
  
  .coming-soon-text {
    font-size: 16px;
    font-weight: 600;
    color: #9ca3af;
  }
  
  .coming-soon-desc {
    font-size: 12px;
    color: #9ca3af;
  }
  
  .provider-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .provider-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
  
  .provider-name {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  .provider-info {
    flex: 1;
  }
  
  .provider-info h3 { 
    font-size: 18px; 
    font-weight: 600; 
    margin-bottom: 4px;
    color: #1a1a1a;
  }
  
  .provider-info span { 
    font-size: 13px; 
    color: #666;
    display: block;
  }
  
  .provider-reward {
    margin-left: auto;
    text-align: right;
  }
  
  .reward-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: var(--provider-color);
  }
  
  .reward-label { font-size: 12px; color: #666; }
  
  .qr-section {
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .qr-title {
    color: #1a1a1a;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }
  
  .qr-container {
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .qr-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #1a1a1a;
    border-radius: 10px;
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .qr-link:hover {
    background: #333;
    transform: translateY(-2px);
  }
  
  .qr-cancel {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: #666;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .qr-cancel:hover {
    color: #1a1a1a;
  }
  
  .btn-verify {
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background: #374151;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }
  
  .btn-verify:hover { background: #1f2937; transform: translateY(-1px); }
  .btn-verify:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  
  .activity-list {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .activity-item:last-child { border-bottom: none; }
  
  .activity-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  
  .activity-info { flex: 1; }
  .activity-title { display: block; font-weight: 500; font-size: 14px; margin-bottom: 2px; }
  .activity-time { font-size: 12px; color: #666; }
  
  .activity-points {
    font-size: 16px;
    font-weight: 700;
    color: #22C55E;
  }
  
  .empty-state {
    padding: 48px;
    text-align: center;
  }
  
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-state p { font-size: 16px; font-weight: 500; margin-bottom: 4px; }
  .empty-state span { font-size: 14px; color: #666; }
  
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* Toast Notification Styles */
  .toast {
    position: fixed;
    top: 24px;
    right: 24px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    background: rgba(20, 20, 20, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .toast-success { border-color: #22C55E; }
  .toast-success .toast-icon { color: #22C55E; }

  .toast-error { border-color: #EF4444; }
  .toast-error .toast-icon { color: #EF4444; }

  .toast-info { border-color: #3B82F6; }
  .toast-info .toast-icon { color: #3B82F6; }

  .toast-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .toast-content {
    flex: 1;
  }

  .toast-content strong {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 2px;
  }

  .toast-content p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.4;
  }

  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 4px;
    margin: -4px -4px -4px 0;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  /* Welcome section layout */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* Right-side action buttons */
.welcome-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Make buttons same height */
.btn-refresh,
.btn-logout {
  height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

`;

export default DashboardPage;