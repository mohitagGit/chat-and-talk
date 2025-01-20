const mongoose = require("mongoose");

const callSchema = mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    type: { type: String, trim: true, required: true },
    answeredAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    duration: { type: Number, required: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

callSchema.virtual("callStatuses", {
  ref: "CallStatus",
  localField: "_id",
  foreignField: "callId",
});

callSchema.set("toJSON", { virtuals: true });
callSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Call", callSchema);
