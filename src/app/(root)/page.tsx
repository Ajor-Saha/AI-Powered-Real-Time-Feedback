"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { pusherClient } from "@/lib/pusherConfig";

// Define Feedback interface
interface Feedback {
  _id: string;
  name: string;
  email: string;
  orderId: string;
  message: string;
  sentiment: "positive" | "negative" | "neutral";
  createdAt: Date;
}

const Home = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [customerFeedback, setCustomerFeedback] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [feedbackDetails, setFeedbackDetails] = useState<any>({});

  useEffect(() => {
    // Initialize Pusher
    // Subscribe to the feedback channel
    const channel = pusherClient.subscribe("feedback-channel");

    // Bind to the feedback-updated event
    channel.bind("feedback-updated", (data: { feedback: Feedback }) => {
      setCustomerFeedback((prev) => [...prev, data.feedback]);
    });

    // Cleanup function to unsubscribe
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const fetchCustomerFeedback = useCallback(async () => {
    try {
      const response = await axios.get("/api/feedback/get-feedback");
      if (response.data.success) {
        setCustomerFeedback(response.data.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching feedback details";
    }
  }, []);

  const fetchFeedbackDetails = useCallback(async () => {
    try {
      const response = await axios.get("/api/feedback/dashboard-data");
      if (response.data.success) {
        setFeedbackDetails(response.data);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching feedback details";
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchCustomerFeedback();
      fetchFeedbackDetails();
    }
  }, [session, fetchCustomerFeedback, fetchFeedbackDetails]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based
    const year = date.getUTCFullYear();

    // Return the formatted date as '10/9/2024' (day/month/year)
    return `${day}/${month}/${year}`;
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const response = await axios.delete(
        `/api/feedback/delete-feedback/${feedbackId}`
      );
      if (response.data.success) {
        toast({
          title: "Feedback deleted",
          description: "The feedback has been successfully deleted.",
        });
        setCustomerFeedback((prev) =>
          prev.filter((feedback) => feedback._id !== feedbackId)
        );
      } else {
        toast({
          title: "Error",
          description: response.data.message,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to delete feedback",
      });
    }
  };

  console.log(feedbackDetails);

  return (
    <div className="ml-5 pb-10">
      <h1 className="text-2xl font-bold p-5 text-green-900 dark:text-green-500">
        Hello, {user?.username}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center justify-evenly gap-5 lg:ml-8">
        <Card className="w-[300px]">
          <CardHeader>
            <p>
              <b>Total Feedback</b> : {feedbackDetails.totalFeedback}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-2">
              <span className="text-sm text-green-400">Positive </span>
              <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 h-5 mt-1">
                <div
                  className="bg-blue-600 text-xs font-medium text-blue-100 text-center  h-full leading-none rounded-full"
                  style={{
                    width: `${
                      feedbackDetails.sentimentPercentage
                        ? Math.round(
                            feedbackDetails.sentimentPercentage.positive
                          )
                        : 0
                    }%`,
                  }}
                >
                  {feedbackDetails.sentimentPercentage
                    ? Math.round(feedbackDetails.sentimentPercentage.positive)
                    : 0}
                  %
                </div>
              </div>
            </div>
            <div className="flex gap-3 mb-2">
              <span className="text-sm text-green-400">Negative </span>
              <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 h-5 mt-1">
                <div
                  className="bg-yellow-600 text-xs  font-medium text-blue-100  text-center   h-full leading-none rounded-full"
                  style={{
                    width: `${
                      feedbackDetails.sentimentPercentage
                        ? Math.round(
                            feedbackDetails.sentimentPercentage.negative
                          )
                        : 0
                    }%`,
                  }}
                >
                  {feedbackDetails.sentimentPercentage
                    ? Math.round(feedbackDetails.sentimentPercentage.negative)
                    : 0}
                  %
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-sm text-green-400">Netural </span>
              <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 h-5 mt-1">
                <div
                  className="bg-gray-500 text-xs font-medium text-blue-100 text-center  h-full leading-none rounded-full"
                  style={{
                    width: `${
                      feedbackDetails.sentimentPercentage
                        ? Math.round(
                            feedbackDetails.sentimentPercentage.neutral
                          )
                        : 0
                    }%`,
                  }}
                >
                  {feedbackDetails.sentimentPercentage
                    ? Math.round(feedbackDetails.sentimentPercentage.neutral)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-[300px] lg:ml-16">
          <CardHeader>
            <p>
              <b>Feedback Form</b>
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label className="text-sm text-gray-600">Feedback Form URL</Label>
              <Input
                type="text"
                value="http://localhost:3000/feedback"
                readOnly
                className="mt-1"
              />
            </div>
            <Button
              className="w-full mt-2"
              onClick={() => {
                navigator.clipboard.writeText("http://localhost:3000/feedback");
                alert("Link copied to clipboard!");
              }}
            >
              Copy Link
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mx-auto  ml-5 px-8 lg:pr-4">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-20 pb-10 px-5 border-y border-blue-500">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  OderId
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Feedback
                </th>
                <th scope="col" className="px-6 py-3">
                  Details
                </th>
                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {customerFeedback.length > 0 ? (
                customerFeedback.map((feedback, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="px-6 py-4">{feedback.orderId}</td>
                    <td className="px-6 py-4">{feedback.name}</td>
                    <td className="px-6 py-4">{feedback.email}</td>
                    <td className="px-6 py-4">{feedback.sentiment}</td>

                    <td className="px-6 py-4 text-blue-400">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button>See</button>
                        </DialogTrigger>
                        <DialogContent className="w-full ">
                          <DialogHeader>
                            <DialogDescription className="mt-5">
                              Customer Message : {feedback.message}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <RiDeleteBin6Line
                            className="text-red-500 cursor-pointer"
                            size={20}
                          />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this expense and remove your
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFeedback(feedback._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center dark:text-gray-50"
                  >
                    No feedback available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
