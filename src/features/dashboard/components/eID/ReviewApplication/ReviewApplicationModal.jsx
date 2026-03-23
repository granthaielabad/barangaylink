import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiX, FiFileText, FiUser, FiMapPin, 
  FiCreditCard, FiBell, FiCheck, 
  FiChevronRight, FiAlertCircle,
  FiCheckCircle, FiSearch, FiZoomIn, FiInfo
} from 'react-icons/fi';
import ReviewFilter from './ReviewFilter';
import ApplicantCard from './ApplicantCard';

const MOCK_APPLICANTS = [
  {
    id: 1,
    name: 'Murphy De Guzman Jr.',
    applicationId: '1234-123-12',
    submittedAt: 'March 18, 2026',
    address: '#71 Dahlia Avenue St. Brgy San Bartolome',
    contactNo: '0910 0976 326',
    email: 'mayreyes@gmail.com',
    validIdType: "National ID",
    status: 'Under Review',
    currentStep: 1,
    totalSteps: 5,
    stepLabel: 'Document Verification',
    lastReviewedBy: 'Super Admin',
    lastReviewedAt: 'March 19, 2026 - 9:00 AM',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    isComplete: false,
    dob: '01/01/2001',
    civilStatus: 'Single',
    idNumber: '1234-5678-9012-3456'
  },
  {
    id: 2,
    name: 'Princess May Reyes',
    applicationId: '1234-123-12',
    submittedAt: 'March 18, 2026',
    address: 'Dahlia Avenue St. Brgy. San Bartolome',
    contactNo: '0910 0976 326',
    email: 'mayreyes@gmail.com',
    validIdType: "Driver's License",
    status: 'Approval Pending',
    currentStep: 5,
    totalSteps: 5,
    stepLabel: 'All verification steps completed - Ready for final approval',
    lastReviewedBy: 'Super Admin',
    lastReviewedAt: 'March 19, 2026 - 10:30 AM',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    isComplete: true
  }
];

const STEPS = [
  { id: 1, label: 'Document Verification', icon: FiFileText },
  { id: 2, label: 'Identity Confirmation', icon: FiUser },
  { id: 3, label: 'Address Validation', icon: FiMapPin },
  { id: 4, label: 'eID Generation', icon: FiCreditCard },
  { id: 5, label: 'Notification', icon: FiBell },
];

