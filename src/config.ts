import configJSON from "./config.json";
import type { Config } from "./types";

const config: Config = configJSON;

const API = config.api;

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
const defaultPublicMotivationId =
  config.default_values?.public_motivation_id || "pid_graph:3E109BBA";

const linksGithub = config.links?.github || "";

const linksDocs = config.links?.docs || "";

const g069Providers: Record<string, string> = config.g069_providers;
const themeAppTitle = config.theme?.app_title ?? "CAT";

const pidSelectionView = config.embedded_views?.pid_selection_view || "";

// some minimal theme configs
const themeFooterDisplay = config.theme?.footer?.display ?? true;
const themeHomeBenefits = config.theme?.home?.display_benefits ?? true;
const themeActorArt = config.theme?.actor_art;
const themeAbout = config.theme?.about?.display ?? true;

const autoSubjectType = config.auto_subject_type ?? "";

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
  defaultPublicMotivationId,
  linksGithub,
  linksDocs,
  g069Providers,
  themeFooterDisplay,
  themeAppTitle,
  themeHomeBenefits,
  themeActorArt,
  themeAbout,
  pidSelectionView,
  autoSubjectType,
};
