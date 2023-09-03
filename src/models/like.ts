import { Schema, Types, model, PaginateModel } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

export interface LikeModel {
  postId: any;
  userId: any;
  commentId: any;
}

const likeSchema = new Schema<LikeModel>(
  {
    commentId: {
      type: Types.ObjectId,
      ref: 'Comment',
    },
    postId: {
      type: Types.ObjectId,
      ref: 'Post',
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.plugin(paginate);

export const Like = model<LikeModel, PaginateModel<LikeModel>>(
  'Like',
  likeSchema
);
