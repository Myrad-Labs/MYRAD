import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfServicePage = () => {
    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            color: '#333',
            fontSize: '15px',
            lineHeight: 1.7
        }}>
            <Header />

            <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
                    Terms and Conditions
                </h1>
                <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>
                    Effective Date: January 24, 2026<br />
                    Company: Myrad (referred to as "Myrad", "we", "our", or "us")
                </p>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        1. About Myrad
                    </h2>
                    <p style={{ marginBottom: '10px' }}>
                        Myrad is a platform that allows users to contribute privacy safe, aggregated behavioral insights derived from their own digital activity. These insights are transformed into anonymized signals used for research, product improvement, and analytics by organizations.
                    </p>
                    <p>
                        Myrad does not collect, store, or sell raw personal activity data from third party platforms.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        2. Eligibility
                    </h2>
                    <p style={{ marginBottom: '8px' }}>You must:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Be at least 18 years old</li>
                        <li style={{ marginBottom: '4px' }}>Have the legal capacity to enter into agreements</li>
                        <li style={{ marginBottom: '4px' }}>Use your own accounts when connecting services</li>
                    </ul>
                    <p>
                        By using Myrad, you confirm that the information and accounts you connect belong to you.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        3. How Myrad Works
                    </h2>
                    <p style={{ marginBottom: '8px' }}>When you connect a supported service:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>You authorize a verification process, not a data transfer</li>
                        <li style={{ marginBottom: '4px' }}>Myrad does not receive or store your raw activity history</li>
                        <li style={{ marginBottom: '4px' }}>Your activity is transformed into aggregated, anonymized behavioral signals</li>
                        <li style={{ marginBottom: '4px' }}>These signals cannot be used to identify you</li>
                    </ul>
                    <p>
                        Your participation helps generate insights about general human behavior, not individual actions.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        4. No Raw Data Storage
                    </h2>
                    <p style={{ marginBottom: '8px' }}>Myrad does not:</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Store your browsing history</li>
                        <li style={{ marginBottom: '4px' }}>Store your order history</li>
                        <li style={{ marginBottom: '4px' }}>Store your watch history</li>
                        <li style={{ marginBottom: '4px' }}>Store personal messages or content</li>
                    </ul>
                    <p>
                        All outputs are non reversible statistical signals created from multiple contributors.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        5. User Rewards
                    </h2>
                    <p style={{ marginBottom: '8px' }}>Myrad may provide points, rankings, or rewards for participation.</p>
                    <ul style={{ margin: '0 0 10px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Rewards are discretionary</li>
                        <li style={{ marginBottom: '4px' }}>Reward structures may change</li>
                        <li style={{ marginBottom: '4px' }}>Abuse, fraud, or manipulation may result in removal from the program</li>
                    </ul>
                    <p>
                        Rewards do not create an employment, partnership, or agency relationship.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        6. User Responsibilities
                    </h2>
                    <p style={{ marginBottom: '8px' }}>You agree not to:</p>
                    <ul style={{ margin: '0 0 0 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>Use accounts that do not belong to you</li>
                        <li style={{ marginBottom: '4px' }}>Attempt to reverse engineer the system</li>
                        <li style={{ marginBottom: '4px' }}>Attempt to identify other users</li>
                        <li style={{ marginBottom: '4px' }}>Use Myrad for illegal purposes</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        7. Platform Independence
                    </h2>
                    <p style={{ marginBottom: '10px' }}>
                        Myrad is not affiliated with, endorsed by, or partnered with any third party services that users choose to connect.
                    </p>
                    <p>
                        All platform names and trademarks belong to their respective owners.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        8. Termination
                    </h2>
                    <p style={{ marginBottom: '10px' }}>
                        You may disconnect your accounts and stop participating at any time.
                    </p>
                    <p style={{ marginBottom: '8px' }}>Myrad may suspend or terminate access if:</p>
                    <ul style={{ margin: '0 0 0 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>These Terms are violated</li>
                        <li style={{ marginBottom: '4px' }}>Fraudulent or abusive behavior is detected</li>
                        <li style={{ marginBottom: '4px' }}>Required by law</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        9. Disclaimer of Warranties
                    </h2>
                    <p style={{ marginBottom: '10px' }}>
                        Myrad is provided "as is" without warranties of any kind.
                    </p>
                    <p>
                        We do not guarantee uninterrupted service or specific reward outcomes.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        10. Limitation of Liability
                    </h2>
                    <p>
                        To the maximum extent permitted by law, Myrad shall not be liable for indirect, incidental, or consequential damages arising from your use of the service.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        11. Changes to Terms
                    </h2>
                    <p>
                        We may update these Terms as the product evolves. Continued use after updates means you accept the revised Terms.
                    </p>
                </section>

                <section style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        12. Contact
                    </h2>
                    <p>
                        For questions, contact: <a href="mailto:info@myradhq.xyz" style={{ color: '#111', textDecoration: 'underline' }}>info@myradhq.xyz</a>
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default TermsOfServicePage;
