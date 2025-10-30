import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./CenteredBlock.css";
import CenteredBlockImg from "../assets/Hero.png";

const CenteredBlock = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 } // 30% блока должно быть видно
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link to="/CoursesPage" className="hero-link">
      <section
        ref={ref}
        className={`hero-section ${isVisible ? "visible" : ""}`}
      >
        <img
          src={CenteredBlockImg}
          alt="Арабский язык — красота письма"
          className="hero-image"
        />

        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>Раскрой всю красоту арабского языка</h1>
          <p>
            Арабский язык — ключ к пониманию богатого культурного наследия
            Востока. Откройте для себя мир изящных букв, мелодичных звуков и
            глубоких смыслов. Путешествуйте по страницам истории, изучайте
            искусство письма и погружайтесь в магию одного из древнейших языков
            мира.
          </p>
          <button className="hero-btn">Начнём!</button>
        </div>
      </section>
    </Link>
  );
};

export default CenteredBlock;
