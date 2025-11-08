import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>Оазис — культурно-языковая платформа</h1>
        <p className="hero-subtitle">
          Первое русскоязычное пространство, посвящённое арабскому языку, 
          диалектам и культуре. Обучение, медиа, книги, личности, история — 
          всё в одном месте.
        </p>
      </div>

      <section className="about-section">
        <h2>Наша миссия</h2>
        <p className="section-text">
          Сделать изучение арабского языка и культуры доступным, современным и 
          технологичным. Мы объединяем классический фусха и живые диалекты, 
          создаём уникальную базу знаний и инструменты обучения для всех уровней.
        </p>
      </section>

      <section className="about-section grid-3">
        <div className="about-card">
          <h3>База знаний</h3>
          <p>
            Личности, книги, статьи, цитаты, словарь, хроника. Уникальный 
            каталог с поддержкой арабского письма и интеллектуального поиска.
          </p>
        </div>

        <div className="about-card">
          <h3>Обучение диалектам</h3>
          <p>
            Сравнение египетского, марокканского, саудовского и других диалектов. 
            Медиа-контент, упражнения, разборы, переводы и интерактивные задания.
          </p>
        </div>

        <div className="about-card">
          <h3>Сообщество</h3>
          <p>
            Репетиторы-носители, совместные проекты, коллаборации с медиа и 
            научными центрами, культурные программы и поездки в арабские страны.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2>Дорожная карта</h2>
        <div className="roadmap-container">
          <div className="roadmap-item completed">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>База контента</h4>
              <p>Личности, книги, диалекты, статьи</p>
            </div>
          </div>
          <div className="roadmap-item completed">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Упражнения и сравнение диалектов</h4>
              <p>Интерактивные задания и анализ различий</p>
            </div>
          </div>
          <div className="roadmap-item in-progress">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Личный кабинет и трекер прогресса</h4>
              <p>Отслеживание достижений и статистика обучения</p>
            </div>
          </div>
          <div className="roadmap-item planned">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Платформа репетиторов и онлайн-уроков</h4>
              <p>Интеграция с преподавателями и видеозвонки</p>
            </div>
          </div>
          <div className="roadmap-item planned">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Курсы фусха и диалектов с сертификацией</h4>
              <p>Структурированные программы и официальные сертификаты</p>
            </div>
          </div>
          <div className="roadmap-item planned">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Поездки и культурные программы</h4>
              <p>Организация образовательных туров в арабские страны</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <p>Оазис — сделано с любовью к арабскому миру</p>
      </footer>
    </div>
  );
}
