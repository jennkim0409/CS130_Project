import React, { forwardRef } from 'react';

export const Photo = forwardRef(({ url, index, faded, style, width, height, ...props }, ref) => {

  const inlineStyles = {
    opacity: faded ? '0.2' : '1',
    transformOrigin: '0 0',
    height: height || `calc(10vw * 3/2 * 0.8)`, // // 10% of the viewport width, 3:2 aspect ratio
    width: width || `calc(10vw * 0.8)`, // 10% of the viewport width
    backgroundImage: `url("${url}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'grey',
    ...style,
  };

  return <div ref={ref} style={inlineStyles} {...props} />;
});
