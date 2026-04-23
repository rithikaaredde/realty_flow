"use client";

import type { ComponentProps } from "react";
import PropertyMap from "@/components/PropertyMap";

type MapViewProps = ComponentProps<typeof PropertyMap>;

export default function MapView({
  properties,
  onPropertySelect,
  className,
  compact,
}: MapViewProps & { className?: string }) {
  return (
    <div className={className}>
      <PropertyMap
        properties={properties}
        onPropertySelect={onPropertySelect}
        compact={compact}
      />
    </div>
  );
}
