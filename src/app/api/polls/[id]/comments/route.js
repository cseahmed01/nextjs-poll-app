import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/polls/[id]/comments - Fetch comments for a poll
export async function GET(request, { params }) {
  const { id } = await params

  try {
    // Fetch top-level comments with their replies
    const comments = await prisma.comment.findMany({
      where: {
        pollId: parseInt(id),
        parentId: null // Only top-level comments
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, profileImage: true }
            },
            replies: {
              include: {
                user: {
                  select: { id: true, name: true, profileImage: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/polls/[id]/comments - Add a comment
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { content, parentId } = await request.json()

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 })
  }

  try {
    // Verify poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(id) }
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // If replying to a comment, verify parent exists and belongs to same poll
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) }
      })

      if (!parentComment || parentComment.pollId !== parseInt(id)) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 })
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        pollId: parseInt(id),
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/polls/[id]/comments - Delete a comment (admin moderation)
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { commentId } = await request.json()

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
  }

  try {
    // Verify comment exists and belongs to the poll
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    })

    if (!comment || comment.pollId !== parseInt(id)) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Delete the comment (cascade will handle replies if needed)
    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    })

    return NextResponse.json({ message: 'Comment deleted' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}