import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBadgeCheck } from "react-icons/lu";
import { RotatingLines } from 'react-loader-spinner';

const REDIRECT_DELAY_MS = 3000;

const DEFAULT_MESSAGE = (
  <>
    Your account has been created successfully!
    <br />
    You may now log in using your registered
    <br />
    credentials.
  </>
);

const FORGOT_PASSWORD_MESSAGE = (
  <>
    Your password has been successfully updated.
    <br />
    You can now log in with your new password.
  </>
);

export default function SuccessStep({ variant = 'signup' }) {
  const navigate = useNavigate();
  const message = variant === 'forgotPassword' ? FORGOT_PASSWORD_MESSAGE : DEFAULT_MESSAGE;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="overflow-hidden h-full rounded-2xl shadow-lg">
      {/* Dark green header with success icon */}
      <div className="bg-[#8C0B1A] px-6 py-8 flex flex-col items-center">
        <LuBadgeCheck
          className="w-16 h-16 text-white"
          strokeWidth={2}
          aria-hidden
        />
        <h2 className="text-white text-2xl font-bold mt-3">Success!</h2>
      </div>

      {/* White content area */}
      <div className="bg-white px-6 py-8">
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Redirect button with spinner */}
        <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#8C0B1A] text-white font-medium">
          <span>Redirecting you to the Login Page</span>
          <RotatingLines
            visible={true}
            height={20}
            width={20}
            animationDuration="0.75"
            color="#ffffff"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      </div>
    </div>
  );
}


