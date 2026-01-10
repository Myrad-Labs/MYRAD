import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Database, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Waves from '../components/DynamicBackground';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);


    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const handleContributorClick = () => {
        navigate('/contribute');
    };

    return (
        <div style={{
            minHeight: '100vh',
            color: '#111827',
            fontFamily: '"Satoshi", sans-serif',
            overflowX: 'hidden',
            position: 'relative',
            background: '#ffffff'
        }}>
            <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .content-wrapper { position: relative; z-index: 10; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                
                /* Premium Card Styles */
                .feature-card { 
                    background: #ffffff; 
                    border: 1px solid #f3f4f6; 
                    border-top: 4px solid transparent;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
                    position: relative;
                }
                .feature-card:hover { 
                    transform: translateY(-4px); 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08); 
                    border-color: #e5e7eb;
                    border-top-color: #111827;
                }

                /* Button Styles */
                .btn-primary { 
                    background: #374151; 
                    border: 1px solid #374151;
                    color: #fff; 
                    font-weight: 500; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .btn-primary:hover { 
                    background: #1f2937; 
                    border-color: #1f2937;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .btn-secondary { 
                    background: #f9fafb; 
                    border: 1px solid #e5e7eb; 
                    color: #374151; 
                    font-weight: 500; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .btn-secondary:hover { 
                    background: #f3f4f6;
                    color: #111827; 
                    border-color: #d1d5db;
                }

                /* Usecase Row Styles */
                .usecase-row {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    padding: 24px;
                    border-bottom: 1px solid #f3f4f6;
                    transition: all 0.2s ease;
                    border-radius: 8px;
                    cursor: default;
                }
                .usecase-row:hover {
                    background: #f9fafb;
                    transform: translateX(10px);
                    border-color: transparent;
                }
                .usecase-title {
                    font-weight: 600;
                    color: #1f2937;
                    min-width: 200px;
                    font-size: 18px;
                }
                .usecase-desc {
                    color: #6b7280;
                    font-size: 16px;
                    transition: color 0.2s;
                }
                .usecase-row:hover .usecase-desc {
                    color: #374151;
                }
            `}</style>

            {/* Dynamic Waves Background */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <Waves
                    lineColor="rgba(0,0,0,0.06)"
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

            <div className="content-wrapper">
                <Header />

                {/* Hero Section */}
                <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '160px 24px 100px', position: 'relative' }}>
                    <div style={{ maxWidth: '1000px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        {isVisible && (
                            <h1 className="animate-fadeInUp delay-100" style={{
                                fontSize: '60px',
                                fontWeight: 600,
                                lineHeight: 1.1,
                                marginBottom: '28px',
                                letterSpacing: '-0.02em',
                                color: '#374151',
                            }}>
                                Human Data<br />
                                Without Surveillance
                            </h1>
                        )}
                        {isVisible && (
                            <p className="animate-fadeInUp delay-200" style={{
                                fontSize: '18px',
                                color: '#4b5563',
                                lineHeight: 1.6,
                                maxWidth: '720px',
                                margin: '0 auto 48px',
                                fontWeight: 400
                            }}>
                                Cryptographically verified human data, without collecting personal information.                        </p>
                        )}
                        {isVisible && (
                            <div className="animate-fadeInUp delay-300" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <button
                                    onClick={handleContributorClick}
                                    className="btn-primary"
                                    style={{ padding: '16px 32px', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    Become a contributor
                                </button>
                                <button
                                    onClick={() => window.open('https://calendly.com/carghya10/30min', '_blank')}
                                    className="btn-secondary"
                                    style={{ padding: '16px 32px', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    Talk to us <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Minimal Branding at bottom */}
                    <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, textAlign: 'center', opacity: 0.9 }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '0.1em', fontWeight: 600 }}>BACKED BY HUMANS</span>
                    </div>
                </section>

                {/* Value Props */}
                <section style={{ padding: '120px 24px', background: '#fafafa', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                            {[
                                {
                                    icon: Shield,
                                    title: "Verified at the Source",
                                    desc: "Behavior is verified directly from user approved sources using cryptographic proofs, not scraping or estimation."
                                },
                                {
                                    icon: Lock,
                                    title: "No Personal Data",
                                    desc: "Myrad never collects raw histories, identifiers, or private content. Only aggregated, non-identifying signals."
                                },
                                {
                                    icon: Database,
                                    title: "Built for Real Decisions",
                                    desc: "Data is delivered as cohort level signals designed for AI training, evaluation, and analytics."
                                }
                            ].map((card, i) => (
                                <div key={i} className="feature-card" style={{ padding: '48px 40px', borderRadius: '16px' }}>

                                    <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>{card.title}</h3>
                                    <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '15px' }}>{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Who uses MYRAD */}
                <section style={{ padding: '140px 24px', background: '#fff' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '48px', fontWeight: 600, marginBottom: '24px', color: '#374151', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    Who builds <br /> with Myrad
                                </h2>
                                <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1.7, maxWidth: '440px' }}>
                                    Trusted by teams building the next generation of AI, analytics, and consumer insights.
                                </p>
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {[
                                    { title: "AI & ML Teams", desc: "For training and evaluating foundational models" },
                                    { title: "Research Institutions", desc: "For unbiased, verifying human activity data" },
                                    { title: "Analytics Teams", desc: "For reliable, high-signal preference datasets" },
                                    { title: "Product Teams", desc: "For validating behavioral retention patterns" }
                                ].map((item, i) => (
                                    <div key={i} className="usecase-row">
                                        <div className="usecase-title">{item.title}</div>
                                        <div className="usecase-desc">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
