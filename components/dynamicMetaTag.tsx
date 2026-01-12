'use client';
import { companyInfo } from '@/lib/companyInfo';
import useNotifyCount from '@/hooks/cachedEndpoints/useNotificationCount';
import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

interface Props {
  route?: string;
  description?: string;
}

export default function DynamicMetaTag({
  route = 'Dashboard',
  description = 'Streamline your business processes',
}: Props) {
  const [unreadNotCount, setUnreadNotCount] = useState(0);
  const { data: unreadCount = 0 } = useNotifyCount();

  // SignalR connection for real-time notifications
  useEffect(() => {
    const userInfoString = localStorage.getItem('userInformation');
    if (!userInfoString) {
      return;
    }

    const userInfo = JSON.parse(userInfoString);
    if (!userInfo.token) {
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://sandbox-api.hobwise.com/notificationHub", {
        accessTokenFactory: () => userInfo.token
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("ReceiveNotification", data => {
      if (data && typeof data.unreadCount !== 'undefined') {
        setUnreadNotCount(data.unreadCount);
      }
    });

    connection.start()
      .catch(err => {
        console.error('SignalR connection error:', err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  // Calculate the total notification count
  const totalNotificationCount = unreadNotCount !== 0 ? unreadNotCount : (unreadCount > 0 ? unreadCount : 0);
  
  // Format title with notification count if present
  const title = totalNotificationCount > 0 
    ? `(${totalNotificationCount}) ${companyInfo.name} | ${route}`
    : `${companyInfo.name} | ${route}`;

  return (
    <>
      <title>{title}</title>
      <meta name='description' content={description} />
    </>
  );
}
