-- Migrate referred_by from wallet addresses to referral codes
-- Previously referred_by stored the referrer's wallet address,
-- but after Privy App ID migration, wallet addresses change.
-- referral_code is stable and should be used instead.

-- Update referred_by from wallet_address to referral_code
-- Only affects rows where referred_by looks like a wallet address (starts with 0x)
-- and matches an existing referral entry
UPDATE users u
SET referred_by = r.referral_code
FROM referrals r
WHERE u.referred_by IS NOT NULL
  AND u.referred_by LIKE '0x%'
  AND LOWER(r.wallet_address) = LOWER(u.referred_by);

-- Also handle any referred_by that matches old wallet addresses
-- stored in wallet_history (for users who already migrated)
UPDATE users u
SET referred_by = r.referral_code
FROM referrals r
JOIN wallet_history wh ON wh.user_id = r.user_id
WHERE u.referred_by IS NOT NULL
  AND u.referred_by LIKE '0x%'
  AND LOWER(wh.old_wallet_address) = LOWER(u.referred_by);
