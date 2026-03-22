"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/features/auth-guard";
import { Surface } from "@/components/ui/surface";
import { apiFetch, apiUpload, getToken } from "@/lib/api";
import { AdminOverview, AdminUser, Book, Category, Order } from "@/lib/types";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

interface AdminPayload {
  overview: AdminOverview;
  users: AdminUser[];
  books: Book[];
  categories: Category[];
  orders: Order[];
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  accentColor: string;
}

interface BookFormState {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  backdropImage: string;
  format: "AUDIO" | "PDF" | "STORE";
  language: string;
  level: string;
  price: string;
  salePrice: string;
  rating: string;
  reviewCount: string;
  pagesCount: string;
  audioDuration: string;
  stock: string;
  sampleAudioUrl: string;
  audioUrl: string;
  pdfUrl: string;
  quote: string;
  pointsReward: string;
  isFeatured: boolean;
  isPublished: boolean;
  categoryId: string;
}

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  description: "",
  accentColor: "#0F766E",
};

const emptyBookForm: BookFormState = {
  slug: "",
  title: "",
  subtitle: "",
  author: "",
  description: "",
  shortDescription: "",
  coverImage: "",
  backdropImage: "",
  format: "PDF",
  language: "Uzbek",
  level: "All Levels",
  price: "0",
  salePrice: "",
  rating: "0",
  reviewCount: "0",
  pagesCount: "",
  audioDuration: "",
  stock: "",
  sampleAudioUrl: "",
  audioUrl: "",
  pdfUrl: "",
  quote: "",
  pointsReward: "20",
  isFeatured: false,
  isPublished: true,
  categoryId: "",
};

const toCategoryForm = (category: Category): CategoryFormState => ({
  name: category.name,
  slug: category.slug,
  description: category.description,
  accentColor: category.accentColor,
});

const toBookForm = (book: Book): BookFormState => ({
  slug: book.slug,
  title: book.title,
  subtitle: book.subtitle ?? "",
  author: book.author,
  description: book.description ?? "",
  shortDescription: book.shortDescription,
  coverImage: book.coverImage,
  backdropImage: book.backdropImage ?? "",
  format: book.format,
  language: book.language ?? "Uzbek",
  level: book.level ?? "All Levels",
  price: String(book.price ?? 0),
  salePrice: book.salePrice === null || book.salePrice === undefined ? "" : String(book.salePrice),
  rating: String(book.rating ?? 0),
  reviewCount: String(book.reviewCount ?? 0),
  pagesCount: book.pagesCount === null || book.pagesCount === undefined ? "" : String(book.pagesCount),
  audioDuration:
    book.audioDuration === null || book.audioDuration === undefined ? "" : String(book.audioDuration),
  stock: book.stock === null || book.stock === undefined ? "" : String(book.stock),
  sampleAudioUrl: book.sampleAudioUrl ?? "",
  audioUrl: book.audioUrl ?? "",
  pdfUrl: book.pdfUrl ?? "",
  quote: book.quote ?? "",
  pointsReward: String(book.pointsReward ?? 20),
  isFeatured: Boolean(book.isFeatured),
  isPublished: book.isPublished ?? true,
  categoryId: book.categoryId ?? "",
});

const appendIfNotEmpty = (formData: FormData, key: string, value: string) => {
  if (value.trim()) {
    formData.append(key, value.trim());
  }
};

