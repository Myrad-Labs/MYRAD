// Simple CSS animated background with floating gradient orbs
const DynamicBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
            pointerEvents: 'none'
        }}>
            {/* Subtle gradient orbs for visual interest */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
                top: '10%',
                right: '-10%',
                filter: 'blur(60px)',
                animation: 'float1 20s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
                bottom: '10%',
                left: '-5%',
                filter: 'blur(80px)',
                animation: 'float2 25s ease-in-out infinite'
            }} />
            <style>{`
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-30px, 20px); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -30px); }
                }
            `}</style>
        </div>
    );
};

export default DynamicBackground;
