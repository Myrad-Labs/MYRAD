import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const Header = () => {
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect to dashboard when user authenticates
    useEffect(() => {
        if (authenticated && ready) {
            navigate('/dashboard');
        }
    }, [authenticated, ready, navigate]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGetStarted = () => {
        if (authenticated) {
            navigate('/dashboard');
        } else {
            login();
        }
    };



    return (
        <>
            <style>{`
                .nav-link {
                    color: rgba(0, 0, 0, 0.5);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 8px 16px;
                    border-radius: 8px;
                    transition: all 0.25s ease;
                }
                
                .nav-link:hover {
                    color: #1a1a1a;
                    background: rgba(0, 0, 0, 0.05);
                }
                
                .btn-primary {
                    background: #374151;
                    border: 1px solid #374151;
                    color: #fff;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .btn-primary:hover {
                    background: #1f2937;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                    .contribute-btn { display: none !important; }
                }
                
                @media (min-width: 769px) {
                    .mobile-menu-btn { display: none !important; }
                }
            `}</style>
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: scrollY > 50 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                borderBottom: scrollY > 50 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.4s ease'
            }}>
                <div
                    style={{
                        maxWidth: '1280px',
                        margin: '0 auto',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '24px'
                    }}
                >
                    {/* Left: logo */}
                    <div style={{ flex: 1 }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <img
                                src="myrad-removebg-preview.png"
                                alt="MYRAD logo"
                                loading="lazy"
                                style={{
                                    height: '40px',
                                    objectFit: 'contain'
                                }}
                            />
                        </Link>
                    </div>

                    {/* Center: nav */}
                    <nav
                        className="desktop-nav"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                    >
                        {[
                            { label: 'Home', href: '/' },
                            { label: 'Contribute', href: '/contribute' },
                            { label: 'Docs', href: 'https://docs.myradhq.xyz' },
                            { label: 'About', href: '/about' },
                        ].map((link, i) =>
                            link.href.startsWith('#') || link.href.startsWith('http') ? (
                                <a key={i} href={link.href} className="nav-link" target={link.href.startsWith('http') ? "_blank" : "_self"} rel={link.href.startsWith('http') ? "noopener noreferrer" : ""}>
                                    {link.label}
                                </a>
                            ) : (
                                <Link key={i} to={link.href} className="nav-link" onClick={() => window.scrollTo(0, 0)}>
                                    {link.label}
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Right: button + mobile toggle */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                        <button
                            onClick={handleGetStarted}
                            className="btn-primary contribute-btn"
                            style={{
                                padding: '14px 28px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {authenticated ? 'Go to Dashboard' : 'Get Started'}
                            <ArrowRight size={16} />
                        </button>

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(0,0,0,0.15)',
                                borderRadius: '8px',
                                color: '#1a1a1a',
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
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                        padding: '20px 24px'
                    }}>
                        {[
                            { label: 'Home', href: '/' },
                            { label: 'Contribute', href: '/contribute' },
                            { label: 'Docs', href: 'https://docs.myradhq.xyz' },
                            { label: 'About', href: '/about' },
                        ].map((link, i) => (
                            link.href.startsWith('#') || link.href.startsWith('http') ? (
                                <a key={i} href={link.href} className="nav-link" style={{ display: 'block', padding: '14px 0' }} onClick={() => setMobileMenuOpen(false)} target={link.href.startsWith('http') ? "_blank" : "_self"}>{link.label}</a>
                            ) : (
                                <Link key={i} to={link.href} className="nav-link" style={{ display: 'block', padding: '14px 0' }} onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}>{link.label}</Link>
                            )
                        ))}
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;