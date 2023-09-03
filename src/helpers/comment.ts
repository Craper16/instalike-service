import { Document, Types } from 'mongoose';
import { CommentModel } from '../models/comment';
import { returnUser } from './user';
import dayjs from 'dayjs';
import { User } from '../models/user';
import { Post } from '../models/post';
import { returnPost } from './post';
import { Like } from '../models/like';

export const returnComment = async ({
  comment,
  userId,
}: {
  comment:
    | (Document<unknown, {}, CommentModel> &
        Omit<
          CommentModel & {
            _id: Types.ObjectId;
          },
          never
        >)
    | undefined
    | null;
  userId: string;
}) => {
  if (!comment) return null;

  const user = await User.findById(comment?.userId);
  const post = await Post.findById(comment?.postId);
  const likesTotal = (await Like.paginate({ commentId: comment?._id }))
    .totalDocs;
  const commentAlreadyLiked = await Like.findOne({
    commentId: comment._id,
    userId,
    postId: null,
  });

  const postReturned = await returnPost({ post, userId });

  return {
    commentId: comment?._id,
    comment: comment?.comment,
    likesTotal,
    isEditted: comment?.edited,
    user: returnUser({ user }),
    post: postReturned,
    commentAlreadyLiked: commentAlreadyLiked ? true : false,
    commentedAt: dayjs((comment as any).updatedAt).fromNow(false),
  };
};
