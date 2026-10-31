"use client";

import { useEffect, useState } from "react";

export function useBootLoading(
  boot?: () => void | Promise<void>,
  delay = 0,
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        await boot?.();
        if (delay > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, delay));
        }
      } finally {
        if (alive) setReady(true);
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [boot, delay]);

  return ready;
}
