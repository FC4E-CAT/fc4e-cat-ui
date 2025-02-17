import { ResponsePage } from "./common";
import { MotivationReference } from "./motivation";

export interface RegistryMetric {
  metric_id: string;
  metric_mtr: string;
  metric_label: string;
  metric_description: string;
  type_algorithm_id: string;
  type_algorithm_label: string;
  type_algorithm_description: string;
  type_metric_id: string;
  type_metric_label: string;
  type_benchmark_id: string;
  type_benchmark_label: string;
  type_benchmark_description: string;
  type_benchmark_patter: string;
  motivation_id: string;
  value_benchmark: string;
  used_by_motivations?: MotivationReference[];
}

export type RegistryMetricResponse = ResponsePage<RegistryMetric[]>;
