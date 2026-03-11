export type UserRole = "USER" | "ADMIN";
export type BookFormat = "AUDIO" | "PDF" | "STORE";
export type AnnotationType = "HIGHLIGHT" | "UNDERLINE" | "NOTE";

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  accentColor: string;
  bookCount?: number;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  author: string;
  description?: string;
  shortDescription: string;
  coverImage: string;
  backdropImage?: string | null;
  format: BookFormat;
  language?: string;
  level?: string;
  price: number;
  salePrice?: number | null;
  currentPrice?: number;
  rating: number;
  reviewCount: number;
  pagesCount?: number | null;
  audioDuration?: number | null;
  stock?: number | null;
  sampleAudioUrl?: string | null;
  audioUrl?: string | null;
  pdfUrl?: string | null;
  quote?: string | null;
  pointsReward: number;
  isFeatured?: boolean;
  category?: Category | null;
  progress?: ProgressRecord | null;
}

export interface ProgressRecord {
  id?: string;
  percentage: number;
  currentPage?: number | null;
  currentTime?: number | null;
  isCompleted?: boolean;
  updatedAt?: string;
  book?: Book;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  quote?: string | null;
  content?: string | null;
  color?: string | null;
  page?: number | null;
  timestamp?: number | null;
  createdAt: string;
}

export interface Discussion {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    headline?: string | null;
  };
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  bookTitle: string;
  createdAt: string;
}

export interface RewardEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  pointsChange: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  explanation?: string | null;
  points: number;
}

export interface WeeklyQuiz {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  alreadySubmitted: boolean;
  questions: QuizQuestion[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  headline?: string | null;
  points: number;
  streakDays: number;
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string | null;
    headline?: string | null;
    points: number;
    streakDays: number;
    longestStreak: number;
    lastActiveAt?: string | null;
  };
  stats: {
    activeProgressCount: number;
    completedTitles: number;
    readingHours: number;
  };
  continueReading: ProgressRecord[];
  continueListening: ProgressRecord[];
  rewards: RewardEvent[];
  leaderboard: LeaderboardUser[];
  weeklyQuiz: {
    id: string;
    title: string;
    description: string;
    startsAt: string;
    endsAt: string;
    submission?: {
      score: number;
      createdAt: string;
    } | null;
  } | null;
  quotes: Quote[];
  orders: Order[];
  recommendations: Array<Book & { reason: string }>;
}

export interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  book: Pick<
    Book,
    "id" | "slug" | "title" | "subtitle" | "author" | "coverImage" | "price" | "salePrice" | "format"
  > & {
    stock?: number | null;
  };
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotal: number;
  };
}

export interface Order {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  pointsUsed: number;
  paymentReference?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    titleSnapshot: string;
    authorSnapshot: string;
    coverSnapshot: string;
    price: number;
    quantity: number;
  }>;
}

export interface HomeFeed {
  hero: {
    title: string;
    subtitle: string;
    metrics: {
      readers: number;
      titles: number;
      revenue: number;
    };
  };
  featured: Book[];
  sections: {
    audioBooks: Book[];
    pdfBooks: Book[];
    storeBooks: Book[];
  };
  quotes: Quote[];
  categories: Category[];
}

export interface AdminOverview {
  stats: {
    userCount: number;
    bookCount: number;
    orderCount: number;
    revenue: number;
  };
  recentOrders: Order[];
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    points: number;
    streakDays: number;
    createdAt: string;
  }>;
  topBooks: Array<{
    id: string;
    slug: string;
    title: string;
    format: BookFormat;
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
  }>;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  points: number;
  streakDays: number;
}
