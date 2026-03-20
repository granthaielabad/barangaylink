import React from 'react';

export default function BarangayClearanceTemplate({ resident, requestId }) {
  const fullName = [resident?.first_name, resident?.middle_name, resident?.last_name, resident?.suffix]
    .filter(Boolean).join(' ') || 'Murphy De Guzman Jr.';

  const docId = requestId || 'DOC-BC-2024-001';
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white p-4 border-[2px] border-[#005F02] rounded-sm shadow-sm max-w-3xl mx-auto font-serif text-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        {/* Background Watermark (Baka Kailanganin) */}
        <div className="w-96 h-96 border-[20px] border-[#005F02] rounded-full flex items-center justify-center text-[#005F02] text-9xl font-bold">
          B
        </div>
      </div>

      <div className="relative z-10 border border-[#005F02] p-8 min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="text-[#005F02] font-bold text-xl uppercase tracking-wider mb-1">Republic of the Philippines</h3>
          <h2 className="text-gray-900 font-bold text-2xl uppercase mb-1">BARANGAY SAN BARTOLOME</h2>
          <p className="text-gray-600 text-sm">Quezon City, NCR, Metro Manila</p>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-gray-900 font-bold text-3xl mb-1">Barangay Clearance</h1>
          <p className="text-gray-500 text-xs">Document ID: {docId}</p>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-8 text-sm leading-relaxed">
          <div>
            <p className="font-bold text-gray-900 mb-4">TO WHOM IT MAY CONCERN:</p>
            <p className="text-justify indent-8">
              This is to certify that <span className="font-bold underline text-gray-900">{fullName}</span>, 
              of legal age, with ID Number <span className="font-bold text-gray-900">{resident?.id_number || '1234-123-12'}</span>, is a 
              bonafide resident of <span className="font-bold text-gray-900">{resident?.address_line || 'St Dahlia Avenue St. Brgy. San Bartolome'}.</span>
            </p>
          </div>

          <p className="text-justify indent-8">
            This certification is issued upon the request of the above-named person for Employment requirement.
          </p>

          <div className="grid grid-cols-2 pt-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Date of Birth</p>
              <p className="font-bold text-gray-900">
                {resident?.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString('en-US') : '01/01/2001'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Civil Status</p>
              <p className="font-bold text-gray-900">{resident?.civil_status || 'Single'}</p>
            </div>
          </div>

          <div className="pt-4">
            <p>Issued this {currentDate}</p>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-16 flex justify-end">
          <div className="text-center w-64">
            <div className="border-t-2 border-gray-900 pt-2">
              <p className="font-bold text-gray-900 uppercase">BARANGAY CAPTAIN</p>
              <p className="text-xs text-gray-600">Punong Barangay</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-auto pt-10 text-center border-t border-gray-100 italic">
          <p className="text-[10px] text-gray-400">
            Not valid without official seal • Document ID: {docId}
          </p>
        </div>
      </div>
    </div>
  );
}
