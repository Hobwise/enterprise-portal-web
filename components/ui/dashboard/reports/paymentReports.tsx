import { Card, CardBody, Divider } from "@nextui-org/react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice, saveJsonItemToLocalStorage } from "@/lib/utils";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { BsArrowUpShort } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import {
  DeclinedReportIcon,
  ClosedReportIcon,
  AcceptedReportIcon,
} from "@/public/assets/svg";
import Star from "../../../../public/assets/icons/star.png";
import paymentIllustration from "../../../../public/assets/images/paymentIllustration.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

const ReportDetails = ({ report }: any) => {
  const data = {
    labels: report?.paymentPartitions.map((item) => item.partitionName),
    datasets: [
      {
        fill: true,
        data: report?.paymentPartitions.map((item) => item.count),
        borderColor: "rgb(136, 132, 216)",
        backgroundColor: "rgba(136, 132, 216, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#888",
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 0,
        max:
          report &&
          Math.max(...report?.paymentPartitions.map((item) => item.count)) + 1,
        ticks: {
          stepSize: 1,
          color: "#888",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };
  const reportData = [
    {
      icon: <DeclinedReportIcon width={20} height={20} />,
      title: "PENDING PAYMENT",
      desc: formatPrice(report?.pendingAmount || 0, "NGN"),
    },
    {
      icon: <AcceptedReportIcon width={20} height={20} />,
      title: "CONFIRMED PAYMENT",
      desc: formatPrice(report?.confirmedAmount || 0, "NGN"),
    },
  ];

  const router = useRouter();

  const handleActivityReport = (
    reportType: number,
    reportName: string,
    route: string
  ) => {
    router.push(`/dashboard/reports/${route}`);
    saveJsonItemToLocalStorage("reportFilter", {
      reportType: reportType,
      reportName: reportName,
      route: route,
    });
  };

  return (
    <div className=" flex lg:flex-row flex-col gap-4 mb-4">
      <div className="lg:w-[77%] w-full">
        <div className="flex w-full gap-4 mb-4">
          {reportData.map((item, index) => (
            <Card className="bg-[#EBE8F9] flex-grow">
              <CardBody key={index} className="space-y-2 p-4">
                {item.icon}
                <p className="text-xs text-gray-500">{item.title}</p>
                <p className=" font-bold">{item.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mb-4 h-64 bg-[#F5F5F5]">
          <CardBody>
            <Line data={data} options={options} />
          </CardBody>
        </Card>

        <div>
          <h3 className=" font-semibold mb-2">Available reports</h3>
          <Divider />

          <div className="h-[180px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            {report?.availableReport.map((item: any) => (
              <div
                onClick={() =>
                  handleActivityReport(
                    item.reportType,
                    item.reportName,
                    "payment"
                  )
                }
                key={item}
                className="cursor-pointer hover:text-gray-700 hover:bg-primaryGrey transition-all duration-300 "
              >
                <div className="flex justify-between items-center p-3">
                  <p className=" text-sm">{item.reportName}</p>
                  <IoIosArrowForward className="text-grey600" />
                </div>
                <Divider className="bg-primaryGrey" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-full flex-grow">
        <Card className="border  bg-gradient-to-r text-white from-[#9747FF] to-[#421CAC] border-primaryGrey rounded-xl mb-4 h-[247px]">
          <div className="absolute bottom-0  right-3">
            <Image
              className={"bg-cover rounded-lg "}
              width={100}
              height={100}
              src={paymentIllustration}
              alt="menu"
            />
          </div>
          <div>
            <div className="p-4">
              <h2 className="font-medium text-sm">TOTAL PAYMENT </h2>
              <h1 className="text-xl font-[500] my-[5px]">
                {formatPrice(report?.totalAmount || 0, "NGN")}
              </h1>
              <div
                className={`text-xs ${
                  Number(report?.percentageChange) >= 50
                    ? "text-success-300"
                    : "text-danger-500"
                }  font-[500] flex items-center`}
              >
                <BsArrowUpShort
                  className={` text-[20px] ${
                    report?.percentageChange < 50 && "rotate-180"
                  }`}
                />
                <p>{report?.percentageChange}%</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="bg-[#FDF5E1] lg:h-[348px] h-full">
          <CardBody className=" p-4">
            <div className="mb-4">
              <Image src={Star} alt="star" />
            </div>

            <p className="font-[500] text-sm">Day with highest payment</p>
            <p className="text-[22px] font-semibold">
              {formatPrice(report?.dayWithHighestPayment?.amount || 0, "NGN")}
            </p>
            <p className="text-sm">
              {" "}
              {report?.dayWithHighestPayment?.dateTime
                ? moment(report?.dayWithHighestPayment?.dateTime).format("ll")
                : ""}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
export default ReportDetails;
