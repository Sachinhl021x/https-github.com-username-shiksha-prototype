import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Code, BookOpen, Info, Briefcase, Phone, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                S
              </div>
              <span className="font-bold text-xl tracking-tight">Shiksha</span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Advanced engineering resources and AI research for developers. Powered by GenAI4Code.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/engineering" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Code className="w-4 h-4" />
                  Engineering Guides
                </Link>
              </li>
              <li>
                <Link href="/research" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <BookOpen className="w-4 h-4" />
                  Research Insights
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Info className="w-4 h-4" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Briefcase className="w-4 h-4" />
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Phone className="w-4 h-4" />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Stay Updated</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get the latest engineering patterns and research.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full h-10 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white shadow hover:bg-gray-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Shiksha. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
