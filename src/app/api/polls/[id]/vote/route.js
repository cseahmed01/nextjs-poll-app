import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pollId = parseInt((await params).id)
  const { optionId } = await request.json()

  if (!optionId) {
    return NextResponse.json({ error: 'Option ID required' }, { status: 400 })
  }

  // Check if poll exists and option belongs to it
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true }
  })

  if (!poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }

  // Check if poll has expired
  if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'This poll has expired' }, { status: 400 })
  }

  // Check if poll is scheduled for future
  if (poll.scheduledAt && new Date(poll.scheduledAt) > new Date()) {
    return NextResponse.json({ error: 'This poll is not yet available' }, { status: 400 })
  }

  const option = poll.options.find(opt => opt.id === optionId)
  if (!option) {
    return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
  }

  // Check if user already voted on this poll
  const existingVote = await prisma.vote.findFirst({
    where: {
      userId: session.user.id,
      pollOption: {
        pollId: pollId
      }
    }
  })

  if (existingVote) {
    return NextResponse.json({ error: 'Already voted on this poll' }, { status: 400 })
  }

  // Create vote
  const vote = await prisma.vote.create({
    data: {
      userId: session.user.id,
      pollOptionId: optionId
    }
  })

  return NextResponse.json({ message: 'Vote recorded', vote })
}