import { getSiteConfig } from '../lib/content';

export type SiteLink = {
	href: string;
	label: string;
};

export type SiteConfig = {
	name: string;
	title: string;
	description: string;
	siteUrl: string;
	email: string;
	locale: string;
	authorName: string;
	authorRole: string;
	keywords: string[];
	ogImage: string;
	navLinks: SiteLink[];
	extraPages: SiteLink[];
	legalLinks: SiteLink[];
	socialLinks: SiteLink[];
};

const defaultSiteUrl = 'https://phucbm.com';
const envSiteUrl = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL;
const normalizedSiteUrl = (envSiteUrl || defaultSiteUrl).replace(/\/+$/, '');

const cms = getSiteConfig();

export const siteConfig: SiteConfig = {
	name: cms.name,
	title: cms.title,
	description: cms.description,
	siteUrl: normalizedSiteUrl,
	email: cms.email,
	locale: 'en-US',
	authorName: cms.authorName,
	authorRole: cms.authorRole,
	keywords: cms.keywords ?? [],
	ogImage: cms.ogImage,
	navLinks: cms.navLinks ?? [],
	extraPages: [],
	legalLinks: [],
	socialLinks: cms.socialLinks ?? [],
};
