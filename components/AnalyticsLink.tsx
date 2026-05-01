"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

type AnalyticsLinkProps = ComponentProps<typeof Link> & {
  eventName: AnalyticsEventName;
  eventProperties?: Record<string, string | number | boolean | null | undefined>;
};

export default function AnalyticsLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventProperties);
        onClick?.(event);
      }}
    />
  );
}
