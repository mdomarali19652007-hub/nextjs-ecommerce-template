"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { setShippingMethodAsync } from "@/redux/features/cart-thunks";
import { listShippingOptions } from "@/lib/medusa/cart";

type Option = { id: string; name: string; amount?: number };

const ShippingMethod = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [shippingMethod, setShippingMethod] = useState("free");
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listShippingOptions();
      if (cancelled) return;
      const mapped: Option[] = (result as unknown as Array<Record<string, unknown>>).map(
        (opt) => ({
          id: String(opt.id),
          name: typeof opt.name === "string" ? opt.name : "Shipping",
          amount:
            typeof opt.amount === "number"
              ? (opt.amount as number)
              : undefined,
        })
      );
      setOptions(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChoose = (key: string) => {
    setShippingMethod(key);
    // If Medusa is up and we matched a real option id, push it to the cart.
    const live = options.find((o) => o.id === key);
    if (live) dispatch(setShippingMethodAsync(live.id));
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="free"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="free"
                id="free"
                className="sr-only"
                onChange={() => handleChoose("free")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "free"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            Free Shipping
          </label>

          <label
            htmlFor="fedex"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="fedex"
                id="fedex"
                className="sr-only"
                onChange={() => handleChoose("fedex")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "fedex"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div className="rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image
                    src="/images/checkout/fedex.svg"
                    alt="fedex"
                    width={64}
                    height={18}
                  />
                </div>

                <div className="border-l border-gray-4 pl-4">
                  <p className="font-semibold text-dark">$10.99</p>
                  <p className="text-custom-xs">Standard Shipping</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="dhl"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="dhl"
                id="dhl"
                className="sr-only"
                onChange={() => handleChoose("dhl")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "dhl"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div className="rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image
                    src="/images/checkout/dhl.svg"
                    alt="dhl"
                    width={64}
                    height={20}
                  />
                </div>

                <div className="border-l border-gray-4 pl-4">
                  <p className="font-semibold text-dark">$12.50</p>
                  <p className="text-custom-xs">Standard Shipping</p>
                </div>
              </div>
            </div>
          </label>

          {options.length > 0 ? (
            <div className="border-t border-gray-3 pt-4 flex flex-col gap-2">
              <p className="text-custom-sm text-dark-5">
                Available shipping options for this cart:
              </p>
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer select-none items-center gap-3.5"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      name={opt.id}
                      id={opt.id}
                      className="sr-only"
                      onChange={() => handleChoose(opt.id)}
                    />
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        shippingMethod === opt.id
                          ? "border-4 border-blue"
                          : "border border-gray-4"
                      }`}
                    ></div>
                  </div>
                  <span>{opt.name}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
