import type { Role } from "./types";

export type { SessionUser } from "./types";

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
  ];

  return all.filter((item) => item.roles.includes(role));
}
