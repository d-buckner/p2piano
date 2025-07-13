/**
 * OpenTelemetry instrumentation initialization.
 * 
 * This file MUST be imported before any other imports in main.ts
 * to ensure auto-instrumentation can properly hook into modules
 * before they are loaded.
 * 
 * @see https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/
 */

// Initialize OpenTelemetry before any other imports
import { initializeOtelemetry } from './telemetry/otel';


console.log('Initializing OpenTelemetry instrumentation...');
initializeOtelemetry();
