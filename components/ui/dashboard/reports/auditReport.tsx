import { Card, CardBody, Divider } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveJsonItemToLocalStorage } from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import {
  AcceptedReportIcon,
  DeclinedReportIcon,
} from "@/public/assets/svg";
import Star from "../../../../public/assets/icons/star.png";
import auditIllustration from "../../../../public/assets/images/auditlogIllustration.png";

const ReportDetails = ({ report }: any) => {
  const reportData = [
    {
      icon: <AcceptedReportIcon width={20} height={20} />,
      title: "USERS",
      desc: report?.totalUsersCount,
    },
    {
      icon: <DeclinedReportIcon width={20} height={20} />,
      title: "ACTIVITIES",
      desc: report?.totalActivitiesCount,
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

        <div>
          <h3 className=" font-semibold mb-2">Available Audit logs</h3>
          <Divider />

          <div>
            {report?.availableReport.map((item: any) => (
              <div
                onClick={() =>
                  handleActivityReport(
                    item.reportType,
                    item.reportName,
                    "audit-logs"
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
              width={150}
              height={150}
              src={auditIllustration}
              alt="menu"
            />
          </div>
          <div>
            <div className="p-4">
              <h2 className="font-medium text-sm">MOST ACTIVE USER</h2>
              <h1 className="text-xl font-[500] mt-5">
                {report?.mostActiveUser?.name}
              </h1>
              <p className="text-xs text-primaryGrey">
                {report?.mostActiveUser?.emailAddress}
              </p>
            </div>
          </div>
        </Card>
        {/* <Card className="bg-[#FDF5E1] lg:h-[348px] h-full">
          <CardBody className=" p-4">
            <div className="mb-4">
              <Image src={Star} alt="star" />
            </div>

            <p className="font-[500] text-sm">MOST COMMON ACTIVITY</p>
            <p className="text-[22px] font-semibold">
              {report?.mostActiveUser?.activityCount}
            </p>
          </CardBody>
        </Card> */}
      </div>
    </div>
  );
};
export default ReportDetails;
