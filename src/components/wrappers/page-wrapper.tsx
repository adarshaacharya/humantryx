export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between bg-white pt-[4rem] dark:bg-black">
        <div className="pointer-events-none absolute inset-0 z-[-99] flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        {children}
      </main>
    </>
  );
}
