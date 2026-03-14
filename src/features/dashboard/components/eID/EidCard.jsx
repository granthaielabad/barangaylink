import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { FiEdit2, FiTrash2, FiZoomIn, FiX, FiDownload } from 'react-icons/fi';
import { TbUserOff } from 'react-icons/tb';
import { EIdProfile } from '.';

// ── Shared QR canvas renderer ─────────────────────────────────
// forwardRef lets QrLightbox grab the canvas element so the
// download handler can call canvas.toDataURL() directly without
// generating a second render.
const QrCanvas = forwardRef(function QrCanvas({ token, size, onError }, ref) {
  const internalRef = useRef(null);
  const canvasRef   = ref || internalRef;

  useEffect(() => {
    if (!token || !canvasRef.current) return;
    let cancelled = false;
    import('qrcode').then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, token, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }, (err) => { if (err) onError?.(); });
    }).catch(() => onError?.());
    return () => { cancelled = true; };
  }, [token, size, onError]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded block" />;
});

// ── Card-sized QR with hover zoom indicator ───────────────────
function QrThumbnail({ token, size = 50, onExpand }) {
  const [hovered, setHovered] = useState(false);
  const [error,   setError]   = useState(false);

  if (!token || error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] text-gray-400 text-center leading-tight px-1">No QR</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="View full QR code"
      onClick={onExpand}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005F02] focus-visible:ring-offset-1"
      style={{ width: size, height: size }}
    >
      <QrCanvas token={token} size={size} onError={() => setError(true)} />

      {/* Zoom overlay */}
      <span
        aria-hidden="true"
        className={`
          absolute inset-0 flex items-center justify-center rounded
          bg-black/45 transition-opacity duration-150
          ${hovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <FiZoomIn className="w-5 h-5 text-white drop-shadow-md" />
      </span>
    </button>
  );
}

// ── Full-size QR lightbox (rendered via portal) ───────────────
function QrLightbox({ token, idNumber, name, onClose }) {
  const canvasRef = useRef(null);

  // Escape key closes
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Download the QR canvas as a PNG file
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url  = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    // Filename: "QR_BRY-2026-12345_Grant-Abad.png"
    const safeName = name.replace(/\s+/g, '-');
    link.href     = url;
    link.download = `QR_${idNumber}_${safeName}.png`;
    link.click();
  }, [idNumber, name]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-lightbox-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 w-full max-w-xs">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close QR viewer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-1">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            eID QR Code
          </p>
          <p id="qr-lightbox-title" className="text-base font-semibold text-gray-900 mt-0.5">
            {name}
          </p>
          <p className="text-sm text-gray-500">{idNumber}</p>
        </div>

        {/* QR image */}
        <div className="p-3 rounded-xl border-2 border-gray-100">
          <QrCanvas ref={canvasRef} token={token} size={240} />
        </div>

        <p className="text-xs text-gray-400 text-center">
          Scan with any QR reader to verify resident identity
        </p>

        {/* Download button */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Download QR Code
        </button>

      </div>
    </div>,
    document.body
  );
}

// ── EidCard ───────────────────────────────────────────────────
export default function EidCard({ eid, onEdit, onDeactivate, onDelete }) {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const menuRef = useRef(null);

  const openLightbox  = useCallback(() => setLightboxOpen(true),  []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  // Close action menu on outside click
  useEffect(() => {
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen]);

  if (!eid) return null;

  const { idNumber, name, address, qrToken, photoUrl } = eid;

  return (
    <>
      <article className="relative bg-white rounded-lg border border-gray-200 border-b-6 border-b-[#0F8A1C] shadow-sm py-4 flex flex-col justify-center w-full min-h-[160px] sm:min-h-[180px] sm:min-w-[370px] lg:min-h-[200px] lg:min-w-[370px] xl:min-h-[220px] xl:min-w-[400px]">

        {/* Actions menu */}
        <div ref={menuRef} className="absolute top-3 right-3 z-20">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            aria-label="More actions"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <HiOutlineDotsHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute top-7 right-0 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => { onEdit?.(eid); setMenuOpen(false); }}
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => { onDeactivate?.(eid); setMenuOpen(false); }}
              >
                <TbUserOff className="w-4 h-4" />
                <span>Deactivate eID</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => { onDelete?.(eid); setMenuOpen(false); }}
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete eID</span>
              </button>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex items-center gap-3 sm:gap-5 w-full pl-3 sm:pl-6 lg:pl-8 pr-16 sm:pr-24 lg:pr-18">
          {/* Photo */}
          <div className="shrink-0">
            <EIdProfile
              name={name}
              photoUrl={photoUrl}
              className="!w-[50px] !h-[50px] sm:!w-[60px] sm:!h-[60px] md:!w-[70px] md:!h-[70px] lg:!w-[80px] lg:!h-[80px] xl:!w-[100px] xl:!h-[100px]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-xs sm:text-sm md:text-[14px] lg:text-[14px] xl:text-[16px] leading-snug ">
              <span className="font-semibold">ID:</span> <span>{idNumber}</span>
            </p>
            <p className="text-xs sm:text-sm md:text-[14px] lg:text-[14px] xl:text-[16px] leading-snug">
              <span className="font-semibold">Name:</span> <span>{name}</span>
            </p>
            <p className="text-xs sm:text-sm md:text-[14px] lg:text-[14px] xl:text-[16px] leading-snug pr-6">
              <span className="font-semibold">Address:</span> <span>{address}</span>
            </p>
          </div>
        </div>

        {/* QR thumbnail — bottom-right */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
          <div className="hidden sm:block lg:hidden">
            <QrThumbnail token={qrToken} size={55} onExpand={openLightbox} />
          </div>
          <div className="hidden lg:block">
            <QrThumbnail token={qrToken} size={60} onExpand={openLightbox} />
          </div>
          <div className="block sm:hidden">
            <QrThumbnail token={qrToken} size={50} onExpand={openLightbox} />
          </div>
        </div>

      </article>

      {/* Lightbox portal */}
      {lightboxOpen && (
        <QrLightbox
          token={qrToken}
          idNumber={idNumber}
          name={name}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}