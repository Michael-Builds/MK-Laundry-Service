export type Role = "Administrator" | "Manager" | "Employee";

export type OrderStatus =
  | "Received"
  | "Washing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export type PaymentMethod = "Cash" | "Mobile Money";

export type DiscountType = "None" | "Percent" | "Fixed";

export type ServiceCategory = "Garment" | "Home" | "Specialty";

export interface Employee {
  id: string;
  username: string;
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
  category: ServiceCategory;
  active: boolean;
  description?: string;
}

export interface OrderItem {
  id?: string;
  serviceId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  deliveryDate: string;
  payment: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  tellerId: string;
  tellerName?: string;
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

export type SessionUser = Employee;
