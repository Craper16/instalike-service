import { RequestHandler } from 'express';
import { getLikes, postLike, removeLike } from '../services/like';
import { ErrorResponse } from '..';
import { returnLike } from '../helpers/like';

export const PostLike: RequestHandler = async (req, res, next) => {
  const { comment, post } = req.query as { post?: string; comment?: string };

  try {
    const postLikeResponse = await postLike({
      userId: req.userId,
      commentId: comment,
      postId: post,
    });

    if (postLikeResponse?.status !== 201) {
      const error: ErrorResponse = {
        message: postLikeResponse?.name!,
        name: postLikeResponse?.name!,
        status: postLikeResponse?.status!,
        data: {
          message: postLikeResponse?.message!,
          statusCode: postLikeResponse?.status!,
        },
      };
      throw error;
    }

    const like = await returnLike({
      like: postLikeResponse.like,
      userId: req.userId,
    });

    return res.status(postLikeResponse.status).json({
      like,
    });
  } catch (error) {
    next(error);
  }
};

export const RemoveLike: RequestHandler = async (req, res, next) => {
  const { likeId, comment, post } = req.query as {
    likeId?: string;
    comment?: string;
    post?: string;
  };

  try {
    const removeLikeResponse = await removeLike({
      likeId,
      userId: req.userId,
      commentId: comment,
      postId: post,
    });

    if (removeLikeResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: removeLikeResponse?.name!,
        name: removeLikeResponse?.name!,
        status: removeLikeResponse?.status!,
        data: {
          message: removeLikeResponse?.message!,
          statusCode: removeLikeResponse?.status!,
        },
      };
      throw error;
    }

    const like = await returnLike({
      like: removeLikeResponse.like,
      userId: req.userId,
    });

    return res.status(removeLikeResponse.status).json({
      like,
    });
  } catch (error) {
    next(error);
  }
};

export const GetLikes: RequestHandler = async (req, res, next) => {
  const { post, comment, page } = req.query as {
    comment?: string;
    post: string;
    page: string;
  };

  try {
    const getLikesResponse = await getLikes({
      page: +page ?? 1,
      commentId: comment,
      postId: post,
      userId: req.userId,
    });

    if (getLikesResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getLikesResponse?.name!,
        name: getLikesResponse?.name!,
        status: getLikesResponse?.status!,
        data: {
          message: getLikesResponse?.message!,
          statusCode: getLikesResponse?.status!,
        },
      };
      throw error;
    }
    return res
      .status(getLikesResponse.status)
      .json({ likes: getLikesResponse.likes });
  } catch (error) {
    next(error);
  }
};
