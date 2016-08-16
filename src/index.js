import Runner from 'dva-jscodeshift/dist/Runner';
import path from 'path';

export default function parse({ sourcePath, options }) {
  let ignoreConfig = [];
  try {
    const exists = require('fs').statSync(`${sourcePath}/.gitignore`).isFile();
    if (exists) {
      ignoreConfig.push(`${sourcePath}/.gitignore`);
    }
  } catch (e) {
    console.warn('no .gitignore found!');
  }

  return Runner.run(
    path.resolve(path.join(__dirname, './transform.js')),
    [sourcePath],
    {
      extensions: 'js,jsx',
      dry: true,
      ignoreConfig,
      ...options,
    },
  ).then(({ transformInfo }) =>
    transformInfo.reduce((prev, curr) => ({
      models: curr.models ? prev.models.concat(curr.models) : prev.models,
      components: curr.components ? prev.components.concat(curr.components) : prev.components,
    }), {
      models: [],
      components: [],
    })
  );
}
