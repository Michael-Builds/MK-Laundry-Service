export type Role = "Administrator" | "Manager" | "Employee";

export type OrderStatus =
  | "Received"
  | "Washing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export type PaymentMethod = "Cash" | "Mobile Money";

export interface Employee {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: Role;
  phone: string;
  email: string;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  unitPrice: number;
  category: "Garment" | "Home" | "Specialty";
  active: boolean;
  description?: string;
}

export interface OrderItem {
  serviceId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  deliveryDate: string;
  payment: PaymentMethod;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  tellerId: string;
  createdAt: string;
  notes?: string;
}

export interface AppSettings {
  businessName: string;
  currency: string;
  currencySymbol: string;
  notifyReady: boolean;
  autoPrintInvoice: boolean;
  requirePhone: boolean;
  lowStockAlerts: boolean;
}
