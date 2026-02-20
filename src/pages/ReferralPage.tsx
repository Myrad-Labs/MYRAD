import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Check, Lock, Award, Star, Share2 } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

interface ReferralData {
  success: boolean;
  locked: boolean;
  message?: string;
  referral_code?: string;
  referral_count?: number;
  currentPoints?: number;
  successful_ref?: number;
  referral_activity?: Array<{ id: string; user_id?: string; points: number; reason: string; created_at: string }>;

}

const TIER_COLORS: Record<string, { primary: string; gradient: string; glow: string; text: string; image?: string }> = {
  none:     { primary: '#4b5563', gradient: 'linear-gradient(135deg, #374151, #6b7280)', glow: '0 0 40px rgba(107,114,128,0.3)', text: '#9ca3af' },
  bronze:   { primary: '#cd7f32', gradient: 'linear-gradient(135deg, #92400e, #d97706)', glow: '0 0 40px rgba(205,127,50,0.4)', text: '#d4a26a', image: '/bronze.svg' },
  silver:   { primary: '#c0c0c0', gradient: 'linear-gradient(135deg, #6b7280, #d1d5db)', glow: '0 0 40px rgba(192,192,192,0.4)', text: '#d1d5db', image: '/silver.svg' },
  gold:     { primary: '#ffd700', gradient: 'linear-gradient(135deg, #b45309, #fbbf24)', glow: '0 0 40px rgba(255,215,0,0.4)', text: '#fbbf24', image: '/gold.svg' },
  platinum: { primary: '#e5e4e2', gradient: 'linear-gradient(135deg, #9ca3af, #e5e7eb)', glow: '0 0 40px rgba(229,228,226,0.4)', text: '#e5e7eb', image: '/platinum.svg' },
  diamond:  { primary: '#b9f2ff', gradient: 'linear-gradient(135deg, #67e8f9, #a5f3fc)', glow: '0 0 40px rgba(185,242,255,0.5)', text: '#a5f3fc', image: '/diamond.svg' },
  champion: { primary: '#ff6b6b', gradient: 'linear-gradient(135deg, #ef4444, #f97316)', glow: '0 0 40px rgba(255,107,107,0.5)', text: '#fca5a5', image: '/champion.svg' },
};

