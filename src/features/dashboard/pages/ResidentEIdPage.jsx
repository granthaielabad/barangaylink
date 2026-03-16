import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiUser, FiCreditCard, FiDownload, FiZoomIn, FiX, FiXCircle,
  FiAlertCircle, FiCheckCircle, FiClock, FiRefreshCw, FiPlus,
  FiMapPin, FiPhone, FiMail, FiCalendar, FiCamera,
} from 'react-icons/fi';
import { LuClipboardList } from 'react-icons/lu';
import {
  useMyEid,
  useMyEidApplication,
  useMyResidentProfile,
  useSubmitEidApplication,
  useSubmitEidRenewal,
} from '../../../hooks/queries/resident/useResidentPortal';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

function fmtLong(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fullNameDisplay(r) {
  if (!r) return '—';
  return [r.first_name, r.middle_name, r.last_name, r.suffix].filter(Boolean).join(' ') || '—';
}

// ─── QR Canvas ───────────────────────────────────────────────────────────────
const QrCanvas = forwardRef(function QrCanvas({ token, size, onError }, ref) {
  const internalRef = useRef(null);
  const canvasRef   = ref || internalRef;
  useEffect(() => {
    if (!token || !canvasRef.current) return;
    let cancelled = false;
    import('qrcode').then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, token, {
        width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' },
      }, (err) => { if (err) onError?.(); });
    }).catch(() => onError?.());
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, size]);
  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
});

