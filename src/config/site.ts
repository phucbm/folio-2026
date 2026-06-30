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

export const siteConfig: SiteConfig = {
	name: 'Phuc Bui',
	title: 'Phuc Bui — Frontend Engineer',
	description:
		'Phuc Bui — Frontend Engineer based in Ho Chi Minh City. Running Perxel Studio, building OpenWallet.',
	// Set SITE_URL or PUBLIC_SITE_URL to keep canonicals, robots.txt, and the sitemap aligned in each environment.
	siteUrl: normalizedSiteUrl,
	email: 'phucbm.dev@gmail.com',
	locale: 'en-US',
	authorName: 'Phuc Bui',
	authorRole: 'Frontend Engineer',
	keywords: [
		'Phuc Bui',
		'AI engineer',
		'frontend developer',
		'web studio',
		'Perxel',
		'GSAP',
		'Next.js',
		'motion-rich websites',
	],
	ogImage: '/og-image.png',
	navLinks: [
		{ href: '/work', label: 'Work' },
		{ href: '/about', label: 'About' },
		{ href: '/resume', label: 'Resume' },
	],
	extraPages: [],
	legalLinks: [],
	socialLinks: [
		{ href: 'https://github.com/phucbm', label: 'GitHub' },
		{ href: 'https://x.com/phucbm_', label: 'X' },
		{ href: 'https://www.linkedin.com/in/phucbm/', label: 'LinkedIn' },
		{ href: 'https://discord.gg/9UFRcUZtPp', label: 'Discord' },
	],
};
