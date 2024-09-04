import React from 'react';

// Definindo os tipos das props do ToggleSwitch
interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onToggle }) => {
  return (
    <label className='flex cursor-pointer select-none items-center'>
      <div className='relative'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={onToggle}
          className='sr-only'
        />
        <div className={`block h-8 w-14 rounded-full ${isChecked ? 'bg-blue-500' : 'bg-[#E5E7EB]'}`}></div>
        <div
          className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
            isChecked ? 'translate-x-6' : ''
          }`}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
