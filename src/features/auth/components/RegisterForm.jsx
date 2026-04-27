import { useState } from 'react';

export default function RegisterForm({ onSubmit }) {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ lastName, firstName, middleName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Last Name */}
      <div>
        <label
          htmlFor="signup-lastname"
          className="block text-[#8C0B1A] font-bold mb-2 text-base"
        >
          Last Name
        </label>
        <input
          id="signup-lastname"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-shadow"
          autoComplete="family-name"
          required
        />
      </div>

      {/* First Name */}
      <div>
        <label
          htmlFor="signup-firstname"
          className="block text-[#8C0B1A] font-bold mb-2 text-base"
        >
          First Name
        </label>
        <input
          id="signup-firstname"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-shadow"
          autoComplete="given-name"
          required
        />
      </div>

      {/* Middle Name */}
      <div>
        <label
          htmlFor="signup-middlename"
          className="block text-[#8C0B1A] font-bold mb-2 text-base"
        >
          Middle Name
        </label>
        <input
          id="signup-middlename"
          type="text"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Enter your middle name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-shadow"
          autoComplete="additional-name"
        />
      </div>

      {/* Continue button */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-lg bg-[#8C0B1A] text-white text-base font-bold uppercase tracking-wide hover:bg-[#7A0915] transition-colors"
      >
        Continue
      </button>
    </form>
  );
}


