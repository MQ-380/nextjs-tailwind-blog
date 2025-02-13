'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { Radio, RadioGroup } from '@headlessui/react';

import SectionContainer from '@/components/SectionContainer';
import ScrollTop from '@/components/posts/ScrollTop';

import '@/css/post.css';
import { CheckCircleIcon, ChooseIcon } from '@/icons/iconsSvg';

enum LANGUAGE {
  CHN = '中文',
  JPN = '日本語',
  ENG = 'English',
}

export default function About() {
  const searchParams = useSearchParams();
  const search = searchParams.get('lan');
  const [language, setLanguage] = useState(
    search === 'en' ? LANGUAGE.ENG : search === 'ja' ? LANGUAGE.JPN : LANGUAGE.CHN
  );

  const { title, Content } = getContent(language);
  return (
    <SectionContainer>
      <ScrollTop />
      <article>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="prose dark:prose-invert flex max-w-none flex-col pt-10 pb-8">
            <TitleWrapper title={title} language={language} setLanguage={setLanguage} />
            <div className="xl:w-4/5">
              <h3>2025/2</h3>
              {Content}
            </div>
          </div>
        </div>
      </article>
    </SectionContainer>
  );
}

const TitleWrapper = ({
  title,
  language,
  setLanguage,
}: {
  title: string;
  language: string;
  setLanguage: (s: LANGUAGE) => void;
}) => (
  <div className="flex items-center justify-between">
    <h1 className="text-4xl font-bold xl:w-4/5">{title}</h1>
    <RadioGroup
      onChange={(e) => setLanguage(e as LANGUAGE)}
      value={language}
      className="flex flex-col space-x-4"
    >
      {Object.values(LANGUAGE).map((lan) => (
        <Radio value={lan} key={lan} className="group">
          <div className="flex">
            <CheckCircleIcon className="hidden size-6 fill-white transition group-data-[checked]:block" />
            <ChooseIcon className="size-6 fill-white opacity-100 transition group-data-[checked]:hidden" />
            {lan}
          </div>
        </Radio>
      ))}
    </RadioGroup>
  </div>
);

const getContent = (lan: LANGUAGE) => {
  if (lan === LANGUAGE.ENG) {
    return {
      title: 'About Me',
      Content: EnglishInfo(),
    };
  } else if (lan === LANGUAGE.JPN) {
    return {
      title: '自分について',
      Content: JapaneseInfo(),
    };
  } else {
    return {
      title: '关于我',
      Content: ChineseInto(),
    };
  }
};

