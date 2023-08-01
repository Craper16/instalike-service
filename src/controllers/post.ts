import { RequestHandler } from 'express';
import { deletePost, editPost, getPost, post } from '../services/post';
import { ErrorResponse } from '..';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
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
        user: {
          userId: getPostResponse.user?._id,
          email: getPostResponse.user?.email,
          username: getPostResponse.user?.username,
          phoneNumber: getPostResponse.user?.phoneNumber,
          countryCode: getPostResponse.user?.countryCode,
          profilePicture: getPostResponse.user?.profilePicture,
          fullName: getPostResponse.user?.fullName,
          followers: getPostResponse.user?.followers,
          following: getPostResponse.user?.following,
        },
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
        user: {
          userId: postResponse.user?._id,
          email: postResponse.user?.email,
          username: postResponse.user?.username,
          phoneNumber: postResponse.user?.phoneNumber,
          countryCode: postResponse.user?.countryCode,
          profilePicture: postResponse.user?.profilePicture,
          fullName: postResponse.user?.fullName,
          followers: postResponse.user?.followers,
          following: postResponse.user?.following,
        },
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
        user: {
          userId: editPostResponse.user?._id,
          email: editPostResponse.user?.email,
          username: editPostResponse.user?.username,
          phoneNumber: editPostResponse.user?.phoneNumber,
          countryCode: editPostResponse.user?.countryCode,
          profilePicture: editPostResponse.user?.profilePicture,
          fullName: editPostResponse.user?.fullName,
          followers: editPostResponse.user?.followers,
          following: editPostResponse.user?.following,
        },
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
        user: {
          userId: deletePostResponse.user?._id,
          email: deletePostResponse.user?.email,
          username: deletePostResponse.user?.username,
          phoneNumber: deletePostResponse.user?.phoneNumber,
          countryCode: deletePostResponse.user?.countryCode,
          profilePicture: deletePostResponse.user?.profilePicture,
          fullName: deletePostResponse.user?.fullName,
          followers: deletePostResponse.user?.followers,
          following: deletePostResponse.user?.following,
        },
        postDate: dayjs((deletePostResponse as any)?.post?.createdAt).fromNow(
          false
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
