import { Schema, Types, model, PaginateModel } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

export interface PostModel {
  userId: any;
  post: string[];
  caption: string;
}

const postSchema = new Schema<PostModel>(
  {
    post: [
      {
        type: String,
        required: true,
      },
    ],
    caption: { type: String },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

postSchema.plugin(paginate);

export const Post = model<PostModel, PaginateModel<PostModel>>(
  'Post',
  postSchema
);
