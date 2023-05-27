import path from 'path';
import { Chart, Include } from 'cdk8s';
import { Construct } from 'constructs';

export interface ArgoEventsSourceProps {
  readonly environmentName: string;
}

export class ArgoEventsSource extends Construct {
  public readonly chart: Chart;

  constructor(scope: Construct, id: string, props: ArgoEventsSourceProps) {
    super(scope, id);

    this.chart = new ArgoEventsSourceChart(this, `argo-events-source-${props.environmentName}`);
  }
}

class ArgoEventsSourceChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Include(this, 'argo-events-source-include', {
      url: path.join(__dirname, './include/eventSource.yaml'),
    });
  }
}
