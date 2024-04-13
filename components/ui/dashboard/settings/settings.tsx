'use client';
import React, { useState } from 'react';
import Profile from './profile';
import Password from './password';
import RolePrivileges from './rolePrivileges';

const li =
  'hover:bg-secondaryGrey text-[14px] font-[600]  p-3 rounded-[4px] transition-all cursor-pointer';

const SettingsComponent = () => {
  const [activeScreen, setActiveScreen] = useState(1);

  const handleListItemClick = (screenNumber) => {
    setActiveScreen(screenNumber);
  };
  return (
    <>
      <article className='border max-h-[284px] border-secondaryGrey w-full xl:w-[284px] p-3 rounded-[8px]'>
        <ul className='flex flex-col gap-1'>
          <li
            onClick={() => handleListItemClick(1)}
            className={`${li} ${
              activeScreen === 1
                ? 'bg-secondaryGrey text-black '
                : 'text-[#98A2B3]'
            }`}
          >
            Profile
          </li>
          <li
            onClick={() => handleListItemClick(2)}
            className={`${li} ${
              activeScreen === 2
                ? 'bg-secondaryGrey text-black'
                : 'text-[#98A2B3]'
            }`}
          >
            Password
          </li>
          <li
            onClick={() => handleListItemClick(3)}
            className={`${li} ${
              activeScreen === 3
                ? 'bg-secondaryGrey text-black'
                : 'text-[#98A2B3]'
            }`}
          >
            Business settings
          </li>
          <li
            onClick={() => handleListItemClick(4)}
            className={`${li} ${
              activeScreen === 4
                ? 'bg-secondaryGrey text-black'
                : 'text-[#98A2B3]'
            }`}
          >
            Team
          </li>
          <li
            onClick={() => handleListItemClick(5)}
            className={`${li} ${
              activeScreen === 5
                ? 'bg-secondaryGrey text-black'
                : 'text-[#98A2B3]'
            }`}
          >
            Roles and Privileges
          </li>
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