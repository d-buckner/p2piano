import { configs } from '../vitest.shared.config';
import coverageThresholds from './coverage.thresholds.json';

export default configs.backend({
  coverageThresholds: {
    lines: coverageThresholds.lines,
    functions: coverageThresholds.functions,
    branches: coverageThresholds.branches,
    statements: coverageThresholds.statements,
  },
});