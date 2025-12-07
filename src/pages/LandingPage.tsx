import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight, Shield, Lock, Sparkles, CheckCircle, Zap, Eye, Gift, Menu, X } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
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

    const accent = '#E5B94E';
    const accentGlow = 'rgba(229, 185, 78, 0.3)';

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
            description: 'Use your email or social accounts to sign up instantly with Privy Auth. No wallet setup required to start.',
            tech: 'Privy Auth'
        },
        {
            number: '02',
            icon: Eye,
            title: 'Contribute Privately',
            description: 'Connect apps like Zomato or Swiggy. We use the Reclaim Protocol to verify your order history without seeing the raw data.',
            tech: 'Reclaim Protocol'
        },
        {
            number: '03',
            icon: Shield,
            title: 'Proof Verified',
            description: 'The system receives a Zero-Knowledge Proof—a cryptographic guarantee that your activity is real. No raw logs, no PII, ever leaves your device.',
            tech: 'Zero-Knowledge Proofs'
        },
        {
            number: '04',
            icon: Gift,
            title: 'Get Your Points',
            description: 'For every verified, anonymous insight you contribute, you are instantly credited with Points. Track your balance on your dashboard!',
            tech: 'Instant Rewards'
        }
    ];

    return (
        <div style={{
            background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            overflow: 'hidden'
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
                h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }
                
                .nav-link {
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    padding: 8px 16px;
                    border-radius: 8px;
                }
                .nav-link:hover { 
                    color: #fff;
                    background: rgba(255,255,255,0.05);
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #E5B94E 0%, #D4A843 100%);
                    border: none;
                    color: #000;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(229, 185, 78, 0.3);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(229, 185, 78, 0.4);
                }
                
                .step-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .step-card:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(229, 185, 78, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                
                .glow-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    pointer-events: none;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                
                .floating { animation: float 6s ease-in-out infinite; }
                .pulse { animation: pulse 4s ease-in-out infinite; }
                
                .gradient-text {
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .accent-text {
                    background: linear-gradient(135deg, #E5B94E 0%, #F5D78E 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                }
                @media (min-width: 769px) {
                    .mobile-menu-btn { display: none !important; }
                }
            `}</style>

            {/* Background Effects */}
            <div className="glow-orb pulse" style={{ top: '10%', left: '10%', width: '400px', height: '400px', background: 'rgba(229, 185, 78, 0.08)' }} />
            <div className="glow-orb pulse" style={{ top: '60%', right: '5%', width: '500px', height: '500px', background: 'rgba(229, 185, 78, 0.05)', animationDelay: '2s' }} />
            <div className="glow-orb" style={{ bottom: '10%', left: '30%', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.05)' }} />

            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: scrollY > 50 ? 'rgba(0,0,0,0.9)' : 'transparent',
                backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: accent,
                            fontFamily: "'Space Grotesk', sans-serif"
                        }}>
                            MYRAD
                        </div>
                    </Link>

                    <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                padding: '12px 24px',
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
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                        background: 'rgba(0,0,0,0.95)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        padding: '16px 24px'
                    }}>
                        {navLinks.map((link, i) => (
                            link.href.startsWith('#') ? (
                                <a key={i} href={link.href} className="nav-link" style={{ display: 'block', padding: '12px 0' }} onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
                            ) : (
                                <Link key={i} to={link.href} className="nav-link" style={{ display: 'block', padding: '12px 0' }} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
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
                padding: '120px 24px 80px',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {/* Badge */}
                    <div className="floating" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(229, 185, 78, 0.1)',
                        border: '1px solid rgba(229, 185, 78, 0.2)',
                        borderRadius: '100px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: accent,
                        marginBottom: '32px'
                    }}>
                        <Sparkles size={14} />
                        Privacy-First Data Network
                    </div>

                    {/* Main Headline */}
                    <h1 style={{
                        fontSize: 'clamp(40px, 8vw, 72px)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        letterSpacing: '-0.03em'
                    }}>
                        <span className="gradient-text">You Own Your Data.</span>
                        <br />
                        <span className="accent-text">Now, Get Rewarded for It.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p style={{
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                        maxWidth: '700px',
                        margin: '0 auto 48px'
                    }}>
                        Join the privacy-first data network that transforms your app activity into points,
                        secured by <span style={{ color: accent }}>zero-knowledge proofs</span>.
                        Your data stays private. Your rewards stay real.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleGetStarted}
                            className="btn-primary"
                            style={{
                                padding: '18px 36px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Zap size={18} />
                            Start Earning Points
                            <ArrowRight size={18} />
                        </button>

                        <a
                            href="#how-it-works"
                            style={{
                                padding: '18px 36px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            Learn More
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div style={{
                        display: 'flex',
                        gap: '32px',
                        justifyContent: 'center',
                        marginTop: '64px',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { icon: Shield, label: 'Zero-Knowledge Proofs' },
                            { icon: Lock, label: 'End-to-End Privacy' },
                            { icon: CheckCircle, label: 'No PII Stored' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                <item.icon size={16} color={accent} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" style={{
                padding: '120px 24px',
                background: 'rgba(255,255,255,0.01)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{
                            fontSize: 'clamp(32px, 5vw, 48px)',
                            fontWeight: 700,
                            marginBottom: '16px',
                            letterSpacing: '-0.02em'
                        }}>
                            <span className="accent-text">Zero-Knowledge,</span> Maximum Reward
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            The Privacy Promise: Your data never leaves your device. Only proofs do.
                        </p>
                    </div>

                    {/* Steps Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px'
                    }}>
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className="step-card"
                                style={{
                                    borderRadius: '20px',
                                    padding: '32px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Step Number */}
                                <div style={{
                                    position: 'absolute',
                                    top: '24px',
                                    right: '24px',
                                    fontSize: '64px',
                                    fontWeight: 800,
                                    color: 'rgba(229, 185, 78, 0.08)',
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    lineHeight: 1
                                }}>
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: 'rgba(229, 185, 78, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <step.icon size={28} color={accent} />
                                </div>

                                {/* Content */}
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    marginBottom: '12px',
                                    color: '#fff'
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '14px',
                                    lineHeight: 1.7,
                                    marginBottom: '16px'
                                }}>
                                    {step.description}
                                </p>

                                {/* Tech Tag */}
                                <div style={{
                                    display: 'inline-flex',
                                    padding: '6px 12px',
                                    background: 'rgba(229, 185, 78, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: accent
                                }}>
                                    {step.tech}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '120px 24px', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '48px'
                    }}>
                        {/* For Users */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px',
                            padding: '40px'
                        }}>
                            <div style={{
                                padding: '6px 14px',
                                background: 'rgba(229, 185, 78, 0.1)',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: accent,
                                display: 'inline-block',
                                marginBottom: '24px'
                            }}>
                                For Users
                            </div>
                            <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
                                Earn While You Stay Private
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    '100 points welcome bonus',
                                    '500 points per data contribution',
                                    'Full control over your data',
                                    'Delete everything anytime',
                                    'Privacy-preserving by design'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)' }}>
                                        <CheckCircle size={18} color={accent} />
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
                                    marginTop: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                Start Earning <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* For Enterprises */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px',
                            padding: '40px'
                        }}>
                            <div style={{
                                padding: '6px 14px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#10B981',
                                display: 'inline-block',
                                marginBottom: '24px'
                            }}>
                                For Buyers
                            </div>
                            <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
                                Compliant Intelligence
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    'API access to anonymized data',
                                    'Real behavioral insights',
                                    'GDPR & CCPA compliant',
                                    'User-consented data only',
                                    'Aggregated analytics'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)' }}>
                                        <CheckCircle size={18} color="#10B981" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/buyers"
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    marginTop: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#10B981',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease'
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
                padding: '120px 24px',
                background: `linear-gradient(180deg, rgba(229,185,78,0.05) 0%, transparent 100%)`,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(32px, 5vw, 48px)',
                        fontWeight: 700,
                        marginBottom: '24px',
                        letterSpacing: '-0.02em'
                    }}>
                        Ready to Take Control?
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '40px',
                        lineHeight: 1.7
                    }}>
                        Join thousands of users who are already earning rewards while maintaining complete privacy over their data.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="btn-primary"
                        style={{
                            padding: '20px 48px',
                            borderRadius: '14px',
                            fontSize: '18px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <Sparkles size={20} />
                        Start Earning Points Today
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '48px 24px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.5)'
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
                        <div style={{ fontSize: '24px', fontWeight: 800, color: accent, fontFamily: "'Space Grotesk', sans-serif" }}>
                            MYRAD
                        </div>
                        <nav style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>How It Works</a>
                            <Link to="/buyers" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>For Buyers</Link>
                            <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Privacy Policy</Link>
                            <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Terms of Service</Link>
                        </nav>
                    </div>
                    <div style={{
                        paddingTop: '24px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '13px'
                    }}>
                        © 2024 MYRAD. Privacy-first data union. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
