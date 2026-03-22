"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/features/auth-guard";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { Cart } from "@/lib/types";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

export default function CartPage() {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [cart, setCart] = useState<Cart | null>(null);

  const loadCart = async () => {
    if (!token) {
      return;
    }

    const response = await apiFetch<Cart>("/store/cart", { token });
    setCart(response);
  };

  useEffect(() => {
    void loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateItem = async (itemId: string, quantity: number) => {
    await apiFetch(`/store/cart/items/${itemId}`, {
      method: "PATCH",
      token,
      body: {
        quantity,
      },
    });
    void loadCart();
  };

  const removeItem = async (itemId: string) => {
    await apiFetch(`/store/cart/items/${itemId}`, {
      method: "DELETE",
      token,
    });
    void loadCart();
  };

  return (
    <AuthGuard>
      {!cart ? (
        <Surface className="p-10 text-center">Loading cart...</Surface>
      ) : (
        <div className="page-grid">
          <Surface className="p-8 md:p-10">
            <h1 className="section-title text-[color:var(--foreground)]">Cart</h1>
            <p className="mt-5 text-lg text-[color:var(--muted-foreground)]">
              {cart.summary.itemCount} item(s) selected for checkout.
            </p>
          </Surface>

          {cart.items.length === 0 ? (
            <Surface className="p-10 text-center">
              Your cart is empty. <Link href="/store">Go to store.</Link>
            </Surface>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <Surface key={item.id} className="flex flex-wrap items-center gap-4 p-5">
                    <div className="relative h-28 w-20 overflow-hidden rounded-[18px]">
                      <Image
                        src={resolveAssetUrl(item.book.coverImage)}
                        alt={item.book.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold text-[color:var(--foreground)]">
                        {item.book.title}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                        {item.book.author}
                      </p>
                      <p className="mt-3 font-semibold text-[color:var(--foreground)]">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, Math.max(1, item.quantity - 1))}
                        className="h-10 w-10 rounded-full bg-[color:var(--muted)]"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, item.quantity + 1)}
                        className="h-10 w-10 rounded-full bg-[color:var(--muted)]"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.id)}
                      className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                    >
                      Remove
                    </button>
                  </Surface>
                ))}
              </div>

              <Surface className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Summary</h2>
                <div className="flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.summary.subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="inline-flex w-full justify-center rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)]"
                >
                  Continue to checkout
                </Link>
              </Surface>
            </div>
          )}
        </div>
      )}
    </AuthGuard>
  );
}
