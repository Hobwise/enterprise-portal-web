'use client';
import React, { useState } from 'react';
import ForgetPasswordForm from './forgetPasswordForm';
import ChangePasswordForm from './changePassword';

const EntryPoint = () => {
  const [screen, setScreen] = useState(1);
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
