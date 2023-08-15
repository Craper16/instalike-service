import { RequestHandler } from 'express';
import { postOrEditCommentValidations } from '../validations/comment';
import { ErrorResponse } from '..';
import {
  deleteComment,
  editComment,
  getComment,
  postComment,
} from '../services/comment';
import dayjs from 'dayjs';
import { returnUser } from '../helpers/user';

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

    return res.status(postCommentResponse.status).json({
      comment: {
        commentId: postCommentResponse.comment?._id,
        comment: postCommentResponse.comment?.comment,
        isEditted: postCommentResponse.comment?.edited,
        user: returnUser({ user: postCommentResponse.user }),
        post: {
          postId: postCommentResponse?.post?._id,
          post: {
            post: postCommentResponse?.post?.post,
            caption: postCommentResponse?.post?.caption,
          },
          user: returnUser({ user: postCommentResponse.postUser }),
          postDate: dayjs(
            (postCommentResponse as any)?.post?.createdAt
          ).fromNow(false),
        },
        commentedAt: dayjs(
          (postCommentResponse as any).comment.updatedAt
        ).fromNow(false),
      },
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

    return res.status(getCommentResponse.status).json({
      comment: {
        commentId: getCommentResponse.comment?._id,
        comment: getCommentResponse.comment?.comment,
        isEditted: getCommentResponse.comment?.edited,
        user: returnUser({ user: getCommentResponse.user }),
        post: {
          postId: getCommentResponse?.post?._id,
          post: {
            post: getCommentResponse?.post?.post,
            caption: getCommentResponse?.post?.caption,
          },
          user: returnUser({ user: getCommentResponse.postUser }),
          postDate: dayjs((getCommentResponse as any)?.post?.createdAt).fromNow(
            false
          ),
        },
        commentedAt: dayjs(
          (getCommentResponse as any).comment.updatedAt
        ).fromNow(false),
      },
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

    return res.status(editCommentResponse.status).json({
      comment: {
        commentId: editCommentResponse.comment?._id,
        comment: editCommentResponse.comment?.comment,
        isEditted: editCommentResponse.comment?.edited,
        user: returnUser({ user: editCommentResponse.user }),
        post: {
          postId: editCommentResponse?.post?._id,
          post: {
            post: editCommentResponse?.post?.post,
            caption: editCommentResponse?.post?.caption,
          },
          user: returnUser({ user: editCommentResponse.postUser }),
          postDate: dayjs(
            (editCommentResponse as any)?.post?.createdAt
          ).fromNow(false),
        },
        commentedAt: dayjs(
          (editCommentResponse as any).comment.updatedAt
        ).fromNow(false),
      },
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

    return res.status(deleteCommentResponse.status).json({
      comment: {
        commentId: deleteCommentResponse.comment?._id,
        comment: deleteCommentResponse.comment?.comment,
        isEditted: deleteCommentResponse.comment?.edited,
        user: returnUser({ user: deleteCommentResponse.user }),
        post: {
          postId: deleteCommentResponse?.post?._id,
          post: {
            post: deleteCommentResponse?.post?.post,
            caption: deleteCommentResponse?.post?.caption,
          },
          user: returnUser({ user: deleteCommentResponse.postUser }),
          postDate: dayjs(
            (deleteCommentResponse as any)?.post?.createdAt
          ).fromNow(false),
        },
        commentedAt: dayjs(
          (deleteCommentResponse as any).comment.updatedAt
        ).fromNow(false),
      },
    });
  } catch (error) {
    next(error);
  }
};
