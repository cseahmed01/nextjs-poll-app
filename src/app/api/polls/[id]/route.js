import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  const { id } = await params

  try {
    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(id) },
      include: {
        options: {
          include: {
            votes: true
          }
        },
        createdBy: {
          select: { name: true }
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: { id: true, name: true }
            },
            replies: {
              include: {
                user: {
                  select: { id: true, name: true }
                },
                replies: {
                  include: {
                    user: {
                      select: { id: true, name: true }
                    }
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { title, category, tags, expiresAt, scheduledAt, options } = await request.json()

  if (!title || !options || options.length < 2) {
    return NextResponse.json({ error: 'Title and at least 2 options required' }, { status: 400 })
  }

  // Check if poll exists and belongs to user
  const existingPoll = await prisma.poll.findUnique({
    where: { id: parseInt(id) },
    include: { options: { include: { votes: true } } }
  })

  if (!existingPoll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }

  if (existingPoll.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Check if any option has votes
  const hasVotes = existingPoll.options.some(option => option.votes.length > 0)

  let updateData = {
    title,
    category: category || 'GENERAL',
    tags: tags || null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null
  }

  if (!hasVotes) {
    // If no votes, allow updating options
    updateData.options = {
      deleteMany: {},
      create: options.map(option => ({ text: option }))
    }
  } else {
    // If has votes, only update title, check if options match
    if (options.length !== existingPoll.options.length || !options.every((opt, i) => opt === existingPoll.options[i].text)) {
      return NextResponse.json({ error: 'Cannot change options after votes have been cast' }, { status: 400 })
    }
  }

  // Update poll
  const updatedPoll = await prisma.poll.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      options: {
        include: {
          votes: true
        }
      }
    }
  })

  return NextResponse.json(updatedPoll)
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Check if poll exists and belongs to user
  const existingPoll = await prisma.poll.findUnique({
    where: { id: parseInt(id) }
  })

  if (!existingPoll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }

  if (existingPoll.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.poll.delete({
    where: { id: parseInt(id) }
  })

  return NextResponse.json({ message: 'Poll deleted' })
}