"use client";

import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import HeaderSimple from "@/components/layout/HeaderSimple";
import Footer from "@/components/layout/Footer";

export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <HeaderSimple />
      
      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-red-400">
              Early Access Required
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Thank you for your interest in Quillaborn! We're currently in early access mode and your account doesn't have access at this time.
            </p>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-3">
                To request early access, please contact our support team:
              </p>
              <a 
                href="mailto:support@quillaborn.com" 
                className="text-green-400 hover:text-green-300 font-medium"
              >
                support@quillaborn.com
              </a>
            </div>
            
            <p className="text-sm text-gray-400 mb-8">
              We'll review your request and get back to you as soon as possible.
            </p>
            
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

