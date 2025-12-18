import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Lock, Database, CheckCircle, BarChart3} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BuyerPage = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'Privacy-First Data',
            description: 'All data is anonymized on-device using zero-knowledge proofs. No PII ever touches our servers.'
        },
        {
            icon: CheckCircle,
            title: 'User-Consented',
            description: '100% opt-in data contributions. Users actively choose to share insights for rewards.'
        },
        {
            icon: BarChart3,
            title: 'Behavioral Insights',
            description: 'Access pre-labeled traits and cohorts like "Daily Delivery Users" or "High Spend Eaters".'
        },
        {
            icon: Lock,
            title: 'GDPR & CCPA Compliant',
            description: 'Built for compliance from day one. Cookie-proof by design.'
        }
    ];

    const useCases = [
        'AI Model Training',
        'Audience Segmentation',
        'Market Research',
        'Consumer Behavior Analysis',
        'Trend Prediction',
        'Personalization Engines'
    ];

    return (
        <div style={{
            background: '#fff',
            minHeight: '100vh',
            color: '#1a1a1a',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { font-family: 'Inter', -apple-system, sans-serif; }
                h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }

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

                .btn-primary {
                    background: #1a1a1a;
                    border: none;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
                }

                .nav-link {
                    color: rgba(0,0,0,0.5);
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.2s;
                }

                .nav-link:hover { color: #1a1a1a; }
            `}</style>

            <Header />
<div className={`content-wrapper ${isVisible ? 'animate-fadeInUp' : ''}`}>
    {/* ALL sections go here */}


            {/* Hero */}
            {isVisible && (
                <section className="animate-fadeInUp delay-100" style={{
                    padding: '140px 24px 100px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{
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
                            <Database size={14} />
                            Enterprise Data Solutions
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(40px, 6vw, 60px)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            marginBottom: '24px'
                        }}>
                            The Future of Behavioral Intelligence is Compliant.
                        </h1>

                        <p style={{
                            fontSize: '18px',
                            color: 'rgba(0,0,0,0.5)',
                            marginBottom: '48px'
                        }}>
                            Access high-quality, anonymous, and user-consented data for your AI models and audience segmentation.
                        </p>

                        <Link to="/contact" className="btn-primary" style={{
                            padding: '18px 40px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none'
                        }}>
                            Inquire About Data Access <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            )}

            {/* What We Provide */}
            {isVisible && (
                <section className="animate-fadeInUp delay-200" style={{
                    padding: '100px 24px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div className="card" style={{
                            borderRadius: '24px',
                            padding: '48px',
                            textAlign: 'center'
                        }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>
                                What We Provide
                            </h2>
                            <p style={{ color: 'rgba(0,0,0,0.5)', lineHeight: 1.8, fontSize: '16px' }}>
                                We provide essential, pre-labeled behavioral traits and cohorts (e.g. <strong>Daily Delivery Users</strong> or <strong>High Spend Eaters</strong>)
                                that traditional data brokers cannot. Our data is 100% compliant, sourced directly from users via zero-knowledge proofs.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            {isVisible && (
                <section className="animate-fadeInUp delay-300" style={{ padding: '100px 24px' }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px'
                    }}>
                        {features.map((feature, i) => (
                            <div key={i} className="card" style={{ borderRadius: '20px', padding: '36px' }}>
                                <feature.icon size={28} color="#4F46E5" style={{ marginBottom: '20px' }} />
                                <h3 style={{ marginBottom: '12px' }}>{feature.title}</h3>
                                <p style={{ color: 'rgba(0,0,0,0.5)' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Use Cases */}
            {isVisible && (
                <section className="animate-fadeInUp delay-400" style={{ padding: '100px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '32px' }}>Ideal For</h2>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {useCases.map((item, i) => (
                                <div key={i} style={{
                                    padding: '12px 24px',
                                    borderRadius: '100px',
                                    background: 'rgba(79, 70, 229, 0.08)',
                                    border: '1px solid rgba(79, 70, 229, 0.15)',
                                    color: '#4F46E5'
                                }}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            {isVisible && (
                <section className="animate-fadeInUp delay-500" style={{ padding: '140px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: 700, marginBottom: '20px' }}>
                            Ready to Get Started?
                        </h2>
                        <p style={{ color: 'rgba(0,0,0,0.5)', marginBottom: '40px', fontSize: '17px' }}>
                            Contact us to learn more about accessing compliant behavioral data for your organization.
                        </p>
                        <Link to="/contact" className="btn-primary" style={{
                            padding: '20px 48px',
                            borderRadius: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none'
                        }}>
                            Inquire About Data Access <ArrowRight size={20} />
                        </Link>
                    </div>
                </section>
            )}
            {isVisible && (
    <section className="animate-fadeInUp delay-600 footer-section">
        <Footer />
    </section>
)}
</div>
        </div>
    );
};

export default BuyerPage;
