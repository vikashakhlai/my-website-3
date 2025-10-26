import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showArrows?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showArrows = true,
  prevLabel = "Назад",
  nextLabel = "Вперёд",
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const renderPageButton = (page: number) => (
    <button
      key={page}
      className={page === currentPage ? styles.activePage : ""}
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  );

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(renderPageButton(i));
    } else if (i === 2 && currentPage > 3) {
      pages.push(<span key="start-ellipsis">...</span>);
    } else if (i === totalPages - 1 && currentPage < totalPages - 2) {
      pages.push(<span key="end-ellipsis">...</span>);
    }
  }

  return (
    <div className={styles.pagination}>
      {showArrows && (
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {prevLabel}
        </button>
      )}

      {pages}

      {showArrows && (
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
};

export default Pagination;
