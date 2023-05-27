import * as kubectl from '@aws-cdk/lambda-layer-kubectl-v26';
import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AlbControllerVersion, Cluster, KubernetesVersion } from 'aws-cdk-lib/aws-eks';
import { Construct } from 'constructs';
import { ArgoEvents, ArgoEventsBus, ArgoEventsSource } from './charts';

export interface MetaflowK8sProps extends StackProps {
  readonly environmentName: string;
}

export class MetaflowK8s extends Stack {
  constructor(scope: Construct, id: string, props: MetaflowK8sProps) {
    super(scope, id);

    const cluster = new Cluster(this, 'Cluster', {
      version: KubernetesVersion.V1_26,
      clusterName: `metaflow-k8s-${props.environmentName}`,
      albController: {
        version: AlbControllerVersion.V2_5_1,
      },
      kubectlLayer: new kubectl.KubectlV26Layer(this, 'Kubectl'),
    });

    cluster.addHelmChart('KubeView', {
      repository: 'https://benc-uk.github.io/kubeview/charts',
      chart: 'kubeview',
      namespace: 'kube-system',
      values: {
        fullnameOverride: 'kubeview',
      },
    });

    const argoEvents = new ArgoEvents(this, 'ArgoEvents', {
      environmentName: props.environmentName,
      cluster: cluster,
    });

    const argoEventsBus = new ArgoEventsBus(this, 'ArgoEventsBus', { environmentName: props.environmentName });
    const argoEventsSource = new ArgoEventsSource(this, 'ArgoEventsSource', { environmentName: props.environmentName });
    argoEventsBus.node.addDependency(argoEvents);
    argoEventsSource.node.addDependency(argoEvents);

    const kubeViewAddress = cluster.getServiceLoadBalancerAddress('kubeview', {
      namespace: 'kube-system',
    });

    new CfnOutput(this, 'KubeViewEndpoint', {
      value: `http://${kubeViewAddress}`,
    });
  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
new MetaflowK8s(app, 'metaflow-k8s', {
  environmentName: 'dev',
  env: devEnv,
});

app.synth();
