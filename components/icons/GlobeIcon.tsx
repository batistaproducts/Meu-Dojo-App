import React from 'react';

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9 9 9 0 019-9m9 9a9 9 0 01-9 9m9-9H3m16.5 0a14.25 14.25 0 00-2.33-7.553m-11.84 0A14.25 14.25 0 003.5 12m17 0a14.25 14.25 0 01-2.33 7.553m-11.84 0A14.25 14.25 0 013.5 12" />
    </svg>
);

export default GlobeIcon;
