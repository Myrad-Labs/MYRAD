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

    // Search bar animation
    const [searchPlaceholderIndex, setSearchPlaceholderIndex] = useState(0);
    const searchPlaceholders = [
        "Most ordered items in South Delhi?",
        "When are most cabs taken in Whitefield?",
        "People working out in Kolkata mornings?",
        "EP1 drop off rate on thriller movies?",

    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setSearchPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
        }, 3000);
        return () => clearInterval(interval);
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
                        gap: 24px !important;
                    }
                    .hero-huge-text {
                        font-size: 24vw !important;
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

                    /* Hero section padding */
                    .hero-section {
                        padding: 100px 16px 40px !important;
                        min-height: auto !important;
                    }
                    .hero-logo-container {
                        padding-left: 0 !important;
                    }

                    /* Hero content text */
                    .hero-content-shift h2 {
                        font-size: 28px !important;
                        max-width: 100% !important;
                    }
                    .hero-content-shift p {
                        font-size: 16px !important;
                        max-width: 100% !important;
                    }

                    /* Value props section */
                    .value-props-section {
                        padding: 80px 16px !important;
                    }
                    .value-props-section .section-gap {
                        margin-bottom: 80px !important;
                    }

                    /* World grid - stack sidebar label above content */
                    .world-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }

                    /* Capabilities cards grid - stack to 1 column */
                    .capabilities-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .capability-card {
                        min-height: 200px !important;
                        padding: 32px 24px !important;
                    }
                    .capability-card h3 {
                        font-size: 22px !important;
                    }

                    /* "Who uses Myrad" section */
                    .who-section {
                        padding: 80px 16px !important;
                    }
                    .who-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    .who-title {
                        font-size: 32px !important;
                    }

                    /* Use case rows - stack vertically */
                    .usecase-row {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 8px !important;
                        padding: 16px !important;
                    }
                    .usecase-title {
                        min-width: unset !important;
                        font-size: 16px !important;
                    }
                    .usecase-desc {
                        font-size: 14px !important;
                    }

                    /* Video section */
                    .hero-video-container {
                        margin-bottom: 40px !important;
                    }
                    .hero-video-wrapper {
                        border-radius: 16px !important;
                    }
                    .hero-video-wrapper video {
                        border-radius: 16px !important;
                    }

                    /* Animated Search Bar */
                    .animated-search-bar {
                        margin-left: 0 !important;
                        margin-top: 16px !important;
                        max-width: 85% !important;
                    }
                }
                @media (max-width: 480px) {
                    .hero-section {
                        padding: 80px 12px 30px !important;
                    }
                    .hero-huge-text {
                        font-size: 28vw !important;
                    }
                    .hero-content-shift h2 {
                        font-size: 24px !important;
                    }
                    .hero-content-shift p {
                        font-size: 15px !important;
                    }
                    .value-props-section {
                        padding: 60px 12px !important;
                    }
                    .value-props-section .section-gap {
                        margin-bottom: 60px !important;
                    }
                    .capability-card {
                        min-height: 160px !important;
                        padding: 24px 20px !important;
                    }
                    .capability-card h3 {
                        font-size: 20px !important;
                    }
                    .who-section {
                        padding: 60px 12px !important;
                    }
                    .who-title {
                        font-size: 28px !important;
                    }
                    .animated-search-bar {
                        max-width: 100% !important;
                    }
                    .animated-search-bar .search-inner {
                        padding: 10px 16px !important;
                        font-size: 13px !important;
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
                        <motion.img
                            layoutId="hero-text-main"
                            src="myrad-removebg-preview.png"
                            alt="MYRAD"
                            style={{
                                width: '30vw',
                                objectFit: 'contain',
                                filter: 'brightness(0)'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="content-wrapper">
                <Header />

                {/* Hero Section - Flim Style */}
                <section className="hero-section" style={{ minHeight: '80vh', padding: '140px 24px 60px', position: 'relative', overflow: 'hidden' }}>

                    {/* Grid Background - inside hero only */}
                    <div className="bg-grid"></div>


                    <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr auto 1fr', gap: '60px', alignItems: 'start' }}>
                            {/* Left: Huge Brand Text */}
                            <div className="animate-fadeInUp delay-100 hero-logo-container" style={{ paddingLeft: '40px' }}>
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

                                {/* Animated Search Bar */}
                                <motion.div
                                    className="animated-search-bar"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    style={{
                                        marginTop: '-30px',
                                        maxWidth: '360px',
                                        marginLeft: '180px'
                                    }}
                                >
                                    <div className="search-inner" style={{
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        borderRadius: '100px',
                                        padding: '12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
                                        cursor: 'default',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Search Icon */}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>

                                        {/* Cycling Text */}
                                        <div style={{ position: 'relative', height: '22px', flex: 1, overflow: 'hidden' }}>
                                            <AnimatePresence mode="popLayout">
                                                <motion.span
                                                    key={searchPlaceholderIndex}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{
                                                        y: { type: "spring", stiffness: 100, damping: 20 },
                                                        opacity: { duration: 0.2 }
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: -1,
                                                        fontSize: '15px',
                                                        color: '#4b5563',
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {searchPlaceholders[searchPlaceholderIndex]}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    </div>
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

                                    Compliant alternative to scraping, tracking, and surveys, without collecting personal information                                </p>

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
                    <div className="hero-video-container" style={{
                        marginTop: '10px',
                        position: 'relative',
                        width: '100%',
                        zIndex: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '100px' // Add space for scroll
                    }}>
                        <motion.div className="hero-video-wrapper" style={{
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
                <section className="value-props-section" style={{ padding: '160px 24px', background: '#ffffff' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                        {/* Section 1: Huge Typography Statement */}
                        <div className="section-gap" style={{ marginBottom: '160px' }}>
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
                                        A new standard for<br />
                                        trustworthy, verified<br />
                                        human data
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: What it means */}
                        <div className="section-gap" style={{ marginBottom: '160px' }}>
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
                                        Replacing scraped,<br />
                                        biased data with<br />
                                        verified insights
                                    </h2>
                                    <p style={{
                                        fontSize: '18px',
                                        color: '#6b7280',
                                        lineHeight: 1.7,
                                        marginTop: '32px',
                                        maxWidth: '600px'
                                    }}>
                                        Myrad verifies human behavior from user-approved sources using cryptographic proofs,
                                        helping you understand and target your<br></br> audience better.                                    </p>
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

                            <div className="capabilities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#e5e7eb' }}>
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
                                        title: "Understand Your Users",
                                        desc: "Make faster, smarter decisions to grow sales and acquire customers"
                                    }
                                ].map((card, i) => (
                                    <motion.div
                                        className="capability-card"
                                        key={i}
                                        whileHover={{
                                            y: -8,
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                            zIndex: 10
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        style={{
                                            padding: '48px 40px',
                                            background: '#fff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            minHeight: '300px',
                                            position: 'relative' // needed for z-index
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
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* Who uses MYRAD */}
                <section className="section-padding who-section" style={{ padding: '140px 24px', background: '#fff' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div className="who-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                            <div>
                                <h2 className="who-title" style={{ fontSize: '48px', fontWeight: 600, marginBottom: '12px', color: '#374151', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    Who uses Myrad
                                </h2>
                                <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1.7, maxWidth: '440px' }}>
                                    Built for teams creating the next generation of<br></br> AI and B2C businesses                                </p>
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {[
                                    { title: "AI & Data Teams", desc: "For training models and grounding systems in real human behavior" },
                                    { title: "Product & Growth Teams", desc: "For understanding usage patterns and improving retention" },
                                    { title: "Consumer & B2C Businesses", desc: "For identifying demand, preferences, and customer segments" },
                                    { title: "Strategy & Market Teams", desc: "For real-world insights to guide expansion and positioning" }
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
