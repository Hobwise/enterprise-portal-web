import Link from 'next/link';

export const metadata = {
  title: 'Welcome to Hobink',
  description: 'Streamline your business processes',
};

const linkStyle =
  'rounded-lg bg-primaryColor text-white font-bold text-md p-4 w-36 text-center';
export default function Login() {
  return (
    <main className='flex justify-center items-center h-screen gap-3 '>
      <Link className={linkStyle} href='/auth/login'>
        Login
      </Link>
      <Link className={linkStyle} href='/auth/signup'>
        Signup
      </Link>
    </main>
  );
}
