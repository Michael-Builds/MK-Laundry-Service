"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import { Table, Tbody, Td, Th, Thead, Tr } from "./Table";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  className?: string;
  rowClassName?: string | ((row: T) => string | undefined);
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  emptyTitle = "No results",
  emptyDescription,
  emptyIcon,
  emptyAction,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("rounded-2xl border border-line bg-white", className)}>
      <Table>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.id} className={column.headerClassName}>
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => {
            const resolvedRowClass =
              typeof rowClassName === "function"
                ? rowClassName(row)
                : rowClassName;

            return (
              <Tr
                key={getRowId(row)}
                className={cn(
                  "hover:bg-mist/60",
                  onRowClick && "cursor-pointer",
                  resolvedRowClass,
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <Td key={column.id} className={column.className}>
                    {column.cell(row)}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}
