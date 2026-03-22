import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { BsQrCode } from 'react-icons/bs';
import { FiUpload, FiCamera, FiCameraOff, FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import { useVerifyQr, useQrHistory } from '../../../hooks/queries/qrVerification/useQrVerification';
import { EIdProfile } from '../components/EId';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return d ? `${m}-${d}-${y}` : dateStr;
}

const STATUS_CONFIG = {
  valid:   { label: 'Active',    color: 'text-emerald-600', bg: 'bg-emerald-50  border-emerald-200', Icon: FiCheckCircle },
  expired: { label: 'Expired',   color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',   Icon: FiAlertCircle },
  revoked: { label: 'Inactive',  color: 'text-red-500',     bg: 'bg-red-50     border-red-200',     Icon: FiXCircle     },
  invalid: { label: 'Not Found', color: 'text-red-600',     bg: 'bg-red-50     border-red-200',     Icon: FiXCircle     },
};

// ── QR decode via jsQR ────────────────────────────────────────
async function decodeQrFromFile(file) {
  const jsQR = (await import('jsqr')).default;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(data, width, height);
        code ? resolve(code.data) : reject(new Error('No QR code found in image'));
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// ── Camera scanner ────────────────────────────────────────────
function CameraScanner({ onDetect, onClose }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const streamRef   = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Get available cameras
  const refreshDevices = useCallback(async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devs.filter(d => d.kind === 'videoinput');
      setDevices(videoDevs);
      
      // If no device is selected yet, try to find the best default
      if (videoDevs.length > 0 && !selectedDeviceId) {
        const backCam = videoDevs.find(d => d.label.toLowerCase().includes('back')) || 
                        videoDevs.find(d => d.label.toLowerCase().includes('droidcam')) ||
                        videoDevs[0];
        setSelectedDeviceId(backCam.deviceId);
      }
    } catch (err) {
      console.error('Error listing devices:', err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Start camera
  useEffect(() => {
    let cancelled = false;
    const startCamera = async () => {
      setError(null);
      // Stop previous stream
      streamRef.current?.getTracks().forEach(t => t.stop());

      try {
        const constraints = {
          video: selectedDeviceId 
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        
        // After getting permission, refresh labels
        refreshDevices();

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setScanning(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Camera error:', err);
          setError(err.name === 'NotAllowedError'
            ? 'Camera access denied. Please allow camera permission in your browser.'
            : 'Could not access this camera. It might be used by another app or is not connected.');
        }
      }
    };

    if (selectedDeviceId || devices.length === 0) {
      startCamera();
    }
    
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, [selectedDeviceId, devices.length, refreshDevices]);

  // Scan frames
  useEffect(() => {
    if (!scanning) return;
    let detected = false;

    const tick = async () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && !detected) {
          detected = true;
          streamRef.current?.getTracks().forEach(t => t.stop());
          onDetect(code.data);
          return;
        }
      } catch { /* keep scanning */ }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scanning, onDetect]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Device Selector Overlay - Always visible if devices exist */}
      {devices.length > 0 && (
        <div className="absolute top-2 left-2 right-12 z-20 flex gap-1">
          <select 
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="flex-1 bg-black/60 text-white text-[10px] py-1.5 px-2 rounded border border-white/20 outline-none backdrop-blur-md"
          >
            {devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId} className="bg-gray-900">
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
          <button 
            onClick={refreshDevices}
            className="bg-black/60 text-white p-1.5 rounded border border-white/20 hover:bg-black/80"
            title="Refresh devices"
          >
            <FiRefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-6 text-center bg-gray-900">
          <FiCameraOff className="w-12 h-12 text-red-400" />
          <p className="text-sm max-w-[250px] leading-relaxed text-gray-300">{error}</p>
          <button 
            onClick={() => setSelectedDeviceId(selectedDeviceId)} 
            className="text-xs font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          
          {/* Scanning reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-44 relative">
              <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#00E676] rounded-tl" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#00E676] rounded-tr" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#00E676] rounded-bl" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#00E676] rounded-br" />
              {/* Scanning line */}
              <span className="absolute left-0 right-0 h-0.5 bg-[#00E676]/70 top-1/2 animate-pulse" />
            </div>
          </div>
          <p className="absolute bottom-3 w-full text-center text-xs text-white/70">
            Point camera at a QR code
          </p>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-20"
        aria-label="Stop camera"
      >
        <FiCameraOff className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function QRVerification() {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [manualCode,        setManualCode]         = useState('');
  const [verifiedResident,  setVerifiedResident]   = useState(null);
  const [verifyStatus,      setVerifyStatus]       = useState(null); // 'valid'|'expired'|'revoked'|'invalid'
  const [cameraActive,      setCameraActive]       = useState(false);
  const fileInputRef = useRef(null);

  const navigate     = useNavigate();
  const { profile }  = useAuth();
  const clearAuth    = useAuthStore((s) => s.clearAuth);

  const verifyMutation = useVerifyQr();
  const { data: history = [], refetch: refetchHistory } = useQrHistory(20);

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const handleVerify = useCallback(async (token, method = 'manual_entry') => {
    if (!token?.trim()) return;
    try {
      const result = await verifyMutation.mutateAsync({ token: token.trim(), method });
      setVerifyStatus(result.result);
      setVerifiedResident(result.result !== 'invalid' ? result.resident : null);
      refetchHistory();

      const msgs = {
        valid:   'QR Code verified — Active resident.',
        expired: 'eID is expired.',
        revoked: 'eID has been revoked.',
        invalid: 'Invalid QR Code — No matching record found.',
      };
      result.result === 'valid'
        ? toast.success(msgs[result.result])
        : toast.error(msgs[result.result] ?? 'Unknown result.');
    } catch { /* toasted by hook */ }
  }, [verifyMutation, refetchHistory]);

  // Camera detected a QR
  const handleCameraDetect = useCallback((token) => {
    setCameraActive(false);
    handleVerify(token, 'qr_scan');
  }, [handleVerify]);

  // Upload QR image
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      toast.loading('Reading QR code…', { id: 'qr-read' });
      const token = await decodeQrFromFile(file);
      toast.dismiss('qr-read');
      await handleVerify(token, 'image_upload');
    } catch (err) {
      toast.dismiss('qr-read');
      toast.error(err.message ?? 'Could not read QR code from image.');
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleVerify(manualCode.trim(), 'manual_entry');
      setManualCode('');
    }
  };

  const r        = verifiedResident;
  const fullName = r ? [r.first_name, r.last_name].filter(Boolean).join(' ') : '—';
  const status   = verifyStatus ? STATUS_CONFIG[verifyStatus] ?? STATUS_CONFIG.invalid : null;

  // Last Verified: scoped to the current resident's eID entries in history
  const lastVerifiedEntry = r
    ? history.find(h => h.electronic_ids?.residents?.resident_no === r.resident_no)
    : null;

  return (
    <div className="flex h-screen bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
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

              {/* ── Left: Scan Panel ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full md:w-[650px] flex flex-col overflow-hidden">

                {/* Panel header */}
                <div className="bg-[#F1F7F2] px-6 py-3 border-b border-gray-200">
                  <h3 className="text-xl sm:text-2xl font-semibold">Scan QR Code</h3>
                </div>

                <div className="p-6 flex flex-col flex-1 gap-5">

                  {/* Camera / placeholder area */}
                  {cameraActive ? (
                    <CameraScanner
                      onDetect={handleCameraDetect}
                      onClose={() => setCameraActive(false)}
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 min-h-[180px] sm:min-h-[220px]">
                      {status ? (
                        // Show result badge in the scan area after verification
                        <div className={`flex flex-col items-center gap-2 p-6 rounded-lg border ${status.bg}`}>
                          <status.Icon className={`w-12 h-12 ${status.color}`} />
                          <span className={`text-lg font-bold tracking-widest ${status.color}`}>
                            {status.label}
                          </span>
                          {r && (
                            <span className="text-sm text-gray-600 font-medium">{fullName}</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <BsQrCode className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Scan, upload, or enter a code below</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {/* Camera scan */}
                    <button
                      type="button"
                      onClick={() => { setCameraActive((v) => !v); setVerifyStatus(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm ${
                        cameraActive
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-[#005F02] text-white hover:bg-[#004A01]'
                      }`}
                    >
                      {cameraActive ? <FiCameraOff className="w-4 h-4" /> : <FiCamera className="w-4 h-4" />}
                      {cameraActive ? 'Stop Camera' : 'Scan with Camera'}
                    </button>

                    {/* Upload QR image */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg border border-[#005F02] text-[#005F02] hover:bg-[#F1F7F2] transition-colors text-sm"
                    >
                      <FiUpload className="w-4 h-4" />
                      Upload QR Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Manual entry */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                      placeholder="Or enter QR token manually…"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]"
                    />
                    <button
                      type="button"
                      onClick={handleManualSubmit}
                      disabled={!manualCode.trim() || verifyMutation.isPending}
                      className="px-5 py-2.5 rounded-lg bg-[#005F02] text-white text-sm font-medium hover:bg-[#004A01] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {verifyMutation.isPending ? '…' : 'Verify'}
                    </button>
                  </div>

                  {/* Verification history */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Verification History</h4>
                    <div className="space-y-1 overflow-y-auto max-h-64 pr-1">
                      {history.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">No verifications yet.</p>
                      ) : history.map((item) => {
                        const res = item.electronic_ids?.residents;
                        const itemName = res
                          ? `${res.first_name} ${res.last_name}`
                          : item.electronic_ids?.eid_number ?? '—';
                        const itemNo = res?.resident_no ?? null;
                        const cfg = STATUS_CONFIG[item.result] ?? STATUS_CONFIG.invalid;
                        console.debug('Verification for resident:', itemNo); // Use it or remove it. I'll just remove it if possible. 
                        // Actually I'll just comment it out or remove the line. 
                        return (
                          <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <span className="text-sm font-medium text-gray-800 truncate max-w-[45%]">{itemName}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-gray-300 select-none">—</span>
                              <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-sm text-gray-400">{formatTime(item.verified_at)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Right: Resident Detail Panel ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full flex flex-col overflow-hidden">

                {/* Dark green header — photo overlaps the bottom edge */}
                <div className="relative bg-[#1A5C1A] flex flex-col items-center pt-8 pb-14 px-6">
                  {/* Circular profile photo — positioned to overlap header bottom */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="rounded-full border-4 border-white shadow-md overflow-hidden w-[90px] h-[90px] bg-gray-200">
                      <EIdProfile size={90} photoUrl={r?.photo_url} className="!rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Name + eID badge — sits below the overlapping photo */}
                <div className="flex flex-col items-center pt-14 pb-4 px-6 border-b border-gray-200">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                    {verifyStatus ? fullName : '—'}
                  </p>
                  {verifyStatus && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* Resident number */}
                      <span className="text-sm text-gray-500">
                        {r?.resident_no ?? '—'}
                      </span>
                      {/* Status dot + label */}
                      <span className={`flex items-center gap-1 text-sm font-semibold ${
                        verifyStatus === 'valid' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full inline-block ${
                          verifyStatus === 'valid' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {verifyStatus === 'valid' ? 'Active eID'
                          : verifyStatus === 'expired' ? 'Expired eID'
                          : verifyStatus === 'revoked' ? 'Revoked eID'
                          : 'Invalid eID'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">

                  {/* Last verified */}
                  <div className="mb-5 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">Last Verified: </span>
                      <span className="text-gray-500">
                        {lastVerifiedEntry ? formatTime(lastVerifiedEntry.verified_at) : '—'}
                      </span>
                    </p>
                  </div>

                  {/* Resident details */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resident Details</h3>
                  <div className="space-y-4 flex-1">
                    {[
                      { label: 'Full Name',      value: verifyStatus ? fullName : '—' },
                      { label: 'Address',        value: r?.address_line ?? '—' },
                      { label: 'Contact Number', value: r?.contact_number ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-sm text-gray-500 pb-2 border-b border-gray-200 mt-0.5">{value}</p>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Birthdate</p>
                        <p className="text-sm text-gray-500 pb-2 border-b border-gray-200 mt-0.5">
                          {r?.date_of_birth ? formatDate(r.date_of_birth) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Sex</p>
                        <p className="text-sm text-gray-500 pb-2 border-b border-gray-200 mt-0.5">
                          {r?.sex === 'M' ? 'Male' : r?.sex === 'F' ? 'Female' : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scan Again button */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyStatus(null);
                        setVerifiedResident(null);
                        setCameraActive(true);
                      }}
                      className="w-full bg-[#005F02] hover:bg-[#004A01] text-white font-semibold py-3 rounded-lg transition-colors text-base"
                    >
                      Scan Again
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}