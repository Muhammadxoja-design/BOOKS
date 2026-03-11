import bcrypt from "bcryptjs";
import {
  AnnotationType,
  BookFormat,
  OrderStatus,
  RewardType,
  UserRole,
} from "@prisma/client";
import prisma from "../src/lib/prisma";

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.rewardEvent.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.annotation.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [productivity, software, classics, business] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Productivity",
        slug: "productivity",
        description: "Focus, habits, and sustainable high performance.",
        accentColor: "#CA8A04",
      },
    }),
    prisma.category.create({
      data: {
        name: "Software",
        slug: "software",
        description: "Engineering craft, architecture, and clean execution.",
        accentColor: "#0F766E",
      },
    }),
    prisma.category.create({
      data: {
        name: "Classics",
        slug: "classics",
        description: "Foundational ideas from timeless literature.",
        accentColor: "#7C3AED",
      },
    }),
    prisma.category.create({
      data: {
        name: "Business",
        slug: "business",
        description: "Leadership, strategy, and company building.",
        accentColor: "#C2410C",
      },
    }),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: "admin@bookora.app",
      passwordHash,
      name: "Admin Operator",
      role: UserRole.ADMIN,
      headline: "Platform operations lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
      points: 3200,
      streakDays: 24,
      longestStreak: 38,
      lastActiveAt: new Date(),
      cart: { create: {} },
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "reader@bookora.app",
      passwordHash,
      name: "Nodira Karimova",
      role: UserRole.USER,
      headline: "Building a daily learning habit",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80",
      points: 1480,
      streakDays: 11,
      longestStreak: 21,
      lastActiveAt: new Date(),
      preferences: {
        favoriteFormats: ["AUDIO", "PDF"],
        favoriteTopics: ["software", "productivity"],
      },
      cart: { create: {} },
    },
  });

  const peer = await prisma.user.create({
    data: {
      email: "listener@bookora.app",
      passwordHash,
      name: "Jasur Rahimov",
      role: UserRole.USER,
      headline: "Audiobook-first founder",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
      points: 1210,
      streakDays: 7,
      longestStreak: 14,
      lastActiveAt: new Date(),
      cart: { create: {} },
    },
  });

  const books = await Promise.all([
    prisma.book.create({
      data: {
        slug: "deep-work-audio",
        title: "Deep Work",
        subtitle: "A focused life in a noisy world",
        author: "Cal Newport",
        description:
          "A premium audiobook edition with chapter markers, focus checkpoints, and guided summaries.",
        shortDescription: "High-focus audiobook with guided chapter summaries.",
        coverImage:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        backdropImage:
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80",
        format: BookFormat.AUDIO,
        language: "English",
        level: "Intermediate",
        rating: 4.9,
        reviewCount: 428,
        audioDuration: 25140,
        sampleAudioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        quote: "Clarity about what matters provides clarity about what does not.",
        pointsReward: 60,
        isFeatured: true,
        categoryId: productivity.id,
      },
    }),
    prisma.book.create({
      data: {
        slug: "atomic-habits-audio",
        title: "Atomic Habits",
        subtitle: "Small habits, remarkable outcomes",
        author: "James Clear",
        description:
          "Listen with variable speed controls, action checkpoints, and chapter review prompts.",
        shortDescription: "Habit-building audio program with practical action prompts.",
        coverImage:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
        backdropImage:
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
        format: BookFormat.AUDIO,
        language: "English",
        level: "Beginner",
        rating: 4.8,
        reviewCount: 682,
        audioDuration: 21420,
        sampleAudioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
        pointsReward: 55,
        isFeatured: true,
        categoryId: productivity.id,
      },
    }),
    prisma.book.create({
      data: {
        slug: "clean-architecture-pdf",
        title: "Clean Architecture",
        subtitle: "Software structure and design",
        author: "Robert C. Martin",
        description:
          "Browser-native PDF reading experience with annotations, progress sync, and notes.",
        shortDescription: "Architecture classic with note-taking and underline support.",
        coverImage:
          "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
        backdropImage:
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
        format: BookFormat.PDF,
        language: "English",
        level: "Advanced",
        rating: 4.8,
        reviewCount: 531,
        pagesCount: 432,
        pdfUrl:
          "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        quote: "A good architecture allows the system to be easy to understand, develop, maintain, and deploy.",
        pointsReward: 70,
        isFeatured: true,
        categoryId: software.id,
      },
    }),
    prisma.book.create({
      data: {
        slug: "pragmatic-programmer-pdf",
        title: "The Pragmatic Programmer",
        subtitle: "Practical engineering wisdom",
        author: "Andrew Hunt",
        description:
          "A polished PDF edition for deliberate reading, highlights, and weekly team discussion.",
        shortDescription: "Engineering playbook with synced highlights and notes.",
        coverImage:
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
        format: BookFormat.PDF,
        language: "English",
        level: "Intermediate",
        rating: 4.9,
        reviewCount: 610,
        pagesCount: 352,
        pdfUrl:
          "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        quote: "Care about your craft. Think about your work. Know your tools.",
        pointsReward: 65,
        categoryId: software.id,
      },
    }),
    prisma.book.create({
      data: {
        slug: "meditations-pdf",
        title: "Meditations",
        subtitle: "Stoic reflections",
        author: "Marcus Aurelius",
        description:
          "A clean reading edition for reflective note-taking and quote collecting.",
        shortDescription: "Classic stoic reading experience with quote capture.",
        coverImage:
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
        format: BookFormat.PDF,
        language: "English",
        level: "All Levels",
        rating: 4.7,
        reviewCount: 214,
        pagesCount: 288,
        pdfUrl:
          "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        quote: "The happiness of your life depends upon the quality of your thoughts.",
        pointsReward: 45,
        categoryId: classics.id,
      },
    }),
    prisma.book.create({
      data: {
        slug: "zero-to-one-hardcover",
        title: "Zero to One Hardcover",
        subtitle: "Physical collector edition",
        author: "Peter Thiel",
        description:
          "Premium hardcover for founders with protective sleeve and discussion companion pack.",
        shortDescription: "Physical startup classic available with checkout flow.",
        coverImage:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
        format: BookFormat.STORE,
        language: "English",
        level: "Intermediate",
        price: 34,
        salePrice: 28,
        stock: 16,
        rating: 4.6,
        reviewCount: 198,
        quote: "Brilliant thinking is rare, but courage is in even shorter supply than genius.",
        categoryId: business.id,
      },
    }),
    prisma.book.create({
      data: {
        slug: "bookora-premium-annual",
        title: "Bookora Premium Annual",
        subtitle: "Unlimited audio and PDF access",
        author: "Bookora Team",
        description:
          "One-year membership with premium listening, PDF vault access, streak boosters, and bonus quizzes.",
        shortDescription: "Annual plan unlock for the entire learning stack.",
        coverImage:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        format: BookFormat.STORE,
        language: "Global",
        level: "All Levels",
        price: 99,
        salePrice: 79,
        stock: 999,
        rating: 4.9,
        reviewCount: 86,
        categoryId: business.id,
      },
    }),
  ]);

  const bookBySlug = Object.fromEntries(books.map((book) => [book.slug, book]));

  await prisma.quote.createMany({
    data: [
      {
        text: "A reader lives a thousand lives before he dies.",
        author: "George R. R. Martin",
        bookTitle: "A Dance with Dragons",
      },
      {
        text: "There is no friend as loyal as a book.",
        author: "Ernest Hemingway",
        bookTitle: "Selected Sayings",
      },
      {
        text: "No matter how busy you may think you are, you must find time for reading.",
        author: "Confucius",
        bookTitle: "Collected Wisdom",
      },
    ],
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: "Weekly Reading Sprint",
      description:
        "A short quiz on focus, software craftsmanship, and modern reading habits.",
      startsAt: new Date("2026-03-09T00:00:00.000Z"),
      endsAt: new Date("2026-03-15T23:59:59.000Z"),
      isPublished: true,
      questions: {
        create: [
          {
            prompt: "Which book in the library focuses on deliberate focus as a competitive advantage?",
            options: ["Deep Work", "Meditations", "Zero to One", "Bookora Premium Annual"],
            answer: "Deep Work",
            explanation: "Cal Newport's book is centered on distraction-free focus.",
            points: 10,
          },
          {
            prompt: "Which annotation type is best for capturing a personal reflection beyond the selected text?",
            options: ["Highlight", "Underline", "Note", "Bookmark"],
            answer: "Note",
            explanation: "Notes let the reader store their own interpretation or action item.",
            points: 10,
          },
          {
            prompt: "What is the maximum playback speed supported by the Bookora audio player in this project?",
            options: ["1.25x", "1.5x", "2x", "3x"],
            answer: "2x",
            explanation: "The player includes 1x, 1.5x, and 2x speed options.",
            points: 10,
          },
        ],
      },
    },
    include: {
      questions: true,
    },
  });

  await prisma.progress.createMany({
    data: [
      {
        userId: user.id,
        bookId: bookBySlug["clean-architecture-pdf"].id,
        percentage: 62,
        currentPage: 268,
        isCompleted: false,
        lastOpenedAt: new Date(),
      },
      {
        userId: user.id,
        bookId: bookBySlug["deep-work-audio"].id,
        percentage: 74,
        currentTime: 18600,
        isCompleted: false,
        lastOpenedAt: new Date(),
      },
      {
        userId: peer.id,
        bookId: bookBySlug["atomic-habits-audio"].id,
        percentage: 91,
        currentTime: 19500,
        isCompleted: false,
        lastOpenedAt: new Date(),
      },
    ],
  });

  await prisma.annotation.createMany({
    data: [
      {
        userId: user.id,
        bookId: bookBySlug["clean-architecture-pdf"].id,
        type: AnnotationType.HIGHLIGHT,
        quote: "A good architecture makes the system easier to understand and maintain.",
        content: "This is directly relevant to our Next.js monorepo work.",
        color: "#FDE68A",
        page: 121,
      },
      {
        userId: user.id,
        bookId: bookBySlug["clean-architecture-pdf"].id,
        type: AnnotationType.UNDERLINE,
        quote: "Separate the UI from the business rules.",
        color: "#93C5FD",
        page: 203,
      },
      {
        userId: user.id,
        bookId: bookBySlug["deep-work-audio"].id,
        type: AnnotationType.NOTE,
        content: "Re-listen chapter 5 at 1.5x and extract a weekly ritual.",
        timestamp: 1320,
        color: "#FCA5A5",
      },
    ],
  });

  await prisma.discussion.createMany({
    data: [
      {
        userId: user.id,
        bookId: bookBySlug["pragmatic-programmer-pdf"].id,
        content:
          "The advice on tracer bullets fits perfectly with shipping product increments instead of waiting for a perfect architecture.",
        likes: 18,
      },
      {
        userId: peer.id,
        bookId: bookBySlug["deep-work-audio"].id,
        content:
          "Listening at 1.5x during commute still leaves room to capture key notes afterwards.",
        likes: 9,
      },
    ],
  });

  await prisma.rewardEvent.createMany({
    data: [
      {
        userId: user.id,
        type: RewardType.STREAK,
        title: "11-day streak",
        description: "You kept your reading streak active for 11 consecutive days.",
        pointsChange: 110,
      },
      {
        userId: user.id,
        type: RewardType.READING,
        title: "Architecture deep dive",
        description: "Reached 60% progress in Clean Architecture.",
        pointsChange: 24,
      },
      {
        userId: user.id,
        type: RewardType.LISTENING,
        title: "Audio consistency",
        description: "Completed 70% of Deep Work audio sessions.",
        pointsChange: 18,
      },
    ],
  });

  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: peer.id,
      answers: {
        [quiz.questions[0].id]: "Deep Work",
        [quiz.questions[1].id]: "Note",
        [quiz.questions[2].id]: "2x",
      },
      score: 30,
    },
  });

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { userId: user.id },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      bookId: bookBySlug["zero-to-one-hardcover"].id,
      quantity: 1,
      unitPrice: bookBySlug["zero-to-one-hardcover"].salePrice ?? bookBySlug["zero-to-one-hardcover"].price,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: OrderStatus.FULFILLED,
      subtotal: 79,
      discount: 20,
      total: 59,
      pointsUsed: 500,
      paymentReference: "PAY-BOOKORA-1001",
      items: {
        create: [
          {
            bookId: bookBySlug["bookora-premium-annual"].id,
            titleSnapshot: bookBySlug["bookora-premium-annual"].title,
            authorSnapshot: bookBySlug["bookora-premium-annual"].author,
            coverSnapshot: bookBySlug["bookora-premium-annual"].coverImage,
            price: 59,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.rewardEvent.create({
    data: {
      userId: user.id,
      type: RewardType.PURCHASE,
      title: "Premium upgrade",
      description: `Order ${order.paymentReference} completed successfully.`,
      pointsChange: 79,
    },
  });

  console.log("Seeded Bookora platform data.");
  console.log("Admin:", admin.email, "password123");
  console.log("Reader:", user.email, "password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
