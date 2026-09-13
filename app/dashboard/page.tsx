"use client";

import {
  AlertCards,
  BookingHealthCard,
  InventoryAlertsCard,
  KpiTiles,
  LockedCardOverlay,
  OrderStatusCard,
  PaymentStatusDonut,
  QuickActionsCard,
  RevenueOrdersTrendChart,
  TeamActivityCard,
  TopMoversCard,
  WelcomeHeader,
  usePeriodFilter,
} from "@/components/ui/dashboard/home";
import useStockAnalysisSummary from "@/hooks/cachedEndpoints/useStockAnalysisSummary";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import useUser from "@/hooks/cachedEndpoints/useUser";
import { useSubscriptionContext } from "@/hooks/providers/SubscriptionProvider";
import {
  DateRangePicker,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import { DateValue, getLocalTimeZone, today } from "@internationalized/date";
import React from "react";

const toIsoDate = (value: DateValue | null | undefined): string | undefined => {
  if (!value) return undefined;
  // DateValue exposes year/month/day; format as YYYY-MM-DD for periodUtils
  const y = String(value.year).padStart(4, "0");
  const m = String(value.month).padStart(2, "0");
  const d = String(value.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const Dashboard: React.FC = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const initialDate = today(getLocalTimeZone());
  const [pickerValue, setPickerValue] = React.useState<{
    start: DateValue;
    end: DateValue;
  }>({
    start: initialDate,
    end: initialDate,
  });

  const period = usePeriodFilter("week");

  const { data: user } = useUser();
  const { hasCapability, isReady: subscriptionReady } = useSubscriptionContext();
  const { userRolePermissions, role } = usePermission();
  const isManager = Number(role) === 0;

  const canViewReport = isManager || userRolePermissions?.canViewReport;
  const canViewInventory = isManager || userRolePermissions?.canViewInventory;

  const planAllowsBookings = hasCapability("canAccessBookings");
  const planAllowsInventory = hasCapability("canAccessInventory");
  const planAllowsReports = hasCapability("canAccessReports");

  const { filterType, startDate, endDate, comparisonLabel, periodLabel } =
    period;

  const {
    data: summary,
    isError: summaryError,
    refetch: refetchSummary,
    isLoading: summaryLoading,
  } = useStockAnalysisSummary(filterType, startDate, endDate, { enabled: true });

  const orderDetails = summary?.orderDetails;
  const paymentDetails = summary?.paymentDetails;
  const bookingDetails = summary?.bookingDetails;
  const inventoryDetails = summary?.inventoryDetails;
  const auditDetails = summary?.auditDetails;

  const cardLoading = summaryLoading;

  // Don't reveal the locked overlay while the page or subscription is still loading —
  // show the skeleton instead so users never see "Upgrade Plan" during the initial fetch.
  const showLocks = subscriptionReady && !cardLoading;

  const handleDateChange = (newValue: {
    start: DateValue | null;
    end: DateValue | null;
  } | null) => {
    if (!newValue || !newValue.start || !newValue.end) return;
    setPickerValue({ start: newValue.start, end: newValue.end });
    onClose();
    period.setCustomRange({
      start: toIsoDate(newValue.start),
      end: toIsoDate(newValue.end),
    });
  };

  return (
    <>
      <div className="flex flex-col gap-5 pb-6">
        <WelcomeHeader
          firstName={user?.firstName}
          periodLabel={periodLabel}
          activePeriod={period.activePeriod}
          onSelectPeriod={(p) => {
            period.clearCustomRange();
            period.setActivePeriod(p);
          }}
          onOpenCustomRange={onOpen}
          customRange={period.customRange}
          hasCustomRange={period.hasCustomRange}
        />

        {summaryError ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
            <p className="text-[13px] text-[#7F1D1D]">
              Couldn&apos;t load dashboard data for this range. The selected
              filter may not be supported or the server is unavailable.
            </p>
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#7F1D1D] text-white text-[12px] font-medium"
            >
              Retry
            </button>
          </div>
        ) : null}

        <AlertCards alerts={summary?.alerts} />

        <KpiTiles
          payments={paymentDetails}
          orders={orderDetails}
          bookings={bookingDetails}
          comparisonLabel={comparisonLabel}
          isLoading={cardLoading}
          planAllowsBookings={planAllowsBookings}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {planAllowsReports || !showLocks ? (
              <RevenueOrdersTrendChart
                payments={paymentDetails}
                orders={orderDetails}
                isLoading={cardLoading}
              />
            ) : (
              <LockedCardOverlay>
                <RevenueOrdersTrendChart
                  payments={paymentDetails}
                  orders={orderDetails}
                  isLoading={false}
                />
              </LockedCardOverlay>
            )}
          </div>
          <PaymentStatusDonut
            payments={paymentDetails}
            isLoading={cardLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <OrderStatusCard orders={orderDetails} isLoading={cardLoading} />
          {planAllowsBookings || !showLocks ? (
            <BookingHealthCard
              bookings={bookingDetails}
              isLoading={cardLoading}
            />
          ) : (
            <LockedCardOverlay>
              <BookingHealthCard
                bookings={bookingDetails}
                isLoading={false}
              />
            </LockedCardOverlay>
          )}
          {canViewInventory ? (
            planAllowsInventory || !showLocks ? (
              <InventoryAlertsCard
                inventory={inventoryDetails}
                isLoading={cardLoading}
              />
            ) : (
              <LockedCardOverlay>
                <InventoryAlertsCard
                  inventory={inventoryDetails}
                  isLoading={false}
                />
              </LockedCardOverlay>
            )
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {canViewInventory ? (
            planAllowsInventory || !showLocks ? (
              <TopMoversCard
                inventory={inventoryDetails}
                isLoading={cardLoading}
              />
            ) : (
              <LockedCardOverlay>
                <TopMoversCard
                  inventory={inventoryDetails}
                  isLoading={false}
                />
              </LockedCardOverlay>
            )
          ) : null}
          {canViewReport ? (
            planAllowsReports || !showLocks ? (
              <TeamActivityCard audit={auditDetails} isLoading={cardLoading} />
            ) : (
              <LockedCardOverlay>
                <TeamActivityCard audit={auditDetails} isLoading={false} />
              </LockedCardOverlay>
            )
          ) : null}
          <QuickActionsCard />
        </div>

        <p className="text-center text-[11px] text-[#94A3B8] pt-2">
          Dashboard Refresh after every 30seconds
        </p>
      </div>

      <Modal
        isDismissable={false}
        classNames={{ base: "absolute top-12" }}
        size="sm"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <ModalBody className="px-4 py-6">
              <DateRangePicker
                radius="sm"
                maxValue={today(getLocalTimeZone())}
                value={pickerValue}
                onChange={handleDateChange}
                visibleMonths={2}
                variant="faded"
                pageBehavior="single"
                label="Select date range"
                showMonthAndYearPickers
                labelPlacement="outside"
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Dashboard;
