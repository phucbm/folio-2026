// @ts-nocheck
import type { IslandRegistry } from '@tinacms/astro/experimental';
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

import HomeIsland from '../components/islands/HomeIsland.astro';
import AboutIsland from '../components/islands/AboutIsland.astro';
import ResumeIsland from '../components/islands/ResumeIsland.astro';
import WorkIsland from '../components/islands/WorkIsland.astro';
import ProjectIsland from '../components/islands/ProjectIsland.astro';
import FooterIsland from '../components/islands/FooterIsland.astro';

export const islands: IslandRegistry = {
	home: {
		fetch: async (_request, _params) => {
			const [heroRes, projectsRes] = await Promise.all([
				requestWithMetadata(client.queries.hero({ relativePath: 'index.md' })),
				requestWithMetadata(client.queries.projectsConnection()),
			]);
			return {
				data: { hero: heroRes.data?.hero, projectsConnection: projectsRes.data?.projectsConnection },
				errors: heroRes.errors ?? projectsRes.errors,
				query: '',
				variables: {},
			};
		},
		component: HomeIsland,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({
			hero: data.data?.hero,
			projects: data.data?.projectsConnection?.edges?.map((e: any) => e?.node) ?? [],
		}),
	},
	about: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.about({ relativePath: 'index.md' })),
		component: AboutIsland,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ about: data.data?.about }),
	},
	resume: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.resume({ relativePath: 'index.md' })),
		component: ResumeIsland,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ resume: data.data?.resume }),
	},
	work: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.projectsConnection()),
		component: WorkIsland,
		wrapper: { tag: 'main', className: 'works-main' },
		propsFromData: (data: any) => ({ projects: data.data?.projectsConnection?.edges?.map((e: any) => e?.node) ?? [] }),
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
