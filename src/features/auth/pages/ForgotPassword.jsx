import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, Logo } from '../../../shared';
import {
  EmailCredentialsForm,
  PasswordForm,
  SuccessStep,
} from '../components/';
import { sendOtp, verifyOtp, updatePassword } from '../../../services/supabase/authService';
import toast from 'react-hot-toast';

const STEPS = {
  EMAIL: 1,
  NEW_PASSWORD: 2,
  SUCCESS: 3,
};

const BREADCRUMBS = {
  [STEPS.EMAIL]: ['HOME', 'EMAIL VERIFICATION'],
  [STEPS.NEW_PASSWORD]: ['HOME', 'EMAIL VERIFICATION', 'NEW PASSWORD'],
  [STEPS.SUCCESS]: ['HOME', 'EMAIL VERIFICATION', 'NEW PASSWORD'],
};

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', otp: '', password: '' });

  const breadcrumbItems = BREADCRUMBS[step] ?? BREADCRUMBS[STEPS.EMAIL];

  // ── Step 1: Verify email + OTP ────────────────────────────
  const handleEmailSubmit = async ({ email, otp }) => {
    setIsLoading(true);
    try {
      await verifyOtp({ email, otp });
      setFormData((prev) => ({ ...prev, email, otp }));
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      toast.error(err.message ?? 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Set new password ──────────────────────────────
  const handlePasswordSubmit = async ({ password }) => {
    setIsLoading(true);
    try {
      await updatePassword(password);
      setFormData((prev) => ({ ...prev, password }));
      setStep(STEPS.SUCCESS);
    } catch (err) {
      toast.error(err.message ?? 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const header = (
    <>
      <Logo variant="auth" />
      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center uppercase tracking-wide mt-4">
        Forgot Password
      </h1>
      <nav className="flex justify-center flex-wrap items-center mt-6 text-white text-sm gap-x-1">
        {breadcrumbItems.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            {item === 'HOME' ? (
              <Link to="/" className="hover:text-white hover:underline transition-colors">
                {item}
              </Link>
            ) : (
              <span>{item}</span>
            )}
            {i < breadcrumbItems.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
    </>
  );

  return (
    <AuthLayout header={header}>
      {step === STEPS.SUCCESS ? (
        <div className="w-full max-w-lg">
          <SuccessStep variant="forgotPassword" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg border border-gray-100 text-gray-900">
          {step === STEPS.EMAIL && (
            <EmailCredentialsForm
              onSubmit={handleEmailSubmit}
              defaultEmail={formData.email}
              isLoading={isLoading}
            />
          )}
          {step === STEPS.NEW_PASSWORD && (
            <PasswordForm
              onSubmit={handlePasswordSubmit}
              variant="forgotPassword"
              isLoading={isLoading}
            />
          )}
          {step !== STEPS.SUCCESS && (
            <p className="text-center text-gray-600 text-sm mt-6">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Back to Login
              </Link>
            </p>
          )}
        </div>
      )}
    </AuthLayout>
  );
}