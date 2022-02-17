import { SWRConfig } from 'swr';

import { cacheConfig } from '@lib/cache';

export default function Command() {
  return <SWRConfig value={cacheConfig}>{/* Category list */}</SWRConfig>;
}
