import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStoreItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.book.findMany({
      where: { type: 'STORE' },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      }
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store items', error });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = (req as any).user?.id;

    // find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, bookId }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, bookId, quantity: quantity || 1 }
      });
    }

    res.status(200).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { book: true }
        }
      }
    });

    res.status(200).json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { usePoints } = req.body; // whether they want to use points as discount

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { book: true } } }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    cart.items.forEach(item => {
      totalAmount += item.book.price * item.quantity;
    });

    // Add transaction logic here, simulating a successful payment
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: totalAmount,
        status: 'COMPLETED',
        items: cart.items.map(i => ({ bookId: i.bookId, quantity: i.quantity }))
      }
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.status(200).json({ message: 'Checkout successful', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout', error });
  }
};
