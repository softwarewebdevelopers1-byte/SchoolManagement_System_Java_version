import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCHOOL_ID = "1f1a3e27-5023-607b-90c3-f3b32e1126af";
const CLASS_ID = "1f1a3e46-2bef-6aa1-90c3-f3b32e1126af";
const CSV_PATH = path.join(__dirname, "students-1-north.csv");

function request(options, body) {
  return new Promise((resolve, reject) => {
    const mod = options.protocol === "https:" ? https : http;
    const req = mod.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        let text = Buffer.concat(chunks).toString("utf8");
        try {
          text = JSON.parse(text);
        } catch {
          // keep raw text if not JSON
        }
        resolve({ status: res.statusCode, data: text });
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getToken() {
  const token =
    process.env.ADMIN_TOKEN ||
    localStorage.getItem("user")?.token ||
    null;

  if (!token) {
    throw new Error(
      "Missing ADMIN_TOKEN env var or localStorage user token."
    );
  }
  return token;
}

async function loadCsv() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] || "").trim();
    });
    rows.push(obj);
  }
  return rows;
}

async function main() {
  const token = await getToken();
  const rows = await loadCsv();

  const payload = rows.map((row) => ({
    studentFullName: row.studentFullName,
    studentAdm: row.studentAdm || undefined,
    email: row.email || undefined,
    guardianName: row.guardianName || undefined,
    phoneNumber: row.phoneNumber || undefined,
    gender: row.gender || undefined,
    classId: CLASS_ID,
    schoolId: SCHOOL_ID,
  }));

  console.log(`Importing ${payload.length} students...`);

  const res = await request(
    {
      protocol: "http:",
      hostname: "localhost",
      port: 8000,
      path: "/api/register/students/bulk",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    payload
  );

  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(res.data, null, 2));
}

main().catch((err) => {
  console.error("Import failed:", err.message);
  process.exit(1);
});
