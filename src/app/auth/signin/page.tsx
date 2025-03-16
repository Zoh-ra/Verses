import SignInForm from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Connexion | Verses',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Verses</h1>
      <SignInForm />
    </div>
  );
}
