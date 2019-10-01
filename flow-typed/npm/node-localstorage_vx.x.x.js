// flow-typed signature: e56d6636bc5fb7722f51b27cc5d40711
// flow-typed version: <<STUB>>/node-localstorage_v1.3.1/flow_v0.107.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'node-localstorage'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module 'node-localstorage' {
  declare class JSONStorage {
    constructor(location: string): JSONStorage;
    setItem(key: Object, value: Object): void;
    getItem(key: Object): ?Object;
  }
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */
declare module 'node-localstorage/LocalStorage' {
  declare module.exports: any;
}

// Filename aliases
declare module 'node-localstorage/LocalStorage.js' {
  declare module.exports: $Exports<'node-localstorage/LocalStorage'>;
}