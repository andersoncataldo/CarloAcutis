import React from 'react';

interface Event {
  date: string;
  label: string;
}

interface TimelineProps {
  events: Event[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="relative border-l-2 border-blue-200 ml-4 py-4">
      {events.map((event, index) => (
        <div key={index} className="mb-10 ml-6 relative">
          <div className="absolute -left-[33px] mt-1.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-white shadow-sm"></div>
          <span className="block mb-1 text-sm font-semibold leading-none text-blue-600">
            {event.date}
          </span>
          <h3 className="text-xl font-bold text-blue-900">{event.label}</h3>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
