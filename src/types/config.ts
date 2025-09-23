export interface Config {
  api: ConfigApi;
  relation_ids: ConfigRelationIds;
  default_values?: ConfigDefaultValues;
  embedded_views?: ConfigEmbeddedViews;
  theme?: ConfigTheme;
  links?: ConfigLinks;
  g069_providers: Record<string, string>;
  auto_subject_type?: string;
}

export type ConfigRelationIds = {
  motivation_principle: string;
  motivation_actor: string;
  motivation_principle_criterion: string;
  motivation_metric_test: string;
};

export type ConfigDefaultValues = {
  criterion_type: string;
  criterion_imperative: string;
  motivation_metric_type: string;
  motivation_metric_algorithm: string;
  motivation_metric_benchmark_type: string;
  g069_param_user_info: string;
  g069_param_token_introspection: string;
  public_motivation_id?: string;
};

export type ConfigLinks = {
  github: string;
  docs: string;
};

export type ConfigApi = {
  base_url: string;
  version: string;
};

export type ConfigEmbeddedViews = {
  pid_selection_view?: string;
};

export type ConfigTheme = {
  app_title?: string;
  actor_art?: Record<string, string>;
  home?: ConfigThemeHome;
  footer?: ConfigThemeFooter;
  about?: ConfigAbout;
};

export type ConfigThemeHome = {
  display_benefits: boolean;
};

export type ConfigThemeFooter = {
  display?: boolean;
};

export type ConfigAbout = {
  display: true;
};
