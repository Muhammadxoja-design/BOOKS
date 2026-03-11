"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/features/auth-guard";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { Cart } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("0");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      const response = await apiFetch<Cart>("/store/cart", { token });
      setCart(response);
    };

    if (token) {
      void loadCart();
    }
  }, [token]);

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await apiFetch<{ order: { paymentReference: string; total: number }; rewardPoints: number }>(
      "/store/checkout",
      {
        method: "POST",
        token,
        body: {
          pointsToRedeem: Number(pointsToRedeem),
        },
      },
    );
    setMessage(
      `Payment complete: ${result.order.paymentReference}. Total ${formatCurrency(
        result.order.total,
      )}. Reward +${result.rewardPoints} pts.`,
    );
  };

  return (
    <AuthGuard>
      {!cart ? (
        <Surface className="p-10 text-center">Loading checkout...</Surface>
      ) : (
        <div className="page-grid">
          <Surface className="p-8 md:p-10">
            <h1 className="section-title text-[color:var(--foreground)]">Checkout</h1>
            <p className="mt-5 text-lg text-[color:var(--muted-foreground)]">
              Redeem reward points, place order, and sync purchase analytics into admin reporting.
            </p>
          </Surface>

          {message ? <Surface className="p-4 text-sm">{message}</Surface> : null}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Surface className="space-y-4 p-6">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[20px] bg-[color:var(--bg)] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">{item.book.title}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      x{item.quantity} • {item.book.author}
                    </p>
                  </div>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </Surface>

            <Surface className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Payment</h2>
              <form className="grid gap-4" onSubmit={handleCheckout}>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[color:var(--foreground)]">
                    Points to redeem
                  </span>
                  <input
                    value={pointsToRedeem}
                    onChange={(event) => setPointsToRedeem(event.target.value)}
                    type="number"
                    min="0"
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                  />
                </label>
                <div className="flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.summary.subtotal)}</span>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)]"
                >
                  Complete checkout
                </button>
              </form>
            </Surface>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
