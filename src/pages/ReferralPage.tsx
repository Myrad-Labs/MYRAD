import React, { useState } from 'react';
import { Copy, Check, Trophy, Medal, Award } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

interface ReferralUser {
  id: string;
  walletAddress: string;
  referralPoints: number;
}

// Mock data for the referral leaderboard
const mockReferralData: ReferralUser[] = [
  { id: '1', walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2', referralPoints: 1250 },
  { id: '2', walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', referralPoints: 980 },
  { id: '3', walletAddress: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', referralPoints: 875 },
  { id: '4', walletAddress: '0x1234567890123456789012345678901234567890', referralPoints: 720 },
  { id: '5', walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', referralPoints: 650 },
  { id: '6', walletAddress: '0x9876543210987654321098765432109876543210', referralPoints: 590 },
  { id: '7', walletAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', referralPoints: 480 },
  { id: '8', walletAddress: '0xcafebabecafebabecafebabecafebabecafebabe', referralPoints: 420 },
  { id: '9', walletAddress: '0x1111111111111111111111111111111111111111', referralPoints: 350 },
  { id: '10', walletAddress: '0x2222222222222222222222222222222222222222', referralPoints: 280 },
];

const ReferralPage: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  // Mock data for user's referral stats
  const userReferralCode = 'MYRAD-XYZ123';
  const peopleReferred = 15;

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemType);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shortAddress = (addr: string) => {
    return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} style={{ color: '#FFD700' }} />;
      case 2:
        return <Medal size={20} style={{ color: '#C0C0C0' }} />;
      case 3:
        return <Award size={20} style={{ color: '#CD7F32' }} />;
      default:
        return null;
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

          .leaderboard-container {
            background: #ffffff;
            border: 1px solid #f3f4f6;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .lb-header {
            display: grid;
            grid-template-columns: 80px 1fr 180px;
            gap: 16px;
            padding: 16px 24px;
            background: #fafafa;
            border-bottom: 2px solid #f3f4f6;
            font-weight: 700;
            color: #6b7280;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .lb-row {
            display: grid;
            grid-template-columns: 80px 1fr 180px;
            gap: 16px;
            padding: 20px 24px;
            align-items: center;
            border-bottom: 1px solid #f7f7f8;
            background: #fff;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }

          .lb-row:hover {
            background: linear-gradient(90deg, #fafafa 0%, #ffffff 100%);
            transform: translateX(4px);
            box-shadow: inset 4px 0 0 #111827, 0 2px 8px rgba(0, 0, 0, 0.04);
          }

          .lb-row.top-3 {
            background: linear-gradient(90deg, #fffbeb 0%, #ffffff 100%);
          }

          .lb-row.top-3:hover {
            background: linear-gradient(90deg, #fef3c7 0%, #fffbeb 100%);
            box-shadow: inset 4px 0 0 #f59e0b, 0 4px 12px rgba(245, 158, 11, 0.1);
          }

          .lb-rank {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 18px;
            color: #111827;
          }

          .rank-number {
            min-width: 32px;
            text-align: center;
          }

          .lb-wallet {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .wallet-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 8px;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .wallet-wrapper:hover {
            background: #f3f4f6;
            border-color: #e5e7eb;
          }

          .lb-row:hover .wallet-wrapper {
            background: #e5e7eb;
            border-color: #d1d5db;
          }

          .wallet-address {
            font-family: 'Courier New', monospace;
            color: #111827;
            font-weight: 600;
            font-size: 13px;
          }

          .copy-btn {
            padding: 4px;
            background: transparent;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: #9ca3af;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .wallet-wrapper:hover .copy-btn {
            color: #6b7280;
          }

          .copy-btn.copied {
            color: #059669;
          }

          .lb-points {
            text-align: right;
            font-weight: 700;
            font-size: 18px;
            color: #111827;
          }

          @media (max-width: 768px) {
            .lb-header,
            .lb-row {
              grid-template-columns: 60px 1fr 120px;
              gap: 12px;
              padding: 16px;
            }

            .lb-points {
              font-size: 16px;
            }

            .rank-number {
              font-size: 16px;
            }

            .stat-value {
              font-size: 28px;
            }

            .referral-code {
              font-size: 18px;
            }
          }

          @media (max-width: 480px) {
            .lb-header {
              grid-template-columns: 1fr 1fr;
            }

            .lb-header > div:first-child {
              display: none;
            }

            .lb-row {
              grid-template-columns: 1fr;
              padding: 16px;
              gap: 12px;
            }

            .lb-rank {
              margin-bottom: 8px;
            }

            .lb-points {
              text-align: left;
            }
          }
        `}</style>

        <div className="animate-enter" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, margin: 0, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Referral Program
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 16 }}>Share your referral code and earn points</p>
        </div>

        <div className="stats-container animate-enter">
          <div className="stat-card">
            <div className="stat-label">Your Referral Code</div>
            <div className="referral-code-wrapper">
              <div className="referral-code">{userReferralCode}</div>
              <button
                className={`copy-code-btn ${copiedItem === 'code' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(userReferralCode, 'code')}
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
            <div className="stat-value">{peopleReferred}</div>
          </div>
        </div>

        <div className="animate-enter" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, margin: 0, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Referral Points Leaderboard
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Top referrers ranked by referral points</p>
        </div>

        <div className="leaderboard-container animate-enter">
          <div className="lb-header">
            <div>Rank</div>
            <div>Wallet Address</div>
            <div style={{ textAlign: 'right' }}>Referral Points</div>
          </div>

          {mockReferralData.map((row, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            const isCopied = copiedItem === row.walletAddress;

            return (
              <div
                key={row.id}
                className={`lb-row ${isTopThree ? 'top-3' : ''}`}
              >
                <div className="lb-rank">
                  <span className="rank-number">{rank}</span>
                  {getRankIcon(rank)}
                </div>

                <div className="lb-wallet">
                  <div
                    className="wallet-wrapper"
                    onClick={() => copyToClipboard(row.walletAddress, row.walletAddress)}
                    title={isCopied ? 'Copied' : 'Click to copy address'}
                  >
                    <div className="wallet-address">
                      {isCopied ? 'Copied!' : shortAddress(row.walletAddress)}
                    </div>
                  </div>
                </div>

                <div className="lb-points">{row.referralPoints.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
