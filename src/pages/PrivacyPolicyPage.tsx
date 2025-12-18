import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
    const accent = '#4F46E5';

    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            color: '#1a1a1a',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <Header />

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <Shield size={40} color={accent} />
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        Privacy Policy
                    </h1>
                </div>

<p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '48px' }}>
                    Last updated: December 2024
                </p>

                <div style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            1. Our Commitment to Privacy
                        </h2>
                        <p>
                            At MYRAD, privacy is not just a feature—it's our foundation. We use zero-knowledge proofs
                            and the Reclaim Protocol to ensure your personal data never leaves your device. Only
                            cryptographic proofs of your activity are shared, never the underlying data.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            2. What We Collect
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>Email address (for account management via Privy Auth)</li>
                            <li style={{ marginBottom: '8px' }}>Zero-knowledge proofs (cryptographic verifications, not raw data)</li>
                            <li style={{ marginBottom: '8px' }}>Points balance and contribution history</li>
                            <li style={{ marginBottom: '8px' }}>Usage analytics (anonymized)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            3. What We Never Collect
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>Raw activity logs from connected apps</li>
                            <li style={{ marginBottom: '8px' }}>Personal identifiable information (PII) from proofs</li>
                            <li style={{ marginBottom: '8px' }}>Location tracking data</li>
                            <li style={{ marginBottom: '8px' }}>Browsing history or cookies for tracking</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            4. Data Security
                        </h2>
                        <p>
                            All data transmissions are encrypted using industry-standard TLS. Zero-knowledge proofs
                            ensure that even if our systems were compromised, your personal data would remain protected
                            as we simply don't have it.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            5. Your Rights
                        </h2>
                        <p>You have the right to:</p>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>Access your account data at any time</li>
                            <li style={{ marginBottom: '8px' }}>Delete your account and all associated data</li>
                            <li style={{ marginBottom: '8px' }}>Withdraw from data contributions</li>
                            <li style={{ marginBottom: '8px' }}>Export your points history</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            6. Contact Us
                        </h2>
                        <p>
                            For privacy-related questions, please contact us through our{' '}
                            <Link to="/contact" style={{ color: accent }}>contact form</Link>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
