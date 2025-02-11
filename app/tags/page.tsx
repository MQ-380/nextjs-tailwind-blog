import tagData from 'app/tag-data.json';
import { slug } from 'github-slugger';

import CustomLink from '@/components/Link';
import Tag from '@/components/Tag';

export default async function Page() {
  const tagCounts = tagData as Record<string, number>;
  const tagKeys = Object.keys(tagCounts);

  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a]);

  return (
    <>
      <div className="ivide-gray-200 flex flex-col items-start justify-start divide-y md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
            Tags
          </h1>
        </div>

        <div className="flex max-w-lg flex-wrap">
          {tagKeys.length === 0 && 'No Tags Found'}
          {sortedTags.map((tag) => (
            <div key={tag} className="mt-2 mr-5 mb-2">
              <Tag text={tag} />

              <CustomLink
                href={`/tags/${slug(tag)}`}
                className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
              >
                {` (${tagCounts[tag]})`}
              </CustomLink>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
