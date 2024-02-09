import React, { forwardRef } from 'react';

export const Photo = forwardRef(({ url, index, faded, style, ...props }, ref) => {
  const screenWidth = window.innerWidth;
  const numColumns = 6;
  const width = screenWidth / (numColumns+1);
  const height = (3/2) * width;

  const inlineStyles = {
    opacity: faded ? '0.2' : '1',
    transformOrigin: '0 0',
    height: `${height}px`,
    width: `${width}px`,
    backgroundImage: `url("${url}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'grey',
    ...style,
  };

  return <div ref={ref} style={inlineStyles} {...props} />;
});
