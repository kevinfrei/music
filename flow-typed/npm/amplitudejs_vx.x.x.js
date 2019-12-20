// flow-typed signature: a326a6266c8e3e0db4c74854e9115d2d
// flow-typed version: <<STUB>>/amplitudejs_v^5.0.3/flow_v0.114.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'amplitudejs'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

export type Song = {
  name?: string,
  artist?: string,
  album?: string,
  url: string,
  cover_art_url?: string
};

declare module 'amplitudejs' {
  declare module.exports: {
    init: (arg: {
      songs: Array<Song>,
      default_album_art?: string,
      debug?: boolean
    }) => void,
    getActiveSongMetadata: () => ?Song
  };
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */
declare module 'amplitudejs/dist/amplitude' {
  declare module.exports: any;
}

declare module 'amplitudejs/dist/amplitude.min' {
  declare module.exports: any;
}

declare module 'amplitudejs/dist/visualizations/bar' {
  declare module.exports: any;
}

declare module 'amplitudejs/dist/visualizations/frequencyanalyzer' {
  declare module.exports: any;
}

declare module 'amplitudejs/dist/visualizations/michaelbromley' {
  declare module.exports: any;
}

declare module 'amplitudejs/dist/visualizations/template' {
  declare module.exports: any;
}

// Filename aliases
declare module 'amplitudejs/dist/amplitude.js' {
  declare module.exports: $Exports<'amplitudejs/dist/amplitude'>;
}
declare module 'amplitudejs/dist/amplitude.min.js' {
  declare module.exports: $Exports<'amplitudejs/dist/amplitude.min'>;
}
declare module 'amplitudejs/dist/visualizations/bar.js' {
  declare module.exports: $Exports<'amplitudejs/dist/visualizations/bar'>;
}
declare module 'amplitudejs/dist/visualizations/frequencyanalyzer.js' {
  declare module.exports: $Exports<'amplitudejs/dist/visualizations/frequencyanalyzer'>;
}
declare module 'amplitudejs/dist/visualizations/michaelbromley.js' {
  declare module.exports: $Exports<'amplitudejs/dist/visualizations/michaelbromley'>;
}
declare module 'amplitudejs/dist/visualizations/template.js' {
  declare module.exports: $Exports<'amplitudejs/dist/visualizations/template'>;
}
