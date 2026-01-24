import { FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Waves from '../components/DynamicBackground';

const TermsOfServicePage = () => {
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
                        <FileText size={40} color={accent} />
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: 600,
                            color: '#111827',
                            fontFamily: '"Satoshi", sans-serif'
                        }}>
                            Terms and Conditions
                        </h1>
                    </div>

                    <p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '48px' }}>
                        Effective Date: January 24, 2026
                    </p>

                    <p style={{ color: 'rgba(0,0,0,0.8)', marginBottom: '48px', fontWeight: 500 }}>
                        Company: Myrad (referred to as "Myrad", "we", "our", or "us")
                    </p>

                    <div style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                1. About Myrad
                            </h2>
                            <p>
                                Myrad is a platform that allows users to contribute privacy safe, aggregated behavioral insights derived from their own digital activity. These insights are transformed into anonymized signals used for research, product improvement, and analytics by organizations.
                            </p>
                            <p style={{ marginTop: '12px' }}>
                                Myrad does not collect, store, or sell raw personal activity data from third party platforms.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                2. Eligibility
                            </h2>
                            <p>You must:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Be at least 18 years old</li>
                                <li>• Have the legal capacity to enter into agreements</li>
                                <li>• Use your own accounts when connecting services</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                By using Myrad, you confirm that the information and accounts you connect belong to you.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                3. How Myrad Works
                            </h2>
                            <p>When you connect a supported service:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• You authorize a verification process, not a data transfer</li>
                                <li>• Myrad does not receive or store your raw activity history</li>
                                <li>• Your activity is transformed into aggregated, anonymized behavioral signals</li>
                                <li>• These signals cannot be used to identify you</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                Your participation helps generate insights about general human behavior, not individual actions.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                4. No Raw Data Storage
                            </h2>
                            <p>Myrad does not:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Store your browsing history</li>
                                <li>• Store your order history</li>
                                <li>• Store your watch history</li>
                                <li>• Store personal messages or content</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                All outputs are non reversible statistical signals created from multiple contributors.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                5. User Rewards
                            </h2>
                            <p>Myrad may provide points, rankings, or rewards for participation.</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Rewards are discretionary</li>
                                <li>• Reward structures may change</li>
                                <li>• Abuse, fraud, or manipulation may result in removal from the program</li>
                            </ul>
                            <p style={{ marginTop: '12px' }}>
                                Rewards do not create an employment, partnership, or agency relationship.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                6. User Responsibilities
                            </h2>
                            <p>You agree not to:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• Use accounts that do not belong to you</li>
                                <li>• Attempt to reverse engineer the system</li>
                                <li>• Attempt to identify other users</li>
                                <li>• Use Myrad for illegal purposes</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                7. Platform Independence
                            </h2>
                            <p>
                                Myrad is not affiliated with, endorsed by, or partnered with any third party services that users choose to connect.
                            </p>
                            <p style={{ marginTop: '12px' }}>
                                All platform names and trademarks belong to their respective owners.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                8. Termination
                            </h2>
                            <p>
                                You may disconnect your accounts and stop participating at any time.
                            </p>
                            <p style={{ marginTop: '12px' }}>Myrad may suspend or terminate access if:</p>
                            <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                                <li>• These Terms are violated</li>
                                <li>• Fraudulent or abusive behavior is detected</li>
                                <li>• Required by law</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                9. Disclaimer of Warranties
                            </h2>
                            <p>
                                Myrad is provided "as is" without warranties of any kind.
                            </p>
                            <p style={{ marginTop: '12px' }}>
                                We do not guarantee uninterrupted service or specific reward outcomes.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                10. Limitation of Liability
                            </h2>
                            <p>
                                To the maximum extent permitted by law, Myrad shall not be liable for indirect, incidental, or consequential damages arising from your use of the service.
                            </p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                11. Changes to Terms
                            </h2>
                            <p>
                                We may update these Terms as the product evolves. Continued use after updates means you accept the revised Terms.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
                                12. Contact
                            </h2>
                            <p>
                                For questions, contact:{' '}
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

export default TermsOfServicePage;
