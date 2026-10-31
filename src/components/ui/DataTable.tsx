"use client";

import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Select } from "./Select";
import { Tbody, Td, Th, Thead, Tr } from "./Table";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Hide this column below the `md` breakpoint */
  hideOnMobile?: boolean;
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
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
}

function getPageNumbers(current: number, total: number) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) return [1, 2, 3, 4, total];
  if (current >= total - 2) return [1, total - 3, total - 2, total - 1, total];
  return [1, current - 1, current, current + 1, total];
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
  pageSize: initialPageSize = 8,
  pageSizeOptions = [5, 8, 10, 25],
  showPagination = true,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [data, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const pageNumbers = getPageNumbers(page, totalPages);
  const from = data.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, data.length);

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
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-white", className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.id}
                  className={cn(
                    column.headerClassName,
                    column.hideOnMobile && "hidden md:table-cell",
                  )}
                >
                  {column.header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {pageItems.map((row) => {
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
                    <Td
                      key={column.id}
                      className={cn(
                        column.className,
                        column.hideOnMobile && "hidden md:table-cell",
                      )}
                    >
                      {column.cell(row)}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="flex flex-col gap-3 border-t border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>
              Showing <span className="font-semibold text-ink">{from}</span>–
              <span className="font-semibold text-ink">{to}</span> of{" "}
              <span className="font-semibold text-ink">{data.length}</span>
            </span>
            <label className="inline-flex items-center gap-2">
              <span className="whitespace-nowrap">Rows</span>
              <Select
                className="w-[96px]"
                value={String(pageSize)}
                onChange={(value) => setPageSize(Number(value))}
                options={pageSizeOptions.map((option) => ({
                  value: String(option),
                  label: String(option),
                }))}
                aria-label="Rows per page"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Previous page"
            >
              <span className="hidden sm:inline">Prev</span>
            </Button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((number, index) => {
                const previous = pageNumbers[index - 1];
                const showEllipsis = previous != null && number - previous > 1;

                return (
                  <div key={`${number}-${index}`} className="flex items-center gap-1">
                    {showEllipsis ? (
                      <span className="px-1 text-slate-400">...</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setPage(number)}
                      className={cn(
                        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition",
                        page === number
                          ? "border-teal bg-teal text-white"
                          : "border-line bg-white text-ink hover:border-teal/40",
                      )}
                      aria-current={page === number ? "page" : undefined}
                    >
                      {number}
                    </button>
                  </div>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              aria-label="Next page"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
