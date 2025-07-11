import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';

// const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userUpdateData: any = {};

    // Basic info
    if (updates.name) userUpdateData.name = updates.name;
    if (updates.job) userUpdateData.job = updates.job;
    if (updates.role) userUpdateData.role = updates.role;
    if (updates.about) userUpdateData.about = updates.about;
    if (updates.image) userUpdateData.image = updates.image;
    if (updates.username) userUpdateData.username = updates.username;
    if (updates.linkedinUrl) userUpdateData.linkedinUrl = updates.linkedinUrl;
    if (updates.githubUrl) userUpdateData.githubUrl = updates.githubUrl;
    if (updates.resumeUrl) userUpdateData.resumeUrl = updates.resumeUrl;

    // Array fields
    if (Array.isArray(updates.positionOfResponsibility)) {
      userUpdateData.positionOfResponsibility = updates.positionOfResponsibility.filter(Boolean);
    }
    if (Array.isArray(updates.hardSkills)) {
      userUpdateData.hardSkills = updates.hardSkills.filter(Boolean);
    }

    // Optional text field
    if (Array.isArray(updates.experience)) {
  userUpdateData.experience = updates.experience.filter(Boolean);
}

    await db.user.update({
      where: { id: userId },
      data: userUpdateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
