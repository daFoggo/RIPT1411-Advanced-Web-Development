import { spawn } from "node:child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const TARGET_URL = process.argv[2] || "http://localhost:3001/shop";

async function runDevToolsAudit() {
	console.log(`Starting Chrome CDP inspection for: ${TARGET_URL}`);
	const chromeProcess = spawn(
		CHROME_PATH,
		[
			"--headless=new",
			`--remote-debugging-port=${PORT}`,
			"--no-sandbox",
			"--disable-gpu",
			"--js-flags=--expose-gc",
		],
		{ stdio: "ignore" },
	);

	try {
		// Wait for debugging port to be ready
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
		const send = (method, params = {}) =>
			new Promise((resolve, reject) => {
				const currentId = id++;
				const handler = (evt) => {
					const msg = JSON.parse(evt.data);
					if (msg.id === currentId) {
						ws.removeEventListener("message", handler);
						if (msg.error) reject(msg.error);
						else resolve(msg.result);
					}
				};
				ws.addEventListener("message", handler);
				ws.send(JSON.stringify({ id: currentId, method, params }));
			});

		await send("Page.enable");
		await send("Runtime.enable");
		await send("DOM.enable");
		await send("Performance.enable");

		console.log("Navigating to page...");
		await send("Page.navigate", { url: TARGET_URL });

		// Wait for load and DOM to settle
		await new Promise((r) => setTimeout(r, 6000));

		// Get DOM size
		const domRes = await send("Runtime.evaluate", {
			expression: "document.querySelectorAll('*').length",
			returnByValue: true,
		});
		const domCount = domRes.result?.value;

		// Get Memory Metrics
		const memRes = await send("Runtime.evaluate", {
			expression: `({
				usedJSHeapMB: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024) * 100) / 100,
				totalJSHeapMB: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024) * 100) / 100,
				jsHeapLimitMB: Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024) * 100) / 100
			})`,
			returnByValue: true,
		});

		// Get Performance Metrics
		const perfMetrics = await send("Performance.getMetrics");
		const metricsMap = {};
		for (const m of perfMetrics.metrics || []) {
			metricsMap[m.name] = m.value;
		}

		// Keystroke Latency Simulation (Typing in the search input)
		const typeBenchRes = await send("Runtime.evaluate", {
			expression: `(() => {
				const input = document.querySelector('input');
				if (!input) return { error: 'No input found' };
				const start = performance.now();
				input.value = 'Pro';
				input.dispatchEvent(new Event('input', { bubbles: true }));
				input.dispatchEvent(new Event('change', { bubbles: true }));
				const duration = performance.now() - start;
				return { inputDurationMs: Math.round(duration * 100) / 100 };
			})()`,
			returnByValue: true,
		});

		const result = {
			url: TARGET_URL,
			domNodeCount: domCount,
			memory: memRes.result?.value,
			performance: {
				jsHeapUsedSizeMB: Math.round((metricsMap.JSHeapUsedSize || 0) / (1024 * 1024) * 100) / 100,
				nodesCount: metricsMap.Nodes,
				documentsCount: metricsMap.Documents,
				jsEventListeners: metricsMap.JSEventListeners,
				layoutDurationSec: Math.round((metricsMap.LayoutDuration || 0) * 1000) / 1000,
				recalcStyleDurationSec: Math.round((metricsMap.RecalcStyleDuration || 0) * 1000) / 1000,
				scriptDurationSec: Math.round((metricsMap.ScriptDuration || 0) * 1000) / 1000,
				taskDurationSec: Math.round((metricsMap.TaskDuration || 0) * 1000) / 1000,
			},
			interaction: typeBenchRes.result?.value,
		};

		console.log("=== CHROME DEVTOOLS PROTOCOL (CDP) METRICS ===");
		console.log(JSON.stringify(result, null, 2));

		ws.close();
		return result;
	} finally {
		chromeProcess.kill();
	}
}

runDevToolsAudit()
	.then((res) => {
		process.exit(0);
	})
	.catch((err) => {
		console.error("CDP inspection failed:", err);
		process.exit(1);
	});