function ChineseInto() {
  {
    /* eslint-disable */
  }
  return (
    <>
      <h2>自我</h2>
      <p>个人感觉，最难的事情就是认识自己。认识自己的优点，认识自己的缺点。</p>
      <p>
        自我认知上，我有点急性子。对于一件事情可能急切的想要知道结果，而对需要漫长过程的事情失去耐心。
        从学校时期，为了早点知道成绩而去对答案。到工作中，想要快速的完成手上的任务。到生活上，银行的转账，购物的快递等等总希望马上就能到达。
      </p>
      <p>
        急性子这件事情，有时候又没有那么明显，比如在和别人沟通的过程中，也能够适应各种的节奏，宽于待人总是好的。
      </p>
      <p>对自己的长相没有太大的自信，最近在努力健身中，希望可以到标准的身材吧。</p>
      <p>下面，就从工作，技术和生活三个方面展开说说吧。</p>
      <h2>工作</h2>
      <p>在作为前端工程师工作的 6 年中，经历了从 toC 端到 toB 端的各种项目的开发。</p>
      <p>
        在上海京东的工作中，主要从事 toC
        项目的开发。作为中国最大的电商市场之一，我在组内为项目主干-模版进行开发和改善工作，在 3
        年内，在产品经理和后端的沟通配合之下，丰富了项目中的商品，广告，游戏类模板，极大的丰富了业务可以使用的模块和玩法，提升了用户的体验。并且也参与了该项目的性能优化，通过对
        js 代码数量的优化，强化图片懒加载，页面的分页加载等方法，提升了 TP90
        等各项数据指标，平稳地度过了三年来每次的大促活动。同时也在大促中参加了单次使用的游戏项目的开发，开发时间紧，任务重。2
        个月时间开发的项目，在上线后触及了超过 1 亿用户，并且没有被报告重大的问题。
        在工作的过程中，也参与了项目的上线部署工作。从部署前的需求确认，到与后端，产品和测试之间的沟通等，到部署之后的监控查看，确保上线质量。整体了解了整个系统的上线流程。
      </p>
      <p>
        2021年，我从上海来到了日本东京，加入了 JCV。在 JCV 的 3 年多时间里，我和我的 2 名前端同事从
        0 开始完成了 JCV Cloud 这个项目，这个项目为 toB
        的管理系统项目。从一开始的技术选型，到后来的开发工作，和后端的 API
        协调工作等都能够顺利的完成。在这个项目中，我们利用了 NX 的 monorepo，同时开发了一套 design
        system 来应对除了 JCV Cloud 这个主干项目以外的其他项目的前端开发，例如 SSO 的登录页面，JCV
        Cloud 的 on prem 版本等，缩短了新项目的立项到上线的时间。在 JCV 的几年中，同时参与了一些安卓
        App 的开发，学习了 Kotlin 和 Flutter
        等语言，更深层次的了解和掌握了大前端的开发流程，同时也加深了自己学习技能的技巧和能力。
      </p>
      <p>
        因为种种客观原因，在 2024 年 9 月，我被派到了 Softbank 的 AI 战略室。同样进行一个名为
        Softreef 的 AI 管理系统的前端开发。在 1 个月的短时间内，我适应了 Softbank
        的工作节奏，并且加入了他们的开发工作，完成了一些页面的开发和 bug
        的修复，我的加入，一定程度上缩短了当前组内前端开发任务的周转时间。
      </p>
      <p>
        6
        年来，从中国到日本，经手了几个项目，在日常的工作中都能够保质保量的完成分配的任务，并且逐渐提升自己对于项目的掌握程度，提出一些建设性的建议，例如在
        JCV 中就担当了一次安卓开发和一次小的前端项目的具体研究和选型工作，提升了自己除了 coding
        以外的软实力。作为在汉语英语日语三种语言环境中都工作过的前端工程师，深刻意识到不同开发文化中的差异，但因为有了不同环境的经验，也提升了自己的适应能力，可以更快更好的投入新的项目和新的环境中完成工作。
      </p>
      <h2>技术</h2>
      <p>
        平时也会在工作之余关注一些最新的技术动向，例如React的版本更新迭代，最近的19版本中，关于Hooks的改进以及React
        Compiler的发展也十分引人瞩目。
      </p>
      <p>
        也抽空完成了这个博客从最初的wordpress模版，到Jekyll，最终到现在NextJS部署的迭代。每一次过程中都有一点踩坑。
      </p>
      <p>
        平时也会读一些算法方面的书和做一些leetcode，当然有点对于面试的突击。温故而知新，一些基础的算法在潜移默化之中对于日常的开发还是有着一定的帮助。
      </p>
      <p>
        其他方面，对于开发有一些执着，比如减少for循环，尽量利用数组的链式调用（因为这样看起来更厉害一点），还有在react中减少useMemo和useCallback的滥用，当然这个还是希望React
        Compiler能够尽快出稳定版，让开发者摆脱这个烦恼。还有就是function的参数定义用interface而不是type（不知道为什么，习惯罢了）
      </p>
      <h2>生活</h2>
      <p>当然，人生也不能仅仅是工作和技术上的东西。生活也是很重要的。</p>
      <p>
        在最近的几年，感谢逐渐开放的国际环境和日本的假期，利用了几个长假走了一些地方。从美国的东海岸到西海岸，从加拿大到英国。对于世界探索的过程，也是增长自己见识的过程。
      </p>
      <p>当然，也走遍了日本的大大小小地方，铁道的完乘率也即将接近100%。</p>
      <p>
        铁道，作为我来日本的原因之一，也是在生活中不可或缺的一个部分。作为铁道迷，也会去追随一些新线开业和一些特殊的车辆运用。对于铁路的一切，还是十分感兴趣。
      </p>
      <p>
        在旅游的同时，入手了Sony的A7R5相机，开始捣鼓一些摄影，拙作可以参见我的Instagram
        <a href="https://www.instagram.com/mq380" color="blue">
          {' '}
          -&gt; Ins
        </a>
      </p>
      <p>
        古人云，读万卷书行万里路。在行遍天下的过程中，也不能忘记读书。无论是在上海还是东京的家中，都陆陆续续存放了很多书籍。从历史到人文，从经济到政治。读书才能够让人感受到知识海洋的浩瀚无边。
      </p>
      <p>
        目前最喜欢的旅行目的地，大概是纽约。最喜欢的一本书，大概是高华先生所写的《红太阳是如何升起的》
      </p>
      <p>在2024年，完成了ANA的SFC修行，希望未来可以乘坐飞机，探索这个更广阔的世界。</p>
      <p>喜欢听点昭和歌谣，粤语歌，以及一些古典乐。</p>
      <p>
        对于电影不敏感，很少有东西能让我静静地看上几个小时。硬要说的话，个人喜欢王家卫的《重庆森林》和《春光乍泄》两部电影。
      </p>
      <p>游戏盲。尝试过马里奥，塞尔达传说，以及正在尝试异度之刃。</p>
      <h2>总结</h2>
      <p>这就是我，一个平凡的人。感谢大家能够读到这里。</p>
    </>
  );
}

