import React, { useEffect, useMemo, useRef, useState } from "react";

export function CountUp({ 
  end, 
  duration = 1.1, 
  decimals = 0, 
  prefix = "", 
  suffix = "" 
}: { 
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayText, setDisplayText] = useState("0");
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals]
  );
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

      // easeOutCubic - cheaper than quart, feels smoother/snappier
      const ease = 1 - Math.pow(1 - progress, 3);
      const text = formatter.format(end * ease);
      if (spanRef.current) {
        spanRef.current.textContent = text;
      } else {
        setDisplayText(text);
      }

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        const finalText = formatter.format(end);
        if (spanRef.current) {
          spanRef.current.textContent = finalText;
        }
        setDisplayText(finalText);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration, formatter]);

  return (
    <span>
      {prefix}
      <span ref={spanRef}>{displayText}</span>
      {suffix}
    </span>
  );
}
