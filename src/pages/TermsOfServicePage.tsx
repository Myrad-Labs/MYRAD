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
                        color: '#000',
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        Terms and Conditions
                    </h1>
                </div>

                <p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '48px' }}>
                    Last updated: [Date]
                </p>

                <div style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600,color: '#000', marginBottom: '16px' }}>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using MYRAD, you agree to these Terms and Conditions.
                            If you do not agree, do not use the platform.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            2. Description of Service
                        </h2>
                        <p>
                            MYRAD provides tools that allow users to verify certain digital activities and
                            contribute anonymized, aggregated insights to third parties.
                        </p>
                        <p>
                            MYRAD does not provide financial advice, investment advice, or guarantees of earnings.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            3. User Responsibilities
                        </h2>
                        <p>You agree to:</p>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Provide accurate information where required</li>
                            <li>- Use the platform only for lawful purposes</li>
                            <li>- Not attempt to manipulate or falsify verification</li>
                            <li>- Not interfere with platform security or integrity</li>
                        </ul>
                        <p>
                            Violation may result in suspension or termination.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            4. Rewards and Compensation
                        </h2>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Any rewards offered are discretionary and subject to change</li>
                            <li>- Rewards may vary based on contribution type and availability</li>
                            <li>- MYRAD does not guarantee specific earnings</li>
                        </ul>
                        <p>
                            Rewards are not wages or employment compensation.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            5. Intellectual Property
                        </h2>
                        <p>
                            All platform content, software, and trademarks are owned by MYRAD or its licensors.
                        </p>
                        <p>
                            Users retain ownership of their underlying data. By using the platform, users grant
                            MYRAD a limited right to process derived and anonymized insights as described.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            6. No Warranty
                        </h2>
                        <p>
                            MYRAD is provided on an “as is” and “as available” basis.
                        </p>
                        <p>
                            We do not guarantee uninterrupted access, error free operation, or specific outcomes.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000',marginBottom: '16px' }}>
                            7. Limitation of Liability
                        </h2>
                        <p>
                            To the maximum extent permitted by law, MYRAD shall not be liable for:
                        </p>
                        <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                            <li>- Indirect or consequential damages</li>
                            <li>- Loss of data, profits, or opportunities</li>
                            <li>- Third party platform changes or outages</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            8. Third Party Services
                        </h2>
                        <p>
                            MYRAD may integrate with third party services. MYRAD is not responsible for the
                            policies or practices of those services.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '16px' }}>
                            9. Termination
                        </h2>
                        <p>
                            MYRAD may suspend or terminate access if these terms are violated or if required by law.
                        </p>
                        <p>
                            Users may stop using the platform at any time.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600,color: '#000', marginBottom: '16px' }}>
                            10. Governing Law
                        </h2>
                        <p>
                            These Terms are governed by the laws of [Jurisdiction], without regard to conflict of
                            law principles.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 600,color: '#000', marginBottom: '16px' }}>
                            11. Changes to Terms
                        </h2>
                        <p>
                            We may update these Terms from time to time. Continued use constitutes acceptance
                            of updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '24px', fontWeight: 600,color: '#000', marginBottom: '16px' }}>
                            12. Contact
                        </h2>
                        <p>
                            For questions regarding these Terms, please contact us through our{' '}
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

export default TermsOfServicePage;
