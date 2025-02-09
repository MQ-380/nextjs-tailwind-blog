# 切换到目标目录
cd /Users/mouizumi/nextjs-tailwind-blog/data/posts

# 使用 for 循环重命名所有 .md 文件
for file in *.md; do
    mv "$file" "${file%.md}.mdx"
done