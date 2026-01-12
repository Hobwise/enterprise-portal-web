'use client';
import { useState } from 'react';
import ChangePasswordForm from './changePassword';
import ForgetPasswordForm from './forgetPasswordForm';

const EntryPoint = ({
  userEmail,
  screenNumber,
  isForced,
}: {
  userEmail?: string;
  screenNumber?: number;
  isForced?: boolean;
}) => {
  const [screen, setScreen] = useState<number>(screenNumber || 1);
  const [email, setEmail] = useState(userEmail || '');
  return (
    <>
      {screen === 1 && (
        <ForgetPasswordForm
          email={email}
          screen={screen}
          setEmail={setEmail}
          setScreen={setScreen}
        />
      )}
      {screen === 2 && <ChangePasswordForm email={email} isForced={isForced} />}
    </>
  );
};

export default EntryPoint;