const ReferralPage: React.FC = () => {
  const { user } = usePrivy();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const walletAddress = user?.wallet?.address;

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!walletAddress) {
        setLoading(false);
        setError('Please connect your wallet');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/referral-data?wallet_address=${encodeURIComponent(walletAddress)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch referral data');
        }

        const data: ReferralData = await response.json();
        setReferralData(data);
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [walletAddress, API_URL]);

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemType);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Tier definitions and helper
  const TIERS = [
    { key: 'bronze', name: 'Bronze', min: 0, max: 5 },
    { key: 'silver', name: 'Silver', min: 6, max: 15 },
    { key: 'gold', name: 'Gold', min: 16, max: 35 },
    { key: 'platinum', name: 'Platinum', min: 36, max: 70 },
    { key: 'diamond', name: 'Diamond', min: 71, max: 150 },
    { key: 'champion', name: 'Champion', min: 151, max: 999 }
  ];

  const computeTier = (count: number) => {
    // Always assign a tier - users start at Bronze (0 referrals)
    let current = TIERS[0]; // Default to Bronze
    
    for (const t of TIERS) {
      if (count >= t.min && count <= t.max) {
        current = t;
        break;
      }
    }
    
    // If count exceeds max, assign highest tier
      if (count > TIERS[TIERS.length - 1].max) {
        current = TIERS[TIERS.length - 1];
    }

    const nextTier = TIERS.find(t => t.min > count) || null;

    let remaining = 0;
    let progressPercent = 0;

    if (nextTier) {
      remaining = Math.max(0, nextTier.min - count);
      // Calculate progress within current tier range
      const currentRange = current.max - current.min + 1;
      const progressInCurrentTier = count - current.min;
      progressPercent = Math.min(100, (progressInCurrentTier / currentRange) * 100);
    } else {
      remaining = 0;
      progressPercent = 100;
    }

    return { current, nextTier, remaining, progressPercent };
  };

  const renderTierBadge = (tierKey: string, size: number = 64) => {
    const colors = TIER_COLORS[tierKey] || TIER_COLORS.none;
    
    // If we have an image for this tier, use it
    if (colors.image) {
      return (
        <div style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: `drop-shadow(${colors.glow})`,
        }}>
          <img 
            src={colors.image} 
            alt={`${tierKey} tier badge`}
            style={{
              width: size,
              height: size,
              objectFit: 'contain',
            }}
          />
        </div>
      );
    }
    
    // Fallback for 'none' tier (no image)
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `${colors.glow}, inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.25)`,
        border: `2px solid ${colors.primary}`,
        position: 'relative' as const,
      }}>
        <div style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: '50%',
          border: `2px solid rgba(255,255,255,0.2)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent 60%)`,
        }}>
          <svg viewBox="0 0 24 24" width={size * 0.35} height={size * 0.35} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
            <polygon points="12,2 22,9 18,22 6,22 2,9" />
          </svg>
        </div>
        <div style={{
          position: 'absolute' as const,
          top: 3,
          left: '15%',
          width: '55%',
          height: '35%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
        }} />
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'Satoshi, Inter, sans-serif' }}>
      <Sidebar />
      <DashboardHeader />
      <div className="referral-wrapper" style={{ maxWidth: 1000, margin: '0 auto', padding: 32, transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          @keyframes pulseGlow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          .animate-enter {
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }

          .referral-wrapper {
            padding-left: 70px !important;
          }

          @media (max-width: 768px) {
            .referral-wrapper {
              padding-left: 24px !important;
              padding-right: 24px !important;
              padding-bottom: 90px !important;
            }
          }

          .stats-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 32px;
          }

          @media (max-width: 640px) {
            .stats-container {
              grid-template-columns: 1fr;
            }
            .tier-card-main {
              padding: 20px !important;
            }
            .tier-card-main .tier-header {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 12px !important;
            }
            .tier-card-main .tier-badge-3d {
              align-self: center;
            }
            .tier-count-value {
              font-size: 28px !important;
            }
          }

          .locked-card {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border-radius: 16px;
            padding: 32px 28px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            text-align: center;
            grid-column: 1 / -1;
            margin-bottom: 32px;
          }

          .locked-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            color: rgba(255, 255, 255, 0.4);
          }

          .locked-message {
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }

          .loading-container {
            padding: 80px 40px;
            text-align: center;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #111827;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error-container {
            padding: 80px 40px;
            text-align: center;
          }

          .error-message {
            color: #ef4444;
            font-size: 16px;
            margin-bottom: 16px;
          }

          .stat-card {
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            border-radius: 16px;
            padding: 24px 28px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          }

          .stat-label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }

          .stat-value {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.2;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .referral-code-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
          }

          .referral-code {
            font-family: 'Courier New', monospace;
            color: #ffffff;
            font-weight: 700;
            font-size: 24px;
            letter-spacing: 1px;
          }

          .copy-code-btn {
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.9);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
          }

          .copy-code-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
          }

          .copy-code-btn.copied {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.4);
            color: #22c55e;
          }

          .share-btn {
            padding: 6px 16px;
            background: transparent;
            border: 1.5px solid rgba(99, 102, 241, 0.6);
            border-radius: 8px;
            cursor: pointer;
            color: #818cf8;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .share-btn:hover {
            background: rgba(99, 102, 241, 0.1);
            border-color: #818cf8;
          }

          @media (max-width: 768px) {
            .stat-value {
              font-size: 28px;
            }

            .referral-code {
              font-size: 18px;
            }
          }
        `}</style>

        <div className="animate-enter" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, margin: 0, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Referral Program
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 16 }}>Share your referral code and earn points</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#6b7280' }}>Loading referral data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : referralData?.locked ? (
          <div className="locked-card animate-enter">
            <Lock className="locked-icon" size={48} />
            <p className="locked-message">{referralData.message || 'Reach 100 points to unlock ref'}</p>
            {referralData.currentPoints !== undefined && (
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, marginTop: 8 }}>
                Current points: {referralData.currentPoints}
              </p>
            )}
          </div>
        ) : referralData?.success ? (
          <>
            {/* Dark Tier Card */}
            <div className="animate-enter" style={{ marginBottom: 32 }}>
              {(() => {
                const successful = referralData?.successful_ref ?? 0;
                const tier = computeTier(successful);
                const tierKey = tier.current.key; // Always has a tier (Bronze at minimum)
                const colors = TIER_COLORS[tierKey];
                const nextTierKey = tier.nextTier?.key || 'champion';
                const nextColors = TIER_COLORS[nextTierKey] || TIER_COLORS.champion;

                return (
                  <div className="tier-card-main" style={{
                    background: 'linear-gradient(145deg, #0c1220 0%, #111827 40%, #0f172a 100%)',
                    borderRadius: 20,
                    padding: '28px 32px',
                    position: 'relative' as const,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}>
                    {/* Subtle diagonal lines background */}
                    <div style={{
                      position: 'absolute' as const,
                      inset: 0,
                      opacity: 0.03,
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)',
                    }} />

                    {/* Top row: Tier name + Share button */}
                    <div className="tier-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative' as const,
                      zIndex: 1,
                      marginBottom: 28,
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
                        <span style={{ color: colors.text }}>
                          {tier.current.name}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.9)', marginLeft: 6 }}>Tier</span>
                      </div>
                      <button
                        className="share-btn"
                        onClick={() => {
                          const text = `I'm on ${tier.current.name} Tier in MYRAD Referral Program! Join using my code: ${referralData.referral_code}`;
                          navigator.clipboard.writeText(text);
                          setCopiedItem('share');
                          setTimeout(() => setCopiedItem(null), 2000);
                        }}
                      >
                        {copiedItem === 'share' ? <Check size={14} /> : <Share2 size={14} />}
                        {copiedItem === 'share' ? 'Copied!' : 'Share'}
                      </button>
                    </div>

                    {/* Main content row: Count + Badge */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative' as const,
                      zIndex: 1,
                      marginBottom: 20,
                    }}>
                      <div>
                        <div className="tier-count-value" style={{
                          fontSize: 42,
                          fontWeight: 800,
                          color: '#fff',
                          lineHeight: 1.1,
                          letterSpacing: '-0.02em',
                        }}>
                          {successful}
                          <span style={{
                            fontSize: 16,
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.4)',
                            marginLeft: 10,
                          }}>
                            / {tier.nextTier ? `${tier.nextTier.min} ${tier.nextTier.name}` : 'Max'}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.45)',
                          marginTop: 6,
                          fontWeight: 500,
                        }}>
                          {tier.nextTier
                            ? `${tier.remaining} more referral${tier.remaining !== 1 ? 's' : ''} to reach ${tier.nextTier.name}`
                            : 'You\'ve reached the highest tier!'}
                        </div>
                      </div>
                      <div className="tier-badge-3d">
                        {renderTierBadge(tierKey, 68)}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      height: 6,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 6,
                      overflow: 'hidden',
                      position: 'relative' as const,
                      zIndex: 1,
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.max(tier.progressPercent, successful > 0 ? 3 : 0)}%`,
                        background: colors.gradient,
                        borderRadius: 6,
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 12px ${colors.primary}80`,
                      }} />
                    </div>

                    {/* Tier milestone badges */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 20,
                      position: 'relative' as const,
                      zIndex: 1,
                    }}>
                      {TIERS.map((t, idx) => {
                        const isAchieved = successful >= t.min;
                        const isCurrent = tier.current.key === t.key;
                        const tColors = TIER_COLORS[t.key];
                        const badgeSize = isCurrent ? 40 : 32;

                        return (
                          <div key={t.key} style={{
                            display: 'flex',
                            flexDirection: 'column' as const,
                            alignItems: 'center',
                            flex: 1,
                          }}>
                            {tColors.image ? (
                              <div style={{
                                width: badgeSize,
                                height: badgeSize,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isAchieved ? 1 : 0.3,
                                filter: isAchieved ? 'none' : 'grayscale(100%)',
                                transition: 'all 0.3s ease',
                                transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                              }}>
                                <img 
                                  src={tColors.image} 
                                  alt={`${t.name} tier`}
                                  style={{
                                    width: badgeSize,
                                    height: badgeSize,
                                    objectFit: 'contain',
                                    filter: isCurrent ? `drop-shadow(0 0 8px ${tColors.primary}80)` : 'none',
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{
                                width: badgeSize,
                                height: badgeSize,
                                borderRadius: '50%',
                                background: isAchieved ? tColors.gradient : 'rgba(255,255,255,0.06)',
                                border: isCurrent
                                  ? `2px solid ${tColors.primary}`
                                  : isAchieved
                                    ? '1.5px solid rgba(255,255,255,0.15)'
                                    : '1.5px solid rgba(255,255,255,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? `0 0 16px ${tColors.primary}50` : 'none',
                              }}>
                                {isAchieved ? (
                                  isCurrent ? <Check size={14} color="#fff" /> : <Star size={10} color="rgba(255,255,255,0.7)" />
                                ) : (
                                  <div style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.15)',
                                  }} />
                                )}
                              </div>
                            )}
                            <div style={{
                              fontSize: 10,
                              fontWeight: isCurrent ? 700 : 500,
                              color: isAchieved ? tColors.text : 'rgba(255,255,255,0.25)',
                              marginTop: 6,
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase' as const,
                            }}>
                              {t.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="stats-container animate-enter">
              <div className="stat-card">
                <div className="stat-label">Your Referral Code</div>
                <div className="referral-code-wrapper">
                  <div className="referral-code">{referralData.referral_code}</div>
                  <button
                    className={`copy-code-btn ${copiedItem === 'code' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(referralData.referral_code || '', 'code')}
                    title="Copy referral code"
                  >
                    {copiedItem === 'code' ? (
                      <>
                        <Check size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">People Referred</div>
                <div className="stat-value">{referralData.referral_count || 0}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Successful Referrals</div>
                <div className="stat-value">{referralData.successful_ref ?? 0}</div>
              </div>
            </div>

            {/* Successful Ref Bonus section */}
            {referralData?.referral_activity && referralData.referral_activity.length > 0 && (
              <div style={{ marginTop: 20 }} className="animate-enter">
                <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Recent Referral Activity</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {referralData.referral_activity.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: '#f8fafc',
                        border: '1px solid #e6eef6',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ color: '#111827', fontWeight: 600, fontSize: 14 }}>
                          {item.reason
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, char => char.toUpperCase())
                          }
                        </div>

                        <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })},{" "}
                          {new Date(item.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {/* Points earned */}
                      <div style={{
                        fontWeight: 700,
                        color: '#16a34a',
                        fontSize: 14
                      }}>
                        +{item.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ReferralPage;
