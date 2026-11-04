import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// source-map-support's default handler reads the whole generated file to find its sourceMappingURL comment,
// then caches that copy for the lifetime of the process. Our bundles always have a sibling .map file.
const retrieveBundleSourceMap = (source: string) => {
	if (!source.endsWith('.bundle.js')) return null;
	try {
		const path = source.startsWith('file://') ? fileURLToPath(source) : source;
		return { url: `${source}.map`, map: readFileSync(`${path}.map`, 'utf8') };
	} catch (error) {
		return null;
	}
};

export default retrieveBundleSourceMap;
