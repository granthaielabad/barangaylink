import { forwardRef, useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';

const QrCanvas = ({ token, size }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!token) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(token, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(url => setDataUrl(url));
    });
  }, [token, size]);

  if (!dataUrl) return <div style={{ width: size, height: size }} className="bg-gray-50 animate-pulse rounded" />;
  
  return (
    <img 
      src={dataUrl} 
      alt="QR Code" 
      width={size} 
      height={size} 
      className="block" 
    />
  );
};

// ── Common Helpers ────────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

// ── Printable eID Card Component ──────────────────────────────────────────────
const PrintableEidCard = forwardRef(({ eid }, ref) => {
  const { idNumber = '', name = '', address = '', qrToken = '', photoUrl = '',
          dateOfBirth = null, bloodType = '', civilStatus = '', issuedAt = null, expiresAt = null } = eid || {};

  return (
    <div ref={ref} className="print-container flex flex-col gap-10">
      
      {/* FRONT SIDE */}
      <div className="w-[520px] h-[320px] relative overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm font-sans">
        {/* Background Pattern / Watermark Placeholder */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <div className="text-[120px] font-bold -rotate-45 whitespace-nowrap">BARANGAY LINK</div>
        </div>

        {/* Header Section */}
        <div className="h-16 bg-[#005F02] flex items-center px-5 gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="text-[#005F02] font-black text-xs">LOGO</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-[14px] leading-tight tracking-wide uppercase">Republic of the Philippines</h1>
            <p className="text-white/90 text-[10px] uppercase font-semibold">Province • Municipality • Barangay</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest">Resident ID</p>
            <p className="text-white font-mono font-bold text-[12px]">{idNumber}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex gap-5">
          {/* Photo Column */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-28 h-32 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            <div className="w-full h-4 bg-[#005F02]/10 rounded flex items-center justify-center px-2">
               <span className="text-[7px] text-[#005F02] font-black uppercase tracking-tighter italic">Verified Member</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Full Name</p>
                <p className="text-[16px] font-black text-gray-900 leading-tight truncate">{name}</p>
              </div>
              
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Permanent Address</p>
                <p className="text-[10px] text-gray-700 font-semibold leading-relaxed line-clamp-2 uppercase">{address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-2 pt-2 border-t border-gray-100">
               {[
                 ['D.O.B.', fmt(dateOfBirth)],
                 ['Blood', bloodType || 'N/A'],
                 ['Status', civilStatus || 'N/A'],
                 ['Issued', fmt(issuedAt)],
                 ['Expiry', fmt(expiresAt)]
               ].map(([label, val], idx) => (
                 <div key={label} className={idx === 0 ? 'col-span-1' : ''}>
                   <p className="text-[7px] text-gray-400 font-black uppercase tracking-tighter leading-none mb-0.5">{label}</p>
                   <p className="text-[10px] text-gray-800 font-bold leading-none uppercase">{val}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* QR Side */}
          <div className="shrink-0 flex flex-col items-end justify-between">
            <div className="p-1 border border-gray-200 rounded-lg bg-white shadow-sm">
               <QrCanvas token={qrToken} size={70} />
            </div>
            <div className="text-right">
              <p className="text-[7px] font-bold text-gray-400 mb-0.5">VERIFY VIA</p>
              <p className="text-[9px] font-black text-[#005F02] tracking-tighter italic">BarangayLink HMS</p>
            </div>
          </div>
        </div>
        
        {/* Security Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 flex">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-blue-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>

      {/* BACK SIDE */}
      <div className="w-[520px] h-[320px] relative overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm font-sans flex flex-col">
        {/* Watermark */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <div className="text-[80px] font-bold rotate-12 text-center leading-none">OFFICIAL SEAL<br/>BARANGAY ID</div>
        </div>

        <div className="p-8 flex-1 flex flex-col justify-between">
          <div className="text-center space-y-4">
            <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] underline decoration-[#005F02]/30 underline-offset-4">Terms & Conditions</h3>
            <div className="space-y-3 text-left text-[10px] text-gray-600 leading-relaxed italic px-2">
              <p>1. This card is the official property of the issuing Barangay and must be surrendered upon expiration or revocation.</p>
              <p>2. It serves as primary identification for all transactions and access to social services within the jurisdiction.</p>
              <p>3. Possession of this card does not confer any special privileges other than those established by law.</p>
              <p>4. If found, please return to any Barangay Hall or police station immediately.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mt-6 px-4">
            <div className="text-center group">
              <div className="h-12 flex items-center justify-center">
                {/* Signature Placeholder */}
              </div>
              <div className="border-b border-gray-900 pb-1 mb-1"></div>
              <p className="text-[9px] font-black text-gray-900 uppercase tracking-tighter">Resident Signature</p>
            </div>

            <div className="text-center">
              <div className="h-12 flex flex-col items-center justify-center">
                <p className="text-[11px] font-black text-gray-900 uppercase leading-none">Hon. Maria S. Dela Cruz</p>
              </div>
              <div className="border-b border-gray-900 pb-1 mb-1"></div>
              <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">Punong Barangay</p>
              <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Term: 2023-2026</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 h-10 border-t border-gray-100 px-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Card ID: {idNumber.slice(-8)}</p>
          </div>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">www.barangaylink.gov.ph</p>
        </div>
      </div>

    </div>
  );
});

PrintableEidCard.displayName = 'PrintableEidCard';

export default PrintableEidCard;
