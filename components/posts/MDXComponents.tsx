import NextImage, { ImageProps } from 'next/image';
import { LinkProps } from 'next/link';

import type { MDXComponents } from 'mdx/types';
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm.js';
import Pre from 'pliny/ui/Pre.js';
import TOCInline from 'pliny/ui/TOCInline.js';

import CustomLink from '../Link';
import { Ol, Ul } from './ListItems';

const basePath = process.env.BASE_PATH;

const CustomLinkWrapper = ({
  children,
  ...props
}: Omit<LinkProps, 'href'> & {
  children?: unknown;
  href?: string | undefined;
}) => {
  return (
    <CustomLink {...props} href={props.href || '#'}>
      {children as React.ReactNode}
    </CustomLink>
  );
};

const TableWrapper = ({ children }: { children?: unknown }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table>{children as React.ReactNode}</table>
    </div>
  );
};

const PreWrapper = ({
  children,
  ...props
}: Omit<
  Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>, 'children'>,
  'ref'
> & { children?: unknown }) => {
  return (
    <Pre {...props}>
      <>{children}</>
    </Pre>
  );
};

const Image = ({ src, ...rest }: ImageProps) => (
  <NextImage src={`${basePath || ''}${src}`} {...rest} />
);

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLinkWrapper,
  pre: PreWrapper,
  table: TableWrapper,
  BlogNewsletterForm,
  ul: Ul,
  ol: Ol,
};
