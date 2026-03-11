"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { BookCard } from "@/components/books/book-card";
import { Pill } from "@/components/ui/pill";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { Book } from "@/lib/types";

export default function StorePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [books, setBooks] = useState<Book[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadStore = async () => {
      const response = await apiFetch<Book[]>("/books?format=STORE");
      setBooks(response);
    };

    void loadStore();
  }, []);

  const addToCart = async (bookId: string) => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await apiFetch("/store/cart/items", {
        method: "POST",
        token,
        body: {
          bookId,
          quantity: 1,
        },
      });
      setMessage("Item added to cart.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update cart.");
    }
  };

  return (
    <div className="page-grid">
      <Surface className="grid gap-8 overflow-hidden p-8 md:p-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Pill>
            <ShoppingBag className="h-3.5 w-3.5" />
            Book Store
          </Pill>
          <h1 className="mt-5 section-title text-[color:var(--foreground)]">
            Sell premium editions inside the same learning product.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            Physical and collectible books live in the same ecosystem as reading progress and reward
            points. Checkout can redeem points and grants purchase rewards.
          </p>
        </div>

        <Surface className="bg-[linear-gradient(135deg,rgba(225,124,57,0.18),rgba(15,143,166,0.16))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
            Commerce loop
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-semibold text-[color:var(--foreground)]">{books.length}</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Products</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-[color:var(--foreground)]">25%</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Max points redeem</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-[color:var(--foreground)]">1x</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Reward on checkout</p>
            </div>
          </div>
        </Surface>
      </Surface>

      {message ? (
        <Surface className="flex items-center gap-3 p-4 text-sm">
          <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
          {message}
        </Surface>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {books.map((book) => (
          <div key={book.id} className="space-y-4">
            <BookCard book={book} />
            <button
              type="button"
              onClick={() => void addToCart(book.id)}
              className="w-full rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)]"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
