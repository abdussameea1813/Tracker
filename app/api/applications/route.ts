import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// For fetching all job applications
export async function GET() {
    try {
        const applications = await prisma.jobApplication.findMany({
            orderBy: {
                dateApplied: 'desc',
            }
        });
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        console.error('Error fetching job applications:', error);
        return NextResponse.json({ error: 'Error fetching job applications' }, { status: 500 });
    }
}

// FOR creating a new application
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { company, jobTitle, dateApplied, status, notes, link } = body;

        if (!company || !jobTitle || !dateApplied || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newApplication = await prisma.jobApplication.create({
            data: {
                company,
                jobTitle,
                dateApplied: dateApplied ? new Date(dateApplied) : undefined,
                status,
                notes,
                link,
            },
        });

        return NextResponse.json({ message: 'Application created successfully', application: newApplication }, { status: 201 });
    } catch (error) {
        console.error('Error creating job application:', error);
        return NextResponse.json({ error: 'Error creating job application' }, { status: 500 });
    }
}