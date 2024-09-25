import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";



export async function DELETE(
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
          message: "You do not have permission to delete users",
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

    // Delete the user using findByIdAndDelete
    await UserModel.findByIdAndDelete(userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User successfully deleted",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting user",
      }),
      { status: 500 }
    );
  }
}
