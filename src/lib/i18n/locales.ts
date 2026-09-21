export const LOCALES = ["en", "vi"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale => {
	return LOCALES.includes(value as Locale);
};

export const getLocaleFromPathname = (pathname: string): Locale => {
	const first = pathname.split("/").filter(Boolean)[0];
	return first && isLocale(first) ? first : DEFAULT_LOCALE;
};
