import { useState, useEffect, useRef } from 'react';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { TbUserOff } from 'react-icons/tb';
import { EIdProfile } from '.';

// ── QR renderer ───────────────────────────────────────────────
// Generates a QR code image from a raw token string using the
// `qrcode` npm package. Falls back to a placeholder if the
// library isn't loaded or the token is empty.
function QrCode({ token, size = 72 }) {
  const canvasRef = useRef(null);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!token || !canvasRef.current) return;
    let cancelled = false;

    import('qrcode').then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, token, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }, (err) => {
        if (err) setError(true);
      });
    }).catch(() => setError(true));

    return () => { cancelled = true; };
  }, [token, size]);

  if (!token || error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
        style={{ width: size, height: size }}
      >
        <span className="text-[8px] text-gray-400 text-center leading-tight px-1">
          No QR
        </span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded"
      aria-label="eID QR Code"
    />
  );
}

// ── EidCard ───────────────────────────────────────────────────
export default function EidCard({ eid, onEdit, onDeactivate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  if (!eid) return null;

  const { idNumber, name, address, qrToken, photoUrl } = eid;

  return (
    <article className="relative bg-white rounded-sm border border-gray-200 border-b-6 border-b-[#0F8A1C] shadow-sm px-4 py-4 flex items-center justify-center w-full min-h-[160px] sm:min-h-[200px] lg:min-h-[250px]">

      {/* ── Actions menu ── */}
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

      {/* ── Card body ── */}
      <div className="flex items-center gap-3 pl-3 sm:pl-8 lg:pl-10 w-full pr-10">

        {/* Profile photo */}
        <div className="shrink-0">
          <EIdProfile
            name={name}
            photoUrl={photoUrl}
            className="!w-[60px] !h-[60px] sm:!w-[90px] sm:!h-[90px]"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-sm sm:text-base text-gray-800 truncate">
            <span className="font-semibold">ID:</span>{' '}
            <span>{idNumber}</span>
          </p>
          <p className="text-sm sm:text-base text-gray-800 truncate">
            <span className="font-semibold">Name:</span>{' '}
            <span>{name}</span>
          </p>
          <p className="text-sm sm:text-base text-gray-800 truncate">
            <span className="font-semibold">Address:</span>{' '}
            <span>{address}</span>
          </p>
        </div>
      </div>

      {/* ── QR code — bottom-right corner ── */}
      <div className="absolute bottom-3 right-3">
        <QrCode
          token={qrToken}
          size={72}
        />
      </div>

    </article>
  );
}