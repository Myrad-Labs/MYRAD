import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, authenticated, ready } = usePrivy();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect to dashboard when user authenticates
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
                    header > div {
                        padding: 0 16px !important;
                    }
                }
                
                @media (min-width: 769px) {
                    .mobile-menu-btn { display: none !important; }
                }
                
                @media (max-width: 480px) {
                    header > div {
                        padding: 0 12px !important;
                    }
                }
            `}</style>
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: 'rgba(250, 250, 250, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e5e7eb',
                height: '60px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div
                    style={{
                        width: '100%',
                        maxWidth: '100%',
                        padding: '0 40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '24px'
                    }}
                >
                    {/* Left: logo */}

                    {/* Center: nav */}
                    <nav
                        className="desktop-nav"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}
                    >
                        {/* Active Page Link - Left Aligned */}
                        {(() => {
                            const allLinks = [
                                { label: 'Home', href: '/' },
                                { label: 'Contribute', href: '/contribute' },
                                { label: 'About', href: '/about' },
                            ];
                            const activeLink = allLinks.find(l => l.href === location.pathname) || allLinks[0];
                            const centerLinks = [
                                ...allLinks.filter(l => l.href !== activeLink.href),
                                { label: 'Docs', href: 'https://docs.myradhq.xyz' },
                            ];

                            return (
                                <>
                                    <Link to={activeLink.href} className="nav-link" onClick={() => window.scrollTo(0, 0)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
                                            <path d="M6 4L0 0V8L6 4Z" fill="#0fab5aff" />
                                        </svg>
                                        {activeLink.label}
                                    </Link>

                                    {/* Other Links - Centered */}
                                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        {centerLinks.map((link, i) =>
                                            link.href.startsWith('http') ? (
                                                <a key={i} href={link.href} className="nav-link" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link key={i} to={link.href} className="nav-link" onClick={() => window.scrollTo(0, 0)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {link.label}
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </nav>

                    {/* Right: button + mobile toggle */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                        <button
                            onClick={handleGetStarted}
                            className="btn-primary contribute-btn"
                            style={{
                                padding: '10px 22px',
                                borderRadius: '50px',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {authenticated ? 'Go to Dashboard' : 'Get Started'}
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