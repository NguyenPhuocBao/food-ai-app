import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addReview = async (req: any, res: Response) => {
  try {
    const { foodId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: parseInt(foodId) } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const review = await prisma.review.create({
      data: {
        userId,
        foodId: parseInt(foodId),
        rating,
        comment,
        images: images || [],
      },
      include: {
        user: {
          include: {
            profile: { select: { avatar: true } },
          },
        },
      },
    });

    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { foodId: parseInt(foodId) },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: {
          include: {
            profile: { select: { avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.review.count({ where: { foodId: parseInt(foodId) } });
    const avgRating = await prisma.review.aggregate({
      where: { foodId: parseInt(foodId) },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      stats: { averageRating: avgRating._avg.rating || 0, totalReviews: total },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const existingReview = await prisma.review.findFirst({ where: { id: parseInt(id), userId } });
    if (!existingReview) return res.status(404).json({ error: 'Review not found' });

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { rating, comment },
      include: {
        user: {
          include: {
            profile: { select: { avatar: true } },
          },
        },
      },
    });

    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingReview = await prisma.review.findFirst({ where: { id: parseInt(id), userId } });
    if (!existingReview) return res.status(404).json({ error: 'Review not found' });

    await prisma.review.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markHelpful = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.review.update({
      where: { id: parseInt(id) },
      data: { helpfulCount: { increment: 1 } },
    });

    res.json({ success: true, message: 'Marked as helpful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};