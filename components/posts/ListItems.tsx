"use client";

import { RefObject, useEffect, useRef, useState } from "react";

export const Ol = ({ children }: { children?: unknown }) => {
  const itemRef = useRef(null);
  const level = useTagLevel(itemRef);
  return (
    <ol className={`list-decimal list-inside ml-${level * 4}`}>
      {children as React.ReactNode}
    </ol>
  );
};

export const Ul = ({ children }: { children?: unknown }) => {
  const itemRef = useRef(null);
  const level = useTagLevel(itemRef);
  return (
    <ul className={`list-[circle] list-inside ml-${level * 4}`} ref={itemRef}>
      {children as React.ReactNode}
    </ul>
  );
};

const useTagLevel = (itemRef: RefObject<HTMLLIElement | null>) => {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    function getListNestingLevel(element: HTMLElement) {
      let level = 0;
      let parent = element.parentElement;

      while (parent) {
        if (parent.tagName === "UL" || parent.tagName === "OL") {
          level++;
        }
        parent = parent.parentElement;
      }

      return level;
    }

    if (itemRef.current) {
      setLevel(getListNestingLevel(itemRef.current));
    }
  }, [itemRef]);

  return level;
};
