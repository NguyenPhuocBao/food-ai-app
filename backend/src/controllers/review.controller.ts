import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_REPLY_LENGTH = 1000;

const toInt = (value: unknown) => Number.parseInt(String(value), 10);
const normalizeText = (value: unknown) => String(value || '').trim();

const reviewInclude = {
  user: {
    select: {
      id: true,
      name: true,
      role: true,
      profile: { select: { avatar: true } },
    },
  },
  replies: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          profile: { select: { avatar: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const addReview = async (req: any, res: Response) => {
  try {
    const foodId = toInt(req.params.foodId);
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({ error: 'Invalid food id' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const reviewPayload = {
      rating: Number(rating),
      comment: normalizeText(comment) || null,
      images: Array.isArray(images) ? images.filter((item) => typeof item === 'string').slice(0, 6) : [],
    };

    const review = await prisma.review.create({
      data: {
        userId,
        foodId,
        ...reviewPayload,
      },
      include: reviewInclude,
    });

    const total = await prisma.review.count({ where: { foodId } });
    const avgRating = await prisma.review.aggregate({
      where: { foodId },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      data: review,
      stats: { averageRating: avgRating._avg.rating || 0, totalReviews: total },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const foodId = toInt(req.params.foodId);
    const { page = 1, limit = 10 } = req.query;
    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({ error: 'Invalid food id' });
    }

    const reviews = await prisma.review.findMany({
      where: { foodId },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.review.count({ where: { foodId } });
    const avgRating = await prisma.review.aggregate({
      where: { foodId },
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
    const reviewId = toInt(req.params.id);
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({ error: 'Invalid review id' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existingReview = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!existingReview) return res.status(404).json({ error: 'Review not found' });

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { rating: Number(rating), comment: normalizeText(comment) || null },
      include: reviewInclude,
    });

    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: any, res: Response) => {
  try {
    const reviewId = toInt(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    const existingReview = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!existingReview) return res.status(404).json({ error: 'Review not found' });

    await prisma.review.delete({ where: { id: reviewId } });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markHelpful = async (req: any, res: Response) => {
  try {
    const reviewId = toInt(req.params.id);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });

    res.json({ success: true, message: 'Marked as helpful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addReviewReply = async (req: any, res: Response) => {
  try {
    const reviewId = toInt(req.params.id);
    const userId = req.user.id;
    const content = normalizeText(req.body?.content);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({ error: 'Invalid review id' });
    }
    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }
    if (content.length > MAX_REPLY_LENGTH) {
      return res.status(400).json({ error: `Reply must be <= ${MAX_REPLY_LENGTH} characters` });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, foodId: true },
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profile: { select: { avatar: true } },
          },
        },
      },
    });

    res.json({ success: true, data: reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
