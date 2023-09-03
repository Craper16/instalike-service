import { Document, Types } from 'mongoose';
import { Like, LikeModel } from '../models/like';
import { returnUser } from './user';
import dayjs from 'dayjs';
import { returnPost } from './post';
import { returnComment } from './comment';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { User } from '../models/user';

export const returnLike = async ({
  like,
  userId,
}: {
  like:
    | (Document<unknown, {}, LikeModel> &
        Omit<
          LikeModel & {
            _id: Types.ObjectId;
          },
          never
        >)
    | undefined
    | null;
  userId: string;
}) => {
  if (!like) {
    return null;
  }

  const post = await Post.findById(like?.postId);
  const comment = await Comment.findById(like?.commentId);
  const user = await User.findById(like?.userId);

  const commentReturned = await returnComment({
    comment: comment ?? null,
    userId,
  });

  const postReturned = await returnPost({ post: post ?? null, userId });

  return {
    likeId: like?._id,
    post: postReturned,
    comment: commentReturned,
    user: returnUser({ user }),
    likeDate: dayjs((like as any)?.createdAt).fromNow(false),
  };
};
