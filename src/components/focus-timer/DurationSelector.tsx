import React from 'react';

interface DurationSelectorProps {
  disabled: boolean;
  onSelectDuration: (minutes: number) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ disabled, onSelectDuration }) => {
  const durations = [
    { label: '30 sec', value: 0.5 },
    { label: '5 min', value: 5 },
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: '90 min', value: 90 },
  ];
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {durations.map((duration) => (
        <button
          key={duration.value}
          onClick={() => onSelectDuration(duration.value)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          {duration.label}
        </button>
      ))}
    </div>
  );
};

export default DurationSelector;
