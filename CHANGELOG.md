## [1.1.0](https://github.com/gka/schnack/compare/v0.2.3...v1.1.0) (2021-01-16)

### [0.2.3](https://github.com/gka/schnack/compare/v0.2.2...v0.2.3) (2020-05-24)

### [0.2.2](https://github.com/gka/schnack/compare/v0.1.4...v0.2.2) (2019-03-05)


### Features

* **auth:** add facebook oauth ([313f249](https://github.com/gka/schnack/commit/313f249298babfcb9d990957a80689daa54dcb99)), closes [#18](https://github.com/gka/schnack/issues/18)
* **auth:** add google oauth ([0a86479](https://github.com/gka/schnack/commit/0a8647968e70f176e85ce9f63fc287df4908962c)), closes [#17](https://github.com/gka/schnack/issues/17)
* **docs:** add generator ([7269d73](https://github.com/gka/schnack/commit/7269d73b757c12e0700d9bc047fee70f066ac6b3))
* **font:** self host font ([7ee1295](https://github.com/gka/schnack/commit/7ee1295ab6c0f1578fbf2f8566e59a5e5bc60001))
* **importer:** add Wordpress importer ([0f929fb](https://github.com/gka/schnack/commit/0f929fbff9f35f59c0dbda8565298abccafe94d5)), closes [#13](https://github.com/gka/schnack/issues/13)
* **initialization:** create schnack client.js ([4691c7f](https://github.com/gka/schnack/commit/4691c7f13e7fc5d0f149e55307c815369dcd8944))
* **notification:** add support for sendmail notification provider + node v10 support ([2e629f5](https://github.com/gka/schnack/commit/2e629f5c85d48f2b8f4d3a1c22bfd9cf4ac01b6d))
* **notification-url:** Send page URL with notification instead of just slug ([#82](https://github.com/gka/schnack/issues/82)) ([4e5ffae](https://github.com/gka/schnack/commit/4e5ffae5573ec6d7c8478f3fff11a302ee54b0b0))


### Bug Fixes

* **auth:** handle redirect server-side ([30881d8](https://github.com/gka/schnack/commit/30881d88c8747112b3c238c9f2ac86eed2813dd6))
* **build:** minimize and remove log statements ([2e0bf24](https://github.com/gka/schnack/commit/2e0bf24f07839f084550a33c032e21a706f6cbf3))
* **client.js:** set document domain ([cfdf1cb](https://github.com/gka/schnack/commit/cfdf1cb98989fe420fe53f88ac11bcb1e4648757))
* **CORS:** allow to run schnack server and client on localhost ([e724da9](https://github.com/gka/schnack/commit/e724da9f9d8c14401417737801e00b3918295efa))
* **docs:** class instead of id ([ada6104](https://github.com/gka/schnack/commit/ada610441f44cb17f06577be6088c8250f5ebb35))
* **docs:** typo ([9278e30](https://github.com/gka/schnack/commit/9278e308735887ddb42bcd9d1f628bd7058a7d62))
* **migrations:** add unique index on user(provider,provider_id) ([9e36d01](https://github.com/gka/schnack/commit/9e36d0178447397e197c969fc7e03b95098d46c9))
* **pkg:** update marked ([9279191](https://github.com/gka/schnack/commit/92791915f1ec9f9fff2565aeecacfe83653d331b))
* **rollup:** use uglify again ([a8d8aec](https://github.com/gka/schnack/commit/a8d8aece7db5718f1f548c8be7d8d988edd02098))
* **routes:** serve client.js ([59b1f87](https://github.com/gka/schnack/commit/59b1f87e5491630b59dc9c25b5a8a1047fa7462b))
* **RSS:** use temporary site_url ([453d33d](https://github.com/gka/schnack/commit/453d33dcfc450b01543ed1ffccb449740934af87)), closes [#74](https://github.com/gka/schnack/issues/74)
* **slack:** add try/catch ([eedb6c5](https://github.com/gka/schnack/commit/eedb6c59892b3400dca74f71b812c68f754be70c))
* **typo:** fix typo in embedded scripts ([76fd6c0](https://github.com/gka/schnack/commit/76fd6c02db9c4982218fa0abb3ee2f267459cab9)), closes [#69](https://github.com/gka/schnack/issues/69)

### [0.1.4](https://github.com/gka/schnack/compare/0.1.3...v0.1.4) (2017-12-21)


### Features

* **containers:** add Dockerfile ([517df75](https://github.com/gka/schnack/commit/517df75b3e3844486be736a2cefc2d5324212fe0)), closes [#28](https://github.com/gka/schnack/issues/28)
* **importer:** add disqus importer ([5f04ae7](https://github.com/gka/schnack/commit/5f04ae7cd9f85468423a144fe408b86402d395f6))


### Bug Fixes

* url.host != url.hostname ([bd29962](https://github.com/gka/schnack/commit/bd299624793fb8a80adf38eb7dbbacf904fc6a2c))
* **importer:** add npm script ([0171f88](https://github.com/gka/schnack/commit/0171f885723294314c136c1f41c7b0f1093cff23))
* **tmpl:** show reply button on login ([6b2e63e](https://github.com/gka/schnack/commit/6b2e63e4e7a745e28531c809c7a319876a1c0c20))
* **tmpl:** wrap login status in div element ([baa6c2f](https://github.com/gka/schnack/commit/baa6c2f8379dbb53b9df4fbcd09b35396ea126d8))

### [0.1.3](https://github.com/gka/schnack/compare/eddf0948051bcad998fb0f0cb0ff82c7daeaa0dd...0.1.3) (2017-10-25)


### Features

* **auth:** starting integrating Twitter OAuth ([f560ab5](https://github.com/gka/schnack/commit/f560ab50d6def7f65b34b5a91f19ca694f73fa47))
* **migrations:** use sqlite instead of sqlite3 to use migrations ([411545a](https://github.com/gka/schnack/commit/411545a72dd19299aa7a620d5d7703d0645e0dc1))


### Bug Fixes

* **CORS:** add whitelist for trusted domains ([eddf094](https://github.com/gka/schnack/commit/eddf0948051bcad998fb0f0cb0ff82c7daeaa0dd))
* **CORS:** use allow_origin config key instead of cors object ([3bd5aac](https://github.com/gka/schnack/commit/3bd5aac5928ee0afd090e2cdae8b6b8b2de286dd))
* **drafts:** clear textarea on post ([87550e4](https://github.com/gka/schnack/commit/87550e41b35065b0c9ec10d807cfc1d70f67bf5f))
* **drafts:** load draft only if textarea is present ([1db4180](https://github.com/gka/schnack/commit/1db4180ee34d4a655eb476ba0bfbefc17762448b))
* **migrations:** rename migration file to notifications ([795dbbe](https://github.com/gka/schnack/commit/795dbbe2a260ebeb6c911916e78d295834bd201d))
* **push:** use pushover-notifications instead of node-pushover ([01e738e](https://github.com/gka/schnack/commit/01e738e26e41f60106f6f74d5955b04cd5d6f161)), closes [#3](https://github.com/gka/schnack/issues/3)
* **require:** fs was used but not defined ([4dab6d2](https://github.com/gka/schnack/commit/4dab6d22ca2db9bdacf5f4d18ffa43d03a93cfaf))

