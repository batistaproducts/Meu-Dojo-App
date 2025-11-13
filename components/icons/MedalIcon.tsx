import React from 'react';

const MedalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 1011.643-8.625 9.72 9.72 0 00-2.643-.175A9.75 9.75 0 0016.5 18.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75L9 9m3 3.75l3-3.75m-3 3.75V3.75m0 9L9 9m3 3.75l3 3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l-3.75 3L12 9.75l3.75-3L12 3.75z" />
    </svg>
);

export default MedalIcon;