import Link from "next/link";
import { slug } from "github-slugger";
interface Props {
  text: string;
}

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

  // 预定义一些柔和的颜色组合
  const colorPairs = [
    { bg: "bg-blue-100", text: "text-blue-800" },
    { bg: "bg-green-100", text: "text-green-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
    { bg: "bg-pink-100", text: "text-pink-800" },
    { bg: "bg-yellow-100", text: "text-yellow-800" },
    { bg: "bg-red-100", text: "text-red-800" },
    { bg: "bg-indigo-100", text: "text-indigo-800" },
    { bg: "bg-orange-100", text: "text-orange-800" },
  ];

  // 根据tag文本选择固定的颜色
  const colorIndex = hashString(text) % colorPairs.length;
  const { bg, text: textColor } = colorPairs[colorIndex];

  return (
    <Link
      href={`/tags/${slug(text)}`}
      className={`mr-3 px-2 text-sm font-medium rounded-full ${bg} ${textColor} 
        transition-colors duration-200 hover:opacity-80`}
    >
      {text}
    </Link>
  );
};

export default Tag;
