import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RiArrowDropDownLine } from "react-icons/ri";

/**
 * A reusable select component that matches the "Head Name" design.
 * Now uses Portals to overlap modal containers and footers.
 * 
 * @param {Object} props
 * @param {Component} props.icon - Icon component to display on the left (optional)
 * @param {string} props.placeholder - Placeholder text when no value is selected
 * @param {string} props.value - Currently selected value
 * @param {Array} props.options - Array of { value, label } objects
 * @param {function} props.onChange - Callback function when an option is selected
 * @param {string} props.className - Additional class names for the container
 */
export default function FormSelect({
    icon: Icon,
    placeholder = 'Select option',
    value,
    options = [],
    onChange,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyles, setMenuStyles] = useState(null);
    const containerRef = useRef(null);
    const menuRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width === 0) return;

        const dropdownHeight = Math.min(options.length * 42 + 10, 300);
        const spaceBelow = window.innerHeight - rect.bottom - 10;
        const spaceAbove = rect.top - 10;

        const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        const styles = {
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: 9999,
        };

        if (shouldOpenUpwards) {
            styles.bottom = `${window.innerHeight - rect.top + 4}px`;
        } else {
            styles.top = `${rect.bottom + 4}px`;
        }

        setMenuStyles(styles);
    }, [options.length]);

    const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const handleClose = () => setIsOpen(false);
            const handleScrollAndResize = () => updatePosition();

            const handleClickOutside = (e) => {
                if (menuRef.current && !menuRef.current.contains(e.target) &&
                    containerRef.current && !containerRef.current.contains(e.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScrollAndResize, true);
            window.addEventListener('resize', handleScrollAndResize);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', handleScrollAndResize, true);
                window.removeEventListener('resize', handleScrollAndResize);
            };
        }
    }, [isOpen, updatePosition]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={toggle}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] transition-colors group"
            >
                {Icon && (
                    <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 text-[#8C0B1A] group-focus-within:bg-emerald-50 transition-colors">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <span className={`flex-1 text-left px-4 py-2.5 ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <RiArrowDropDownLine
                    className={`w-7 h-7 text-gray-400 transition-transform mr-2 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && menuStyles && createPortal(
                <div
                    ref={menuRef}
                    style={menuStyles}
                    className="bg-white border border-gray-300 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-75"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onChange?.(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 hover:bg-emerald-50/50 flex items-center justify-between transition-colors ${value === option.value ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-gray-700'
                                    }`}
                            >
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}


