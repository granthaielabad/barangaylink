import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-linear-to-r from-[#000000] via-[#003A01] to-[#8C0B1A] flex flex-col sm:flex-row justify-between items-center w-full py-6 sm:py-8 bg-[#8C0B1A] text-white gap-3 sm:gap-0 px-6 sm:px-12">
            {/* Left Section */}
            <div>
                <p className="text-sm text-center sm:text-left">© 2024 BarangayLink. All rights reserved.</p>
            </div>
            {/* Right Section - Links */}
            <div className="flex justify-center gap-6">
                <Link to="/privacy" className="text-sm hover:underline transition-all">Privacy</Link>
                <Link to="/terms" className="text-sm hover:underline transition-all">Terms</Link>
                <Link to="/contact" className="text-sm hover:underline transition-all">Contact Us</Link>
            </div>
        </footer>
    );
}

