'use client';

import ForgotPassword from '@/components/ForgotPassword';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return <ForgotPassword onBack={handleBack} />;
}
