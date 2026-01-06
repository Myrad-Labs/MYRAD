import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight, Shield, Lock, Zap, Eye, Gift, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DynamicBackground from '../components/DynamicBackground';

const ContributorPage = () => {
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

            overflowX: 'hidden',
            position: 'relative'
        }}>

            <DynamicBackground />


            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .noise-overlay {
                    position: fixed; inset: 0; opacity: 0.02; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    z-index: 2;
                }
                .content-wrapper { position: relative; z-index: 10; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .card { background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(0, 0, 0, 0.08); transition: all 0.4s; backdrop-filter: blur(10px); }
                .card:hover { background: rgba(255, 255, 255, 0.95); border-color: rgba(0, 0, 0, 0.15); transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
                .btn-primary { background: #1a1a1a; border: none; color: #fff; font-weight: 600; cursor: pointer; transition: all 0.3s; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); }
                .btn-secondary { background: transparent; border: 1px solid rgba(0, 0, 0, 0.2); color: #1a1a1a; font-weight: 500; cursor: pointer; transition: all 0.3s; }
                .btn-secondary:hover { background: rgba(0, 0, 0, 0.05); border-color: rgba(0, 0, 0, 0.35); }
                .step-number { position: absolute; top: 24px; right: 24px; font-size: 64px; font-weight: 800; font-family: inherit; color: rgba(0, 0, 0, 0.04); line-height: 1; }
                @media (max-width: 768px) { .characters-container { display: none !important; } }
                html { scroll-behavior: smooth; }
                .characters-container { position: fixed; left: 30px; bottom: 20px; width: 320px; height: 300px; z-index: 100; pointer-events: none; }
                .character { position: absolute; transition: transform 0.4s; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }
                .char-purple { bottom: 70px; left: 85px; z-index: 1; animation: floatChar1 4s ease-in-out infinite; }
                .char-black { bottom: 50px; left: 145px; z-index: 2; animation: floatChar2 3.5s ease-in-out infinite 0.5s; }
                .char-orange { bottom: 0; left: 0; z-index: 3; animation: floatChar3 5s ease-in-out infinite 0.2s; }
                @keyframes floatChar1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                @keyframes floatChar2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes floatChar3 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            `}</style>

            <div className="noise-overlay" />
            <div className="content-wrapper">
                <Header />

                <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 100px', position: 'relative' }}>
                    <div style={{ maxWidth: '800px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        {isVisible && (
                            <div className="animate-fadeInUp delay-100" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)', borderRadius: '100px', fontSize: '13px', fontWeight: 500, color: '#4F46E5', marginBottom: '32px' }}>
                                For Contributors
                            </div>
                        )}
                        {isVisible && (
                            <h1 className="animate-fadeInUp delay-200" style={{ fontSize: '68px', fontWeight: 700, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.04em', color: '#1a1a1a', fontFamily: 'inherit' }}>
                                Earn from your digital activities<br />without exposing your privacy
                            </h1>
                        )}
                        {isVisible && (
                            <p className="animate-fadeInUp delay-300" style={{ fontSize: '18px', color: 'rgba(0, 0, 0, 0.6)', lineHeight: 1.7, maxWidth: '550px', margin: '0 auto 48px', fontWeight: 400 }}>
                                Transform your app activity into rewards with zero knowledge proofs. Your data stays private. Your rewards stay real.
                            </p>
                        )}
                        {isVisible && (
                            <div className="animate-fadeInUp delay-400" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={handleGetStarted} className="btn-primary" onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} style={{ padding: '18px 40px', borderRadius: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Zap size={18} /> Start Earning <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {isVisible && (
                        <div className="characters-container animate-fadeInUp delay-300">
                            {(() => {
                                const containerX = 180;
                                const containerY = window.innerHeight - 150;
                                const distance = Math.sqrt(Math.pow(mousePos.x - containerX, 2) + Math.pow(mousePos.y - containerY, 2));
                                const proximity = Math.max(0, 1 - distance / 400);
                                const isExcited = proximity > 0.5;
                                const deltaX = (mousePos.x - containerX) / window.innerWidth;
                                const deltaY = (mousePos.y - containerY) / window.innerHeight;
                                const excitedScale = 1 + proximity * 0.08;
                                const tiltAngle = deltaX * 8;

                                return (
                                    <>
                                        <svg className="character char-orange" width="150" height="150" viewBox="0 0 150 150" style={{ transform: `rotate(${tiltAngle * 0.5}deg) scale(${isButtonHovered ? 1.2 : excitedScale})` }}>
                                            <circle cx="75" cy="75" r="68" fill="#FF7A00" />
                                            <circle cx={52 + deltaX * 12} cy={65 + deltaY * 8} r={isExcited ? 8 : 7} fill="#000" />
                                            <circle cx={49 + deltaX * 12} cy={62 + deltaY * 8} r="2.5" fill="#fff" />
                                            <circle cx={98 + deltaX * 12} cy={65 + deltaY * 8} r={isExcited ? 8 : 7} fill="#000" />
                                            <circle cx={95 + deltaX * 12} cy={62 + deltaY * 8} r="2.5" fill="#fff" />
                                            <path d={isExcited ? "M55 85 Q75 105 95 85" : "M60 88 Q75 98 90 88"} stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
                                            <circle cx="40" cy="80" r="6" fill="#FF5500" opacity="0.2" />
                                            <circle cx="110" cy="80" r="6" fill="#FF5500" opacity="0.2" />
                                        </svg>
                                        <svg className="character char-purple" width="85" height="170" viewBox="0 0 85 170" style={{ transform: `rotate(${tiltAngle * 0.3}deg) scale(${1 + proximity * 0.05})` }}>
                                            <rect x="0" y="0" width="85" height="165" rx="12" fill="#7B61FF" />
                                            <circle cx="28" cy="50" r="10" fill="#fff" />
                                            <circle cx="57" cy="50" r="10" fill="#fff" />
                                        </svg>
                                        <svg className="character char-black" width="70" height="130" viewBox="0 0 70 130" style={{ transform: `rotate(${-tiltAngle * 0.2}deg) scale(${1 + proximity * 0.04})` }}>
                                            <rect x="0" y="0" width="70" height="125" rx="8" fill="#1a1a1a" />
                                            <circle cx="20" cy="45" r="8" fill="#fff" />
                                            <circle cx="50" cy="45" r="8" fill="#fff" />
                                        </svg>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </section>

                <section id="how-it-works" style={{ padding: '120px 24px', borderTop: '1px solid rgba(0,0,0,0.08)', position: 'relative' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: '44px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: 'inherit' }}>Simple. Secure. Rewarding.</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {steps.map((step, i) => (
                                <div key={i} className="card" style={{ borderRadius: '20px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
                                    <div className="step-number">{step.number}</div>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                        <step.icon size={24} color="#4F46E5" />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>{step.title}</h3>
                                    <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ padding: '140px 24px', borderTop: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: 'inherit' }}>Ready to Own Your Data?</h2>
                        <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '20px 48px', borderRadius: '14px', fontSize: '17px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                            <Sparkles size={18} /> Get Started Free <ArrowRight size={18} />
                        </button>
                    </div>
                </section>
                <Footer />
            </div>
        </div>
    );
};

export default ContributorPage;
