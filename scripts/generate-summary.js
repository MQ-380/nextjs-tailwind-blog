import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = './data/posts'
const SUMMARY_LENGTH = 100

async function generateSummary() {
  try {
    // 读取所有 MDX 文件
    const files = await fs.readdir(POSTS_DIR)
    console.log(files);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'))

    for (const file of mdxFiles) {
      const filePath = path.join(POSTS_DIR, file)
      const content = await fs.readFile(filePath, 'utf8')
      
      // 解析 frontmatter 和内容
      const { data, content: mdxContent } = matter(content)
      
      // 提取纯文本内容（移除 markdown 标记和代码块）
      let plainText = mdxContent
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .replace(/\[.*?\]\(.*?\)/g, '$1') // 将链接转换为纯文本
        .replace(/[#*`_]/g, '') // 移除 markdown 标记
        .trim()

      // 提取前 100 个字符作为摘要
      const summary = plainText.slice(0, SUMMARY_LENGTH) + '...'
      
      // 更新 frontmatter
      data.summary = summary
      
      // 重新组合内容
      const updatedContent = matter.stringify(mdxContent, data)
      
      // 写回文件
      await fs.writeFile(filePath, updatedContent)
      
      console.log(`✓ Updated summary for ${file}`)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

generateSummary()