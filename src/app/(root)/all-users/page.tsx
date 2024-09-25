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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AllUsers = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null); // Track deletion state

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await axios.get("/api/user/all-users");
      if (response.data.success) {
        setAllUsers(response.data.data);
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
      fetchAllUsers();
    }
  }, [session, fetchAllUsers]);

  const makeAdmin = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/user/make-admin/${userId}`);
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        // Refetch all users to reflect changes
        fetchAllUsers();
      } else {
        toast({
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        description:
          axiosError.response?.data.message ?? "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based
    const year = date.getUTCFullYear();

    // Return the formatted date as '10/9/2024' (day/month/year)
    return `${day}/${month}/${year}`;
  };

  const deleteUser = async (userId: string) => {
    setDeleting(userId);
    try {
      const response = await axios.delete<ApiResponse>(`/api/user/delete-user/${userId}`);
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        // Refetch all users to reflect changes
        fetchAllUsers();
      } else {
        toast({
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        description:
          axiosError.response?.data.message ?? "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center py-5">
      <h1 className="font-bold text-xl"> AllUsers</h1>
      <div className="ml-5 px-8 lg:pr-4">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-20 pb-10 px-5 border-y border-blue-500">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Username
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  isAdmin
                </th>
                <th scope="col" className="px-6 py-3">
                  Make Admin
                </th>

                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length > 0 ? (
                allUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <FaCheck className="text-green-500 text-center" />
                      ) : (
                        <FaTimes className="text-red-500 text-center" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-blue-400">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button>Update</button>
                        </DialogTrigger>
                        <DialogContent className="w-full ">
                          <DialogHeader>
                            <p>Full Name : {user.fullName}</p>
                            <p>Username : {user.username}</p>
                            <p>Email : {user.email}</p>
                          </DialogHeader>
                          <Button
                            className="mt-5 w-1/2 mx-auto"
                            onClick={() => makeAdmin(user._id)}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                              </>
                            ) : (
                              "Confirm"
                            )}
                          </Button>
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
                              onClick={() => deleteUser(user._id)}
                              disabled={deleting === user._id}
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
                    No Users found
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

export default AllUsers;
