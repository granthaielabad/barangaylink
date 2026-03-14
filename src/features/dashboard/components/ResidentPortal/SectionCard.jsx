
function SectionCard({ icon: SectionIcon, title, children, className }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className ?? ''}`}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <SectionIcon className="w-8 h-8" />
        <h2 className="font-bold text-gray-900 text-[24px]">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default SectionCard;