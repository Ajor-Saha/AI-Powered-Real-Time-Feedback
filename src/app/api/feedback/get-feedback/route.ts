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

    // If the user is an admin, fetch all feedback
    if (user.isAdmin) {
        const feedbacks = await FeedbackModel.find({}).sort({ createdAt: -1 }); // Sort by `createdAt` in descending order
        return new Response(
        JSON.stringify({
          success: true,
          message: "All feedback fetched successfully",
          data:feedbacks,
        }),
        { status: 200 }
      );
    }

    // If the user is not an admin, return a message indicating insufficient permissions
    return new Response(
      JSON.stringify({
        success: false,
        message: "You do not have permission to access this resource",
      }),
      { status: 403 }
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
