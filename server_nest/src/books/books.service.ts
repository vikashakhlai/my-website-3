import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Book } from './book.entity';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookComment } from './book-comment.entity';
import { BookRating } from './book-rating.entity';
import { Favorite } from 'src/favorites/favorite.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,

    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,

    @InjectRepository(BookComment)
    private readonly commentRepo: Repository<BookComment>,

    @InjectRepository(BookRating)
    private readonly ratingRepo: Repository<BookRating>,

    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  // 🕐 Последние добавленные книги
  async findLatest(limit: number) {
    return this.bookRepo.find({
      relations: ['authors', 'tags'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // === 🔍 Поиск книг с фильтрами ===
  async searchBooks({
    page = 1,
    limit = 20,
    tag,
    author,
    title,
  }: {
    page?: number;
    limit?: number;
    tag?: string;
    author?: string;
    title?: string;
  }) {
    const query = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.authors', 'authors')
      .leftJoinAndSelect('book.tags', 'tags')
      .orderBy('book.created_at', 'DESC');

    if (tag) query.andWhere('tags.name ILIKE :tag', { tag: `%${tag}%` });
    if (author)
      query.andWhere('authors.full_name ILIKE :author', {
        author: `%${author}%`,
      });
    if (title)
      query.andWhere('book.title ILIKE :title', { title: `%${title}%` });

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [books, totalCount] = await query.getManyAndCount();

    return {
      books,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepo.find({
      relations: ['authors', 'tags'],
      order: { created_at: 'DESC' },
    });
  }

  // === 📘 Одна книга ===
  async findOne(id: number, user_id?: string): Promise<Book> {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: [
        'authors',
        'tags',
        'comments',
        'comments.user',
        'ratings',
        'publisher',
      ],
    });

    if (!book) throw new NotFoundException(`Книга с ID ${id} не найдена`);

    const ratings = Array.isArray(book.ratings) ? book.ratings : [];
    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0
        ? Number(
            (
              ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingCount
            ).toFixed(2),
          )
        : null;

    let userRating: number | null = null;
    if (user_id && ratings.length > 0) {
      const found = ratings.find((r) => r.user_id === user_id);
      userRating = found ? found.rating : null;
    }

    Object.assign(book, { averageRating, ratingCount, userRating });
    return book;
  }

  // === ➕ Создать ===
  async create(dto: CreateBookDto): Promise<Book> {
    const authors = dto.authorIds?.length
      ? await this.authorRepo.find({ where: { id: In(dto.authorIds) } })
      : [];

    const tags = dto.tagIds?.length
      ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
      : [];

    const book = this.bookRepo.create({ ...dto, authors, tags });
    const saved = await this.bookRepo.save(book);
    return this.findOne(saved.id);
  }

  // === ✏️ Обновить ===
  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (dto.authorIds) {
      book.authors = await this.authorRepo.find({
        where: { id: In(dto.authorIds) },
      });
    }

    if (dto.tagIds) {
      book.tags = await this.tagRepo.find({ where: { id: In(dto.tagIds) } });
    }

    Object.assign(book, dto);
    const updated = await this.bookRepo.save(book);
    return this.findOne(updated.id);
  }

  // === ❌ Удалить ===
  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepo.remove(book);
  }

  // === 📚 Похожие книги по тегам ===
  async getSimilarBooks(book_id: number): Promise<Book[]> {
    const book = await this.bookRepo.findOne({
      where: { id: book_id },
      relations: ['tags'],
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    if (!book.tags?.length) return [];

    const tagIds = book.tags.map((t) => t.id);
    return this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.tags', 'tag')
      .leftJoinAndSelect('b.authors', 'author')
      .where('b.id != :book_id', { book_id })
      .andWhere('tag.id IN (:...tagIds)', { tagIds })
      .orderBy('b.created_at', 'DESC')
      .limit(10)
      .getMany();
  }

  // === 👩‍💻 Другие книги автора ===
  async getOtherBooksByAuthor(book_id: number): Promise<Book[]> {
    const book = await this.bookRepo.findOne({
      where: { id: book_id },
      relations: ['authors'],
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    if (!book.authors?.length) return [];

    const authorIds = book.authors.map((a) => a.id);
    return this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.authors', 'a')
      .leftJoinAndSelect('b.tags', 'tag')
      .where('a.id IN (:...authorIds)', { authorIds })
      .andWhere('b.id != :book_id', { book_id })
      .orderBy('b.created_at', 'DESC')
      .limit(10)
      .getMany();
  }

  // === 📦 Книга + похожие + книги автора ===
  async findOneWithRelated(
    id: number,
    user_id?: string,
  ): Promise<{
    book: Book & { isFavorite?: boolean };
    similarBooks: Book[];
    otherBooksByAuthor: Book[];
  }> {
    const book = await this.findOne(id, user_id);

    let isFavorite = false;
    if (user_id) {
      const fav = await this.favoriteRepo.findOne({
        where: { userId: user_id, itemType: 'book', itemId: id },
      });
      isFavorite = !!fav;
    }

    const [similarBooks, otherBooksByAuthor] = await Promise.all([
      this.getSimilarBooks(id),
      this.getOtherBooksByAuthor(id),
    ]);

    return {
      book: { ...book, isFavorite },
      similarBooks,
      otherBooksByAuthor,
    };
  }

  // === 💬 Комментарии ===
  async getComments(book_id: number) {
    const comments = await this.commentRepo.find({
      where: { book_id },
      order: { created_at: 'ASC' },
    });

    type CommentNode = BookComment & { children: CommentNode[] };
    const map = new Map<number, CommentNode>();
    const roots: CommentNode[] = [];

    for (const comment of comments)
      map.set(comment.id, { ...comment, children: [] });

    for (const comment of comments) {
      const node = map.get(comment.id);
      if (comment.parent_id) {
        const parent = map.get(comment.parent_id);
        if (parent) parent.children.push(node!);
      } else {
        roots.push(node!);
      }
    }

    const sortByDate = (nodes: CommentNode[]) => {
      nodes.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      for (const n of nodes) if (n.children?.length) sortByDate(n.children);
    };

    sortByDate(roots);
    return roots;
  }

  async addComment(
    book_id: number,
    user_id: string,
    content: string,
    parent_id?: number,
  ) {
    const comment = this.commentRepo.create({
      book_id,
      user_id,
      content,
      parent_id,
    });
    return this.commentRepo.save(comment);
  }

  // === ⭐ Рейтинги ===
  async getRatings(book_id: number) {
    const ratings = await this.ratingRepo.find({ where: { book_id } });
    if (!ratings.length) return { average: null, count: 0 };

    const average =
      ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
    return { average: Number(average.toFixed(2)), count: ratings.length };
  }

  async rateBook(book_id: number, user_id: string, rating: number) {
    let userRating = await this.ratingRepo.findOne({
      where: { book_id, user_id },
    });

    if (userRating) {
      userRating.rating = rating;
    } else {
      userRating = this.ratingRepo.create({ book_id, user_id, rating });
    }

    return this.ratingRepo.save(userRating);
  }
}
