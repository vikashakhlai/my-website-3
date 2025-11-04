import { Link } from "react-router-dom";
import styles from "./OtherDialectVersions.module.css";
import bgImg from "../assets/bg_other_versions.webp";
import type { Media } from "../types/media";

interface Props {
  medias: Media[];
  currentId: number;
}

export default function OtherDialectVersions({ medias, currentId }: Props) {
  const filtered = medias.filter(
    (m) =>
      m.id !== currentId &&
      m.dialect &&
      typeof m.dialect.slug === "string" &&
      m.dialect.slug.trim() !== ""
  );

  if (filtered.length === 0) return null;

  const single = filtered.length === 1;

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Доступно также на этих диалектах</h2>

        <div className={`${styles.container} ${single ? styles.single : ""}`}>
          <div
            className={`${styles.slider} ${single ? styles.sliderSingle : ""}`}
          >
            {filtered.map((m) => (
              <Link
                key={m.id}
                to={`/dialects/${m.dialect!.slug}/media/${m.id}`}
                className={styles.card}
              >
                <span className={styles.dialectBadge}>{m.dialect!.name}</span>

                {m.duration && (
                  <div className={styles.metaRow}>
                    <span>⏱ {m.duration}</span>
                  </div>
                )}

                {m.speaker && (
                  <div className={styles.metaRow}>
                    <span>🎙 {m.speaker}</span>
                  </div>
                )}

                {m.licenseType === "original" && (
                  <div className={styles.exclusive}>
                    🔥 <span>Эксклюзив Oasis</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className={styles.imageWrap}>
            <img src={bgImg} alt="dialects preview" />
          </div>
        </div>
      </div>
    </section>
  );
}
