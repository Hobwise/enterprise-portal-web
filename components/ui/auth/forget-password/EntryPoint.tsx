'use client';
import { useState } from 'react';
import ChangePasswordForm from './changePassword';
import ForgetPasswordForm from './forgetPasswordForm';

const EntryPoint = () => {
  const [screen, setScreen] = useState<number>(1);
  const [email, setEmail] = useState('');
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

      {screen === 2 && <ChangePasswordForm email={email} />}
    </>
  );
};

export default EntryPoint;
