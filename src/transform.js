import getReactUtils from './utils/ReactUtils';
import getInfrastructureUtils from './utils/InfrastructureUtils';
import componentParserFactory from './parsers/component';
import modelParserFactory from './parsers/model';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root;
  try {
    root = j(file.source);
  } catch (e) {
    console.error(`Error in ${file.path}: ${e}`);
  }

  const ReactUtils = getReactUtils(j);
  const infrastructureUtils = getInfrastructureUtils(j);
  const modelParser = modelParserFactory(j);
  const componentParser = componentParserFactory(j);
  const transformInfo = {
    dispatches: [],
    components: [],
    models: [],
    effects: [],
    reducers: [],
  };

  if (file.path.indexOf('models') > -1) {
    infrastructureUtils.findModels(root, (path) => {
      const { model, effects, reducers, dispatches } = modelParser.parse({
        nodePath: path, jscodeshift: j, filePath: file.path,
      });
      transformInfo.models.push(model);
      transformInfo.effects = transformInfo.effects.concat(effects);
      transformInfo.reducers = transformInfo.reducers.concat(reducers);
      transformInfo.dispatches = transformInfo.dispatches.concat(dispatches);
    });
  }

  if (ReactUtils.hasReact(root)) {
    infrastructureUtils.findComponents(root, (path) => {
      const component = componentParser.parse({ nodePath: path, filePath: file.path, root });
      transformInfo.components.push(component);
      transformInfo.dispatches = transformInfo.dispatches.concat(component.dispatches);
    });
  }

  return [null, transformInfo];
}
