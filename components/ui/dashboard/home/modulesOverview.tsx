'use client';

import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { formatPrice } from '@/lib/utils';
import { Card } from '@nextui-org/react';
import moment from 'moment';
import Image from "next/image";
import { IoArrowUpCircleOutline } from "react-icons/io5";
import { default as noImage } from "../../../../public/assets/images/no-image.svg";
import NoOrder from "../../../../public/assets/images/no-order.png";
import NoPayment from "../../../../public/assets/images/no-payment.png";
import NoQR from "../../../../public/assets/images/no-qr.png";
import EmptyOverview from "./emptyOverview";
import SkeletonLoaderModules from "./skeletonLoadingModules";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ModulesOverview = ({ response, isLoading }: any) => {
  const { userRolePermissions, role } = usePermission();

  const getPaymentMethodName = (method) => {
    switch (method) {
      case "Pos":
        return "PoS";
      case "BankTransfer":
        return "Transfer";
      case "CheckOut":
        return "Others";
      default:
        return method;
    }
  };

  const paymentData = response?.paymentDetails?.paymentMethodCounts
    ? {
        labels: response.paymentDetails.paymentMethodCounts.map((item) =>
          getPaymentMethodName(item.paymentMethod)
        ),
        datasets: [
          {
            data: response.paymentDetails.paymentMethodCounts.map(
              (item) => item.count
            ),
            backgroundColor: ["#8A2BE2", "#FF1493", "#1E90FF", "#32CD32"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      }
    : null;

  const chartOptions = {
    cutout: "75%",
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          color: "#4A4C4F",
          boxWidth: 10,
          boxHeight: 8,
          padding: 10,
          font: {
            size: 12,
            weight: 500,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#333",
        padding: 10,
        caretSize: 6,
        displayColors: true,
        boxWidth: 10,
        borderColor: "#e0e0e0",
        borderWidth: 1,
      },
    },
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  if (isLoading) {
    return <SkeletonLoaderModules />;
  }

  return (
    <section className="w-full">
      <article className="flex md:gap-6 gap-3 lg:flex-row flex-col">
        <div className="lg:w-[70%] flex flex-col lg:flex-row lg:gap-5 gap-3 w-full">
          <div className="flex lg:w-[70%] w-full flex-col lg:gap-5 gap-3">
            <div className="flex xl:flex-row flex-col lg:gap-5 gap-3">
              <Card
                shadow="sm"
                className=" rounded-xl xl:w-[300px] w-full flex-grow"
              >
                <div className="flex justify-between items-center border-b border-primaryGrey p-3">
                  <span className="font-[600]">Payments</span>
                </div>
                <div className="p-2">
                  {response?.paymentDetails?.paymentMethodCounts.some(
                    (item) => item.count !== 0
                  ) ? (
                    <div className="w-full h-[150px] mx-auto relative p-6 flex items-center justify-center">
                      <Doughnut data={paymentData} options={chartOptions} />
                    </div>
                  ) : (
                    <EmptyOverview image={NoPayment} title="payments" />
                  )}
                </div>
              </Card>
              <Card shadow="sm" className=" flex-grow rounded-xl">
                <div className="flex justify-between items-center border-b border-primaryGrey p-3">
                  <span className="font-[600]">Bookings</span>
                </div>
                {response &&
                Object.values(response?.bookingDetails).some(
                  (value) => value !== 0
                ) ? (
                  <div className="p-6 flex h-[150px] items-center space-x-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-[500] space-y-1 text-[#4A4C4F]">
                        Total
                      </span>
                      <span className="text-[24px] font-[600]">
                        {response?.bookingDetails.total}
                      </span>
                      <span
                        className={`${
                          parseInt(
                            response?.bookingDetails.toatlPercentageChange
                          ) <= 0
                            ? "text-danger-500"
                            : "text-success-500"
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(
                              response?.bookingDetails.toatlPercentageChange
                            ) <= 0 && "rotate-180"
                          }`}
                        />{" "}
                        <span>
                          {" "}
                          {response?.bookingDetails.toatlPercentageChange}%
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-[500] space-y-1 text-[#4A4C4F]">
                        Accepted
                      </span>
                      <span className="text-[24px] font-[600]">
                        {response?.bookingDetails.accepted}
                      </span>
                      <span
                        className={`${
                          parseInt(
                            response?.bookingDetails.acceptedPercentageChange
                          ) <= 0
                            ? "text-danger-500"
                            : "text-success-500"
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(
                              response?.bookingDetails.acceptedPercentageChange
                            ) <= 0 && "rotate-180"
                          }`}
                        />{" "}
                        <span>
                          {" "}
                          {response?.bookingDetails.acceptedPercentageChange}%
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-[500] text-[#4A4C4F]">
                        Closed
                      </span>
                      <span className="text-[24px] font-[600]">
                        {response?.bookingDetails.closed}
                      </span>
                      <span
                        className={`${
                          parseInt(
                            response?.bookingDetails.closedPercentageChange
                          ) <= 0
                            ? `text-danger-500`
                            : `text-success-500`
                        } flex items-center font-[400]`}
                      >
                        <IoArrowUpCircleOutline
                          className={`${
                            parseInt(
                              response?.bookingDetails.closedPercentageChange
                            ) <= 0 && "rotate-180"
                          }`}
                        />{" "}
                        <span>
                          {response?.bookingDetails.closedPercentageChange}%
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <EmptyOverview title="active bookings" />
                )}
              </Card>
            </div>
            <Card shadow="sm" className=" flex-grow  rounded-xl">
              <div className="flex justify-between items-center border-b border-primaryGrey p-3">
                <span className="font-[600]">Campaigns</span>
              </div>
              {response?.campaigns.length === 0 || response === undefined ? (
                <EmptyOverview
                  image={NoOrder}
                  title="active campaigns"
                  buttonText={
                    role === 0 ||
                    userRolePermissions?.canCreateCampaign === true
                      ? "Start a campaign"
                      : ""
                  }
                  href="/dashboard/campaigns/create-campaign"
                />
              ) : (
                <div className="p-4 space-y-3 overflow-scroll h-[170px]">
                  {response?.campaigns.map((item, index) => (
                    <div key={index} className="flex gap-4 ">
                      <Image
                        className="h-[60px] w-[60px] bg-cover rounded-lg"
                        width={60}
                        height={60}
                        alt="menu"
                        aria-label="menu"
                        src={
                          item.image
                            ? `data:image/jpeg;base64,${item.image}`
                            : noImage
                        }
                      />

                      <div className="flex lg:flex-row justify-between lg:items-center items-start w-full flex-col lg:gap-4 gap-0">
                        <div className=" gap-1 grid place-content-center">
                          <p className="font-bold text-sm">
                            {item.campaignName}
                          </p>
                          <p className=" text-sm">{item.campaignDescription}</p>
                        </div>
                        <div className=" gap-1 ">
                          <p className="font-bold text-sm">Start</p>
                          <p className=" text-sm">
                            {moment(item.startDateTime).format("MMM DD")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          <Card shadow="sm" className="flex-grow  rounded-xl">
            <div className="flex justify-between items-center border-b border-primaryGrey p-3">
              <span className="font-[600]">Best sellers</span>
            </div>
            {response?.bestSellers.length === 0 || response === undefined ? (
              <EmptyOverview
                title="active menus"
                buttonText={
                  role === 0 || userRolePermissions?.canCreateMenu === true
                    ? "Create menu"
                    : ""
                }
                href="/dashboard/menu"
              />
            ) : (
              <div className="p-3 space-y-4 overflow-scroll lg:h-[400px] h-[200px]">
                {response?.bestSellers.map((item: any) => (
                  <div key={item.itemID} className="flex gap-4 justify-between">
                    <div className=" gap-1 grid place-content-center">
                      <p className="font-bold text-sm">{item.menu}</p>
                      <p className=" text-sm">{item.itemName}</p>
                      <p className="font-bold text-sm">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <Image
                      className="h-[60px]  w-[60px] bg-cover rounded-lg"
                      width={60}
                      height={60}
                      alt="menu"
                      aria-label="menu"
                      src={
                        item.image
                          ? `data:image/jpeg;base64,${item.image}`
                          : noImage
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        <Card shadow="sm" className=" flex-grow  p-3 rounded-xl">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-success-800" />
            <span className="font-[600]">Quick Response</span>
          </div>
          {response?.quickResponseDetails.quickResponseRecord.length > 0 ? (
            <div className="">
              <div className="w-full   relative overflow-scroll h-[400px]">
                <h1 className="text-[28px] font-bold text-[#4A4C4F] mb-4">
                  {response?.quickResponseDetails.totalQuickResponse}
                </h1>
                {response?.quickResponseDetails.quickResponseRecord.map(
                  (item, index) => (
                    <div key={index} className=" mb-2">
                      <span className="flex-1 text-sm">
                        {item.quickResponseName}
                      </span>

                      <div
                        className="h-2 max-w-full rounded-r-full bg-[#5F35D2]"
                        style={{ width: `${item.count}%` }}
                      ></div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <EmptyOverview
              image={NoQR}
              title="active Quick response"
              buttonText="Create quick response"
              href="/dashboard/quick-response/create-qr"
            />
          )}
        </Card>
      </article>
    </section>
  );
};

export default ModulesOverview;