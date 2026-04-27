import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HiEllipsisVertical } from 'react-icons/hi2';

/**
 * Redone ActionDropdown component with robust Portal support and professional UI.
 * Addresses overlap issues in tables by rendering the menu at the body level.
 */
export default function ActionDropdown({ actions = [], trigger, align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyles, setMenuStyles] = useState({});
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef(null);
    const menuRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const dropdownHeight = actions.length * 42 + 20; // Refined height estimate
        const spaceBelow = window.innerHeight - rect.bottom - 20; // 20px buffer for bottom edge
        const spaceAbove = rect.top - 20; // 20px buffer for top edge

        // Open upwards if space below is insufficient OR if there's significantly more room above
        const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setOpenUpwards(shouldOpenUpwards);

        const styles = {
            position: 'fixed',
            left: align === 'right' ? `${rect.right}px` : `${rect.left}px`,
            transform: align === 'right' ? 'translateX(-100%)' : 'none',
            zIndex: 9999,
        };

        if (shouldOpenUpwards) {
            styles.top = `${rect.top - 8}px`;
            styles.transform += ' translateY(-100%)';
        } else {
            styles.top = `${rect.bottom + 8}px`;
        }

        setMenuStyles(styles);
    }, [actions.length, align]);

    const toggle = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            updatePosition();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen) {
            const handleEvents = () => {
                setIsOpen(false);
            };

            const handleScrollAndResize = () => {
                updatePosition();
            };

            document.addEventListener('mousedown', (e) => {
                if (menuRef.current && !menuRef.current.contains(e.target) &&
                    containerRef.current && !containerRef.current.contains(e.target)) {
                    setIsOpen(false);
                }
            });

            window.addEventListener('scroll', handleScrollAndResize, true);
            window.addEventListener('resize', handleScrollAndResize);

            return () => {
                window.removeEventListener('scroll', handleScrollAndResize, true);
                window.removeEventListener('resize', handleScrollAndResize);
            };
        }
    }, [isOpen, updatePosition]);

    return (
        <div className="relative inline-block leading-none" ref={containerRef}>
            {trigger ? (
                <div onClick={toggle} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={toggle}
                    className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 active:scale-95 ${isOpen ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100' : ''
                        }`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <HiEllipsisVertical className="w-5 h-5" />
                </button>
            )}

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={menuStyles}
                    className={`w-50 bg-white rounded-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors group ${action.className || 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {action.icon && (
                                <action.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${action.className?.includes('text-red') ? 'text-red-500' : 'text-gray-400 group-hover:text-emerald-600'
                                    }`} />
                            )}
                            <span className="font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}


