import type { ResponsePage } from "./common";
import type { MotivationReference } from "./motivation";

export interface RegistryMetric {
  metric_id: string;
  metric_mtr: string;
  metric_label: string;
  metric_description: string;
  metric_version?: string;
  metric_versions?: RegistryMetric[];
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

export interface ZenodoAssessmentResponse {
  assessmentId: string;
  depositId: string;
  published_at: string;
  uploaded_at: string;
  is_published: boolean;
  zenodo_state: string;
  doi: string;
  image_url: string;
  target_url: string;
}
