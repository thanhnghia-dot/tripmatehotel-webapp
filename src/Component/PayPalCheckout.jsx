import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PayPalCheckout.css";

function PayPalCheckout({ amount, onSuccess }) {
  const [loading, setLoading] = useState(true);

  const handleApprove = async (data) => {
    try {
      console.log("PayPal order approved:", data);
      toast.success("🎉 Payment Success!");
      if (onSuccess) onSuccess({ orderId: data.orderID });
    } catch (err) {
      console.error("PayPal approve error:", err);
      toast.error("❌ Payment failed. Please try again.");
    }
  };

  const handleError = (err) => {
    console.error("PayPal Buttons error:", err);
    toast.error("❌ Payment failed. Please try again.");
  };

  return (
    <div className="paypal-checkout-container">
      <h3 className="paypal-title">💳 Secure Payment with PayPal</h3>

      <div className="paypal-summary">
        <p>
          <strong>Amount:</strong> ${amount}
        </p>
        <p>
          <strong>Currency:</strong> USD
        </p>
      </div>

      <div className="paypal-box">
        <PayPalScriptProvider
          options={{
            "client-id":
              "AW1afthdfZjDdL4w64UbJItJoxY047b-W8C_aS28N2Nozoi7rx8yTusF4sVAAszqVm0alPrtDf-hwFGb",
            currency: "USD",
          }}
        >
          {loading && <div className="paypal-loading">Loading PayPal...</div>}

          <PayPalButtons
            style={{
              layout: "vertical",
              color: "blue",
              shape: "pill",
              label: "checkout",
            }}
            onInit={() => setLoading(false)}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount,
                    },
                  },
                ],
              });
            }}
            onApprove={handleApprove}
            onError={handleError}
          />
        </PayPalScriptProvider>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default PayPalCheckout;
