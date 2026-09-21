export type { Locale } from "./locales";
export {
	DEFAULT_LOCALE,
	getLocaleFromPathname,
	isLocale,
	LOCALES,
} from "./locales";
export type { MessageKey, MessageKeyOf, Namespace } from "./provider";
export { createT, I18nProvider, useI18n } from "./provider";
export type { Messages } from "./resources";
export { messages } from "./resources";
