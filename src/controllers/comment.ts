import { RequestHandler } from 'express';
import { postOrEditCommentValidations } from '../validations/comment';
import { ErrorResponse } from '..';
import {
  deleteComment,
  editComment,
  getComment,
  getPostComments,
  postComment,
} from '../services/comment';
import { returnComment } from '../helpers/comment';

export const PostComment: RequestHandler = async (req, res, next) => {
  const { comment } = req.body as { comment: string };
  const { post } = req.query as { post: string };

  const { error } = postOrEditCommentValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const postCommentResponse = await postComment({
      comment,
      postId: post,
      userId: req.userId,
    });

    if (postCommentResponse?.status !== 201) {
      const error: ErrorResponse = {
        message: postCommentResponse?.name!,
        name: postCommentResponse?.name!,
        status: postCommentResponse?.status!,
        data: {
          message: postCommentResponse?.message!,
          statusCode: postCommentResponse?.status!,
        },
      };
      throw error;
    }

    const commentReturned = await returnComment({
      comment: postCommentResponse.comment,
      userId: req.userId,
    });

    return res.status(postCommentResponse.status).json({
      comment: commentReturned,
    });
  } catch (error) {
    next(error);
  }
};

export const GetComment: RequestHandler = async (req, res, next) => {
  const { commentId } = req.params as { commentId: string };
  try {
    const getCommentResponse = await getComment({ commentId });

    if (getCommentResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getCommentResponse?.name!,
        name: getCommentResponse?.name!,
        status: getCommentResponse?.status!,
        data: {
          message: getCommentResponse?.message!,
          statusCode: getCommentResponse?.status!,
        },
      };
      throw error;
    }

    const comment = await returnComment({
      comment: getCommentResponse.comment,
      userId: req.userId,
    });

    return res.status(getCommentResponse.status).json({
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const EditComment: RequestHandler = async (req, res, next) => {
  const { comment } = req.body as { comment: string };
  const { commentId } = req.params as { commentId: string };

  const { error } = postOrEditCommentValidations.validate(req.body);

  try {
    if (error) {
      const newError: ErrorResponse = {
        message: error.message,
        name: error.name,
        status: 422,
        data: {
          message: error.message,
          statusCode: 422,
          data: error.details,
        },
      };
      throw newError;
    }

    const editCommentResponse = await editComment({ comment, commentId });

    if (editCommentResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: editCommentResponse?.name!,
        name: editCommentResponse?.name!,
        status: editCommentResponse?.status!,
        data: {
          message: editCommentResponse?.message!,
          statusCode: editCommentResponse?.status!,
        },
      };
      throw error;
    }

    const commentReturned = await returnComment({
      comment: editCommentResponse.comment,
      userId: req.userId,
    });

    return res.status(editCommentResponse.status).json({
      comment: commentReturned,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteComment: RequestHandler = async (req, res, next) => {
  const { commentId } = req.params as { commentId: string };

  try {
    const deleteCommentResponse = await deleteComment({ commentId });

    if (deleteCommentResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: deleteCommentResponse?.name!,
        name: deleteCommentResponse?.name!,
        status: deleteCommentResponse?.status!,
        data: {
          message: deleteCommentResponse?.message!,
          statusCode: deleteCommentResponse?.status!,
        },
      };
      throw error;
    }

    const commentReturned = await returnComment({
      comment: deleteCommentResponse.comment,
      userId: req.userId,
    });

    return res.status(deleteCommentResponse.status).json({
      comment: commentReturned,
    });
  } catch (error) {
    next(error);
  }
};

export const GetPostComments: RequestHandler = async (req, res, next) => {
  const { page, post } = req.query as { post: string; page: string };

  try {
    const postCommentsResponse = await getPostComments({
      page: +page ?? 1,
      postId: post,
      userId: req.userId,
    });

    if (postCommentsResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: postCommentsResponse?.name!,
        name: postCommentsResponse?.name!,
        status: postCommentsResponse?.status!,
        data: {
          message: postCommentsResponse?.message!,
          statusCode: postCommentsResponse?.status!,
        },
      };
      throw error;
    }

    return res
      .status(postCommentsResponse.status)
      .json({ comments: postCommentsResponse.comments });
  } catch (error) {
    next(error);
  }
};
