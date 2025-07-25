import { useState } from 'react';

export function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex space-x-4 border-b border-stone-300 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`pb-2 text-sm font-semibold transition border-b-2 ${
              i === active ? 'border-primary text-primary' : 'border-transparent text-stone-500 hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}
