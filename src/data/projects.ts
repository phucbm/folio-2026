import type { ImageMetadata } from 'astro';
import openwalletImage from '../assets/images/openwallet.png';
import growticsImage from '../assets/images/growtrics.png';
import dtaLuxuryImage from '../assets/images/dta-luxury.png';
import khatraImage from '../assets/images/khatra.png';

export type Project = {
	name: string;
	title: string;
	description: string;
	background: 'lime' | 'cyan' | 'lavender' | 'mint';
	variant: 'desktop' | 'split' | 'mobile' | 'board';
	href: string;
	image: ImageMetadata;
	alt: string;
	imageClass: string;
};

export const workPageSize = 10;

export const projects: Project[] = [
	{
		name: 'OpenWallet',
		title: 'Vietnamese credit card comparison platform with AI chat that uses real data',
		description:
			'Intent-based ranking engine, 300+ card database, AI chat via MCP server (13 tools, no hallucinated data), Langfuse eval harness, 500+ Vitest test cases. Built solo.',
		background: 'lime',
		variant: 'desktop',
		href: '/work/openwallet',
		image: openwalletImage,
		alt: 'OpenWallet app preview showing personal finance dashboard',
		imageClass: 'project-preview-image',
	},
	{
		name: 'Growtrics',
		title: 'Making learning data feel actionable for educators and learners alike',
		description:
			'An EdTech platform redesign focused on surfacing the right signals for teachers and students in Singapore.',
		background: 'cyan',
		variant: 'split',
		href: '/work/growtrics',
		image: growticsImage,
		alt: 'Growtrics dashboard preview showing learning analytics',
		imageClass: 'project-preview-image',
	},
	{
		name: 'DTA Luxury',
		title: 'A digital presence built for high-end travel experiences in Australia',
		description:
			'Brand-aligned web design for a luxury travel agency — where visual refinement and booking confidence matter equally.',
		background: 'lavender',
		variant: 'desktop',
		href: '/work/dta-luxury',
		image: dtaLuxuryImage,
		alt: 'DTA Luxury website preview showing travel and tourism design',
		imageClass: 'project-preview-image',
	},
	{
		name: 'Khatra',
		title: 'Translating interior design craftsmanship into a considered digital identity',
		description:
			'A web presence for a Vietnamese interior design studio — balancing portfolio presentation with brand personality.',
		background: 'mint',
		variant: 'desktop',
		href: '/work/khatra',
		image: khatraImage,
		alt: 'Khatra interior design studio website preview',
		imageClass: 'project-preview-image',
	},
];
