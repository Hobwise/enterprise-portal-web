'use client';
import { changePassword } from '@/app/api/controllers/auth';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { notify } from '@/lib/utils';
import { Spacer } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ChangePasswordForm = ({ email }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [passwordFormData, setChangePasswordFormData] = useState({
    password: '',
    confirmPassword: '',
    oldPassword: '',
  });

  const handleInputChange = (e) => {
    setResponse(null);
    const { name, value } = e.target;
    setChangePasswordFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const submitFormData = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);
    const payload = {
      email: email,
      oldPassword: passwordFormData.oldPassword,
      newPassword: passwordFormData.password,
      confirmPassword: passwordFormData.confirmPassword,
    };
    const data = await changePassword(payload);

    setLoading(false);
    setResponse(data);

    if (data?.data?.isSuccessful) {
      toast.success('Your password has been changed, Proceed to login');
      router.push('/auth/login');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  return (
    <>
      <h2 className='text-[28px] font-bold'>Enter password</h2>
      <p className='text-sm  text-tomato mb-8'>
        Enter the password that was sent to{' '}
        <span className='font-bold'>{email}</span>
      </p>

      <Spacer y={8} />
      <form onSubmit={submitFormData} autoComplete='off'>
        <CustomInput
          errorMessage={response?.errors?.oldPassword?.[0]}
          value={passwordFormData?.oldPassword}
          onChange={handleInputChange}
          name='oldPassword'
          type='password'
          label='Enter Password'
          placeholder='Enter password'
          // isRequired={true}
        />
        <Spacer y={6} />
        <CustomInput
          errorMessage={response?.errors?.newPassword?.[0]}
          value={passwordFormData?.password}
          onChange={handleInputChange}
          type='password'
          name='password'
          label='Enter New Password'
          placeholder='Enter password'
          // isRequired={true}
        />
        <Spacer y={6} />
        <CustomInput
          errorMessage={response?.errors?.confirmPassword?.[0]}
          value={passwordFormData?.confirmPassword}
          onChange={handleInputChange}
          type='password'
          name='confirmPassword'
          label='Confirm New Password'
          placeholder='Confirm password'
          // isRequired={true}
        />
        <Spacer y={8} />
        <CustomButton loading={loading} disabled={loading} type='submit'>
          Save new password
        </CustomButton>
      </form>
    </>
  );
};

export default ChangePasswordForm;
