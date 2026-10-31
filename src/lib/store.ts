"use client";

import { orders as seedOrders } from "@/data/orders";
import { services as seedServices } from "@/data/services";
import { employees as seedEmployees } from "@/data/employees";
import { defaultSettings } from "@/data/settings";
import type { AppSettings, Employee, Order, OrderStatus, Service } from "@/data/types";

const ORDERS_KEY = "mk-laundry-orders";
const SERVICES_KEY = "mk-laundry-services";
const EMPLOYEES_KEY = "mk-laundry-employees";
const SETTINGS_KEY = "mk-laundry-settings";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function getOrders(): Order[] {
  return read(ORDERS_KEY, seedOrders);
}

export function saveOrders(next: Order[]) {
  write(ORDERS_KEY, next);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const next = getOrders().map((order) =>
    order.id === id ? { ...order, status } : order,
  );
  saveOrders(next);
  return next.find((order) => order.id === id) ?? null;
}

export function addOrder(order: Order) {
  const next = [order, ...getOrders()];
  saveOrders(next);
  return order;
}

export function getServices(): Service[] {
  return read(SERVICES_KEY, seedServices);
}

export function saveServices(next: Service[]) {
  write(SERVICES_KEY, next);
}

export function getEmployees(): Employee[] {
  return read(EMPLOYEES_KEY, seedEmployees);
}

export function saveEmployees(next: Employee[]) {
  write(EMPLOYEES_KEY, next);
}

export function updateEmployeeProfile(
  id: string,
  patch: Partial<Pick<Employee, "fullName" | "phone" | "email">>,
) {
  const next = getEmployees().map((employee) =>
    employee.id === id ? { ...employee, ...patch } : employee,
  );
  saveEmployees(next);
  return next.find((employee) => employee.id === id) ?? null;
}

export function updateEmployeePassword(
  id: string,
  currentPassword: string,
  nextPassword: string,
) {
  const employees = getEmployees();
  const employee = employees.find((item) => item.id === id);
  if (!employee) return "Account not found.";
  if (employee.password !== currentPassword) {
    return "Current password is incorrect.";
  }
  if (nextPassword.length < 4) {
    return "New password must be at least 4 characters.";
  }

  saveEmployees(
    employees.map((item) =>
      item.id === id ? { ...item, password: nextPassword } : item,
    ),
  );
  return null;
}

export function resetEmployeePassword(username: string, nextPassword: string) {
  const employees = getEmployees();
  const employee = employees.find(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );
  if (!employee || !employee.active) return "Account not found.";
  if (nextPassword.length < 4) {
    return "New password must be at least 4 characters.";
  }

  saveEmployees(
    employees.map((item) =>
      item.id === employee.id ? { ...item, password: nextPassword } : item,
    ),
  );
  return null;
}

export function requestPasswordReset(username: string) {
  const employees = getEmployees();
  const employee = employees.find(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );
  if (!employee || !employee.active) return null;

  const token = `reset-${employee.username}-${Date.now()}`;
  write("mk-laundry-reset-token", {
    token,
    username: employee.username,
    expiresAt: Date.now() + 1000 * 60 * 30,
  });
  return { token, username: employee.username };
}

export function getResetToken() {
  return read<{ token: string; username: string; expiresAt: number } | null>(
    "mk-laundry-reset-token",
    null,
  );
}

export function clearResetToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("mk-laundry-reset-token");
  }
}

export function getSettings(): AppSettings {
  return read(SETTINGS_KEY, defaultSettings);
}

export function saveSettings(next: AppSettings) {
  write(SETTINGS_KEY, next);
}
