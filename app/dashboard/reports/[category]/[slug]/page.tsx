'use client';
import {
  getReportAuditLogExport,
  getReportBookingExport,
  getReportOrderExport,
  getReportPaymentExport,
} from '@/app/api/controllers/dashboard/report';
import Error from '@/components/error';
import ActivityTableAudit from '@/components/ui/dashboard/reports/activityTableAuditReport';
import ActivityTableBooking from '@/components/ui/dashboard/reports/activityTableBooking';
import ActivityTableOrder from '@/components/ui/dashboard/reports/activityTableOrder';
import ActivityTablePayment from '@/components/ui/dashboard/reports/activityTablePayment';
import useReportFilter from '@/hooks/cachedEndpoints/useReportFilter';
import {
  dynamicExportConfig,
  formatDateTimeForPayload2,
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import {
  categoryToApiRoute,
  slugifyReportName,
} from "@/lib/reportRoutes";
import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Button,
  DateRangePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";

interface ReportObject {
  reportName: string;
  reportType: number;
}

const Activity = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const router = useRouter();
  const params = useParams<{ category: string; slug: string }>();
  const category = params?.category ?? "";
  const reportSlug = params?.slug ?? "";
  const apiRoute = categoryToApiRoute(category);

  const [selectedReportObject, setSelectedReportObject] =
    useState<ReportObject>({
      reportName: "",
      reportType: 0,
    });

  const [value, setValue] = useState({
    start: null,
    end: null,
  });
  const [selectedKeys, setSelectedKeys] = useState(new Set(["This week"]));
  const [previousSelectedValue, setPreviousSelectedValue] =
    useState("This week");
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  const [showMore, setShowMore] = useState(false);
  const toggleMoreFilters = () => {
    setShowMore(!showMore);
  };

  const logIndexForSelectedKey = (key: string) => {
    switch (key) {
      case "Today":
        return 0;
      case "This week":
        return 1;
      case "This year":
        return 2;
      case "Custom date":
        return 3;
      default:
        return -1;
    }
  };

  const checkValue = () => {
    return value.start !== null && value.end !== null;
  };

  const shouldFetchReport =
    selectedValue !== "Custom date" ||
    (selectedValue === "Custom date" && checkValue());

  const effectiveSelectedValue = shouldFetchReport
    ? selectedValue
    : previousSelectedValue;

  const startDate = value.start
    ? `${formatDateTimeForPayload2(value.start)}Z`
    : undefined;
  const endDate = value.end
    ? `${formatDateTimeForPayload2(value.end)}Z`
    : undefined;

  const { data, isError, refetch, isLoading } = useReportFilter(
    logIndexForSelectedKey(effectiveSelectedValue),
    startDate,
    endDate,
    selectedReportObject.reportType,
    userInformation?.email,
    apiRoute ?? undefined,
    { enabled: Boolean(apiRoute) }
  );

  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const exportFile = async (exportType: number) => {
    const business = getJsonItemFromLocalStorage("business");
    setIsLoadingExport(true);
    let response;
    if (apiRoute === "orders") {
      response = await getReportOrderExport(
        business[0].businessId,
        logIndexForSelectedKey(effectiveSelectedValue),
        startDate,
        endDate,
        selectedReportObject.reportType,
        exportType
      );
    } else if (apiRoute === "booking") {
      response = await getReportBookingExport(
        business[0].businessId,
        logIndexForSelectedKey(effectiveSelectedValue),
        startDate,
        endDate,
        selectedReportObject.reportType,
        exportType
      );
    } else if (apiRoute === "payment") {
      response = await getReportPaymentExport(
        business[0].businessId,
        logIndexForSelectedKey(effectiveSelectedValue),
        startDate,
        endDate,
        selectedReportObject.reportType,
        exportType
      );
    } else if (apiRoute === "audit-logs") {
      response = await getReportAuditLogExport(
        business[0].businessId,
        logIndexForSelectedKey(effectiveSelectedValue),
        startDate,
        endDate,
        selectedReportObject.reportType,
        exportType
      );
    }
    setIsLoadingExport(false);
    if (response?.status === 200) {
      dynamicExportConfig(response, selectedReportObject.reportName);
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: "Failed to download the file",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (shouldFetchReport && selectedValue !== "Custom date") {
      setPreviousSelectedValue(selectedValue);
    }
  }, [shouldFetchReport, selectedValue]);

  useEffect(() => {
    if (!data?.availableReport) return;
    const matchBySlug = data.availableReport.find(
      (item: ReportObject) => slugifyReportName(item.reportName) === reportSlug
    );
    const matchByName = data.availableReport.find(
      (item: ReportObject) => item.reportName === selectedReportObject.reportName
    );
    const next = matchBySlug ?? matchByName;
    if (
      next &&
      (next.reportName !== selectedReportObject.reportName ||
        next.reportType !== selectedReportObject.reportType)
    ) {
      setSelectedReportObject(next);
    }
  }, [data, reportSlug, selectedReportObject]);

  const navigateToReport = (next: ReportObject) => {
    const nextSlug = slugifyReportName(next.reportName);
    if (nextSlug === reportSlug) return;
    router.replace(`/dashboard/reports/${category}/${nextSlug}`);
  };

  const handleDateChange = (newValue: any) => {
    setValue(newValue);
    if (newValue.start && newValue.end) {
      onClose();
    }
  };

  useEffect(() => {
    if (category === "inventory") {
      const params = new URLSearchParams({
        module: "inventory",
        sub: reportSlug || "overview",
      });
      router.replace(`/dashboard/inventory/stock-analysis?${params.toString()}`);
    }
  }, [category, reportSlug, router]);

  if (!apiRoute) {
    if (category === "inventory") {
      return null;
    }
    return <Error onClick={() => router.push("/dashboard/reports")} />;
  }

  if (isError) {
    return <Error onClick={() => refetch()} />;
  }

  return (
    <main>
      <div className="flex flex-row flex-wrap  justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            <span>Reports</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2 items-center">
              <p className="text-sm  text-grey600  ">A summary of activities</p>
              <Dropdown isDisabled={isLoading}>
                <DropdownTrigger>
                  <Button
                    endContent={<MdKeyboardArrowDown />}
                    disableRipple
                    className="font-[600] bg-background/30 p-0 capitalize text-black"
                  >
                    {selectedValue}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Single selection example"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  className="text-black"
                  selectedKeys={selectedKeys}
                  onSelectionChange={setSelectedKeys}
                >
                  <DropdownItem key="Today">Today</DropdownItem>
                  <DropdownItem key="This week">This week</DropdownItem>
                  <DropdownItem key="This year">This year</DropdownItem>

                  <DropdownItem onClick={() => onOpen()} key="Custom date">
                    Custom date
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="flex gap-2 items-center">
              <Dropdown isDisabled={isLoading}>
                <DropdownTrigger>
                  <Button
                    endContent={<MdKeyboardArrowDown />}
                    disableRipple
                    className="font-[600] bg-background/30 p-0 capitalize text-black"
                  >
                    {selectedReportObject.reportName}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Report selection"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  className="text-black"
                  selectedKeys={new Set([selectedReportObject.reportName])}
                  onSelectionChange={(keys) => {
                    const selectedReportName = Array.from(keys)[0] as string;
                    const newReportObject = data?.availableReport.find(
                      (item: ReportObject) =>
                        item.reportName === selectedReportName
                    );
                    if (newReportObject) {
                      setSelectedReportObject(newReportObject);
                      navigateToReport(newReportObject);
                    }
                  }}
                >
                  {data?.availableReport.map((item: ReportObject) => (
                    <DropdownItem key={item.reportName}>
                      {item.reportName}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
        <Button
          onClick={() => {
            saveJsonItemToLocalStorage("selectedReportTab", category);
            router.push("/dashboard/reports");
          }}
          className="flex text-grey600 bg-white"
        >
          <IoIosArrowRoundBack className="text-[22px]" />

          <p>Go back</p>
        </Button>
      </div>

      {apiRoute === "orders" && (
        <ActivityTableOrder
          data={data}
          reportName={selectedReportObject?.reportName}
          isLoading={isLoading}
          reportType={selectedReportObject?.reportType}
          selectedValue={selectedValue}
          value={value}
          isLoadingExport={isLoadingExport}
          exportFile={exportFile}
        />
      )}
      {apiRoute === "booking" && (
        <ActivityTableBooking
          reportName={selectedReportObject?.reportName}
          data={data}
          reportType={selectedReportObject?.reportType}
          isLoading={isLoading}
          selectedValue={selectedValue}
          value={value}
          isLoadingExport={isLoadingExport}
          exportFile={exportFile}
        />
      )}
      {apiRoute === "payment" && (
        <ActivityTablePayment
          reportName={selectedReportObject?.reportName}
          data={data}
          reportType={selectedReportObject?.reportType}
          isLoading={isLoading}
          selectedValue={selectedValue}
          value={value}
          isLoadingExport={isLoadingExport}
          exportFile={exportFile}
        />
      )}
      {apiRoute === "audit-logs" && (
        <ActivityTableAudit
          reportName={selectedReportObject?.reportName}
          data={data}
          reportType={selectedReportObject?.reportType}
          isLoading={isLoading}
          selectedValue={selectedValue}
          value={value}
          isLoadingExport={isLoadingExport}
          exportFile={exportFile}
        />
      )}
      <Modal
        isDismissable={false}
        classNames={{
          base: "absolute top-12",
        }}
        size="sm"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="px-4 py-6">
                <DateRangePicker
                  radius="sm"
                  maxValue={today(getLocalTimeZone())}
                  value={value}
                  onChange={handleDateChange}
                  visibleMonths={2}
                  variant="faded"
                  pageBehavior="single"
                  label="Select date range"
                  showMonthAndYearPickers
                  labelPlacement="outside"
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
};

export default Activity;
