import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERAGE_HTML_PATH = path.resolve(__dirname, "../coverage/index.html");
const OUTPUT_PNG_PATH = path.resolve(__dirname, "../docs/testing/coverage-report.png");

async function captureCoverageScreenshot() {
	console.log(`Loading coverage report from: ${COVERAGE_HTML_PATH}`);

	const chromeProcess = spawn(
		CHROME_PATH,
		[
			"--headless=new",
			`--remote-debugging-port=${PORT}`,
			"--no-sandbox",
			"--disable-gpu",
			"--window-size=1280,800",
		],
		{ stdio: "ignore" },
	);

	try {
		// Wait for debugging port
		let targets = null;
		for (let i = 0; i < 30; i++) {
			try {
				const res = await fetch(`http://localhost:${PORT}/json`);
				if (res.ok) {
					targets = await res.json();
					break;
				}
			} catch {
				await new Promise((r) => setTimeout(r, 200));
			}
		}

		if (!targets || targets.length === 0) {
			throw new Error("Failed to connect to Chrome debugging port");
		}

		const pageTarget = targets.find((t) => t.type === "page") || targets[0];
		const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

		await new Promise((resolve, reject) => {
			ws.onopen = resolve;
			ws.onerror = reject;
		});

		let id = 1;
		const pending = new Map();
		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.id && pending.has(msg.id)) {
				pending.get(msg.id)(msg.result);
				pending.delete(msg.id);
			}
		};

		const send = (method, params = {}) =>
			new Promise((resolve) => {
				const msgId = id++;
				pending.set(msgId, resolve);
				ws.send(JSON.stringify({ id: msgId, method, params }));
			});

		await send("Page.enable");
		await send("DOM.enable");

		const fileUrl = `file:///${COVERAGE_HTML_PATH.replace(/\\/g, "/")}`;
		await send("Page.navigate", { url: fileUrl });

		// Wait for rendering
		await new Promise((r) => setTimeout(r, 1200));

		const { data } = await send("Page.captureScreenshot", {
			format: "png",
			captureBeyondViewport: false,
		});

		fs.writeFileSync(OUTPUT_PNG_PATH, Buffer.from(data, "base64"));
		console.log(`Coverage report screenshot successfully saved to: ${OUTPUT_PNG_PATH}`);

		ws.close();
	} finally {
		chromeProcess.kill();
	}
}

captureCoverageScreenshot().catch((err) => {
	console.error("Screenshot error:", err);
	process.exit(1);
});
