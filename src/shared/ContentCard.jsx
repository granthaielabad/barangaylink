import Checklist from '../assets/icons/check-list.svg'

/**
 * Reusable content card with optional title, intro paragraph, and checkmark list.
 * Matches the Terms of Service / policy card design: white card, green title, body text, optional list with checkmarks.
 *
 * @param {string} title - Card heading (green, bold)
 * @param {string} [intro] - Optional introductory paragraph before list items
 * @param {string[]} [items] - Optional array of strings rendered as bullet list with green checkmarks
 * @param {React.ReactNode} [children] - Custom content (paragraphs, etc.); use instead of or in addition to intro/items
 * @param {string} [className] - Extra class names for the card wrapper
 */

export default function ContentCard({
  title,
  intro,
  items = [],
  children,
  className = '',
}) {
  return (
    <article className={`bg-white rounded-xl shadow-md p-5 md:p-6  ${className}`}>
      {title && (
        <h3 className="text-center text-lb md:text-xl font-bold text-[#8C0B1A] mb-6">
          {title}
        </h3>
      )}

      {/* Divider */}
      {title && intro && (
        <div
          role="separator"
          aria-hidden="true"
          className="mx-5 md:-mx-6 border-t border-gray-300 my-3"
        />
      )}

      {intro && (
        <p className="text-black text-base md:text-base leading-relaxed mb-4">
          {intro}
        </p>
      )}

      {items.length > 0 && (
        <ul className="space-y-2 list-none p-0 m-0">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <img
                src={Checklist}
                alt=""
                className="w-5 h-5 mt-0.5 shrink-0 text-[#8C0B1A]"
                aria-hidden
              />
              <span className="text-black text-base md:text-base leading-relaxed">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}

      {children}
    </article>
  );
}
``



