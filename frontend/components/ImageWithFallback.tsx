"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function ImageWithFallback(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc =
    typeof props.src === "string" && props.src.trim().length > 0
      ? props.src
      : "https://placehold.co/800x600";

  return (
    <Image
      {...props}
      src={failed ? "https://placehold.co/800x600" : safeSrc}
      alt={props.alt}
      onError={() => setFailed(true)}
    />
  );
}
