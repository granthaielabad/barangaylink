import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineArrowDownTray, HiChevronDown } from 'react-icons/hi2';
import {
  PiFilePdfLight,
  PiFileDocLight,
  PiFileCsvLight,
  PiFileXlsLight,
} from 'react-icons/pi';

const EXPORT_OPTIONS = [
  { label: 'Docx', icon: PiFileDocLight, format: 'docx' },
  { label: 'Pdf',  icon: PiFilePdfLight, format: 'pdf'  },
  { label: 'Excel(.xlsx)', icon: PiFileXlsLight, format: 'xlsx' },
  { label: 'CSV',  icon: PiFileCsvLight, format: 'csv'  },
];

export default function ExportButton({
  onExport,
  options = EXPORT_OPTIONS,
  label = 'Export',
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef   = useRef(null);

  const calcPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top:  `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      minWidth: `${rect.width}px`,
      zIndex: 9999,
    });
  };

  const toggle = () => {
    if (!open) calcPosition();
    setOpen(o => !o);
  };

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current   && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const reposition = () => calcPosition();
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const handleSelect = (format) => {
    setOpen(false);
    onExport?.(format);
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#256427] transition-colors duration-150 text-white text-sm font-semibold shadow-sm select-none"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <HiOutlineArrowDownTray className="w-4 h-4" />
        {label}
        <span className="ml-1">
          <HiChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Dropdown portal */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {/* eslint-disable-next-line no-unused-vars */}
            {options.map(({ label: optLabel, icon: Icon, format }) => (
              <button
                key={format}
                type="button"
                onClick={() => handleSelect(format)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors group relative after:absolute after:bottom-0 after:left-1 after:right-1 after:border-b after:border-gray-200"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#2E7D32]  transition-colors shrink-0" />
                <span className="font-medium">{optLabel}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
