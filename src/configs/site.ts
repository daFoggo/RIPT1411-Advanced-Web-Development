/**
 * Cấu hình thông tin cơ bản của website như title, description và default metadata.
 * Được sử dụng tập trung cho việc hiển thị page title và hỗ trợ SEO.
 */
export const SITE_CONFIG = {
	metadata: {
		title: "ript1411-advanced-web-development",
		description:
			"Production-ready web application starter built with TanStack Start, React 19, shadcn/ui, Tailwind CSS v4, and Supabase.",
		keywords: [
			"ript1411-advanced-web-development",
			"tanstack start",
			"react 19",
			"shadcn",
			"tailwind v4",
			"supabase",
			"starter template",
		],
	},
	app: {
		title: "ript1411-advanced-web-development",
		slogan: "Production-ready web application starter.",
		url: "https://ript1411-advanced-web-development.vercel.app",
		github: "https://github.com/daFoggo/ript1411-advanced-web-development",
		ogImage: "/og-image.png",
	},
} as const;

export type TSiteConfig = typeof SITE_CONFIG;
