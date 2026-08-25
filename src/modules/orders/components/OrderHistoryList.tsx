"use client";

import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Tag } from "@/shared/components/atoms/Tag";
import { ErrorState } from "@/shared/components/molecules/ErrorState";
import { LoadingState } from "@/shared/components/molecules/LoadingState";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { CONTENT } from "@/modules/orders/content";
import { useOrders } from "@/modules/orders/hooks/useOrders";
import { orderStatusTagVariant } from "@/modules/orders/lib/orderStatusTagVariant";

const PAGE_SIZE = 10;

export function OrderHistoryList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOrders({ page, pageSize: PAGE_SIZE });

  if (isLoading) {
    return <LoadingState message={CONTENT.orderHistoryView.loading} />;
  }
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-lg py-lg">
        <ErrorState message={CONTENT.orderHistoryView.loadError} onRetry={() => refetch()} />
      </div>
    );
  }
  if (!data || data.orders.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <p className="text-lg text-foreground/70">{CONTENT.orderHistoryView.emptyState}</p>
        <Button href={ROUTES.products.list}>{CONTENT.orderHistoryView.emptyStateCta}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-lg py-lg">
      <h1 className="mb-lg text-2xl">{CONTENT.orderHistoryView.heading}</h1>
      <ul className="flex flex-col gap-sm">
        {data.orders.map((order) => (
          <li
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-divider p-md"
          >
            <div className="flex flex-col gap-1">
              <span className="text-base">{new Date(order.createdAt).toLocaleDateString("en-AU")}</span>
              <span className="text-sm text-foreground/70">
                {CONTENT.orderHistoryView.itemsSummary(order.items.length)}
              </span>
            </div>
            <Tag variant={orderStatusTagVariant(order.status)}>{order.status}</Tag>
            <span className="font-heading text-lg text-accent-700">{formatPrice(order.total)}</span>
            <Button variant="ghost" href={`${ROUTES.orders}/${order.id}`}>
              {CONTENT.orderHistoryView.viewOrder}
            </Button>
          </li>
        ))}
      </ul>
      <Pagination pageCount={data.totalPages} page={page} onPageChange={setPage} />
    </div>
  );
}
