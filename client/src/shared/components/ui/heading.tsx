import React from 'react';

interface HeadingProps {
  title: string;
  description: string;
  button?: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  button
}) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex-1'>
        <div className='flex items-center gap-2'>
          <h2 className='text-3xl font-bold tracking-tight'>{title}</h2>
        </div>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </div>
      <div>{button}</div>
    </div>
  );
};
