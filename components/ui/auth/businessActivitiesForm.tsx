"use client";
import { CustomButton } from "@/components/customButton";
import { getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import { Spacer } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBriefcase, FaClipboardList, FaUtensils } from "react-icons/fa";

interface ActivityOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  allowedAssignments: string[];
}

const BusinessActivitiesForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [availableActivities, setAvailableActivities] = useState<ActivityOption[]>([]);

  // Define all possible activities
  const allActivities: ActivityOption[] = [
    {
      id: "pos",
      title: "Point of Sales",
      description: "Access POS system for order processing",
      icon: <FaUtensils className="text-2xl" />,
      route: "/pos",
      allowedAssignments: ["POS Operator"],
    },
    {
      id: "orders",
      title: "Order Management",
      description: "Manage and track customer orders",
      icon: <FaClipboardList className="text-2xl" />,
      route: "/dashboard/orders",
      allowedAssignments: ["Order Manager", "Staff"],
    },
    {
      id: "general",
      title: "General Dashboard",
      description: "Access general business dashboard",
      icon: <FaBriefcase className="text-2xl" />,
      route: "/dashboard",
      allowedAssignments: ["Staff", "General"],
    },
  ];

  useEffect(() => {
    // Get user information from local storage
    const userInformation = getJsonItemFromLocalStorage("userInformation");

    if (!userInformation) {
      notify({
        title: "Error",
        text: "User information not found. Please login again.",
        type: "error",
      });
      router.push("/auth/login");
      return;
    }

    // Filter activities based on user's primaryAssignment
    const primaryAssignment = userInformation.primaryAssignment || "";
    const assignedCategoryId = userInformation.assignedCategoryId || "";

    const filtered = allActivities.filter((activity) => {
      // Check if user's primary assignment is in the allowed assignments
      return activity.allowedAssignments.some((assignment) =>
        primaryAssignment.includes(assignment)
      );
    });

    // If no specific activities found, show general dashboard option
    if (filtered.length === 0) {
      setAvailableActivities([allActivities.find(a => a.id === "general")!]);
    } else {
      setAvailableActivities(filtered);
    }

    // Auto-select if only one option available
    if (filtered.length === 1) {
      setSelectedActivity(filtered[0].id);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivity) {
      notify({
        title: "Selection Required",
        text: "Please select a work area to continue",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    const selected = availableActivities.find((a) => a.id === selectedActivity);
    if (selected) {
      router.push(selected.route);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {availableActivities.map((activity) => (
          <div
            key={activity.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedActivity === activity.id
                ? "border-primaryColor bg-primaryColor/5"
                : "border-gray-200 hover:border-primaryColor/50"
            }`}
            onClick={() => setSelectedActivity(activity.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                selectedActivity === activity.id
                  ? "bg-primaryColor text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="activity"
                  value={activity.id}
                  checked={selectedActivity === activity.id}
                  onChange={() => setSelectedActivity(activity.id)}
                  className="w-5 h-5 text-primaryColor focus:ring-primaryColor"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Spacer y={6} />

      <CustomButton
        loading={loading}
        disabled={loading || !selectedActivity}
        type="submit"
      >
        {loading ? "Loading..." : "Continue"}
      </CustomButton>
    </form>
  );
};

export default BusinessActivitiesForm;
