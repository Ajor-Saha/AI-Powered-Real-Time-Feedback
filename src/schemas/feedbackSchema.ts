import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  orderId: z.string().min(1, "Order ID is required"),
  message: z.string().min(4, "Message is required"),
});
