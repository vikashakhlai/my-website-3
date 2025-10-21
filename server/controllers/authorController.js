const pool = require("../config/db");

const getAuthorById = async (req, res) => {
  const { id } = req.params;
  const authorId = parseInt(id, 10);

  if (isNaN(authorId) || authorId <= 0) {
    return res.status(400).json({ error: "Некорректный ID автора" });
  }

  try {
    // Получаем автора
    const authorQuery = `
      SELECT id, full_name, bio, photo_url
      FROM authors
      WHERE id = $1
    `;
    const authorResult = await pool.query(authorQuery, [authorId]);
    if (authorResult.rows.length === 0) {
      return res.status(404).json({ error: "Автор не найден" });
    }
    const author = authorResult.rows[0];

    // Получаем книги автора
    const booksQuery = `
      SELECT b.id, b.title, b.cover_url, b.publication_year
      FROM books b
      JOIN book_authors ba ON b.id = ba.book_id
      WHERE ba.author_id = $1
      ORDER BY b.publication_year DESC NULLS LAST
    `;
    const booksResult = await pool.query(booksQuery, [authorId]);
    const books = booksResult.rows;

    res.json({
      ...author,
      books,
    });
  } catch (err) {
    console.error("❌ Ошибка при получении автора:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

module.exports = {
  getAuthorById,
};