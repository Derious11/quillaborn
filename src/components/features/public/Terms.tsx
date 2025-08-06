"use client";

import { useState } from "react";
import { FileText, LockKeyhole, ShieldCheck, UserCheck, Receipt, FlaskConical, Ban, SearchCheck, Globe2, Scale, Mail, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";

export default function TermsOfService() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-950"></div>
      <div className="absolute inset-0 opacity-50 bg-gray-900"></div>
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-float hidden lg:block"></div>
      <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-float hidden lg:block"></div>

      <div className="relative z-10">
        <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
        <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />

        <main className="px-6 py-16 max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-heading font-bold text-white flex justify-center items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" /> Terms of Service
            </h1>
            <p className="text-lg text-gray-300">Effective Date: [07/27/2025]</p>
            <p className="text-gray-400">
              Welcome to Quillaborn! These Terms of Service (“Terms”) govern your use of our platform at [quillaborn.com] and all related services.
              By creating an account or using the platform, you agree to these Terms.
            </p>
          </div>

          <section className="space-y-8 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                1. Your Content, Your Rights
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>You retain full ownership of all original content you upload to Quillaborn.</li>
                <li>You may choose predefined IP agreements during project setup.</li>
                <li>Quillaborn does not claim any rights to your content.</li>
                <li>You grant us a limited license to display your work for platform operations.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <LockKeyhole className="w-5 h-5 text-green-400" /> 2. NSFW & Mature Content
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>NSFW content is allowed only in age-gated areas.</li>
                <li>You must be 18+ and verify your age.</li>
                <li>Follow all NSFW community guidelines.</li>
                <li>No illegal, exploitative, or non-consensual content.</li>
                <li>Violations may result in suspension or ban.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" /> 3. Acceptable Use
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Respect others and their boundaries.</li>
                <li>Do not harass, abuse, spam, or impersonate others.</li>
                <li>Do not post hateful, illegal, or harmful content.</li>
                <li>Only use Quillaborn for creative collaboration.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-400" /> 4. Account Responsibility
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>You are responsible for your account activity and security.</li>
                <li>Do not share login credentials.</li>
                <li>Notify us if your account is compromised.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-400" /> 5. Subscriptions & Payments
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Fees are billed monthly or annually.</li>
                <li>Cancel anytime, access lasts through billing period.</li>
                <li>No refunds unless required by law.</li>
                <li>Prices may change with notice.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-green-400" /> 6. Beta Features
              </h2>
              <p>Some features are experimental and may change or break. Use at your own discretion—we appreciate your feedback!</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Ban className="w-5 h-5 text-green-400" /> 7. Termination
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>We may suspend/terminate accounts for violations or abuse.</li>
                <li>You may delete your account anytime via settings.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <SearchCheck className="w-5 h-5 text-green-400" /> 8. Content Moderation
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Community reports</li>
                <li>Moderator oversight</li>
                <li>AI-assisted tagging</li>
              </ul>
              <p>You may appeal moderation actions if you believe there was an error.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-green-400" /> 9. Platform Availability
              </h2>
              <p>We aim for 99.9% uptime but cannot guarantee service. Backup your files regularly.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Scale className="w-5 h-5 text-green-400" /> 10. Legal Stuff
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Governed by the laws of [Your State/Country]</li>
                <li>Not liable for user-posted content</li>
                <li>Terms may change—we will notify you</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-400" /> 11. Contact
              </h2>
              <p>Questions? Reach out to <a href="mailto:support@quillaborn.com" className="underline text-green-400">support@quillaborn.com</a></p>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-green-400" /> Summary (Not Legally Binding)
              </h2>
                              <p className="mt-2">You own your stuff. Be kind and respectful. Don&apos;t be gross. We&apos;re here to help you create amazing things with others.</p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}