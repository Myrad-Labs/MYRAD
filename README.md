# MYRAD — Privacy-First Data Network

**Live Demo:** [https://myradhq.xyz/](https://myradhq.xyz/)

> *You Own Your Data. Now, Get Rewarded for It.*

## Overview

MYRAD is a privacy-first data network that transforms your app activity into rewards—secured by **zero-knowledge proofs**. Your data stays private. Your rewards stay real.

We enable users to monetize their behavioral data from apps like Zomato and Swiggy without ever exposing raw data or personally identifiable information (PII). Enterprises get access to compliant, anonymized insights while users maintain complete control.

---

## How It Works

### For Users

1. **Quick & Secure Login**  
   Use your email or social accounts to sign up instantly with Privy Auth. No wallet setup required.

2. **Contribute Data Privately**  
   Connect apps like Zomato or Swiggy. We use the **Reclaim Protocol** to verify your order history without seeing the raw data.

3. **Proof Verified**  
   The system receives a **Zero-Knowledge Proof**—a cryptographic guarantee that your activity is real. No raw logs, no PII ever leaves your device.

4. **Get Your Points**  
   For every verified, anonymous insight you contribute, you're instantly credited with Points. Track your balance on your dashboard!

### For Buyers (Enterprises)

- **API Access** to anonymized, aggregated data
- **Real Behavioral Insights** from consented users
- **GDPR & CCPA Compliant** data pipelines
- **User-Consented Data Only** — ethical by design

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Vanilla CSS with modern design system |
| **Authentication** | Privy Auth (email, social, wallet) |
| **Data Verification** | Reclaim Protocol (ZK Proofs) |
| **Backend** | Express.js REST API |
| **Database** | PostgreSQL |

### Core Technologies

- **🔐 Reclaim Protocol**  
  Enables zero-knowledge verification of user data from third-party apps. Users prove their activity without revealing raw data.

- **🛡️ Zero-Knowledge Proofs**  
  Cryptographic proofs ensure data authenticity while maintaining complete privacy. No PII is ever stored or transmitted.

- **🔑 Privy Auth**  
  Seamless authentication supporting email, social logins, and wallet connections. Users can start earning without crypto knowledge.

---

## Features

### Privacy-First Design
- ✅ No raw data collection
- ✅ Zero-Knowledge verification
- ✅ User-controlled data deletion
- ✅ End-to-end privacy

### User Rewards
- 🎁 100 points welcome bonus
- 💰 500 points per data contribution
- 📊 Real-time points tracking
- 🔄 Full control over contributions

### Enterprise Access
- 📡 RESTful API for data access
- 📈 Aggregated behavioral analytics
- ⚖️ GDPR & CCPA compliance
- 🤝 Ethical, consented data only

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Myrad-Labs/MYRAD.git
cd MYRAD

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_RECLAIM_APP_ID=your_reclaim_app_id
VITE_RECLAIM_APP_SECRET=your_reclaim_secret
```

---

## Project Structure

```
MYRAD/
├── src/
│   ├── pages/           # React page components
│   ├── providers/       # Context providers (Privy, etc.)
│   └── main.tsx         # App entry point
├── backend/
│   └── ...              # Express.js API server
└── public/              # Static assets
```

---

## Supported Data Sources

| Platform | Data Type | Status |
|----------|-----------|--------|
| Zomato | Order History | ✅ Live |
| Swiggy | Order History | ✅ Live |
| More coming soon... | - | 🚧 |

---

## Security & Privacy

MYRAD is built with privacy as a core principle:

- **Zero-Knowledge Proofs** ensure data verification without exposure
- **No PII Storage** — we never see or store personal information
- **User Consent** — users explicitly opt-in to share anonymized data
- **Data Deletion** — users can delete all contributions anytime
- **Encryption** — all data in transit is encrypted

---

## Community

- 💬 [Telegram](https://t.me/myradhq)
- 🐦 [X (Twitter)](https://x.com/myradhq)
- 📧 Contact: hello@myradhq.xyz

---

## License

Copyright © 2024 MYRAD Labs. All rights reserved

---

<p align="center">
  <strong>MYRAD</strong> — Privacy-First Data Union
</p>
