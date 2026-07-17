"use client";

import { useParams, useSearchParams } from "next/navigation";
import CheckoutDetails from "./CheckoutDetails";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reference = String(params?.reference ?? "");

  // This page is public and has no session, so the order is looked up by
  // reference + businessId. Both come from the URL, matching /create-order.
  return (
    <CheckoutDetails
      reference={reference}
      businessId={searchParams.get("businessID") ?? ""}
      cooperateId={searchParams.get("cooperateID") ?? undefined}
      userId={searchParams.get("userId") ?? undefined}
    />
  );
}
