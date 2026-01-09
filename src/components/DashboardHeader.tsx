import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Copy, LogOut, Key } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  const { user, logout, exportWallet } = usePrivy();
  const navigate = useNavigate();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const walletAddress = user?.wallet?.address || null;
  const shortWalletAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
    : null;

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <>
      <style>{`
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

        .dash-logo { height: 40px; }

        .header-right { display: flex; align-items: center; gap: 12px; }

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

        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export:hover { background: #f3f4f6; border-color: #d1d5db; }

        .btn-leaderboard { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e7eb; background: #f9fafb; cursor: pointer; font-weight: 600; }

        @media (max-width: 600px) { .dashboard-header { flex-direction: column; align-items: flex-start; gap: 12px } }
      `}</style>

      <header className="dashboard-header">
        <img src="/myrad.webp" alt="MYRAD" className="dash-logo" />
        <div className="header-right">
          <button onClick={() => navigate('/leaderboard')} className="btn-leaderboard">Leaderboard</button>
          {shortWalletAddress && (
            <button onClick={copyWalletAddress} className="wallet-badge">
              {copiedAddress ? 'Copied!' : shortWalletAddress}
              <Copy size={12} />
            </button>
          )}

          <button onClick={() => exportWallet && exportWallet()} className="btn-export" title="Export Private Key">
            <Key size={14} />
            Export Key
          </button>
          <button onClick={() => logout && logout()} className="btn-logout">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
