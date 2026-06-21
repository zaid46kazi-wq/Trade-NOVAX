import LandingHero from "../components/LandingHero";

export const metadata = {
  title: "Trade Nova | AI Powered Neural Intelligence",
  description: "Analyze markets in real-time using machine learning, advanced pattern recognition, and holographic neural intelligence.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      <LandingHero />
    </div>
  );
}
