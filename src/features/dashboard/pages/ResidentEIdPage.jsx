
import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiUser, FiCreditCard, FiDownload, FiZoomIn, FiX,
  FiShield, FiAlertCircle,
} from 'react-icons/fi';
import { useMyEid } from '../../../hooks/queries/resident/useResidentPortal';

// ─── Helpers ────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function fullNameLastFirst(r) {
  if (!r) return '—';
  return [r.last_name, r.first_name, r.middle_name ? r.middle_name[0] + '.' : '', r.suffix]
    .filter(Boolean).join(' ') || '—';
}

// ─── QR Canvas ───────────────────────────────────────────────
const QrCanvas = forwardRef(function QrCanvas({ token, size, onError }, ref) {
  const internalRef = useRef(null);
  const canvasRef = ref || internalRef;
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
  }, [token, size, onError]);
  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
});

// ─── QR Lightbox ─────────────────────────────────────────────
function QrLightbox({ token, idNumber, name, onClose }) {
  const canvasRef = useRef(null);

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
    link.download = `QR_${idNumber}_${name.replace(/\s+/g, '-')}.png`;
    link.click();
  }, [idNumber, name]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 w-full max-w-xs">
        <button type="button" onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <FiX className="w-5 h-5" />
        </button>
        <div className="text-center pt-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">BarangayLink eID</p>
          <p className="text-base font-semibold text-gray-900 mt-0.5">{name}</p>
          <p className="text-sm text-gray-500 font-mono">{idNumber}</p>
        </div>
        <div className="p-3 rounded-xl border-2 border-gray-100">
          <QrCanvas ref={canvasRef} token={token} size={240} />
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

