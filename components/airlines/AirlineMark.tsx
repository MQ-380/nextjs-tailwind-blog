import Image from 'next/image';

interface Props {
  name: string;
  icon: string | null;
}

/**
 * 航司名左侧的小标记。
 * 有图标文件就用图标，没有就退回首字母方块——所以在还没配任何图标时
 * 版面也是完整的，不会留一排空位。
 */
export default function AirlineMark({ name, icon }: Props) {
  if (icon) {
    // 垫一层浅色底片：favicon 来源五花八门，有的是深色 logo 配透明底
    // （深色主题下几乎看不见），有的自带白色方块。统一垫底后两种都能正常显示，
    // 也让这一列看起来是一致的。
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white p-px ring-1 ring-gray-200 dark:ring-gray-700">
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          className="h-full w-full object-contain"
          unoptimized
        />
      </span>
    );
  }

  // 颜色按名字取模，同一家航司每次渲染都一样
  const palette = [
    'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300',
    'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const tone = palette[Math.abs(hash) % palette.length];

  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] font-mono text-[11px] font-medium ${tone}`}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
