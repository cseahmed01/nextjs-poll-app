import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            polls: true,
            votes: true
          }
        }
      }
    })

    const polls = await prisma.poll.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        options: {
          include: {
            votes: true
          }
        }
      }
    })

    const totalUsers = users.length
    const totalPolls = polls.length
    const totalVotes = polls.reduce((sum, poll) =>
      sum + poll.options.reduce((optSum, opt) => optSum + opt.votes.length, 0), 0
    )
    const totalAdmins = users.filter(u => u.role === 'ADMIN').length

    return NextResponse.json({
      users,
      polls,
      stats: {
        totalUsers,
        totalPolls,
        totalVotes,
        totalAdmins
      }
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}