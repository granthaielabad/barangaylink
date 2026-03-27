import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX, FiFileText, FiUser, FiMapPin, FiCreditCard, FiBell,
  FiCheck, FiCheckCircle, FiZoomIn, FiInfo, FiSearch, FiLoader,
  FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import {
  useEidApplications,
  useMutateEidApplication,
} from '../../../../../hooks/queries/eid/useEids';
import toast from 'react-hot-toast';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function fullName(app) {
  return [app.first_name, app.middle_name, app.last_name, app.suffix]
    .filter(Boolean).join(' ') || '—';
}
function statusBadge(status) {
  const cfg = {
    under_review: { cls: 'bg-blue-50 text-blue-700 border-blue-200',          label: 'Under Review'     },
    pending:      { cls: 'bg-orange-50 text-orange-700 border-orange-200',    label: 'Pending Approval' },
    approved:     { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved'         },
    rejected:     { cls: 'bg-red-50 text-red-600 border-red-200',             label: 'Rejected'         },
  };
  return cfg[status] ?? { cls: 'bg-gray-50 text-gray-600 border-gray-200', label: status };
}

const STEPS = [
  { id: 1, label: 'Document Verification', icon: FiFileText   },
  { id: 2, label: 'Identity Confirmation', icon: FiUser       },
  { id: 3, label: 'Address Validation',    icon: FiMapPin     },
  { id: 4, label: 'eID Generation',        icon: FiCreditCard },
  { id: 5, label: 'Notification',          icon: FiBell       },
];

const STATUS_TABS = [
  { value: 'all',          label: 'All'          },
  { value: 'under_review', label: 'Under Review' },
  { value: 'pending',      label: 'Pending'      },
  { value: 'approved',     label: 'Approved'     },
];

function Checklist({ items }) {
  return (
    <div className="border border-gray-100 rounded-lg p-5">
      <h5 className="text-sm font-bold text-gray-900 mb-4">Verification Checklist</h5>
      <div className="space-y-3.5">
        {items.map((item, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center shrink-0">
              <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[#005F02] checked:border-[#005F02] transition-all" />
              <FiCheck className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ApplicantCard({ app, onReview }) {
  const { cls, label } = statusBadge(app.status);
  const reviewer    = app.reviewed_by_profile?.full_name;
  const currentStep = app.current_step || 1;
  const isApproved  = app.status === 'approved';
  const isPending   = app.status === 'pending';

  const progressColor = isApproved
    ? 'bg-[#005F02]'
    : isPending
    ? 'bg-orange-500'
    : 'bg-blue-600';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 hover:border-gray-300 transition-all shadow-sm">
      <div className="flex gap-6">
        {/* Photo */}
        <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {app.photo_url
            ? <img src={app.photo_url} alt={fullName(app)} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiUser className="w-10 h-10" /></div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{fullName(app)}</h3>
              <p className="text-xs text-gray-400">Application #: <span className="font-bold text-gray-600">{app.reference_number || app.id?.slice(0, 8).toUpperCase()}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-md text-[11px] font-bold border ${cls}`}>{label}</span>
              {/* Approved applications are read-only — show a Complete badge instead */}
              {isApproved ? (
                <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold text-[#005F02] bg-emerald-50 border border-emerald-200">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Complete
                </span>
              ) : app.status !== 'rejected' && (
                <button
                  onClick={() => onReview(app)}
                  className="flex items-center gap-1.5 bg-black text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  <FiSearch className="w-3.5 h-3.5" /> Review
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 text-xs">
            <div className="space-y-1">
              <p><span className="text-gray-400">Submitted:</span> <span className="text-gray-700 font-medium">{fmt(app.submitted_at)}</span></p>
              <p><span className="text-gray-400">Contact No.:</span> <span className="text-gray-700 font-medium">{app.contact_number || '—'}</span></p>
              <p><span className="text-gray-400">Valid ID Type:</span> <span className="text-gray-700 font-medium">{app.valid_id_type || app.residents?.valid_id_type || '—'}</span></p>
            </div>
            <div className="space-y-1">
              <p><span className="text-gray-400">Address:</span> <span className="text-gray-700 font-medium">{app.address_line || '—'}</span></p>
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-700 font-medium">{app.email || '—'}</span></p>
              <p className="text-gray-400">Est. Processing: <span className="italic">3-5 business days</span></p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`flex-1 h-full rounded-sm transition-colors ${s <= currentStep ? progressColor : 'bg-gray-200'}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-[11px] font-bold flex items-center gap-1.5 ${isApproved ? 'text-[#005F02]' : isPending ? 'text-orange-600' : 'text-blue-600'}`}>
                <FiCheckCircle className={`w-3.5 h-3.5 ${isApproved ? '' : isPending ? 'text-orange-400' : 'text-blue-300'}`} />
                {isApproved
                  ? 'Application approved — eID issued'
                  : isPending
                  ? 'Review complete — awaiting final approval'
                  : `Currently at: ${STEPS[currentStep - 1]?.label}`
                }
              </p>
              <p className="text-[10px] text-gray-400 font-medium">{currentStep} of 5 steps</p>
            </div>
            {reviewer && (
              <p className="text-[10px] text-gray-400 mt-1 italic flex items-center gap-1">
                <FiInfo className="w-3 h-3" /> Last reviewed by {reviewer} on {fmt(app.reviewed_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step content components ──────────────────────────────────────────────────
function Step1Content({ app }) {
  const [zoomed, setZoomed] = useState(false);
  const resident    = app.residents || {};
  const validIdUrl  = app.valid_id_url || resident.valid_id_url || null;
  const validIdType = app.valid_id_type || resident.valid_id_type || 'Government ID';
  return (
    <div className="space-y-6">
      <div className="bg-[#EBF5FF] border border-[#BEE3F8] p-4 rounded-lg flex gap-3">
        <FiInfo className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">Document Verification</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">Carefully review the government-issued ID to ensure it's authentic, valid, and matches the applicant's information.</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-[#F1FDF3] border border-[#C6F6D5] rounded-lg p-5">
          <p className="text-[11px] font-bold text-[#2F855A] uppercase tracking-wider mb-4">Resident Information</p>
          <div className="grid grid-cols-2 gap-y-4 text-[13px]">
            <div><p className="text-[10px] text-[#48BB78] font-bold">Full Name</p><p className="font-bold text-gray-900">{fullName(app)}</p></div>
            <div><p className="text-[10px] text-[#48BB78] font-bold">Resident Number</p><p className="font-bold text-gray-900">{resident.resident_no || '—'}</p></div>
            <div className="col-span-2"><p className="text-[10px] text-[#48BB78] font-bold">Address</p><p className="font-bold text-gray-900">{app.address_line || '—'}</p></div>
            <div><p className="text-[10px] text-[#48BB78] font-bold">Date of Birth</p><p className="font-bold text-gray-900">{fmt(app.date_of_birth)}</p></div>
            <div><p className="text-[10px] text-[#48BB78] font-bold">Civil Status</p><p className="font-bold text-gray-900">{resident.civil_status ? resident.civil_status.charAt(0).toUpperCase() + resident.civil_status.slice(1) : 'Single'}</p></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="flex-1 min-h-[160px] cursor-zoom-in" onClick={() => validIdUrl && setZoomed(true)}>
              {validIdUrl
                ? <img src={validIdUrl} alt="Valid ID" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><FiFileText className="w-12 h-12" /></div>
              }
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => validIdUrl && setZoomed(true)}>
              <FiZoomIn className="w-4 h-4" /><span className="text-[11px] font-bold">Click to Zoom</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 text-center">{validIdType} - {app.id_number || '—'}</p>
        </div>
      </div>
      <Checklist items={['ID photo is clear and of good quality','All information on the ID is readable and legible','ID appears to be authentic and not expired',"Photo on ID matches the applicant's submitted information"]} />
      {zoomed && validIdUrl && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-10 cursor-zoom-out" onClick={() => setZoomed(false)}>
          <img src={validIdUrl} alt="Valid ID Zoomed" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          <button className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full"><FiX className="w-6 h-6" /></button>
        </div>,
        document.body
      )}
    </div>
  );
}

function Step2Content({ app }) {
  const resident = app.residents || {};
  return (
    <div className="space-y-6">
      <div className="bg-[#EBF5FF] border border-[#BEE3F8] p-4 rounded-lg flex gap-3">
        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center shrink-0 mt-0.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /></div>
        <div><p className="text-sm font-bold text-blue-800">Final Identity Confirmation</p><p className="text-xs text-blue-700 mt-0.5 leading-relaxed">Perform a final review to confirm the applicant's identity and ensure all information is accurate.</p></div>
      </div>
      <div className="bg-[#F1FDF3] border border-[#C6F6D5] rounded-lg p-5">
        <p className="text-[11px] font-bold text-[#2F855A] uppercase tracking-wider mb-4">Resident Information Verified</p>
        <div className="grid grid-cols-3 gap-y-6 gap-x-8 text-[13px]">
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Full Name</p><p className="font-bold text-gray-900 truncate">{fullName(app)}</p></div>
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Resident Number</p><p className="font-bold text-gray-900">{resident.resident_no || '—'}</p></div>
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Government ID Type</p><p className="font-bold text-gray-900">{app.valid_id_type || resident.valid_id_type || '—'}</p></div>
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Address</p><p className="font-bold text-gray-900 truncate">{app.address_line || '—'}</p></div>
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Civil Status</p><p className="font-bold text-gray-900">{resident.civil_status ? resident.civil_status.charAt(0).toUpperCase() + resident.civil_status.slice(1) : 'Single'}</p></div>
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Government ID Number</p><p className="font-bold text-gray-900">{app.id_number || '—'}</p></div>
          <div><p className="text-[10px] text-[#48BB78] font-bold mb-1">Date of Birth</p><p className="font-bold text-gray-900">{fmt(app.date_of_birth)}</p></div>
        </div>
      </div>
      <Checklist items={['Name on government ID matches application information exactly','Photos appear authentic with no signs of tampering or manipulation','No red flags or inconsistencies found during the verification process']} />
    </div>
  );
}

function Step3Content({ app }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#EBF5FF] border border-[#BEE3F8] p-4 rounded-lg flex gap-3">
        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center shrink-0 mt-0.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /></div>
        <div><p className="text-sm font-bold text-blue-800">Address Validation</p><p className="text-xs text-blue-700 mt-0.5 leading-relaxed">Verify that the applicant's address is within the barangay jurisdiction and matches the information provided.</p></div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-[#F1FDF3] border border-[#C6F6D5] rounded-lg p-5">
          <p className="text-[11px] font-bold text-[#2F855A] uppercase mb-3">Application Address</p>
          <p className="text-[10px] text-[#48BB78] font-bold mb-1">Full Address</p>
          <p className="font-bold text-[#22543D] leading-relaxed text-[13px]">{app.address_line || '—'}</p>
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase mb-3">ID Address Information</p>
          <p className="text-[10px] text-gray-400 font-bold mb-1">Full Address</p>
          <p className="font-bold text-gray-700 leading-relaxed text-[13px]">{app.address_line || '—'}</p>
        </div>
      </div>
      <Checklist items={['Address is confirmed to be within Barangay jurisdiction','Address on government ID matches the submitted application address','Address can be verified through barangay records or database']} />
    </div>
  );
}

function Step4Content({ app, issuedEidNumber, setIssuedEidNumber }) {
  const regenerate = () => {
    const year  = new Date().getFullYear();
    const sequence  = Math.floor(10000 + Math.random() * 90000);
    setIssuedEidNumber(`BRY-${year}-${sequence}`);
    toast.success('New eID number generated.');
  };
  return (
    <div className="space-y-6">
      <div className="bg-[#F1FDF3] border border-[#C6F6D5] p-4 rounded-lg flex gap-3">
        <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center shrink-0 mt-0.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /></div>
        <div><p className="text-sm font-bold text-emerald-800">eID Generation</p><p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">Review the generated eID number that will be assigned to this resident upon approval.</p></div>
      </div>
      <div className="border border-gray-100 rounded-xl p-8 bg-white text-center shadow-sm">
        <FiCreditCard className="w-14 h-14 text-emerald-500 mb-4 mx-auto" />
        <h4 className="text-lg font-bold text-gray-900 mb-2">Generated eID Number</h4>
        <div className="bg-[#F1FDF3] border border-[#C6F6D5] py-3 px-8 rounded-lg inline-block mb-4">
          <span className="text-3xl font-black text-[#22543D] tracking-widest font-mono">{issuedEidNumber || '2026-123-12'}</span>
        </div>
        <p className="text-[11px] text-gray-400 max-w-xs mx-auto mb-6">This unique identifier will be permanently associated with {fullName(app)}</p>
        <button onClick={regenerate} className="px-6 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">Regenerate eID</button>
      </div>
      <div className="bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg p-5">
        <p className="text-[11px] font-bold text-gray-500 uppercase mb-4">eID Details</p>
        <div className="grid grid-cols-2 gap-y-6 text-[13px]">
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">Resident Name</p><p className="font-bold text-gray-900">{fullName(app)}</p></div>
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">eID Number</p><p className="font-bold text-gray-900">{issuedEidNumber || '2026-123-12'}</p></div>
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">Issue Date</p><p className="font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
          <div><p className="text-[10px] text-gray-400 font-bold mb-1">Status</p><p className="font-bold text-gray-900">Active</p></div>
        </div>
      </div>
    </div>
  );
}

function Step5Content({ app, issuedEidNumber }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#F1FDF3] border border-[#C6F6D5] p-4 rounded-lg flex gap-3">
        <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-emerald-800">Ready for Approval</p>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">All verification steps are complete. Click "Approve & Notify" to finalize the application and issue the eID.</p>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <p className="text-sm font-bold text-gray-800 mb-6">Notification Preview</p>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-[80px_1fr] gap-1 text-xs">
            <span className="text-gray-400 font-medium">Recipient</span><span className="text-gray-900 font-bold">{fullName(app)}</span>
            <span className="text-gray-400 font-medium">Email</span><span className="text-blue-600 font-medium lowercase">{app.email || '—'}</span>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Message</p>
            <div className="bg-white border border-gray-200 p-6 rounded-lg min-h-[120px] text-xs text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 mb-2">Barangay eID Application Approved</p>
              <p>Dear {app.first_name},</p><br />
              <p>We are pleased to inform you that your Barangay Electronic ID application has been approved. Your digital eID is now active and can be accessed through the resident portal.</p><br />
              <p>Your eID Number: <span className="font-bold text-gray-900 font-mono">{issuedEidNumber || '—'}</span></p><br />
              <p>Thank you for your application.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#EBF5FF] border border-[#BEE3F8] p-5 rounded-lg flex gap-4">
        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center shrink-0 mt-0.5"><FiInfo className="w-3.5 h-3.5 text-blue-600" /></div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-800">Final Review Summary</p>
          <ul className="text-xs text-blue-600 font-medium space-y-0.5">
            <li>• Document verification: Complete</li>
            <li>• Address validation: Complete</li>
            <li>• Identity confirmation: Complete</li>
            <li>• eID to be generated upon approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ReviewApplicationModal({ isOpen, onClose }) {
  const [view,            setView]            = useState('list');
  const [currentStep,     setCurrentStep]     = useState(1);
  const [selectedApp,     setSelectedApp]     = useState(null);
  const [issuedEidNumber, setIssuedEidNumber] = useState(null);
  const [isIssuing,       setIsIssuing]       = useState(false);
  const [search,          setSearch]          = useState('');
  // Default to 'under_review' — that's the first actionable inbox
  const [statusFilter,    setStatusFilter]    = useState('under_review');
  const [sortOrder,       setSortOrder]       = useState('desc');

  const { data, isLoading } = useEidApplications({ page: 1, pageSize: 50, status: statusFilter, sortOrder });
  const { updateStatus, approve } = useMutateEidApplication();

  const applications = (data?.data ?? []).filter(
    (app) => !search.trim() || fullName(app).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const resetToList = () => {
    setView('list');
    setCurrentStep(1);
    setSelectedApp(null);
    setIssuedEidNumber(null);
    setIsIssuing(false);
  };

  const handleClose = () => { onClose(); setTimeout(resetToList, 300); };

  const handleReview = (app) => {
    setSelectedApp(app);
    setIssuedEidNumber(null);
    setIsIssuing(false);
    setCurrentStep(app.current_step || 1);
    setView('review');
    // Applications already start as under_review from the DB default.
    // No status mutation needed when opening — just resume from saved step.
  };

  // Step navigation:
  // Steps 1-4 → status stays 'under_review', progress saved via current_step
  // Step 4 → 5 → status advances to 'pending' (review done, awaiting final approval)
  // Step 5 → 'Approve & Notify' → status becomes 'approved', eID issued
  const handleNext = () => {
    if (currentStep >= 5) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (nextStep === 5) {
      // Completing step 4 means the review is fully done → set to 'pending'
      updateStatus.mutate({ id: selectedApp.id, status: 'pending', currentStep: nextStep });
    } else {
      // Still in the review phase → keep as 'under_review', just save step progress
      updateStatus.mutate({ id: selectedApp.id, status: 'under_review', currentStep: nextStep });
    }
  };

  const handlePrevious = () => {
    if (currentStep <= 1) return;
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    // Going back from step 5 returns to under_review
    updateStatus.mutate({
      id:          selectedApp.id,
      status:      prevStep < 5 ? 'under_review' : 'pending',
      currentStep: prevStep,
    });
  };

  const handleReject = () => {
    if (!selectedApp) return;
    updateStatus.mutate(
      { id: selectedApp.id, status: 'rejected', currentStep },
      { onSuccess: () => { toast.success('Application rejected.'); handleClose(); } }
    );
  };

  const handleApproveAndNotify = async () => {
    if (!selectedApp?.resident_id) {
      toast.error('Cannot approve: resident ID is missing from this application.');
      return;
    }
    setIsIssuing(true);
    try {
      await approve.mutateAsync({
        applicationId: selectedApp.id,
        residentId:    selectedApp.resident_id,
        photoUrl:      selectedApp.photo_url ?? null,
      });
      handleClose();
    } catch (err) {
      toast.error(err.message ?? 'Failed to approve application.');
    } finally {
      setIsIssuing(false);
    }
  };

  const toggleSortOrder = () => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className={`relative bg-[#F8FAF8] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${view === 'review' ? 'h-[95vh]' : 'max-h-[85vh]'}`}>

        {/* Header */}
        <div className="px-8 py-5 border-b border-emerald-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F1FDF3] rounded-lg flex items-center justify-center text-[#005F02]">
              <FiFileText className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Review eID Application</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={toggleSortOrder}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                  Sort by Date
                  {sortOrder === 'desc'
                    ? <FiChevronDown className="text-gray-400 w-4 h-4" />
                    : <FiChevronUp   className="text-gray-400 w-4 h-4" />
                  }
                </button>
                <div className="h-8 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                  {STATUS_TABS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setStatusFilter(value)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        statusFilter === value
                          ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/10 focus:border-[#005F02] transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {isLoading ? (
                <div className="flex justify-center py-20"><FiLoader className="w-10 h-10 text-[#005F02] animate-spin" /></div>
              ) : applications.length === 0 ? (
                <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
                  <FiInfo className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-sm">
                    {search
                      ? 'No matching applications.'
                      : `No ${statusFilter === 'all' ? '' : statusFilter.replace('_', ' ')} applications.`
                    }
                  </p>
                </div>
              ) : applications.map((app) => (
                <ApplicantCard key={app.id} app={app} onReview={handleReview} />
              ))}
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end shrink-0">
              <button onClick={handleClose} className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">Close</button>
            </div>
          </div>
        )}

        {/* ── REVIEW VIEW ── */}
        {view === 'review' && selectedApp && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-sm font-medium text-gray-500">
                Application #<span className="font-bold text-gray-900">{selectedApp.reference_number || selectedApp.id?.slice(0, 8).toUpperCase()}</span>
              </span>
              <button onClick={handleReject} className="px-5 py-2.5 rounded-lg border border-red-100 text-red-600 text-sm font-bold hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm">
                Reject Application
              </button>
            </div>

            {/* Step progress */}
            <div className="px-8 pt-6 pb-4 bg-white shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800">Review Progress</span>
                <span className="text-xs font-bold text-gray-400">{currentStep} of 5</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between relative px-2">
                {STEPS.map((step) => {
                  const active = step.id === currentStep;
                  const done   = step.id < currentStep;
                  const Icon   = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-3 z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${active || done ? 'bg-[#005F02] text-white border-[#005F02]' : 'bg-white text-gray-300 border-gray-100 shadow-sm'}`}>
                        {done ? <FiCheck className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <span className={`text-[10px] font-bold text-center max-w-[80px] leading-tight ${active ? 'text-[#005F02]' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                  );
                })}
                <div className="absolute top-6 left-10 right-10 h-px bg-gray-100 -z-10" />
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#F8FAF8]">
              {currentStep === 1 && <Step1Content app={selectedApp} />}
              {currentStep === 2 && <Step2Content app={selectedApp} />}
              {currentStep === 3 && <Step3Content app={selectedApp} />}
              {currentStep === 4 && <Step4Content app={selectedApp} issuedEidNumber={issuedEidNumber} setIssuedEidNumber={setIssuedEidNumber} />}
              {currentStep === 5 && <Step5Content app={selectedApp} issuedEidNumber={issuedEidNumber} />}
            </div>

            {/* Action bar */}
            <div className="px-8 py-6 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                disabled={currentStep === 1}
                onClick={handlePrevious}
                className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button onClick={handleClose} className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">Close</button>
                <button
                  onClick={currentStep === 5 ? handleApproveAndNotify : handleNext}
                  disabled={isIssuing}
                  className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                    currentStep === 5 ? 'bg-[#005F02] text-white hover:bg-[#004A01]' : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {isIssuing && <FiLoader className="w-4 h-4 animate-spin" />}
                  {currentStep === 5 ? 'Approve & Notify' : 'Next Step'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}