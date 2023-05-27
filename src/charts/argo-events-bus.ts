import path from 'path';
import { Chart, Include } from 'cdk8s';
import { Construct } from 'constructs';

export interface ArgoEventsBusProps {
  readonly environmentName: string;
}

export class ArgoEventsBus extends Construct {
  public readonly chart: Chart;

  constructor(scope: Construct, id: string, props: ArgoEventsBusProps) {
    super(scope, id);

    this.chart = new ArgoEventsBusChart(this, `argo-events-bus-${props.environmentName}`);
  }
}

class ArgoEventsBusChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Include(this, 'argo-events-bus-include', {
      url: path.join(__dirname, './include/eventBus.yaml'),
    });
  }
}
