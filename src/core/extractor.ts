import traverseModule from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import type { ModuleFederationExposeItem, ModuleFederationRemoteItem, ModuleFederationSharedItem, ParsedConfig } from './types';

const traverse = (traverseModule as any).default ?? traverseModule;

function isModuleFederationPlugin(callee: any): boolean {
  if (!callee) {
    return false;
  }

  if (callee.type === 'Identifier' && callee.name === 'ModuleFederationPlugin') {
    return true;
  }

  if (callee.type === 'MemberExpression' && callee.property?.type === 'Identifier') {
    return callee.property.name === 'ModuleFederationPlugin';
  }

  return false;
}

function parseNode(node: any): unknown {
  if (!node) {
    return undefined;
  }

  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'TemplateLiteral':
      if (node.expressions.length === 0) {
        return node.quasis.map((q: any) => q.value.cooked).join('');
      }
      return undefined;
    case 'ObjectExpression': {
      const result: Record<string, unknown> = {};
      for (const prop of node.properties) {
        if (prop.type === 'ObjectProperty') {
          const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
          if (typeof key === 'string') {
            result[key] = parseNode(prop.value);
          }
        }
      }
      return result;
    }
    case 'ArrayExpression':
      return node.elements.map((item: any) => parseNode(item));
    case 'Identifier':
      return node.name;
    default:
      return undefined;
  }
}

function normalizeShared(sharedValue: unknown): ModuleFederationSharedItem[] {
  if (sharedValue == null || typeof sharedValue !== 'object') {
    return [];
  }

  const items: ModuleFederationSharedItem[] = [];

  if (Array.isArray(sharedValue)) {
    for (const item of sharedValue) {
      if (typeof item === 'object' && item !== null) {
        const sharedItem = item as Record<string, unknown>;
        const packageName = typeof sharedItem.packageName === 'string' ? sharedItem.packageName : undefined;
        if (packageName) {
          items.push({
            packageName,
            requiredVersion: typeof sharedItem.requiredVersion === 'string' ? sharedItem.requiredVersion : undefined,
            singleton: typeof sharedItem.singleton === 'boolean' ? sharedItem.singleton : undefined,
            eager: typeof sharedItem.eager === 'boolean' ? sharedItem.eager : undefined,
            version: typeof sharedItem.version === 'string' ? sharedItem.version : undefined,
          });
        }
      }
    }
  } else {
    const objectValue = sharedValue as Record<string, unknown>;
    for (const [packageName, value] of Object.entries(objectValue)) {
      if (typeof value === 'string') {
        items.push({
          packageName,
          requiredVersion: value,
        });
      } else if (typeof value === 'object' && value !== null) {
        const current = value as Record<string, unknown>;
        items.push({
          packageName,
          requiredVersion: typeof current.requiredVersion === 'string' ? current.requiredVersion : undefined,
          singleton: typeof current.singleton === 'boolean' ? current.singleton : undefined,
          eager: typeof current.eager === 'boolean' ? current.eager : undefined,
          version: typeof current.version === 'string' ? current.version : undefined,
        });
      }
    }
  }

  return items;
}

function normalizeExposes(exposesValue: unknown): ModuleFederationExposeItem[] {
  if (!exposesValue || typeof exposesValue !== 'object' || Array.isArray(exposesValue)) {
    return [];
  }

  return Object.entries(exposesValue as Record<string, unknown>)
    .filter(([, value]) => typeof value === 'string')
    .map(([exposeName, exposePath]) => ({
      exposeName,
      path: exposePath as string,
    }));
}

function normalizeRemotes(remotesValue: unknown): ModuleFederationRemoteItem[] {
  if (!remotesValue || typeof remotesValue !== 'object' || Array.isArray(remotesValue)) {
    return [];
  }

  return Object.entries(remotesValue as Record<string, unknown>)
    .filter(([, value]) => typeof value === 'string')
    .map(([remoteName, url]) => ({
      remoteName,
      url: url as string,
    }));
}

export function extractFederationConfig(ast: unknown, filePath: string): ParsedConfig {
  let result: ParsedConfig = {
    filePath,
    exposes: [],
    remotes: [],
    shared: [],
  };

  traverse(ast as any, {
    NewExpression(pathNode: NodePath<any>) {
      const callee = pathNode.node.callee;
      if (!isModuleFederationPlugin(callee)) {
        return;
      }

      const firstArg = pathNode.node.arguments[0];
      if (!firstArg || firstArg.type !== 'ObjectExpression') {
        return;
      }

      const configObject = parseNode(firstArg) as Record<string, unknown>;
      result = {
        filePath,
        name: typeof configObject.name === 'string' ? configObject.name : undefined,
        exposes: normalizeExposes(configObject.exposes),
        remotes: normalizeRemotes(configObject.remotes),
        shared: normalizeShared(configObject.shared),
        raw: configObject,
      };
      pathNode.stop();
    },
  });

  return result;
}
