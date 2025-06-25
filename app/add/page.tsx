// app/add/page.tsx
'use client';

import { JobApplciationForm } from '@/components/JobApplicationForm';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function AddApplicationPage() {
  const router = useRouter();

  // Callback function to handle what happens after an application is added
  const handleApplicationAdded = () => {
    // Optionally show a success message or just navigate back
    router.push('/'); // Navigate back to the home page (list view) after adding
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Add New Job Application
        </h1>
        <JobApplciationForm onApplicationAdded={handleApplicationAdded} />
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            &larr; Back to Applications List
          </button>
        </div>
      </div>
    </main>
  );
}