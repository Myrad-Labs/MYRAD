import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Link } from 'react-router-dom';
import { Coins, TrendingUp, Shield, Loader2, Zap, CheckCircle, ArrowRight, RefreshCw, Wallet, Copy, X, Sparkles, Award, Clock, ExternalLink } from 'lucide-react';
import QRCode from 'react-qr-code';

// Provider configurations
const PROVIDERS = [
  {
    id: 'zomato',
    name: 'Zomato',
    description: 'Order History',
    providerId: import.meta.env.VITE_ZOMATO_PROVIDER_ID || '',
    icon: '🍕',
    color: '#E23744',
    bgGradient: 'linear-gradient(135deg, #E23744 0%, #BE2D3B 100%)',
    points: 500,
    dataType: 'zomato_order_history'
  }
];

const DashboardPage = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || null;
  const shortWalletAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

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
        alert('❌ Reclaim configuration incomplete. Check your .env file.');
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
            alert(`✅ Success!\n\n${provider.name} verified!\n+${data.contribution?.pointsAwarded || 500} points earned!`);
          } else {
            alert(`❌ Error: ${data.message || 'Unknown error'}`);
          }
        },
        onError: (error: any) => {
          console.error('Reclaim error:', error);
          setVerificationUrl(null);
          setActiveProvider(null);
          alert(`Verification failed: ${error.message || 'Unknown error'}`);
        }
      });

    } catch (error: any) {
      console.error('Error:', error);
      setVerificationUrl(null);
      setActiveProvider(null);
      alert(`Error: ${error.message || error}`);
    } finally {
      setContributing(null);
    }
  };

  const getProviderInfo = (dataType: string) => {
    return PROVIDERS.find(p => p.dataType === dataType) || { icon: '📊', name: dataType, color: '#888' };
  };

  // Loading state
  if (!ready) {
    return (
      <div className="dashboard-loading">
        <style>{styles}</style>
        <Loader2 className="spin" size={40} color="#fff" />
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <div className="dashboard-auth">
        <style>{styles}</style>
        <div className="auth-card">
          <div className="auth-icon">
            <Shield size={48} color="#fff" />
          </div>
          <h1>Welcome to <span className="brand">MYRAD</span></h1>
          <p>Sign in to contribute your data privately and earn rewards</p>
          <button onClick={login} className="btn-primary">
            <Zap size={18} />
            Get Started
          </button>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <style>{styles}</style>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <Link to="/" className="logo">MYRAD</Link>

          <div className="header-right">
            {walletAddress && (
              <button onClick={copyWalletAddress} className="wallet-badge">
                <Wallet size={14} />
                {copiedAddress ? 'Copied!' : shortWalletAddress}
                <Copy size={12} />
              </button>
            )}

            <div className="points-badge">
              <Coins size={14} />
              <span>{points?.balance?.toLocaleString() || 0}</span>
            </div>

            <button onClick={logout} className="btn-logout">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h1>Welcome back! 👋</h1>
            <p>{user?.email?.address || 'User'}</p>
          </div>
          <button
            onClick={() => fetchUserData(true)}
            className="btn-refresh"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </section>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spin" size={32} color="#fff" />
            <p>Loading your data...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <section className="stats-grid">
              <div className="stat-card points-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Points</span>
                  <span className="stat-value">{points?.balance?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon contributions-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Contributions</span>
                  <span className="stat-value">{contributions.length}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon status-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Status</span>
                  <span className="stat-value status-active">Active</span>
                </div>
              </div>
            </section>

            {/* Contribute Section */}
            <section className="contribute-section">
              <div className="section-header">
                <h2><Sparkles size={20} /> Contribute & Earn</h2>
                <p>Verify your food delivery data to earn points</p>
              </div>

              <div className="providers-grid">
                {PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    className={`provider-card ${activeProvider === provider.id ? 'active' : ''}`}
                    style={{ '--provider-color': provider.color } as React.CSSProperties}
                  >
                    <div className="provider-header">
                      <div className="provider-icon">{provider.icon}</div>
                      <div className="provider-info">
                        <h3>{provider.name}</h3>
                        <span>{provider.description}</span>
                      </div>
                      <div className="provider-reward">
                        <span className="reward-value">+{provider.points}</span>
                        <span className="reward-label">points</span>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    {activeProvider === provider.id && verificationUrl && (
                      <div className="qr-section">
                        <p className="qr-title">Scan to verify</p>
                        <div className="qr-container">
                          <QRCode value={verificationUrl} size={160} level="M" />
                        </div>
                        <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="qr-link">
                          <ExternalLink size={14} />
                          Open Link
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
                      style={{ background: contributing === provider.id ? '#333' : provider.bgGradient }}
                    >
                      {contributing === provider.id ? (
                        <><Loader2 size={16} className="spin" /> Verifying...</>
                      ) : (
                        <><Zap size={16} /> Verify {provider.name}</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="activity-section">
              <div className="section-header">
                <h2><Clock size={20} /> Recent Activity</h2>
              </div>

              <div className="activity-list">
                {contributions.length > 0 ? (
                  contributions.slice(0, 10).map((contrib: any) => {
                    const provider = getProviderInfo(contrib.dataType);
                    return (
                      <div key={contrib.id} className="activity-item">
                        <div className="activity-icon" style={{ background: `${provider.color}20`, color: provider.color }}>
                          {provider.icon}
                        </div>
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
                    <div className="empty-icon">🍽️</div>
                    <p>No contributions yet</p>
                    <span>Verify your Zomato data above to earn points!</span>
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
  
  .dashboard {
    min-height: 100vh;
    background: #0A0A0B;
    color: #fff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .dashboard-loading, .dashboard-auth {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: #0A0A0B;
    color: #888;
    font-family: 'Inter', sans-serif;
  }
  
  .auth-card {
    text-align: center;
    padding: 48px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    max-width: 400px;
  }
  
  .auth-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  
  .auth-card h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }
  
  .auth-card .brand { color: #fff; }
  
  .auth-card p {
    color: #888;
    margin-bottom: 32px;
    line-height: 1.6;
  }
  
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: #fff;
    border: none;
    border-radius: 12px;
    color: #000;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15); }
  
  .back-link {
    display: block;
    margin-top: 24px;
    color: #666;
    text-decoration: none;
    font-size: 14px;
  }
  
  .dashboard-header {
    background: rgba(10, 10, 11, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    text-decoration: none;
    letter-spacing: -0.5px;
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .points-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 100px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
  
  .btn-logout {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #888;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-logout:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
  
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
  
  .welcome-text h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .welcome-text p {
    color: #666;
    font-size: 14px;
  }
  
  .btn-refresh {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #888;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-refresh:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
  
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
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .points-card { 
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .points-card .stat-icon { background: rgba(255, 255, 255, 0.08); color: #fff; }
  
  .contributions-icon { background: rgba(34, 197, 94, 0.1); color: #22C55E; }
  .status-icon { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
  
  .stat-content { display: flex; flex-direction: column; }
  .stat-label { font-size: 13px; color: #666; margin-bottom: 4px; }
  .stat-value { font-size: 28px; font-weight: 700; }
  .status-active { color: #22C55E; font-size: 16px; }
  
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
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    .providers-grid { grid-template-columns: 1fr; }
  }
  
  .provider-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s;
  }
  
  .provider-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--provider-color);
  }
  
  .provider-card.active {
    border-color: var(--provider-color);
    background: rgba(255, 255, 255, 0.04);
  }
  
  .provider-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .provider-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }
  
  .provider-info h3 { font-size: 18px; font-weight: 600; margin-bottom: 2px; }
  .provider-info span { font-size: 13px; color: #666; }
  
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
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .qr-title {
    color: var(--provider-color);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  .qr-container {
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 16px;
  }
  
  .qr-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .qr-cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    padding: 10px;
    background: none;
    border: none;
    color: #666;
    font-size: 13px;
    cursor: pointer;
  }
  
  .btn-verify {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .btn-verify:hover { transform: translateY(-2px); }
  .btn-verify:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  
  .activity-list {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    overflow: hidden;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
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
`;

export default DashboardPage;
