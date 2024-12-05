'use client';
import { getNews } from '@/app/api/controllers/landingPage';
import { cn, notify } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function LandingPageHeader() {
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<{ title: string; content: string }[]>([]);
  const [error, setError] = useState<string>('');

  const getAllNews = async (loading = true) => {
    setIsLoading(loading);
    const data = await getNews();
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      setNews([...data?.data?.data, { collapse: true }]);
    } else if (data?.data?.error) {
      setError(data?.data?.error);
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getAllNews();
  }, []);

  if (isLoading) return <div className="wrapper bg-primaryColor h-10"></div>;

  if (error) return null;

  return (
    <div className="wrapper bg-primaryColor">
      {news.map((each, index) => (
        <p className={`itemLeft font-satoshi font-light item${index}`} key={each.title + index}>
          {each.title}
        </p>
      ))}
    </div>
  );
}
