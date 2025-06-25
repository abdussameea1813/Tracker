// app/page.tsx
'use client'; // This directive makes the component a Client Component

import { useState } from 'react';
import { JobApplicationList } from '../components/JobApplicationList'; // Adjust path
import Link from 'next/link'; // Import Next.js Link component

import { PlusSquare } from "@deemlol/next-icons"; 

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0); // State to force list refresh

  const handleRefreshList = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-inter"> {/* Changed background to a very dark gray */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-white mb-12 tracking-tight"> {/* Changed text to white */}
          Manage Your Applications
        </h1>

        <div className="text-center mb-10">
          <Link 
            href="/add" 
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 focus:ring-offset-gray-950" // Added focus-ring-offset for dark background
          >
            <PlusSquare size={24} className='-ml-1 mr-3 text-white' /> {/* Ensured icon is white/light */}
            Add New Application
          </Link>
        </div>

        <JobApplicationList refreshKey={refreshKey} />
      </div>
    </main>
  );
}