"use client";

import { wait } from "@/lib/wait";
import { useEffect, useState } from "react";

export function useBootLoading(boot?: () => void, delay = 350) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      boot?.();
      await wait(delay);
      if (alive) setReady(true);
    };

    void run();
    return () => {
      alive = false;
    };
  }, [boot, delay]);

  return ready;
}
