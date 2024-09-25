import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import FeedbackModel from "@/model/Feedback";

export async function DELETE(
  req: Request,
  { params }: { params: { feedbackId: string } }
) {
  await dbConnect();

  try {
    const feedbackId = params.feedbackId;
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const ownerId = new mongoose.Types.ObjectId(_user._id);

    // Check if the authenticated user is an admin
    const currentUser = await UserModel.findById(ownerId);
    if (!currentUser || !currentUser.isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "You do not have permission to delete feedback",
        }),
        { status: 403 }
      );
    }

    // Find the feedback by feedbackId
    const targetFeedback = await FeedbackModel.findById(feedbackId);

    if (!targetFeedback) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Feedback not found",
        }),
        { status: 404 }
      );
    }

    // Delete the feedback
    await FeedbackModel.findByIdAndDelete(feedbackId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Feedback successfully deleted",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting feedback",
      }),
      { status: 500 }
    );
  }
}
