"use client";

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Shield */}
    <rect width="200" height="200" rx="40" fill="#1E3A5F"/>
    
    {/* The Main 'G' */}
    <path 
      d="M145 100C145 124.853 124.853 145 100 145C75.1472 145 55 124.853 55 100C55 75.1472 75.1472 55 100 55C118.257 55 133.951 65.8893 140.925 81.5" 
      stroke="white" 
      strokeWidth="15" 
      strokeLinecap="round"
    />
    <path d="M145 100H100" stroke="white" strokeWidth="15" strokeLinecap="round"/>
    
    {/* The "Scan" Line (Electric Blue) */}
    <rect x="40" y="95" width="120" height="10" rx="5" fill="#60A5FA" fillOpacity="0.8">
      <animate attributeName="y" values="60;130;60" dur="3s" repeatCount="indefinite" />
    </rect>
    
    {/* Digital Nodes */}
    <circle cx="141" cy="82" r="5" fill="#60A5FA" />
    <circle cx="55" cy="100" r="5" fill="#60A5FA" />
  </svg>
);