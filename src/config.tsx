import config from "./config.json";
import { ApiT } from "./types";

const API: ApiT = config.api;

const relMtvActorId = config.relation_ids.motivation_actor;
const relMtvPrincipleId = config.relation_ids.motivation_principle;
const relMtvPrincpleCriterion =
  config.relation_ids.motivation_principle_criterion;
export { API, relMtvActorId, relMtvPrincipleId, relMtvPrincpleCriterion };
