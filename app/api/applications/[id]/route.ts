import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const idSchema = z.string().uuid("Invalid ID format. Must be a UUID.");

const updateApplicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').optional(),
  jobTitle: z.string().min(1, 'Job title is required').optional(),
  dateApplied: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format. Expected YYYY-MM-DD"
  }).optional(),
  status: z.enum(['Applied', 'Interviewing', 'Rejected', 'Offer', 'Withdrew'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }).optional(),
  notes: z.string().optional().nullable(),
  link: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
}).partial();

// GET
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parsedId = idSchema.safeParse(params.id);
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

// PUT
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ message: parsedId.error.errors[0].message }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateApplicationSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Validation failed', errors: parsedBody.error.flatten().fieldErrors }, { status: 400 });
    }

    const updateData = {
      ...parsedBody.data,
      notes: parsedBody.data.notes === '' ? null : parsedBody.data.notes,
      link: parsedBody.data.link === '' ? null : parsedBody.data.link,
      dateApplied: parsedBody.data.dateApplied ? new Date(parsedBody.data.dateApplied) : undefined,
    };

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: parsedId.data },
      data: updateData,
    });

    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (error: any) {
    console.error('Error updating application:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Application not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ message: parsedId.error.errors[0].message }, { status: 400 });
    }

    await prisma.jobApplication.delete({
      where: { id: parsedId.data },
    });

    return NextResponse.json({ message: 'Application deleted successfully' }, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Application not found for delete' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete application' }, { status: 500 });
  }
}
