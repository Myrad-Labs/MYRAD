import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Target, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Waves from '../components/DynamicBackground';

const AboutPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const accent = '#4F46E5';

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            position: 'relative',
            overflowX: 'hidden'
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

            <style>{`
                * { font-family: inherit; }
                h1, h2, h3 { font-family: inherit; }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .content-wrapper {
                    opacity: 0;
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-600 { animation-delay: 0.6s; }
                .card {
                    background: rgba(255,255,255,0.8);
                    border: 1px solid rgba(0,0,0,0.08);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                }
                .card:hover {
                    background: rgba(255,255,255,0.95);
                    border-color: rgba(0,0,0,0.12);
                    transform: translateY(-6px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
                }
            `}</style>

            <Header />
            <div className={`content-wrapper ${isVisible ? 'animate-fadeInUp' : ''}`}>
                {/* Hero */}
                {isVisible && (
                    <main className="animate-fadeInUp delay-100" style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px 0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: 'rgba(79, 70, 229, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <Sparkles size={40} color={accent} />
                            </div>
                            <h1 style={{
                                fontSize: '42px',
                                fontWeight: 700,
                                marginBottom: '16px',

                            }}>
                                About <span style={{ color: accent }}>MYRAD</span>
                            </h1>
                            <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '18px' }}>
                                Building the future of user-owned data
                            </p>
                        </div>
                    </main>
                )}

                {/* Mission */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-200" style={{
                        background: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '20px',
                        padding: '40px',
                        margin: '0 auto 32px',
                        maxWidth: '800px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Target size={24} color={accent} />
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>Our Mission</h2>
                        </div>
                        <p style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8, fontSize: '16px' }}>
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
                        borderRadius: '20px',
                        padding: '40px',
                        margin: '0 auto 32px',
                        maxWidth: '800px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Shield size={24} color={accent} />
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>The Vision</h2>
                        </div>
                        <p style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8, fontSize: '16px' }}>
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
                        borderRadius: '20px',
                        padding: '40px',
                        margin: '0 auto 64px',
                        maxWidth: '800px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Users size={24} color={accent} />
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>Our Values</h2>
                        </div>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {[
                                { title: 'Privacy First', desc: 'No raw data ever leaves your device. Only cryptographic proofs.' },
                                { title: 'User Ownership', desc: 'You control your data. Delete anytime, no questions asked.' },
                                { title: 'Fair Compensation', desc: 'Every contribution is rewarded. Your data, your value.' },
                                { title: 'Transparency', desc: 'Open about how we work. No hidden agendas, no data selling.' }
                            ].map((value, i) => (
                                <div key={i} style={{
                                    padding: '16px',
                                    background: 'rgba(79, 70, 229, 0.04)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(79, 70, 229, 0.1)'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: accent }}>
                                        {value.title}
                                    </h3>
                                    <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '14px' }}>
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
                                background: '#1a1a1a',
                                borderRadius: '12px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '15px'
                            }}
                        >
                            Join the Data Union
                        </Link>
                    </section>
                )}

                {/* Footer */}
                {isVisible && (
                    <section className="animate-fadeInUp delay-600">
                        <Footer />
                    </section>
                )}
            </div>
        </div>
    );
};

export default AboutPage;
