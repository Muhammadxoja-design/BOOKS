import { LibraryPage } from "@/components/books/library-page";

export default function PdfBooksPage() {
  return (
    <LibraryPage
      format="PDF"
      eyebrow="PDF library"
      title="Read in a deliberate workspace"
      description="Focused PDF reading experience with page tracking, highlights, underlines, notes, quotes, and community context."
    />
  );
}
