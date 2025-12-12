import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfServicePage = () => {
    const accent = '#fff';

    return (
        <div style={{
            background: '#000',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            {/* Header */}
            <header style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <span style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: accent,
                            fontFamily: "'Space Grotesk', sans-serif"
                        }}>MYRAD</span>
                    </Link>
                    <Link to="/" style={{
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </header>

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

                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '48px' }}>
                    Last updated: December 2024
                </p>

                <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using MYRAD's services, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                            2. Description of Service
                        </h2>
                        <p>
                            MYRAD provides a privacy-first data contribution platform where users can earn points
                            by sharing verified behavioral insights through zero-knowledge proofs. Our service
                            connects data contributors with enterprises seeking compliant, anonymized data.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                            3. User Accounts
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li style={{ marginBottom: '8px' }}>You must provide accurate information when creating an account</li>
                            <li style={{ marginBottom: '8px' }}>You are responsible for maintaining the security of your account</li>
                            <li style={{ marginBottom: '8px' }}>One account per person; multiple accounts may be terminated</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
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
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                            5. Data Contributions
                        </h2>
                        <p>
                            When you contribute data through MYRAD, you grant us a license to use the anonymized,
                            aggregated insights derived from your zero-knowledge proofs for our business purposes,
                            including sharing with enterprise customers.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
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
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                            7. Termination
                        </h2>
                        <p>
                            We may suspend or terminate your account at any time for violations of these terms.
                            You may delete your account at any time through the dashboard.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                            8. Contact
                        </h2>
                        <p>
                            For questions about these terms, please contact us through our{' '}
                            <Link to="/contact" style={{ color: accent }}>contact form</Link>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TermsOfServicePage;
