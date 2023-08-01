import { Schema, Types, model } from 'mongoose';

interface PostModel {
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
      ref: 'user',
    },
  },
  { timestamps: true }
);

export const Post = model<PostModel>('Post', postSchema);
