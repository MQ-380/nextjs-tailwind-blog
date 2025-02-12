'use client';

import { Fragment, useEffect, useState } from 'react';

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Radio,
  RadioGroup,
  Transition,
} from '@headlessui/react';
import { useTheme } from 'next-themes';

import { Moon, Sun, System } from '@/icons/iconsSvg';

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  return (
    <div className="mr-5 flex items-center">
      <Menu as="div" className="relative inline-block text-left">
        <div className="hover:text-primary-500 dark:hover:text-primary-400 flex items-center justify-center">
          <MenuButton aria-label="Theme switcher">
            {mounted ? resolvedTheme === Theme.DARK ? <Moon /> : <Sun /> : <System />}
          </MenuButton>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="ring-opacity-5 absolute right-0 z-50 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black focus:outline-none dark:bg-gray-800">
            <RadioGroup value={theme} onChange={setTheme}>
              <div className="p-1">
                {Object.values(Theme).map((value) => (
                  <Radio value={value} key={value}>
                    <ThemeChangeMenuItem
                      text={value}
                      Icon={
                        value === Theme.DARK ? (
                          <Moon />
                        ) : value === Theme.LIGHT ? (
                          <Sun />
                        ) : (
                          <System />
                        )
                      }
                    />
                  </Radio>
                ))}
              </div>
            </RadioGroup>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}

const ThemeChangeMenuItem = ({ text, Icon }: { text: Theme; Icon: React.ReactNode }) => (
  <MenuItem>
    {({ focus }) => (
      <button
        className={`${focus ? 'bg-pink-600 text-white' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
      >
        <div className="mr-2">{Icon}</div>
        {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
      </button>
    )}
  </MenuItem>
);
