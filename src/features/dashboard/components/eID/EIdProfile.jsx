import { FaUser } from 'react-icons/fa';

export default function EIdProfile({
  className = '',
  size = null,
  photoUrl = null,
}) {
  // Use responsive default if neither size nor specific width/height class is provided
  const hasSizing = size || /w-|h-/.test(className);
  const sizingClasses = !hasSizing ? 'w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]' : '';

  return (
    <div
      className={`flex items-center justify-center shrink-0 overflow-hidden bg-gray-200 border border-gray-300 rounded-md ${sizingClasses} ${className}`}
      style={size ? { width: `${size}px`, height: `${size}px` } : {}}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <FaUser className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
}


