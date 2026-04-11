import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { NavBar } from '../../../layout'
import { Footer } from '../../../layout'
import { Background } from '../../../shared'
import { useSubmitContactMessage } from '../../../hooks/queries/contact/useContact'
import Location from '../../../assets/icons/location.svg'
import PhoneNo from '../../../assets/icons/phone-no.svg'
import Phone from '../../../assets/icons/phone.svg'
import EmailRounded from '../../../assets/icons/email-rounded.svg'
import OfficeHour from '../../../assets/icons/office-hour.svg'

const contactSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  contact_number: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  concern: z.string().min(1, 'Please select a concern'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: '',
      email: '',
      contact_number: '',
      subject: '',
      concern: '',
      message: '',
    },
  })

  const { mutate: submitMessage, isPending } = useSubmitContactMessage()

  const onSubmit = (data) => {
    submitMessage(data, {
      onSuccess: () => {
        toast.success('Message sent successfully! We will get back to you soon.')
        reset()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to send message. Please try again.')
      },
    })
  }

  return (
    <>
      <NavBar />
      {/* Header Banner */}
      <Background>
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-6xl lg:text-[100px] font-bold text-center">
            Contact Us
          </h1>
        </div>
      </Background>

      {/* Main Content */}
      <section className="w-full bg-gray-50 py-12 md:py-20 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-[#005F02] px-4">Contact Us</h1>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] gap-8 lg:gap-10 xl:gap-14 items-start px-4">
            {/* Left Column – Contact info & help */}
            <div className="space-y-6 mb-6 lg:mb-0">
              {/* Contact Information Card */}
              <article className="bg-white font-semibold rounded-xl shadow-md p-5 md:p-6 border border-gray-200">
                <h3 className="text-left text-lg md:text-xl font-bold text-[#005F02] mb-4">
                  Contact Information
                </h3>
                <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
                <p className="text-base md:text-lg leading-relaxed mb-7">
                  <span className="font-semibold text-gray-800">
                    Barangay Resident & House Registry
                  </span>
                </p>
                <div className="space-y-8 mb-5 text-base md:text-lg leading-relaxed">
                  <div className="flex items-start gap-3">
                    <img
                      src={Location}
                      alt="Location"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">
                        Office Address:
                      </span>{' '}
                      123 Barangay San Bartolome, Quezon City
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={PhoneNo}
                      alt="Phone number"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">
                        Phone Number:
                      </span>{' '}
                      (0912) 345-6789
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={EmailRounded}
                      alt="Email"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">Email:</span>{' '}
                      info@brgy123.ph
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={OfficeHour}
                      alt="Office hours"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      <span className="font-semibold text-[#005F02]">
                        Office Hours:
                      </span>{' '}
                      Monday – Friday, 8:00 AM – 5:00 PM
                    </p>
                  </div>
                </div>
              </article>

              {/* Need Help Card */}
              <article className="bg-white rounded-xl font-semibold shadow-md p-5 md:p-6 border border-gray-200">
                <h3 className="text-left text-lg md:text-xl text-[#005F02] mb-4">
                  Need Help?
                </h3>
                <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
                <div className="space-y-3 text-base md:text-lg leading-relaxed mb-2">
                  <div className="flex items-start gap-3">
                    <p>
                      How to use the system? Visit our{' '}
                      <a
                        href="/faq"
                        className="text-[#07ACD2] underline underline-offset-2"
                      >
                        FAQ Page
                      </a>{' '}
                      for more information.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src={Phone}
                      alt="Emergency contact"
                      className="w-6 h-6 mt-0.5 shrink-0"
                    />
                    <p>
                      For emergencies, contact:{' '}
                      <span className="font-semibold">(0911) 123-4567</span>
                    </p>
                  </div>
                </div>
              </article>
            </div>

            {/* Right Column – Contact form */}
            <div className="rounded-xl shadow-md border border-gray-200 overflow-hidden bg-white">
              {/* Card Header */}
              <div className="bg-white px-5 md:px-6 pt-5">
                <h3 className="text-left text-2xl font-bold text-[#005F02] mb-4">
                  Contact Form
                </h3>
                <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
              </div>

              {/* Card Body */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-5 md:p-6 space-y-4 bg-white"
              >
                {/* Full Name */}
                <div>
                  <input
                    type="text"
                    {...register('full_name')}
                    className={`w-full rounded-md border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 text-sm md:text-base focus:outline-none`}
                    placeholder="Full Name"
                    disabled={isPending}
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 text-sm md:text-base focus:outline-none`}
                    placeholder="Email Address"
                    disabled={isPending}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <input
                    type="tel"
                    {...register('contact_number')}
                    className={`w-full rounded-md border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 text-sm md:text-base focus:outline-none`}
                    placeholder="Contact Number"
                    disabled={isPending}
                  />
                </div>

                {/* Subject + Select Concern combo row */}
                <div className={`w-full rounded-md border ${errors.subject || errors.concern ? 'border-red-500' : 'border-gray-300'} flex overflow-hidden bg-white`}>
                  <input
                    type="text"
                    {...register('subject')}
                    className="flex-1 px-3 py-2.5 text-sm md:text-base border-r border-gray-300 focus:outline-none"
                    placeholder="Subject"
                    disabled={isPending}
                  />
                  <select
                    {...register('concern')}
                    className="flex-1 px-3 py-2.5 text-sm md:text-base bg-white focus:outline-none"
                    defaultValue=""
                    disabled={isPending}
                  >
                    <option value="" disabled>
                      Select Concern
                    </option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="feedback">Feedback / Suggestions</option>
                    <option value="records">Resident / Household Records</option>
                  </select>
                </div>

                {/* Message */}
                <div className={`rounded-md border ${errors.message ? 'border-red-500' : 'border-gray-300'} overflow-hidden`}>
                  <div className="px-3 pt-2 mb-2 text-sm text-gray-700 font-semibold">Message</div>
                  <hr className="border-gray-300" />
                  <textarea
                    {...register('message')}
                    rows="5"
                    className="w-full px-3 pb-2 pt-1 text-sm md:text-base resize-none focus:outline-none"
                    placeholder="Enter your message here..."
                    disabled={isPending}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 w-full rounded-md bg-[#005F02] text-white font-semibold py-2.5 md:py-3 text-sm md:text-base hover:bg-[#004701] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Privacy Notice */}
          <div className="mt-10 mx-4 border border-gray-200 bg-white rounded-xl shadow-sm px-5 md:px-6 py-4">
            <h3 className="text-lg md:text-xl font-bold text-[#005F02] mb-2">
              Privacy Notice
            </h3>
            <hr className="mx-5 md:-mx-6 border-t border-gray-300 my-3" />
            <p className="font-bold text-sm md:text-base leading-relaxed text-gray-800">
              Your information will be kept confidential and used solely for
              official registry purposes.
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
