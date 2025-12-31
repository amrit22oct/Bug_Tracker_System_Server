import { allowedOrigins, API_VERSION } from "../config/originConfig.js";

const ROLE_PREFIXES = ["admin", "developer", "team-leader"];
const EXCLUDED_PATHS = ["/", "/health", "/favicon.ico"];

export default function envOriginRewrite(req, res, next) {
  const origin = req.headers.origin;

  // 1️⃣ Ignore preflight completely
  if (req.method === "OPTIONS") return next();

  // 2️⃣ Skip excluded paths
  if (EXCLUDED_PATHS.includes(req.path)) return next();

  // 3️⃣ Skip already versioned routes
  if (req.path.startsWith(`/${API_VERSION}/`)) return next();

  // 4️⃣ Only rewrite browser requests from allowed origins
  if (origin && !allowedOrigins.includes(origin)) return next();

  // 5️⃣ Extract first path segment
  const segments = req.path.split("/").filter(Boolean);
  if (!segments.length) return next();

  const firstSegment = segments[0];

  // 6️⃣ Rewrite role-based routes
  if (ROLE_PREFIXES.includes(firstSegment)) {
    const originalUrl = req.url;
    req.url = `/${API_VERSION}${req.url}`;

    console.log(`[REWRITE] ${originalUrl} → ${req.url}`);
  }

  next();
}
