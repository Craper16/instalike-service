import { PER_PAGE } from '../consts/constants';
import { Comment } from '../models/comment';
import { Like } from '../models/like';
import { Post } from '../models/post';
import { User } from '../models/user';
import { returnLike } from '../helpers/like';

export const postLike = async ({
  commentId,
  postId,
  userId,
}: {
  postId?: string;
  commentId?: string;
  userId: string;
}) => {
  try {
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
    const comment = await Comment.findById(commentId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (post && comment) {
      return {
        message: 'Cannot like a comment and post at the same time',
        name: 'Forbidden',
        status: 403,
      };
    }

    if (!post && !comment) {
      return {
        message: 'No post or comment found',
        name: 'Not found',
        status: 404,
      };
    }

    const postAlreadyLiked = await Like.findOne({
      postId: post?._id,
      userId: user?._id,
      commentId: null,
    });
    const commentAlreadyLiked = await Like.findOne({
      commentId: comment?._id,
      userId: user._id,
      postId: null,
    });

    if (postAlreadyLiked || commentAlreadyLiked) {
      return {
        status: 201,
        like: postAlreadyLiked
          ? postAlreadyLiked
          : commentAlreadyLiked
          ? commentAlreadyLiked
          : null,
        post,
        comment,
        user,
      };
    }

    if (post) {
      const like = new Like({
        commentId: null,
        postId: post._id,
        userId: user._id,
      });

      const result = await like.save();

      return {
        status: 201,
        like: result,
        post,
        comment,
        user,
      };
    }

    const like = new Like({
      commentId: comment?._id,
      postId: null,
      userId: user.id,
    });

    const result = await like.save();

    return {
      status: 201,
      like: result,
      post,
      comment,
      user,
    };
  } catch (error) {
    console.error(error);
  }
};

export const removeLike = async ({
  likeId,
  userId,
  commentId,
  postId,
}: {
  likeId?: string;
  userId: string;
  postId?: string;
  commentId?: string;
}) => {
  console.log(commentId, 'ID');
  if (!likeId && !commentId && !postId) {
    return {
      message: 'No post or comment or like id found',
      name: 'Not found',
      status: 404,
    };
  }
  try {
    if (likeId && !commentId && !postId) {
      const like = await Like.findByIdAndDelete(likeId);

      if (!like) {
        return {
          message: 'Like not found',
          name: 'Not found',
          status: 404,
        };
      }

      return { status: 200, like };
    }

    if (postId && !commentId) {
      const user = await User.findById(userId);
      const post = await Post.findById(postId);

      if (!user) {
        return {
          message: "User doesn't exist",
          name: 'Not Found',
          status: 404,
        };
      }

      if (!post) {
        return {
          message: "Post doesn't exist",
          name: 'Not found',
          status: 404,
        };
      }

      const like = await Like.findOneAndDelete({
        postId: post?._id,
        userId: user?._id,
      });

      return { status: 200, like };
    }

    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    console.log(comment);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (!comment) {
      return {
        message: "Comment doesn't exist",
        name: 'Not found',
        status: 404,
      };
    }

    const like = await Like.findOneAndDelete({
      commentId: comment._id,
      userId: user._id,
    });
    console.log(like);

    return { status: 200, like };
  } catch (error) {
    console.error(error);
  }
};

export const getLikes = async ({
  commentId,
  postId,
  page,
  userId,
}: {
  postId?: string;
  commentId?: string;
  page: number;
  userId: string;
}) => {
  try {
    const post = await Post.findById(postId);
    const comment = await Comment.findById(commentId);

    if (post && comment) {
      return {
        message: 'Cannot like a comment and post at the same time',
        name: 'Forbidden',
        status: 403,
      };
    }

    if (!post && !comment) {
      return {
        message: 'No post or comment found',
        name: 'Not found',
        status: 404,
      };
    }

    if (post) {
      const likes = await Like.paginate(
        { postId: post._id },
        { limit: PER_PAGE, page, sort: { updatedAt: -1 } }
      );

      const updatedDocs = likes.docs.map(async (like) => {
        const likeReturned = await returnLike({ like, userId });

        return likeReturned;
      });
      const docs = await Promise.all(updatedDocs);

      return { status: 200, likes: { ...likes, docs } };
    }

    const likes = await Like.paginate(
      { commentId: comment?._id },
      { limit: PER_PAGE, page, sort: { updatedAt: -1 } }
    );

    const updatedDocs = likes.docs.map(async (like) => {
      const likeReturned = await returnLike({ like, userId });

      return likeReturned;
    });
    const docs = await Promise.all(updatedDocs);

    return { status: 200, likes: { ...likes, docs } };
  } catch (error) {
    console.error(error);
  }
};
