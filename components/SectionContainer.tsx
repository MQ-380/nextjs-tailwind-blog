interface Props {
  children: React.ReactNode;
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-7xl xl:px-0">
      {children}
    </section>
  );
}
