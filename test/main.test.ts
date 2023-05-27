import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MetaflowK8s } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const stack = new MetaflowK8s(app, 'test', { environmentName: 'test' });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
