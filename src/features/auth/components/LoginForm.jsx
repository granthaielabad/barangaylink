import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginForm({ onSubmit, isLoading = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    await onSubmit?.({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="login-email"
          className="block text-[#8C0B1A] font-bold mb-2 text-base"
        >
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
          autoComplete="email"
          required
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="login-password"
          className="block text-[#8C0B1A] font-bold mb-2 text-base"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-white text-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
            autoComplete="current-password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#8C0B1A] focus:outline-none focus:ring-0 shrink-0"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading}
            tabIndex={-1}
          >
            {showPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex justify-end mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Forgot Password
          </Link>
        </div>
      </div>

      {/* Login button */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-lg bg-[#8C0B1A] text-white text-base font-bold uppercase tracking-wide hover:bg-[#7A0915] transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#8C0B1A]"
        disabled={isLoading}
      >
        {isLoading ? 'LOGIN....' : 'LOGIN'}
      </button>
    </form>
  );
}


