import { useContext, useState, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { UserAPI, ValidationAPI, OrganisationAPI, ActorAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Validations() {
  const { keycloak, registered } = useContext(AuthContext)!;

  UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  const { data: actorsData } = ActorAPI.useGetActors(
    { size: 20, page: 1, sortBy: "asc", token: keycloak?.token, isRegistered: registered }
  );

  const [actors, setActors] = useState<Actor[]>();
  useEffect(() => {
    setActors(actorsData?.content);
  }, [actorsData]);

  type FormValues = {
    organisation_role: string;
    organisation_id: string;
    organisation_source: string;
    organisation_name: string;
    organisation_website: string;
    actor_id: number;
  };

  const [organisation_id, setOrganisationID] = useState("");
  const [actor_id, setActorID] = useState(-1);
  const [organisation_name, setOrganisationName] = useState("");
  const [organisation_role, setOrganisationRole] = useState("");
  const [organisation_source, setOrganisationSource] = useState("ROR");
  const [organisation_website, setOrganisationWebsite] = useState("");
  const [inputValue, setInputValue] = useState("");

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>(
    {
      defaultValues: {
        organisation_role: organisation_role,
        organisation_id: organisation_id,
        organisation_source: organisation_source,
        organisation_name: organisation_name,
        organisation_website: organisation_website,
        actor_id: actor_id
      }
    }
  );

  const { refetch: refetchValidationRequest } = ValidationAPI.useValidationRequest(
    {
      organisation_role: organisation_role,
      organisation_id: organisation_id,
      organisation_source: organisation_source,
      organisation_name: organisation_name,
      organisation_website: organisation_website,
      actor_id: actor_id,
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  const { data: organisations } = OrganisationAPI.useOrganisationRORSearch(
    {
      name: inputValue,
      page: 1,
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  const onSubmit: SubmitHandler<FormValues> = data => {
    console.log(data);
    setOrganisationRole(data.organisation_role);
    setOrganisationID(data.organisation_id);
    setOrganisationSource(data.organisation_source);
    setOrganisationName(data.organisation_name);
    setOrganisationWebsite(data.organisation_website);
    setActorID(data.actor_id);
    setTimeout(() => {
      refetchValidationRequest();
    }, 1000);
    
  };

  const renderOptions = () => {
    let tmp = [];
    let result: OrganisationRORSearchResultModified[] = [];
    if (organisations?.content) {
      tmp = organisations?.content;
      var i;
      for (i = 0; i < tmp.length; i++) {
        let t: OrganisationRORSearchResultModified = {
          value: tmp[i]["name"],
          label: tmp[i]["name"],
          website: tmp[i]["website"],
          id: tmp[i]["id"]
        };
        result.push(t);
      }
      return result;
    }
    else return [];
  };

  const updateForm = (s: SingleValue<OrganisationRORSearchResultModified>) => {
    setValue("organisation_id", s?.id || "");
    setValue("organisation_name", s?.value || "");
    setValue("organisation_website", s?.website || "");
  };

  const actors_select_div = (
    <>
      <label htmlFor="actors" className="form-label fw-bold">
        Actor
      </label>
      <select
        className={`form-select ${errors.actor_id ? "is-invalid" : ""}`}
        id="actor_id"
        {...register("actor_id",
          {
            // onChange: (e) => { actor_id.current = e.target.value; },
            required: true
          })}>
        <option disabled value={-1}>
          Select Actor
        </option>
        {actors &&
          actors.map((t, i) => {
            return (
              <option key={`type-${i}`} value={t.id}>
                {t.name}
              </option>
            );
          })}
      </select>
      <ErrorMessage
        errors={errors}
        name="actor_id"
        render={({ message }) => <p>{message}</p>}
      />
    </>
  );

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_name" className="form-label fw-bold">
            Organization Name
          </label>
          <Select
            className="basic-single"
            classNamePrefix="select"
            onInputChange={(value, _) => setInputValue(value)}
            onChange={(s) => updateForm(s)}
            isSearchable={true}
            name="organisation_name"
            options={renderOptions()}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_role" className="form-label fw-bold">
            Organization Role
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_role ? "is-invalid" : ""}`}
            id="organisation_role"
            aria-describedby="organisation_role_help"
            {...register("organisation_role", {
              // onChange: (e) => { setOrganisationRole(e.target.value) },
              required: { value: true, message: "Organisation Role is required" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_role"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_source" className="form-label fw-bold">
            Organization Source
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_source ? "is-invalid" : ""}`}
            id="organisation_source"
            aria-describedby="organisation_source_help"
            disabled={true}
            {...register("organisation_source", {
              required: { value: true, message: "Organisation Source is required" },
              minLength: { value: 3, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_source"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <label htmlFor="organization_website" className="form-label fw-bold">
            Organization Website
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_website ? "is-invalid" : ""}`}
            id="organisation_website"
            aria-describedby="organisation_website_help"
            disabled={true}
            {...register("organisation_website", {
              required: { value: true, message: "Organisation Website is required" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_website"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          {actors && actors.length > 0
            ? actors_select_div
            : null}
        </div>
        <div className="mb-3 mt-4" style={{ textAlign: "left" }}>
          <button className="btn btn-dark" type="submit">Request validation</button>
        </div>
      </form>
    </div>
  );
}

export default Validations;
