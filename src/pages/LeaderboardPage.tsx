import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';

const mockUsers = [
  { wallet: '0xAaA1AaA1AaA1AaA1AaA1AaA1AaA1AaA1AaA1', points: 12400 },
  { wallet: '0xBbB2BbB2BbB2BbB2BbB2BbB2BbB2BbB2BbB2', points: 9800 },
  { wallet: '0xCcC3CcC3CcC3CcC3CcC3CcC3CcC3CcC3CcC3', points: 8600 },
  { wallet: '0xYou4You4You4You4You4You4You4You4You4You4', points: 5400 },
  { wallet: '0xEeE5EeE5EeE5EeE5EeE5EeE5EeE5EeE5EeE5', points: 4200 }
];

const LeaderboardPage: React.FC = () => {
  const { user } = usePrivy();
  const navigate = useNavigate();

  const myWallet = (user?.wallet?.address || '').toLowerCase() || null;

  // Sort descending by points and mark current user if wallet matches
  const list = mockUsers
    .slice()
    .sort((a, b) => b.points - a.points)
    .map((u) => ({ ...u, isYou: myWallet ? u.wallet.toLowerCase() === myWallet : false }));

  const shortAddress = (addr: string) => {
    if (!addr) return '';
    return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
      <DashboardHeader />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
        <style>{`
          .leaderboard-table { border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden; }
          .lb-header, .lb-row { display: grid; grid-template-columns: 80px 1fr 160px; gap: 0; padding: 12px 16px; align-items: center; }
          .lb-header { background: #fafafa; border-bottom: 1px solid #f3f4f6; font-weight: 700; color: #6b7280; }
          .lb-row { border-bottom: 1px solid #f7f7f8; background: #fff; }
          .lb-row.you { background: linear-gradient(90deg, rgba(79,70,229,0.06), rgba(99,102,241,0.02)); }
          .lb-wallet { display: flex; align-items: center; gap: 12px; }
          .lb-wallet .addr { font-family: monospace; color: #111827; font-weight: 600; }
          .lb-wallet .you-badge { background: #4F46E5; color: #fff; padding: 4px 8px; border-radius: 8px; font-size: 12px; }
          .lb-rank { font-weight: 700; }
          .lb-points { text-align: right; font-weight: 700; }

          @media (max-width: 700px) {
            .lb-header, .lb-row { grid-template-columns: 60px 1fr 100px; padding: 10px 12px; }
            .lb-points { font-size: 14px; }
          }

          @media (max-width: 420px) {
            .lb-header { grid-template-columns: 1fr 1fr; }
            .lb-header > div:first-child { display: none; }
            .lb-row { grid-template-columns: 1fr; padding: 10px; }
            .lb-row > .lb-rank { display: inline-flex; margin-bottom: 8px; }
            .lb-row > .lb-wallet { margin-bottom: 6px; }
            .lb-row > .lb-points { text-align: left; }
          }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
<h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
  Leaderboard
</h1>
            <p style={{ margin: 0, color: '#6b7280' }}>Top users by points and contributions</p>
          </div>
          <div>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>Back</button>
          </div>
        </div>

        <div className="leaderboard-table">
          <div className="lb-header">
            <div>Rank</div>
            <div>Wallet</div>
            <div className="lb-points">Points</div>
          </div>

          {list.map((row, idx) => (
            <div key={row.wallet} className={`lb-row ${row.isYou ? 'you' : ''}`}>
              <div className="lb-rank">{idx + 1}</div>
              <div className="lb-wallet"><div className="addr" style={{ color: row.isYou ? '#4F46E5' : undefined }}>{shortAddress(row.wallet)}</div>{row.isYou && <div className="you-badge">You</div>}</div>
              <div className="lb-points">{row.points.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>This is a static preview. Backend integration will populate real data.</p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
