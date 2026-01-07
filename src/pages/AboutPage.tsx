import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Target, ArrowRight } from 'lucide-react';
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
            `}</style>

            <Header />
            <div className={`content-wrapper ${isVisible ? 'animate-fadeInUp' : ''}`}>
                {/* Hero */}
                {isVisible && (
                    <main className="animate-fadeInUp delay-100" style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <h1 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.02em', color: '#111827' }}>
                                About <span style={{ color: '#374151' }}>MYRAD</span>
                            </h1>
                            <p style={{ color: '#6b7280', fontSize: '18px' }}>
                                Building the future of user-owned data
                            </p>
                        </div>
                    </main>
                )}

                {/* Mission */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-200 card" style={{
                        borderRadius: '16px',
                        padding: '40px',
                        margin: '0 auto 24px',
                        maxWidth: '800px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Target size={20} color="#374151" />
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#111827' }}>Our Mission</h2>
                        </div>
                        <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                            MYRAD is building a privacy-first data network where users truly own their data.
                            We believe that personal data should benefit the people who generate it, not just
                            the corporations that collect it. Through zero-knowledge proofs and the Reclaim Protocol,
                            we enable users to contribute verified behavioral insights without exposing their
                            personal information—earning rewards while maintaining complete privacy.
                        </p>
                    </section>
                )}

                {/* Vision */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-300 card" style={{
                        borderRadius: '16px',
                        padding: '40px',
                        margin: '0 auto 24px',
                        maxWidth: '800px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={20} color="#374151" />
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#111827' }}>The Vision</h2>
                        </div>
                        <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '15px' }}>
                            We envision a world where data privacy and value creation go hand in hand.
                            Where users can safely contribute to AI development, market research, and
                            business intelligence without sacrificing their privacy. A future where the
                            $200+ billion data economy benefits everyone, not just data brokers.
                        </p>
                    </section>
                )}

                {/* Values */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-400 card" style={{
                        borderRadius: '16px',
                        padding: '40px',
                        margin: '0 auto 64px',
                        maxWidth: '800px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={20} color="#374151" />
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#111827' }}>Our Values</h2>
                        </div>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {[
                                { title: 'Privacy First', desc: 'No raw data ever leaves your device. Only cryptographic proofs.' },
                                { title: 'User Ownership', desc: 'You control your data. Delete anytime, no questions asked.' },
                                { title: 'Fair Compensation', desc: 'Every contribution is rewarded. Your data, your value.' },
                                { title: 'Transparency', desc: 'Open about how we work. No hidden agendas, no data selling.' }
                            ].map((value, i) => (
                                <div key={i} style={{
                                    padding: '16px 20px',
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#111827' }}>
                                        {value.title}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
                                        {value.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer CTA */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-500" style={{ textAlign: 'center', padding: '0 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                        <Link
                            to="/"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px 32px',
                                background: '#374151',
                                borderRadius: '12px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '15px',
                                transition: 'all 0.2s'
                            }}
                        >
                            Join the Data Union <ArrowRight size={16} />
                        </Link>
                    </section>
                )}

                <Footer />
            </div>
        </div>
    );
};

export default AboutPage;
