import { configs } from '../vitest.shared.config';

export default configs.backend({
  coverageThresholds: {
    lines: 60,
    functions: 60,
    branches: 80,
    statements: 60,
  },
});