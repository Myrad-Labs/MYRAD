const Footer = () => {
    return (
        <footer
            style={{
                background: "#ffffff",
                color: "#374151",
                padding: "80px 24px 40px",
                position: "relative",
                overflow: "hidden",
                fontFamily: 'inherit', // Inherits Satoshi
                textAlign: 'left',
                borderTop: '1px solid rgba(0,0,0,0.04)'
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {/* Top content */}
                <div
                    style={{
                        maxWidth: "1200px",
                        width: "100%",
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                        gap: "60px",
                        marginBottom: "100px" // Space before the large text
                    }}
                >
                    {/* Brand */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* Logo */}
                        <img
                            src="/images/navlogo.jpg"
                            alt="MYRAD logo"
                            loading="lazy"
                            style={{ height: "32px", objectFit: "contain", alignSelf: 'flex-start' }}
                        />

                        {/* Description */}
                        <p style={{
                            fontSize: "15px",
                            lineHeight: "1.6",
                            color: "#6b7280",
                            maxWidth: "280px",
                            margin: 0,
                        }}>
                            Empowering decentralized data exchange with transparency and trust.
                        </p>

                        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: 'auto' }}>
                            © 2024 MYRAD Labs.
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "20px", color: "#111827", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            About
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="/team" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Team</a>
                            <a href="https://docs.myradhq.xyz/" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Docs</a>
                            <a href="https://linktr.ee/myradhqdotxyz" target="_blank" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Linktree</a>
                        </div>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "20px", color: "#111827", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Company
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="/terms" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Terms of Service</a>
                            <a href="/privacy" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Privacy Policy</a>
                            <a href="/contact" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Contact</a>
                        </div>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "20px", color: "#111827", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Connect
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="https://x.com/myrad_hq" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>X (Twitter)</a>
                            <a href="https://t.me/+KOAn6WDf7AdmNTI1" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>Telegram</a>
                            <a href="https://github.com/Myrad-Labs/" style={{ color: "#4b5563", textDecoration: "none", fontSize: "15px", transition: 'color 0.2s' }}>GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Huge MYRAD text */}
            <div
                style={{
                    fontSize: "22vw",
                    fontWeight: 800,
                    letterSpacing: "-0.06em",
                    lineHeight: "0.8",
                    color: "#374151",
                    opacity: 0.08, // Subtle watermark effect
                    textAlign: "center",
                    userSelect: "none",
                    pointerEvents: 'none',
                    marginBottom: '-2vw' // Slight overlap with bottom
                }}
            >
                MYRAD
            </div>
        </footer>
    );
};

export default Footer;