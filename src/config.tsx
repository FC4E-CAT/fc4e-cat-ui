import config from "./config.json";
import { ApiT } from "./types";

const API: ApiT = config.api;

const relMtvActorId = config.relation_ids.motivation_actor;
const relMtvPrincipleId = config.relation_ids.motivation_principle;
export { API, relMtvActorId, relMtvPrincipleId };
