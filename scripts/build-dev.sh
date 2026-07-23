#!/bin/bash
# Type check and build for development (.env.development)

set -e

npm run type-check
npm run lint
npm run build:dev
