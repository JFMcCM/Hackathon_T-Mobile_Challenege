import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if firebase.js is in the same folder

import React from "react";
export default function AverageRatings() {
  const [averages, setAverages] = useState({
    connectivityRating: 0,
    customerServiceRating: 0,
    internetSpeedRating: 0,
    priceRating: 0,
    feedbackCount: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "responses"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      if (data.length === 0) {
        setAverages({
          connectivityRating: 0,
          customerServiceRating: 0,
          internetSpeedRating: 0,
          priceRating: 0,
          feedbackCount: 0
        });
        return;
      }

      const totals = data.reduce(
        (acc, curr) => ({
          connectivityRating: acc.connectivityRating + (curr.connectivityRating || 0),
          customerServiceRating: acc.customerServiceRating + (curr.customerServiceRating || 0),
          internetSpeedRating: acc.internetSpeedRating + (curr.internetSpeedRating || 0),
          priceRating: acc.priceRating + (curr.priceRating || 0)
        }),
        { connectivityRating: 0, customerServiceRating: 0, internetSpeedRating: 0, priceRating: 0 }
      );

      const count = data.length;
      setAverages({
        connectivityRating: (totals.connectivityRating / count).toFixed(2),
        customerServiceRating: (totals.customerServiceRating / count).toFixed(2),
        internetSpeedRating: (totals.internetSpeedRating / count).toFixed(2),
        priceRating: (totals.priceRating / count).toFixed(2),
        feedbackCount: count
      });
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center text-pink-600 mb-4">
        📊 Average Ratings (Live)
      </h2>
      <div className="space-y-2 text-lg">
        <p><strong>Connectivity:</strong> {averages.connectivityRating}</p>
        <p><strong>Customer Service:</strong> {averages.customerServiceRating}</p>
        <p><strong>Internet Speed:</strong> {averages.internetSpeedRating}</p>
        <p><strong>Price:</strong> {averages.priceRating}</p>
      </div>
      <p className="mt-4 text-gray-500 text-sm text-center">
        Based on {averages.feedbackCount} responses
      </p>
    </div>
  );
}
