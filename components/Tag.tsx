import Link from 'next/link';

import tagData from 'app/tag-data.json';
import { slug } from 'github-slugger';

interface Props {
  text: string;
}
const tagsInfo = tagData as Record<string, { count: number; id: string }>;

const Tag = ({ text }: Props) => {
  // 简单的字符串哈希函数
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  // 预定义一些柔和的颜色组合。
  // 深色模式下浅色底会变成一片高亮色块糊在近黑背景上，所以改用低透明度的同色底
  // 加浅色文字，保留区分度但不刺眼。
  const colorPairs = [
    { bg: 'bg-blue-100 dark:bg-blue-400/10', text: 'text-blue-800 dark:text-blue-300' },
    { bg: 'bg-green-100 dark:bg-green-400/10', text: 'text-green-800 dark:text-green-300' },
    { bg: 'bg-purple-100 dark:bg-purple-400/10', text: 'text-purple-800 dark:text-purple-300' },
    { bg: 'bg-pink-100 dark:bg-pink-400/10', text: 'text-pink-800 dark:text-pink-300' },
    { bg: 'bg-yellow-100 dark:bg-yellow-400/10', text: 'text-yellow-800 dark:text-yellow-300' },
    { bg: 'bg-red-100 dark:bg-red-400/10', text: 'text-red-800 dark:text-red-300' },
    { bg: 'bg-indigo-100 dark:bg-indigo-400/10', text: 'text-indigo-800 dark:text-indigo-300' },
    { bg: 'bg-orange-100 dark:bg-orange-400/10', text: 'text-orange-800 dark:text-orange-300' },
  ];

  // 根据tag文本选择固定的颜色
  const colorIndex = hashString(text) % colorPairs.length;
  const { bg, text: textColor } = colorPairs[colorIndex];

  return (
    <Link
      href={`/tags/${slug(tagsInfo[text.toLocaleLowerCase()]?.id)}`}
      className={`mr-3 rounded-full px-2 text-sm font-medium ${bg} ${textColor} transition-colors duration-200 hover:opacity-80`}
    >
      {text}
    </Link>
  );
};

export default Tag;
