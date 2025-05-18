import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format, parseISO } from 'date-fns';
import { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import { useTranslation } from '../hooks/useTranslation';
import type { DateRange } from '../utils/api';

// Register Hebrew locale
registerLocale('he', he);

// Import the react-datepicker styles
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (newDateRange: DateRange) => void;
  presets?: {
    label: string;
    value: string;
    range: DateRange;
  }[];
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  presets = [],
}) => {
  const { t, i18n, dir } = useTranslation();
  const [startDate, setStartDate] = useState<Date | null>(
    dateRange.from ? parseISO(dateRange.from) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    dateRange.to ? parseISO(dateRange.to) : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [datePickerRef]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      onDateRangeChange({
        from: format(start, 'yyyy-MM-dd'),
        to: format(end, 'yyyy-MM-dd'),
      });
      setIsOpen(false);
    }
  };

  const handlePresetClick = (range: DateRange) => {
    onDateRangeChange(range);
    setStartDate(range.from ? parseISO(range.from) : null);
    setEndDate(range.to ? parseISO(range.to) : null);
  };

  return (
    <div className="relative inline-block" dir={dir}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.range)}
              className={`btn text-sm ${
                dateRange.from === preset.range.from && dateRange.to === preset.range.to
                  ? 'btn-primary'
                  : 'btn-outline'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom date picker button */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-outline flex items-center gap-2 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-secondary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {startDate && endDate
                ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                : t('common.custom')}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`w-4 h-4 text-secondary-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-2 bg-white border border-secondary-200 rounded-lg shadow-dropdown">
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                locale={i18n.language === 'he' ? 'he' : undefined}
                monthsShown={2}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                calendarClassName="bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
