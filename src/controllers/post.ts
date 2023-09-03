import { RequestHandler } from 'express';
import { deletePost, editPost, getPost, post } from '../services/post';
import { ErrorResponse } from '..';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { returnPost } from '../helpers/post';
dayjs.extend(relativeTime);

export const GetPost: RequestHandler = async (req, res, next) => {
  const { postId } = req.params as { postId: string };

  try {
    const getPostResponse = await getPost({ postId });

    if (getPostResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: getPostResponse?.name!,
        name: getPostResponse?.name!,
        status: getPostResponse?.status!,
        data: {
          message: getPostResponse?.message!,
          statusCode: getPostResponse?.status!,
        },
      };
      throw error;
    }

    const post = await returnPost({
      post: getPostResponse.post,
      userId: req.userId,
    });

    return res.status(getPostResponse?.status).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const Post: RequestHandler = async (req, res, next) => {
  const posts = req.files;
  const { caption } = req.body as { caption: string };

  try {
    const postResponse = await post({
      caption,
      posts: posts as any,
      userId: req.userId,
    });

    if (postResponse?.status !== 201) {
      const error: ErrorResponse = {
        message: postResponse?.name!,
        name: postResponse?.name!,
        status: postResponse?.status!,
        data: {
          message: postResponse?.message!,
          statusCode: postResponse?.status!,
        },
      };
      throw error;
    }

    const postReturned = await returnPost({
      post: postResponse.post,
      userId: req.userId,
    });

    return res.status(postResponse?.status).json({
      post: postReturned,
    });
  } catch (error) {
    next(error);
  }
};

export const EditPost: RequestHandler = async (req, res, next) => {
  const posts = req.files;
  const { caption } = req.body as { caption: string };
  const { postId } = req.params as { postId: string };
  try {
    const editPostResponse = await editPost({
      caption,
      posts: posts as any,
      postId,
      userId: req.userId,
    });

    if (editPostResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: editPostResponse?.name!,
        name: editPostResponse?.name!,
        status: editPostResponse?.status!,
        data: {
          message: editPostResponse?.message!,
          statusCode: editPostResponse?.status!,
        },
      };
      throw error;
    }

    const post = await returnPost({
      post: editPostResponse.post,
      userId: req.userId,
    });

    return res.status(editPostResponse?.status).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const DeletePost: RequestHandler = async (req, res, next) => {
  const { postId } = req.params as { postId: string };

  try {
    const deletePostResponse = await deletePost({ postId, userId: req.userId });

    if (deletePostResponse?.status !== 200) {
      const error: ErrorResponse = {
        message: deletePostResponse?.name!,
        name: deletePostResponse?.name!,
        status: deletePostResponse?.status!,
        data: {
          message: deletePostResponse?.message!,
          statusCode: deletePostResponse?.status!,
        },
      };
      throw error;
    }

    const post = await returnPost({
      post: deletePostResponse.post,
      userId: req.userId,
    });

    return res.status(deletePostResponse?.status).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};
