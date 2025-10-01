import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request) {
  const now = new Date()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit')) || 1000
  const offset = parseInt(searchParams.get('offset')) || 0

  const polls = await prisma.poll.findMany({
    where: {
      OR: [
        { scheduledAt: null }, // No scheduling
        { scheduledAt: { lte: now } } // Scheduled time has passed
      ]
    },
    include: {
      options: {
        include: {
          votes: true
        }
      },
      createdBy: {
        select: { name: true, profileImage: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset
  })

  return NextResponse.json(polls)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, category, tags, expiresAt, scheduledAt, options } = await request.json()

  if (!title || !options || options.length < 2) {
    return NextResponse.json({ error: 'Title and at least 2 options required' }, { status: 400 })
  }

  const poll = await prisma.poll.create({
    data: {
      title,
      category: category || 'GENERAL',
      tags: tags || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      userId: session.user.id,
      options: {
        create: options.map(option => ({ text: option }))
      }
    },
    include: {
      options: true
    }
  })

  return NextResponse.json(poll)
}