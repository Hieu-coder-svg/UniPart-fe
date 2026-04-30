/**
 * Unauthorized Page
 * Design: Modern Enterprise Minimalism
 */

import { Link } from "wouter";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundAlt">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-error mb-4">403</h1>
        <h2 className="text-2xl font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-secondary mb-8">You don't have permission to access this resource.</p>
        <Link href="/">
          <a className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors">
            Go to Home
          </a>
        </Link>
      </div>
    </div>
  );
}
