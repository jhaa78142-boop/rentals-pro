import React from "react";

type Props = {
  flip?: boolean;
  className?: string;
};

export default function WaveDivider({ flip = false, className = "" }: Props) {
  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg
        className={`h-14 w-[120%] ${flip ? "-scale-y-100" : ""}`}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,24 C120,56 240,72 360,64 C480,56 600,24 720,18 C840,12 960,32 1080,52 C1140,62 1170,66 1200,68 L1200,120 L0,120 Z"
          className="fill-white"
        />
      </svg>
    </div>
  );
}
