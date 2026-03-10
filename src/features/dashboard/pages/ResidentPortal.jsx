// src/features/dashboard/pages/ResidentPortal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Self-service portal for Residents.
// Three sections:  My Profile · My eID · My Household
// Formal, government-registry aesthetic — clean, readable, trustworthy.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useAuthStore } from '../../../store/authStore';
import { signOut } from '../../../services/supabase/authService';
import {
  useMyResidentProfile,
  useMyEid,
  useMyHousehold,
} from '../../../hooks/queries/resident/useResidentPortal';
import toast from 'react-hot-toast';
import {
  FiUser, FiCreditCard, FiHome, FiLogOut, FiMenu, FiX,
  FiZoomIn, FiDownload, FiAlertCircle, FiCalendar,
  FiPhone, FiMapPin, FiUsers, FiShield,
} from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
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
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

function age(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function fullName(r, lastFirst = false) {
  if (!r) return '—';
  const parts = lastFirst
    ? [r.last_name, r.first_name, r.middle_name ? r.middle_name[0] + '.' : '', r.suffix]
    : [r.first_name, r.middle_name, r.last_name, r.suffix];
  return parts.filter(Boolean).join(' ') || '—';
}

function val(v) { return v || '—'; }

// ─────────────────────────────────────────────────────────────
// QR CANVAS (reused from EidCard)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// QR LIGHTBOX
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────
function Section({ id, icon: Icon, title, subtitle, children }) {
  return (
    <section id={id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-[#F1F7F2]">
        <div className="w-9 h-9 rounded-lg bg-[#005F02]/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#005F02]" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-base leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FIELD ROW
// ─────────────────────────────────────────────────────────────
function Field({ label, value, mono = false, wide = false }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-base text-gray-800 font-medium ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────
function Skeleton({ rows = 3, cols = 3 }) {
  return (
    <div className={`grid grid-cols-${cols} gap-x-6 gap-y-4`}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i}>
          <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse mb-1.5" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NOT LINKED NOTICE
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────
const NAV = [
  { id: 'profile',   label: 'My Profile',   icon: FiUser },
  { id: 'eid',       label: 'My eID',       icon: FiCreditCard },
  { id: 'household', label: 'My Household', icon: FiHome },
];

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ResidentPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [qrOpen, setQrOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const navigate  = useNavigate();
  const { profile } = useAuth();
  const clearAuth   = useAuthStore((s) => s.clearAuth);

  const { data: resident, isLoading: loadingProfile } = useMyResidentProfile();
  const { data: eid,      isLoading: loadingEid      } = useMyEid();
  const { data: household, isLoading: loadingHousehold } = useMyHousehold();

  const handleLogout = async () => {
    try { await signOut(); clearAuth(); navigate('/login', { replace: true }); }
    catch (err) { toast.error(err.message ?? 'Logout failed.'); }
  };

  const confirmLogout = () => setLogoutConfirmOpen(true);

  // Scroll-spy: update active nav item as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  };

  // ── eID card data adapter ──────────────────────────────────
  const eidCardData = eid ? {
    idNumber:    eid.eid_number,
    qrToken:     eid.qr_token,
    name:        fullName(eid.residents, true),
    photoUrl:    eid.residents?.photo_url,
    sex:         eid.residents?.sex ? eid.residents.sex.charAt(0).toUpperCase() + eid.residents.sex.slice(1) : '—',
    dateOfBirth: eid.residents?.date_of_birth,
    bloodType:   eid.residents?.blood_type,
    civilStatus: eid.residents?.civil_status,
    address:     eid.residents?.address_line,
    issuedAt:    eid.issued_at,
    expiresAt:   eid.expires_at,
    status:      eid.status ? eid.status.charAt(0).toUpperCase() + eid.status.slice(1) : 'Active',
    purok:       eid.residents?.puroks?.name,
  } : null;

  const statusColor = {
    Active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    Suspended: 'bg-amber-100 text-amber-700 border-amber-200',
    Revoked:   'bg-red-100 text-red-600 border-red-200',
    Expired:   'bg-gray-100 text-gray-500 border-gray-200',
  };

  // ── Sidebar nav ───────────────────────────────────────────
  const NavLinks = () => (
    <nav className="flex flex-col gap-1 mt-2">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollTo(id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
            activeSection === id
              ? 'bg-[#005F02] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">

      {/* ── DESKTOP SIDEBAR ────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-200 sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-3">
          <img
            src="/src/assets/images/logo-dashboard.svg"
            alt="BarangayLink"
            className="w-full"
          />
        </div>

        {/* User chip */}
        <div className="px-4 py-3 mx-3 mt-4 rounded-lg bg-[#F1F7F2] border border-[#005F02]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#005F02]/15 flex items-center justify-center shrink-0">
              {resident?.photo_url ? (
                <img src={resident.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <FiUser className="w-4 h-4 text-[#005F02]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {profile?.full_name ?? '—'}
              </p>
              <p className="text-[10px] text-[#005F02] font-medium">Resident</p>
            </div>
          </div>
          {resident?.resident_no && (
            <p className="mt-1.5 text-[10px] font-mono text-gray-500">ID: {resident.resident_no}</p>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 pt-4 overflow-y-auto">
          <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
          <NavLinks />
        </div>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={confirmLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img src="/src/assets/images/logo-dashboard.svg" alt="BarangayLink" className="h-8 w-auto" />
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 px-3 pt-3 overflow-y-auto">
              <NavLinks />
            </div>
            <div className="px-3 pb-4 border-t border-gray-100 pt-3">
              <button type="button" onClick={confirmLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <FiLogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="flex-1 overflow-auto">

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center gap-3 px-4 py-3 shadow-sm">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>
          <img src="/src/assets/images/logo-dashboard.svg" alt="BarangayLink" className="h-7 w-auto" />
          <p className="text-xs text-gray-500 ml-auto">{profile?.full_name ?? ''}</p>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-black text-gray-900">Resident Portal</h1>
          </div>

          {/* ── SECTION 1: MY PROFILE ──────────────────────── */}
          <Section
            id="profile"
            icon={FiUser}
            title="My Profile"
            subtitle="Personal information on file with the Barangay Registry"
          >
            {loadingProfile ? (
              <Skeleton rows={4} cols={3} />
            ) : !resident ? (
              <NotLinked message="Your account has not been linked to a resident record yet. Please contact the Barangay Office." />
            ) : (
              <div className="space-y-6">
                {/* Photo + name + status */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-24 rounded-lg bg-gray-100 border-2 border-white shadow overflow-hidden shrink-0">
                    {resident.photo_url ? (
                      <img src={resident.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-gray-900 uppercase leading-tight">
                      {fullName(resident, true)}
                    </h3>
                    <p className="text-base text-gray-500 font-mono mt-0.5">{resident.resident_no ?? '—'}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        resident.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        {resident.status ? resident.status.charAt(0).toUpperCase() + resident.status.slice(1) : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Personal details grid */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Date of Birth" value={fmt(resident.date_of_birth)} />
                    <Field label="Age" value={age(resident.date_of_birth) ? `${age(resident.date_of_birth)} years old` : '—'} />
                    <Field label="Place of Birth" value={val(resident.place_of_birth)} />
                    <Field label="Sex" value={val(resident.sex)} />
                    <Field label="Civil Status" value={val(resident.civil_status)} />
                    <Field label="Blood Type" value={val(resident.blood_type)} />
                    <Field label="Nationality" value={val(resident.nationality)} />
                    <Field label="Religion" value={val(resident.religion)} />
                    <Field label="Occupation" value={val(resident.occupation)} />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Contact & address */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact & Address</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Contact Number" value={val(resident.contact_number)} />
                    <Field label="Email" value={val(resident.email)} />
                    <Field label="Years of Stay" value={resident.years_of_stay ? `${resident.years_of_stay} years` : '—'} />
                    <Field label="Address" value={val(resident.address_line)} wide />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Government IDs */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Government Records</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Voter Status" value={resident.voter_status ? 'Registered' : 'Not Registered'} />
                    <Field label="ID No." value={val(resident.id_number)} mono />
                    <Field label="Registered Since" value={fmt(resident.created_at)} />
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ── SECTION 2: MY eID ──────────────────────────── */}
          <Section
            id="eid"
            icon={FiCreditCard}
            title="My eID"
            subtitle="Your Barangay Electronic Identification Card"
          >
            {loadingEid ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin w-7 h-7 border-[3px] border-[#005F02] border-t-transparent rounded-full" />
              </div>
            ) : !eidCardData ? (
              <NotLinked message="No electronic ID has been issued for your account yet. Please visit the Barangay Office to request issuance of your eID." />
            ) : (
              <div className="space-y-5">
                {/* Status banner */}
                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold ${statusColor[eidCardData.status] ?? statusColor.Expired}`}>
                  <FiShield className="w-4 h-4 shrink-0" />
                  eID Status: {eidCardData.status}
                  <span className="ml-auto text-xs font-normal opacity-70">
                    Valid Until: {fmtShort(eidCardData.expiresAt)}
                  </span>
                </div>

                {/* Card preview — credit-card aspect ratio */}
                <div
                  className="relative overflow-hidden rounded-xl shadow-lg w-full mx-auto bg-white border border-gray-200"
                  style={{ aspectRatio: '85.6 / 53.98', maxWidth: '480px', fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  {/* Body */}
                  <div className="absolute z-10 flex gap-2 px-3" style={{ top: '8%', left: 0, right: 0, bottom: '14%' }}>
                    {/* Photo */}
                    <div className="shrink-0 flex flex-col justify-between" style={{ width: '20%' }}>
                      <div className="rounded overflow-hidden border-[1.5px] border-white shadow bg-gray-200 w-full" style={{ aspectRatio: '3/4' }}>
                        {eidCardData.photoUrl ? (
                          <img src={eidCardData.photoUrl} alt="ID Photo" className="w-full h-full object-cover" draggable={false} />
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
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div>
                        <p className="text-[5px] text-gray-400 leading-none mb-0.5 uppercase tracking-wide">Last Name, First Name, M.I.</p>
                        <p className="font-black text-gray-900 uppercase leading-tight truncate" style={{ fontSize: 'clamp(7.5px, 2vw, 12px)' }}>
                          {eidCardData.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-x-1">
                        {[['Sex', eidCardData.sex], ['Date of Birth', fmtShort(eidCardData.dateOfBirth)], ['Civil Status', eidCardData.civilStatus ? eidCardData.civilStatus.charAt(0).toUpperCase() + eidCardData.civilStatus.slice(1) : '—']].map(([l,v]) => (
                          <div key={l}>
                            <p className="text-[5px] text-gray-400 uppercase tracking-wide leading-none">{l}</p>
                            <p className="font-bold text-gray-900 leading-tight" style={{ fontSize: 'clamp(6px, 1.5vw, 9px)' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-x-1">
                        {[['Blood Type', eidCardData.bloodType || '—'], ['Date Issued', fmtShort(eidCardData.issuedAt)], ['Valid Until', fmtShort(eidCardData.expiresAt)]].map(([l,v]) => (
                          <div key={l}>
                            <p className="text-[5px] text-gray-400 uppercase tracking-wide leading-none">{l}</p>
                            <p className="font-bold text-gray-900 leading-tight" style={{ fontSize: 'clamp(6px, 1.5vw, 9px)' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <p className="font-semibold text-gray-800 uppercase leading-tight" style={{ fontSize: 'clamp(5.5px, 1.3vw, 8px)' }}>{eidCardData.address}</p>
                      <p className="font-black text-gray-700 tracking-widest border-t border-gray-200/80 pt-0.5" style={{ fontSize: 'clamp(6px, 1.4vw, 9px)', fontFamily: 'monospace' }}>{eidCardData.idNumber}</p>
                    </div>
                    {/* QR */}
                    <div className="shrink-0 flex flex-col items-center justify-end" style={{ width: '17%' }}>
                      <button
                        type="button"
                        onClick={() => setQrOpen(true)}
                        className="relative cursor-zoom-in focus:outline-none group"
                        style={{ width: 60, height: 60 }}
                        aria-label="Expand QR Code"
                      >
                        <QrCanvas token={eidCardData.qrToken} size={60} />
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

                {/* eID details below card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  {[
                    { label: 'ID Number', value: eidCardData.idNumber, mono: true },
                    { label: 'Date Issued', value: fmt(eidCardData.issuedAt) },
                    { label: 'Valid Until', value: fmt(eidCardData.expiresAt) },
                    { label: 'Purok', value: eidCardData.purok || '—' },
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
            )}
          </Section>

          {/* ── SECTION 3: MY HOUSEHOLD ────────────────────── */}
          <Section
            id="household"
            icon={FiHome}
            title="My Household"
            subtitle="Household registry record associated with your residence"
          >
            {loadingHousehold ? (
              <Skeleton rows={2} cols={3} />
            ) : !household ? (
              <NotLinked message="Your resident record is not currently linked to a household. Please contact the Barangay Office for assistance." />
            ) : (
              <div className="space-y-6">
                {/* Household summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: FiHome,     label: 'Household No.', value: household.household_no ?? '—' },
                    { icon: FiMapPin,   label: 'Purok',         value: household.puroks?.name ?? '—' },
                    { icon: FiUsers,    label: 'Members',       value: `${household.members?.length ?? 0} member${household.members?.length !== 1 ? 's' : ''}` },
                    { icon: FiCalendar, label: 'Registered',    value: fmt(household.created_at) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-[#F1F7F2] rounded-lg p-3 border border-[#005F02]/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-[#005F02]" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Household details */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Household Details</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="House No." value={val(household.house_no)} />
                    <Field label="Street" value={val(household.street)} />
                    <Field label="Ownership Type" value={val(household.ownership_type)} />
                    <Field label="Monthly Income Range" value={val(household.monthly_income_range)} />
                  </div>
                </div>

                {/* Members list */}
                {household.members?.length > 0 && (
                  <>
                    <div className="border-t border-gray-100" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiUsers className="w-3.5 h-3.5" /> Household Members
                      </p>
                      <div className="space-y-2">
                        {household.members.map((m, i) => (
                          <div key={m.id ?? i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
                              {m.photo_url ? (
                                <img src={m.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FiUser className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{fullName(m)}</p>
                              <p className="text-xs text-gray-500">
                                {m.relationship_to_head ? `${m.relationship_to_head} · ` : ''}{m.sex ?? ''}{m.date_of_birth ? ` · ${age(m.date_of_birth)} yrs` : ''}
                              </p>
                            </div>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              m.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </Section>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">
              BarangayLink Resident Portal · Barangay San Bartolome, Novaliches, Quezon City
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              For concerns, visit the Barangay Hall or call the Barangay Office.
            </p>
          </div>

        </div>
      </main>

      {/* QR Lightbox */}
      {qrOpen && eidCardData && (
        <QrLightbox
          token={eidCardData.qrToken}
          idNumber={eidCardData.idNumber}
          name={eidCardData.name}
          onClose={() => setQrOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLogoutConfirmOpen(false); }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to log out?</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}