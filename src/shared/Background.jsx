import landingBg from '../assets/images/landing-bg.png';

export default function Background({ children, isSubPage = false }) {
  return (
    <section 
      style={{ backgroundImage: `url(${landingBg})` }}
      className={`relative w-full bg-cover bg-center flex items-center justify-center ${isSubPage ? 'min-h-[40vh] md:min-h-[50vh]' : 'min-h-screen'}`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-emerald-950/70 to-emerald-980/80"></div>

      {/* Content */}
      <div className={`relative z-10 w-full mx-4 sm:mx-8 md:mx-16 lg:mx-20 px-4 md:px-12 ${isSubPage ? 'mt-20 md:mt-28' : 'mt-10'}`}>
        {children}
      </div>
    </section>
  );
}
