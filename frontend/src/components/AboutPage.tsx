import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>Оазис — платформа арабского языка, диалектов и культуры</h1>
        <p className="hero-subtitle">
          Мы объединяем литературный арабский (фусха), живые диалекты,
          культурный контент и технологии — создавая пространство, где язык
          становится частью реального мира, а не только учебника.
        </p>
      </div>

      <section className="about-section">
        <h2>Наша миссия</h2>
        <p className="section-text">
          Сделать арабский язык доступным, современным и живым для русскоязычной
          аудитории. Мы создаём экосистему, в которой можно не только изучать
          язык, но и понимать экономику, историю, новости, культуру и людей
          арабского мира.
        </p>
      </section>

      <section className="about-section grid-3">
        <div className="about-card">
          <h3>Живая база знаний</h3>
          <p>
            Личности, книги, статьи, диалоги, словарь, медиа — всё связано и
            доступно в одном месте. Не просто контент, а культурная среда,
            которую можно изучать, слушать, разбирать и применять.
          </p>
        </div>

        <div className="about-card">
          <h3>Диалекты без барьеров</h3>
          <p>
            Египетский, левантийский, марокканский, саудовский и другие.
            Сравнение с фусхой, расшифровки, медиа, упражнения — первые
            структурированные материалы по диалектам на русском языке.
          </p>
        </div>

        <div className="about-card">
          <h3>Люди, сообщество, практика</h3>
          <p>
            Репетиторы-носители, чат, совместные проекты, партнёрства с вузами,
            культурные программы и поездки в арабские страны. Учёба — это путь,
            и мы создаём пространство, где его можно пройти не в одиночку.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2>Дорожная карта</h2>
        <div className="roadmap-container">
          <div className="roadmap-item completed">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Контентная платформа</h4>
              <p>Медиа, личности, книги, диалекты, статьи</p>
            </div>
          </div>

          <div className="roadmap-item completed">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Сравнение диалектов и упражнения</h4>
              <p>
                Первая интерактивная база по разговорным вариантам арабского
              </p>
            </div>
          </div>

          <div className="roadmap-item in-progress">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Личный кабинет + трекер прогресса</h4>
              <p>Профиль, уровни, статистика, достижения</p>
            </div>
          </div>

          <div className="roadmap-item planned">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Платформа репетиторов и онлайн-уроков</h4>
              <p>Носители языка, видеосвязь, домашние задания, чат</p>
            </div>
          </div>

          <div className="roadmap-item planned">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Курсы фусха и диалектов</h4>
              <p>Структурированные программы с сертификацией</p>
            </div>
          </div>

          <div className="roadmap-item planned">
            <div className="roadmap-status"></div>
            <div className="roadmap-content">
              <h4>Культурные поездки</h4>
              <p>Образовательные туры в Египет, Ливан, Марокко, ОАЭ</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <p>Оазис — там, где язык становится культурой</p>
      </footer>
    </div>
  );
}
