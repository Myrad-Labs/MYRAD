import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Lock, Database, CheckCircle, BarChart3, Zap } from 'lucide-react';

const BuyerPage = () => {
    const accent = '#E5B94E';
    const emerald = '#10B981';

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
            background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { font-family: 'Inter', -apple-system, sans-serif; }
                h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }
                .card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: all 0.3s ease;
                }
                .card:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(16, 185, 129, 0.3);
                    transform: translateY(-4px);
                }
                .btn-primary {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    border: none;
                    color: #fff;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
                }
                .glow-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    pointer-events: none;
                }
            `}</style>

            {/* Background Effects */}
            <div className="glow-orb" style={{ top: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(16, 185, 129, 0.08)' }} />
            <div className="glow-orb" style={{ bottom: '20%', left: '5%', width: '500px', height: '500px', background: 'rgba(16, 185, 129, 0.05)' }} />

            {/* Header */}
            <header style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
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
                        <span style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: accent,
                            fontFamily: "'Space Grotesk', sans-serif"
                        }}>MYRAD</span>
                    </Link>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>For Users</Link>
                        <Link to="/buyers" style={{ color: emerald, textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>For Buyers</Link>
                        <Link to="/contact" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
                            Get Access
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                padding: '120px 24px 80px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '100px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: emerald,
                        marginBottom: '32px'
                    }}>
                        <Database size={14} />
                        Enterprise Data Solutions
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 60px)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        letterSpacing: '-0.03em'
                    }}>
                        The Future of Behavioral Intelligence is{' '}
                        <span style={{ color: emerald }}>Compliant.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p style={{
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                        maxWidth: '750px',
                        margin: '0 auto 48px'
                    }}>
                        Access high-quality, anonymous, and user-consented data for your AI models and audience segmentation.
                        <span style={{ color: emerald }}> Cookie-proof by design.</span>
                    </p>

                    {/* CTA */}
                    <Link
                        to="/contact"
                        className="btn-primary"
                        style={{
                            padding: '18px 36px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none'
                        }}
                    >
                        Inquire About Data Access
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Value Proposition */}
            <section style={{
                padding: '80px 24px',
                background: 'rgba(255,255,255,0.01)',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
                            What We Provide
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto' }}>
                            We provide essential, pre-labeled behavioral traits and cohorts (e.g., <strong style={{ color: emerald }}>Daily Delivery Users</strong> or{' '}
                            <strong style={{ color: emerald }}>High Spend Eaters</strong>) that traditional data brokers cannot.
                            Our data is 100% compliant, sourced directly from users via zero-knowledge proofs.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        textAlign: 'center',
                        marginBottom: '60px'
                    }}>
                        Why <span style={{ color: emerald }}>MYRAD</span> Data?
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px'
                    }}>
                        {features.map((feature, i) => (
                            <div key={i} className="card" style={{ borderRadius: '20px', padding: '32px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <feature.icon size={28} color={emerald} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7 }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section style={{
                padding: '80px 24px',
                background: 'rgba(255,255,255,0.01)',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
                        Ideal For
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
                        Power your data-driven initiatives with compliant behavioral intelligence
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        justifyContent: 'center'
                    }}>
                        {useCases.map((useCase, i) => (
                            <div key={i} style={{
                                padding: '12px 24px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '100px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                {useCase}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon Notice */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(229, 185, 78, 0.08)',
                        border: '1px solid rgba(229, 185, 78, 0.2)',
                        borderRadius: '16px',
                        padding: '32px'
                    }}>
                        <Zap size={32} color={accent} style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: accent }}>
                            Coming Soon
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                            The full <strong>Insight Marketplace</strong> and <strong>Trait API</strong> access are coming soon.
                            For immediate access and pilot programs, please contact our team.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '100px 24px',
                background: `linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)`,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 700, marginBottom: '16px' }}>
                        Ready to Get Started?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '40px', fontSize: '18px' }}>
                        Contact us to learn more about accessing compliant behavioral data for your organization.
                    </p>
                    <Link
                        to="/contact"
                        className="btn-primary"
                        style={{
                            padding: '20px 48px',
                            borderRadius: '14px',
                            fontSize: '18px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none'
                        }}
                    >
                        Inquire About Data Access
                        <ArrowRight size={20} />
                    </Link>
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: accent }}>MYRAD</div>
                    <nav style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px' }}>For Users</Link>
                        <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
                        <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link>
                    </nav>
                </div>
                <div style={{
                    maxWidth: '1200px',
                    margin: '24px auto 0',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '13px'
                }}>
                    © 2024 MYRAD. Privacy-first data union.
                </div>
            </footer>
        </div>
    );
};

export default BuyerPage;
