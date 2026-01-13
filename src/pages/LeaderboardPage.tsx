import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';

interface LeaderboardUser {
  id: string;
  username: string;
  walletAddress: string | null;
  totalPoints: number;
  league: string;
}

const LeaderboardPage: React.FC = () => {
  const { user } = usePrivy();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const myWallet = (user?.wallet?.address || '').toLowerCase() || null;

  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/leaderboard?limit=100&timeframe=all_time`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.leaderboard)) {
        // Map the leaderboard data and ensure wallet addresses are included
        const mapped = data.leaderboard.map((u: any) => ({
          id: u.id,
          username: u.username || `User ${u.id?.substr(-4) || 'Unknown'}`,
          walletAddress: u.walletAddress || u.wallet_address || null,
          totalPoints: u.totalPoints || u.total_points || 0,
          league: u.league || 'Bronze'
        }));
        
        setLeaderboard(mapped);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Sort by points descending and mark current user
  const sortedList = leaderboard
    .slice()
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u) => ({
      ...u,
      isYou: myWallet && u.walletAddress ? u.walletAddress.toLowerCase() === myWallet : false
    }));

  const shortAddress = (addr: string | null) => {
    if (!addr) return 'N/A';
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
          .loading-state { padding: 40px; text-align: center; color: #6b7280; }
          .error-state { padding: 40px; text-align: center; color: #ef4444; }
          .auto-refresh-indicator { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 12px; }

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
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ 
                padding: '8px 12px', 
                borderRadius: 8, 
                border: '1px solid #e5e7eb', 
                background: '#f9fafb', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button 
              onClick={fetchLeaderboard}
              style={{
                marginTop: 12,
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #ef4444',
                background: '#fff',
                color: '#ef4444',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : sortedList.length === 0 ? (
          <div className="loading-state">
            <p>No users found on the leaderboard yet.</p>
          </div>
        ) : (
          <>
            <div className="leaderboard-table">
              <div className="lb-header">
                <div>Rank</div>
                <div>Wallet</div>
                <div className="lb-points">Points</div>
              </div>

              {sortedList.map((row, idx) => (
                <div key={row.id} className={`lb-row ${row.isYou ? 'you' : ''}`}>
                  <div className="lb-rank">{idx + 1}</div>
                  <div className="lb-wallet">
                    <div className="addr" style={{ color: row.isYou ? '#4F46E5' : undefined }}>
                      {shortAddress(row.walletAddress)}
                    </div>
                    {row.isYou && <div className="you-badge">You</div>}
                  </div>
                  <div className="lb-points">{row.totalPoints.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <p className="auto-refresh-indicator">
              Leaderboard auto-updates every minute • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
