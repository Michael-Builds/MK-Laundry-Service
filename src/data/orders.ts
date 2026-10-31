import type { Order } from "./types";

export const orders: Order[] = [
  {
    id: "ORD-1042",
    customerName: "Kojo Addo",
    phone: "0244001122",
    deliveryDate: "2026-11-01",
    payment: "Cash",
    items: [
      { serviceId: "svc-001", name: "Shirt", quantity: 4, unitPrice: 8 },
      { serviceId: "svc-002", name: "Trousers", quantity: 2, unitPrice: 12 },
    ],
    total: 56,
    status: "Received",
    tellerId: "emp-003",
    createdAt: "2026-10-31T08:15:00.000Z",
    notes: "No starch on shirts",
  },
  {
    id: "ORD-1041",
    customerName: "Abena Serwaa",
    phone: "0205556677",
    deliveryDate: "2026-10-31",
    payment: "Mobile Money",
    items: [
      { serviceId: "svc-003", name: "Dress", quantity: 2, unitPrice: 18 },
      { serviceId: "svc-006", name: "Bedsheet set", quantity: 1, unitPrice: 25 },
    ],
    total: 61,
    status: "Washing",
    tellerId: "emp-004",
    createdAt: "2026-10-30T14:40:00.000Z",
  },
  {
    id: "ORD-1040",
    customerName: "Nana Yeboah",
    phone: "0559988776",
    deliveryDate: "2026-10-31",
    payment: "Cash",
    items: [
      { serviceId: "svc-004", name: "Suit", quantity: 1, unitPrice: 45 },
      { serviceId: "svc-001", name: "Shirt", quantity: 3, unitPrice: 8 },
    ],
    total: 69,
    status: "Ready",
    tellerId: "emp-003",
    createdAt: "2026-10-29T11:05:00.000Z",
  },
  {
    id: "ORD-1039",
    customerName: "Linda Oppong",
    phone: "0273344556",
    deliveryDate: "2026-10-30",
    payment: "Mobile Money",
    items: [
      { serviceId: "svc-005", name: "Duvet", quantity: 1, unitPrice: 60 },
      { serviceId: "svc-009", name: "Blanket", quantity: 1, unitPrice: 35 },
    ],
    total: 95,
    status: "Completed",
    tellerId: "emp-002",
    createdAt: "2026-10-28T09:20:00.000Z",
  },
  {
    id: "ORD-1038",
    customerName: "Isaac Mensah",
    phone: "0247788990",
    deliveryDate: "2026-11-02",
    payment: "Cash",
    items: [
      { serviceId: "svc-007", name: "Curtains", quantity: 2, unitPrice: 40 },
    ],
    total: 80,
    status: "Received",
    tellerId: "emp-004",
    createdAt: "2026-10-31T10:05:00.000Z",
  },
  {
    id: "ORD-1037",
    customerName: "Patience Amponsah",
    phone: "0261122334",
    deliveryDate: "2026-10-29",
    payment: "Mobile Money",
    items: [
      { serviceId: "svc-008", name: "Kaftan", quantity: 3, unitPrice: 22 },
    ],
    total: 66,
    status: "Completed",
    tellerId: "emp-003",
    createdAt: "2026-10-27T16:10:00.000Z",
  },
  {
    id: "ORD-1036",
    customerName: "Daniel Quaye",
    phone: "0556677889",
    deliveryDate: "2026-10-28",
    payment: "Cash",
    items: [
      { serviceId: "svc-002", name: "Trousers", quantity: 5, unitPrice: 12 },
      { serviceId: "svc-001", name: "Shirt", quantity: 5, unitPrice: 8 },
    ],
    total: 100,
    status: "Cancelled",
    tellerId: "emp-004",
    createdAt: "2026-10-26T13:00:00.000Z",
    notes: "Customer cancelled pickup",
  },
  {
    id: "ORD-1035",
    customerName: "Grace Owusu",
    phone: "0203344556",
    deliveryDate: "2026-11-01",
    payment: "Mobile Money",
    items: [
      { serviceId: "svc-003", name: "Dress", quantity: 1, unitPrice: 18 },
      { serviceId: "svc-001", name: "Shirt", quantity: 2, unitPrice: 8 },
    ],
    total: 34,
    status: "Washing",
    tellerId: "emp-002",
    createdAt: "2026-10-30T08:45:00.000Z",
  },
  {
    id: "ORD-1034",
    customerName: "Samuel Tetteh",
    phone: "0245566778",
    deliveryDate: "2026-10-31",
    payment: "Cash",
    items: [
      { serviceId: "svc-004", name: "Suit", quantity: 2, unitPrice: 45 },
    ],
    total: 90,
    status: "Ready",
    tellerId: "emp-003",
    createdAt: "2026-10-29T15:30:00.000Z",
  },
  {
    id: "ORD-1033",
    customerName: "Mavis Adjei",
    phone: "0278899001",
    deliveryDate: "2026-10-27",
    payment: "Mobile Money",
    items: [
      { serviceId: "svc-006", name: "Bedsheet set", quantity: 2, unitPrice: 25 },
      { serviceId: "svc-009", name: "Blanket", quantity: 1, unitPrice: 35 },
    ],
    total: 85,
    status: "Completed",
    tellerId: "emp-004",
    createdAt: "2026-10-25T12:15:00.000Z",
  },
];

export function getOrderById(id: string) {
  return orders.find((order) => order.id === id);
}

export function formatCurrency(amount: number, symbol = "GH₵") {
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}
