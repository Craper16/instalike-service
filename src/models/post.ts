import { Schema, Types, model } from 'mongoose';

interface PostModel {
  userId: any;
  post: string[];
}

const postSchema = new Schema(
  {
    post: [
      {
        type: String,
        required: true,
      }, 
    ],
    userId: {
      type: Types.ObjectId,
      ref: 'user',
    },
  },
  { timestamps: true }
);

export const Post = model('Post', postSchema);
