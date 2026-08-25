"use client";

import { useState } from "react";
import { Select } from "@/shared/components/atoms/Select";
import { Tag } from "@/shared/components/atoms/Tag";
import { ConfirmDialog } from "@/shared/components/molecules/ConfirmDialog";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { logError } from "@/shared/lib/log-error";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/admin/content";
import { useUpdateOrderStatus } from "@/modules/admin/hooks/useUpdateOrderStatus";
import { orderStatusTagVariant } from "@/modules/orders/lib/orderStatusTagVariant";
import type { AdminOrder, AdminOrdersListResponse, OrderStatus } from "@/modules/orders/types";

interface OrdersTableProps {
  data: AdminOrdersListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
  hasActiveFilter: boolean;
}

// Pending/Failed are webhook-only (settleOrder in orderRepository.ts) —
// never offered here. Cancelled routes through the confirm dialog below
// rather than committing straight from the select, since it's effectively
// destructive; Processing/Delivered commit immediately.
const MANUAL_STATUSES: OrderStatus[] = ["Processing", "Delivered", "Cancelled"];

export function OrdersTable({ data, isLoading, isError, onRetry, onPageChange, hasActiveFilter }: OrdersTableProps) {
  const updateMutation = useUpdateOrderStatus();
  const [orderPendingCancel, setOrderPendingCancel] = useState<AdminOrder | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState message={CONTENT.ordersView.loading} />;
  }
  if (isError) {
    return <ErrorState message={CONTENT.ordersView.loadError} onRetry={onRetry} />;
  }
  if (!data || data.orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-center">
        <p className="text-lg text-foreground/70">
          {hasActiveFilter ? CONTENT.ordersView.emptyStateFiltered : CONTENT.ordersView.emptyState}
        </p>
      </div>
    );
  }

  const columns = CONTENT.ordersTable.columns;

  function commitStatus(order: AdminOrder, status: OrderStatus) {
    setRowError(null);
    updateMutation.mutate(
      { orderId: order.id, status },
      {
        onError: (error) => {
          logError(error, "OrdersTable.commitStatus");
          setRowError(CONTENT.ordersTable.saveError);
        },
      }
    );
  }

  function handleStatusChange(order: AdminOrder, value: string) {
    const status = value as OrderStatus;
    if (status === "Cancelled") {
      setOrderPendingCancel(order);
      return;
    }
    commitStatus(order, status);
  }

  function handleCancelConfirm() {
    if (!orderPendingCancel) return;
    const order = orderPendingCancel;
    setOrderPendingCancel(null);
    commitStatus(order, "Cancelled");
  }

  return (
    <>
      {rowError ? (
        <p className="mb-sm text-base text-accent-700" role="alert">
          {rowError}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-168 border-collapse text-left text-base">
          <thead>
            <tr className="border-b border-foreground/15 text-2xs tracking-wide text-foreground/60 uppercase">
              <th className="py-sm pr-sm font-normal">{columns.date}</th>
              <th className="py-sm pr-sm font-normal">{columns.customer}</th>
              <th className="py-sm pr-sm font-normal">{columns.items}</th>
              <th className="py-sm pr-sm font-normal">{columns.total}</th>
              <th className="py-sm pr-sm font-normal">{columns.status}</th>
              <th className="py-sm pr-sm font-normal">{columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((order) => {
              const isManuallyEditable = order.status !== "Pending" && order.status !== "Failed";
              const isSaving = updateMutation.isPending && updateMutation.variables?.orderId === order.id;
              return (
                <tr key={order.id} className="border-b border-foreground/8">
                  <td className="py-sm pr-sm">{new Date(order.createdAt).toLocaleDateString("en-AU")}</td>
                  <td className="py-sm pr-sm">
                    <div className="flex flex-col">
                      <span>{order.customerName}</span>
                      <span className="text-sm text-foreground/60">{order.customerEmail}</span>
                    </div>
                  </td>
                  <td className="py-sm pr-sm text-foreground/70">
                    {CONTENT.ordersTable.itemsSummary(order.items.length)}
                  </td>
                  <td className="py-sm pr-sm">{formatPrice(order.total)}</td>
                  <td className="py-sm pr-sm">
                    <Tag variant={orderStatusTagVariant(order.status)}>{order.status}</Tag>
                  </td>
                  <td className="py-sm pr-sm">
                    {isManuallyEditable ? (
                      <Select
                        options={MANUAL_STATUSES}
                        placeholder={CONTENT.ordersTable.updateStatusPlaceholder}
                        // Always resets to the placeholder rather than
                        // reflecting order.status — none of MANUAL_STATUSES
                        // covers a "Paid" order, so binding this to the real
                        // status would visually default to whichever option
                        // happens to be first (misleadingly implying
                        // "Processing"). This is purely an action picker,
                        // never a display of current state (the Tag column
                        // already shows that).
                        value=""
                        disabled={isSaving}
                        className="w-auto"
                        onChange={(event) => handleStatusChange(order, event.target.value)}
                      />
                    ) : (
                      <span className="text-foreground/40">{CONTENT.ordersTable.noActions}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination pageCount={data.totalPages} page={data.page} onPageChange={onPageChange} />
      <ConfirmDialog
        open={orderPendingCancel !== null}
        title={CONTENT.ordersTable.cancelConfirmTitle}
        message={orderPendingCancel ? CONTENT.ordersTable.cancelConfirm(orderPendingCancel.id) : ""}
        confirmLabel={CONTENT.ordersTable.cancelOrder}
        cancelLabel={CONTENT.ordersTable.cancel}
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setOrderPendingCancel(null)}
      />
    </>
  );
}
