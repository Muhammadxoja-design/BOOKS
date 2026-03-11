import { LibraryPage } from "@/components/books/library-page";

export default function AudioBooksPage() {
  return (
    <LibraryPage
      format="AUDIO"
      eyebrow="Audio library"
      title="Listen deeply, learn faster"
      description="Premium audiobook catalog with speed control, chapter-aware progress, reward points, and discussion threads."
    />
  );
}
