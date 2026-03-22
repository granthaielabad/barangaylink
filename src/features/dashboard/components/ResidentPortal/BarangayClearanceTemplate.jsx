// Universal document template for all barangay certificates.
// Renders as a printable/downloadable HTML document.
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}


export default function BarangayClearanceTemplate({
  resident,
  requestId,
  documentType = 'Barangay Clearance',
  purpose,
  issuedAt,
}) {
  const fullName = [
    resident?.last_name,
    resident?.first_name,
    resident?.middle_name,
    resident?.suffix,
  ].filter(Boolean).join(', ').replace(', ', ', ') || '—';

  const fullNameFormal = [
    resident?.first_name,
    resident?.middle_name,
    resident?.last_name,
    resident?.suffix,
  ].filter(Boolean).join(' ') || '—';

  const isIndigency = documentType === 'Certificate of Indigency';
  const isResidency = documentType === 'Certificate of Residency';

  // Body text varies per document type
  const bodyText = isIndigency
    ? `This is to certify that <strong>${fullNameFormal}</strong>, of legal age, ${
        resident?.civil_status ?? 'single'
      }, Filipino citizen, and a bonafide resident of Barangay San Bartolome, Novaliches, Quezon City, is known to be an <strong>INDIGENT</strong> member of this barangay and belongs to one of the least privileged families in the community.`
    : isResidency
    ? `This is to certify that <strong>${fullNameFormal}</strong>, of legal age, ${
        resident?.civil_status ?? 'single'
      }, Filipino citizen, is a <strong>bonafide resident</strong> of Barangay San Bartolome, Novaliches, Quezon City, with address at ${
        resident?.address_line ?? '—'
      }, and has been residing therein for a considerable period of time.`
    : `This is to certify that <strong>${fullNameFormal}</strong>, of legal age, ${
        resident?.civil_status ?? 'single'
      }, Filipino citizen, and a bonafide resident of Barangay San Bartolome, Novaliches, Quezon City, with address at ${
        resident?.address_line ?? '—'
      }, is personally known to this office and is of <strong>good moral character and good standing</strong> in the community.`;

  const purposeText = purpose
    ? `This certification is issued upon the request of the above-named individual for the purpose of <strong>${purpose}</strong> and for whatever legal purpose it may serve.`
    : 'This certification is issued upon the request of the above-named individual for whatever legal purpose it may serve.';

  return (
    <div className="bg-white mx-auto shadow-sm"
      style={{ maxWidth: '720px', minHeight: '1000px', fontFamily: 'Times New Roman, serif', padding: '48px 60px' }}>

      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-600 tracking-widest uppercase">Republic of the Philippines</p>
        <p className="text-xs text-gray-600">City of Quezon</p>
        <p className="text-sm font-bold text-gray-800 mt-1">BARANGAY SAN BARTOLOME</p>
        <p className="text-xs text-gray-600">Novaliches, Quezon City</p>
        <div className="border-t-2 border-b-2 border-[#005F02] my-4 py-2">
          <p className="text-xl font-black text-[#005F02] tracking-wider uppercase">{documentType}</p>
        </div>
        <p className="text-xs text-gray-500">Control No.: <span className="font-semibold">{requestId ?? '—'}</span></p>
      </div>

      {/* Salutation */}
      <p className="text-sm mb-6 text-gray-700">TO WHOM IT MAY CONCERN:</p>

      {/* Body */}
      <div className="text-sm leading-relaxed text-gray-800 space-y-4 mb-6 text-justify">
        <p dangerouslySetInnerHTML={{ __html: bodyText }} />
        <p dangerouslySetInnerHTML={{ __html: purposeText }} />
      </div>

      {/* Issuance */}
      <p className="text-sm text-gray-700 mb-12">
        Issued this <strong>{fmt(issuedAt)}</strong> at the Office of the Barangay Captain, San Bartolome, Novaliches, Quezon City.
      </p>

      {/* Signature */}
      <div className="flex justify-between items-end mt-16">
        <div className="text-center">
          <div className="border-t border-gray-800 w-48 pt-1">
            <p className="text-xs font-semibold text-gray-800">Requesting Party Signature</p>
            <p className="text-[10px] text-gray-500">{fullNameFormal}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-800 w-48 pt-1">
            <p className="text-xs font-bold text-gray-800 uppercase">Barangay Captain</p>
            <p className="text-[10px] text-gray-500">San Bartolome, Novaliches, Quezon City</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 mt-12 pt-4 text-center">
        <p className="text-[9px] text-gray-400 tracking-wider">
          BARANGAY SAN BARTOLOME • NOVALICHES, QUEZON CITY • PHILIPPINES
        </p>
        <p className="text-[9px] text-gray-400">
          This document is electronically generated by BarangayLink. Control No.: {requestId ?? '—'}
        </p>
      </div>
    </div>
  );
}