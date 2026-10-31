import type { AppSettings } from "./types";

export const defaultSettings: AppSettings = {
  businessName: "MK Laundry Service",
  currency: "Ghana Cedi",
  currencySymbol: "GH₵",
  notifyReady: true,
  autoPrintInvoice: false,
  requirePhone: true,
  lowStockAlerts: false,
};
