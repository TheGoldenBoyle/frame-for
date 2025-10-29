import React from 'react';

export const Heading = ({ 
  children, 
  level = 2,
  size = 'md',
  className = '',
  ...props 
}) => {
  const Tag = `h${level}`;
  
  const sizeClasses = {
    xs: 'heading-xs',
    sm: 'heading-sm',
    md: 'heading-md',
    lg: 'heading-lg',
    xl: 'heading-xl'
  };

  const classes = [
    'heading',
    sizeClasses[size] || sizeClasses.md,
    className
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
};

export const Text = ({ 
  children, 
  size = 'base',
  variant = 'default',
  align = 'left',
  className = '',
  as = 'p',
  ...props 
}) => {
  const Tag = as;
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const variantClasses = {
    default: 'text',
    primary: 'text-primary',
    secondary: 'text-secondary'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const classes = [
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.base,
    alignClasses[align] || '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
};

export default { Heading, Text };