// Not Linked Notice
function NotLinked({ message }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
      <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Not yet available</p>
        <p className="text-xs text-amber-700 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

// Status colors
const STATUS_COLOR = {
  Active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  Suspended: 'bg-amber-100 text-amber-700 border-amber-200',
  Revoked:   'bg-red-100 text-red-600 border-red-200',
  Expired:   'bg-gray-100 text-gray-500 border-gray-200',
};

// MAIN PAGE
export default function ResidentEIdPage() {
  const [qrOpen, setQrOpen] = useState(false);
  const { data: eid, isLoading } = useMyEid();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-[3px] border-[#005F02] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!eid) {
    return (
      <NotLinked message="No electronic ID has been issued for your account yet. Please visit the Barangay Office to request issuance of your eID." />
    );
  }

  const card = {
    idNumber:    eid.eid_number,
    qrToken:     eid.qr_token,
    name:        fullNameLastFirst(eid.residents),
    photoUrl:    eid.residents?.photo_url,
    sex:         eid.residents?.sex
      ? eid.residents.sex.charAt(0).toUpperCase() + eid.residents.sex.slice(1)
      : '—',
    dateOfBirth: eid.residents?.date_of_birth,
    bloodType:   eid.residents?.blood_type,
    civilStatus: eid.residents?.civil_status
      ? eid.residents.civil_status.charAt(0).toUpperCase() + eid.residents.civil_status.slice(1)
      : '—',
    address:     eid.residents?.address_line,
    issuedAt:    eid.issued_at,
    expiresAt:   eid.expires_at,
    status:      eid.status
      ? eid.status.charAt(0).toUpperCase() + eid.status.slice(1)
      : 'Active',
    purok:       eid.residents?.puroks?.name,
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Status banner */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold ${STATUS_COLOR[card.status] ?? STATUS_COLOR.Expired}`}>
          <FiShield className="w-4 h-4 shrink-0" />
          eID Status: {card.status}
          <span className="ml-auto text-xs font-normal opacity-70">
            Valid Until: {fmtShort(card.expiresAt)}
          </span>
        </div>

        {/* Card preview — credit-card aspect ratio */}
        <div
          className="relative overflow-hidden rounded-xl shadow-lg w-full mx-auto bg-white border border-gray-200"
          style={{ aspectRatio: '85.6 / 53.98', maxWidth: '480px', fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          {/* Green top accent */}
          <div className="absolute top-0 left-0 right-0 h-[12%] bg-[#005F02] z-10 flex items-center px-3 gap-2">
            <FiCreditCard className="text-white w-3 h-3" />
            <p className="text-[7px] font-black text-white tracking-[0.25em] uppercase">BarangayLink Resident ID</p>
          </div>

          {/* Body */}
          <div className="absolute z-10 flex gap-2 px-3" style={{ top: '14%', left: 0, right: 0, bottom: '14%' }}>
            {/* Photo col */}
            <div className="shrink-0 flex flex-col justify-between" style={{ width: '20%' }}>
              <div className="rounded overflow-hidden border-[1.5px] border-white shadow bg-gray-200 w-full" style={{ aspectRatio: '3/4' }}>
                {card.photoUrl ? (
                  <img src={card.photoUrl} alt="ID Photo" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FiUser className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="border-t border-gray-400/50 pt-0.5">
                <p className="text-[5px] text-gray-500 text-center">Cardholder Signature</p>
              </div>
            </div>

            {/* Details col */}
            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
              <div>
                <p className="text-[5px] text-gray-400 leading-none mb-0.5 uppercase tracking-wide">Last Name, First Name, M.I.</p>
                <p className="font-black text-gray-900 uppercase leading-tight truncate" style={{ fontSize: 'clamp(7.5px, 2vw, 12px)' }}>
                  {card.name}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-x-1">
                {[['Sex', card.sex], ['Date of Birth', fmtShort(card.dateOfBirth)], ['Civil Status', card.civilStatus]].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[5px] text-gray-400 uppercase tracking-wide leading-none">{l}</p>
                    <p className="font-bold text-gray-900 leading-tight" style={{ fontSize: 'clamp(6px, 1.5vw, 9px)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-x-1">
                {[['Blood Type', card.bloodType || '—'], ['Date Issued', fmtShort(card.issuedAt)], ['Valid Until', fmtShort(card.expiresAt)]].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[5px] text-gray-400 uppercase tracking-wide leading-none">{l}</p>
                    <p className="font-bold text-gray-900 leading-tight" style={{ fontSize: 'clamp(6px, 1.5vw, 9px)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <p className="font-semibold text-gray-800 uppercase leading-tight" style={{ fontSize: 'clamp(5.5px, 1.3vw, 8px)' }}>
                {card.address}
              </p>
              <p className="font-black text-gray-700 tracking-widest border-t border-gray-200/80 pt-0.5"
                style={{ fontSize: 'clamp(6px, 1.4vw, 9px)', fontFamily: 'monospace' }}>
                {card.idNumber}
              </p>
            </div>

            {/* QR col */}
            <div className="shrink-0 flex flex-col items-center justify-end" style={{ width: '17%' }}>
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="relative cursor-zoom-in focus:outline-none group"
                style={{ width: 60, height: 60 }}
                aria-label="Expand QR Code"
              >
                <QrCanvas token={card.qrToken} size={60} />
                <span className="absolute inset-0 flex items-center justify-center rounded bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiZoomIn className="w-5 h-5 text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* Footer strip */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-0.5 border-t border-gray-100 bg-gray-50">
            <p className="text-[7px] font-black text-[#005F02] tracking-[0.3em] uppercase">Resident</p>
            <p className="text-[5px] text-gray-400 uppercase tracking-wider">San Bartolome · Novaliches · Quezon City</p>
          </div>
        </div>

        {/* Detail chips row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'ID Number',   value: card.idNumber,           mono: true },
            { label: 'Date Issued', value: fmt(card.issuedAt) },
            { label: 'Valid Until', value: fmt(card.expiresAt) },
            { label: 'Purok',       value: card.purok || '—' },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-sm font-semibold text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <FiShield className="w-3.5 h-3.5" />
          Your eID QR code is unique and can be scanned by authorized Barangay staff to verify your identity.
        </p>
      </div>

      {/* QR Lightbox */}
      {qrOpen && (
        <QrLightbox
          token={card.qrToken}
          idNumber={card.idNumber}
          name={card.name}
          onClose={() => setQrOpen(false)}
        />
      )}
    </div>
  );
}
