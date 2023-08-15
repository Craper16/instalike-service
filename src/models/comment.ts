import { Schema, Types, model, PaginateModel } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

interface CommentModel {
  postId: any;
  userId: any;
  comment: string;
  edited: boolean;
}

const commentSchema = new Schema<CommentModel>(
  {
    comment: { type: String, required: true },
    edited: {
      type: Boolean,
      required: true,
    },
    postId: {
      type: Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

commentSchema.plugin(paginate);

export const Comment = model<CommentModel, PaginateModel<CommentModel>>(
  'Comment',
  commentSchema
);
