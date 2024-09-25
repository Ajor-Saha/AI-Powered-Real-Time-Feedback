import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import FeedbackModel from "@/model/Feedback";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const ownerId = new mongoose.Types.ObjectId(_user._id);

    // Check if the user exists and is verified
    const user = await UserModel.findById(ownerId);
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Check if the user is an admin
    if (!user.isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "You do not have permission to display feedback",
        }),
        { status: 403 }
      );
    }

    // Fetch all feedback and group them by sentiment
    const feedback = await FeedbackModel.find();
    const totalFeedback = feedback.length;

    // Count the number of positive, negative, and neutral feedback
    const sentimentCount = {
      positive: feedback.filter((f) => f.sentiment === "positive").length,
      negative: feedback.filter((f) => f.sentiment === "negative").length,
      neutral: feedback.filter((f) => f.sentiment === "neutral").length,
    };

    // Calculate the percentage of each sentiment
    const sentimentPercentage = {
      positive: (sentimentCount.positive / totalFeedback) * 100 || 0,
      negative: (sentimentCount.negative / totalFeedback) * 100 || 0,
      neutral: (sentimentCount.neutral / totalFeedback) * 100 || 0,
    };

    // Return the total feedback and sentiment percentages
    return new Response(
      JSON.stringify({
        success: true,
        totalFeedback,
        sentimentPercentage,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching feedback",
      }),
      { status: 500 }
    );
  }
}
