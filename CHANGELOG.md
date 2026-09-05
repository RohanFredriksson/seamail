# Changelog

## [0.2.1](https://github.com/RohanFredriksson/seamail/compare/seamail-v0.2.0...seamail-v0.2.1) (2026-09-05)


### Bug Fixes

* **outlook:** capture email body via native window surface ([ed5feb0](https://github.com/RohanFredriksson/seamail/commit/ed5feb0326ce5c493e4e6eb5d86d79b993799388))

## [0.2.0](https://github.com/RohanFredriksson/seamail/compare/seamail-v0.1.0...seamail-v0.2.0) (2026-09-03)


### Features

* add automated release-please and npm trusted-publish CI workflows ([894a2ee](https://github.com/RohanFredriksson/seamail/commit/894a2eef58625436b89e2cae8eb275d43ebf518e))
* add cmail list command ([936c02a](https://github.com/RohanFredriksson/seamail/commit/936c02a41cfe8678a3cb8952450a575f5eabb3e4))
* **cli:** friendly error handling for config, registry, and browser launch failures ([8239c6c](https://github.com/RohanFredriksson/seamail/commit/8239c6c67ec296d61bcebe7d4c3c4f441c9a1c68))
* formalize the Cmail lockfile with engine and Playwright version pinning ([500ac68](https://github.com/RohanFredriksson/seamail/commit/500ac687aa8338fa2a0c6c7cbe6a7800b740ffe7))
* **security:** disable JS execution and block live network requests during rendering ([8b97ad7](https://github.com/RohanFredriksson/seamail/commit/8b97ad770be60f8ba36b8f59aac2c271516e9eed))
* simulate mso conditional comments and approximate VML shapes in outlook-classic@v1 ([b441fa9](https://github.com/RohanFredriksson/seamail/commit/b441fa91a8ab954addfbe7732a00c6846f2db9d9))
* **tooling:** add outlook ground-truth fixture/capture scripts ([b01f687](https://github.com/RohanFredriksson/seamail/commit/b01f687a51ea5c82ee71defb2016d4af31388b47))


### Bug Fixes

* **lint:** add Node globals for tools/*.mjs to fix no-undef ESLint errors ([a6138a1](https://github.com/RohanFredriksson/seamail/commit/a6138a1483bc797f391cb455591d21e6ea0cef30))
* **outlook-classic:** align rendering with Outlook ground-truth findings and harden capture tooling ([5677202](https://github.com/RohanFredriksson/seamail/commit/5677202c88c9d9f87692fca34d261b75ae471d2a))
* refresh torture snapshots and raise diffThreshold to tolerate anti-aliasing drift ([49570d9](https://github.com/RohanFredriksson/seamail/commit/49570d97e14cee87af6ab8270011540a4eda1d22))