// ─── Apply for eID Modal ─────────────────────────────────────────────────────
// Matches the admin "Create New eID" modal design exactly.
// All fields are read-only from resident profile. Only photo is interactable.
function ApplyModal({ resident, onClose, onSubmit, isPending }) {
  const [photoPreview, setPhotoPreview] = useState(resident?.photo_url ?? null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File size must be under 2MB.'); return; }
    if (!['image/png', 'image/jpeg'].includes(file.type)) { alert('Only PNG and JPG files are supported.'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Locked field styles (identical to admin EidForms) ──
  const lockedWrap  = 'flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50';
  const lockedIcon  = 'bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-200 text-gray-400';
  const lockedText  = 'flex-1 px-4 py-2.5 bg-gray-50 text-gray-500 text-base cursor-not-allowed select-none';

  const LockedField = ({ label, icon: Icon, value: v }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className={lockedWrap}>
        {Icon && <div className={lockedIcon}><Icon className="w-5 h-5" /></div>}
        <span className={lockedText}>{v || '—'}</span>
      </div>
    </div>
  );

  const sex = resident?.sex === 'M' ? 'Male' : resident?.sex === 'F' ? 'Female' : resident?.sex ?? '';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      first_name:     resident?.first_name,
      middle_name:    resident?.middle_name,
      last_name:      resident?.last_name,
      suffix:         resident?.suffix,
      date_of_birth:  resident?.date_of_birth,
      sex:            resident?.sex,
      address_line:   resident?.address_line,
      contact_number: resident?.contact_number,
      email:          resident?.email,
      id_number:      resident?.id_number,
      photo_url:      photoPreview,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header — matches admin modal exactly */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#F1F7F2] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#005F02]">
              <FiPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Apply for eID</h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">

              {/* Left: Photo upload — the ONLY interactive element */}
              <div className="flex flex-col items-center sm:m-5 shrink-0 sm:w-40">
                <div className="relative">
                  <div className="w-[140px] h-[170px] rounded-lg bg-gray-100 border border-gray-300 overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="ID Photo" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-14 h-14 text-gray-300" />
                    )}
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-[#005F02] hover:bg-[#004A01] text-white p-2 rounded-lg shadow-md transition-colors"
                    title="Upload photo">
                    <FiCamera className="w-4 h-4" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg"
                    onChange={handlePhoto} className="hidden" />
                </div>
                <p className="mt-2 text-xs text-gray-400 text-center">We support PNGs and JPGs under 2MB</p>
              </div>

              {/* Right: Name fields — all locked */}
              <div className="flex-1 space-y-4">
                {/* ID Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Number:</label>
                  <div className={lockedWrap}>
                    <span className={lockedText}>{resident?.id_number || '—'}</span>
                  </div>
                </div>

                {/* Last + First */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name:</label>
                    <div className={lockedWrap}><span className={lockedText}>{resident?.last_name || '—'}</span></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name:</label>
                    <div className={lockedWrap}><span className={lockedText}>{resident?.first_name || '—'}</span></div>
                  </div>
                </div>

                {/* Middle + Suffix */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name:</label>
                    <div className={lockedWrap}><span className={lockedText}>{resident?.middle_name || '—'}</span></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Suffix:</label>
                    <div className={lockedWrap}><span className={lockedText}>{resident?.suffix || '—'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom locked fields */}
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <LockedField label="Birthdate:" icon={FiCalendar} value={fmt(resident?.date_of_birth)} />
                <LockedField label="Sex:" icon={FiUser} value={sex} />
              </div>
              <LockedField label="Address:" icon={FiMapPin} value={resident?.address_line} />
              <LockedField label="Contact Number:" icon={FiPhone} value={resident?.contact_number} />
              <LockedField label="Email Address:" icon={FiMail} value={resident?.email} />
            </div>
          </div>

          {/* Footer — matches admin modal exactly */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {isPending ? 'Submitting…' : 'Apply for eID'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── Renew eID Modal ─────────────────────────────────────────────────────────
function RenewModal({ eid, onClose, onSubmit, isPending }) {
  const [address,   setAddress]   = useState(eid?.residents?.address_line ?? '');
  const [contact,   setContact]   = useState(eid?.residents?.contact_number ?? '');
  const [certified, setCertified] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/40 focus:border-[#005F02]';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <FiRefreshCw className="w-5 h-5 text-[#005F02]" />
          <h2 className="font-bold text-gray-900 text-base">Renew eID</h2>
          <button type="button" onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <FiAlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-800">Renewal Information</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Your eID renewal will extend your validity for another 3 years from the renewal date.
                Please verify and update your information below.
              </p>
            </div>
          </div>

          {/* Current info */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-1 text-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Information</p>
            <div className="flex justify-between"><span className="text-gray-500">eID Number:</span><span className="font-medium">{eid?.eid_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{fullNameDisplay(eid?.residents)}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">Expiration Date:</span>
              <span className="font-semibold text-red-600">{fmt(eid?.expires_at)}</span>
            </div>
          </div>

          {/* Update fields */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-3">Verify / Update Information</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Address <span className="text-red-500">*</span></label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact No. <span className="text-red-500">*</span></label>
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className={inputCls} required />
              </div>
            </div>
          </div>

          {/* Certification checkbox */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={certified} onChange={(e) => setCertified(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#005F02]" />
            <span className="text-xs text-gray-600">
              I certify that the information provided is accurate and complete. I understand that providing false information may result in the cancellation of my eID.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => onSubmit({ address_line: address, contact_number: contact })}
            disabled={isPending || !address || !contact || !certified}
            className="px-5 py-2 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isPending ? 'Submitting…' : 'Renew eID'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── eID Card ─────────────────────────────────────────────────────────────────
function EidCard({ eid, onZoomQr, isInactive = false }) {
  const r = eid.residents;
  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden shadow-md ${isInactive ? 'opacity-60 grayscale' : ''}`}
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Green top bar */}
      <div className="h-4 bg-[#005F02]" />

      {/* Card body */}
      <div className="bg-white p-4 flex gap-4">
        {/* Photo */}
        <div className="shrink-0 w-24 flex flex-col justify-between">
          <div className="w-24 h-28 rounded bg-gray-200 border border-gray-300 overflow-hidden">
            {r?.photo_url ? (
              <img src={r.photo_url} alt="ID Photo" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiUser className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">ID Number</p>
            <p className="text-base font-black text-gray-900 font-mono">{eid.eid_number}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Name</p>
            <p className="text-sm font-bold text-gray-900">{fullNameDisplay(r)}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Address</p>
            <p className="text-xs text-gray-700">{r?.address_line ?? '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
            {[
              ['Date of Birth', fmt(r?.date_of_birth)],
              ['Blood Type',   r?.blood_type || '—'],
              ['Civil Status', r?.civil_status ? r.civil_status.charAt(0).toUpperCase() + r.civil_status.slice(1) : '—'],
              ['Date Issued',  fmt(eid.issued_at)],
              ['Valid Until',  fmt(eid.expires_at)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[8px] text-gray-400 uppercase tracking-wider leading-none">{label}</p>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QR */}
        <div className="shrink-0 flex flex-col items-end justify-between">
          <button type="button" onClick={onZoomQr}
            className="relative group cursor-zoom-in focus:outline-none" style={{ width: 72, height: 72 }}
            aria-label="Expand QR Code">
            <QrCanvas token={eid.qr_token} size={72} />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <FiZoomIn className="w-4 h-4 text-white" />
            </span>
          </button>
        </div>
      </div>

      {/* Green bottom bar */}
      <div className="h-2 bg-[#005F02]" />
    </div>
  );
}

// ─── QR Lightbox ─────────────────────────────────────────────────────────────
function QrLightbox({ eid, onClose }) {
  const canvasRef = useRef(null);
  const name = fullNameDisplay(eid?.residents);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href     = canvas.toDataURL('image/png');
    link.download = `QR_${eid.eid_number}_${name.replace(/\s+/g, '-')}.png`;
    link.click();
  }, [eid, name]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 w-full max-w-xs">
        <button type="button" onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <FiX className="w-5 h-5" />
        </button>
        <div className="text-center pt-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">BarangayLink eID</p>
          <p className="text-base font-semibold text-gray-900 mt-0.5">{name}</p>
          <p className="text-sm text-gray-500 font-mono">{eid.eid_number}</p>
        </div>
        <div className="p-3 rounded-xl border-2 border-gray-100">
          <QrCanvas ref={canvasRef} token={eid.qr_token} size={240} />
        </div>
        <p className="text-xs text-gray-400 text-center">Present this QR code for identity verification</p>
        <button type="button" onClick={handleDownload}
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors">
          <FiDownload className="w-4 h-4" /> Download QR Code
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Progress Tracker ────────────────────────────────────────────────────────
const PROGRESS_STEPS = [
  { key: 'submitted',    label: 'Application Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved',     label: 'Approval Pending' },
  { key: 'generated',    label: 'eID Generation' },
];

const STATUS_TO_COMPLETED = {
  pending:      1,
  under_review: 2,
  approved:     3,
  rejected:     1,
};

function ProgressTracker({ status, eidIssued = false }) {
  const completedUpTo = eidIssued ? 4 : (STATUS_TO_COMPLETED[status] ?? 1);
  const isRejected    = status === 'rejected';

  return (
    <div className="space-y-3 mt-4">
      {PROGRESS_STEPS.map((step, i) => {
        const done    = i < completedUpTo;
        const current = i === completedUpTo && !isRejected;
        return (
          <div key={step.key} className="flex items-center gap-3">
            {done ? (
              <FiCheckCircle className="w-5 h-5 text-[#005F02] shrink-0" />
            ) : current ? (
              <FiClock className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />
            ) : (
              <span className="w-5 h-5 rounded-full border-2 border-gray-300 bg-gray-100 shrink-0 inline-block" />
            )}
            <span className={`text-sm ${done ? 'text-gray-800 font-medium' : current ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResidentEIdPage() {
  const [applyOpen,  setApplyOpen]  = useState(false);
  const [renewOpen,  setRenewOpen]  = useState(false);
  const [qrOpen,     setQrOpen]     = useState(false);

  const { data: eid,         isLoading: loadingEid } = useMyEid();
  const { data: application, isLoading: loadingApp } = useMyEidApplication();
  const { data: resident                            } = useMyResidentProfile();

  const { mutate: submitApp,   isPending: submittingApp   } = useSubmitEidApplication();
  const { mutate: submitRenew, isPending: submittingRenew } = useSubmitEidRenewal();

  const isLoading = loadingEid || loadingApp;

  const hasActiveEid   = !!eid && eid.status === 'active';
  const hasInactiveEid = !!eid && eid.status !== 'active';
  const hasPending     = !eid && !!application;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-[3px] border-[#005F02] border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── STATE 2: Application submitted / in-progress / rejected ─────────────────
  if (hasPending) {
    const isRejected = application.status === 'rejected';
    return (
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* Status banner — frontend dev's design, extended for rejected state */}
        {isRejected ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <FiXCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-red-700 text-[20px]">Application Rejected</p>
              <p className="text-base text-red-600 mt-0.5 leading-relaxed">
                Your eID application was not approved. Please contact the Barangay Office for assistance or submit a new application.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-[#F2C96B] rounded-xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <FiClock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-[#B45309] text-[20px]">Application Pending</p>
              <p className="text-base text-[#C2410C] mt-0.5 leading-relaxed">
                Your eID application is currently being processed. You will be notified once your application has been reviewed and approved.
              </p>
            </div>
          </div>
        )}

        {/* Application details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-[#005F02]/10 flex items-center justify-center">
              <LuClipboardList className="w-5 h-5 text-[#005F02]" />
            </div>
            <h2 className="font-semibold text-gray-900 text-[24px]">Application Details</h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Application Number:</span>
              <span className="font-semibold font-mono">{application.id?.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Submitted on:</span>
              <span className="font-semibold">{fmtLong(application.submitted_at)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Estimated processing:</span>
              <span className="font-semibold">3-5 business days</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-2">Application Progress</p>
            <ProgressTracker status={application.status} eidIssued={false} />
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center space-y-3">
          <p className="text-sm text-gray-500">
            For inquiries about your application, please contact the barangay office.
          </p>
          {isRejected && (
            <button type="button" onClick={() => setApplyOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] transition-colors">
              <FiPlus className="w-4 h-4" /> Submit New Application
            </button>
          )}
        </div>

        {applyOpen && (
          <ApplyModal
            resident={resident}
            onClose={() => setApplyOpen(false)}
            onSubmit={(payload) => { submitApp(payload); setApplyOpen(false); }}
            isPending={submittingApp}
          />
        )}
      </div>
    );
  }

  // ── STATE 3 & 4: Has eID (active or inactive) ────────────────────────────────
  if (eid) {
    const isActive  = eid.status === 'active';
    const statusCfg = isActive
      ? { label: 'eID Active',   desc: 'Your Barangay Electronic ID is active and verified. You can use this for barangay transactions and services.', bg: 'bg-green-50 border-green-200', icon: <FiCheckCircle className="w-5 h-5 text-green-600" />, iconBg: 'bg-green-100', textColor: 'text-green-700' }
      : { label: 'eID Inactive', desc: `Your eID is currently ${eid.status}. Please renew or contact the Barangay Office for assistance.`, bg: 'bg-amber-50 border-amber-200', icon: <FiAlertCircle className="w-5 h-5 text-amber-500" />, iconBg: 'bg-amber-100', textColor: 'text-amber-700' };

    return (
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Status banner */}
        <div className={`rounded-xl border p-5 flex gap-4 items-start ${statusCfg.bg}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusCfg.iconBg}`}>
            {statusCfg.icon}
          </div>
          <div>
            <p className={`font-bold text-lg ${statusCfg.textColor}`}>{statusCfg.label}</p>
            <p className={`text-sm mt-0.5 ${statusCfg.textColor} opacity-90`}>{statusCfg.desc}</p>
          </div>
        </div>

        {/* Card section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-center text-lg mb-5">Your Electronic ID</h2>
          <EidCard eid={eid} onZoomQr={() => setQrOpen(true)} isInactive={!isActive} />

          {/* Action buttons */}
          <div className="flex justify-center gap-3 mt-5">
            <button type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
              <FiDownload className="w-4 h-4" /> Download
            </button>
            <button type="button" onClick={() => setRenewOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] transition-colors">
              <FiRefreshCw className="w-4 h-4" /> Renew eID
            </button>
          </div>
        </div>

        {/* Important notes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="font-semibold text-gray-800 mb-3">Important Notes</p>
          <ul className="space-y-2">
            {[
              'Keep your eID information confidential.',
              'Renew before expiration date.',
              'Contact the barangay office to update your information if there are any changes.',
            ].map((note) => (
              <li key={note} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        {renewOpen && (
          <RenewModal
            eid={eid}
            onClose={() => setRenewOpen(false)}
            onSubmit={(payload) => { submitRenew(payload); setRenewOpen(false); }}
            isPending={submittingRenew}
          />
        )}
        {qrOpen && <QrLightbox eid={eid} onClose={() => setQrOpen(false)} />}
      </div>
    );
  }

  // ── STATE 1: No eID, no application ─────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* No eID info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <FiAlertCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-blue-800 text-[20px]">No eID Found</p>
          <p className="text-base text-blue-700 mt-0.5 leading-relaxed">
            You haven't applied for a Barangay Electronic ID yet. An eID provides you with official identification within the barangay and allows you to access various barangay services more conveniently.
          </p>
          <ul className="mt-2 space-y-1">
            {[
              'Faster verification for barangay transactions',
              'Digital record of your residency',
              'QR code for quick authentication',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-blue-700">
                <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Apply CTA card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FiCreditCard className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Apply for Barangay eID</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Complete the application form to get your electronic identification card. Processing typically takes 3-5 business days.
        </p>
        <button type="button" onClick={() => setApplyOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] transition-colors">
          <FiCreditCard className="w-4 h-4" /> Apply for eID
        </button>
      </div>

      {applyOpen && (
        <ApplyModal
          resident={resident}
          onClose={() => setApplyOpen(false)}
          onSubmit={(payload) => { submitApp(payload); setApplyOpen(false); }}
          isPending={submittingApp}
        />
      )}
    </div>
  );
}