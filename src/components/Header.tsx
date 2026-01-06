import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const Header = () => {
    const navigate = useNavigate();
    const { login, authenticated } = usePrivy();
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const navLinks = [
        { label: 'For Users', href: '/' },
        { label: 'For Buyers', href: '/buyers' },
        { label: 'Docs', href: 'https://docs.myradhq.xyz' },
        { label: 'About', href: '/about' },
    ];

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
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <img
                            src="/images/navlogo.jpg"
                            alt="MYRAD logo"
                            loading="lazy"
                            style={{
                                height: '30px',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>

                    {/* Right: nav + button + mobile toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <nav
                            className="desktop-nav"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            {navLinks.map((link, i) =>
                                link.href.startsWith('#') ? (
                                    <a key={i} href={link.href} className="nav-link">
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link key={i} to={link.href} className="nav-link">
                                        {link.label}
                                    </Link>
                                )
                            )}
                        </nav>

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
        </>
    );
};

export default Header;