
import React from 'react';

const CertificateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15.91 15.91a4.5 4.5 0 01-6.328 0m6.328 0l-1.06-1.06m-4.208 0L9 14.85" 
        />
    </svg>
);

export default CertificateIcon;
