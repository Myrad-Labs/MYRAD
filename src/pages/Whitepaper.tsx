import Header from '../components/Header';
import Footer from '../components/Footer';

const WhitepaperPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            color: '#1a1a1a',
            fontFamily: '"Satoshi", sans-serif',
            background: '#ffffff'
        }}>
            <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />

            <Header />

            <Header />

            <style>{`
                @media (max-width: 768px) {
                    .whitepaper-main {
                        padding: 100px 24px 60px !important;
                    }
                    .whitepaper-title {
                        font-size: 36px !important;
                    }
                }
            `}</style>

            <main className="whitepaper-main" style={{ padding: '160px 24px 100px', maxWidth: '720px', margin: '0 auto', lineHeight: 1.8, textAlign: 'justify' }}>
                {/* Title */}
                <h1 className="whitepaper-title" style={{ fontSize: '48px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    Myrad
                </h1>
                <p style={{ fontSize: '20px', marginBottom: '64px' }}>
                    Verified Human Data Without Collecting Personal Information
                </p>

                {/* Abstract */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Abstract</h2>
                    <p style={{ marginBottom: '16px' }}>
                        AI systems, product teams, and modern companies increasingly depend on data to make decisions. Yet most available data is either untrustworthy, legally risky, or disconnected from real human behavior. At the same time, individuals generate valuable digital activity every day without participating in its economic upside.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                        Myrad introduces a new model for human data. We transform verified digital activity into small, aggregated, privacy safe behavior signals that organizations can rely on. Individuals contribute without exposing personal information, and organizations consume insights without handling raw data.
                    </p>
                    <p>
                        This paper outlines the problem with current data systems, the Myrad approach, and why human behavior signals will become a core input for AI and product decision making.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 1 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>1. The Problem</h2>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>1.1 Data is abundant, trust is not</h3>
                    <p style={{ marginBottom: '12px' }}>
                        Most modern datasets suffer from at least one of the following issues:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li>Scraped from the open internet</li>
                        <li>Biased toward vocal or extreme users</li>
                        <li>Outdated or unverifiable</li>
                        <li>Collected without clear consent</li>
                        <li>Tied to personal identifiers</li>
                    </ul>
                    <p style={{ marginBottom: '24px' }}>
                        As a result, teams often make decisions based on assumptions rather than evidence. This leads to poor product design, inefficient growth strategies, and unreliable AI systems.
                    </p>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>1.2 Raw data creates risk</h3>
                    <p style={{ marginBottom: '12px' }}>
                        Storing raw user data introduces significant challenges:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li>Privacy and regulatory exposure</li>
                        <li>Security liabilities</li>
                        <li>High infrastructure costs</li>
                        <li>Ethical concerns around surveillance</li>
                    </ul>
                    <p style={{ marginBottom: '24px' }}>
                        Many organizations do not need raw data. They need answers.
                    </p>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>1.3 Users are excluded from value creation</h3>
                    <p style={{ marginBottom: '12px' }}>
                        Individuals generate high quality behavioral data through everyday digital activity. Today, this value is captured almost entirely by platforms, while users receive little control or benefit.
                    </p>
                    <p>
                        This imbalance is unsustainable.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 2 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>2. The Myrad Approach</h2>
                    <p style={{ marginBottom: '16px' }}>
                        Myrad is built on three principles:
                    </p>
                    <ol style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li>Human behavior is valuable</li>
                        <li>Privacy is non negotiable</li>
                        <li>Signals are more useful than raw data</li>
                    </ol>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>2.1 From activity to signals</h3>
                    <p style={{ marginBottom: '12px' }}>
                        Myrad does not store or sell raw user activity. Instead, verified digital activity is transformed into:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
                        <li>Aggregated</li>
                        <li>Cohort based</li>
                        <li>Time bounded</li>
                        <li>Decision ready signals</li>
                    </ul>
                    <p style={{ marginBottom: '24px' }}>
                        These signals describe what typically happens within a group, not what any individual does.
                    </p>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>2.2 Verification without exposure</h3>
                    <p style={{ marginBottom: '12px' }}>
                        Myrad uses cryptographic verification mechanisms to confirm that activity is real without revealing personal information. This allows:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li>Enterprises to trust the data</li>
                        <li>Users to retain privacy</li>
                        <li>Myrad to avoid handling sensitive identifiers</li>
                    </ul>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>2.3 Cohort aggregation</h3>
                    <p style={{ marginBottom: '12px' }}>
                        All outputs are generated at a cohort level. Each signal represents the behavior of many users combined. This ensures:
                    </p>
                    <ul style={{ marginLeft: '24px' }}>
                        <li>Strong privacy guarantees</li>
                        <li>Reduced noise</li>
                        <li>Higher statistical stability</li>
                        <li>Clear compliance boundaries</li>
                    </ul>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 3 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>3. What is a Human Behavior Signal</h2>
                    <p style={{ marginBottom: '16px' }}>
                        A human behavior signal is a small structured representation of how people typically behave under certain conditions. Examples include:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
                        <li>How often users order food per month</li>
                        <li>When video consumption peaks during the day</li>
                        <li>How sensitive users are to pricing changes</li>
                        <li>How many users return after an initial action</li>
                    </ul>
                    <p>
                        Signals are compact, interpretable, easy to integrate, and easy to explain to stakeholders.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 4 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>4. Products and Use Cases</h2>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>4.1 For product and growth teams</h3>
                    <p style={{ marginBottom: '12px' }}>Myrad signals help teams:</p>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li>Set realistic benchmarks</li>
                        <li>Validate assumptions</li>
                        <li>Plan feature roadmaps</li>
                        <li>Reduce experimentation risk</li>
                    </ul>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>4.2 For AI and ML teams</h3>
                    <p style={{ marginBottom: '12px' }}>Signals provide:</p>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li>Human grounded baselines</li>
                        <li>Safer training references</li>
                        <li>Evaluation benchmarks</li>
                        <li>Reduced reliance on synthetic or scraped data</li>
                    </ul>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>4.3 For research and strategy teams</h3>
                    <p style={{ marginBottom: '12px' }}>Myrad offers:</p>
                    <ul style={{ marginLeft: '24px' }}>
                        <li>Defensible behavioral insights</li>
                        <li>Faster market understanding</li>
                        <li>Privacy safe alternatives to surveys</li>
                    </ul>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 5 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>5. User Participation Model</h2>
                    <p style={{ marginBottom: '16px' }}>
                        Myrad is designed so individuals benefit without exposure. Users:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
                        <li>Contribute verified activity</li>
                        <li>Never submit raw data directly to buyers</li>
                        <li>Earn points and rewards</li>
                        <li>Can opt out at any time</li>
                    </ul>
                    <p>
                        Participation is voluntary, transparent, and reversible.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 6 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>6. Privacy and Compliance</h2>
                    <p style={{ marginBottom: '16px' }}>
                        Myrad is built with privacy as a default, not an add on. Key guarantees:
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
                        <li>No raw data retention</li>
                        <li>No personal identifiers in outputs</li>
                        <li>Cohort based aggregation</li>
                        <li>Minimum k anonymity thresholds</li>
                        <li>GDPR and CCPA compatible design</li>
                    </ul>
                    <p>
                        These constraints are enforced at the system level.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 7 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>7. Why This Model Matters</h2>
                    <p style={{ marginBottom: '16px' }}>
                        As automation and AI expand, human behavior becomes the grounding truth for intelligent systems. However, trust, legality, and ethics will increasingly determine which data can be used.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                        Myrad represents a shift:
                    </p>
                    <ul style={{ marginLeft: '24px' }}>
                        <li>From data hoarding to signal sharing</li>
                        <li>From surveillance to consent</li>
                        <li>From raw logs to human meaning</li>
                    </ul>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 8 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>8. Conclusion</h2>
                    <p style={{ marginBottom: '16px' }}>
                        Human behavior will remain a core input for intelligent systems and product decisions. The challenge is not collecting more data, but collecting better data responsibly.
                    </p>
                    <p>
                        Myrad provides a new path forward. One where users retain dignity, organizations gain clarity, and trust becomes a first class feature.
                    </p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '48px 0' }} />

                {/* Section 9 */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>9. About Myrad</h2>
                    <p style={{ marginBottom: '8px' }}>
                        Myrad is building the next generation of human data.
                    </p>
                    <p style={{ fontWeight: 500 }}>
                        Verified. Aggregated. Privacy first.
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default WhitepaperPage;
