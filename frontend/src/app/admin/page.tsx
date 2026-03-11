"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/features/auth-guard";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { AdminOverview, Book, Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface AdminPayload {
  overview: AdminOverview;
  users: AdminOverview["recentUsers"];
  books: Book[];
  orders: Order[];
}

export default function AdminPage() {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [data, setData] = useState<AdminPayload | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadAdmin = async () => {
      const [overview, users, books, orders] = await Promise.all([
        apiFetch<AdminOverview>("/admin/overview", { token }),
        apiFetch<AdminOverview["recentUsers"]>("/admin/users", { token }),
        apiFetch<Book[]>("/admin/books", { token }),
        apiFetch<Order[]>("/admin/orders", { token }),
      ]);

      setData({ overview, users, books, orders });
    };

    void loadAdmin();
  }, [token]);

  return (
    <AuthGuard adminOnly>
      {!data ? (
        <Surface className="p-10 text-center">Loading admin console...</Surface>
      ) : (
        <div className="page-grid">
          <Surface className="p-8 md:p-10">
            <h1 className="section-title text-[color:var(--foreground)]">Admin panel</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              Operations view for revenue, content, user growth, and order monitoring.
            </p>
          </Surface>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Surface className="p-6">
              <p className="text-sm text-[color:var(--muted-foreground)]">Users</p>
              <p className="mt-4 text-4xl font-semibold text-[color:var(--foreground)]">
                {data.overview.stats.userCount}
              </p>
            </Surface>
            <Surface className="p-6">
              <p className="text-sm text-[color:var(--muted-foreground)]">Books</p>
              <p className="mt-4 text-4xl font-semibold text-[color:var(--foreground)]">
                {data.overview.stats.bookCount}
              </p>
            </Surface>
            <Surface className="p-6">
              <p className="text-sm text-[color:var(--muted-foreground)]">Orders</p>
              <p className="mt-4 text-4xl font-semibold text-[color:var(--foreground)]">
                {data.overview.stats.orderCount}
              </p>
            </Surface>
            <Surface className="p-6">
              <p className="text-sm text-[color:var(--muted-foreground)]">Revenue</p>
              <p className="mt-4 text-4xl font-semibold text-[color:var(--foreground)]">
                {formatCurrency(data.overview.stats.revenue)}
              </p>
            </Surface>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Surface className="overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Users</h2>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {data.users.map((user) => (
                  <div key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[color:var(--foreground)]">{user.name}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[color:var(--foreground)]">{user.points} pts</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">{user.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface className="overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Orders</h2>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {data.orders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[color:var(--foreground)]">
                          {order.paymentReference ?? order.id}
                        </p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {order.items.length} item(s)
                        </p>
                      </div>
                      <p className="font-semibold text-[color:var(--foreground)]">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <Surface className="overflow-hidden">
            <div className="border-b border-[color:var(--border)] px-6 py-4">
              <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Catalog</h2>
            </div>
            <div className="divide-y divide-[color:var(--border)]">
              {data.books.map((book) => (
                <div key={book.id} className="grid gap-3 px-6 py-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">{book.title}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{book.author}</p>
                  </div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{book.format}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {book.category?.name ?? "Uncategorized"}
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {book.reviewCount} reviews • {book.rating.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      )}
    </AuthGuard>
  );
}
