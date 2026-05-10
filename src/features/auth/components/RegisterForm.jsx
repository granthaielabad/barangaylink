import { useState } from 'react';

export default function RegisterForm({ onSubmit }) {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [errors, setErrors] = useState({ lastName: '', firstName: '', middleName: '' });

  // Only allow letters and spaces
  const nameRegex = /^[A-Za-z\s]+$/;

  const validateName = (value) => {
    if (!value) return '';
    if (!nameRegex.test(value)) {
      return 'Only letters and spaces are allowed.';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Trim whitespace from all fields
    const trimmedLastName = lastName.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedMiddleName = middleName.trim();
    const lastNameError = validateName(trimmedLastName);
    const firstNameError = validateName(trimmedFirstName);
    const middleNameError = trimmedMiddleName ? validateName(trimmedMiddleName) : '';
    setErrors({ lastName: lastNameError, firstName: firstNameError, middleName: middleNameError });
    if (lastNameError || firstNameError || middleNameError) return;
    onSubmit?.({ lastName: trimmedLastName, firstName: trimmedFirstName, middleName: trimmedMiddleName });
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
        {errors.lastName && (
          <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
        )}
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
        {errors.firstName && (
          <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>

      {/* Middle Name */}
      <div>
        <label
          htmlFor="signup-middlename"
          className="block text-[#8C0B1A] font-bold mb-2 text-base"
        >
          Middle Name (Optional)
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
        {errors.middleName && (
          <p className="text-red-600 text-sm mt-1">{errors.middleName}</p>
        )}
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


