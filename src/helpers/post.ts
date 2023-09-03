import { Document, Types } from 'mongoose';
import { PostModel } from '../models/post';
import dayjs from 'dayjs';
import { returnUser } from './user';
import { User } from '../models/user';
import { Comment } from '../models/comment';
import { Like } from '../models/like';

export const returnPost = async ({
  post,
  userId,
}: {
  post:
    | (Document<unknown, {}, PostModel> &
        Omit<
          PostModel & {
            _id: Types.ObjectId;
          },
          never
        >)
    | undefined
    | null;
  userId: string;
}) => {
  if (!post) return null;

  const authUser = await User.findById(userId);
  const user = await User.findById(post?.userId);
  const commentsTotal = (await Comment.paginate({ postId: post?._id }))
    .totalDocs;
  const likesTotal = (await Like.paginate({ postId: post?._id })).totalDocs;
  const postAlreadyLiked = await Like.findOne({
    postId: post._id,
    userId: authUser?._id,
    commentId: null
  });


  return {
    postId: post?._id,
    post: {
      post: post?.post,
      caption: post?.caption,
    },
    commentsTotal,
    likesTotal,
    postAlreadyLiked: postAlreadyLiked ? true : false,
    user: returnUser({ user }),
    postDate: dayjs((post as any)?.createdAt).fromNow(false),
  };
};
