import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 001.316-5.033.75.75 0 01.573-.726 8.25 8.25 0 0110.22 0 .75.75 0 01.573.726 9.75 9.75 0 001.316 5.033zM6.75 18.75a9.75 9.75 0 019 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V3M15 3.75l-3 3-3-3" />
    </svg>
);

export default TrophyIcon;
