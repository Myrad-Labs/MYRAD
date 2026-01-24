import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            color: '#333',
            fontSize: '15px',
            lineHeight: 1.7
        }}>
            <Header />

            <main style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 48px', textAlign: 'left' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111', marginBottom: '24px' }}>
                    About Myrad
                </h1>

                <section style={{ marginBottom: '24px' }}>
                    <p style={{ marginBottom: '16px' }}>
                        Myrad lets users monetize their digital activity without giving up privacy.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                        We turn user activity into anonymized signals that help with research and analytics. We never collect, store, or sell personal information.
                    </p>
                    <p>
                        For businesses, Myrad provides real and reliable signals. For users, Myrad offers control and transparency without giving up privacy.
                    </p>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '10px' }}>
                        Our Principles
                    </h2>
                    <ul style={{ margin: '0 0 0 24px', paddingLeft: 0, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>No personal data collection</li>
                        <li style={{ marginBottom: '4px' }}>Verification you can trust</li>
                        <li style={{ marginBottom: '4px' }}>Privacy built into the system</li>
                        <li style={{ marginBottom: '4px' }}>Participation is always optional</li>
                    </ul>
                </section>

                <section style={{ paddingTop: '16px', borderTop: '1px solid #eee' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        For full details, please review our{' '}
                        <Link to="/terms" style={{ color: '#111', textDecoration: 'underline' }}>Terms and Conditions</Link>
                        {' '}and{' '}
                        <Link to="/privacy" style={{ color: '#111', textDecoration: 'underline' }}>Privacy Policy</Link>.
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
