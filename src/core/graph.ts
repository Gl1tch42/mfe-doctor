import type { FederationGraph, ParsedConfig, SharedPackageInfo } from './types';

export function buildFederationGraph(configs: ParsedConfig[]): FederationGraph {
  const sharedPackages: Record<string, SharedPackageInfo> = {};

  for (const config of configs) {
    for (const shared of config.shared) {
      const declaredIn = sharedPackages[shared.packageName]?.declaredIn ?? [];
      declaredIn.push({
        configPath: config.filePath,
        requiredVersion: shared.requiredVersion,
        singleton: shared.singleton,
        eager: shared.eager,
      });
      sharedPackages[shared.packageName] = {
        packageName: shared.packageName,
        declaredIn,
      };
    }
  }

  return {
    host: configs.find((c) => c.remotes.length > 0),
    remotes: configs.filter((c) => c.exposes.length > 0),
    sharedPackages,
  };
}
