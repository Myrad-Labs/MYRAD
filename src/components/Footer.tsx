const Footer = () => {
    return (
        <footer
            style={{
                background: "#f8f9fa",
                color: "#1a1a1a",
                padding: "50px 24px 25px",
                position: "relative",
                overflow: "hidden",
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'left'
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "center", // ✅ centers the whole footer group
                }}
            >

                {/* Top content */}
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                        gap: "100px",
                    }}
                >
                    {/* Brand */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {/* Logo */}
                        <img
                            src="/images/navlogo.jpg"
                            alt="MYRAD logo"
                            loading="lazy"
                            style={{
                                height: "30px",
                                objectFit: "contain",
                            }}
                        />

                        {/* Description (next line) */}
                        <p
                            style={{
                                fontSize: "14px",
                                lineHeight: "1.6",
                                color: "rgba(0,0,0,0.6)",
                                maxWidth: "260px",
                                margin: 0,
                            }}
                        >
                            Empowering decentralized data exchange with transparency and trust.
                        </p>
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                marginBottom: "16px",
                                color: "#1a1a1a"
                            }}
                        >
                            About us
                        </div>

                        <a
                            href="https://linktr.ee/MYRAD_HQ"
                            target="_blank"
                            style={{
                                display: "block",
                                color: "rgba(0,0,0,0.6)",
                                textDecoration: "none",
                                marginBottom: "8px",
                                fontSize: "14px"
                            }}
                        >
                            Linktree
                        </a>

                        <a href="/team" style={{ display: "block", color: "rgba(0,0,0,0.6)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>Team</a>

                        <a href="https://docs.myradhq.xyz/" style={{ display: "block", color: "rgba(0,0,0,0.6)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>Docs</a>

                    </div>

                    {/* Company */}
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>Company</div>
                        <a
                            href="/terms"
                            target="_blank"
                            style={{
                                display: "block",
                                color: "rgba(0,0,0,0.6)",
                                textDecoration: "none",
                                marginBottom: "8px",
                                fontSize: "14px"
                            }}
                        >
                            Terms of Service
                        </a>
                        <a
                            href="/privacy"
                            target="_blank"
                            style={{
                                display: "block",
                                color: "rgba(0,0,0,0.6)",
                                textDecoration: "none",
                                marginBottom: "8px",
                                fontSize: "14px"
                            }}
                        >
                            Privacy Policy
                        </a>
                        <a href="/" style={{ display: "block", color: "rgba(0,0,0,0.6)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>Contact</a>
                    </div>

                    {/* Connect */}
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>Connect</div>
                        <a href="https://x.com" style={{ display: "block", color: "rgba(0,0,0,0.6)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>X</a>
                        <a href="https://x.com" style={{ display: "block", color: "rgba(0,0,0,0.6)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>Telegram</a>
                        <a href="https://github.com" style={{ display: "block", color: "rgba(0,0,0,0.6)", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>GitHub</a>
                    </div>
                </div>
            </div>
            {/* Huge MYRAD text */}
            <div
                style={{
                    marginTop: "50px",
                    fontSize: "18vw",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: "0.9",
                    color: "#000000",
                    opacity: 0.95,
                    textAlign: "center",
                    userSelect: "none",
                }}
            >
                MYRAD
            </div>

        </footer>
    );
};

export default Footer;