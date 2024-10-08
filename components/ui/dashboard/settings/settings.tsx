'use client';
import { getFromLocalStorage, getJsonItemFromLocalStorage } from '@/lib/utils';
import React, { useState } from 'react';
import BusinessSettings from './business-settings/businessSettings';
import BusinessProfile from './businessProfile';
import Password from './password';
import Pricings from './pricings';
import Profile from './profile';
import Roles from './rolesAndPrivileges/roles';
import Teams from './teams/teams';

interface ListItemProps {
  title: string;
  screenNumber: number;
}

const li =
  'hover:bg-secondaryGrey text-[14px] font-[600] xl:p-3 px-4 py-2 xl:rounded-[4px] rounded-[6px] transition-all cursor-pointer';

const SettingsComponent: React.FC = () => {
  const businessSettingPrompt = getFromLocalStorage('businessSettingPrompt');
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  // const [activeScreen, setActiveScreen] = useState<number>(4);
  const [activeScreen, setActiveScreen] = useState<number>(
    businessSettingPrompt ? 4 : 1
  );

  const handleListItemClick = (screenNumber: number) => {
    setActiveScreen(screenNumber);
  };

  const { role } = userInformation;

  // const baseListItems: ListItemProps[] = [
  //   { title: 'Profile', screenNumber: 1 },
  //   { title: 'Password', screenNumber: 2 },
  //   { title: 'Business profile', screenNumber: 3 },
  //   { title: 'Business settings', screenNumber: 4 },
  //   { title: 'Team', screenNumber: 5 },
  //   { title: 'Roles and Privileges', screenNumber: 6 },
  //   { title: 'Pricings', screenNumber: 7 },
  // ];
  console.log(userInformation?.isOwner, 'userInformation?.isOwne');
  const getListItems = (): ListItemProps[] => {
    const baseListItems: ListItemProps[] = [
      { title: 'Profile', screenNumber: 1 },
      { title: 'Password', screenNumber: 2 },
      { title: 'Business profile', screenNumber: 3 },
      { title: 'Business settings', screenNumber: 4 },
      { title: 'Team', screenNumber: 5 },
      { title: 'Roles and Privileges', screenNumber: 6 },
    ];

    if (true) {
      baseListItems.push({ title: 'Pricings', screenNumber: 7 });
    }

    return baseListItems;
  };

  const listItems: ListItemProps[] = getListItems().filter(
    (item) =>
      !(
        role === 1 &&
        (item.title === 'Roles and Privileges' ||
          item.title === 'Business settings' ||
          item.title === 'Team' ||
          item.title === 'Password')
      )
  );

  return (
    <div className='flex xl:flex-row flex-col gap-3 w-full'>
      <article
        className={`border 
        inline-flex flex-col
          border-secondaryGrey w-full xl:w-[284px] p-3 rounded-[8px] h-fit`}
      >
        <ul className='flex xl:flex-col flex-row xl:gap-1 gap-3'>
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
      <article className='border min-h-[400px] w-full border-secondaryGrey p-6 rounded-[8px]'>
        {activeScreen === 1 && <Profile />}
        {activeScreen === 2 && <Password />}
        {activeScreen === 3 && (
          <BusinessProfile setActiveScreen={setActiveScreen} />
        )}

        {activeScreen === 4 && (
          <BusinessSettings setActiveScreen={setActiveScreen} />
        )}
        {activeScreen === 5 && <Teams setActiveScreen={setActiveScreen} />}
        {activeScreen === 6 && <Roles />}
        {activeScreen === 7 && <Pricings />}
      </article>
    </div>
  );
};

export default SettingsComponent;
