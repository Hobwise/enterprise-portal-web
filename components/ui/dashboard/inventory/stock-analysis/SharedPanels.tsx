'use client';

import React from 'react';
import { BarRow, BreakdownRow, StatCard } from './types';

interface StatCardsProps {
  cards: StatCard[];
}

export const StatCards: React.FC<StatCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCardItem key={card.label} card={card} />
      ))}
    </div>
  );
};

interface StatCardItemProps {
  card: StatCard;
}

const toneClass = (tone?: StatCard['footerTone']): string => {
  switch (tone) {
    case 'success':
      return 'text-emerald-600';
    case 'danger':
      return 'text-red-500';
    case 'warning':
      return 'text-amber-600';
    case 'muted':
    default:
      return 'text-gray-500';
  }
};

export const StatCardItem: React.FC<StatCardItemProps> = ({ card }) => {
  const direction = card.direction ?? 'up';
  const deltaColor =
    direction === 'down'
      ? 'text-red-500'
      : direction === 'neutral'
      ? 'text-gray-500'
      : 'text-emerald-600';
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <p className="text-sm text-gray-500 mb-3">{card.label}</p>
      <p className="text-[28px] leading-tight font-bold text-gray-900 mb-3 break-words">
        {card.value}
      </p>
      {card.delta && (
        <p className={`text-xs font-medium ${deltaColor}`}>{card.delta}</p>
      )}
      {card.footer && (
        <p className={`text-xs font-medium ${toneClass(card.footerTone)}`}>
          {card.footer}
        </p>
      )}
    </div>
  );
};

interface BarListProps {
  title: string;
  rows: BarRow[];
  max?: number;
  barColor?: string;
  className?: string;
  valueFormatter?: (row: BarRow) => string;
}

export const BarList: React.FC<BarListProps> = ({
  title,
  rows,
  max,
  barColor = '#7C5BE6',
  className,
  valueFormatter,
}) => {
  const ceiling = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {rows.map((row) => {
          const pct = Math.max(2, Math.min(100, (row.value / ceiling) * 100));
          const display = valueFormatter
            ? valueFormatter(row)
            : `${row.value.toLocaleString()}${row.suffix ?? ''}`;
          return (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-20 text-gray-600 shrink-0">{row.label}</span>
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: row.color ?? barColor,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 w-24 text-right shrink-0">
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface BreakdownListProps {
  title: string;
  rows: BreakdownRow[];
  className?: string;
}

export const BreakdownList: React.FC<BreakdownListProps> = ({
  title,
  rows,
  className,
}) => {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="text-gray-600">{row.label}</span>
            <span
              className={`font-semibold ${
                row.valueClass ?? 'text-primaryColor'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ComingSoonPanelProps {
  label?: string;
}

export const ComingSoonPanel: React.FC<ComingSoonPanelProps> = ({ label }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 7.5l-9-5-9 5m18 0l-9 5m9-5v9l-9 5m0-14L3 7.5m9 5v9m-9-14v9l9 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-700">
          Report Coming Soon
        </h3>
        <p className="text-sm text-gray-500">
          {label ?? 'This sub-report is under construction'}
        </p>
      </div>
    </div>
  );
};

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  segments: DonutSegment[];
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  segments,
  className,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let accumulated = 0;
  const radius = 70;
  const stroke = 24;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6 flex-wrap">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <g transform="translate(90,90) rotate(-90)">
            <circle
              r={radius}
              fill="transparent"
              stroke="#F1F2F5"
              strokeWidth={stroke}
            />
            {segments.map((seg) => {
              const length = (seg.value / total) * circumference;
              const offset = circumference - accumulated;
              accumulated += length;
              return (
                <circle
                  key={seg.label}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={offset}
                />
              );
            })}
          </g>
        </svg>
        <ul className="space-y-2 text-sm">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-700">{seg.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
