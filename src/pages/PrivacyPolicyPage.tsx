import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            color: '#333',
            fontSize: '15px',
            lineHeight: 1.7
        }}>
            <Header />

            <style>{`
                @media (max-width: 768px) {
                    .privacy-main {
                        padding: 100px 20px 48px !important;
                    }
                }
                @media (max-width: 480px) {
                    .privacy-main {
                        padding: 90px 16px 40px !important;
                    }
                    .privacy-main h1 {
                        font-size: 24px !important;
                    }
                }
            `}</style>
            <main className="privacy-main" style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111', marginBottom: '24px' }}>
                    Privacy Policy
                </h1>
                <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
                    Effective Date: January 24, 2026
                </p>
                <p style={{ marginBottom: '32px', fontStyle: 'italic', color: '#555' }}>
                    Your privacy is the foundation of Myrad. This policy explains what we collect, what we do not collect, and how your information is handled.
                </p>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        1. Our Core Principle
                    </h2>
                    <p style={{ marginBottom: '10px' }}>
                        Myrad never stores or sells your raw activity data from third party platforms.
                    </p>
                    <p>
                        We only generate anonymous, aggregated signals that cannot identify you.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        2. Information We Collect
                    </h2>

                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>A. Account Information</p>
                    <p style={{ marginBottom: '8px' }}>When you sign up, we may collect:</p>
                    <ul style={{ margin: '0 0 16px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Email address or wallet address</li>
                        <li style={{ marginBottom: '4px' }}>Basic account preferences</li>
                        <li style={{ marginBottom: '4px' }}>Participation history (points, rewards, connections)</li>
                    </ul>
                    <p style={{ marginBottom: '20px' }}>This is used only to manage your account and rewards.</p>

                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>B. Verification Signals</p>
                    <p style={{ marginBottom: '8px' }}>When you connect a service:</p>
                    <ul style={{ margin: '0 0 16px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>A verification process confirms activity occurred</li>
                        <li style={{ marginBottom: '4px' }}>Myrad does not store your detailed history</li>
                        <li style={{ marginBottom: '4px' }}>Your activity is converted into aggregated behavioral metrics</li>
                    </ul>
                    <p style={{ marginBottom: '20px' }}>These metrics are combined with many other users and cannot be traced back to you.</p>

                    <p style={{ fontWeight: 600, marginBottom: '6px' }}>C. Technical Data</p>
                    <p style={{ marginBottom: '8px' }}>We may collect:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Device type</li>
                        <li style={{ marginBottom: '4px' }}>Browser type</li>
                        <li style={{ marginBottom: '4px' }}>Basic analytics (page visits, errors)</li>
                    </ul>
                    <p>This helps us improve performance and security.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        3. Information We Do NOT Collect
                    </h2>
                    <p style={{ marginBottom: '8px' }}>Myrad does not collect or store:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Full order histories</li>
                        <li style={{ marginBottom: '4px' }}>Watch histories</li>
                        <li style={{ marginBottom: '4px' }}>Message content</li>
                        <li style={{ marginBottom: '4px' }}>Passwords</li>
                        <li style={{ marginBottom: '4px' }}>Financial details</li>
                        <li style={{ marginBottom: '4px' }}>Personal contacts</li>
                    </ul>
                    <p>We do not have the ability to view or reconstruct your activity.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        4. How We Use Information
                    </h2>
                    <p style={{ marginBottom: '8px' }}>We use data to:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Operate and improve Myrad</li>
                        <li style={{ marginBottom: '4px' }}>Generate anonymous, aggregated behavior signals</li>
                        <li style={{ marginBottom: '4px' }}>Prevent fraud and abuse</li>
                        <li style={{ marginBottom: '4px' }}>Distribute rewards</li>
                    </ul>
                    <p style={{ fontWeight: 500 }}>We do not sell personal information.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        5. Data Sharing
                    </h2>
                    <p style={{ marginBottom: '8px' }}>We share only:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Aggregated, anonymized signals that represent groups of users</li>
                        <li style={{ marginBottom: '4px' }}>Never individual user data</li>
                    </ul>
                    <p>These signals are used for research, analytics, and product improvement by organizations.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        6. Data Retention
                    </h2>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Account information is kept while your account is active</li>
                        <li style={{ marginBottom: '4px' }}>Aggregated signals contain no personal identifiers and may be retained for research use</li>
                    </ul>
                    <p>You may delete your account at any time.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        7. Your Rights
                    </h2>
                    <p style={{ marginBottom: '8px' }}>You can:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Disconnect connected services</li>
                        <li style={{ marginBottom: '4px' }}>Request account deletion</li>
                        <li style={{ marginBottom: '4px' }}>Stop participating at any time</li>
                    </ul>
                    <p>Deleting your account removes your personal account data from Myrad systems.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        8. Security
                    </h2>
                    <p>
                        We use industry standard security practices to protect our systems. Since we do not store raw personal activity data, your exposure risk is significantly reduced.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        9. Children's Privacy
                    </h2>
                    <p>Myrad is not intended for individuals under 18.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        10. Changes to This Policy
                    </h2>
                    <p>We may update this Privacy Policy as our service evolves. We will notify users of major changes.</p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        11. Contact
                    </h2>
                    <p>
                        For privacy questions, contact: <a href="mailto:info@myradhq.xyz" style={{ color: '#111', textDecoration: 'underline' }}>info@myradhq.xyz</a>
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
