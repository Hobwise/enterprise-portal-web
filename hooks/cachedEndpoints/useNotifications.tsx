import { getNotification } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

export interface Event {
  message: string;
  eventType: string;
  user: string;
  isRead: boolean;
  cooperateID: string;
  businessID: string;
  id: string;
}

const useNotification = (page: number, pageSize: number) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchNotification = async () => {
    const responseData = await getNotification(
      business[0]?.businessId,
      page,
      pageSize
    );
    return responseData?.data.data as {
      notifications: Event[];
      totalCount: number;
      pageSize: number;
      currentPage: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ['notification', page, pageSize],
    fetchNotification,
    {
      refetchInterval: 60000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useNotification;



// const connection = new signalR.HubConnectionBuilder()
// .withUrl("https://sandbox-api.hobwise.com/notificationHub", {
//   accessTokenFactory: () => jwtToken
// })
// .configureLogging(signalR.LogLevel.Information)
// .build();

// connection.on("ReceiveNotification", data => {
//   console.log("data", data);
// document.getElementById("output").innerHTML += `<p><strong>New Notification:</strong> ${data.notification.message}</p>`;
// });

// connection.start()
// .then(() => {
//   console.log("SignalR connected.");
//   document.getElementById("output").innerHTML += `<p>Connected to SignalR</p>`;
// })
// .catch(err => {
//   console.error(err);
//   document.getElementById("output").innerHTML += `<p style="color:red;">Connection failed: ${err}</p>`;
// });