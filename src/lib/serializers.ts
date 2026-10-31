import type {
  AppSettings,
  DiscountType,
  Employee,
  Order,
  OrderItem,
  PaymentMethod,
  Service,
} from "@/data/types";
import type {
  AppSettings as DbSettings,
  DiscountType as DbDiscountType,
  Employee as DbEmployee,
  Order as DbOrder,
  OrderItem as DbOrderItem,
  PaymentMethod as DbPayment,
  Service as DbService,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

function num(value: Decimal | number | string) {
  return Number(value);
}

export function toPaymentMethod(value: DbPayment): PaymentMethod {
  return value === "MobileMoney" ? "Mobile Money" : "Cash";
}

export function fromPaymentMethod(value: PaymentMethod): DbPayment {
  return value === "Mobile Money" ? "MobileMoney" : "Cash";
}

export function serializeEmployee(employee: DbEmployee): Employee {
  return {
    id: employee.id,
    username: employee.username,
    fullName: employee.fullName,
    role: employee.role,
    phone: employee.phone,
    email: employee.email,
    active: employee.active,
  };
}

export function serializeService(service: DbService): Service {
  return {
    id: service.id,
    name: service.name,
    unitPrice: num(service.unitPrice),
    category: service.category,
    active: service.active,
    description: service.description ?? undefined,
  };
}

export function serializeOrderItem(item: DbOrderItem): OrderItem {
  return {
    id: item.id,
    serviceId: item.serviceId ?? "",
    name: item.name,
    quantity: item.quantity,
    unitPrice: num(item.unitPrice),
  };
}

export function serializeOrder(
  order: DbOrder & {
    items: DbOrderItem[];
    teller?: Pick<DbEmployee, "fullName"> | null;
  },
): Order {
  return {
    id: order.id,
    code: order.code,
    customerName: order.customerName,
    phone: order.phone,
    deliveryDate: order.deliveryDate.toISOString().slice(0, 10),
    payment: toPaymentMethod(order.payment),
    items: order.items.map(serializeOrderItem),
    subtotal: num(order.subtotal),
    discountType: order.discountType as DiscountType,
    discountValue: num(order.discountValue),
    discountAmount: num(order.discountAmount),
    total: num(order.total),
    status: order.status,
    tellerId: order.tellerId,
    tellerName: order.teller?.fullName,
    createdAt: order.createdAt.toISOString(),
    notes: order.notes ?? undefined,
    cancelReason: order.cancelReason ?? undefined,
  };
}

export function serializeSettings(settings: DbSettings): AppSettings {
  return {
    businessName: settings.businessName,
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    notifyReady: settings.notifyReady,
    autoPrintInvoice: settings.autoPrintInvoice,
    requirePhone: settings.requirePhone,
    lowStockAlerts: settings.lowStockAlerts,
  };
}

export type { DbDiscountType };
