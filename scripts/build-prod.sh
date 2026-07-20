#!/bin/bash
# Type check and build for production (.env.production)

set -e

npm run type-check
npm run build:prod
