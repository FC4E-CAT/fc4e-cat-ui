import { useContext, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { UserAPI, ValidationAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Validations() {
  const { keycloak, registered } = useContext(AuthContext)!;

  UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  type FormValues = {
    organisation_role: string;
    organisation_id: string;
    organisation_source: string;
    organisation_name: string;
    organisation_website: string;
    actor_id: number;
  };

  const formValues = useRef<FormValues | {}>({});

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>(
    {
      defaultValues: {
        organisation_role: "",
        organisation_id: "",
        organisation_source: "",
        organisation_name: "",
        organisation_website: "",
        actor_id: 0
      }
    }
  );

  const { refetch } = ValidationAPI.useValidationRequest(
    {
      organisation_id: "00dr28g20",
      actor_id: 1,
      organisation_name: "grnet",
      organisation_role: "Manager",
      organisation_source: "ROR",
      organisation_website: "https://grnet.gr",
      token: keycloak?.token,
      isRegistered: registered
    }
  );

  const onSubmit: SubmitHandler<FormValues> = data => {
    formValues.current = {...data};
    console.log(formValues.current);
    refetch();
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <label htmlFor="organization_role" className="form-label fw-bold">
            Organization Role
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_role ? "is-invalid" : ""}`}
            id="organisation_role"
            aria-describedby="organisation_role_help"
            {...register("organisation_role", {
              required: { value: true, message: "Organisation Role is required" },
              minLength: { value: 3, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_role"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <label htmlFor="organization_id" className="form-label fw-bold">
            Organization ID
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_id ? "is-invalid" : ""}`}
            id="organisation_id"
            aria-describedby="organisation_id_help"
            {...register("organisation_id", {
              required: { value: true, message: "Organisation ID is required" },
              minLength: { value: 3, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_id"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <label htmlFor="organization_source" className="form-label fw-bold">
            Organization Source
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_source ? "is-invalid" : ""}`}
            id="organisation_source"
            aria-describedby="organisation_source_help"
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
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <label htmlFor="organization_name" className="form-label fw-bold">
            Organization Name
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_name ? "is-invalid" : ""}`}
            id="organisation_name"
            aria-describedby="organisation_name_help"
            {...register("organisation_name", {
              required: { value: true, message: "Organisation Name is required" },
              minLength: { value: 3, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_name"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <label htmlFor="organization_website" className="form-label fw-bold">
            Organization Website
          </label>
          <input
            type="text"
            className={`form-control ${errors.organisation_website ? "is-invalid" : ""}`}
            id="organisation_website"
            aria-describedby="organisation_website_help"
            {...register("organisation_website", {
              required: { value: true, message: "Organisation Website is required" },
              minLength: { value: 3, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="organisation_website"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <label htmlFor="actor_id" className="form-label fw-bold">
            Actor ID
          </label>
          <input
            type="number"
            className={`form-control ${errors.actor_id ? "is-invalid" : ""}`}
            id="actor_id"
            aria-describedby="actor_id_help"
            {...register("actor_id", {
              required: { value: true, message: "Actor ID is required" },
              min: { value: 0, message: "Minimum length is 3" }
            })} />
          <ErrorMessage
            errors={errors}
            name="actor_id"
            render={({ message }) => <p>{message}</p>}
          />
        </div>
        <div className="mb-3 mt-4" style={{textAlign: "left"}}>
          <button className="btn btn-dark" type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Validations;
