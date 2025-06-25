'use client';

import { useParams, useRouter } from 'next/navigation';
import { EditApplicationForm } from '../../../components/EditApplicationForm';

export default function EditApplicationPage() {
  const router = useRouter();
  const { id: applicationId } = useParams();

  const handleApplicationUpdated = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Edit Job Application
        </h1>
        <EditApplicationForm
          applicationId={applicationId as string}
          onApplicationUpdated={handleApplicationUpdated}
        />
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
