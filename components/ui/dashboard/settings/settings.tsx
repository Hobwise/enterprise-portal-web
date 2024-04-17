'use client';
import React, { useState } from 'react';
import Profile from './profile';
import Password from './password';
import RolePrivileges from './rolePrivileges';

interface ListItemProps {
  title: string;
  screenNumber: number;
}

const li =
  'hover:bg-secondaryGrey text-[14px] font-[600] p-3 rounded-[4px] transition-all cursor-pointer';

const SettingsComponent: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<number>(1);

  const handleListItemClick = (screenNumber: number) => {
    setActiveScreen(screenNumber);
  };

  const listItems: ListItemProps[] = [
    { title: 'Profile', screenNumber: 1 },
    { title: 'Password', screenNumber: 2 },
    { title: 'Business settings', screenNumber: 3 },
    { title: 'Team', screenNumber: 4 },
    { title: 'Roles and Privileges', screenNumber: 5 },
  ];

  return (
    <>
      <article className='border max-h-[284px] border-secondaryGrey w-full xl:w-[284px] p-3 rounded-[8px]'>
        <ul className='flex flex-col gap-1'>
          {listItems.map((item) => (
            <li
              key={item.screenNumber}
              onClick={() => handleListItemClick(item.screenNumber)}
              className={`${li} ${
                activeScreen === item.screenNumber
                  ? 'bg-secondaryGrey text-black '
                  : 'text-[#98A2B3]'
              }`}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </article>
      <article className='border w-full border-secondaryGrey p-6 rounded-[8px]'>
        {activeScreen === 1 && <Profile />}
        {activeScreen === 2 && <Password />}
        {activeScreen === 5 && <RolePrivileges />}
      </article>
    </>
  );
};

export default SettingsComponent;
