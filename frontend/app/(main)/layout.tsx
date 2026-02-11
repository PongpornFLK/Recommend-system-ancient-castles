import Navbars from '../components/navbars';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbars />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </>
  );
}
