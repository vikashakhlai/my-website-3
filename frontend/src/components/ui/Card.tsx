import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  title,
  hoverable = true,
  className = '',
  ...props
}) => {
  const classes = ['card', hoverable ? 'card-hoverable' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">
        {title && <h3 className="card-title">{title}</h3>}
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;

