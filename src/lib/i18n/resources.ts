import type { Locale } from "./locales";
import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enError from "./locales/en/error.json";
import enHome from "./locales/en/home.json";
import viAuth from "./locales/vi/auth.json";
import viCommon from "./locales/vi/common.json";
import viDashboard from "./locales/vi/dashboard.json";
import viError from "./locales/vi/error.json";
import viHome from "./locales/vi/home.json";

const en = {
	common: enCommon,
	home: enHome,
	auth: enAuth,
	error: enError,
	dashboard: enDashboard,
} as const;

export type Messages = typeof en;

const vi = {
	common: viCommon,
	home: viHome,
	auth: viAuth,
	error: viError,
	dashboard: viDashboard,
} satisfies Messages;

export const messages: Record<Locale, Messages> = { en, vi };
