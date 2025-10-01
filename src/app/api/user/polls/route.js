import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const polls = await prisma.poll.findMany({
    where: { userId: session.user.id },
    include: {
      options: {
        include: {
          votes: true
        }
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate stats
  const totalPolls = polls.length
  const totalVotes = polls.reduce((sum, poll) => sum + poll.options.reduce((optSum, opt) => optSum + opt.votes.length, 0), 0)
  const totalComments = polls.reduce((sum, poll) => sum + (poll._count?.comments || 0), 0)
  const avgVotesPerPoll = totalPolls > 0 ? (totalVotes / totalPolls).toFixed(1) : 0

  return NextResponse.json({
    stats: {
      totalPolls,
      totalVotes,
      totalComments,
      avgVotesPerPoll
    },
    polls
  })
}