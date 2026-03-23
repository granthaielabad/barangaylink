import { FiEye, FiClock, FiCheckCircle, FiPlayCircle, FiInfo } from 'react-icons/fi';

export default function ApplicantCard({ applicant, onReview }) {
  const {
    name,
    applicationId,
    submittedAt,
    address,
    contactNo,
    email,
    validIdType,
    status,
    currentStep,
    totalSteps,
    stepLabel,
    lastReviewedBy,
    lastReviewedAt,
    photoUrl,
    isComplete = false
  } = applicant;

  const getStatusStyles = () => {
    switch (status) {
      case 'Under Review':
        return 'bg-[#E8F0F8] text-[#1858D0] border-[#B8D8F8]';
      case 'Approval Pending':
        return 'bg-[#FFF4D6] text-[#C58F00] border-[#E6C36A]';
      default:
        return 'bg-gray-50  text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-6 relative mb-4">
      <div className="flex gap-6">
        {/* Photo */}
        <div className="shrink-0">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={photoUrl || 'https://via.placeholder.com/150'} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-[22px] font-semibold text-gray-900 leading-tight">{name}</h3>
              <p className="text-[14px] text-gray-400 mt-0.5">Application #: {applicationId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-sm text-[12px] font-semibold border ${getStatusStyles()}`}>
                {status}
              </span>
              <button 
                onClick={() => onReview?.(applicant)}
                className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all flex-shrink-0"
              >
                <FiEye className="w-4 h-4" />
                Review
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-5 mb-6">
            <div className="space-y-4">
              <DetailItem label="Submitted:" value={submittedAt} />
              <DetailItem label="Contact No.:" value={contactNo} />
              <DetailItem label="Valid ID Type:" value={validIdType} />
            </div>
            <div className="space-y-4 flex flex-col h-full">
              <DetailItem label="Address:" value={address} />
              <DetailItem label="Email:" value={email} />
              <div className="mt-auto">
                <span className="text-gray-400 text-[13px] font-medium italic">Est. Processing: 3-5 business days</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-5" />

          {/* Status & Progress Section */}
          <div className="space-y-4">
            {isComplete ? (
              <div className="flex items-center gap-2 text-[#005F02] text-[15px] font-semibold">
                <FiCheckCircle className="w-5 h-5 shrink-0" />
                <span>All verification steps completed - Ready for final approval</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#4686F2] text-[14px] font-semibold">
                  <FiPlayCircle className="w-5 h-5 shrink-0" />
                  <span>Currently at: {stepLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-gray-400 ">
                  <FiClock className="w-5 h-5 shrink-0" />
                  <span>Last reviewed by {lastReviewedBy} on {lastReviewedAt}</span>
                </div>
              </>
            )}

            <div className="space-y-2.5">
              <div className="flex gap-1.5 max-w-sm">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div 
                    key={step} 
                    className={`h-2.5 flex-1 rounded-full ${
                      step <= currentStep 
                        ? (isComplete ? 'bg-[#005F02]' : 'bg-[#4686F2]')
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[12px] text-gray-400 font-medium">
                {isComplete 
                  ? `${currentStep} of ${totalSteps} steps completed - Awaiting for approval`
                  : `${currentStep} of ${totalSteps} steps completed`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, className = "" }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400 text-[13px] font-medium">{label}</span>
      <span className={`text-gray-900 text-[15px] font-semibold leading-tight ${className}`}>{value}</span>
    </div>
  );
}
