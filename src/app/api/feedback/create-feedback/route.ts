import dbConnect from "@/lib/dbConnect";
import { pusher } from "@/lib/pusherConfig";
import FeedbackModel from "@/model/Feedback";
import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(req: Request) {
  await dbConnect();

  try {
    // Extract feedback details from req.body
    const { name, email, orderId, message } = await req.json();

    // Validate the input
    if (!name || !email || !orderId || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Name, email, orderId, and message are required",
        }),
        { status: 400 }
      );
    }

    // Retrieve GEMINI API Key from environment variables
    let GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || "";

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Gemini API Key is missing",
        }),
        { status: 500 }
      );
    }

    // Initialize GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Create a prompt to predict the sentiment from the message
    const prompt = `Analyze the following customer feedback and classify the sentiment as positive, negative, or neutral: "${message}". Just give me one word: positive, negative, or neutral.`;

    // Get the Gemini model and handle API errors
    try {
      const model = await genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });

      const result = await model.generateContent(prompt);

      // Extract sentiment from the result
      const sentimentText = result?.response?.text().toLowerCase() || "neutral";

      const sentiment =
        sentimentText.includes("positive")
          ? "positive"
          : sentimentText.includes("negative")
          ? "negative"
          : "neutral";

      // Create new feedback with the analyzed sentiment
      const newFeedback = new FeedbackModel({
        name,
        email,
        orderId,
        message,
        sentiment,
      });

      // Save the feedback in the database
      await newFeedback.save();

     await pusher.trigger('feedback-channel', 'feedback-updated', {
        feedback: newFeedback,
      });

      // Return a successful response
      return new Response(
        JSON.stringify({
          success: true,
          message: "Feedback submitted successfully",
          newFeedback,
        }),
        { status: 201 }
      );
    } catch (apiError) {
      console.error("Error fetching from Google Generative AI:", apiError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error analyzing feedback sentiment",
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating feedback:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating feedback",
      }),
      { status: 500 }
    );
  }
}


/*await pusherServer.trigger(chatId, "new-message", newMessage) */