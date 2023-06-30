import { Schema, Types, model } from 'mongoose';

export interface VerificationCodeModel {
  verificationCode: string;
  alreadyUsed: boolean;
  userId: any;
}

const verificationCodeSchema = new Schema<VerificationCodeModel>(
  {
    verificationCode: {
      type: String,
      required: true,
    },
    alreadyUsed: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'user',
    },
  },
  { timestamps: true }
);

export const VerificationCode = model<VerificationCodeModel>(
  'VerificationCode',
  verificationCodeSchema
);
