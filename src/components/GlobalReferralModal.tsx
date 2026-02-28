import React from 'react';
import { useReferralModal } from '../contexts/ReferralModalContext';
import '../styles/GlobalReferralModal.css';

const GlobalReferralModal: React.FC = () => {
  const {
    showReferralModal,
    referralCode,
    setReferralCode,
    submittingReferral,
    handleReferralSubmit,
    handleSkipReferral,
    referralError,
    referralSuccess
  } = useReferralModal();

  if (!showReferralModal) return null;

  return (
    <div className="global-referral-overlay">
      <div className="global-referral-modal">
        {referralSuccess ? (
          <>
            <div className="global-referral-success-icon">✓</div>
            <h2 className="global-referral-title">Referral Applied!</h2>
            <p className="global-referral-subtitle">Bonus points have been added to your account.</p>
          </>
        ) : (
          <>
            <h2 className="global-referral-title">Enter Referral Code</h2>
            <p className="global-referral-subtitle">
              If someone invited you, enter their 8-digit code to get bonus points!
            </p>

            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-digit code"
              maxLength={8}
              className="global-referral-input"
              disabled={submittingReferral}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && referralCode.length === 8) {
                  handleReferralSubmit();
                }
              }}
            />

            {referralError && (
              <p className="global-referral-error">{referralError}</p>
            )}

            <button
              onClick={handleReferralSubmit}
              disabled={submittingReferral || referralCode.length !== 8}
              className="global-referral-submit-btn"
            >
              {submittingReferral ? 'Applying...' : 'Apply Code'}
            </button>

            <button
              onClick={handleSkipReferral}
              disabled={submittingReferral}
              className="global-referral-skip-btn"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalReferralModal;
