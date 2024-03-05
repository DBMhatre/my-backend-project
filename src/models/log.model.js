import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
  {
    todo: [
      {
        type: String,
        required: true,
      },
    ],
    rememberTodayBy: {
      type: String,
      required: true,
    },
    expences: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    surpriceQue: {
      type: String,
      required: true,
    },
    surpriceAnswer: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    logDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Log = mongoose.model("log", logSchema);
