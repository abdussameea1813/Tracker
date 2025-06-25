'use client';

import { useEffect, useState, Fragment } from 'react'; // Import Fragment
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import type { JobApplication } from '@prisma/client'; // Import type

// 1. Re-use the Zod Schema for validation, but make it partial for updates
const jobApplicationUpdateSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  dateApplied: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format. Expected YYYY-MM-DD" // Corrected typo
  }),
  status: z.enum(['Applied', 'Interviewing', 'Rejected', 'Offer', 'Withdrew'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  notes: z.string().optional().nullable(),
  link: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
}).partial(); // Key for updates: all fields are optional

// Infer the TypeScript type from the Zod schema
type JobApplicationUpdateInputs = z.infer<typeof jobApplicationUpdateSchema>;

interface EditApplicationFormProps {
  applicationId: string;
  onApplicationUpdated: () => void; // Callback after update
}

export function EditApplicationForm({ applicationId, onApplicationUpdated }: EditApplicationFormProps) {
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue, // Used to set initial form values
  } = useForm<JobApplicationUpdateInputs>({
    resolver: zodResolver(jobApplicationUpdateSchema),
    // No defaultValues here, we'll populate them from fetched data
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Effect to fetch the application data for pre-filling the form
  useEffect(() => {
    const fetchApplication = async () => {
      setInitialDataLoading(true);
      setInitialDataError(null);
      try {
        const response = await fetch(`/api/applications/${applicationId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch application data');
        }
        const data: JobApplication = await response.json();

        // Populate the form fields with fetched data
        // Make sure dateApplied is formatted for input type="date"
        setValue('company', data.company);
        setValue('jobTitle', data.jobTitle);
        setValue('dateApplied', format(new Date(data.dateApplied), 'yyyy-MM-dd'));
        setValue('status', data.status);
        setValue('notes', data.notes || ''); // Handle nulls by converting to empty string for input
        setValue('link', data.link || '');   // Handle nulls by converting to empty string for input

      } catch (err: any) {
        console.error('Error fetching initial application data:', err);
        setInitialDataError(err.message || 'Could not load application data for editing.');
      } finally {
        setInitialDataLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, setValue]); // Re-fetch if ID changes, setValue is stable

  const onSubmit = async (data: JobApplicationUpdateInputs) => {
    setApiError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          notes: data.notes === '' ? null : data.notes, // Ensure empty string becomes null
          link: data.link === '' ? null : data.link,    // Ensure empty string becomes null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update application');
      }

      setSuccess('Application updated successfully!');
      onApplicationUpdated(); // Trigger refresh/navigate back
    } catch (err: any) {
      console.error('Error updating application:', err);
      setApiError(err.message || 'An unexpected error occurred during update.');
    }
  };

  // Dark theme text colors for messages
  const loadingMessageClass = "text-center py-12 text-lg text-gray-300";
  const errorMessageClass = "text-center py-12 text-lg text-red-400 font-medium";

  // Conditional rendering for loading and error states
  if (initialDataLoading) return <div className={loadingMessageClass}>Loading application data...</div>;
  if (initialDataError) return <div className={errorMessageClass}>Error: {initialDataError}</div>;

  return (
    // Wrap the entire component content in a Fragment <>...</> to ensure a single root element
    <Fragment>
      <div className="p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-700 max-w-lg mx-auto"> {/* Darker background, border, and shadow */}
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Edit Job Application</h2> {/* White text for heading */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1"> {/* Light gray text for labels */}
              Company Name <span className="text-red-400">*</span> {/* Adjusted red for dark theme */}
            </label>
            <input
              type="text"
              id="company"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.company ? 'border-red-500' : 'border-gray-700'}`} {/* Darker input background, light text, adjusted border */}
              {...register('company')}
              placeholder="e.g., Google"
            />
            {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company.message}</p>} {/* Adjusted red for dark theme */}
          </div>
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300 mb-1">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.jobTitle ? 'border-red-500' : 'border-gray-700'}`}
              {...register('jobTitle')}
              placeholder="e.g., Software Engineer"
            />
            {errors.jobTitle && <p className="text-red-400 text-xs mt-1">{errors.jobTitle.message}</p>}
          </div>
          <div>
            <label htmlFor="dateApplied" className="block text-sm font-medium text-gray-300 mb-1">
              Date Applied <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              id="dateApplied"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.dateApplied ? 'border-red-500' : 'border-gray-700'}`}
              {...register('dateApplied')}
            />
            {errors.dateApplied && <p className="text-red-400 text-xs mt-1">{errors.dateApplied.message}</p>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Status <span className="text-red-400">*</span>
            </label>
            <select
              id="status"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.status ? 'border-red-500' : 'border-gray-700'}`}
              {...register('status')}
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrew">Withdrew</option>
            </select>
            {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>}
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              id="notes"
              rows={4} // Increased rows for more space
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.notes ? 'border-red-500' : 'border-gray-700'}`}
              {...register('notes')}
              placeholder="Any relevant notes about the application..."
            ></textarea>
            {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>}
          </div>
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-1">Link to Posting</label>
            <input
              type="url"
              id="link"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.link ? 'border-red-500' : 'border-gray-700'}`}
              {...register('link')}
              placeholder="https://example.com/job-posting"
            />
            {errors.link && <p className="mt-1 text-red-400 text-xs">{errors.link.message}</p>}
          </div>

          {apiError && <p className="text-red-400 text-sm mt-4 text-center">{apiError}</p>}
          {success && <p className="text-green-400 text-sm mt-4 text-center">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed text-lg font-semibold transition-colors duration-200 focus:ring-offset-gray-900"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Application'}
          </button>
        </form>
      </div>
    </Fragment>
  );
}