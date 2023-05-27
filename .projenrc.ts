import { ArrowParens, TrailingComma } from 'projen/lib/javascript';

const { awscdk } = require('projen');
const cdkVersion = '2.81.0';
const cdkDependencies = [
  `@aws-cdk/aws-batch-alpha@${cdkVersion}-alpha.0`,
  'cdk8s',
  'cdk8s-plus-26',
  '@aws-cdk/lambda-layer-kubectl-v26',
];

const devDependencies = [`aws-cdk@${cdkVersion}`];
const commonIgnore = ['.idea', '.vscode', 'cdk.context.json'];

const project = new awscdk.AwsCdkTypeScriptApp({
  defaultReleaseBranch: 'main',
  name: 'metaflow-k8s-cdk',
  // dependencies
  cdkVersion: cdkVersion,
  deps: cdkDependencies,
  devDeps: devDependencies,
  // Config
  eslintOptions: {
    dirs: ['src', 'test'],
    prettier: true,
  },
  projenrcTs: true,
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 120,
      trailingComma: TrailingComma.ALL,
      arrowParens: ArrowParens.ALWAYS,
      singleQuote: true,
    },
  },
  tsconfig: {
    compilerOptions: {
      lib: ['es2018', 'dom'],
    },
  },
  pullRequestTemplate: false,
  githubOptions: {
    pullRequestLint: false,
  },
  release: false,
  // Ignore files
  gitignore: commonIgnore,
});
project.synth();
