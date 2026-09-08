import React from 'react';

interface IndianFlagProps {
  className?: string;
  showBorder?: boolean;
}

export const IndianFlag: React.FC<IndianFlagProps> = ({
  className = 'w-9 h-6',
  showBorder = true,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xs shadow-xs select-none flex flex-col justify-between shrink-0 ${
        showBorder ? 'border border-slate-300/80 dark:border-slate-700/80' : ''
      } ${className}`}
      title="National Flag of India (Tiranga / तिरंगा)"
      role="img"
      aria-label="National Flag of India"
    >
      {/* Top Stripe: India Saffron (Kesari) */}
      <div className="w-full h-1/3 bg-[#FF671F]" />

      {/* Middle Stripe: Pure White with Navy Blue 24-spoke Ashoka Chakra */}
      <div className="w-full h-1/3 bg-white relative flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="h-full aspect-square text-[#000080]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer rim */}
          <circle cx="12" cy="12" r="9.6" stroke="#000080" strokeWidth="1.2" />
          {/* Central hub */}
          <circle cx="12" cy="12" r="2.2" fill="#000080" />
          {/* 24 spokes of Ashoka Chakra (every 15 degrees) */}
          {[
            0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
            180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345,
          ].map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="2.4"
              x2="12"
              y2="21.6"
              stroke="#000080"
              strokeWidth="0.65"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
          {/* Inner ring dot indicators */}
          <circle
            cx="12"
            cy="12"
            r="9.6"
            stroke="#000080"
            strokeWidth="0.4"
            strokeDasharray="0.8 1"
          />
        </svg>
      </div>

      {/* Bottom Stripe: India Green (Bharat Harit) */}
      <div className="w-full h-1/3 bg-[#138808]" />
    </div>
  );
};
