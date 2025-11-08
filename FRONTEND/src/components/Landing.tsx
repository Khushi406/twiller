"use client"

import React, { useState } from "react";
import Authmodel from "./Authmodel";
import Link from "next/link";
import Image from "next/image";

const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleAuthAction = (e: React.MouseEvent<HTMLButtonElement>, mode: 'login' | 'signup') => {
    e.preventDefault(); // Prevent navigation if using next/link
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Container */}
      <div className="flex min-h-screen">
        {/* Left Side - Hero Image/Logo */}
        <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center relative">
          <div className="text-white flex items-center justify-center">
            {/* Large X Logo using Image */}
            <Image
              src="/x-logo.svg"
              alt="X Logo"
              width={350}
              height={350}
              className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px]"
              priority
            />
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 md:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-8">
              <Image
                src="/x-logo.svg"
                alt="X Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl font-bold tracking-tight">
                Happening now
              </h1>
              <h2 className="text-3xl font-bold">Join today.</h2>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Google Sign Up */}
              <button
                onClick={(e) => handleAuthAction(e, 'signup')}
                className="w-full bg-white text-black font-medium py-3 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>

              {/* Apple Sign Up */}
              <button
                onClick={(e) => handleAuthAction(e, 'signup')}
                className="w-full bg-white text-black font-medium py-3 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                <span>Sign up with Apple</span>
              </button>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-3 text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Create Account */}
              <Link href="/signup" passHref>
                <button
                  onClick={(e) => handleAuthAction(e, 'signup')}
                  className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-full hover:bg-blue-600 transition-colors duration-200"
                >
                  Create account
                </button>
              </Link>

              {/* Terms */}
              <p className="text-xs text-gray-500 leading-relaxed">
                By signing up, you agree to the{" "}
                <a href="#" className="text-blue-400 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-400 hover:underline">
                  Privacy Policy
                </a>
                , including{" "}
                <a href="#" className="text-blue-400 hover:underline">
                  Cookie Use
                </a>
                .
              </p>
            </div>

            {/* Sign In Section */}
            <div className="space-y-4 pt-8">
              <h3 className="text-xl font-bold">Already have an account?</h3>
              <Link href="/login" passHref>
                <button
                  onClick={(e) => handleAuthAction(e, 'login')}
                  className="w-full border border-gray-600 text-blue-400 font-medium py-3 px-6 rounded-full hover:bg-gray-900 transition-colors duration-200"
                >
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Authmodel
        isopen={showAuthModal}
        onClose={handleCloseModal}
        ininitalmode={authMode}
      />

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Download the X app
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Help Center
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Accessibility
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Ads info
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Blog
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Status
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Careers
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Brand Resources
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Advertising
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Marketing
            </a>
            <a href="#" className="hover:text-white transition-colors">
              X for Business
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Developers
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Directory
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Settings
            </a>
          </div>
          <div className="text-center text-gray-500 text-sm mt-4">
            © 2024 X Corp.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