export default function ReviewApplicationModal({ isOpen, onClose }) {
  const [view, setView] = useState('list'); // 'list' or 'review'
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setView('list');
      setCurrentStep(1);
      setSelectedApplicant(null);
    }, 300);
  };

  if (!isOpen) return null;

  const handleReview = (applicant) => {
    setSelectedApplicant(applicant);
    setView('review');
    setCurrentStep(1);
  };



  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(curr => curr + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(curr => curr - 1);
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
      />

      {/* Modal Container */}
      <div className={`relative bg-white w-full max-w-3xl ${view === 'review' ? 'h-[95vh]' : 'h-[93vh]'} rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-300`}>
        
        {/* Header Section */}
        <div className="bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-[#005F02]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Review eID Application</h2>
          </div>
          <button 
            type="button" 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {view === 'list' ? (
          <>
            {/* Filters and List View */}
            <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
              <ReviewFilter />
              <div className="space-y-4">
                {MOCK_APPLICANTS.map((app) => (
                  <ApplicantCard 
                    key={app.id} 
                    applicant={app} 
                    onReview={handleReview}
                  />
                ))}
              </div>
            </div>

            {/* List Footer */}
            <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={handleClose}
                className="px-6 py-2 rounded-sm border border-gray-300 bg-white text-gray-700 text-base font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                type="button" 
                className="px-6 py-2 rounded-sm bg-black text-white text-base font-semibold hover:bg-gray-800 transition-colors"
              >
                Next Step
              </button>
            </div>
          </>
        ) : (
          /* Review Workflow View */
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <ReviewWorkflow 
              applicant={selectedApplicant} 
              currentStep={currentStep}
              onNext={nextStep}
              onPrev={prevStep}
              onClose={handleClose}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function ReviewWorkflow({ applicant, currentStep, onNext, onPrev, onClose }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Review Sub-header */}
      <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 className="text-lg font-medium text-gray-500">
          Application #{applicant?.applicationId}
        </h3>
        <button className="px-5 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
          Reject Application
        </button>
      </div>

      {/* Progress & Stepper */}
      <div className="px-8 py-6 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-900">Review Progress</span>
          <span className="text-sm font-medium text-gray-400">{currentStep} of 5</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Stepper Icons */}
        <div className="flex items-center justify-between px-4">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-[#005F02] text-white' : 
                    isActive ? 'bg-[#005F02] text-white shadow-md scale-110' : 
                    'bg-[#A5D6A7] text-white opacity-50'
                  }`}>
                    {isCompleted ? <FiCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[11px] font-bold text-center max-w-[80px] leading-tight ${
                    isActive ? 'text-[#005F02]' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 flex justify-center mb-6">
                    <FiChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-4 bg-white border-t border-gray-100">
        <ReviewStepContent step={currentStep} applicant={applicant} />
      </div>

      {/* Workflow Footer */}
      <div className="p-6 bg-[#F9FBF9] border-t border-gray-100 flex items-center justify-between shrink-0">
        <button 
          onClick={onPrev}
          disabled={currentStep === 1}
          className={`px-8 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
          <button 
            onClick={currentStep === 5 ? onClose : onNext}
            className={`px-10 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${
              currentStep === 5 
                ? 'bg-[#005F02] hover:bg-[#004d02] text-white' 
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {currentStep === 5 ? 'Approve & Notify' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewStepContent({ step, applicant }) {
  switch (step) {
    case 1: return <Step1Content applicant={applicant} />;
    case 2: return <Step2Content applicant={applicant} />;
    case 3: return <Step3Content applicant={applicant} />;
    case 4: return <Step4Content applicant={applicant} />;
    case 5: return <Step5Content applicant={applicant} />;
    default: return null;
  }
}

function Step1Content({ applicant }) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="space-y-3">
        {/* Alert */}
        <div className="bg-[#EBF5FF] border border-[#E1EFFE] p-4 rounded-sm flex gap-2">
          <FiAlertCircle className="w-5 h-5 text-[#3F83F8] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#1E429F]">Document Verification</h4>
            <p className="text-xs text-[#1E429F] mt-1 leading-relaxed opacity-80">
              Carefully review the government-issued ID to ensure it's authentic, valid, and matches the applicant's information.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Info Box */}
          <div className="flex-1 bg-[#F3FAF7] border border-[#DEF7EC] rounded-sm p-6">
            <h5 className="text-sm font-bold text-[#057A55] mb-4">Resident Information Verified</h5>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
              <div>
                <p className="text-[11px] text-[#057A55] opacity-60">Full Name</p>
                <p className="font-bold text-[#046C4E]">{applicant.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#057A55] opacity-60">ID Number</p>
                <p className="font-bold text-[#046C4E]">{applicant.applicationId}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[11px] text-[#057A55] opacity-60">Address</p>
                <p className="font-bold text-[#046C4E] leading-tight">{applicant.address}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#057A55] opacity-60">Civil Status</p>
                <p className="font-bold text-[#046C4E]">{applicant.civilStatus || 'Single'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#057A55] opacity-60">Date of Birth</p>
                <p className="font-bold text-[#046C4E]">{applicant.dob || '01/01/2001'}</p>
              </div>
            </div>
          </div>

          {/* ID Preview */}
          <div className="w-[300px] shrink-0 space-y-3">
            <div 
              onClick={() => setIsZoomed(true)}
              className="aspect-[1.6/1] bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-center relative group cursor-zoom-in overflow-hidden shadow-sm"
            >
              <img 
                src="/src/assets/images/national_id_placeholder.png" 
                alt="National ID Preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <div className="bg-white/90 px-3 py-1.5 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 shadow-sm">
                  <FiZoomIn className="w-4 h-4 text-gray-600" />
                  <span className="text-[11px] font-bold text-gray-600">Click to Zoom</span>
                </div>
              </div>
            </div>
            <p className="text-[14px] font-semibold text-gray-600 text-center">
              {applicant.validIdType} - {applicant.idNumber || '1234-5678-9012-3456'}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="border border-gray-100 rounded-sm p-4">
          <h5 className="text-sm font-bold text-gray-900 mb-4">Verification Checklist</h5>
          <div className="space-y-3">
            {[
              'ID photo is clear and of good quality',
              'All information on the ID is readable and legible',
              'ID appears to be authentic and not expired',
              "Photo on ID matches the applicant's submitted information"
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-black checked:border-black transition-all" />
                  <FiCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Zoomed Overlay */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-10 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl w-full aspect-[1.6/1] bg-white rounded-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <img 
              src="/src/assets/images/national_id_placeholder.png" 
              alt="National ID Zoomed"
              className="w-full h-full object-contain"
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
              className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step2Content({ applicant }) {
  return (
    <div className="space-y-3">
      <div className="bg-[#EBF5FF] border border-[#E1EFFE] p-4 rounded-sm flex gap-3">
        <FiUser className="w-5 h-5 text-[#3F83F8] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#1E429F]">Final Identity Confirmation</h4>
          <p className="text-xs text-[#1E429F] mt-1 leading-relaxed opacity-80">
            Perform a final review to confirm the applicant's identity and ensure all information is accurate.
          </p>
        </div>
      </div>

      <div className="bg-[#F3FAF7] border border-[#DEF7EC] rounded-sm  p-5">
        <h5 className="text-sm font-bold text-[#057A55] mb-4">Resident Information Verified</h5>
        <div className="grid grid-cols-3 gap-y-6 text-sm">
          <div>
            <p className="text-[11px] text-[#057A55] opacity-60">Full Name</p>
            <p className="font-bold text-[#046C4E]">{applicant.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#057A55] opacity-60">ID Number</p>
            <p className="font-bold text-[#046C4E]">{applicant.applicationId}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#057A55] opacity-60">Government ID Type</p>
            <p className="font-bold text-[#046C4E]">{applicant.validIdType}</p>
          </div>
          <div className="col-span-1">
            <p className="text-[11px] text-[#057A55] opacity-60">Address</p>
            <p className="font-bold text-[#046C4E] leading-tight">{applicant.address}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#057A55] opacity-60">Civil Status</p>
            <p className="font-bold text-[#046C4E]">{applicant.civilStatus || 'Single'}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#057A55] opacity-60">Government ID Number</p>
            <p className="font-bold text-[#046C4E]">NID-1234-5678-9012</p>
          </div>
          <div>
            <p className="text-[11px] text-[#057A55] opacity-60">Date of Birth</p>
            <p className="font-bold text-[#046C4E]">{applicant.dob || '01/01/2001'}</p>
          </div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-sm p-6">
        <h5 className="text-sm font-bold text-gray-900 mb-4">Final Confirmation Checklist</h5>
        <div className="space-y-3">
          {[
            'Name on government ID matches application information exactly',
            'Photos appear authentic with no signs of tampering or manipulation',
            'No red flags or inconsistencies found during the verification process'
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-black checked:border-black transition-all" />
                <FiCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Content({ applicant }) {
  return (
    <div className="space-y-3">
      <div className="bg-[#EBF5FF] border border-[#E1EFFE] p-4 rounded-sm flex gap-3">
        <FiMapPin className="w-5 h-5 text-[#3F83F8] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#1E429F]">Address Validation</h4>
          <p className="text-xs text-[#1E429F] mt-1 leading-relaxed opacity-80">
            Verify that the applicant's address is within the barangay jurisdiction and matches the information provided.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-[#F3FAF7] border border-[#DEF7EC] rounded-sm p-5">
          <h5 className="text-sm font-bold text-[#057A55] mb-4">Resident Information Verified</h5>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-[#057A55] opacity-60">Full Address</p>
              <p className="font-bold text-[#046C4E] leading-tight text-sm">
                {applicant.address}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-5">
          <h5 className="text-sm font-bold text-gray-900 mb-4">ID Address Information</h5>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-gray-400">Full Address</p>
              <p className="font-bold text-gray-800 leading-tight text-sm">
                #71 Dahlia Avenue<br />St. Brgy San<br />Bartolome
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-6">
        <h5 className="text-sm font-bold text-gray-900 mb-4">Final Confirmation Checklist</h5>
        <div className="space-y-3">
          {[
            'Address is confirmed to be within Barangay San Sanderiana jurisdiction',
            'Address on government ID matches the submitted application address',
            'Address can be verified through barangay records or database'
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-black checked:border-black transition-all" />
                <FiCheck className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Content({ applicant }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#F3FAF7] border border-[#DEF7EC] p-4 rounded-xl flex gap-3">
        <FiCreditCard className="w-5 h-5 text-[#057A55] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#03543F]">eID Generation</h4>
          <p className="text-xs text-[#03543F] mt-1 leading-relaxed opacity-80">
            Verify that the applicant's address is within the barangay jurisdiction and matches the information provided.
          </p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl p-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <FiCreditCard className="w-10 h-10 text-[#005F02]" />
        </div>
        <h5 className="text-lg font-bold text-gray-900 mb-2">Generated eID Number</h5>
        <div className="bg-[#F3FAF7] border border-[#DEF7EC] px-8 py-3 rounded-lg mb-2 relative group">
          <span className="text-2xl font-bold text-[#005F02] tracking-widest">2026-123-12</span>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2">
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium text-center max-w-[200px] mb-6">
          This unique identifier will be permanently associated with {applicant.name}
        </p>
        <button className="px-6 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          Regenerate eID
        </button>
      </div>

      <div className="border border-gray-100 rounded-xl p-6">
        <h5 className="text-sm font-bold text-gray-900 mb-6">eID Details</h5>
        <div className="grid grid-cols-2 gap-y-8">
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Resident Name</p>
            <p className="text-sm font-bold text-gray-900">{applicant.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">eID Number</p>
            <p className="text-sm font-bold text-gray-900">2026-123-12</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Issue Date</p>
            <p className="text-sm font-bold text-gray-900">March 21, 2026</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Status</p>
            <p className="text-sm font-bold text-gray-900">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5Content({ applicant }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#F3FAF7] border border-[#DEF7EC] p-4 rounded-sm flex gap-3">
        <FiCheckCircle className="w-5 h-5 text-[#057A55] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#03543F]">Ready for Approval</h4>
          <p className="text-xs text-[#03543F] mt-1 leading-relaxed opacity-80">
            All verification steps are complete for {applicant.name}. Click "Approve & Notify" to finalize the application.
          </p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-sm p-6">
        <h5 className="text-sm font-bold text-gray-900 mb-4">Notification Preview</h5>
        <div className="bg-gray-50 rounded-xl p-5 space-y-4 font-inter">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Recipient</p>
            <p className="text-sm font-bold text-gray-900">{applicant.name}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Email</p>
            <p className="text-sm font-bold text-gray-600">{applicant.email}</p>
          </div>
          <hr className="border-gray-200" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Message</p>
            <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
              <p className="text-[11px] font-bold text-gray-900 mb-3">Barangay eID Application Approved</p>
              <div className="text-[10px] space-y-2 text-gray-500 leading-relaxed">
                <p>Dear {applicant.name},</p>
                <p>Your barangay eID application has been approved.</p>
                <p>Your eID number is: <span className="font-bold text-gray-900">2026-659-12</span></p>
                <p>Please visit the barangay office to claim your official ID.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#EBF5FF] border border-[#E1EFFE] p-4 rounded-sm flex gap-3">
        <FiInfo className="w-5 h-5 text-[#3F83F8] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#1E429F]">Final Review Summary</h4>
          <ul className="text-xs text-[#1E429F] mt-2 space-y-1.5 font-medium">
            <li className="flex items-center gap-2">• Document verification: Complete</li>
            <li className="flex items-center gap-2">• Address validation: Complete</li>
            <li className="flex items-center gap-2">• Identity confirmation: Complete</li>
            <li className="flex items-center gap-2">• eID generated: 2026-659-12</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
