"use client";

import { useParams } from "next/navigation";
import CheckoutDetails from "./CheckoutDetails";

export default function CheckoutPage() {
  const params = useParams();
  const reference = String(params?.reference ?? "");

  return <CheckoutDetails reference={reference} />;
}
