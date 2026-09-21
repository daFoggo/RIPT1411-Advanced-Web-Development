import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./locales";
import { getLocaleFromPathname } from "./locales";
import type { Messages } from "./resources";
import { messages } from "./resources";

type Join<TKey extends string, TParam extends string> = TParam extends ""
	? TKey
	: `${TKey}.${TParam}`;

type Paths<T> = T extends object
	? {
			[TKey in keyof T]-?: TKey extends string
				? TKey | Join<TKey, Paths<T[TKey]>>
				: never;
		}[keyof T]
	: "";

export type Namespace = keyof Messages;

export type MessageKey = Paths<Messages>;

export type MessageKeyOf<TName extends Namespace> = Paths<Messages[TName]>;

const resolve = (table: unknown, key: string): string => {
	const value = key
		.split(".")
		.reduce<unknown>(
			(acc, part) => (acc as Record<string, unknown>)[part],
			table,
		);
	return typeof value === "string" ? value : key;
};

export const createT = <TNamespace extends Namespace | undefined>(
	locale: Locale,
	namespace?: TNamespace,
): ((
	key: TNamespace extends Namespace ? MessageKeyOf<TNamespace> : MessageKey,
) => string) => {
	const table = namespace ? messages[locale][namespace] : messages[locale];
	return (key: string): string => resolve(table, key);
};

interface II18nContext {
	locale: Locale;
	pathname: string;
	t: (key: MessageKey) => string;
}

const I18nContext = createContext<II18nContext | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
	const t = useMemo(() => createT(locale), [locale]);

	return (
		<I18nContext.Provider value={{ locale, pathname, t }}>
			{children}
		</I18nContext.Provider>
	);
};

export function useI18n(): II18nContext;
export function useI18n<TName extends Namespace>(
	namespace: TName,
): {
	locale: Locale;
	pathname: string;
	t: (key: MessageKeyOf<TName>) => string;
};
export function useI18n<TName extends Namespace>(namespace?: TName) {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error("useI18n must be used within <I18nProvider>");
	}
	if (namespace) {
		return {
			locale: ctx.locale,
			pathname: ctx.pathname,
			t: createT(ctx.locale, namespace),
		};
	}
	return ctx;
}
