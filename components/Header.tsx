import Image from 'next/image';

import Logo from '@/data/avatar.jpeg';
import { headerNavLinks } from '@/data/headerNavLinks';
import siteMetadata from '@/data/siteMetadata';

import Link from './Link';
import MobileNav from './MobileNav';
import ThemeSwitch from './ThemeSwitch';

export default function Header() {
  const headerClass =
    'flex item-center w-full bg-white dark:bg-gray-950 justify-between py-10 sticky top-0 z-50';
  const { headerTitle } = siteMetadata;

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={headerTitle}>
        <div className="flex items-end justify-between">
          <div className="mr-3">
            <Image src={Logo} alt="logo" width={24} height={24} />
          </div>
          <div className="hidden h-6 text-2xl font-semibold sm:block">
            {siteMetadata.headerTitle}
          </div>
        </div>
      </Link>

      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        <div className="no-scrollbar hidden items-center space-x-6 overflow-x-auto pr-2 sm:flex sm:space-x-6">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="hover:text-primary-500 dark:hover:text-primary-400 mx-2 my-1 block font-medium text-gray-900 dark:text-gray-100"
            >
              {link.title}
            </Link>
          ))}
        </div>
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  );
}
