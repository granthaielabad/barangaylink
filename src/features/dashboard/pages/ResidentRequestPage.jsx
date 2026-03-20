import { useState } from 'react';
import { FiFileText, FiHome, FiHeart, FiSearch, FiChevronRight, FiEye, FiClock } from 'react-icons/fi';
import { FaHandsHoldingChild } from "react-icons/fa6"
import RequestDocumentModal from '../components/ResidentPortal/RequestDocumentModal';
import DocumentPreviewModal from '../components/ResidentPortal/DocumentPreviewModal';
import PaymentModal from '../components/ResidentPortal/PaymentModal';
import { useMyResidentProfile } from '../../../hooks/queries/resident/useResidentPortal';

const AVAILABLE_DOCUMENTS = [
  {
    id: 'clearance',
    title: 'Barangay Clearance',
    description: 'Required for employment, business permits, and other legal purposes',
    fee: 50,
    processingTime: '3-5 business days',
    icon: <FiFileText className="w-8 h-8" />,
    iconBg: 'bg-[#E8F5E9]',
    iconColor: 'text-[#2E7D32]',
  },
  {
    id: 'residency',
    title: 'Certificate of Residency',
    description: 'Proves your residency in the barangay',
    fee: 50,
    processingTime: '3-5 business days',
    icon: <FiHome className="w-8 h-8" />,
    iconBg: 'bg-[#E8F5E9]',
    iconColor: 'text-[#2E7D32]',
  },
  {
    id: 'indigency',
    title: 'Certificate of Indigency',
    description: 'For medical, educational, or financial assistance purposes',
    fee: 'Free',
    processingTime: '3-5 business days',
    icon: <FaHandsHoldingChild className="w-8 h-8" />,
    iconBg: 'bg-[#E8F5E9]',
    iconColor: 'text-[#2E7D32]',
  },
];

const MOCK_REQUESTS = [
  {
    id: 'REQ-2024-001',
    title: 'Barangay Clearance',
    purpose: 'Employment Requirements',
    date: '3/15/2024',
    status: 'Approved',
    payment: 'Paid',
    txnRef: 'TXN-20240315-001',
    icon: <FiFileText className="w-5 h-5" />,
  },
  {
    id: 'REQ-2024-002',
    title: 'Certificate of Residency',
    purpose: 'School Enrollment',
    date: '3/15/2024',
    status: 'Pending',
    payment: 'Pending',
    txnRef: 'TXN-20240315-002',
    icon: <FiHome className="w-5 h-5" />,
  },
];

export default function ResidentRequestPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewReq, setPreviewReq] = useState(null);
  const [paymentReq, setPaymentReq] = useState(null);
  const { data: resident } = useMyResidentProfile();

  const handleRequest = (doc) => {
    setSelectedDoc(doc);
  };

  const handleSubmitRequest = (data) => {
    console.log('Submitting request:', data);
    setSelectedDoc(null);
  };

  return (
    <div className="max-w mx-8 space-y-10">
      
      {/* Available Documents Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Available Document</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_DOCUMENTS.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => handleRequest(doc)}
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
            >
              <div className={`w-14 h-14 ${doc.iconBg} ${doc.iconColor} rounded-sm flex items-center justify-center mb-6`}>
                {doc.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-base text-gray-500 mb-8 flex-1 leading-relaxed pr-14">
                {doc.description}
              </p>
              
              <div className="space-y-2 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Fee:</span>
                  <span className="font-semibold text-gray-900">{typeof doc.fee === 'number' ? `₱${doc.fee}` : doc.fee}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Processing:</span>
                  <span className="font-semibold text-gray-900">{doc.processingTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My Requests Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Requests</h2>
        
        <div className="space-y-4">
          {MOCK_REQUESTS.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon & Title Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 mb-2 bg-gray-100 text-[#005F02] rounded-sm flex items-center justify-center">
                    {req.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.title}</h3>
                    <p className="text-base text-gray-500">{req.purpose}</p>
                    <p className="text-[12px] text-gray-500 mt-1">
                      Request ID: <span className="font-medium">{req.id}</span> • Requested: {req.date}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`px-3 mx-auto py-1 rounded-md text-[12px] font-semibold ${
                      req.status === 'Approved' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'ml-6 bg-orange-50  text-orange-700'
                    }`}>
                      {req.status}
                    </span>
                    <p className="text-[12px] text-gray-600 font-medium">
                      Payment: <span className={req.payment === 'Paid' ? 'text-[#2E7D32]' : 'text-orange-600'}>{req.payment}</span>
                    </p>
                  </div>
                  
                  {req.status === 'Approved' ? (
                    <button 
                      onClick={() => setPreviewReq(req)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#005F02] text-white rounded-lg text-base font-semibold hover:bg-[#004A01] transition-colors"
                    >
                      <FiEye className="w-6 h-6" /> View
                    </button>
                  ) : (
                    <button 
                      onClick={() => setPaymentReq(req)}
                      className="px-6 py-2.5 border border-gray-200 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
              
              {/* Transaction Ref Footer */}
              <div className="px-6 py-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-500 font-medium">
                  Transaction Ref: {req.txnRef}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedDoc && (
        <RequestDocumentModal
          cert={selectedDoc}
          resident={resident}
          onClose={() => setSelectedDoc(null)}
          onSubmit={handleSubmitRequest}
        />
      )}

      {previewReq && (
        <DocumentPreviewModal
          req={previewReq}
          resident={resident}
          onClose={() => setPreviewReq(null)}
        />
      )}

      {paymentReq && (
        <PaymentModal
          req={paymentReq}
          onClose={() => setPaymentReq(null)}
          onConfirm={(method) => {
            console.log('Payment confirmed with method:', method);
            setPaymentReq(null);
          }}
        />
      )}
    </div>
  );
}
