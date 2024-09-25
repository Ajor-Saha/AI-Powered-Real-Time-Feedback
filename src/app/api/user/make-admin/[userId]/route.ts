import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  try {
    const userId = params.userId;
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
          message: "You do not have permission to update admin status",
        }),
        { status: 403 }
      );
    }

    // Find the user by the userId parameter
    const targetUser = await UserModel.findById(userId);

    if (!targetUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    // Check if the user is already an admin
    if (targetUser.isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User is already an admin",
        }),
        { status: 400 }
      );
    }

    // Update the user to be an admin
    targetUser.isAdmin = true;
    await targetUser.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "User successfully updated to admin",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user details:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error updating user details",
      }),
      { status: 500 }
    );
  }
}
  