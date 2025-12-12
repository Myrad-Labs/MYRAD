import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight, Shield, Lock, Sparkles, CheckCircle, Zap, Eye, Gift, Menu, X } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        setTimeout(() => setIsVisible(true), 100);
        return () => window.removeEventListener('scroll', handleScroll);
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

    const navLinks = [
        { label: 'For Users', href: '#how-it-works' },
        { label: 'For Buyers', href: '/buyers' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'About', href: '/about' },
    ];

    const steps = [
        {
            number: '01',
            icon: Lock,
            title: 'Quick & Secure Login',
            description: 'Use your email or social accounts to sign up instantly with Privy Auth. No wallet setup required.',
            tech: 'Privy Auth'
        },
        {
            number: '02',
            icon: Eye,
            title: 'Contribute Privately',
            description: 'Connect apps like Zomato. We verify your order history without seeing raw data.',
            tech: 'Reclaim Protocol'
        },
        {
            number: '03',
            icon: Shield,
            title: 'Zero-Knowledge Proofs',
            description: 'A cryptographic guarantee that your activity is real. No raw logs, no PII ever leaves your device.',
            tech: 'ZK Proofs'
        },
        {
            number: '04',
            icon: Gift,
            title: 'Earn Rewards',
            description: 'For every verified insight you contribute, you earn points instantly. Track on your dashboard!',
            tech: 'Instant Rewards'
        }
    ];

    return (
        <div className="landing-page">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .landing-page {
                    background: #000;
                    min-height: 100vh;
                    color: #fff;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    overflow-x: hidden;
                    position: relative;
                }
                
                h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; }
                
                /* Smooth animated gradient background */
                .animated-bg {
                    position: fixed;
                    inset: 0;
                    overflow: hidden;
                    z-index: 0;
                }
                
                /* Large smooth gradient orbs */
                .gradient-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                    will-change: transform;
                }
                
                .orb-1 {
                    width: 800px;
                    height: 800px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
                    top: -20%;
                    left: -10%;
                    animation: float1 40s ease-in-out infinite;
                }
                
                .orb-2 {
                    width: 600px;
                    height: 600px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
                    top: 50%;
                    right: -15%;
                    animation: float2 50s ease-in-out infinite;
                }
                
                .orb-3 {
                    width: 500px;
                    height: 500px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
                    bottom: -10%;
                    left: 30%;
                    animation: float3 45s ease-in-out infinite;
                }
                
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(80px, 60px); }
                }
                
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-60px, -40px); }
                }
                
                @keyframes float3 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(40px, -50px); }
                }
                
                /* Subtle noise texture overlay */
                .noise-overlay {
                    position: fixed;
                    inset: 0;
                    opacity: 0.015;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    z-index: 1;
                }
                
                /* Content wrapper */
                .content-wrapper {
                    position: relative;
                    z-index: 10;
                }
                
                /* Entrance animations */
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
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
                
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                
                /* Cards */
                .card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.12);
                    transform: translateY(-6px);
                }
                
                /* Primary button */
                .btn-primary {
                    background: #fff;
                    border: none;
                    color: #000;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 40px rgba(255, 255, 255, 0.15);
                }
                
                /* Secondary button */
                .btn-secondary {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                /* Navigation */
                .nav-link {
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 8px 16px;
                    border-radius: 8px;
                    transition: all 0.25s ease;
                }
                
                .nav-link:hover {
                    color: #fff;
                }
                
                /* Step number */
                .step-number {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    font-size: 64px;
                    font-weight: 800;
                    font-family: 'Space Grotesk', sans-serif;
                    color: rgba(255, 255, 255, 0.04);
                    line-height: 1;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                    .hero-title { font-size: 40px !important; }
                    .hero-subtitle { font-size: 16px !important; }
                }
                
                @media (min-width: 769px) {
                    .mobile-menu-btn { display: none !important; }
                }
                
                html { scroll-behavior: smooth; }
            `}</style>

            {/* Animated Background */}
            <div className="animated-bg">
                <div className="gradient-orb orb-1" />
                <div className="gradient-orb orb-2" />
                <div className="gradient-orb orb-3" />
            </div>

            {/* Subtle noise texture */}
            <div className="noise-overlay" />

            {/* Main Content */}
            <div className="content-wrapper">
                {/* Header */}
                <header style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: scrollY > 50 ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                    backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                    borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'all 0.4s ease'
                }}>
                    <div style={{
                        maxWidth: '1280px',
                        margin: '0 auto',
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                letterSpacing: '-0.03em',
                                color: '#fff',
                                fontFamily: "'Space Grotesk', sans-serif"
                            }}>
                                MYRAD
                            </div>
                        </Link>

                        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {navLinks.map((link, i) => (
                                link.href.startsWith('#') ? (
                                    <a key={i} href={link.href} className="nav-link">{link.label}</a>
                                ) : (
                                    <Link key={i} to={link.href} className="nav-link">{link.label}</Link>
                                )
                            ))}
                        </nav>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={handleGetStarted}
                                className="btn-primary"
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {authenticated ? 'Dashboard' : 'Get Started'}
                                <ArrowRight size={16} />
                            </button>

                            <button
                                className="mobile-menu-btn"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    display: 'none',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'rgba(0, 0, 0, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            padding: '20px 24px'
                        }}>
                            {navLinks.map((link, i) => (
                                link.href.startsWith('#') ? (
                                    <a key={i} href={link.href} className="nav-link" style={{ display: 'block', padding: '14px 0' }} onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
                                ) : (
                                    <Link key={i} to={link.href} className="nav-link" style={{ display: 'block', padding: '14px 0' }} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
                                )
                            ))}
                        </div>
                    )}
                </header>

                {/* Hero Section */}
                <section style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '140px 24px 100px',
                    position: 'relative'
                }}>
                    <div style={{ maxWidth: '800px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        {/* Badge */}
                        {isVisible && (
                            <div className="animate-fadeInUp delay-100" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.7)',
                                marginBottom: '32px'
                            }}>
                                <Sparkles size={14} />
                                Privacy-First Data Network
                            </div>
                        )}

                        {/* Main Headline */}
                        {isVisible && (
                            <h1 className="animate-fadeInUp delay-200 hero-title" style={{
                                fontSize: '68px',
                                fontWeight: 700,
                                lineHeight: 1.05,
                                marginBottom: '24px',
                                letterSpacing: '-0.04em',
                                color: '#fff'
                            }}>
                                Your Data.
                                <br />
                                Your Rewards.
                            </h1>
                        )}

                        {/* Sub-headline */}
                        {isVisible && (
                            <p className="animate-fadeInUp delay-300 hero-subtitle" style={{
                                fontSize: '18px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                lineHeight: 1.7,
                                maxWidth: '550px',
                                margin: '0 auto 48px',
                                fontWeight: 400
                            }}>
                                Transform your app activity into rewards with zero-knowledge proofs.
                                Your data stays private. Your rewards stay real.
                            </p>
                        )}

                        {/* CTA Buttons */}
                        {isVisible && (
                            <div className="animate-fadeInUp delay-400" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleGetStarted}
                                    className="btn-primary"
                                    style={{
                                        padding: '18px 40px',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <Zap size={18} />
                                    Start Earning
                                    <ArrowRight size={18} />
                                </button>

                                <a
                                    href="#how-it-works"
                                    className="btn-secondary"
                                    style={{
                                        padding: '18px 40px',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    How It Works
                                </a>
                            </div>
                        )}

                        {/* Trust Indicators */}
                        {isVisible && (
                            <div className="animate-fadeInUp delay-500" style={{
                                display: 'flex',
                                gap: '48px',
                                justifyContent: 'center',
                                marginTop: '80px',
                                flexWrap: 'wrap'
                            }}>
                                {[
                                    { icon: Shield, label: 'Zero-Knowledge Proofs' },
                                    { icon: Lock, label: 'End-to-End Encrypted' },
                                    { icon: CheckCircle, label: 'No PII Stored' }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '13px',
                                        fontWeight: 500
                                    }}>
                                        <item.icon size={16} color="rgba(255,255,255,0.5)" />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" style={{
                    padding: '120px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {/* Section Header */}
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.4)',
                                marginBottom: '16px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                How It Works
                            </p>
                            <h2 style={{
                                fontSize: '44px',
                                fontWeight: 700,
                                marginBottom: '16px',
                                letterSpacing: '-0.03em',
                                color: '#fff'
                            }}>
                                Simple. Secure. Rewarding.
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
                                Your data never leaves your device. Only cryptographic proofs are shared.
                            </p>
                        </div>

                        {/* Steps Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '20px'
                        }}>
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="card"
                                    style={{
                                        borderRadius: '20px',
                                        padding: '36px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div className="step-number">{step.number}</div>

                                    {/* Icon */}
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '14px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '24px'
                                    }}>
                                        <step.icon size={24} color="rgba(255,255,255,0.7)" />
                                    </div>

                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        marginBottom: '12px',
                                        color: '#fff'
                                    }}>
                                        {step.title}
                                    </h3>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '14px',
                                        lineHeight: 1.7,
                                        marginBottom: '20px'
                                    }}>
                                        {step.description}
                                    </p>

                                    <div style={{
                                        display: 'inline-flex',
                                        padding: '6px 12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: 'rgba(255,255,255,0.5)'
                                    }}>
                                        {step.tech}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section style={{
                    padding: '120px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative'
                }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                            gap: '24px'
                        }}>
                            {/* For Users */}
                            <div className="card" style={{
                                borderRadius: '24px',
                                padding: '40px'
                            }}>
                                <div style={{
                                    padding: '6px 14px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '100px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.6)',
                                    display: 'inline-block',
                                    marginBottom: '24px'
                                }}>
                                    For Users
                                </div>
                                <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2, color: '#fff' }}>
                                    Earn While You Stay Private
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                                    {[
                                        '100 points welcome bonus',
                                        '500 points per contribution',
                                        'Full control over your data',
                                        'Delete everything anytime',
                                        'Privacy-preserving by design'
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                            <CheckCircle size={16} color="rgba(255,255,255,0.4)" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleGetStarted}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    Start Earning <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* For Buyers */}
                            <div className="card" style={{
                                borderRadius: '24px',
                                padding: '40px'
                            }}>
                                <div style={{
                                    padding: '6px 14px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '100px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.6)',
                                    display: 'inline-block',
                                    marginBottom: '24px'
                                }}>
                                    For Buyers
                                </div>
                                <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2, color: '#fff' }}>
                                    Compliant Intelligence
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                                    {[
                                        'API access to anonymized data',
                                        'Real behavioral insights',
                                        'GDPR & CCPA compliant',
                                        'User-consented data only',
                                        'Aggregated analytics'
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                            <CheckCircle size={16} color="rgba(255,255,255,0.4)" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/buyers"
                                    className="btn-secondary"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    Learn More <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section style={{
                    padding: '140px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{
                            fontSize: '48px',
                            fontWeight: 700,
                            marginBottom: '20px',
                            letterSpacing: '-0.03em',
                            color: '#fff'
                        }}>
                            Ready to Own Your Data?
                        </h2>
                        <p style={{
                            fontSize: '17px',
                            color: 'rgba(255,255,255,0.45)',
                            marginBottom: '40px',
                            lineHeight: 1.7
                        }}>
                            Join the privacy-first data network. Start earning rewards while keeping your information secure.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="btn-primary"
                            style={{
                                padding: '20px 48px',
                                borderRadius: '14px',
                                fontSize: '17px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <Sparkles size={18} />
                            Get Started Free
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{
                    padding: '48px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '24px'
                        }}>
                            <div style={{
                                fontSize: '22px',
                                fontWeight: 800,
                                color: '#fff',
                                fontFamily: "'Space Grotesk', sans-serif"
                            }}>
                                MYRAD
                            </div>
                            <nav style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                                <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>How It Works</a>
                                <Link to="/buyers" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>For Buyers</Link>
                                <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Privacy</Link>
                                <Link to="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Terms</Link>
                            </nav>
                        </div>
                        <div style={{
                            paddingTop: '24px',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.25)',
                            fontSize: '13px'
                        }}>
                            © 2024 MYRAD Labs. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
