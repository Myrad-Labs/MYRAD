import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users } from 'lucide-react';

// Custom X (formerly Twitter) Logo Component
const XLogo = ({ size = 18, color = "currentColor" }: { size?: number, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const TEAM_MEMBERS = [
    {
        name: "Arghya",
        role: "CEO",
        image: "arghya.webp",
        socials: {
            twitter: "https://x.com/arghya"
        }
    },
    {
        name: "Andy",
        role: "COO",
        image: "andy.webp",
        socials: {
            twitter: "https://x.com/andy"
        }
    },
    // Placeholders based on screenshot layout (alternating or grid)
    {
        name: "Sayan",
        role: "CTO",
        image: "sayan.webp",
        socials: {
            twitter: "https://x.com/sayan"
        }
    },
    {
        name: "Abhra",
        role: "CMO",
        image: "abhra.webp",
        socials: {
            twitter: "https://x.com/abhra"
        }
    }
];

const TeamsPage = () => {
    return (
        <div className="teams-page">
            <style>{`
                @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');

                .teams-page {
                    font-family: 'Satoshi', sans-serif;
                    background: #ffffff;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .teams-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 80px 24px;
                    flex: 1;
                    width: 100%;
                }

                .teams-header {
                    text-align: center;
                    margin-bottom: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                .icon-badge {
                    width: 64px;
                    height: 40px;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #111827;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .teams-title {
                    font-size: 36px;
                    fontWeight: 700;
                    color: #111827;
                    letter-spacing: -0.02em;
                }

                .teams-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 32px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .team-card {
                    background: #f3f4f6;
                    border-radius: 100px; /* Pill shape */
                    padding: 16px;
                    padding-right: 48px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    cursor: default;
                }

                .team-card:hover {
                    background: #ffffff;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: #e5e7eb;
                    transform: translateY(-4px);
                }

                .member-image-container {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #e5e7eb;
                    flex-shrink: 0;
                }

                .member-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top center;
                    /* Cover to fill circle, top align for faces */
                }

                .team-card:hover .member-image {
                    /* No filter change needed */
                }

                .member-info {
                    display: flex;
                    flex-direction: column;
                }

                .member-name {
                    font-size: 22px;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 4px;
                }

                .member-role {
                    font-size: 15px;
                    color: #6b7280;
                    font-weight: 500;
                    margin-bottom: 12px;
                }

                .social-links {
                    display: flex;
                    gap: 12px;
                }

                .social-icon {
                    color: #9ca3af;
                    transition: color 0.2s;
                }

                .social-icon:hover {
                    color: #111827;
                }

                @media (max-width: 768px) {
                    .teams-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    
                    .team-card {
                        padding: 16px;
                        padding-right: 24px;
                        gap: 20px;
                    }

                    .member-image-container {
                        width: 80px;
                        height: 80px;
                    }

                    .member-name {
                        font-size: 18px;
                    }
                }
            `}</style>

            <Header />

            <main className="teams-container">
                <div className="teams-header">
                    <div className="icon-badge">
                        <Users size={20} />
                    </div>
                    <h1 className="teams-title">Meet Our Team</h1>
                </div>

                <div className="teams-grid">
                    {TEAM_MEMBERS.map((member, index) => (
                        <div key={index} className="team-card">
                            <div className="member-image-container">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="member-image"
                                />
                            </div>
                            <div className="member-info">
                                <h3 className="member-name">{member.name}</h3>
                                <p className="member-role">{member.role}</p>
                                <div className="social-links">
                                    {member.socials?.twitter && (
                                        <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="social-icon">
                                            <XLogo size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TeamsPage;
