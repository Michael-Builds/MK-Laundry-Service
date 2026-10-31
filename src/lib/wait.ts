export function wait(ms = 450) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
