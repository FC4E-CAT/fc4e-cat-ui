import config from "./config.json";
import { ApiT } from "./types";

const API: ApiT = config.api;

const relMtvActorId = config.relation_ids.motivation_actor;
const relMtvPrincipleId = config.relation_ids.motivation_principle;
const relMtvPrincpleCriterion =
  config.relation_ids.motivation_principle_criterion;
const relMtvMetricTest = config.relation_ids?.motivation_metric_test || "";
const defaultCriterionType = config.default_values?.criterion_type || "";
const defaultCriterionImperative =
  config.default_values?.criterion_imperative || "";

const defaultMotivationMetricType =
  config.default_values?.motivation_metric_type || "";
const defaultMotivationMetricBenchmarkType =
  config.default_values?.motivation_metric_benchmark_type || "";
const defaultMotivationMetricAlgorithm =
  config.default_values?.motivation_metric_algorithm || "";
const defaultG069userInfo = config.default_values?.g069_param_user_info || "";
const defaultG069tokenIntrospection =
  config.default_values?.g069_param_token_introspection || "";

const linksGithub = config.links?.github || "";

const linksDocs = config.links?.docs || "";

const g069Providers: Record<string, string> = config.g069_providers;

export {
  API,
  relMtvActorId,
  relMtvPrincipleId,
  relMtvPrincpleCriterion,
  relMtvMetricTest,
  defaultCriterionType,
  defaultCriterionImperative,
  defaultMotivationMetricAlgorithm,
  defaultMotivationMetricType,
  defaultMotivationMetricBenchmarkType,
  defaultG069userInfo,
  defaultG069tokenIntrospection,
  linksGithub,
  linksDocs,
  g069Providers,
};
