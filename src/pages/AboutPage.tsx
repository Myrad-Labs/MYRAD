import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            position: 'relative',
            overflowX: 'hidden',
            fontFamily: '"Satoshi", sans-serif',
            color: '#111827'
        }}>
            <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .content-wrapper { opacity: 0; position: relative; z-index: 10; }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .card {
                    background: #ffffff;
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .card:hover {
                    border-color: #e5e7eb;
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.06);
                }
                @media (max-width: 768px) {
                    .about-hero {
                        font-size: 36px !important;
                    }
                    main {
                        padding-top: 120px !important;
                    }
                }
            `}</style>

            <Header />
            <div className={`content-wrapper ${isVisible ? 'animate-fadeInUp' : ''}`}>
                {/* Hero */}
                {isVisible && (
                    <main className="animate-fadeInUp delay-100" style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <h1 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.02em', color: '#111827' }}>
                                About <span style={{ color: '#374151' }}>Myrad</span>
                            </h1>
                        </div>
                    </main>
                )}

                {/* Content */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-200" style={{
                        maxWidth: '720px',
                        margin: '0 auto',
                        padding: '0 24px 80px'
                    }}>
                        <div style={{ color: '#374151', fontSize: '17px', lineHeight: 1.8, textAlign: 'justify' }}>
                            <p style={{ marginBottom: '24px' }}>
                                Myrad exists to make human behavior data useful without compromising privacy.
                            </p>
                            <p style={{ marginBottom: '24px' }}>
                                Every day, people create valuable digital signals through the products and services they use. Today, this value is captured through opaque data collection, scraping, and inference, often without user awareness or control. Myrad was built to change that.
                            </p>
                            <p style={{ marginBottom: '24px' }}>
                                We provide verified human behavior data without collecting personal information. Behavior is verified only with explicit user consent and transformed into aggregated, non-identifying signals that businesses can trust. Raw data is never collected, stored, or sold.
                            </p>
                            <p style={{ marginBottom: '24px' }}>
                                For businesses, Myrad offers data that is provably real, reliable, and compliant by design. For individuals, Myrad offers transparency, control, and the ability to participate without giving up privacy.
                            </p>
                            <p style={{ marginBottom: '24px' }}>
                                Our approach is simple. Verification replaces trust. Privacy is built into the system, not added later. Participation is always optional.
                            </p>
                            <p style={{ marginBottom: '0' }}>
                                Myrad is built by a team focused on security, data integrity, and long term trust. We believe better data should not come at the cost of personal privacy, and that the future of data depends on systems people can confidently opt into.
                            </p>
                        </div>
                    </section>
                )}

                <Footer />
            </div>
        </div>
    );
};

export default AboutPage;
