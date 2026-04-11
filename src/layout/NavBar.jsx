import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Logo } from '../shared'

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    if (isLandingPage) {
      handleSmoothScroll(e, 'home');
    } else {
      setMenuOpen(false);
    }
  };

  const navLinkClass = 'font-poppins font-semibold text-xl text-white hover:opacity-80 transition-all cursor-pointer';

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/70 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}>
        <div className="mx-4 md:mx-12 px-4 md:px-5 flex justify-between items-center h-20 md:h-28">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Logo variant="navbar" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex gap-12 xl:gap-24">
            {isLandingPage ? (
              <a href="#home" onClick={handleHomeClick} className={navLinkClass}>HOME</a>
            ) : (
              <Link to="/" onClick={() => setMenuOpen(false)} className={navLinkClass}>HOME</Link>
            )}
            <Link
              to="/#about"
              onClick={(e) => isLandingPage ? handleSmoothScroll(e, 'about') : setMenuOpen(false)}
              className={navLinkClass}
            >
              ABOUT US
            </Link>
            <Link
              to="/#features"
              onClick={(e) => isLandingPage ? handleSmoothScroll(e, 'features') : setMenuOpen(false)}
              className={navLinkClass}
            >
              FEATURES
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-4 items-center flex-shrink-0">
            <Link to="/login" className="font-poppins px-5 py-3 rounded font-semibold text-lg text-white transition-all hover:bg-white/10">LOGIN</Link>
            <Link to="/signup" className="font-poppins text-white bg-[#005F02] px-6 py-3 rounded-md font-semibold text-lg hover:bg-[#004A01] transition-colors shadow-lg">SIGN UP</Link>
          </div>

          {/* Hamburger Button (mobile only) */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-50 focus:outline-none"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block h-0.5 w-7 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-7 bg-white rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-7 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Desktop border line */}
          <div className={`absolute bottom-0 left-10 right-10 md:left-20 md:right-20 border-t transition-all hidden md:block ${isScrolled ? 'border-gray-200 opacity-0' : 'border-white opacity-50'
            }`}></div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Slide-in Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 z-50 bg-gray-950/95 backdrop-blur-md flex flex-col pt-28 pb-10 px-8 gap-8 transition-transform duration-300 ease-in-out md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* Mobile Nav Links */}
        <nav className="flex flex-col gap-6 border-b border-white/20 pb-8">
          {isLandingPage ? (
            <a href="#home" onClick={handleHomeClick} className="font-poppins font-semibold text-xl text-white hover:opacity-70 transition-all">HOME</a>
          ) : (
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-poppins font-semibold text-xl text-white hover:opacity-70 transition-all">HOME</Link>
          )}
          <Link
            to="/#about"
            onClick={(e) => isLandingPage ? handleSmoothScroll(e, 'about') : setMenuOpen(false)}
            className="font-poppins font-semibold text-xl text-white hover:opacity-70 transition-all"
          >
            ABOUT US
          </Link>
          <Link
            to="/#features"
            onClick={(e) => isLandingPage ? handleSmoothScroll(e, 'features') : setMenuOpen(false)}
            className="font-poppins font-semibold text-xl text-white hover:opacity-70 transition-all"
          >
            FEATURES
          </Link>
        </nav>

        {/* Mobile Auth Buttons */}
        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="font-poppins text-center border border-white/40 text-white px-5 py-3 rounded-md font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            LOGIN
          </Link>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="font-poppins text-center text-white bg-[#005F02] px-5 py-3 rounded-md font-semibold text-lg hover:bg-[#004A01] transition-colors"
          >
            SIGN UP
          </Link>
        </div>
      </div>
    </>
  );
}
