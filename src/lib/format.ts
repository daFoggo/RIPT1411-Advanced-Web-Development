/**
 * Format một giá trị tiền tệ theo USD.
 * DummyJSON trả giá bằng USD nên dùng locale `en-US`.
 */
export const formatPrice = (value: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(value);
