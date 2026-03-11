import { Response } from "express";
import { OrderStatus, RewardType } from "@prisma/client";
import prisma from "../lib/prisma";
import { getErrorMessage } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";

const cartSelect = {
  id: true,
  items: {
    include: {
      book: {
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          author: true,
          coverImage: true,
          price: true,
          salePrice: true,
          stock: true,
          format: true,
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
};

const formatCart = (
  cart:
    | ({
        items: {
          id: string;
          quantity: number;
          unitPrice: number;
          book: {
            price: number;
            salePrice: number | null;
          };
        }[];
      } & { id: string })
    | null,
) => {
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    id: cart?.id ?? null,
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    },
  };
};

const requireUserId = (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Authentication required." });
    return null;
  }

  return req.user.id;
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    res.status(200).json(formatCart(cart));
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const addCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { bookId, quantity } = req.body as {
      bookId?: string;
      quantity?: number;
    };

    if (!bookId) {
      res.status(400).json({ message: "bookId is required." });
      return;
    }

    const qty = Math.max(1, quantity ?? 1);
    const [cart, book] = await Promise.all([
      prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      }),
      prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          price: true,
          salePrice: true,
          stock: true,
          format: true,
        },
      }),
    ]);

    if (!book || book.format !== "STORE") {
      res.status(404).json({ message: "Store item not found." });
      return;
    }

    if (book.stock !== null && book.stock !== undefined && qty > book.stock) {
      res.status(400).json({ message: "Requested quantity exceeds stock." });
      return;
    }

    const unitPrice = book.salePrice ?? book.price;

    await prisma.cartItem.upsert({
      where: {
        cartId_bookId: {
          cartId: cart.id,
          bookId,
        },
      },
      update: {
        quantity: { increment: qty },
        unitPrice,
      },
      create: {
        cartId: cart.id,
        bookId,
        quantity: qty,
        unitPrice,
      },
    });

    const freshCart = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    res.status(201).json(formatCart(freshCart));
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const itemId = String(req.params.itemId);
    const { quantity } = req.body as { quantity?: number };

    if (typeof quantity !== "number" || quantity < 1) {
      res.status(400).json({ message: "quantity must be at least 1." });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      res.status(404).json({ message: "Cart item not found." });
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const freshCart = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    res.status(200).json(formatCart(freshCart));
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const itemId = String(req.params.itemId);
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      res.status(404).json({ message: "Cart item not found." });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const freshCart = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    res.status(200).json(formatCart(freshCart));
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { pointsToRedeem } = req.body as { pointsToRedeem?: number };
    const [user, cart] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          points: true,
        },
      }),
      prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      }),
    ]);

    if (!user || !cart || cart.items.length === 0) {
      res.status(400).json({ message: "Cart is empty." });
      return;
    }

    const subtotal = cart.items.reduce(
      (sum: number, item: (typeof cart.items)[number]) => sum + item.unitPrice * item.quantity,
      0,
    );
    const requestedPoints = Math.max(0, pointsToRedeem ?? 0);
    const safePoints = Math.min(requestedPoints, user.points);
    const maxDiscount = subtotal * 0.25;
    const discount = Math.min(safePoints / 100, maxDiscount);
    const pointsUsed = Math.floor(discount * 100);
    const total = Number(Math.max(0, subtotal - discount).toFixed(2));
    const rewardPoints = Math.max(10, Math.round(total));

    const order = await prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PAID,
        subtotal,
        discount,
        total,
        pointsUsed,
        paymentReference: `PAY-${Date.now()}`,
        items: {
          create: cart.items.map((item: (typeof cart.items)[number]) => ({
            bookId: item.bookId,
            titleSnapshot: item.book.title,
            authorSnapshot: item.book.author,
            coverSnapshot: item.book.coverImage,
            price: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: Math.max(0, user.points - pointsUsed + rewardPoints),
        },
      }),
      prisma.rewardEvent.create({
        data: {
          userId,
          type: RewardType.PURCHASE,
          title: "Checkout completed",
          description: `Order ${order.paymentReference} has been paid successfully.`,
          pointsChange: rewardPoints,
        },
      }),
    ]);

    res.status(201).json({
      order,
      rewardPoints,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
