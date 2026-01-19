import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Trophy, Medal, Award, Search, X } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

interface LeaderboardUser {
  id: string;
  username: string;
  walletAddress: string | null;
  totalPoints: number;
  league: string;
}

const LeaderboardPage: React.FC = () => {
  const { user } = usePrivy();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Filter and sort the leaderboard
  const sortedList = leaderboard
    .slice()
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u) => ({
      ...u,
      isYou: myWallet && u.walletAddress ? u.walletAddress.toLowerCase() === myWallet : false
    }))
    .filter((u) => {
      if (!searchQuery.trim()) return true;
      const search = searchQuery.toLowerCase();
      return u.walletAddress?.toLowerCase().includes(search) || false;
    });

  const shortAddress = (addr: string | null) => {
    if (!addr) return 'N/A';
    return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  };

  const copyToClipboard = async (address: string | null) => {
    if (!address || address === 'N/A') return;

    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32, paddingLeft: 70, transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-enter {
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
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
            grid-template-columns: 80px 1fr 160px;
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
            grid-template-columns: 80px 1fr 160px;
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

          .lb-row.you {
            background: linear-gradient(90deg, rgba(79, 70, 229, 0.04), rgba(99, 102, 241, 0.02));
            border-left: 3px solid #4F46E5;
          }

          .lb-row.you:hover {
            background: linear-gradient(90deg, rgba(79, 70, 229, 0.08), rgba(99, 102, 241, 0.04));
            box-shadow: inset 4px 0 0 #4F46E5, 0 4px 12px rgba(79, 70, 229, 0.08);
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

          .you-badge {
            background: #4F46E5;
            color: #fff;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .lb-points {
            text-align: right;
            font-weight: 700;
            font-size: 18px;
            color: #111827;
          }

          .loading-state {
            padding: 80px 40px;
            text-align: center;
            color: #6b7280;
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

          .error-state {
            padding: 80px 40px;
            text-align: center;
          }

          .error-message {
            color: #ef4444;
            font-size: 16px;
            margin-bottom: 16px;
          }

          .retry-btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: 1px solid #ef4444;
            background: #fff;
            color: #ef4444;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .retry-btn:hover {
            background: #fef2f2;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(239, 68, 68, 0.1);
          }

          .empty-state {
            padding: 80px 40px;
            text-align: center;
            color: #6b7280;
          }

          .search-container {
            margin-bottom: 24px;
            position: relative;
          }

          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .search-icon {
            position: absolute;
            left: 16px;
            color: #9ca3af;
            pointer-events: none;
          }

          .search-input {
            width: 100%;
            padding: 14px 16px 14px 48px;
            font-size: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #ffffff;
            color: #111827;
            font-family: 'Satoshi', 'Courier New', monospace;
            transition: all 0.2s ease;
            outline: none;
          }

          .search-input:focus {
            border-color: #111827;
            box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.05);
          }

          .search-input::placeholder {
            color: #9ca3af;
          }

          .clear-search {
            position: absolute;
            right: 12px;
            padding: 6px;
            background: transparent;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            color: #6b7280;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .clear-search:hover {
            background: #f3f4f6;
            color: #111827;
          }

          .search-results-info {
            margin-top: 8px;
            font-size: 13px;
            color: #6b7280;
          }

          .auto-refresh-indicator {
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            margin-top: 16px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
          }

          @media (max-width: 768px) {
            .lb-header,
            .lb-row {
              grid-template-columns: 60px 1fr 100px;
              gap: 12px;
              padding: 16px;
            }

            .lb-points {
              font-size: 16px;
            }

            .rank-number {
              font-size: 16px;
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
            Leaderboard
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 16 }}>Top contributors ranked by points and contributions</p>
        </div>

        {!loading && !error && (
          <div className="search-container animate-enter">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-search"
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="search-results-info">
                {sortedList.length === 0 ? (
                  <span>No results found for "{searchQuery}"</span>
                ) : (
                  <span>Showing {sortedList.length} result{sortedList.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchLeaderboard} className="retry-btn">
              Retry
            </button>
          </div>
        ) : sortedList.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No results found</p>
                <span style={{ fontSize: 14 }}>Try searching with a different wallet address</span>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginTop: 16,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    color: '#111827',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No users found</p>
                <span style={{ fontSize: 14 }}>Be the first to join the leaderboard!</span>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="leaderboard-container animate-enter">
              <div className="lb-header">
                <div>Rank</div>
                <div>Wallet Address</div>
                <div style={{ textAlign: 'right' }}>Points</div>
              </div>

              {sortedList.map((row, idx) => {
                const rank = idx + 1;
                const isTopThree = rank <= 3;
                // Only show "Copied!" if address is not null and matches
                const isCopied = row.walletAddress && copiedAddress === row.walletAddress;

                return (
                  <div
                    key={row.id}
                    className={`lb-row ${row.isYou ? 'you' : ''} ${isTopThree ? 'top-3' : ''}`}
                  >
                    <div className="lb-rank">
                      <span className="rank-number">{rank}</span>
                      {getRankIcon(rank)}
                    </div>

                    <div className="lb-wallet">
                      <div
                        className="wallet-wrapper"
                        onClick={() => copyToClipboard(row.walletAddress)}
                        title={row.walletAddress ? (isCopied ? 'Copied' : 'Click to copy address') : 'No wallet address'}
                        style={{ cursor: row.walletAddress ? 'pointer' : 'default' }}
                      >
                        <div
                          className="wallet-address"
                          style={{
                            color: row.isYou ? '#4F46E5' : undefined,
                            cursor: row.walletAddress ? 'pointer' : 'default'
                          }}
                        >
                          {isCopied ? 'Copied!' : shortAddress(row.walletAddress)}
                        </div>
                      </div>

                      {row.isYou && <div className="you-badge">You</div>}
                    </div>

                    <div className="lb-points">{row.totalPoints.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>

            <p className="auto-refresh-indicator">
              Auto updates every minute • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;