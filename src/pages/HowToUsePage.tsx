import { useEffect, useRef } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

const HowToUsePage = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Scroll-triggered video playback
    useEffect(() => {
        const videoElement = videoRef.current;
        const containerElement = videoContainerRef.current;
        if (!videoElement || !containerElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoElement.currentTime = 0;
                        videoElement.play();
                    } else {
                        videoElement.pause();
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(containerElement);
        return () => observer.disconnect();
    }, []);

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
                .how-to-use-page {
                    min-height: 100vh;
                    background: #ffffff;
                    color: #111827;
                    font-family: 'Satoshi', sans-serif;
                    padding-left: 70px;
                    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .how-to-use-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 24px;
                }
            `}</style>

            <div className="how-to-use-page">
                <Sidebar />
                <DashboardHeader />

                <main className="how-to-use-content">
                    <section style={{ padding: '60px 0', textAlign: 'center' }}>
                        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '12px', letterSpacing: '-0.02em', color: '#111827' }}>How to contribute</h2>
                            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '40px' }}>Privacy first data contribution in simple steps</p>

                            <div ref={videoContainerRef} style={{
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                maxWidth: '800px',
                                margin: '0 auto'
                            }}>
                                <video
                                    ref={videoRef}
                                    src="tutorial.mp4"
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        width: '100%',
                                        display: 'block'
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HowToUsePage;