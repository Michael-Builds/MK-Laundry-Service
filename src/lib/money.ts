export function formatCurrency(amount: number, symbol = "GH₵") {
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

export function calcDiscountAmount(
  subtotal: number,
  discountType: "None" | "Percent" | "Fixed",
  discountValue: number,
) {
  if (subtotal <= 0 || discountType === "None" || discountValue <= 0) {
    return 0;
  }
  if (discountType === "Percent") {
    const pct = Math.min(Math.max(discountValue, 0), 100);
    return Number(((subtotal * pct) / 100).toFixed(2));
  }
  return Number(Math.min(discountValue, subtotal).toFixed(2));
}

export function calcOrderTotals(
  items: { quantity: number; unitPrice: number }[],
  discountType: "None" | "Percent" | "Fixed",
  discountValue: number,
) {
  const subtotal = Number(
    items
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      .toFixed(2),
  );
  const discountAmount = calcDiscountAmount(
    subtotal,
    discountType,
    discountValue,
  );
  const total = Number(Math.max(subtotal - discountAmount, 0).toFixed(2));
  return { subtotal, discountAmount, total };
}
