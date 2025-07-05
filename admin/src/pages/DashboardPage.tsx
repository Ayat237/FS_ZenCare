import { FC, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { doctorService } from "@/services/doctors";
import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatNumber } from "@/utils/helpers";

const StatCard: FC<{
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}> = ({ title, value, icon, trend }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-1">
            <TrendingUp className="inline w-3 h-3 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { data: pendingDoctors, isLoading } = useQuery({
    queryKey: ["pending-doctors"],
    queryFn: doctorService.getPendingDoctors,
  });

  const stats = [
    {
      title: "Total Doctors",
      value: formatNumber(245),
      icon: <Users className="h-6 w-6 text-primary-600" />,
      trend: "+12% from last month",
    },
    {
      title: "Pending Verifications",
      value: pendingDoctors?.data.doctors?.length || 0,
      icon: <Clock className="h-6 w-6 text-warning-500" />,
    },
    {
      title: "Verified Today",
      value: formatNumber(8),
      icon: <UserCheck className="h-6 w-6 text-success-500" />,
      trend: "+3 from yesterday",
    },
    {
      title: "Active Users",
      value: formatNumber(1024),
      icon: <Users className="h-6 w-6 text-info-500" />,
      trend: "+18% this week",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      message: "Dr. Ahmed Hassan submitted verification documents",
      time: "2 minutes ago",
      type: "pending",
    },
    {
      id: 2,
      message: "Dr. Sarah Johnson was verified and approved",
      time: "15 minutes ago",
      type: "approved",
    },
    {
      id: 3,
      message: "Dr. Michael Brown's application was rejected",
      time: "1 hour ago",
      type: "rejected",
    },
    {
      id: 4,
      message: "Dr. Emily Davis submitted new certification",
      time: "2 hours ago",
      type: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to ZenCare Admin Panel</p>
        </div>
        <Button>Generate Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activities" subtitle="Latest system activities">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "approved"
                      ? "bg-green-500"
                      : activity.type === "rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm">
              View All Activities
            </Button>
          </div>
        </Card>

        <Card title="Quick Actions" subtitle="Common administrative tasks">
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="secondary">
              <UserCheck className="mr-2 h-4 w-4" />
              Review Pending Doctors (
              {pendingDoctors?.data.doctors?.length || 0})
            </Button>
            <Button className="w-full justify-start" variant="secondary">
              <Users className="mr-2 h-4 w-4" />
              Manage User Accounts
            </Button>
            <Button className="w-full justify-start" variant="secondary">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics Report
            </Button>
          </div>
        </Card>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