export default function AdminPage() {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [bookForm, setBookForm] = useState<BookFormState>(emptyBookForm);

  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const backdropFileRef = useRef<HTMLInputElement | null>(null);
  const pdfFileRef = useRef<HTMLInputElement | null>(null);
  const audioFileRef = useRef<HTMLInputElement | null>(null);
  const sampleAudioFileRef = useRef<HTMLInputElement | null>(null);

  const resetBookFiles = () => {
    [coverFileRef, backdropFileRef, pdfFileRef, audioFileRef, sampleAudioFileRef].forEach((ref) => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  };

  const loadAdmin = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [overview, users, books, categories, orders] = await Promise.all([
        apiFetch<AdminOverview>("/admin/overview", { token }),
        apiFetch<AdminUser[]>("/admin/users", { token }),
        apiFetch<Book[]>("/admin/books", { token }),
        apiFetch<Category[]>("/admin/categories", { token }),
        apiFetch<Order[]>("/admin/orders", { token }),
      ]);

      setData({ overview, users, books, categories, orders });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin ma’lumotlarini yuklab bo‘lmadi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await apiFetch<Category>(editingCategoryId ? `/admin/categories/${editingCategoryId}` : "/admin/categories", {
        method: editingCategoryId ? "PATCH" : "POST",
        token,
        body: categoryForm,
      });

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      setNotice(editingCategoryId ? "Kategoriya yangilandi." : "Kategoriya yaratildi.");
      await loadAdmin();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Kategoriya saqlanmadi.");
    }
  };

  const submitBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setNotice("");

    const formData = new FormData();
    Object.entries(bookForm).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        formData.append(key, String(value));
        return;
      }

      appendIfNotEmpty(formData, key, value);
    });

    const coverFile = coverFileRef.current?.files?.[0];
    const backdropFile = backdropFileRef.current?.files?.[0];
    const pdfFile = pdfFileRef.current?.files?.[0];
    const audioFile = audioFileRef.current?.files?.[0];
    const sampleAudioFile = sampleAudioFileRef.current?.files?.[0];

    if (coverFile) formData.append("coverImageFile", coverFile);
    if (backdropFile) formData.append("backdropImageFile", backdropFile);
    if (pdfFile) formData.append("pdfFile", pdfFile);
    if (audioFile) formData.append("audioFile", audioFile);
    if (sampleAudioFile) formData.append("sampleAudioFile", sampleAudioFile);

    try {
      await apiUpload<Book>(editingBookId ? `/admin/books/${editingBookId}` : "/admin/books", {
        method: editingBookId ? "PATCH" : "POST",
        token,
        body: formData,
      });

      setBookForm(emptyBookForm);
      setEditingBookId(null);
      resetBookFiles();
      setNotice(editingBookId ? "Kitob yangilandi." : "Kitob yaratildi.");
      await loadAdmin();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Kitob saqlanmadi.");
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!token || !window.confirm("Kategoriyani o‘chirishni tasdiqlaysizmi?")) {
      return;
    }

    try {
      await apiFetch<void>(`/admin/categories/${categoryId}`, {
        method: "DELETE",
        token,
      });
      setNotice("Kategoriya o‘chirildi.");
      await loadAdmin();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Kategoriya o‘chirilmadi.");
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!token || !window.confirm("Kitobni o‘chirishni tasdiqlaysizmi?")) {
      return;
    }

    try {
      await apiFetch<void>(`/admin/books/${bookId}`, {
        method: "DELETE",
        token,
      });
      setNotice("Kitob o‘chirildi.");
      await loadAdmin();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Kitob o‘chirilmadi.");
    }
  };

  const updateUser = async (userId: string, payload: Partial<Pick<AdminUser, "role" | "isActive">>) => {
    if (!token) {
      return;
    }

    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        token,
        body: payload,
      });
      setNotice("Foydalanuvchi yangilandi.");
      await loadAdmin();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Foydalanuvchi yangilanmadi.");
    }
  };

  const filteredCategories =
    data?.categories.filter((category) =>
      `${category.name} ${category.slug} ${category.description}`
        .toLowerCase()
        .includes(categorySearch.toLowerCase()),
    ) ?? [];

  const filteredBooks =
    data?.books.filter((book) =>
      `${book.title} ${book.author} ${book.slug} ${book.category?.name ?? ""}`
        .toLowerCase()
        .includes(bookSearch.toLowerCase()),
    ) ?? [];

  const filteredUsers =
    data?.users.filter((user) =>
      `${user.name} ${user.email} ${user.telegramUsername ?? ""} ${user.telegramId ?? ""}`
        .toLowerCase()
        .includes(userSearch.toLowerCase()),
    ) ?? [];

  return (
    <AuthGuard adminOnly>
      {error ? <Surface className="p-5 text-red-300">{error}</Surface> : null}
      {notice ? <Surface className="p-5 text-emerald-300">{notice}</Surface> : null}

      {!data || loading ? (
        <Surface className="p-10 text-center">Admin panel yuklanmoqda...</Surface>
      ) : (
        <div className="page-grid">
          <Surface className="p-8 md:p-10">
            <h1 className="section-title text-[color:var(--foreground)]">Admin Dashboard</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              Kitoblar, kategoriyalar, foydalanuvchilar va buyurtmalarni bitta paneldan boshqaring.
              Upload qilingan PDF, audio va rasmlar shu joydan backend storage’ga yuboriladi.
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
            <Surface className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                    Category CRUD
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                    Kategoriya boshqaruvi
                  </h2>
                </div>
                {editingCategoryId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm(emptyCategoryForm);
                    }}
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                  >
                    Bekor qilish
                  </button>
                ) : null}
              </div>

              <form className="mt-6 grid gap-4" onSubmit={submitCategory}>
                <input
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Nomi"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={categoryForm.slug}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="Slug"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <textarea
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Tavsif"
                  rows={3}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={categoryForm.accentColor}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, accentColor: event.target.value }))
                  }
                  placeholder="#0F766E"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)]"
                >
                  {editingCategoryId ? "Kategoriyani yangilash" : "Kategoriya qo‘shish"}
                </button>
              </form>
            </Surface>

            <Surface className="overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Kategoriyalar</h2>
                  <input
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Kategoriya qidirish"
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div
                          className="mb-2 h-2 w-16 rounded-full"
                          style={{ backgroundColor: category.accentColor }}
                        />
                        <p className="font-semibold text-[color:var(--foreground)]">{category.name}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">{category.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {category.slug} • {category.bookCount ?? 0} books
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setCategoryForm(toCategoryForm(category));
                          }}
                          className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                        >
                          Tahrirlash
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteCategory(category.id)}
                          className="rounded-full border border-red-500/20 px-4 py-2 text-sm text-red-300"
                        >
                          O‘chirish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Surface className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                    Book CRUD
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                    Kitob qo‘shish va tahrirlash
                  </h2>
                </div>
                {editingBookId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBookId(null);
                      setBookForm(emptyBookForm);
                      resetBookFiles();
                    }}
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                  >
                    Bekor qilish
                  </button>
                ) : null}
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submitBook}>
                <input
                  value={bookForm.title}
                  onChange={(event) => setBookForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Sarlavha"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.slug}
                  onChange={(event) => setBookForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="Slug"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.author}
                  onChange={(event) => setBookForm((current) => ({ ...current, author: event.target.value }))}
                  placeholder="Muallif"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.subtitle}
                  onChange={(event) => setBookForm((current) => ({ ...current, subtitle: event.target.value }))}
                  placeholder="Subtitle"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <textarea
                  value={bookForm.shortDescription}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, shortDescription: event.target.value }))
                  }
                  placeholder="Qisqa tavsif"
                  rows={3}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />
                <textarea
                  value={bookForm.description}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="To‘liq tavsif"
                  rows={5}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />
                <select
                  value={bookForm.format}
                  onChange={(event) =>
                    setBookForm((current) => ({
                      ...current,
                      format: event.target.value as BookFormState["format"],
                    }))
                  }
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                >
                  <option value="PDF">PDF</option>
                  <option value="AUDIO">AUDIO</option>
                  <option value="STORE">STORE</option>
                </select>
                <select
                  value={bookForm.categoryId}
                  onChange={(event) => setBookForm((current) => ({ ...current, categoryId: event.target.value }))}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                >
                  <option value="">Kategoriya tanlang</option>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  value={bookForm.language}
                  onChange={(event) => setBookForm((current) => ({ ...current, language: event.target.value }))}
                  placeholder="Til"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.level}
                  onChange={(event) => setBookForm((current) => ({ ...current, level: event.target.value }))}
                  placeholder="Level"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.price}
                  onChange={(event) => setBookForm((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Price"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.salePrice}
                  onChange={(event) => setBookForm((current) => ({ ...current, salePrice: event.target.value }))}
                  placeholder="Sale Price"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.rating}
                  onChange={(event) => setBookForm((current) => ({ ...current, rating: event.target.value }))}
                  placeholder="Rating"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.reviewCount}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, reviewCount: event.target.value }))
                  }
                  placeholder="Review count"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.pagesCount}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, pagesCount: event.target.value }))
                  }
                  placeholder="Pages count"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.audioDuration}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, audioDuration: event.target.value }))
                  }
                  placeholder="Audio duration (sec)"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.stock}
                  onChange={(event) => setBookForm((current) => ({ ...current, stock: event.target.value }))}
                  placeholder="Stock"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.pointsReward}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, pointsReward: event.target.value }))
                  }
                  placeholder="Points reward"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.coverImage}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, coverImage: event.target.value }))
                  }
                  placeholder="Cover image URL"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />
                <input
                  value={bookForm.backdropImage}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, backdropImage: event.target.value }))
                  }
                  placeholder="Backdrop image URL"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />
                <input
                  ref={backdropFileRef}
                  type="file"
                  accept="image/*"
                  className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />
                <input
                  value={bookForm.pdfUrl}
                  onChange={(event) => setBookForm((current) => ({ ...current, pdfUrl: event.target.value }))}
                  placeholder="PDF URL"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  ref={pdfFileRef}
                  type="file"
                  accept=".pdf,.epub,application/pdf,application/epub+zip"
                  className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.audioUrl}
                  onChange={(event) => setBookForm((current) => ({ ...current, audioUrl: event.target.value }))}
                  placeholder="Audio URL"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  ref={audioFileRef}
                  type="file"
                  accept="audio/*"
                  className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  value={bookForm.sampleAudioUrl}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, sampleAudioUrl: event.target.value }))
                  }
                  placeholder="Sample audio URL"
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <input
                  ref={sampleAudioFileRef}
                  type="file"
                  accept="audio/*"
                  className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
                />
                <textarea
                  value={bookForm.quote}
                  onChange={(event) => setBookForm((current) => ({ ...current, quote: event.target.value }))}
                  placeholder="Highlight quote"
                  rows={3}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none md:col-span-2"
                />

                <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 text-sm text-[color:var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={bookForm.isFeatured}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, isFeatured: event.target.checked }))
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 text-sm text-[color:var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={bookForm.isPublished}
                    onChange={(event) =>
                      setBookForm((current) => ({ ...current, isPublished: event.target.checked }))
                    }
                  />
                  Published
                </label>

                <button
                  type="submit"
                  className="rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)] md:col-span-2"
                >
                  {editingBookId ? "Kitobni yangilash" : "Kitob qo‘shish"}
                </button>
              </form>
            </Surface>

            <Surface className="overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Kitoblar</h2>
                  <input
                    value={bookSearch}
                    onChange={(event) => setBookSearch(event.target.value)}
                    placeholder="Kitob qidirish"
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="px-6 py-4">
                    <div className="grid gap-4 md:grid-cols-[84px_1fr_auto]">
                      <div className="relative h-28 w-20 overflow-hidden rounded-[18px]">
                        <Image
                          src={resolveAssetUrl(book.coverImage)}
                          alt={book.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[color:var(--foreground)]">{book.title}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">{book.author}</p>
                        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                          {book.format} • {book.category?.name ?? "Uncategorized"} • {book.isPublished ? "Published" : "Draft"}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                          Rating {book.rating.toFixed(1)} • {book.reviewCount} reviews
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBookId(book.id);
                            setBookForm(toBookForm(book));
                            resetBookFiles();
                          }}
                          className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                        >
                          Tahrirlash
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteBook(book.id)}
                          className="rounded-full border border-red-500/20 px-4 py-2 text-sm text-red-300"
                        >
                          O‘chirish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Surface className="overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Foydalanuvchilar</h2>
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="User qidirish"
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[color:var(--foreground)]">{user.name}</p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {user.email || `Telegram ID: ${user.telegramId ?? "yo‘q"}`}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {user.authProvider} • {user.isActive ? "Active" : "Disabled"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void updateUser(user.id, { role: user.role === "ADMIN" ? "USER" : "ADMIN" })}
                          className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                        >
                          {user.role === "ADMIN" ? "ADMIN -> USER" : "USER -> ADMIN"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void updateUser(user.id, { isActive: !user.isActive })}
                          className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm"
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface className="overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Buyurtmalar</h2>
              </div>
              <div className="divide-y divide-[color:var(--border)]">
                {data.orders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[color:var(--foreground)]">
                          {order.paymentReference ?? order.id}
                        </p>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {order.items.length} ta item • {order.status}
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
        </div>
      )}
    </AuthGuard>
  );
}
