import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfServicePage = () => {
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
                    <FileText size={40} color={accent} />
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        Terms of Service
                    </h1>
                </div>

<p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '48px' }}>
                    Last updated: December 2024
                </p>

<div style={{ color: '#1a1a1a', lineHeight: 1.8 }}>
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using MYRAD's services, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            2. Description of Service
                        </h2>
                        <p>
                            MYRAD provides a privacy-first data contribution platform where users can earn points
                            by sharing verified behavioral insights through zero-knowledge proofs. Our service
                            connects data contributors with enterprises seeking compliant, anonymized data.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            3. User Accounts
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>You must provide accurate information when creating an account</li>
                            <li style={{ marginBottom: '8px' }}>You are responsible for maintaining the security of your account</li>
                            <li style={{ marginBottom: '8px' }}>One account per person; multiple accounts may be terminated</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            4. Points and Rewards
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>Points are earned through verified data contributions</li>
                            <li style={{ marginBottom: '8px' }}>Points have no cash value until converted (feature coming soon)</li>
                            <li style={{ marginBottom: '8px' }}>We reserve the right to modify the points system with notice</li>
                            <li style={{ marginBottom: '8px' }}>Fraudulent contributions will result in account termination</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            5. Data Contributions
                        </h2>
                        <p>
                            When you contribute data through MYRAD, you grant us a license to use the anonymized,
                            aggregated insights derived from your zero-knowledge proofs for our business purposes,
                            including sharing with enterprise customers.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            6. Prohibited Activities
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>Submitting false or fraudulent proofs</li>
                            <li style={{ marginBottom: '8px' }}>Attempting to manipulate the points system</li>
                            <li style={{ marginBottom: '8px' }}>Accessing the service through unauthorized means</li>
                            <li style={{ marginBottom: '8px' }}>Violating any applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            7. Termination
                        </h2>
                        <p>
                            We may suspend or terminate your account at any time for violations of these terms.
                            You may delete your account at any time through the dashboard.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#1a1a1a' }}>
                            8. Contact
                        </h2>
                        <p>
                            For questions about these terms, please contact us through our{' '}
                            <Link to="/contact" style={{ color: accent }}>contact form</Link>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsOfServicePage;
