import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const refreshSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type RefreshSessionDocument = InferSchemaType<typeof refreshSessionSchema> & {
  _id: Types.ObjectId;
};
export const RefreshSession = model('RefreshSession', refreshSessionSchema);
