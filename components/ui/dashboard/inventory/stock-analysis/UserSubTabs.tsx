'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { TablePagination } from './SalesPanels';
import { ExportType } from './exportHelpers';
import {
  UserAuditLogItem,
  UserDailyActivePeriod,
  UserReportResponse,
} from './types';

const PAGE_SIZE = 10;

interface UserSubTabPanelProps {
  data?: UserReportResponse;
  isLoading?: boolean;
  onExport?: (exportType: number) => void | Promise<void>;
  isExporting?: boolean;
}

interface ExportButtonsProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isLoading?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPdf,
  isLoading,
}) => (
  <div className="flex items-center gap-2 px-5 py-4">
    <Button
      variant="bordered"
      onPress={onExportExcel}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="border border-gray-200 text-gray-700 bg-white rounded-lg text-sm h-10 px-4"
    >
      Export Excel
    </Button>
    <Button
      onPress={onExportPdf}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="bg-primaryColor text-white rounded-lg text-sm h-10 px-4"
    >
      Export PDF
    </Button>
  </div>
);

const buildExportHandlers = (
  onExport?: (exportType: number) => void | Promise<void>
) => ({
  onExportExcel: onExport ? () => onExport(ExportType.Excel) : undefined,
  onExportPdf: onExport ? () => onExport(ExportType.Pdf) : undefined,
});

const TableSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5">
    <Skeleton className="h-96 rounded-2xl" />
  </div>
);

const activityTypeClass = (type: string): string => {
  const t = (type ?? '').toLowerCase();
  if (t === 'user') return 'bg-blue-50 text-blue-600';
  if (t === 'order') return 'bg-emerald-50 text-emerald-600';
  if (t === 'inventory') return 'bg-amber-50 text-amber-600';
  if (t === 'payment') return 'bg-purple-50 text-purple-600';
  if (t === 'menu') return 'bg-pink-50 text-primaryColor';
  if (t === 'booking') return 'bg-indigo-50 text-indigo-600';
  if (t === 'reservation') return 'bg-teal-50 text-teal-600';
  if (t === 'business') return 'bg-orange-50 text-orange-600';
  return 'bg-gray-100 text-gray-700';
};

const renderActivity = (activity: string): React.ReactNode => {
  const match = activity.match(/^([^()]+?)\s*\(([^)]+)\)\s*(.*)$/);
  if (match) {
    return (
      <span>
        <span className="text-gray-900 font-semibold">{match[1].trim()}</span>{' '}
        <span className="text-gray-500">({match[2].trim()})</span>
        {match[3] ? (
          <span className="text-gray-700"> {match[3].trim()}</span>
        ) : null}
      </span>
    );
  }
  return <span className="text-gray-900">{activity}</span>;
};

export const ActivityAuditPanel: React.FC<UserSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);

  const auditLogs = data?.auditLogs ?? [];

  const counts = useMemo(() => {
    let total = 0;
    let successful = 0;
    let failed = 0;
    auditLogs.forEach((a) => {
      total += 1;
      if (a.isSuccessful) successful += 1;
      else failed += 1;
    });
    return { total, successful, failed };
  }, [auditLogs]);

  const activityTypes = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((a) => {
      if (a.activityType) set.add(a.activityType);
    });
    return Array.from(set);
  }, [auditLogs]);

  const filtered = useMemo(() => {
    const sorted = [...auditLogs].sort((a, b) =>
      moment(b.dateCreated).diff(moment(a.dateCreated))
    );
    if (activityFilter === 'all') return sorted;
    return sorted.filter((a) => a.activityType === activityFilter);
  }, [auditLogs, activityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Activities
            </h3>
            <span className="text-xs text-gray-500">
              {counts.total.toLocaleString()} total · {counts.successful.toLocaleString()} successful
              {counts.failed > 0 ? ` · ${counts.failed} failed` : ''}
            </span>
            {activityTypes.length > 0 && (
              <select
                value={activityFilter}
                onChange={(e) => {
                  setActivityFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
              >
                <option value="all">All activities</option>
                {activityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Time</th>
                <th className="text-left px-5 py-3 font-medium">Staff</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Activity</th>
                <th className="text-left px-5 py-3 font-medium">IP Address</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No activity audit data for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row: UserAuditLogItem, index) => (
                  <tr
                    key={`${row.userName}-${row.dateCreated}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-700">
                      {moment(row.dateCreated).format('MMM DD, YYYY')}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {moment(row.dateCreated).format('hh:mma')}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.userName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.role || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${activityTypeClass(
                          row.activityType
                        )}`}
                      >
                        {row.activityType || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <div className="truncate" title={row.activity}>
                        {renderActivity(row.activity)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">
                      {row.ipAddress || '—'}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${
                        row.isSuccessful ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {row.isSuccessful ? 'Success' : 'Failed'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

interface DailySessionRow {
  date: string;
  staff: string;
  email: string;
  firstLogin: string;
  lastSeen: string;
  activePeriod: string;
}

const buildSessionRows = (
  sessions: UserDailyActivePeriod[]
): DailySessionRow[] => {
  return sessions.map((s) => ({
    date: s.date || moment(s.dateCreated).format('dddd DD MMMM YYYY'),
    staff: s.fullName || 'Unknown',
    email: s.emailAddress || '—',
    firstLogin: s.firstLoginTime
      ? moment(s.firstLoginTime).format('hh:mma')
      : '—',
    lastSeen: s.lastSeenTime ? moment(s.lastSeenTime).format('hh:mma') : '—',
    activePeriod: s.activePeriod || '0 min',
  }));
};

export const DailySessionsPanel: React.FC<UserSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const rows = useMemo(
    () => buildSessionRows(data?.userDailyActivePeriods ?? []),
    [data]
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 pr-5">
          <h3 className="px-5 py-4 text-base font-semibold text-gray-900">
            Daily Sessions
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Staff</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">First Login</th>
                <th className="text-left px-5 py-3 font-medium">Last Seen</th>
                <th className="text-left px-5 py-3 font-medium">
                  Active Period
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No daily sessions for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={`${row.email}-${row.date}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-700">{row.date}</td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.staff}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.email}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.firstLogin}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.lastSeen}</td>
                    <td className="px-5 py-4 text-primaryColor font-semibold">
                      {row.activePeriod}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};
