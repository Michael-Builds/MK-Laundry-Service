import type { Employee } from "./types";

export const employees: Employee[] = [
  {
    id: "emp-001",
    username: "admin",
    password: "admin",
    fullName: "Ama Mensah",
    role: "Administrator",
    phone: "0244123456",
    email: "ama@mklaundry.gh",
    active: true,
  },
  {
    id: "emp-002",
    username: "kwame",
    password: "manager",
    fullName: "Kwame Boateng",
    role: "Manager",
    phone: "0209876543",
    email: "kwame@mklaundry.gh",
    active: true,
  },
  {
    id: "emp-003",
    username: "efua",
    password: "staff",
    fullName: "Efua Owusu",
    role: "Employee",
    phone: "0551234567",
    email: "efua@mklaundry.gh",
    active: true,
  },
  {
    id: "emp-004",
    username: "yaw",
    password: "staff",
    fullName: "Yaw Asante",
    role: "Employee",
    phone: "0277654321",
    email: "yaw@mklaundry.gh",
    active: true,
  },
  {
    id: "emp-005",
    username: "akosua",
    password: "staff",
    fullName: "Akosua Darko",
    role: "Employee",
    phone: "0261112233",
    email: "akosua@mklaundry.gh",
    active: false,
  },
];

export function findEmployeeByUsername(username: string) {
  return employees.find(
    (employee) => employee.username.toLowerCase() === username.toLowerCase(),
  );
}
