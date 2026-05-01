"use client";

import React from "react";
import { useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartTotals,
  selectCurrencyCode,
  selectTotalPrice,
} from "@/redux/features/cart-slice";

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
};

const OrderList = () => {
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const currency = useSelector(selectCurrencyCode);
  const total = useSelector(selectTotalPrice);

  return (
    <>
      {items.length === 0 ? (
        <div className="flex items-center justify-between py-5 border-b border-gray-3">
          <p className="text-dark">Your cart is empty</p>
        </div>
      ) : (
        items.map((item) => (
          <div
            key={String(item.id)}
            className="flex items-center justify-between py-5 border-b border-gray-3"
          >
            <div>
              <p className="text-dark">
                {item.title}
                {item.quantity > 1 ? ` × ${item.quantity}` : null}
              </p>
            </div>
            <div>
              <p className="text-dark text-right">
                {formatMoney(item.discountedPrice * item.quantity, currency)}
              </p>
            </div>
          </div>
        ))
      )}

      {totals.shippingTotal > 0 ? (
        <div className="flex items-center justify-between py-5 border-b border-gray-3">
          <div>
            <p className="text-dark">Shipping Fee</p>
          </div>
          <div>
            <p className="text-dark text-right">
              {formatMoney(totals.shippingTotal, currency)}
            </p>
          </div>
        </div>
      ) : null}

      {/* <!-- total --> */}
      <div className="flex items-center justify-between pt-5">
        <div>
          <p className="font-medium text-lg text-dark">Total</p>
        </div>
        <div>
          <p className="font-medium text-lg text-dark text-right">
            {formatMoney(total, currency)}
          </p>
        </div>
      </div>
    </>
  );
};

export default OrderList;
