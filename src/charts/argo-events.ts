import { Cluster } from 'aws-cdk-lib/aws-eks';
import { Construct } from 'constructs';

export interface ArgoEventsProps {
  readonly environmentName: string;
  readonly cluster: Cluster;
}

export class ArgoEvents extends Construct {
  constructor(scope: Construct, id: string, props: ArgoEventsProps) {
    super(scope, id);

    const namespace = 'argo-events';

    props.cluster.addHelmChart(`argo-events${props.environmentName}`, {
      namespace: namespace,
      chart: 'argo-events',
      repository: 'https://argoproj.github.io/argo-helm',
      values: {
        configs: {
          jetstream: {
            versions: [
              {
                configReloaderImage: 'natsio/nats-server-config-reloader:latest',
                metricsExporterImage: 'natsio/prometheus-nats-exporter:latest',
                natsImage: 'nats:latest',
                startCommand: '/nats-server',
                version: 'latest',
              },
              {
                configReloaderImage: 'natsio/nats-server-config-reloader:latest',
                metricsExporterImage: 'natsio/prometheus-nats-exporter:latest',
                natsImage: 'nats:2.9.15',
                startCommand: '/nats-server',
                version: '2.9.15',
              },
            ],
          },
        },
        controller: {
          name: 'controller-manager',
          rbac: {
            enabled: true,
            namespaced: false,
          },
          resources: {
            limits: {
              cpu: '200m',
              memory: '192Mi',
            },
            requests: {
              cpu: '200m',
              memory: '192Mi',
            },
          },
          serviceAccount: {
            create: true,
            name: 'argo-events-events-controller-sa',
          },
        },
        crds: {
          keep: true,
        },
        extraObjects: [
          {
            apiVersion: 'v1',
            kind: 'ServiceAccount',
            metadata: {
              name: 'operate-workflow-sa',
              namespace: namespace,
            },
          },
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'Role',
            metadata: {
              name: 'operate-workflow-role',
              namespace: namespace,
            },
            rules: [
              {
                apiGroups: ['argoproj.io'],
                resources: ['workflows', 'workflowtemplates', 'cronworkflows', 'clusterworkflowtemplates'],
                verbs: ['*'],
              },
            ],
          },
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'RoleBinding',
            metadata: {
              name: 'operate-workflow-role-binding',
              namespace: namespace,
            },
            roleRef: {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'Role',
              name: 'operate-workflow-role',
            },
            subjects: [
              {
                kind: 'ServiceAccount',
                name: 'operate-workflow-sa',
              },
            ],
          },
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'Role',
            metadata: {
              name: 'view-events-role',
              namespace: namespace,
            },
            rules: [
              {
                apiGroups: ['argoproj.io'],
                resources: ['eventsources', 'eventbuses', 'sensors'],
                verbs: ['get', 'list', 'watch'],
              },
            ],
          },
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'RoleBinding',
            metadata: {
              name: 'view-events-role-binding',
              namespace: namespace,
            },
            roleRef: {
              apiGroup: 'rbac.authorization.k8s.io',
              kind: 'Role',
              name: 'view-events-role',
            },
            subjects: [
              {
                kind: 'ServiceAccount',
                name: 'argo-workflows',
                namespace: 'argo-workflows',
              },
            ],
          },
        ],
      },
    });
  }
}
