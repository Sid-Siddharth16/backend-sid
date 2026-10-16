import mongoose from "mongoose";

const { Schema } = mongoose;

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user cannot subscribe to the same channel twice.
subscriptionSchema.index(
  { subscriber: 1, channel: 1 },
  { unique: true }
);

// Efficiently retrieve a channel's subscribers.
subscriptionSchema.index({ channel: 1, createdAt: -1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);