import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.svg';

/**
 * 
 * @param {'navbar' | 'auth' | 'dashboard'} variant - 'navbar' for NavBar (larger, tagline hidden on mobile), 'auth' for Login/SignUp (centered), 'dashboard' for sidebar/header
 * @param {string} [className] 
 */
export default function Logo({ variant = 'auth', className = '' }) {
  const isNavbar = variant === 'navbar';
  const isDashboard = variant === 'dashboard';

  return (
    <Link
      to="/"
      className={
        isNavbar
          ? `flex items-center gap-3 font-bold hover:opacity-80 transition-opacity cursor-pointer text-white ${className}`
          : isDashboard
            ? `flex items-center gap-3 font-bold hover:opacity-80 transition-opacity cursor-pointer ${className}`
            : `inline-flex items-center justify-center mb-6 hover:opacity-90 transition-opacity ${className}`
      }
      aria-label="BarangayLink Home"
    >
      <img
        src={logo}
        alt=""
        className={isNavbar ? 'w-16 h-16' : isDashboard ? 'w-12 h-12' : 'h-12 md:h-14 w-auto'}
        loading="lazy"
      />
      <div className={isNavbar || isDashboard ? 'flex flex-col gap-0.5' : ''}>
        <p
          className={
            isNavbar
              ? 'text-xl font-extrabold tracking-wider'
              : isDashboard
                ? 'text-xl font-extrabold tracking-wider text-[#8C0B1A]'
                : 'text-white font-bold text-xl md:text-2xl tracking-tight'
          }
        >
          BARANGAYLINK
        </p>
        <p
          className={
            isNavbar
              ? 'text-xs font-normal text-teal-100 tracking-wider hidden md:block'
              : isDashboard
                ? 'text-xs font-normal text-gray-500 tracking-wider'
                : 'text-white/90 text-sm'
          }
        >
          Resident and House Registry
        </p>
      </div>
    </Link>
  );
}


