import { NavBar } from '../../../layout'
import { Footer } from '../../../layout'
import { Background } from '../../../shared'
import InformationUser from '../../../assets/icons/information-users.svg'
import Checklist from '../../../assets/icons/check-list.svg'
import Protect from '../../../assets/icons/protect-users.svg'
import Rights from '../../../assets/icons/right-users.svg'
import InformationUser2 from '../../../assets/icons/information-users2.svg'
import Share from '../../../assets/icons/share-users.svg'
import Mail from '../../../assets/icons/mail-users.svg'

export default function Privacy() {
  return (
    <>
      <NavBar />
      <Background>
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-6xl lg:text-[100px] font-bold text-center">Privacy Policy</h1>
        </div>
      </Background>
      <section className='w-full bg-gray-50'>
        <div className="py-12 md:py-20 px-4 md:px-8 lg:px-12 container mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#005F02]">Privacy Policy</h1>
            <p className="text-base md:text-lg mb-10 leading-relaxed">
                The Resident and Household Registry System values the privacy and protection of personal information of all residents and barangay officials. This Privacy Policy explains how the system collects, uses, stores, and protects personal data in compliance with data privacy standards and to ensure secure barangay services.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-32">

                {/* Left */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                    <img src={InformationUser} alt="Privacy Policy" className="w-8 h-full md:w-auto" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#005F02]"> Information We Collect</h3>
                    </div>
                    <p className="text-base md:text-lg mb-4 leading-relaxed">
                        The system collects and processes information necessary for maintaining accurate and organized resident and household records.                   
                    </p> 
                    {/* Bullet Points */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-1" />
                            <p className="text-lg">
                                <b>Resident Information:</b> Full name, Address and household details, Contact number and email address, Date of birth and gender, Identification details for digital barangay ID.
                            </p>
                        </div>
                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-1" />
                            <p className="text-lg">
                                <b>Household Information:</b> Household members and relationships, Property or housing information.
                            </p>

                        </div>
                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-1" />
                            <p className="text-lg">
                                <b>System Records:</b> Incident and complaint reports, System login and activity records.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3 mt-10">
                    <img src={Protect} alt="Privacy Policy" className="w-8 h-full md:w-auto" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#005F02]"> How We Protect Your Information</h3>
                    </div>
                    <p className="text-base md:text-lg mb-4 leading-relaxed">
                        The system implements security measures to safeguard personal data, including:                   
                    </p> 
                    {/* Bullet Points */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Secure login authentication and authorization
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Encrypted and protected database storage
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Restricted system access for authorized personnel only
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Protection against data duplication, loss, or unauthorized access
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Secure login authentication and authorization
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3 mt-10">
                    <img src={Rights} alt="Privacy Policy" className="w-8 h-full md:w-auto" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#005F02]"> Your Rights</h3>
                    </div>
                    <p className="text-base md:text-lg mb-4 leading-relaxed">
                        Residents have the right to:                  
                    </p> 
                    {/* Bullet Points */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Access and review their personal information
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Request corrections of inaccurate or outdated data
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Request deletion of records, subject to barangay regulations
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                Be informed about how their data is used
                            </p>
                        </div>

                    </div>
                </div>

                {/* Right */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <img src={InformationUser2} alt="Privacy Policy" className="w-8 h-full md:w-auto" />
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#005F02]"> How We Use Your Information</h3>
                    </div>
                    <p className="text-base md:text-lg mb-4 leading-relaxed">
                        Collected information is used for the following purposes:                  
                    </p> 
                    {/* Bullet Points */}
                    <div className="space-y-1">
                        <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                To maintain and manage resident and household records
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                To generate digital barangay IDs with QR codes for identification
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                 To support barangay transactions and services
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                To analyze incident reports and identify risk areas
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                To improve service delivery and decision-making of barangay official
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                 To ensure system security and monitoring
                            </p>
                        </div>
                    </div>

                        <div className="flex items-center gap-3 mb-3 mt-10">
                        <img src={Share} alt="Privacy Policy" className="w-8 h-full md:w-auto" />
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#005F02]"> Sharing of Information</h3>
                    </div>
                    <p className="text-base md:text-lg mb-4 leading-relaxed">
                        Personal information will not be sold or shared with unauthorized third parties. Information may only be shared under the following conditions:                 
                    </p> 
                    {/* Bullet Points */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                When required by law or government regulation
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                When necessary for official barangay transactions
                            </p>
                        </div>

                            <div className="flex items-start gap-3 mb-10">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                 When consent is given by the resident
                            </p>
                        </div>

                    </div>
                        <div className="flex items-center gap-3 mb-3">
                        <img src={Mail} alt="Privacy Policy" className="w-8 h-full md:w-auto" />
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#005F02]"> Contact Us</h3>
                    </div>
                    <p className="text-base md:text-lg mb-4 leading-relaxed">
                        For questions, concerns, or requests regarding data privacy, residents may contact the barangay office through:                 
                    </p> 
                    {/* Bullet Points */}
                    <div className="space-y-2 ">
                        <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                <b>Barangay Office:</b>  123 Barangay San Bartolome, Quezon City
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                <b>Contact Number:</b> (0912) 345-6789
                            </p>
                        </div>

                            <div className="flex items-start gap-3">
                            <img src={Checklist} alt="Checklist Icon" className="w-5 h-5 mt-0.5" />
                            <p className="text-lg">
                                 <b>Official Email Address:</b> info@brgy123.ph
                            </p>
                        </div>
    
                    </div>
                </div>

            </div>

            {/* Bottom */}
            <div className="mt-10 md:mt-16">
                <h3 className='font-bold text-2xl md:text-4xl text-[#005F02]'>Policy Changes</h3>
                <p className="text-base md:text-lg mt-4 leading-relaxed">
                    This Privacy Policy may be updated to improve system security and compliance with regulations. Residents will be informed of major updates through system notifications or official announcements.
                </p>
            </div>
        </div>

      </section>
      <footer>
        <Footer />
      </footer>
    </>
  )
}