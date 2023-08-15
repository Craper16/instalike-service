import { RequestHandler } from 'express';
import { deletePost, editPost, getPost, post } from '../services/post';
import { ErrorResponse } from '..';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { returnUser } from '../helpers/user';
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

    return res.status(getPostResponse?.status).json({
      post: {
        postId: getPostResponse?.post?._id,
        post: {
          post: getPostResponse?.post?.post,
          caption: getPostResponse?.post?.caption,
        },
        user: returnUser({ user: getPostResponse.user }),
        postDate: dayjs((getPostResponse as any)?.post?.createdAt).fromNow(
          false
        ),
      },
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

    return res.status(postResponse?.status).json({
      post: {
        postId: postResponse?.post?._id,
        post: {
          post: postResponse?.post?.post,
          caption: postResponse?.post?.caption,
        },
        user: returnUser({ user: postResponse.user }),
        postDate: dayjs((postResponse as any)?.post?.createdAt).fromNow(false),
      },
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

    return res.status(editPostResponse?.status).json({
      post: {
        postId: editPostResponse?.post?._id,
        post: {
          post: editPostResponse?.post?.post,
          caption: editPostResponse?.post?.caption,
        },
        user: returnUser({ user: editPostResponse.user }),
        postDate: dayjs((editPostResponse as any)?.post?.createdAt).fromNow(
          false
        ),
      },
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

    return res.status(deletePostResponse?.status).json({
      post: {
        postId: deletePostResponse?.post?._id,
        post: {
          post: deletePostResponse?.post?.post,
          caption: deletePostResponse?.post?.caption,
        },
        user: returnUser({ user: deletePostResponse.user }),
        postDate: dayjs((deletePostResponse as any)?.post?.createdAt).fromNow(
          false
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
