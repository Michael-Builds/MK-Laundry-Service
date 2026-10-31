import { employees as seedEmployees } from "./employees";
import type { Employee, Role } from "./types";

const SESSION_KEY = "mk-laundry-session";
const EMPLOYEES_KEY = "mk-laundry-employees";

export type SessionUser = Omit<Employee, "password">;

export function toSessionUser(employee: Employee): SessionUser {
  const { password: _password, ...user } = employee;
  return user;
}

function readEmployees(): Employee[] {
  if (typeof window === "undefined") return seedEmployees;
  const raw = window.sessionStorage.getItem(EMPLOYEES_KEY);
  if (!raw) return seedEmployees;
  try {
    return JSON.parse(raw) as Employee[];
  } catch {
    return seedEmployees;
  }
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function authenticate(username: string, password: string) {
  const employee = readEmployees().find(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );
  if (!employee || employee.password !== password || !employee.active) {
    return null;
  }
  return toSessionUser(employee);
}

const sharedStaffRoutes = new Set([
  "/dashboard",
  "/orders",
  "/orders/new",
  "/profile",
  "/settings/profile",
]);

const managerRoutes = new Set([
  ...sharedStaffRoutes,
  "/services",
  "/reports",
]);

const employeeRoutes = sharedStaffRoutes;

export function canAccessRoute(role: Role, pathname: string) {
  if (role === "Administrator") return true;
  if (pathname.startsWith("/orders/") && pathname !== "/orders/new") {
    return role === "Manager" || role === "Employee";
  }
  if (role === "Manager") {
    return managerRoutes.has(pathname) || pathname.startsWith("/settings/profile");
  }
  return employeeRoutes.has(pathname) || pathname.startsWith("/settings/profile");
}

export function navItemsForRole(role: Role) {
  const all = [
    {
      href: "/dashboard",
      label: "Dashboard",
      roles: ["Administrator", "Manager", "Employee"] as Role[],
    },
    {
      href: "/orders",
      label: "Orders",
      roles: ["Administrator", "Manager", "Employee"] as Role[],
    },
    {
      href: "/services",
      label: "Services",
      roles: ["Administrator", "Manager"] as Role[],
    },
    {
      href: "/employees",
      label: "Employees",
      roles: ["Administrator"] as Role[],
    },
    {
      href: "/reports",
      label: "Reports",
      roles: ["Administrator", "Manager"] as Role[],
    },
    {
      href: "/settings/profile",
      label: "Profile",
      roles: ["Administrator", "Manager", "Employee"] as Role[],
    },
    {
      href: "/settings",
      label: "Settings",
      roles: ["Administrator"] as Role[],
    },
  ];

  return all.filter((item) => item.roles.includes(role));
}
