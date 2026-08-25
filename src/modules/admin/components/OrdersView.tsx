"use client";

import { useState } from "react";
import { Select } from "@/shared/components/atoms/Select";
import { CONTENT } from "@/modules/admin/content";
import { useAdminOrders } from "@/modules/admin/hooks/useAdminOrders";
import type { OrderStatus } from "@/modules/orders/types";
import { OrdersTable } from "./OrdersTable";

const ADMIN_PAGE_SIZE = 50;
const STATUS_OPTIONS: OrderStatus[] = ["Pending", "Paid", "Processing", "Delivered", "Cancelled", "Failed"];

export function OrdersView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const { data, isLoading, isError, refetch } = useAdminOrders({
    status: status === "" ? undefined : status,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  function handleStatusChange(value: string) {
    setStatus(value as OrderStatus | "");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div>
          <h1 className="mb-1 text-2xl">{CONTENT.ordersView.heading}</h1>
          <span className="text-base text-foreground/70">
            {isLoading ? CONTENT.ordersView.loading : CONTENT.ordersView.ordersCount(data?.totalCount ?? 0)}
          </span>
        </div>
        <Select
          options={STATUS_OPTIONS}
          placeholder={CONTENT.ordersView.statusFilterPlaceholder}
          value={status}
          className="w-auto"
          onChange={(event) => handleStatusChange(event.target.value)}
        />
      </div>
      <OrdersTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        onPageChange={setPage}
        hasActiveFilter={status !== ""}
      />
    </div>
  );
}
