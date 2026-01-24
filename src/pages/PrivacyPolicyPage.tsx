import { Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Waves from '../components/DynamicBackground';

const PrivacyPolicyPage = () => {
    const accent = '#374151';

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

            <div style={{ position: 'relative', zIndex: 10 }}>
                <Header />

                <main style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <Shield size={40} color={accent} />
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: 600,
                            color: '#111827',
                            fontFamily: '"Satoshi", sans-serif'
                        }}>
                            Privacy Policy
                        </h1>
                    </div>

                    <p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '16px' }}>
                        Effective Date: January 24, 2026
                    </p>

                    <p style={{ color: 'rgba(0,0,0,0.8)', marginBottom: '48px', fontStyle: 'italic' }}>
                        Your privacy is the foundation of Myrad. This policy explains what we collect, what we do not collect, and how your information is handled.
                    </p>

                    <div style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                1. Our Core Principle
                            </h2>
                            <p>
                                Myrad never stores or sells your raw activity data from third party platforms.
                            </p>
                            <p style={{ marginTop: '12px' }}>
                                We only generate anonymous, aggregated signals that cannot identify you.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                2. Information We Collect
                            </h2>

                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', marginTop: '20px', color: '#4B5563' }}>
                                A. Account Information
                            </h3>
                            <p>When you sign up, we may collect:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Email address or wallet address</li>
                                <li>• Basic account preferences</li>
                                <li>• Participation history (points, rewards, connections)</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                This is used only to manage your account and rewards.
                            </p>

                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', marginTop: '24px', color: '#4B5563' }}>
                                B. Verification Signals
                            </h3>
                            <p>When you connect a service:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• A verification process confirms activity occurred</li>
                                <li>• Myrad does not store your detailed history</li>
                                <li>• Your activity is converted into aggregated behavioral metrics</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                These metrics are combined with many other users and cannot be traced back to you.
                            </p>

                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', marginTop: '24px', color: '#4B5563' }}>
                                C. Technical Data
                            </h3>
                            <p>We may collect:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Device type</li>
                                <li>• Browser type</li>
                                <li>• Basic analytics (page visits, errors)</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                This helps us improve performance and security.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                3. Information We Do NOT Collect
                            </h2>
                            <p>Myrad does not collect or store:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Full order histories</li>
                                <li>• Watch histories</li>
                                <li>• Message content</li>
                                <li>• Passwords</li>
                                <li>• Financial details</li>
                                <li>• Personal contacts</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                We do not have the ability to view or reconstruct your activity.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                4. How We Use Information
                            </h2>
                            <p>We use data to:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Operate and improve Myrad</li>
                                <li>• Generate anonymous, aggregated behavior signals</li>
                                <li>• Prevent fraud and abuse</li>
                                <li>• Distribute rewards</li>
                            </ul>
                            <p style={{ marginTop: '12px', fontWeight: 500 }}>
                                We do not sell personal information.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                5. Data Sharing
                            </h2>
                            <p>We share only:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Aggregated, anonymized signals that represent groups of users</li>
                                <li>• Never individual user data</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                These signals are used for research, analytics, and product improvement by organizations.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                6. Data Retention
                            </h2>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Account information is kept while your account is active</li>
                                <li>• Aggregated signals contain no personal identifiers and may be retained for research use</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                You may delete your account at any time.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                7. Your Rights
                            </h2>
                            <p>You can:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Disconnect connected services</li>
                                <li>• Request account deletion</li>
                                <li>• Stop participating at any time</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                Deleting your account removes your personal account data from Myrad systems.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                8. Security
                            </h2>
                            <p>
                                We use industry standard security practices to protect our systems. Since we do not store raw personal activity data, your exposure risk is significantly reduced.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                9. Children's Privacy
                            </h2>
                            <p>
                                Myrad is not intended for individuals under 18.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                10. Changes to This Policy
                            </h2>
                            <p>
                                We may update this Privacy Policy as our service evolves. We will notify users of major changes.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>
                                11. Contact
                            </h2>
                            <p>
                                For privacy questions, contact:{' '}
                                <a href="mailto:info@myradhq.xyz" style={{ color: accent }}>
                                    info@myradhq.xyz
                                </a>
                            </p>
                        </section>


                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
