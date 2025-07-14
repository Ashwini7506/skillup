import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Handle experience as a string (not array)
    if (updates.experience !== undefined) {
      userUpdateData.experience = updates.experience;
    }
    

    // Array fields
    if (Array.isArray(updates.positionOfResponsibility)) {
      userUpdateData.positionOfResponsibility = updates.positionOfResponsibility.filter(Boolean);
    }
    if (Array.isArray(updates.hardSkills)) {
      userUpdateData.hardSkills = updates.hardSkills.filter(Boolean);
    }

    console.log('[API] Updating user with data:', userUpdateData);

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