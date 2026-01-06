import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Waves from '../components/DynamicBackground';

const PrivacyPolicyPage = () => {
    const accent = '#4F46E5';

    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            color: '#374151',
            overflowX: 'hidden',
            position: 'relative'
        }}>
            {/* Dynamic Waves Background */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <Waves
                    lineColor="rgba(0,0,0,0.04)"
                    backgroundColor="#ffffff"
                    waveSpeedX={0.01}
                    waveSpeedY={0.005}
                    waveAmpX={30}
                    waveAmpY={15}
                    friction={0.95}
                    tension={0.01}
                    maxCursorMove={100}
                    xGap={10}
                    yGap={30}
                />
            </div>

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
                    Last updated: [Date]
                </p>

                <div style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            1. Introduction
                        </h2>
                        <p>
                            MYRAD is a privacy first platform that enables users to verify certain aspects of their
                            digital activity and contribute aggregated, anonymized insights to businesses.
                        </p>
                        <p>
                            We are committed to protecting user privacy by design. We do not collect, store, or sell
                            raw personal data. This Privacy Policy explains what information we process, how we
                            process it, and the choices you have.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            2. Core Privacy Principles
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- No raw personal data collection</li>
                            <li>- Verification without exposure using cryptographic methods</li>
                            <li>- User consent for every contribution</li>
                            <li>- Aggregation and anonymization by default</li>
                            <li>- User control and right to disconnect</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            3. Information We Do Not Collect
                        </h2>
                        <p>MYRAD does <strong>not</strong> collect or store:</p>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Passwords or login credentials of connected platforms</li>
                            <li>- Raw activity histories such as watch lists, messages, or transactions</li>
                            <li>- Content of communications</li>
                            <li>- Contacts or social graphs</li>
                            <li>- Location tracking data</li>
                        </ul>
                        <p>
                            Verification happens through secure, user initiated flows and cryptographic proofs.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            4. Information We Process
                        </h2>
                        <p>
                            When you choose to connect an external platform, MYRAD may process the following
                            <strong> derived and non identifying information</strong>:
                        </p>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Aggregated activity metrics</li>
                            <li>- Preference and engagement tiers</li>
                            <li>- Behavioral patterns at a cohort level</li>
                            <li>- Cryptographic proof metadata confirming verification</li>
                        </ul>
                        <p>
                            This information is processed in a way that prevents identification of individual users.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            5. Verification and Zero Knowledge Proofs
                        </h2>
                        <p>
                            MYRAD uses cryptographic verification mechanisms, including zero knowledge proofs,
                            to confirm that certain activity occurred without revealing the underlying data.
                        </p>
                        <p>
                            Verification is performed without MYRAD accessing or storing the original content
                            of your activity.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            6. Use of Aggregated Insights
                        </h2>
                        <p>
                            Aggregated and anonymized insights may be shared with business customers in the
                            form of cohort level intelligence.
                        </p>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Cannot be traced back to an individual</li>
                            <li>- Do not include personal identifiers</li>
                            <li>- Are delivered only after minimum aggregation thresholds are met</li>
                        </ul>
                        <p><strong>MYRAD does not sell personal data.</strong></p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            7. Data Retention
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Proof metadata and derived signals are retained only as long as necessary for platform operation</li>
                            <li>- Users may disconnect linked platforms at any time</li>
                            <li>- Upon disconnection, future verification and contribution stops immediately</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            8. User Rights
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Understand what information is processed</li>
                            <li>- Withdraw consent at any time</li>
                            <li>- Disconnect linked platforms</li>
                            <li>- Request deletion of associated records</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            9. Security Measures
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Encrypted connections using TLS</li>
                            <li>- Access controls and rate limiting</li>
                            <li>- Secure infrastructure and monitoring</li>
                        </ul>
                        <p>
                            Despite our efforts, no system is completely secure. Users acknowledge inherent risks
                            of online systems.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            10. Regulatory Compliance
                        </h2>
                        <p>
                            MYRAD is designed to align with applicable privacy regulations, including GDPR and
                            CCPA principles, through data minimization and anonymization.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            11. Changes to This Policy
                        </h2>
                        <p>
                            We may update this Privacy Policy from time to time. Changes will be posted on this
                            page with an updated date.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                            12. Contact
                        </h2>
                        <p>
                            For privacy related questions, please contact us through our{' '}
                            <Link to="/contact" style={{ color: accent }}>
                                contact form
                            </Link>.
                        </p>
                    </section>


                </div>
            </main>

            <Footer />
        </div>

    );
};

export default PrivacyPolicyPage;
