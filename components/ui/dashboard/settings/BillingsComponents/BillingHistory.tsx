'use client';

import React, { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import moment from 'moment';
import { SubscriptionTableProps } from './Interfaces';

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ subscriptions, searchQuery }: any) => {
  const [filteredData, setFilteredData] = React.useState(subscriptions);

  // Map numeric plans and payment periods to human-readable text
  const mapPlan = (plan: number) => {
    switch (plan) {
      case 1:
        return 'Premium';
      case 2:
        return 'Professional';
      case 3:
        return 'Starter';
      default:
        return 'Unknown';
    }
  };

  const mapPaymentPeriod = (paymentPeriod: number) => {
    switch (paymentPeriod) {
      case 0:
        return 'Monthly';
      case 1:
        return 'Annually';
      default:
        return 'Unknown';
    }
  };

  // Filter data based on search query
  useEffect(() => {
    if (subscriptions && searchQuery) {
      const filtered = subscriptions.filter((item: any) =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(subscriptions);
    }
  }, [searchQuery, subscriptions]);

  const renderCell = (item: any, columnKey: string) => {
    switch (columnKey) {
      case 'subscriptionStartDate':
      case 'subscriptionEndDate':
        return (
          <div>
            {moment(item[columnKey]).isValid()
              ? moment(item[columnKey]).format('MMMM Do YYYY, h:mm:ss a')
              : 'N/A'}
          </div>
        );
      case 'isActive':
        return (
          <span
            className={`px-2 py-1 rounded ${
              item[columnKey] ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {item[columnKey] ? 'Active' : 'Inactive'}
          </span>
        );
      case 'isExpired':
        return (
          <span
            className={`px-2 py-1 rounded ${
              item[columnKey] ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {item[columnKey] ? 'Expired' : 'Valid'}
          </span>
        );
      default:
        return item[columnKey] || 'N/A';
    }
  };

  return (
    <section className="border border-primaryGrey rounded-lg">
      <Table
        aria-label="Subscription List"
        radius="lg"
        isCompact
        bottomContentPlacement="outside"
        emptyContent="No subscriptions found"
      >
        <TableHeader>
          {/* <TableColumn>Cooperate ID</TableColumn>
          <TableColumn>Business ID</TableColumn>
          <TableColumn>Subscribed By</TableColumn> */}
          <TableColumn>Plan</TableColumn>
          <TableColumn>Bill Date</TableColumn>
          <TableColumn>Duration</TableColumn>
          {/* <TableColumn>Start Date</TableColumn> */}
          <TableColumn>Status</TableColumn>
          <TableColumn>Expiration</TableColumn>
        </TableHeader>
        <TableBody items={filteredData}>
          {(item) => (
            <TableRow key={item.id}>
              {/* <TableCell>{item.cooperateID}</TableCell>
              <TableCell>{item.businessID}</TableCell> */}
              {/* <TableCell>{item.subcribedByID}</TableCell> */}
              <TableCell>{mapPlan(item.plan)}</TableCell>
              <TableCell>{renderCell(item, 'subscriptionEndDate')}</TableCell>
              <TableCell>{mapPaymentPeriod(item.paymentPeriod)}</TableCell>
              {/* <TableCell>{renderCell(item, 'subscriptionStartDate')}</TableCell> */}
              <TableCell>{renderCell(item, 'isActive')}</TableCell>
              <TableCell>{renderCell(item, 'isExpired')}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
};

export default SubscriptionTable;
