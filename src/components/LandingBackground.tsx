import Antigravity from "./Antigravity";

const LandingBackground = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Antigravity
        count={300}
        magnetRadius={6}
        ringRadius={7}
        waveSpeed={0.4}
        waveAmplitude={1}
        particleSize={1.5}
        lerpSpeed={0.05}
        color="#FF9FFC"
        autoAnimate={true}
        particleVariance={1}
      />
    </div>
  );
};

export default LandingBackground;
