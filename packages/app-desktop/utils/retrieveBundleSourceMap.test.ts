import { mkdtemp, remove, writeFile } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { pathToFileURL } from 'url';
import retrieveBundleSourceMap from './retrieveBundleSourceMap';

describe('retrieveBundleSourceMap', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), 'retrieveBundleSourceMap-'));
		// No main.bundle.js: the bundle itself must never be read
		await writeFile(join(tempDir, 'main.bundle.js.map'), '{"version":3}');
		await writeFile(join(tempDir, 'other.js'), '//# sourceMappingURL=other.js.map');
		await writeFile(join(tempDir, 'other.js.map'), '{"version":3}');
	});

	afterEach(async () => {
		await remove(tempDir);
	});

	test.each([
		{ toSource: (path: string) => path },
		{ toSource: (path: string) => pathToFileURL(path).href },
	])('should read the sibling map of a bundle without reading the bundle (%#)', ({ toSource }) => {
		const source = toSource(join(tempDir, 'main.bundle.js'));
		expect(retrieveBundleSourceMap(source)).toEqual({ url: `${source}.map`, map: '{"version":3}' });
	});

	test.each([
		'other.js',
		'missing.bundle.js',
	])('should defer to the default handler for %s', (fileName) => {
		expect(retrieveBundleSourceMap(join(tempDir, fileName))).toBeNull();
	});
});
