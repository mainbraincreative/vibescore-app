import VibeForm from '../../components/VibeForm';
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">VibeScore</h1>
      <VibeForm />
    </main>
  );
}