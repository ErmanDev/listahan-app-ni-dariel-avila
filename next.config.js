/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle TipTap and ProseMirror modules
    config.module.rules.push({
      test: /\.(mjs|js|jsx|ts|tsx)$/,
      include: [
        /node_modules\/@tiptap/,
        /node_modules\/prosemirror-/
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          cacheDirectory: true,
        },
      },
    });

    // Add source maps for better error tracking
    config.devtool = 'source-map';

    // Configure module resolution
    config.resolve.modules = ['node_modules', '.'];
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

    // Add a custom rule for handling JSON files
    config.module.rules = config.module.rules.map(rule => {
      if (rule.test?.test?.('.json')) {
        return {
          ...rule,
          type: 'javascript/auto'
        };
      }
      return rule;
    });

    return config;
  },
  // Disable experimental features
  experimental: {
    optimizePackageImports: [],
    esmExternals: 'loose'
  },
  // Transpile TipTap modules
  transpilePackages: [
    '@tiptap/core',
    '@tiptap/pm',
    '@tiptap/starter-kit',
    '@tiptap/extension-heading',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-text-align',
    '@tiptap/extension-underline',
    '@tiptap/react',
    'prosemirror-keymap',
    'prosemirror-model',
    'prosemirror-state',
    'prosemirror-view'
  ]
};

module.exports = nextConfig;
