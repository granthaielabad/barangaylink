import multipleUsers from "../../../assets/icons/multiple-users.svg";
import idCard from "../../../assets/icons/id-cards.svg";

export default function Features() {
    const features = [
        {
            id: 1,
            title: "Registry of Barangay Inhabitants",
            icon: <img src={multipleUsers} alt="Multiple Users Icon" className="w-24 h-24 sm:w-32 sm:h-32 lg:w-[175px] lg:h-[175px]" loading="lazy" />
        },
        {
            id: 2,
            title: "Digital Barangay ID with QR Code",
            icon: <img src={idCard} alt="ID Card Icon" className="w-24 h-24 sm:w-32 sm:h-32 lg:w-[175px] lg:h-[175px]" loading="lazy" />
        },
    ];

    return (
        <section className="w-full py-10 sm:py-12 lg:py-15 bg-gray-50 px-4 sm:px-8 md:px-20 lg:px-40">
            {/* Text Header */}
            <div className="mb-10 sm:mb-16">
                <p className="text-lg font-semibold text-[#8C0B1A] mb-2">● Features</p>
                <h1 className="font-bold text-3xl sm:text-4xl text-[#8C0B1A]">What The System Offers</h1>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {features.map((feature) => (
                    <div
                        key={feature.id}
                        className="border-2 border-[#8C0B1A] rounded-lg p-8 sm:p-12 lg:p-15 flex flex-col items-center text-center bg-white hover:shadow-2xl transition-shadow duration-300"
                    >
                        {/* Icon */}
                        <div className="mb-4">
                            {feature.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-semibold text-[#8C0B1A]">
                            {feature.title}
                        </h3>
                    </div>
                ))}
            </div>
        </section>
    );
}

