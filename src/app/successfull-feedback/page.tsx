import React from "react";

const SuccessFeedback = () => {
  return (
    <div className="flex flex-col justify-center items-center space-y-4 py-10">
      <h1 className="text-xl font-bold">Thank You for Your Valuable <span className="text-green-500">Feedback</span>!</h1>
      <p className="px-10 lg:px-24 text-sm font-semibold">
        We sincerely appreciate you taking the time to share your feedback on
        the product you purchased. Your input helps us continue to improve and
        offer the best possible experience for our customers. If you have any
        more thoughts or questions, feel free to reach out to us. Thank you for
        being a valued customer!
      </p>
    </div>
  );
};

export default SuccessFeedback;
