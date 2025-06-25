// components/JobApplicationList.tsx
'use client';

import { useState, useEffect } from 'react';
import type { JobApplication } from '@prisma/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface JobApplicationListProps {
  refreshKey: number;
}

export function JobApplicationList({ refreshKey }: JobApplicationListProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null); // For errors from API actions (delete)
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' as default for no filter
  
  const router = useRouter();

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data: JobApplication[] = await response.json();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete application');
      }

      setApplications(prevApps => prevApps.filter(app => app.id !== id));
      console.log(`Application with ID ${id} deleted successfully.`);
    } catch (err: any) {
      console.error('Error deleting application:', err);
      setApiError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  // Filter and search logic
  const filteredApplications = applications.filter(app => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearchTerm = lowerCaseSearchTerm === '' || 
                              app.jobTitle.toLowerCase().includes(lowerCaseSearchTerm) ||
                              app.company.toLowerCase().includes(lowerCaseSearchTerm) ||
                              (app.notes?.toLowerCase() || '').includes(lowerCaseSearchTerm); // Include notes in search
    
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;

    return matchesSearchTerm && matchesStatus;
  });

  // Dark theme text colors for messages
  const loadingMessageClass = "text-center py-12 text-lg text-gray-300";
  const errorMessageClass = "text-center py-12 text-lg text-red-400 font-medium";
  const noApplicationsMessageClass = "text-center py-16 text-xl text-gray-400";
  const noMatchMessageClass = "text-center py-8 text-xl text-gray-400";

  if (loading) return <div className={loadingMessageClass}>Loading applications...</div>;
  if (error) return <div className={errorMessageClass}>Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-900 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-4xl font-bold mb-10 text-white text-center tracking-tight">Your Job Applications</h2>
      {apiError && <p className="text-red-400 text-base mb-6 text-center">{apiError}</p>}

      {/* Filter and Search Controls */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search Input */}
        <div className="w-full sm:w-1/2">
          <label htmlFor="search" className="sr-only">Search applications</label>
          <input
            type="text"
            id="search"
            placeholder="Search by title, company, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 bg-gray-800 text-gray-200 placeholder-gray-500"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-1/3">
          <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 bg-gray-800 text-gray-200"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrew">Withdrew</option>
          </select>
        </div>
      </div>

      {/* Conditional rendering for no applications/no matches */}
      {applications.length === 0 ? (
        <div className={noApplicationsMessageClass}>No applications added yet. Add your first job application to get started!</div>
      ) : filteredApplications.length === 0 ? (
        <div className={noMatchMessageClass}>No applications match your search or filter criteria.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-md">
          <table className="min-w-full divide-y divide-gray-700 bg-gray-800">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Job Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date Applied
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Link
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">{app.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{app.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'Applied' ? 'bg-blue-800 text-blue-200' :
                        app.status === 'Interviewing' ? 'bg-purple-800 text-purple-200' :
                        app.status === 'Offer' ? 'bg-green-800 text-green-200' :
                        app.status === 'Rejected' ? 'bg-red-800 text-red-200' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{format(new Date(app.dateApplied), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={app.notes || ''}>
                    {app.notes || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.link ? (
                      <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 font-medium text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Link
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(app.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 focus:ring-offset-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 focus:ring-offset-gray-900"
                        disabled={deletingId === app.id}
                      >
                        {deletingId === app.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}