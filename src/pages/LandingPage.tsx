import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
    const navigate = useNavigate();
    const [showIntro, setShowIntro] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ["start start", "end start"]
    });

    const videoScale = useTransform(scrollYProgress, [0, 0.3], [1.1, 1]); // Zoom out effect
    const videoWidth = useTransform(scrollYProgress, [0, 0.3], ["100%", "90%"]); // Shrink width effect
    const videoY = useTransform(scrollYProgress, [0, 0.3], [0, 50]); // Smaller parallax movement

    useEffect(() => {
        // Intro animation timer
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 800); // 0.8 seconds for the intro text
        return () => clearTimeout(timer);
    }, []);

    const handleContributorClick = () => {
        navigate('/contribute');
    };

    return (
        <div ref={scrollRef} style={{
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
                
                /* World.org Grid Responsive */
                @media (max-width: 768px) {
                    .world-grid {
                        grid-template-columns: 1fr !important;
                    }
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

                .bg-grid {
                    background-size: 60px 60px;
                    background-image:
                        linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px);
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    background-position: center top;
                    mask-image: linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%);
                    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%);
                }

                /* Hero Content Shift */
                .hero-content-shift {
                    padding-top: 2vw;
                    padding-left: 60px;
                }

                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .hero-content-shift {
                        padding-left: 0 !important;
                        padding-top: 0 !important;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    .hero-huge-text {
                        font-size: 24vw !important; /* Huge on mobile too, but stacked */
                        margin-bottom: 20px !important;
                    }
                    .hero-buttons {
                        flex-direction: column;
                        width: 100%;
                    }
                    .hero-buttons button {
                        width: 100%;
                        justify-content: center;
                    }
                    .hero-divider {
                        display: none;
                    }
                }

            `}</style>


            {/* Intro Overlay */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        key="intro-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: '#fff',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <motion.h1
                            layoutId="hero-text-main"
                            style={{
                                fontSize: '12vw',
                                fontWeight: 900,
                                color: '#000',
                                letterSpacing: '-0.04em',
                                margin: 0,
                                lineHeight: 1
                            }}
                        >
                            Myrad
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="content-wrapper">
                <Header />

                {/* Hero Section - Flim Style */}
                <section style={{ minHeight: '80vh', padding: '140px 24px 60px', position: 'relative', overflow: 'hidden' }}>

                    {/* Grid Background - inside hero only */}
                    <div className="bg-grid"></div>


                    <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr auto 1fr', gap: '60px', alignItems: 'start' }}>
                            {/* Left: Huge Brand Text */}
                            <div className="animate-fadeInUp delay-100" style={{ paddingLeft: '40px' }}>
                                <motion.div
                                    layoutId="hero-text-main"
                                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <img
                                        src="/myrad-removebg-preview.png"
                                        alt="Myrad Logo"
                                        style={{
                                            width: '100%',
                                            maxWidth: '600px',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </motion.div>
                            </div>

                            {/* Divider Line */}
                            <div className="hero-divider" style={{
                                width: '1px',
                                height: '280px',
                                background: '#e5e7eb',
                                marginTop: '20px'
                            }}></div>

                            {/* Right: Content */}
                            {/* Only show content after intro is done or fading out to avoid layout shifts? 
                                Actually, fading it in is cleaner. 
                            */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="hero-content-shift"
                            >
                                <h2 style={{
                                    fontSize: '40px',
                                    fontWeight: 500,
                                    lineHeight: 1.1,
                                    marginBottom: '16px',
                                    color: '#111827',
                                    letterSpacing: '-0.03em',
                                    maxWidth: '500px'
                                }}>
                                    Largest Source of<br />
                                    <span style={{ color: '#000000', fontWeight: 700 }}>Verifiable Human Data</span>
                                </h2>

                                <p style={{
                                    fontSize: '20px',
                                    color: '#4b5563',
                                    lineHeight: 1.6,
                                    marginBottom: '28px',
                                    maxWidth: '480px'
                                }}>
                                    Cryptographically verified human data, without collecting personal information
                                </p>

                                <div className="hero-buttons" style={{ display: 'flex', gap: '16px' }}>
                                    <button
                                        onClick={handleContributorClick}
                                        className="btn-primary"
                                        style={{
                                            padding: '16px 32px',
                                            borderRadius: '100px',
                                            fontSize: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: '#1f2937',
                                            border: '1px solid #1f2937'
                                        }}
                                    >
                                        Become a contributor
                                    </button>
                                    <button
                                        onClick={() => window.open('https://calendly.com/carghya10/30min', '_blank')}
                                        className="btn-secondary"
                                        style={{ padding: '16px 32px', borderRadius: '100px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        Talk to us
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative Horizontal Lines */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            marginTop: '40px'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Scroll to explore</div>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                        </div>

                    </div>

                    {/* Hero Video Section - Bottom Layer */}
                    <div style={{
                        marginTop: '10px',
                        position: 'relative',
                        width: '100%',
                        zIndex: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '100px' // Add space for scroll
                    }}>
                        <motion.div style={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            background: '#000', // Fallback color
                            maxWidth: '1400px',
                            width: videoWidth, // Animate width
                            scale: videoScale, // Animate scale
                            y: videoY,         // Parallax effect
                        }}>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    borderRadius: '24px' // Ensure video itself is rounded
                                }}
                            >
                                <source src="/myrad.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </motion.div>
                    </div>
                </section>

                {/* Value Props - World.org Style Minimalist */}
                <section style={{ padding: '160px 24px', background: '#ffffff' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                        {/* Section 1: Huge Typography Statement */}
                        <div style={{ marginBottom: '160px' }}>
                            <div className="world-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 3fr', gap: '40px' }}>
                                <div style={{
                                    fontSize: '14px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: '#9ca3af',
                                    fontWeight: 500,
                                    paddingTop: '12px',
                                    borderTop: '1px solid #e5e7eb'
                                }}>
                                    Our Mission
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: 'clamp(36px, 5vw, 72px)',
                                        fontWeight: 500,
                                        letterSpacing: '-0.04em',
                                        color: '#111827',
                                        lineHeight: 1.08,
                                        margin: 0
                                    }}>
                                        Verifiable human data,<br />
                                        privacy and trust<br />
                                        for every human.
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: What it means */}
                        <div style={{ marginBottom: '160px' }}>
                            <div className="world-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 3fr', gap: '40px' }}>
                                <div style={{
                                    fontSize: '14px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: '#9ca3af',
                                    fontWeight: 500,
                                    paddingTop: '12px',
                                    borderTop: '1px solid #e5e7eb'
                                }}>
                                    What it means for you
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: 'clamp(32px, 4vw, 56px)',
                                        fontWeight: 500,
                                        letterSpacing: '-0.03em',
                                        color: '#374151',
                                        lineHeight: 1.15,
                                        margin: 0,
                                        maxWidth: '800px'
                                    }}>
                                        A new standard for<br />
                                        human data online.
                                    </h2>
                                    <p style={{
                                        fontSize: '18px',
                                        color: '#6b7280',
                                        lineHeight: 1.7,
                                        marginTop: '32px',
                                        maxWidth: '600px'
                                    }}>
                                        Myrad verifies behavior directly from user-approved sources using cryptographic proofs - no scraping, no estimation, just truth.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Clean Cards Grid */}
                        <div className="world-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 3fr', gap: '40px' }}>
                            <div style={{
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: '#9ca3af',
                                fontWeight: 500,
                                paddingTop: '12px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                Capabilities
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#e5e7eb' }}>
                                {[
                                    {
                                        title: "Cryptographic Proofs",
                                        desc: "Every data point is backed by a cryptographic proof generated locally on the user's device."
                                    },
                                    {
                                        title: "Zero-Knowledge Privacy",
                                        desc: "We validate specific behaviors without ever seeing or storing the raw underlying data."
                                    },
                                    {
                                        title: "High-Signal Datasets",
                                        desc: "Clean, verified signals ready for training advanced AI models and powering deep analytics."
                                    },
                                    {
                                        title: "User-Owned Data",
                                        desc: "Users maintain full control and ownership of their behavioral data at all times."
                                    }
                                ].map((card, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '48px 40px',
                                            background: '#fff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            minHeight: '300px'
                                        }}
                                    >
                                        <h3 style={{
                                            fontSize: '28px',
                                            fontWeight: 500,
                                            marginBottom: '16px',
                                            color: '#111827',
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1.2
                                        }}>
                                            {card.title}
                                        </h3>
                                        <p style={{
                                            color: '#6b7280',
                                            lineHeight: 1.6,
                                            fontSize: '16px',
                                            margin: 0
                                        }}>
                                            {card.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* Who uses MYRAD */}
                <section className="section-padding" style={{ padding: '140px 24px', background: '#fff' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                            <div>
                                <h2 className="who-title" style={{ fontSize: '48px', fontWeight: 600, marginBottom: '24px', color: '#374151', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    Who builds <br /> with Myrad
                                </h2>
                                <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1.7, maxWidth: '440px' }}>
                                    Built for teams creating the next generation of AI, analytics, and consumer insights.                                </p>
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
            </div >
        </div >
    );
};

export default LandingPage;
