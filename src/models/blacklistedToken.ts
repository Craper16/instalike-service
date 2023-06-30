import { Schema, model } from 'mongoose';

export interface blackListedTokenModel {
  blackListedToken: string;
}

const blackListedTokenSchema = new Schema<blackListedTokenModel>(
  {
    blackListedToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const BlackListedToken = model<blackListedTokenModel>(
  'BlackListedToken',
  blackListedTokenSchema
);
