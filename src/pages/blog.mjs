import { html } from '../../scripts/lib/html.mjs';
import { blog as blogLd } from '../../scripts/lib/jsonld.mjs';
import { paginate } from '../../scripts/lib/content.mjs';
import { section, pageHead } from '../components/sections.mjs';
import { postCard } from '../components/cards.mjs';
import { badgeList, button, emptyState, pagination } from '../components/ui.mjs';

export const POSTS_PER_PAGE = 12;

/** Pagina n del blog; la prima vive su /blog/, le altre su /blog/pagina/n/. */
export function blog(ctx, pageNumber = 1) {
  const { t, data } = ctx;
  const { items, page, pages } = paginate(
    data.posts.filter((p) => p.listed),
    pageNumber,
    POSTS_PER_PAGE,
  );
  const base = ctx.url('blog');
  const hrefFor = (n) => (n === 1 ? base : `${base}${t.lang === 'it' ? 'pagina' : 'page'}/${n}/`);
  const categories = [
    ...new Set(data.posts.filter((p) => p.listed).flatMap((p) => p.categories || [])),
  ];
  return {
    key: 'blog',
    path: hrefFor(page),
    title: page > 1 ? `${t.meta.blog.title} (${t.ui.page} ${page})` : t.meta.blog.title,
    description: t.meta.blog.description,
    jsonld: [blogLd(ctx, items)],
    pageNumber: page,
    pages,
    hrefFor,
    body: html`${pageHead(ctx, {
      title: t.nav.blog,
      intro: t.blog.intro,
      extra: html`<p style="margin-top:var(--space-4)">
        <a href="${ctx.url('services')}#ai-areas">${t.blog.areas}</a>
      </p>`,
    })}
    ${section({
      id: 'latest',
      title: t.blog.latestTitle,
      action: button({ href: ctx.site.social.blog, label: t.blog.allPosts, variant: 'secondary' }),
      body: items.length
        ? html`${
              categories.length
                ? html`<p><strong>${t.blog.categories}</strong></p>
                    ${badgeList(categories)}<br />`
                : ''
            }
            <div class="grid grid--3">${items.map((p) => postCard(p, ctx))}</div>
            ${pagination({ page, pages, hrefFor, t })}`
        : emptyState(t.blog.empty),
    })}`,
  };
}
