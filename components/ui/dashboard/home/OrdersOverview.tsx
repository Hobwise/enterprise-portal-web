'use client';
import { formatDateTimeForPayload3, formatPrice } from '@/lib/utils';
import {
  Button,
  Card,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

import moment from "moment";
import { BsArrowUpShort } from "react-icons/bs";
import { IoArrowUpCircleOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import NoOrder from "../../../../public/assets/images/no-order.png";
import EmptyOverview from "./emptyOverview";
import SkeletonLoaderOrder from "./skeletonLoadingOrders";

const OrdersOverview = ({
  response,
  isLoading,
  selectedKeys,
  setSelectedKeys,
  selectedValue,
  onOpen,
  value,
}: any) => {
  ChartJS.register(
    LineElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Filler,
    Tooltip,
    Legend
  );

  const barChartData = response && {
    labels: response?.orderDetails?.orderPartitions?.map(
      (item: any) => item.partitionName
    ),
    datasets: [
      {
        label: "Total orders",
        data: response?.orderDetails?.orderPartitions?.map(
          (item: any) => item.count
        ),
        backgroundColor: "#5F35D2",
        borderRadius: 4,
        barThickness: 30,
      },
    ],
  };

  const getCurveChartConfig = () => {
    const labels = response?.paymentDetails?.paymentPartitions.map(
      (item) => item.partitionName
    );
    const counts = response?.paymentDetails?.paymentPartitions.map(
      (item) => item.count
    );
    return {
      label: labels,
      data: counts,
    };
  };

  const curveData = {
    labels: getCurveChartConfig().label,
    datasets: [
      {
        label: "Total order",
        data: getCurveChartConfig().data,
        borderColor: "#FFFFFF",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const getChartConfig = () => {
    const totalCount = response?.orderDetails?.orderPartitions.reduce(
      (acc, item) => acc + item.count,
      0
    );

    let max, steps;

    if (totalCount <= 100) {
      max = 100;
      steps = 25;
    } else if (totalCount <= 500) {
      max = 500;
      steps = 100;
    } else if (totalCount <= 1000) {
      max = 1000;
      steps = 250;
    } else {
      const magnitude = Math.pow(10, Math.floor(Math.log10(totalCount)));

      if (totalCount <= 2 * magnitude) {
        max = 2 * magnitude;
      } else if (totalCount <= 5 * magnitude) {
        max = 5 * magnitude;
      } else {
        max = 10 * magnitude;
      }

      steps = max / 4;
    }

    return {
      min: 0,
      max: max,
      steps: steps,
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        min: getChartConfig().min,
        max: getChartConfig().max,
        ticks: {
          stepSize: getChartConfig().steps,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const curveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 40,
        hoverRadius: 5,
      },
      line: {
        borderWidth: 2,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return context.parsed.y;
          },
        },
      },
    },
  };

  if (isLoading) {
    return <SkeletonLoaderOrder />;
  }

  return (
    <section className="w-full">
      <article className="flex md:gap-6 gap-3 lg:flex-row flex-col">
        <Card shadow="sm" className="lg:w-[70%] w-full rounded-xl">
          <div className="flex justify-between items-center flex-wrap border-b border-primaryGrey p-3">
            <span className="font-[600]">Overview</span>
            {selectedValue === "Custom date" && (
              <p className="text-default-500 text-sm">
                {value.start &&
                  moment(formatDateTimeForPayload3(value?.start)).format(
                    "MMMM Do YYYY"
                  )}
                {" - "}
                {value.end &&
                  moment(formatDateTimeForPayload3(value?.end)).format(
                    "MMMM Do YYYY"
                  )}
              </p>
            )}
            <Dropdown isDisabled={isLoading}>
              <DropdownTrigger>
                <Button
                  variant="light"
                  endContent={<MdKeyboardArrowDown />}
                  className="font-[600] capitalize text-black"
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
          <div className="p-3 ">
            {response?.orderDetails.orderPartitions.length === 0 ||
            response === undefined ? (
              <EmptyOverview
                image={NoOrder}
                title="active orders"
                buttonText="Place order"
                href="/dashboard/orders"
              />
            ) : (
              <>
                <div className="flex gap-12 flex-wrap">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-[500] text-[#4A4C4F]">
                      Total orders
                    </span>
                    <span className="flex gap-2">
                      <span className="text-[24px] font-[600]">
                        {response?.orderDetails.totalOrders}
                      </span>
                      <span
                        className={` ${
                          parseInt(response?.orderDetails.percentageChange) <= 0
                            ? `text-danger-500`
                            : `text-success-500`
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(response?.orderDetails.percentageChange) <=
                              0 && "rotate-180"
                          }`}
                        />{" "}
                        <span>{response?.orderDetails.percentageChange}%</span>
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[13px] flex items-center gap-1 font-[500] text-[#4A4C4F]">
                      <div className="h-2 w-2 rounded-full bg-primaryColor" />
                      <span> Processed orders</span>
                    </div>
                    <span className="text-[24px] font-[600]">
                      {response?.orderDetails.processedOrder}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[13px] flex  items-center gap-1 font-[500] text-[#4A4C4F]">
                      <div className="h-2 w-2 rounded-full bg-success-800" />
                      <span>Pending orders</span>
                    </div>
                    <span className="text-[24px] font-[600]">
                      {response?.orderDetails.pendingOrders}
                    </span>
                  </div>
                </div>
                <Divider className="my-3 bg-primaryGrey" />
                <div className="w-full h-[200px]">
                  <Bar data={barChartData} options={barOptions} />
                </div>
              </>
            )}
          </div>
        </Card>
        <Card
          shadow="sm"
          className="flex-grow border h-auto bg-gradient-to-r text-white from-[#9747FF] to-[#421CAC] border-primaryGrey rounded-xl"
        >
          <div>
            <div className="p-4">
              <h2 className="font-medium mb-2">Total amount processed</h2>
              <h1 className="text-2xl font-[600] my-[10px]">
                {formatPrice(
                  response?.paymentDetails.totalAmountProcessed || 0
                )}
              </h1>
              <div
                className={`text-sm ${
                  response?.paymentDetails.percentageChange <= 0
                    ? "text-danger-300"
                    : "text-success-300"
                }  font-[500] flex items-center`}
              >
                <BsArrowUpShort
                  className={`${
                    response?.paymentDetails.percentageChange <= 0 &&
                    "rotate-180"
                  } text-[20px]`}
                />
                <p>
                  {response?.paymentDetails.percentageChange || 0}% since last
                  month
                </p>
              </div>
            </div>

            {response === undefined ||
            response?.paymentDetails.paymentPartitions.length === 0 ? (
              ""
            ) : (
              <div className=" h-[100px] w-full absolute bottom-0 right-0">
                <Line data={curveData} options={curveOptions} />
              </div>
            )}
          </div>
        </Card>
      </article>
    </section>
  );
};

export default OrdersOverview;