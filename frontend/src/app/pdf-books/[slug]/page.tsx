import { BookExperiencePage } from "@/components/books/book-experience-page";

export default async function PdfBookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookExperiencePage slug={slug} format="PDF" />;
}
