import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight, Shield, Lock, Eye, Gift } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContributorPage = () => {
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const [isVisible, setIsVisible] = useState(false);

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
            icon: Lock,
            title: 'Secure Authentication',
            description: 'Sign in instantly with Privy Auth. No complex wallet setup required.'
        },
        {
            icon: Eye,
            title: 'Privacy Preserved',
            description: 'Your raw data never leaves your device. Only cryptographic proofs are shared.'
        },
        {
            icon: Shield,
            title: 'Zero-Knowledge Proofs',
            description: 'Verify your activity without revealing personal information.'
        },
        {
            icon: Gift,
            title: 'Instant Rewards',
            description: 'Earn points for every verified contribution to the data ecosystem.'
        }
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
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .btn-primary { background: #374151; border: 1px solid #374151; color: #fff; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover { background: #1f2937; transform: translateY(-1px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); }
                .feature-card { 
                    background: #ffffff; 
                    border: 1px solid #f3f4f6; 
                    border-top: 4px solid transparent;
                    border-radius: 16px; 
                    padding: 32px; 
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
                    position: relative;
                }
                .feature-card:hover { 
                    transform: translateY(-4px); 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08); 
                    border-color: #e5e7eb;
                    border-top-color: #111827;
                }
            `}</style>


            {/* Removed Waves Background based on user feedback */}

            <div className="content-wrapper">
                <Header />

                {/* Hero Section */}
                <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative' }}>
                    <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 0.8fr)', gap: '60px', alignItems: 'center' }}>

                        {/* Left: Text Content */}
                        <div style={{ textAlign: 'left', position: 'relative', zIndex: 1 }}>
                            {isVisible && (
                                <div className="animate-fadeInUp delay-100" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(55, 65, 81, 0.08)', border: '1px solid rgba(55, 65, 81, 0.15)', borderRadius: '100px', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '32px' }}>
                                    For Contributors
                                </div>
                            )}
                            {isVisible && (
                                <h1 className="animate-fadeInUp delay-200" style={{ fontSize: '66px', fontWeight: 600, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.03em', color: '#111827' }}>
                                    Earn from your <br />
                                    digital activities.
                                </h1>
                            )}
                            {isVisible && (
                                <p className="animate-fadeInUp delay-300" style={{ fontSize: '19px', color: '#4b5563', lineHeight: 1.6, maxWidth: '540px', marginBottom: '40px', fontWeight: 400 }}>
                                    Your data creates value every day. Capture that value with zero knowledge proofs—keeping your privacy 100% intact.
                                </p>
                            )}
                            {isVisible && (
                                <div className="animate-fadeInUp delay-400" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '16px 36px', borderRadius: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        Start Earning <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Abstract Visual */}
                        <div style={{ position: 'relative', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Decorative Circles */}
                            <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.8, top: '10%', right: '10%' }} />

                            {/* Glass Card */}
                            <div className="animate-fadeInUp delay-200" style={{
                                position: 'relative',
                                width: '360px',
                                padding: '40px',
                                background: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '24px',
                                transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                                zIndex: 2
                            }}>
                                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Lock size={20} color="#fff" />
                                    </div>
                                    <div style={{ padding: '4px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                                        Verified
                                    </div>
                                </div>
                                <div style={{ height: '8px', width: '60%', background: '#e5e7eb', borderRadius: '4px', marginBottom: '12px' }} />
                                <div style={{ height: '8px', width: '80%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '32px' }} />

                                <div style={{ padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Earnings</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>$1,240.50</div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="animate-fadeInUp delay-300" style={{
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

                {/* Features Section */}
                <section style={{ padding: '100px 24px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '12px', letterSpacing: '-0.02em', color: '#111827' }}>How It Works</h2>
                            <p style={{ color: '#6b7280', fontSize: '16px' }}>Privacy-first data contribution in four simple steps</p>
                        </div>


                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {features.map((feature, i) => (
                                <div key={i} className="feature-card">
                                    <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>{feature.title}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7 }}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section style={{ padding: '100px 24px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.02em', color: '#111827' }}>Ready to Own Your Data?</h2>
                        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '32px' }}>Join thousands of users earning from their digital footprint.</p>
                        <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '16px 40px', borderRadius: '12px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            Get Started Free <ArrowRight size={16} />
                        </button>
                    </div>
                </section>
                <Footer />
            </div>
        </div>
    );
};

export default ContributorPage;
