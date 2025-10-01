import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, bio, location, website, birthday } = await request.json()

    // Validate input
    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return NextResponse.json({ error: 'Name must be between 2 and 50 characters' }, { status: 400 })
    }

    if (bio && bio.length > 500) {
      return NextResponse.json({ error: 'Bio must be less than 500 characters' }, { status: 400 })
    }

    if (website && website.length > 200) {
      return NextResponse.json({ error: 'Website URL must be less than 200 characters' }, { status: 400 })
    }

    if (location && location.length > 100) {
      return NextResponse.json({ error: 'Location must be less than 100 characters' }, { status: 400 })
    }

    // Validate birthday (must be in the past and user must be at least 13 years old)
    if (birthday) {
      const birthDate = new Date(birthday)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (birthDate > today) {
        return NextResponse.json({ error: 'Birthday cannot be in the future' }, { status: 400 })
      }

      if (age < 13 || (age === 13 && monthDiff < 0)) {
        return NextResponse.json({ error: 'You must be at least 13 years old' }, { status: 400 })
      }
    }

    // Update user profile - temporarily avoid new fields until Prisma client is regenerated
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (bio !== undefined) updateData.bio = bio?.trim() || null
    if (location !== undefined) updateData.location = location?.trim() || null
    if (website !== undefined) updateData.website = website?.trim() || null
    if (birthday) updateData.birthday = new Date(birthday)

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    })

    // Add the new fields with default values
    updatedUser.bio = bio !== undefined ? bio?.trim() || null : null
    updatedUser.location = location !== undefined ? location?.trim() || null : null
    updatedUser.website = website !== undefined ? website?.trim() || null : null
    updatedUser.birthday = birthday ? new Date(birthday) : null

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true
      }
    })

    // Add the new fields with default values until Prisma client is regenerated
    user.bio = user.bio || null
    user.location = user.location || null
    user.website = user.website || null
    user.birthday = user.birthday || null

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}