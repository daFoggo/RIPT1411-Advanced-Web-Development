import { spawn } from "node:child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;

async function testDrawer() {
	const chrome = spawn(
		CHROME_PATH,
		["--headless=new", `--remote-debugging-port=${PORT}`, "--no-sandbox"],
		{ stdio: "ignore" },
	);
	try {
		await new Promise((r) => setTimeout(r, 1200));
		const res = await fetch(`http://localhost:${PORT}/json`);
		const targets = await res.json();
		const page = targets.find((t) => t.type === "page") || targets[0];
		const ws = new WebSocket(page.webSocketDebuggerUrl);
		await new Promise((r) => (ws.onopen = r));

		let id = 1;
		const send = (m, p = {}) =>
			new Promise((resolve) => {
				const cur = id++;
				const h = (e) => {
					const msg = JSON.parse(e.data);
					if (msg.id === cur) {
						ws.removeEventListener("message", h);
						resolve(msg.result);
					}
				};
				ws.addEventListener("message", h);
				ws.send(JSON.stringify({ id: cur, method: m, params: p }));
			});

		await send("Page.enable");
		await send("Runtime.enable");
		await send("Page.navigate", { url: "http://localhost:3001/shop" });
		await new Promise((r) => setTimeout(r, 4000));

		// Check ScrollArea and DOM nodes
		const check = await send("Runtime.evaluate", {
			expression: `({
				hasScrollArea: Boolean(document.querySelector('[data-slot="scroll-area"]')),
				hasScrollFade: Boolean(document.querySelector('.scroll-fade-y')),
				domNodes: document.querySelectorAll('*').length
			})`,
			returnByValue: true,
		});
		console.log("ScrollArea check:", check.result?.value);

		// Click Cart Button
		const clickRes = await send("Runtime.evaluate", {
			expression: `(() => {
				const buttons = Array.from(document.querySelectorAll('button'));
				// Cart button has shopping bag icon or aria-label
				const cartBtn = buttons.find(b => b.innerHTML.includes('CartButton') || b.querySelector('svg.tabler-icon-shopping-bag') || b.parentElement?.innerHTML?.includes('shopping-bag'));
				if (cartBtn) {
					cartBtn.click();
					return { clicked: true };
				}
				// fallback: click the last button in header
				const headerBtns = document.querySelectorAll('header button');
				if (headerBtns.length > 0) {
					headerBtns[headerBtns.length - 1].click();
					return { clickedHeaderBtn: true };
				}
				return { clicked: false };
			})()`,
			returnByValue: true,
		});
		console.log("Cart button click:", clickRes.result?.value);

		await new Promise((r) => setTimeout(r, 600));

		const drawerStatus = await send("Runtime.evaluate", {
			expression: `(() => {
				const popup = document.querySelector('[data-slot="drawer-popup"]');
				if (!popup) return { found: false };
				const style = window.getComputedStyle(popup);
				return {
					found: true,
					transform: style.transform,
					transition: style.transition,
					opacity: style.opacity
				};
			})()`,
			returnByValue: true,
		});
		console.log("Drawer animation state:", drawerStatus.result?.value);

		ws.close();
	} finally {
		chrome.kill();
	}
}

testDrawer()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
