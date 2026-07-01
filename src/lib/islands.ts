// @ts-nocheck
import type { IslandRegistry } from '@tinacms/astro/experimental';
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

import PageIsland from '../components/islands/PageIsland.astro';
import ProjectIsland from '../components/islands/ProjectIsland.astro';
import FooterIsland from '../components/islands/FooterIsland.astro';

export const islands: IslandRegistry = {
	pages: {
		fetch: async (_request, params) => {
			const relativePath = params.get('relativePath') ?? '';
			const needsProjects = ['home.md', 'work.md'].includes(relativePath);
			if (needsProjects) {
				const [pageRes, projectsRes] = await Promise.all([
					requestWithMetadata(client.queries.pages({ relativePath })),
					requestWithMetadata(client.queries.projectsConnection()),
				]);
				return {
					data: { pages: pageRes.data?.pages, projectsConnection: projectsRes.data?.projectsConnection },
					errors: pageRes.errors ?? projectsRes.errors,
					query: '',
					variables: {},
				};
			}
			return requestWithMetadata(client.queries.pages({ relativePath }));
		},
		component: PageIsland,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({
			page: data.data?.pages,
			projects: data.data?.projectsConnection?.edges?.map((e: any) => e?.node) ?? [],
		}),
	},
	project: {
		fetch: (_request, params) =>
			requestWithMetadata(client.queries.projects({ relativePath: params.get('relativePath') ?? '' })),
		component: ProjectIsland,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ project: data.data?.projects }),
	},
	footer: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.siteConfig({ relativePath: 'config.md' })),
		component: FooterIsland,
		wrapper: { tag: 'footer', className: 'shared-footer' },
		propsFromData: (data: any) => ({ site: data.data?.siteConfig }),
	},
};
