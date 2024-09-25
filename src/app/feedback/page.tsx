"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { feedbackSchema } from "@/schemas/feedbackSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


const Feedback = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      orderId: "",
      message: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof feedbackSchema>) => {
    setIsSubmitting(true);
    try {
      // Change the API endpoint to the one that handles feedback
      const response = await axios.post<ApiResponse>(
        "/api/feedback/create-feedback",
        data
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      setIsSubmitting(false);

      if (response.data.success) {
        // Optionally, reset the form after submission
        form.reset();
        router.replace("/successfull-feedback");
      }
    } catch (error) {
      console.error("Error during feedback submission:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage =
        axiosError.response?.data.message ??
        "There was a problem with your request. Please try again.";

      toast({
        title: "Feedback Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };


  return (
    <div className="py-20">
      <div className="flex flex-col justify-center items-center pb-10 pt-5 gap-5">
        <h1 className="text-xl md:text-3xl font-bold">Customer <span className="text-green-500">Feedback</span> for Our Product</h1>
        <p className="w-10/12  lg:px-16">We value your opinion! Share your thoughts about the product by providing your honest feedback. Your insights help us improve and continue delivering the best experience possible</p>
      </div>
      <div className="flex justify-center items-center">
      <Card className="w-[350px] sm:w-[450px] md:w-[600px]  lg:ml-20 border border-gray-200">
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
          <CardDescription>
          Add Your Feedback for the Product You Purchased
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <Input {...field} placeholder="Enter your Name" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} placeholder="Enter your Email" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="orderId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oder ID</FormLabel>
                    <Input {...field} placeholder="Enter your Order ID" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="message"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <Textarea {...field} placeholder="Type your message here." />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Feedback;
