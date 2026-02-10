import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { Copy, LogOut, Key, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DashboardHeaderProps {
  onOptOutSuccess?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onOptOutSuccess }) => {
  const { user, logout, exportWallet } = usePrivy();
  const navigate = useNavigate();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showOptOutModal, setShowOptOutModal] = useState(false);
  const [optOutLoading, setOptOutLoading] = useState(false);
  const [optOutError, setOptOutError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOptOut = async () => {
    if (!user?.id) return;

    setOptOutLoading(true);
    setOptOutError(null);

    try {
      const token = `privy_${user.id}_${user?.email?.address || 'user'}`;
      const response = await fetch(`${API_URL}/api/user/opt-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setShowOptOutModal(false);
        // Trigger refresh of dashboard data
        if (onOptOutSuccess) {
          onOptOutSuccess();
        }
        // Optionally reload the page to refresh all data
        window.location.reload();
      } else {
        setOptOutError(data.error || 'Failed to process opt-out request');
      }
    } catch (error) {
      console.error('Opt-out error:', error);
      setOptOutError('An error occurred. Please try again.');
    } finally {
      setOptOutLoading(false);
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
          margin-left: 70px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Satoshi', sans-serif;
        }

        .dash-logo { 
          height: 32px; 
          object-fit: contain;
          display: none;
        }

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

        .btn-opt-out {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-opt-out:hover { 
          background: #fef2f2; 
          border-color: #f87171;
        }

        /* Opt-Out Modal Styles */
        .opt-out-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .opt-out-modal {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px 48px;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .opt-out-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .opt-out-modal-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .opt-out-icon {
          width: 64px;
          height: 64px;
          background: #fef2f2;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #dc2626;
        }

        .opt-out-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }

        .opt-out-warning {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .opt-out-warning-title {
          font-size: 14px;
          font-weight: 600;
          color: #dc2626;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .opt-out-warning-list {
          margin: 0;
          padding-left: 20px;
          color: #991b1b;
          font-size: 13px;
          line-height: 1.6;
        }

        .opt-out-warning-list li {
          margin-bottom: 4px;
        }

        .opt-out-description {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .opt-out-buttons {
          display: flex;
          gap: 12px;
        }

        .opt-out-btn-cancel {
          flex: 1;
          padding: 14px 20px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Satoshi', sans-serif;
        }

        .opt-out-btn-cancel:hover {
          background: #e5e7eb;
        }

        .opt-out-btn-confirm {
          flex: 1;
          padding: 14px 20px;
          background: #dc2626;
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Satoshi', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .opt-out-btn-confirm:hover {
          background: #b91c1c;
        }

        .opt-out-btn-confirm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .opt-out-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px;
          margin-top: 16px;
          color: #dc2626;
          font-size: 13px;
          text-align: center;
        }

        @media (max-width: 768px) { 
          .dashboard-header { 
            margin-left: 0px !important;
            padding: 16px 20px;
          }
        }
        
        @media (max-width: 600px) { 
          .dashboard-header { 
            flex-direction: column; 
            align-items: flex-start; 
            gap: 12px;
            padding: 16px 20px;
            margin-left: 0px !important;
          }
          
          .header-right {
            width: 100%;
            justify-content: flex-end;
            gap: 8px;
            flex-wrap: wrap;
          }

          .btn-export span, .btn-opt-out span, .btn-logout span, .wallet-badge span:not(:first-child) {
             display: none;
          }
          
          .wallet-badge {
            margin-right: auto;
          }
        }
      `}</style>

      <header className="dashboard-header">
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {/* Page title will be shown here if needed */}
          </h2>
        </div>
        <div className="header-right">
          {shortWalletAddress && (
            <button onClick={copyWalletAddress} className="wallet-badge">
              {copiedAddress ? 'Copied!' : shortWalletAddress}
              <Copy size={12} />
            </button>
          )}

          <button onClick={() => exportWallet && exportWallet()} className="btn-export" title="Export Private Key">
            <Key size={14} />
            <span>Export Key</span>
          </button>
          <button onClick={() => setShowOptOutModal(true)} className="btn-opt-out" title="Opt Out of Data Marketplace">
            <AlertTriangle size={14} />
            <span>Opt Out</span>
          </button>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Opt-Out Confirmation Modal */}
      {showOptOutModal && (
        <div className="opt-out-modal-overlay" onClick={() => !optOutLoading && setShowOptOutModal(false)}>
          <div className="opt-out-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="opt-out-modal-close"
              onClick={() => !optOutLoading && setShowOptOutModal(false)}
              disabled={optOutLoading}
            >
              <X size={20} />
            </button>

            <div className="opt-out-icon">
              <AlertTriangle size={32} />
            </div>

            <h2 className="opt-out-title">Opt Out of Myrad</h2>

            <div className="opt-out-warning">
              <p className="opt-out-warning-title">
                <AlertTriangle size={16} />
                Warning: This action cannot be undone
              </p>
              <ul className="opt-out-warning-list">
                <li>All your points will be reset to 10 (initial bonus)</li>
                <li>All your contributions will be removed from Myrad</li>
                <li>Your verification history will be excluded from analytics</li>
                <li>You will need to re-verify to earn points again</li>
              </ul>
            </div>

            <p className="opt-out-description">
              By confirming, you acknowledge that your contributed data will no longer be available
              in Myrad, and your accumulated points will be reset.
            </p>

            <div className="opt-out-buttons">
              <button
                className="opt-out-btn-cancel"
                onClick={() => setShowOptOutModal(false)}
                disabled={optOutLoading}
              >
                Cancel
              </button>
              <button
                className="opt-out-btn-confirm"
                onClick={handleOptOut}
                disabled={optOutLoading}
              >
                {optOutLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Opt Out'
                )}
              </button>
            </div>

            {optOutError && (
              <div className="opt-out-error">
                {optOutError}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
