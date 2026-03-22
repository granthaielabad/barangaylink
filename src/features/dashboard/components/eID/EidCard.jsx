import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { FiEdit2, FiTrash2, FiZoomIn, FiX, FiDownload, FiUser } from 'react-icons/fi';
import { TbUserOff } from 'react-icons/tb';

// ── QR canvas ─────────────────────────────────────────────────────────────────
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
  }, [token, size, onError]);
  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
});

// ── QR lightbox ───────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 w-full max-w-xs">
        <button type="button" onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <FiX className="w-5 h-5" />
        </button>
        <div className="text-center pt-1">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">BarangayLink eID</p>
          <p className="text-base font-semibold text-gray-900 mt-0.5">{name}</p>
          <p className="text-sm text-gray-500">{idNumber}</p>
        </div>
        <div className="p-3 rounded-xl border-2 border-gray-100">
          <QrCanvas ref={canvasRef} token={token} size={240} />
        </div>
        <p className="text-xs text-gray-400 text-center">Scan to verify resident identity</p>
        <button type="button" onClick={handleDownload}
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors">
          <FiDownload className="w-4 h-4" /> Download QR Code
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive:  'bg-gray-100    text-gray-500    border-gray-200',
  Suspended: 'bg-amber-100   text-amber-700   border-amber-200',
  Revoked:   'bg-red-100     text-red-600     border-red-200',
  Expired:   'bg-gray-100    text-gray-500    border-gray-200',
};

// ── Main card ─────────────────────────────────────────────────────────────────
export default function EidCard({ eid, onEdit, onDeactivate, onDelete }) {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const menuRef = useRef(null);

  const openLightbox  = useCallback(() => setLightboxOpen(true),  []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen]);

  if (!eid) return null;

  const { idNumber, name, address, qrToken, photoUrl,
          sex, dateOfBirth, bloodType, civilStatus, issuedAt, expiresAt, status } = eid;

  const statusCls = STATUS_CFG[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';

  return (
    <>
      {/* Card — max-width constrains it to physical ID proportions */}
      <div className="w-full max-w-[520px] mx-auto rounded-xl overflow-hidden shadow-md border border-gray-200"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

        {/* Green top bar + admin controls overlaid */}
        <div className="relative h-8 bg-[#005F02] flex items-center px-3 gap-2">
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {status}
          </span>

          {/* Action menu */}
          <div ref={menuRef} className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => setMenuOpen((o) => !o)}
              className="text-white/70 hover:text-white p-1 rounded transition-colors" aria-label="More actions">
              <HiOutlineDotsHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute top-8 right-2 w-44 rounded-lg border border-gray-200 bg-white shadow-xl py-1.5 z-30">
                <button type="button" onClick={() => { onEdit?.(eid); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                  <FiEdit2 className="w-3.5 h-3.5" /> Edit Details
                </button>
                <button type="button" onClick={() => { onDeactivate?.(eid); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                  <TbUserOff className="w-3.5 h-3.5" /> Deactivate eID
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button type="button" onClick={() => { onDelete?.(eid); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                  <FiTrash2 className="w-3.5 h-3.5" /> Delete eID
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="bg-white p-4 flex gap-4">

          {/* Photo */}
          <div className="shrink-0 w-24 flex flex-col justify-between">
            <div className="w-24 h-28 rounded bg-gray-200 border border-gray-300 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={`Photo of ${name}`} className="w-full h-full object-cover" draggable={false} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">ID Number</p>
              <p className="text-sm font-black text-gray-900 font-mono">{idNumber}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Name</p>
              <p className="text-sm font-bold text-gray-900">{name}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Address</p>
              <p className="text-xs text-gray-700 truncate">{address}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-0.5">
              {[
                ['Date of Birth', fmt(dateOfBirth)],
                ['Blood Type',    bloodType || '—'],
                ['Civil Status',  civilStatus ? civilStatus.charAt(0).toUpperCase() + civilStatus.slice(1) : '—'],
                ['Date Issued',   fmt(issuedAt)],
                ['Valid Until',   fmt(expiresAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider leading-none">{label}</p>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* QR */}
          <div className="shrink-0 flex flex-col items-end justify-start">
            <button type="button" onClick={openLightbox}
              className="relative group cursor-zoom-in focus:outline-none"
              style={{ width: 72, height: 72 }} aria-label="Expand QR Code">
              <QrCanvas token={qrToken} size={72} />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <FiZoomIn className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>
        </div>

        {/* Green bottom bar */}
        <div className="h-2 bg-[#005F02]" />
      </div>

      {lightboxOpen && (
        <QrLightbox token={qrToken} idNumber={idNumber} name={name} onClose={closeLightbox} />
      )}
    </>
  );
}