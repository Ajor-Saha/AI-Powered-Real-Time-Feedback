import mongoose, { Schema, Document } from "mongoose";

// Define the interface for Feedback
interface Feedback extends Document {
  name: string;
  email: string;
  orderId: string;
  message: string;
  sentiment: string;
}

// Create the Feedback Schema
const FeedbackSchema: Schema<Feedback> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],  // Enum to restrict possible values
      default: null,  // Optional, defaults to null if not provided
    },
  },
  { timestamps: true }
);

// Create the Feedback Model
const FeedbackModel =
  (mongoose.models.Feedback as mongoose.Model<Feedback>) ||
  mongoose.model<Feedback>("Feedback", FeedbackSchema);

export default FeedbackModel;
