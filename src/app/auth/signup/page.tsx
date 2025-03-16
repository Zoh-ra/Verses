import SignUpForm from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Inscription | Verses',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Verses</h1>
      <SignUpForm />
    </div>
  );
}
