import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./CenteredBlock.css";
import CenteredBlockImg from "../assets/Hero.png";
import Hero2Img from "../assets/Hero2.png";

// Slide data type definition
interface SlideData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonRoute: string;
  alt: string;
}

const CenteredBlock = () => {
  // Intersection Observer state for initial animation
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Slide configuration
  const slides: SlideData[] = [
    {
      id: 0,
      image: CenteredBlockImg,
      title: "Открой язык, на котором говорит история",
      subtitle:
        "Фусха — ключ к Корану, классике, науке и арабскому миру без границ. Научись читать, понимать и мыслить на языке, который связывает 22 страны.",
      buttonText: "Начнём!",
      buttonRoute: "/CoursesPage",
      alt: "Арабский литературный язык — фусха",
    },
    {
      id: 1,
      image: Hero2Img,
      title: "Услышь, как звучит настоящий арабский",
      subtitle:
        "Кино, песни, речь улиц и кофеен.Египетский, левантийский, марокканский — диалекты, которыми живут миллионы. Переходи от учебника к живому языку.",
      buttonText: "Перейти к диалектам",
      buttonRoute: "/dialects",
      alt: "Арабские диалекты — живая речь",
    },
  ];

  // Intersection Observer for initial fade-in animation
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

  // Auto-rotation logic with pause on hover
  useEffect(() => {
    if (isPaused) return; // Pause when hovered

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Handlers for hover pause/resume
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const currentSlideData = slides[currentSlide];

  return (
    <section
      ref={ref}
      className={`hero-section ${isVisible ? "visible" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Render all slides with fade transition */}
      {slides.map((slide) => (
        <div
          key={slide.id}
          className={`hero-slide ${slide.id === currentSlide ? "active" : ""}`}
        >
          <img src={slide.image} alt={slide.alt} className="hero-image" />
          <div className="hero-overlay" />
        </div>
      ))}

      {/* Content that changes based on current slide */}
      <div className="hero-content">
        <h1>{currentSlideData.title}</h1>
        <p>{currentSlideData.subtitle}</p>
        <Link to={currentSlideData.buttonRoute} className="hero-link">
          <button className="hero-btn">{currentSlideData.buttonText}</button>
        </Link>
      </div>
    </section>
  );
};

export default CenteredBlock;
