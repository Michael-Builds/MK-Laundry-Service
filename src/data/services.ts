import type { Service } from "./types";

export const services: Service[] = [
  {
    id: "svc-001",
    name: "Shirt",
    unitPrice: 8,
    category: "Garment",
    active: true,
    description: "Wash, press, and fold",
  },
  {
    id: "svc-002",
    name: "Trousers",
    unitPrice: 12,
    category: "Garment",
    active: true,
    description: "Wash and press",
  },
  {
    id: "svc-003",
    name: "Dress",
    unitPrice: 18,
    category: "Garment",
    active: true,
  },
  {
    id: "svc-004",
    name: "Suit",
    unitPrice: 45,
    category: "Specialty",
    active: true,
    description: "Dry clean and press",
  },
  {
    id: "svc-005",
    name: "Duvet",
    unitPrice: 60,
    category: "Home",
    active: true,
  },
  {
    id: "svc-006",
    name: "Bedsheet set",
    unitPrice: 25,
    category: "Home",
    active: true,
  },
  {
    id: "svc-007",
    name: "Curtains",
    unitPrice: 40,
    category: "Home",
    active: true,
  },
  {
    id: "svc-008",
    name: "Kaftan",
    unitPrice: 22,
    category: "Garment",
    active: true,
  },
  {
    id: "svc-009",
    name: "Blanket",
    unitPrice: 35,
    category: "Home",
    active: true,
  },
  {
    id: "svc-010",
    name: "Tie",
    unitPrice: 6,
    category: "Specialty",
    active: false,
  },
];

export function getActiveServices() {
  return services.filter((service) => service.active);
}
