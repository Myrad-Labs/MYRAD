import { useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight, Shield, Lock, Sparkles, CheckCircle, Zap, Eye, Gift } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DynamicBackground from '../components/DynamicBackground';

const LandingPage = () => {
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const [isVisible, setIsVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        setTimeout(() => setIsVisible(true), 100);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
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
        <div style={{
            minHeight: '100vh',
            color: '#1a1a1a',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflowX: 'hidden',
            position: 'relative'
        }}>
            {/* Three.js Particle Background */}
            <DynamicBackground />

            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                /* Subtle noise texture overlay */
                .noise-overlay {
                    position: fixed;
                    inset: 0;
                    opacity: 0.02;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    z-index: 2;
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
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(10px);
                }
                
                .card:hover {
                    background: rgba(255, 255, 255, 0.95);
                    border-color: rgba(0, 0, 0, 0.15);
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }
                
                /* Primary button */
                .btn-primary {
                    background: #1a1a1a;
                    border: none;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }
                
                /* Secondary button */
                .btn-secondary {
                    background: transparent;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                    color: #1a1a1a;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-secondary:hover {
                    background: rgba(0, 0, 0, 0.05);
                    border-color: rgba(0, 0, 0, 0.35);
                }
                
                /* Step number */
                .step-number {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    font-size: 64px;
                    font-weight: 800;
                    font-family: 'Space Grotesk', sans-serif;
                    color: rgba(0, 0, 0, 0.04);
                    line-height: 1;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .hero-title { font-size: 40px !important; }
                    .hero-subtitle { font-size: 16px !important; }
                    .characters-container { display: none !important; }
                }
                
                html { scroll-behavior: smooth; }

                /* Cute Characters Animations */
                .characters-container {
                    position: fixed;
                    left: 30px;
                    bottom: 20px;
                    width: 320px;
                    height: 300px;
                    z-index: 100;
                    pointer-events: none;
                }

                .character {
                    position: absolute;
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
                }

                .char-purple {
                    bottom: 70px;
                    left: 85px;
                    z-index: 1;
                    animation: floatChar1 4s ease-in-out infinite;
                }

                .char-black {
                    bottom: 50px;
                    left: 145px;
                    z-index: 2;
                    animation: floatChar2 3.5s ease-in-out infinite 0.5s;
                }

                .char-orange {
                    bottom: 0;
                    left: 0;
                    z-index: 3;
                    animation: floatChar3 5s ease-in-out infinite 0.2s;
                }

                @keyframes floatChar1 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes floatChar2 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }

                @keyframes floatChar3 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            {/* Subtle noise texture */}
            <div className="noise-overlay" />

            {/* Main Content */}
            <div className="content-wrapper">
                <Header />

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
                        {isVisible && (
                            <div className="animate-fadeInUp delay-100" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'rgba(79, 70, 229, 0.08)',
                                border: '1px solid rgba(79, 70, 229, 0.15)',
                                borderRadius: '100px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#4F46E5',
                                marginBottom: '32px'
                            }}>
                                <Sparkles size={14} />
                                Privacy First Data Network
                            </div>
                        )}

                        {isVisible && (
                            <h1 className="animate-fadeInUp delay-200 hero-title" style={{
                                fontSize: '68px',
                                fontWeight: 700,
                                lineHeight: 1.05,
                                marginBottom: '24px',
                                letterSpacing: '-0.04em',
                                color: '#1a1a1a'
                            }}>
                                Your Data
                                <br />
                                Your Rewards
                            </h1>
                        )}

                        {isVisible && (
                            <p className="animate-fadeInUp delay-300 hero-subtitle" style={{
                                fontSize: '18px',
                                color: 'rgba(0, 0, 0, 0.6)',
                                lineHeight: 1.7,
                                maxWidth: '550px',
                                margin: '0 auto 48px',
                                fontWeight: 400
                            }}>
                                Transform your app activity into rewards with zero knowledge proofs.
                                Your data stays private. Your rewards stay real.
                            </p>
                        )}

                        {isVisible && (
                            <div className="animate-fadeInUp delay-400" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleGetStarted}
                                    className="btn-primary"
                                    onMouseEnter={() => setIsButtonHovered(true)}
                                    onMouseLeave={() => setIsButtonHovered(false)}
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
Learn More                                </a>
                            </div>
                        )}

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
                                        color: 'rgba(0,0,0,0.5)',
                                        fontSize: '13px',
                                        fontWeight: 500
                                    }}>
                                        <item.icon size={16} color="rgba(0,0,0,0.4)" />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cute Animated Characters */}
                    {isVisible && (
                        <div className="characters-container animate-fadeInUp delay-300">
                            {(() => {
                                const containerX = 180;
                                const containerY = window.innerHeight - 150;
                                const distance = Math.sqrt(
                                    Math.pow(mousePos.x - containerX, 2) +
                                    Math.pow(mousePos.y - containerY, 2)
                                );
                                const proximity = Math.max(0, 1 - distance / 400);
                                const isExcited = proximity > 0.5;
                                const deltaX = (mousePos.x - containerX) / window.innerWidth;
                                const deltaY = (mousePos.y - containerY) / window.innerHeight;
                                const eyeOffsetX = Math.max(-4, Math.min(4, deltaX * 12));
                                const eyeOffsetY = Math.max(-3, Math.min(3, deltaY * 8));
                                const tiltAngle = deltaX * 8;
                                const excitedScale = 1 + proximity * 0.08;

                                return (
                                    <>
                                        <svg
                                            className="character char-orange"
                                            width="150"
                                            height="150"
                                            viewBox="0 0 150 150"
                                            style={{
                                                transform: `rotate(${tiltAngle * 0.5}deg) scale(${isButtonHovered ? 1.2 : excitedScale})`,
                                                transition: 'transform 0.15s ease-out'
                                            }}
                                        >
                                            <circle cx="75" cy="75" r="68" fill="#FF7A00" />
                                            {/* Eyes */}
                                            <circle cx={52 + eyeOffsetX} cy={65 + eyeOffsetY} r={isExcited ? 8 : 7} fill="#000" />
                                            <circle cx={49 + eyeOffsetX} cy={62 + eyeOffsetY} r="2.5" fill="#fff" />
                                            <circle cx={98 + eyeOffsetX} cy={65 + eyeOffsetY} r={isExcited ? 8 : 7} fill="#000" />
                                            <circle cx={95 + eyeOffsetX} cy={62 + eyeOffsetY} r="2.5" fill="#fff" />
                                            {/* Mouth */}
                                            <path
                                                d={isExcited ? "M55 85 Q75 105 95 85" : "M60 88 Q75 98 90 88"}
                                                stroke="#000"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeLinecap="round"
                                            />
                                            {/* Blush */}
                                            <circle cx="40" cy="80" r="6" fill="#FF5500" opacity="0.2" />
                                            <circle cx="110" cy="80" r="6" fill="#FF5500" opacity="0.2" />
                                        </svg>

                                        <svg
                                            className="character char-purple"
                                            width="85"
                                            height="170"
                                            viewBox="0 0 85 170"
                                            style={{
                                                transform: `rotate(${tiltAngle * 0.3}deg) scale(${1 + proximity * 0.05})`,
                                                transition: 'transform 0.18s ease-out'
                                            }}
                                        >
                                            <rect x="0" y="0" width="85" height="165" rx="12" fill="#7B61FF" />
                                            <circle cx="28" cy="50" r="10" fill="#fff" />
                                            <circle cx={28 + eyeOffsetX * 0.6} cy={50 + eyeOffsetY * 0.6} r="4" fill="#000" />
                                            <circle cx="57" cy="50" r="10" fill="#fff" />
                                            <circle cx={57 + eyeOffsetX * 0.6} cy={50 + eyeOffsetY * 0.6} r="4" fill="#000" />
                                            <rect x="40" y="65" width="5" height="15" rx="2.5" fill="#000" opacity="0.8" />
                                        </svg>

                                        <svg
                                            className="character char-black"
                                            width="70"
                                            height="130"
                                            viewBox="0 0 70 130"
                                            style={{
                                                transform: `rotate(${-tiltAngle * 0.2}deg) scale(${1 + proximity * 0.04})`,
                                                transition: 'transform 0.2s ease-out'
                                            }}
                                        >
                                            <rect x="0" y="0" width="70" height="125" rx="8" fill="#1a1a1a" />
                                            <circle cx="20" cy="45" r="8" fill="#fff" />
                                            <circle cx={22 + eyeOffsetX * 0.5} cy={45 + eyeOffsetY * 0.5} r="3.5" fill="#000" />
                                            <circle cx="50" cy="45" r="8" fill="#fff" />
                                            <circle cx={52 + eyeOffsetX * 0.5} cy={45 + eyeOffsetY * 0.5} r="3.5" fill="#000" />
                                        </svg>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </section>

                {/* Feature Showcase 1: Privacy-First Verification */}
                <section style={{
                    padding: '120px 24px',
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '80px',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: 500,
                                color: 'rgba(0,0,0,0.4)',
                                marginBottom: '16px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Zero-Knowledge Proofs
                            </p>
                            <h2 style={{
                                fontSize: '42px',
                                fontWeight: 600,
                                lineHeight: 1.15,
                                marginBottom: '24px',
                                letterSpacing: '-0.02em',
                                color: '#1a1a1a'
                            }}>
                                Verify Without Revealing
                            </h2>
                            <p style={{
                                fontSize: '17px',
                                color: 'rgba(0,0,0,0.5)',
                                lineHeight: 1.7,
                                marginBottom: '40px',
                                maxWidth: '440px'
                            }}>
                                Prove your activity is real without exposing raw data.
                                Our cryptographic proofs verify authenticity while keeping
                                your personal information completely private.
                            </p>
                            <button
                                onClick={handleGetStarted}
                                style={{
                                    padding: '14px 28px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    background: 'transparent',
                                    color: '#1a1a1a',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
                                }}
                            >
                                Explore Privacy
                            </button>
                        </div>

                        {/* Dark Product Preview Box */}
                        <div style={{
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            padding: '32px',
                            minHeight: '400px',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={16} /> Verification Flow
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['Connect your Zomato account', 'Generate zero-knowledge proof', 'Verify order history privately', 'Receive instant rewards'].map((step, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                        padding: '16px 20px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'rgba(79, 70, 229, 0.2)',
                                            color: '#a5b4fc',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600
                                        }}>
                                            {i + 1}
                                        </span>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Showcase 2: Dashboard Experience */}
                <section style={{
                    padding: '120px 24px',
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '80px',
                        alignItems: 'center'
                    }}>
                        {/* Dark Product Preview Box - Left this time */}
                        <div style={{
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            padding: '32px',
                            minHeight: '400px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            order: window.innerWidth < 768 ? 2 : 1
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={16} /> Your Dashboard
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>Total Points</div>
                                    <div style={{ color: '#fff', fontSize: '32px', fontWeight: 700 }}>2,450</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        padding: '16px',
                                        border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>Contributions</div>
                                        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>12</div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        padding: '16px',
                                        border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>Data Sources</div>
                                        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>3</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ order: window.innerWidth < 768 ? 1 : 2 }}>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: 500,
                                color: 'rgba(0,0,0,0.4)',
                                marginBottom: '16px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                User Dashboard
                            </p>
                            <h2 style={{
                                fontSize: '42px',
                                fontWeight: 600,
                                lineHeight: 1.15,
                                marginBottom: '24px',
                                letterSpacing: '-0.02em',
                                color: '#1a1a1a'
                            }}>
                                Track Your Earnings
                            </h2>
                            <p style={{
                                fontSize: '17px',
                                color: 'rgba(0,0,0,0.5)',
                                lineHeight: 1.7,
                                marginBottom: '40px',
                                maxWidth: '440px'
                            }}>
                                Monitor your contributions, track reward points, and manage
                                your data sources from one central dashboard. Full transparency,
                                full control.
                            </p>
                            <button
                                onClick={handleGetStarted}
                                style={{
                                    padding: '14px 28px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    background: 'transparent',
                                    color: '#1a1a1a',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
                                }}
                            >
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" style={{
                    padding: '120px 24px',
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    position: 'relative'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <p style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#4F46E5',
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
                                color: '#1a1a1a'
                            }}>
                                Simple. Secure. Rewarding.
                            </h2>
                            <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
                                Your data never leaves your device. Only cryptographic proofs are shared.
                            </p>
                        </div>

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
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '14px',
                                        background: 'rgba(79, 70, 229, 0.08)',
                                        border: '1px solid rgba(79, 70, 229, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '24px'
                                    }}>
                                        <step.icon size={24} color="#4F46E5" />
                                    </div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        marginBottom: '12px',
                                        color: '#1a1a1a'
                                    }}>
                                        {step.title}
                                    </h3>
                                    <p style={{
                                        color: 'rgba(0,0,0,0.5)',
                                        fontSize: '14px',
                                        lineHeight: 1.7,
                                        marginBottom: '20px'
                                    }}>
                                        {step.description}
                                    </p>
                                    <div style={{
                                        display: 'inline-flex',
                                        padding: '6px 12px',
                                        background: 'rgba(79, 70, 229, 0.08)',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: '#4F46E5'
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
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    position: 'relative'
                }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                            gap: '24px'
                        }}>
                            <div className="card" style={{ borderRadius: '24px', padding: '40px' }}>
                                <div style={{
                                    padding: '6px 14px',
                                    background: 'rgba(79, 70, 229, 0.08)',
                                    borderRadius: '100px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#4F46E5',
                                    display: 'inline-block',
                                    marginBottom: '24px'
                                }}>
                                    For Users
                                </div>
                                <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2, color: '#1a1a1a' }}>
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
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(0,0,0,0.6)', fontSize: '14px' }}>
                                            <CheckCircle size={16} color="#4F46E5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => navigate('/dashboard')}
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

                            <div className="card" style={{ borderRadius: '24px', padding: '40px' }}>
                                <div style={{
                                    padding: '6px 14px',
                                    background: 'rgba(79, 70, 229, 0.08)',
                                    borderRadius: '100px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#4F46E5',
                                    display: 'inline-block',
                                    marginBottom: '24px'
                                }}>
                                    For Buyers
                                </div>
                                <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2, color: '#1a1a1a' }}>
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
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(0,0,0,0.6)', fontSize: '14px' }}>
                                            <CheckCircle size={16} color="#4F46E5" />
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
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{
                            fontSize: '48px',
                            fontWeight: 700,
                            marginBottom: '20px',
                            letterSpacing: '-0.03em',
                            color: '#1a1a1a'
                        }}>
                            Ready to Own Your Data?
                        </h2>
                        <p style={{
                            fontSize: '17px',
                            color: 'rgba(0,0,0,0.5)',
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

                <Footer />

            </div>
        </div>
    );
};

export default LandingPage;