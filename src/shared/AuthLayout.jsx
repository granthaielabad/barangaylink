import landingBg from '../assets/images/landing-bg.png';

/**
 * Split layout for Login and SignUp pages:
 * - Top half: background image with dark overlay
 * - Bottom half: light green-white background
 * - Logo, label, and form card: centered in the middle, overlapping both halves
 */
export default function AuthLayout({ header, children }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top half: background image with overlay */}
      <div 
        style={{ backgroundImage: `url(${landingBg})` }}
        className="relative h-[60vh] min-h-[320px] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-emerald-950/70 to-emerald-980/80" />
      </div>

      {/* Bottom half: light green-white background */}
      <div className="flex-1 min-h-[50vh] bg-[#f7faf7]" />

      {/* Logo, label, and form card: centered in the middle, overlapping the split */}
      <div className="absolute left-1/2 top-110 -translate-x-1/2 -translate-y-1/2 w-full max-w- z-20 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          {header}
        </div>
        {children}
      </div>
    </div>
  );
}
