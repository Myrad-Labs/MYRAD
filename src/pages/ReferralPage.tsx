import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Copy, Check, Lock } from 'lucide-react';
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

}

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
        ) : null}
      </div>
    </div>
  );
};

export default ReferralPage;
