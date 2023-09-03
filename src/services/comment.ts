import { PER_PAGE } from '../consts/constants';
import { Comment } from '../models/comment';
import { Post } from '../models/post';
import { User } from '../models/user';
import { returnComment } from '../helpers/comment';

export const postComment = async ({
  comment,
  postId,
  userId,
}: {
  postId: string;
  comment: string;
  userId: string;
}) => {
  try {
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
        name: 'Not Found',
        status: 404,
      };
    }

    const uploadedComment = new Comment({
      comment,
      edited: false,
      postId: post._id,
      userId: user._id,
    });

    const result = await uploadedComment.save();

    return { status: 201, comment: result };
  } catch (error) {
    console.error(error);
  }
};

export const getComment = async ({ commentId }: { commentId: string }) => {
  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return {
        message: "Comment doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const user = await User.findById(comment.userId);
    const post = await Post.findById(comment.postId);

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
        name: 'Not Found',
        status: 404,
      };
    }

    return { status: 200, comment, user, post };
  } catch (error) {
    console.error(error);
  }
};

export const editComment = async ({
  commentId,
  comment,
}: {
  commentId: string;
  comment: string;
}) => {
  try {
    const commentToEdit = await Comment.findById(commentId);

    if (!commentToEdit) {
      return {
        message: "Comment doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const user = await User.findById(commentToEdit.userId);
    const post = await Post.findById(commentToEdit.postId);

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
        name: 'Not Found',
        status: 404,
      };
    }

    commentToEdit.comment = comment;
    commentToEdit.edited = true;

    const result = await commentToEdit.save();

    return { status: 200, comment: result, user, post };
  } catch (error) {
    console.error(error);
  }
};

export const deleteComment = async ({ commentId }: { commentId: string }) => {
  try {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return {
        message: "Comment doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const user = await User.findById(comment.userId);
    const post = await Post.findById(comment.postId);

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
        name: 'Not Found',
        status: 404,
      };
    }

    return { status: 200, comment, user, post };
  } catch (error) {
    console.error(error);
  }
};

export const getPostComments = async ({
  page,
  postId,
  userId,
}: {
  postId: string;
  page: number;
  userId: string;
}) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      return {
        message: "Post doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const comments = await Comment.paginate(
      { postId: post._id },
      { limit: PER_PAGE, page, sort: { updatedAt: -1 } }
    );

    const commentsResponse = comments.docs.map(async (comment) => {
      const commentReturned = await returnComment({ comment, userId });

      return commentReturned;
    });

    const docs = await Promise.all(commentsResponse);

    return { status: 200, comments: { ...comments, docs } };
  } catch (error) {
    console.error(error);
  }
};
