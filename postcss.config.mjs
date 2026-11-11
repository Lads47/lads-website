import mediaTokens from './src/styles/media-tokens.json' with { type: 'json' };
export default { plugins: [{ postcssPlugin: 'lumos-media-tokens', AtRule(rule) {
  if (!['media', 'container'].includes(rule.name)) return;
  rule.params = rule.params.replace(/\((--(?:mq|cq)-[\w-]+)\)/g, (_, name) => {
    if (!(name in mediaTokens)) throw rule.error('Unknown media token: ' + name);
    return mediaTokens[name];
  });
} }] };
