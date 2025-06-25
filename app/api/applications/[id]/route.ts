// app/api/applications/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // Adjust path
import { z } from 'zod'; // Import z for schema validation (reusing from form)

// Define a schema for updating/deleting to validate incoming IDs
const idSchema = z.string().uuid("Invalid ID format. Must be a UUID.");

// Schema for updating an application (fields are optional for updates)
const updateApplicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').optional(),
  jobTitle: z.string().min(1, 'Job title is required').optional(),
  dateApplied: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format. ExpectedYYYY-MM-DD"
  }).optional(),
  status: z.enum(['Applied', 'Interviewing', 'Rejected', 'Offer', 'Withdrew'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }).optional(),
  notes: z.string().optional().nullable(),
  link: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
}).partial(); // .partial() makes all fields optional for updates

interface RouteParams {
  params: { id: string };
}

// GET handler for a single job application by ID
export async function GET(request: Request, routeParams: RouteParams) { // Renamed to avoid confusion with internal 'params'
  try {
    const { id } = await routeParams.params; // <--- AWAIT THE PARAMS HERE
    const parsedId = idSchema.safeParse(id); // Use the awaited 'id'
    if (!parsedId.success) {
      return NextResponse.json({ message: parsedId.error.errors[0].message }, { status: 400 });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: parsedId.data },
    });

    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error('Error fetching single application:', error);
    return NextResponse.json({ message: 'Failed to fetch application' }, { status: 500 });
  }
}

// PUT handler for updating a job application by ID
export async function PUT(request: Request, routeParams: RouteParams) { // Renamed to avoid confusion with internal 'params'
  try {
    const { id } = await routeParams.params; // <--- AWAIT THE PARAMS HERE
    const parsedId = idSchema.safeParse(id); // Use the awaited 'id'
    if (!parsedId.success) {
      return NextResponse.json({ message: parsedId.error.errors[0].message }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateApplicationSchema.safeParse(body);

    if (!parsedBody.success) {
      // Return detailed validation errors from Zod
      return NextResponse.json({ message: 'Validation failed', errors: parsedBody.error.flatten().fieldErrors }, { status: 400 });
    }

    // Prepare data for update: ensure empty strings become null for optional fields
    const updateData = {
      ...parsedBody.data,
      notes: parsedBody.data.notes === '' ? null : parsedBody.data.notes,
      link: parsedBody.data.link === '' ? null : parsedBody.data.link,
      // Convert date string to Date object only if provided
      dateApplied: parsedBody.data.dateApplied ? new Date(parsedBody.data.dateApplied) : undefined,
    };


    const updatedApplication = await prisma.jobApplication.update({
      where: { id: parsedId.data },
      data: updateData,
    });

    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (error: any) {
    console.error('Error updating application:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found for update
      return NextResponse.json({ message: 'Application not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE handler for deleting a job application by ID
export async function DELETE(request: Request, routeParams: RouteParams) { // Renamed to avoid confusion with internal 'params'
  try {
    const { id } = await routeParams.params; // <--- AWAIT THE PARAMS HERE
    const parsedId = idSchema.safeParse(id); // Use the awaited 'id'
    if (!parsedId.success) {
      return NextResponse.json({ message: parsedId.error.errors[0].message }, { status: 400 });
    }

    await prisma.jobApplication.delete({
      where: { id: parsedId.data },
    });

    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 204 }); // 204 No Content
  } catch (error: any) {
    console.error('Error deleting application:', error);
    if (error.code === 'P2025') { // Prisma error code for record not found for delete
      return NextResponse.json({ message: 'Application not found for delete' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete application' }, { status: 500 });
  }
}