function EnglishInfo() {
  return (
    <>
      <h2>About Myself</h2>
      <p>
        In my opinion, the most challenging thing is understanding oneself - recognizing both our
        strengths and weaknesses.
      </p>
      <p>
        In terms of self-awareness, I tend to be somewhat impatient. I often eagerly want to know
        the results of things and may lose patience with processes that take a long time.{' '}
      </p>
      <p>
        This manifested in checking answers early during school days, wanting to complete tasks
        quickly at work, and always hoping for immediate results in daily life matters like bank
        transfers and shopping deliveries.{' '}
      </p>
      <p>
        However, this impatience isn't always apparent. For instance, when communicating with
        others, I can adapt to various paces, as being patient with people is always beneficial.
      </p>
      <p>
        I'm not very confident about my appearance. I've been working out lately, hoping to achieve
        a standard body shape.
      </p>
      <p>Let me elaborate on three aspects: work, technology, and life.</p>
      <h2>Working Experience</h2>
      <p>
        During my 6 years as a frontend engineer, I have experienced development across various
        projects, from B2C to B2B.
      </p>
      <p>
        While working at JD.com in Shanghai, I primarily focused on B2C project development. As one
        of China's largest e-commerce platforms, I worked on developing and improving the project's
        core templates.
      </p>
      <p>
        Over 3 years, collaborating with product managers and backend developers, I enriched the
        project with product, advertising, and gaming templates, greatly expanding the available
        modules and features while enhancing user experience. I also participated in performance
        optimization, improving various metrics including TP90 through JavaScript code optimization,
        enhanced image lazy loading, and page pagination, successfully handling major promotional
        events over three years.
      </p>
      <p>
        Additionally, I developed time-sensitive gaming projects for promotional events. One
        project, developed within 2 months, reached over 100 million users after launch without any
        major reported issues.
      </p>
      <p>
        During my work, I also participated in project deployment and launch processes. This
        included pre-deployment requirement verification, communication with backend developers,
        product managers and QA teams, as well as post-deployment monitoring to ensure launch
        quality. Through these experiences, I gained a comprehensive understanding of the entire
        system deployment process.
      </p>
      <p>In 2021, I relocated from Shanghai to Tokyo, joining JCV.</p>
      <p>
        During my 3+ years at JCV, I worked with two frontend colleagues to build JCV Cloud from
        scratch, a B2B management system project. We successfully handled everything from initial
        technology selection to development and backend API coordination. In this project, we
        utilized NX's monorepo and developed a design system to support frontend development for
        other projects beyond JCV Cloud, such as SSO login pages and JCV Cloud's on-premises
        version, reducing time-to-market for new projects.
      </p>
      <p>
        During my years at JCV, I also participated in Android app development, learning Kotlin and
        Flutter, which deepened my understanding of full-stack frontend development processes and
        enhanced my skill-learning capabilities.
      </p>
      <p>
        Due to various circumstances, in September 2024, I was assigned to SoftBank's AI Strategy
        Office. There, I worked on frontend development for an AI management system called Softreef.
        Within one month, I adapted to SoftBank's work pace, joined their development efforts, and
        completed various page developments and bug fixes. My addition to the team notably reduced
        the turnaround time for frontend development tasks within the group.
      </p>
      <p>
        Over these 6 years, from China to Japan, I've handled several projects, consistently
        delivering high-quality work while gradually improving my project management capabilities
        and offering constructive suggestions.
      </p>
      <p>
        For example, at JCV, I led research and technology selection for both an Android development
        project and a small frontend project, enhancing my soft skills beyond coding.
      </p>
      <p>
        As a frontend engineer who has worked in Chinese, English, and Japanese language
        environments, I deeply understand the differences in development cultures. These diverse
        experiences have improved my adaptability, allowing me to quickly and effectively integrate
        into new projects and environments to complete work successfully.
      </p>
      <h2>Technical Skills</h2>
      <p>
        I regularly keep up with the latest technology trends, such as React version updates and
        iterations. In the recent version 19, the improvements to Hooks and the development of React
        Compiler have been particularly noteworthy.
      </p>
      <p>
        I've also found time to evolve this blog from its initial WordPress template to Jekyll, and
        finally to its current NextJS deployment. Each transition came with its own learning
        experiences and challenges.
      </p>
      <p>
        I frequently read algorithm-related books and practice on LeetCode, partly for interview
        preparation. Reviewing these fundamentals helps in daily development work in subtle ways.
      </p>
      <p>
        I have some particular coding preferences, such as minimizing for-loops and favoring array
        method chaining (it looks more elegant). I also try to avoid overusing useMemo and
        useCallback in React - though I'm hoping the stable release of React Compiler will help
        developers overcome these concerns. Another habit is preferring interfaces over types for
        function parameter definitions (it's just a personal preference).
      </p>
      <h2>Life</h2>
      <p>Of course, life isn't just about work and technology. Life itself is equally important.</p>
      <p>
        In recent years, thanks to the increasingly open international environment and Japan's
        vacation system, I've taken advantage of several long holidays to travel. From the US East
        Coast to the West Coast, from Canada to the UK. The process of exploring the world is also a
        process of broadening one's horizons.
      </p>
      <p>
        Naturally, I've also traveled throughout Japan, large and small, and my railway completion
        rate is approaching 100%.
      </p>
      <p>
        Railways, being one of my reasons for coming to Japan, are an indispensable part of my life.
        As a railway enthusiast, I follow new line openings and special rolling stock operations. I
        maintain a strong interest in everything related to railways.
      </p>
      <p>
        While traveling, I acquired a Sony A7R5 camera and started exploring photography. You can
        check out my humble work on Instagram
        <a href="https://www.instagram.com/mq380" color="blue">
          {' '}
          -&gt; Ins
        </a>
      </p>
      <p>
        As the ancient saying goes, "Read ten thousand books, travel ten thousand miles." While
        traveling the world, one must not forget to read. Whether in my home in Shanghai or Tokyo,
        I've gradually accumulated many books - from history to humanities, from economics to
        politics. Reading allows one to experience the vastness of knowledge.
      </p>
      <p>
        Currently, my favorite travel destination is probably New York. My favorite book is probably
        "How the Red Sun Rose" by Mr. Gao Hua.
      </p>
      <p>
        In 2024, I completed ANA's SFC status, hoping to explore this broader world by air in the
        future.
      </p>
      <p>
        I enjoy listening to Showa-era Japanese songs, Cantonese songs, and some classical music.
      </p>
      <p>
        I'm not particularly sensitive to movies, and rarely can anything keep me sitting still for
        hours. If I had to name some, I personally like Wong Kar-wai's "Chungking Express" and
        "Happy Together."
      </p>
      <p>
        I'm not much of a gamer. I've tried Mario, The Legend of Zelda, and I'm currently trying
        Xenoblade.
      </p>
      <h2>Conclusion</h2>
      <p>This is who I am, just an ordinary person. Thank you for reading this far.</p>
    </>
  );
}

function JapaneseInfo() {
  return (
    <>
      <h2>自分</h2>
      <p>
        個人的に、最も難しいことは自分を知ることだと感じています。自分の長所を知り、短所を知ること。
      </p>
      <p>
        自己認識として、少し性急な面があります。物事の結果をすぐに知りたがり、長い過程を要することに対して忍耐を失うことがあります。
      </p>
      <p>
        学生時代には早く成績を知りたくて答え合わせをしたり、仕事では手持ちの作業を早く終わらせたがったり、生活面では銀行振込やネットショッピングの配達などすぐに完了することを望んだりします。
      </p>
      <p>
        ただ、この性急さは常に表面に出るわけではありません。例えば、他人とのコミュニケーションでは、様々なペースに適応でき、寛容に接することができます。
      </p>
      <p>
        自分の容姿にはあまり自信がありません。最近ジムに通っていて、標準的な体型になれることを願っています。
      </p>
      <p>以下では、仕事、技術、生活の三つの側面から詳しく説明していきましょう。</p>
      <h2>職歴</h2>
      <p>
        フロントエンドエンジニアとしての6年間で、BtoCからBtoBまでの様々なプロジェクト開発を経験してきました。上海のJD.comでは、主にBtoCプロジェクトの開発に従事しました。
      </p>
      <p>
        中国最大のEコマースプラットフォームの一つとして、チーム内でプロジェクトの基幹となるテンプレートの開発と改善を担当し、
        3年間にわたり、プロダクトマネージャーとバックエンド開発者との連携のもと、商品、広告、ゲームなどのテンプレートを充実させ、
        ビジネスで利用可能なモジュールと機能を大幅に拡充し、ユーザー体験を向上させました。
        また、プロジェクトのパフォーマンス最適化にも携わり、JSコードの最適化、画像の遅延読み込みの強化、
        ページのページネーション読み込みなどの手法を通じて、TP90などの各種指標を改善し、3年間の大規模プロモーションイベントを安定して
        乗り切りました。
      </p>
      <p>
        同時に、プロモーションイベント用の単発ゲームプロジェクトの開発にも参加し、短期間での開発と重要なタスクに取り組みました。2ヶ月間で開発したプロジェクトは、リリース後1億人以上のユーザーに達し、重大な問題報告もありませんでした。
      </p>
      <p>
        業務の中で、プロジェクトのデプロイメント作業にも参加しました。デプロイ前の要件確認から、バックエンド、プロダクト、テストチームとのコミュニケーション、デプロイ後のモニタリングまで、リリース品質を確保しました。システム全体のリリースプロセスを総合的に理解することができました。
      </p>
      <p>2021年、上海から東京に移り、JCVに入社しました。</p>
      <p>
        JCVでの3年以上の期間で、2名のフロントエンド同僚と共にJCV
        Cloudというプロジェクトをゼロから完成させました。このプロジェクトはBtoB向けの管理システムです。技術選定から開発作業、バックエンドAPIとの連携作業まで、すべてを円滑に完了することができました。このプロジェクトでは、NXのmonorepoを活用し、JCV
        Cloud以外の他のプロジェクト（SSOのログインページやJCV
        Cloudのオンプレミス版など）のフロントエンド開発に対応するためのデザインシステムを開発し、新規プロジェクトの立ち上げからリリースまでの時間を短縮しました。
      </p>
      <p>
        JCVでの数年間、Androidアプリの開発にも参加し、KotlinやFlutterなどの言語を学び、フロントエンド開発プロセスへの理解を深め、スキル学習の技術と能力も向上させました。
      </p>
      <p>
        様々な事情により、2024年9月にソフトバンクのAI戦略室に配属されました。SoftreefというAI管理システムのフロントエンド開発に携わっています。1ヶ月という短期間で、ソフトバンクの業務リズムに適応し、開発作業に参加して、複数のページ開発とバグ修正を完了し、チーム内のフロントエンド開発タスクの回転時間を一定程度短縮することができました。
      </p>
      <p>
        6年間、中国から日本まで、複数のプロジェクトを手がけ、日常業務では割り当てられたタスクを質・量ともに確実にこなし、プロジェクトへの理解度を徐々に高め、建設的な提案も行ってきました。例えば、JCVではAndroid開発と小規模フロントエンドプロジェクトの具体的な調査と技術選定を担当し、コーディング以外のソフトスキルも向上させました。中国語、英語、日本語の3つの言語環境で働いたフロントエンドエンジニアとして、異なる開発文化の違いを深く認識していますが、様々な環境での経験により、適応能力も向上し、新しいプロジェクトや環境により早く、より良く取り組んで業務を完了することができるようになりました。
      </p>
      <h2>技術</h2>
      <p>
        普段から最新の技術動向にも注目しています。例えば、Reactのバージョンアップデートや、最近のバージョン19における
        Hooksの改善、React Compilerの発展などが特に注目を集めています。
      </p>
      <p>
        また、このブログを最初のWordPressテンプレートから、Jekyllを経て、現在のNextJSデプロイメントまで進化させることができました。
        それぞれの過程で様々な課題に直面し、解決してきました。
      </p>
      <p>
        日常的にアルゴリズムに関する本を読んだり、LeetCodeで問題を解いたりしています。もちろん、面接対策の面もありますが、
        基本的なアルゴリズムの知識は、知らず知らずのうちに日々の開発作業にも役立っています。
      </p>
      <p>
        開発に関して、いくつかのこだわりがあります。例えば、forループを減らし、配列のメソッドチェーンを活用すること
        （より洗練されて見えるため）や、ReactでのuseMemoとuseCallbackの過度な使用を避けることなどです。
        もちろん、React
        Compilerの安定版がリリースされ、開発者がこの悩みから解放されることを期待しています。
        また、関数のパラメータ定義にはtypeではなくinterfaceを使用する（習慣的なものですが）といった独自のスタイルも持っています。
      </p>
      <h2>生活</h2>
      <p>もちろん、人生は仕事や技術だけではありません。生活も同様に重要です。</p>
      <p>
        ここ数年、国際環境の開放と日本の休暇制度のおかげで、長期休暇を利用していくつかの場所を訪れることができました。アメリカの東海岸から西海岸まで、カナダからイギリスまで。世界を探索する過程は、自分の見識を広げる過程でもあります。
      </p>
      <p>もちろん、日本の大小様々な場所も巡り、鉄道の乗車完遂率も100%に近づいています。</p>
      <p>
        鉄道は、私が日本に来た理由の一つであり、生活に欠かせない部分となっています。鉄道ファンとして、新線開業や特別な車両運用なども追いかけています。鉄道に関するすべてのことに、とても興味があります。
      </p>
      <p>
        旅行の途中で、SonyのA7R5カメラを購入し、写真撮影を始めました。私の拙い作品はInstagramでご覧いただけます
        <a href="https://www.instagram.com/mq380" color="blue">
          {' '}
          -&gt; Ins
        </a>
      </p>
      <p>
        古人は「万巻の書を読み、万里の道を行く」と言いました。世界中を巡る過程で、読書も忘れてはいけません。上海でも東京の家でも、多くの本を徐々に集めてきました。歴史から人文科学まで、経済から政治まで。読書によって、知識の海の広大さを感じることができます。
      </p>
      <p>
        現在の好きな旅行先は、おそらくニューヨークです。最も好きな本は、高華先生の『紅太陽はいかにして昇ったか』でしょう。
      </p>
      <p>2024年には、ANAのSFCを達成し、今後は飛行機でより広い世界を探索していきたいと思います。</p>
      <p>昭和歌謡、広東語の歌、そしてクラシック音楽を聴くのが好きです。</p>
      <p>
        映画にはあまり敏感ではなく、何時間も静かに見られるものは滅多にありません。強いて言えば、個人的にウォン・カーウァイの「重慶森林」と「ブエノスアイレス」の2作品が好きです。
      </p>
      <p>
        ゲームは詳しくありません。マリオ、ゼルダの伝説を試したことがあり、現在はゼノブレイドを試しているところです。
      </p>
      <h2>まとめ</h2>
      <p>これが私です。ごく普通の人間です。ここまで読んでいただき、ありがとうございます。</p>
    </>
  );
}
