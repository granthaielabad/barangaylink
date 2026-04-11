import { NavBar } from '../../../layout'
import { Footer } from '../../../layout'
import { Background } from '../../../shared'
import { ContentCard } from '../../../shared'

export default function Terms() {
  return (
    <>
      <NavBar />
      <Background>
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-6xl lg:text-[100px] font-bold text-center">Terms of Service</h1>
        </div>
      </Background>
      
      <section className='w-full bg-gray-50 py-12 md:py-20 px-4 md:px-8'>
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-[#005F02] px-4">Terms of Service</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
            <ContentCard
              title="Acceptance of Terms"
              intro="By accessing and using the Resident and Household Registry System (&quot;System&quot;) , you agree to be bound by these Terms of Service. If you do not agree with any part of these Terms, you must not use the System."
            />
            <ContentCard
              title="System Description"
              intro="The Resident and Household Registry System is a computerized barangay information management system designed to: "
              items={[
                'Store, manage, and retrieve resident and household records efficiently.',
                'Provide analytics and incident reporting features.',
                'Generate digital barangay IDs with QR codes.',
                'Support faster, more secure barangay transactions and services.',
                'The System is intended strictly for official barangay operations.',
              ]}
            />
            <ContentCard
              title="Eligibility and Authorized Use"
              intro="Only authorized barangay officials and personnel with valid accounts are allowed to access and use the System. Users are responsible for maintaining the confidentiality of their login credentials and for all activities performed under their accounts."
            />
            <ContentCard
              title="User Responsibilities"
              intro="By using the System, you agree to:"
              items={[
                'Provide accurate, complete, and up-to-date information.',
                'Use the System solely for legitimate barangay purposes.',
                'Avoid unauthorized access, data manipulation, or misuse of information.',
                'Comply with applicable laws and regulations related to data privacy and information security.',
              ]}
            />
            <ContentCard
              title="Data Privacy and Security"
              intro="The System is designed to protect sensitive resident information. All data: "
              items={[
                'Is collected and used solely for official barangay functions.',
                'Is not shared with third parties without legal basis or proper authorization.',
                'Is protected through authentication, authorization, and security controls.',
                'The System does not automatically verify resident information with national government databases.',
              ]}
            />
            <ContentCard
              title="Digital Barangay ID and QR Code"
              intro="The digital barangay ID with QR code is intended for secure and efficient resident identification. Any unauthorized use, duplication, falsification, or improper scanning of QR codes is strictly prohibited."
            />
            <ContentCard
              title="System Availability and Limitations" 
              intro=" "
              items={[
                'The System is limited to managing data within the barangay.',
                'Financial transactions and budgeting are not included.',
                'Health, education, and social welfare case management are not covered.',
                'System availability may be affected by maintenance or technical issues.',
              ]}
            />
            <ContentCard
              title="Limitation of Liability"
              intro="The barangay and system developers shall not be held liable for errors caused by incorrect user input, temporary system downtime, or data loss."
            />
            <ContentCard
              title="Termination of Access"
              intro="Access to the System may be suspended or terminated if a user violates these Terms or is no longer authorized to use the System."
            />
          </div>
        </div>
      </section>
      <footer>
        <Footer />
      </footer>
    </>
  )
}
