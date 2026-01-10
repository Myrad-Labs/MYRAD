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
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 40px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Satoshi', sans-serif;
        }

        .dash-logo { height: 32px; object-fit: contain; }

        .header-right { display: flex; align-items: center; gap: 12px; }

        .wallet-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wallet-badge:hover { background: #f9fafb; border-color: #d1d5db; }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #111827;
          border: 1px solid #111827;
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-logout:hover { background: #000000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export:hover { background: #f9fafb; border-color: #d1d5db; }

        .btn-leaderboard { 
          padding: 8px 14px; 
          border-radius: 10px; 
          border: 1px solid #e5e7eb; 
          background: #ffffff; 
          color: #111827;
          cursor: pointer; 
          font-weight: 600; 
          font-size: 13px;
          transition: all 0.2s;
        }
        .btn-leaderboard:hover { background: #f9fafb; border-color: #d1d5db; }

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
