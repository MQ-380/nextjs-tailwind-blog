/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'MQ Blog',
  author: 'Subaru Izumi',
  headerTitle: 'Izumi',
  // Add the self introduction
  description: '🇯🇵 💻生活在东京的前端程序员，除了技术，还有生活。如果想要更详细了解我，请移步About页面。\n A frontend developer living in Tokyo, exploring both tech and life. For more about me, please visit the About page. \n  東京在住のフロントエンドエンジニア。技術だけでなく、生活も大切に。詳しくは About ページをご覧ください。',
  language: 'zh-CN',
  theme: 'system', // system, dark or light
  siteUrl: 'https://mqsh.me',
  siteRepo: 'https://github.com/MQ-380/nextjs-tailwind-blog',
  siteLogo: `${process.env.BASE_PATH || ''}/static/images/avatar.jpeg`,
  socialBanner: `${process.env.BASE_PATH || ''}/static/images/twitter-card.png`,
  email: 'shmao288@gmail.com',
  github: 'https://github.com/mq-380',
  x: 'https://x.com/MQ380',
  instagram: 'https://www.instagram.com/mq380',
  locale: 'zh-CN',
  // set to true if you want a navbar fixed to the top
  stickyNav: true,
  //TODO: ADD Analytics
  analytics: {
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`, // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   appId: 'R2IYF7ETH7',
    //   // Public API key: it is safe to commit it
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata
