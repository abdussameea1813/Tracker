'use client';

import { useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

// Ensure dateApplied is a string in the 'YYYY-MM-DD' format if input type is 'date'
const jobApplicationSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  dateApplied: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format. Expected YYYY-MM-DD" // Corrected typo here
  }),
  status: z.enum(['Applied', 'Interviewing', 'Rejected', 'Offer', 'Withdrew'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  notes: z.string().optional().nullable(), // Optional notes
  link: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')), // Optional URL, allow empty string
});

type JobApplicationFormInputs = z.infer<typeof jobApplicationSchema>;

interface JobApplicationFormProps {
  onApplicationAdded: () => void;
}

export function JobApplciationForm({ onApplicationAdded }: JobApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<JobApplicationFormInputs>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      company: '',
      jobTitle: '',
      dateApplied: format(new Date(), 'yyyy-MM-dd'),
      status: 'Applied',
      notes: '',
      link: '',
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: JobApplicationFormInputs) => {
    setApiError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Convert empty strings to null for optional fields as per schema
          notes: data.notes === '' ? null : data.notes,
          link: data.link === '' ? null : data.link
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job application');
      }

      setSuccess('Application created successfully!');
      reset(); // Reset form fields
      setValue('dateApplied', format(new Date(), 'yyyy-MM-dd')); // Set date back to today
      onApplicationAdded(); // Trigger callback
    } catch (error: any) {
      console.error('Error creating job application:', error);
      setApiError(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-700 max-w-lg mx-auto"> {/* Darker background, border, and shadow */}
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Add New Job Application</h2> {/* White text for heading */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"> {/* Increased spacing */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1"> {/* Light gray text for labels */}
            Company <span className="text-red-400">*</span> {/* Adjusted red for dark theme */}
          </label>
          <input
            type="text"
            id="company"
            {...register('company')}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.company ? 'border-red-500' : 'border-gray-700'}`}
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
            {...register('jobTitle')}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm bg-gray-800 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 focus:ring-offset-gray-900 ${errors.jobTitle ? 'border-red-500' : 'border-gray-700'}`}
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
            {...register('status')}>
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
          {isSubmitting ? 'Adding Application...' : 'Add Application'}
        </button>
      </form>
    </div>
  );
}