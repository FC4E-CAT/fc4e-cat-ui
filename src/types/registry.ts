import { ResponsePage } from "./common";

export interface RegistryMetric {
  metric_id: string;
  metric_mtr: string;
  metric_label: string;
  metric_description: string;
  type_algorithm_id: string;
  type_algorithm_label: string;
  type_metric_id: string;
  type_metric_label: string;
  type_benchmark_id: string;
  type_benchmark_label: string;
  type_benchmark_description: string;
  motivation_id: string;
  value_benchmark: string;
}

export type RegistryMetricResponse = ResponsePage<RegistryMetric[]>;
