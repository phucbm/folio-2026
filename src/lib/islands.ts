// @ts-nocheck
import type { IslandRegistry } from '@tinacms/astro/experimental';
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

export const islands: IslandRegistry = {
	home: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.hero({ relativePath: 'index.md' })),
		component: null,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ hero: data.data?.hero }),
	},
	about: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.about({ relativePath: 'index.md' })),
		component: null,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ about: data.data?.about }),
	},
	resume: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.resume({ relativePath: 'index.md' })),
		component: null,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ resume: data.data?.resume }),
	},
	work: {
		fetch: (_request, _params) =>
			requestWithMetadata(client.queries.projectsConnection()),
		component: null,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ projects: data.data?.projectsConnection?.edges?.map((e: any) => e?.node) ?? [] }),
	},
	project: {
		fetch: (_request, params) =>
			requestWithMetadata(client.queries.projects({ relativePath: params.get('relativePath') ?? '' })),
		component: null,
		wrapper: { tag: 'main' },
		propsFromData: (data: any) => ({ project: data.data?.projects }),
	},
};
