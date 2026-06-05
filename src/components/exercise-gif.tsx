"use client";

import { useEffect, useState } from "react";

const DEFAULT_PLACEHOLDER = "/images/exercise-placeholder.svg";

type ExerciseGifProps = {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderSrc?: string;
};

export default function ExerciseGif({
  src,
  alt,
  className,
  placeholderSrc = DEFAULT_PLACEHOLDER,
}: ExerciseGifProps) {
  const [currentSrc, setCurrentSrc] = useState(src || placeholderSrc);

  useEffect(() => {
    setCurrentSrc(src || placeholderSrc);
  }, [src, placeholderSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setCurrentSrc(placeholderSrc)}
    />
  );
}
