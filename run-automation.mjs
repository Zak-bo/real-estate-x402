import "dotenv/config";
import { processQueue } from "./src/automation/runner.ts";

console.log("Starting real estate automation...");

const results = await processQueue();

console.log("");
console.log("========================================");
console.log("AUTOMATION COMPLETE");
console.log("========================================");
console.log(JSON.stringify(results, null, 2));
