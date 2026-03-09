import { describe, expect, it } from 'vitest';
import { parse } from '../parse.js';

function parseFixture(fragment: string): unknown {
  const intro = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">`;
  return parse(`${intro}${fragment}</plist>`);
}

describe('parse()', () => {
  describe('null', () => {
    it('should parse a <null> node into a null value', () => {
      expect(parseFixture('<null/>')).toBe(null);
    });
  });

  describe('boolean', () => {
    it('should parse a <true> node into a Boolean `true` value', () => {
      expect(parseFixture('<true/>')).toBe(true);
    });

    it('should parse a <false> node into a Boolean `false` value', () => {
      expect(parseFixture('<false/>')).toBe(false);
    });
  });

  describe('integer', () => {
    it('should throw an Error when parsing an empty integer', () => {
      expect(() => parseFixture('<integer/>')).toThrow();
    });

    it('should parse an <integer> node into a Number', () => {
      expect(parseFixture('<integer>14</integer>')).toBe(14);
    });
  });

  describe('real', () => {
    it('should throw an Error when parsing an empty real', () => {
      expect(() => parseFixture('<real/>')).toThrow();
    });

    it('should parse a <real> node into a Number', () => {
      expect(parseFixture('<real>3.14</real>')).toBe(3.14);
    });
  });

  describe('string', () => {
    it('should parse a self closing string', () => {
      expect(parseFixture('<string/>')).toBe('');
    });

    it('should parse an empty string', () => {
      expect(parseFixture('<string></string>')).toBe('');
    });

    it('should parse the string contents', () => {
      expect(parseFixture('<string>test</string>')).toBe('test');
    });

    it('should parse a string with comments', () => {
      expect(parseFixture('<string>a<!-- comment --> string</string>')).toBe('a string');
    });
  });

  describe('data', () => {
    it('should parse an empty data tag into an empty Buffer', () => {
      const parsed = parseFixture('<data/>');
      expect(Buffer.isBuffer(parsed)).toBe(true);
      expect((parsed as Buffer).toString('utf-8')).toBe('');
    });

    it('should parse a <data> node into a Buffer', () => {
      const parsed = parseFixture('<data>4pyTIMOgIGxhIG1vZGU=</data>');
      expect(Buffer.isBuffer(parsed)).toBe(true);
      expect((parsed as Buffer).toString('utf8')).toBe('✓ à la mode');
    });

    it('should parse a <data> node with newlines into a Buffer', () => {
      const xml = `<data>4pyTIMOgIGxhIG


1v

ZG
U=</data>
`;
      const parsed = parseFixture(xml);
      expect(Buffer.isBuffer(parsed)).toBe(true);
      expect((parsed as Buffer).toString('utf8')).toBe('✓ à la mode');
    });
  });

  describe('date', () => {
    it('should throw an error when parsing an empty date', () => {
      expect(() => parseFixture('<date/>')).toThrow();
    });

    it('should parse a <date> node into a Date', () => {
      const parsed = parseFixture('<date>2010-02-08T21:41:23Z</date>');
      expect(parsed instanceof Date).toBe(true);
      expect((parsed as Date).getTime()).toBe(1265665283000);
    });
  });

  describe('array', () => {
    it('should parse an empty array', () => {
      expect(parseFixture('<array/>')).toEqual([]);
    });

    it('should parse an array with one element', () => {
      expect(parseFixture('<array><true/></array>')).toEqual([true]);
    });

    it('should parse an array with multiple elements', () => {
      expect(parseFixture('<array><string>1</string><string>2</string></array>')).toEqual([
        '1',
        '2',
      ]);
    });

    it('should parse empty elements inside an array', () => {
      expect(parseFixture('<array><string/><false/></array>')).toEqual(['', false]);
    });
  });

  describe('dict', () => {
    it('should throw if key is missing', () => {
      expect(() => parseFixture('<dict><string>x</string></dict>')).toThrow();
    });

    it('should throw if two keys follow each other', () => {
      expect(() => parseFixture('<dict><key>a</key><key>b</key></dict>')).toThrow();
    });

    it('should parse to empty string if value is missing', () => {
      expect(parseFixture('<dict><key>a</key></dict>')).toEqual({ a: '' });
    });

    it('should parse an empty key', () => {
      expect(parseFixture('<dict><key/><string>1</string></dict>')).toEqual({ '': '1' });
    });

    it('should parse an empty value', () => {
      expect(parseFixture('<dict><key>a</key><string/></dict>')).toEqual({ a: '' });
    });

    it('should parse multiple key/value pairs', () => {
      expect(parseFixture('<dict><key>a</key><true/><key>b</key><false/></dict>')).toEqual({
        a: true,
        b: false,
      });
    });

    it('should parse nested data structures', () => {
      expect(parseFixture('<dict><key>a</key><dict><key>a1</key><true/></dict></dict>')).toEqual({
        a: { a1: true },
      });
    });

    it('should throw if key value is __proto__', () => {
      expect(() =>
        parseFixture(
          '<dict><key>__proto__</key><dict><key>length</key><string>polluted</string></dict></dict>',
        ),
      ).toThrow();
    });
  });

  describe('integration', () => {
    it('should parse a plist file with XML comments', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>CFBundleName</key>
    <string>Emacs</string>

    <key>CFBundlePackageType</key>
    <string>APPL</string>

    <!-- This should be the emacs version number. -->

    <key>CFBundleShortVersionString</key>
    <string>24.3</string>

    <key>CFBundleSignature</key>
    <string>EMAx</string>

    <!-- This SHOULD be a build number. -->

    <key>CFBundleVersion</key>
    <string>9.0</string>
  </dict>
</plist>
`;
      expect(parse(xml)).toEqual({
        CFBundleName: 'Emacs',
        CFBundlePackageType: 'APPL',
        CFBundleShortVersionString: '24.3',
        CFBundleSignature: 'EMAx',
        CFBundleVersion: '9.0',
      });
    });

    it('should parse an example "Cordova.plist" file', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>UIWebViewBounce</key>
  <true/>
  <key>TopActivityIndicator</key>
  <string>gray</string>
  <key>EnableLocation</key>
  <false/>
  <key>EnableViewportScale</key>
  <false/>
  <key>AutoHideSplashScreen</key>
  <true/>
  <key>ShowSplashScreenSpinner</key>
  <true/>
  <key>MediaPlaybackRequiresUserAction</key>
  <false/>
  <key>AllowInlineMediaPlayback</key>
  <false/>
  <key>OpenAllWhitelistURLsInWebView</key>
  <false/>
  <key>BackupWebStorage</key>
  <true/>
  <key>ExternalHosts</key>
  <array>
    <string>*</string>
  </array>
  <key>Plugins</key>
  <dict>
    <key>Device</key>
    <string>CDVDevice</string>
    <key>Logger</key>
    <string>CDVLogger</string>
    <key>Compass</key>
    <string>CDVLocation</string>
  </dict>
</dict>
</plist>`;
      expect(parse(xml)).toEqual({
        UIWebViewBounce: true,
        TopActivityIndicator: 'gray',
        EnableLocation: false,
        EnableViewportScale: false,
        AutoHideSplashScreen: true,
        ShowSplashScreenSpinner: true,
        MediaPlaybackRequiresUserAction: false,
        AllowInlineMediaPlayback: false,
        OpenAllWhitelistURLsInWebView: false,
        BackupWebStorage: true,
        ExternalHosts: ['*'],
        Plugins: {
          Device: 'CDVDevice',
          Logger: 'CDVLogger',
          Compass: 'CDVLocation',
        },
      });
    });
  });

  describe('invalid formats', () => {
    it('should fail parsing invalid xml plist', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>test</key>
  <strong>Testing</strong>
  <key>bar</key>
  <string></string>
</dict>
</plist>
`;
      expect(() => parse(xml)).toThrow();
    });

    it('should fail parsing empty strings', () => {
      expect(() => parse('')).toThrow();
    });
  });
});
