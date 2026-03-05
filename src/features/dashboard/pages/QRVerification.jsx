import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { BsQrCode } from 'react-icons/bs';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import { useVerifyQr, useQrHistory } from '../../../hooks/queries/qrVerification/useQrVerification';
import { EIdProfile } from '../components/eID';
import toast from 'react-hot-toast';

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

export default function QRVerification() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [verifiedResident, setVerifiedResident] = useState(null);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const verifyMutation = useVerifyQr();
  const { data: history = [] } = useQrHistory(20);

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleVerify = async (token, method = 'manual_entry') => {
    if (!token?.trim()) return;
    try {
      const result = await verifyMutation.mutateAsync({ token: token.trim(), method });
      if (result.result === 'valid') {
        setVerifiedResident(result.resident);
        toast.success('QR Code verified — Active resident.');
      } else if (result.result === 'expired') {
        setVerifiedResident(result.resident);
        toast.error('eID is expired.');
      } else if (result.result === 'revoked') {
        setVerifiedResident(null);
        toast.error('eID has been revoked.');
      } else {
        setVerifiedResident(null);
        toast.error('Invalid QR Code — No matching record found.');
      }
    } catch {
      // error toast handled by hook
    }
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      handleVerify(manualCode, 'manual_entry');
      setManualCode('');
    }
  };

  const r = verifiedResident;
  const fullName = r
    ? `${r.first_name}${r.last_name ? ' ' + r.last_name : ''}`.trim()
    : '—';

  return (
    <div className="flex h-screen bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          title="QR Verification"
          userName={profile?.full_name ?? ''}
          userRole={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <div className="flex-1 overflow-auto">
          <div className="p-3 mx-auto w-full max-w-7xl">
            <div className="mt-2 flex flex-col md:flex-row gap-6">

              {/* Left: Scan Panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col w-full sm:w-[650px]">
                <div className="bg-[#F1F7F2] rounded-t-lg px-6 sm:px-10 py-3 mb-6 -mx-6 -my-6 border border-gray-200">
                  <h3 className="text-xl sm:text-[24px] font-semibold">Scan QR Code</h3>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 mx-auto flex items-center justify-center bg-gray-50 mb-6 w-full max-w-[400px] min-h-[180px] sm:min-h-[220px]">
                  <div className="text-center">
                    <BsQrCode className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">QR Code will appear here</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => toast('Camera scan requires device camera access — coming soon.')}
                    className="flex-1 bg-[#005F02] hover:bg-[#004A01] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Scan QR Code
                  </button>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                    placeholder="Enter Code Manually"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]"
                  />
                </div>

                {/* Verification History */}
                <div className="flex-1 flex flex-col">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Verification History</h4>
                  <div className="space-y-2 overflow-y-auto">
                    {history.map((item) => {
                      const name = item.electronic_ids?.residents
                        ? `${item.electronic_ids.residents.first_name} ${item.electronic_ids.residents.last_name}`
                        : item.electronic_ids?.eid_number ?? '—';
                      const statusLabel = item.result === 'valid' ? 'Active' : item.result === 'expired' ? 'Expired' : 'Invalid';
                      return (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <span className="text-sm text-gray-700">{name}</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium ${item.result === 'valid' ? 'text-[#005F02]' : 'text-red-600'}`}>
                              {statusLabel}
                            </span>
                            <span className="text-xs text-gray-400">{formatTime(item.verified_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                    {history.length === 0 && (
                      <p className="text-sm text-gray-400 py-4 text-center">No verifications yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Resident Detail Panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-full flex flex-col">
                <div className="bg-[#F1F7F2] rounded-t-lg border border-gray-200 flex flex-col items-center py-6 -my-6 mb-6 -mx-6 px-6">
                  <div className="rounded-full overflow-hidden">
                    <EIdProfile size={100} photoUrl={r?.photo_url} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold mt-3">{fullName}</p>
                </div>

                <div className="mb-6 pb-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Last Verified: <span className="text-gray-600">{history[0] ? formatTime(history[0].verified_at) : '—'}</span>
                  </p>
                </div>

                <div className="flex-1 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resident Details</h3>
                  <div className="mb-6">
                    <label className="text-sm font-medium text-[#005F02]">Full Name</label>
                    <p className="text-gray-600 pb-2 border-b border-gray-300">{fullName}</p>
                  </div>
                  <div className="mb-6">
                    <label className="text-sm font-medium text-[#005F02]">Address</label>
                    <p className="text-gray-600 pb-2 border-b border-gray-300">{r?.address_line ?? '—'}</p>
                  </div>
                  <div className="mb-6">
                    <label className="text-sm font-medium text-[#005F02]">Contact Number</label>
                    <p className="text-gray-600 pb-2 border-b border-gray-300">{r?.contact_number ?? '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#005F02]">Birthdate</label>
                      <p className="text-gray-600 pb-2 border-b border-gray-300">{r?.date_of_birth ?? '—'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#005F02]">Sex</label>
                      <p className="text-gray-600 pb-2 border-b border-gray-300">
                        {r?.sex === 'M' ? 'Male' : r?.sex === 'F' ? 'Female' : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <label htmlFor="qr-upload" className="block w-full bg-[#F1F7F2] hover:bg-[#005F02]/20 transition-colors rounded-lg py-3 text-center cursor-pointer">
                    <span className="text-base font-medium text-[#005F02]">Upload QR Code</span>
                  </label>
                  <input
                    id="qr-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) toast('QR image upload parsing requires a jsQR library — coming soon.');
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}