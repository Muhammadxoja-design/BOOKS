import { Request, Response } from 'express';
import { BookType } from '@prisma/client';
import prisma from '../lib/prisma';

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;

    const query: any = {};
    if (type) {
        query.type = (type as string).toUpperCase() as BookType;
    }
    if (search) {
        query.title = { contains: search, mode: 'insensitive' };
    }

    const books = await prisma.book.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });

    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, description, coverImage, type, price, pdfUrl, audioUrl } = req.body;

    const book = await prisma.book.create({
      data: { title, author, description, coverImage, type, price, pdfUrl, audioUrl },
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book' });
  }
};
