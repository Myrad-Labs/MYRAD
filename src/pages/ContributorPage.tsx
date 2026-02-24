import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';

import Header from '../components/Header';
import Footer from '../components/Footer';

const ContributorPage = () => {
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const [isVisible, setIsVisible] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Scroll-triggered video playback
    useEffect(() => {
        const videoElement = videoRef.current;
        const containerElement = videoContainerRef.current;
        if (!videoElement || !containerElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoElement.currentTime = 0;
                        videoElement.play();
                    } else {
                        videoElement.pause();
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(containerElement);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    useEffect(() => {
        if (authenticated && ready) {
            navigate('/dashboard');
        }
    }, [authenticated, ready, navigate]);

    const handleGetStarted = () => {
        if (authenticated) {
            navigate('/dashboard');
        } else {
            login();
        }
    };

    const features = [
        {
            title: 'Secure Authentication',
            description: 'Sign in instantly with Privy Auth. No complex wallet setup required.'
        },
        {
            title: 'Privacy Preserved',
            description: 'Your raw data never leaves your device. Only cryptographic proofs are shared.'
        },
        {
            title: 'Zero-Knowledge Proofs',
            description: 'Verify your activity without revealing personal information.'
        },

    ];

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
                
                /* Animations */
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0% { transform: perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(0px); } 50% { transform: perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(-20px); } 100% { transform: perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(0px); } }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }

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
                    transform: translateY(-1px); 
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); 
                }

                .feature-row {
                    padding: 24px;
                    border: 1px solid #f3f4f6;
                    border-radius: 12px;
                    background: #ffffff;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .feature-row:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
                    border-color: #e5e7eb;
                    background: #fafafa;
                }
                .feature-row:last-child {
                    border-bottom: 1px solid #f3f4f6;
                }

                /* Mobile Optimizations */
                @media (max-width: 900px) {
                    .how-to-grid { 
                        grid-template-columns: 1fr !important; 
                        gap: 40px !important;
                    }
                    .how-to-grid h2 {
                        font-size: 28px !important;
                    }
                }
                @media (max-width: 768px) {
                    /* Hero Section */
                    .contributor-hero {
                        min-height: auto !important;
                        padding: 100px 16px 40px !important;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                        text-align: left;
                    }
                    .hero-grid h1 {
                        font-size: 40px !important;
                    }
                    .hero-grid p {
                        font-size: 16px !important;
                        max-width: 100% !important;
                    }
                    .hero-actions {
                        justify-content: flex-start !important;
                    }

                    /* Glass Card Visual */
                    .hero-visual {
                        height: auto !important;
                        min-height: 320px;
                        margin-top: 10px;
                    }
                    .hero-visual .decorative-circle {
                        display: none !important;
                    }
                    .glass-card {
                        width: 280px !important;
                        padding: 24px !important;
                        border-radius: 24px !important;
                        box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.15) !important;
                    }
                    .glass-card-inner {
                        padding: 16px !important;
                    }
                    .glass-card-earnings {
                        font-size: 22px !important;
                    }
                    .floating-badge {
                        display: none !important;
                    }

                    /* Features & Video */
                    .how-to-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    .section-padding {
                        padding: 60px 16px !important;
                    }
                    .features-heading {
                        font-size: 26px !important;
                    }
                    
                    /* CTA */
                    .cta-section {
                        padding: 80px 16px !important;
                    }
                    .cta-heading {
                        font-size: 30px !important;
                    }
                }
                @media (max-width: 480px) {
                    .contributor-hero {
                        padding: 90px 16px 30px !important;
                    }
                    .hero-grid h1 {
                        font-size: 32px !important;
                        line-height: 1.1 !important;
                    }
                    .hero-grid p {
                        font-size: 15px !important;
                        margin-bottom: 28px !important;
                    }
                    .hero-visual {
                        min-height: 260px;
                    }
                    .glass-card {
                        width: 240px !important;
                        padding: 20px !important;
                    }
                    .glass-card-earnings {
                        font-size: 20px !important;
                    }
                    .cta-heading {
                        font-size: 24px !important;
                    }
                    .cta-section {
                        padding: 60px 16px !important;
                    }
                    .features-heading {
                        font-size: 22px !important;
                        margin-bottom: 24px !important;
                    }
                    .feature-row {
                        padding: 16px 0 !important;
                    }
                }
            `}</style>


            <div className="content-wrapper">
                <Header />

                {/* Hero Section */}
                <section className="contributor-hero" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative' }}>
                    <div className="hero-grid" style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 0.8fr)', gap: '60px', alignItems: 'center' }}>

                        {/* Left: Text Content */}
                        <div style={{ textAlign: 'left', position: 'relative', zIndex: 1 }}>
                            {isVisible && (
                                <h1 className="animate-fadeInUp delay-200" style={{ fontSize: '72px', fontWeight: 600, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.03em', color: '#111827' }}>
                                    Earn from your <br />
                                    <span style={{ background: 'linear-gradient(135deg, #111827 0%, #4b5563 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>day to day apps</span>
                                </h1>
                            )}
                            {isVisible && (
                                <p className="animate-fadeInUp delay-300" style={{ fontSize: '19px', color: '#4b5563', lineHeight: 1.6, maxWidth: '540px', marginBottom: '40px', fontWeight: 400 }}>
                                    Your data creates value every day<br></br>
                                    Myrad lets you earn from it without giving up your privacy
                                </p>
                            )}
                            {isVisible && (
                                <div className="animate-fadeInUp delay-400 hero-actions" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '16px 36px', borderRadius: '50px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        Start earning
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Abstract Visual */}
                        <div className="hero-visual" style={{ position: 'relative', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Decorative Circles - Made darker for contrast */}
                            <div className="decorative-circle" style={{ position: 'absolute', width: '450px', height: '450px', background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.6, top: '5%', right: '0%' }} />
                            <div className="decorative-circle" style={{ position: 'absolute', width: '300px', height: '300px', background: 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.4, bottom: '-10%', left: '10%' }} />

                            {/* Glass Card */}
                            <div className="glass-card" style={{
                                position: 'relative',
                                width: '380px',
                                maxWidth: '90vw',
                                padding: '40px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                                border: '1px solid #d1d5db',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                                borderRadius: '32px',
                                zIndex: 2
                            }}>
                                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <img src="/logo.png" alt="MYRAD" style={{ width: '35px', height: '35px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <div style={{ padding: '6px 16px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #d1fae5' }}>
                                        Verified Source
                                    </div>
                                </div>

                                <div style={{ height: '8px', width: '60%', background: '#e5e7eb', borderRadius: '4px', marginBottom: '16px' }} />
                                <div style={{ height: '8px', width: '40%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '40px' }} />

                                <div className="glass-card-inner" style={{ position: 'relative', padding: '24px', background: '#fff', borderRadius: '20px', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        {/* USDC Logo */}
                                        <img src="/usdc.png" alt="USDC" style={{ width: '24px', height: '24px' }} />
                                        <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Total Earnings</div>
                                    </div>
                                    <div className="glass-card-earnings" style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>1,240.50 USDC</div>

                                    {/* Trend Line Decoration */}
                                    <svg width="100%" height="40" viewBox="0 0 100 40" style={{ marginTop: '10px', opacity: 0.8 }}>
                                        <path d="M0 35 C 20 35, 20 10, 40 20 C 60 30, 60 5, 100 0" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M100 0 L 100 40 L 0 40 Z" fill="url(#gradient)" style={{ opacity: 0.1 }} />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#22c55e" />
                                                <stop offset="100%" stopColor="#ffffff" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="animate-fadeInUp delay-300 floating-badge" style={{
                                position: 'absolute',
                                bottom: '80px',
                                left: '-20px',
                                background: '#fff',
                                padding: '16px 24px',
                                borderRadius: '16px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                border: '1px solid #f3f4f6',
                                transform: 'perspective(1000px) translateZ(50px)',
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }} />
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Data Secured</div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Video & Features Section */}
                <section className="section-padding" style={{ padding: '100px 24px', background: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {/* Centered Heading */}
                        <h2 style={{ 
                            fontSize: '42px', 
                            fontWeight: 600, 
                            marginBottom: '80px', 
                            letterSpacing: '-0.02em', 
                            color: '#111827',
                            textAlign: 'center'
                        }}>
                            How to contribute
                        </h2>

                        <div className="how-to-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(300px, 0.8fr) minmax(400px, 1.2fr)',
                            gap: '80px',
                            alignItems: 'start'
                        }}>
                            {/* Left: Features Clean List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {features.map((feature, i) => (
                                    <div key={i} className="feature-row">
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>{feature.title}</h3>
                                        <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>{feature.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Video */}
                            <motion.div
                                ref={videoContainerRef}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                style={{
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    background: '#000',
                                    marginTop: '0'
                                }}
                            >
                                <video
                                    ref={videoRef}
                                    src="tutorial.webm"
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        width: '100%',
                                        display: 'block'
                                    }}
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section" style={{ padding: '140px 24px', textAlign: 'center', background: '#fafafa' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="cta-heading" style={{ fontSize: '42px', fontWeight: 600, marginBottom: '24px', letterSpacing: '-0.03em', color: '#111827' }}>Ready to monetize your data?</h2>
                        <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '18px 48px', borderRadius: '100px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            Start earning now
                        </button>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
};

export default ContributorPage;
