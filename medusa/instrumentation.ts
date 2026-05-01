/**
 * Medusa v2 instrumentation hook.
 *
 * Runs once at boot. Useful for OpenTelemetry, Sentry, or any other tracing
 * setup. Left as a no-op here so the file is present and discoverable for
 * later observability work.
 *
 * To enable Medusa's built-in OTel instrumentation:
 *   import { registerOtel } from "@medusajs/medusa";
 *   export function register() {
 *     registerOtel({ serviceName: "medusa-server", instrument: { http: true, query: true, workflows: true } });
 *   }
 */
export function register() {
  // no-op — wire up tracing/Sentry here when needed.
}
