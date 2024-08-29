import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Col, Row } from "react-bootstrap";
import { AuthContext } from "@/auth";
import { useNavigate } from "react-router-dom";
import { APIClient } from "@/api";
import { AxiosError } from "axios";
import { useGetProfile } from "@/api";
import logoOrcid from "@/assets/logo-orcid-id.svg";

type FormData = {
  name: string;
  surname: string;
  email: string;
  orcid_id?: string;
};

export default function ProfileUpdate() {
  const { keycloak, registered } = useContext(AuthContext)!;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  const { data: profileData } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    if (profileData) {
      setValue("name", profileData.name);
      setValue("surname", profileData.surname);
      setValue("email", profileData.email);
      setValue("orcid_id", profileData.orcid_id);
    }
  }, [setValue, profileData]);

  const onSubmit = handleSubmit(async (data) => {
    if (data["orcid_id"] === "" || data["orcid_id"] === null) {
      delete data["orcid_id"];
    }
    try {
      const response = await APIClient(keycloak?.token || "").put<FormData>(
        `/users/profile`,
        data,
      );
      if (response.status === 200) {
        // if all good go back to profile
        navigate("/profile");
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 409) {
        return true;
      } else {
        return false;
      }
    }
  });

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            Update your personal details
            <p className="lead cat-view-lead">
              Fill in the inputs to update your personal details .
            </p>
          </h2>
        </div>
        <div className="col-md-auto  cat-heading-right"></div>
      </div>
      <div className="row py-4 px-4">
        <Form onSubmit={onSubmit}>
          <Row className="mb-2">
            <Col>
              <Form.Group>
                <label htmlFor="inputName">Name (*):</label>
                <input
                  {...register("name", {
                    required: { value: true, message: "Name is required" },
                    minLength: { value: 3, message: "Minimum length is 3" },
                  })}
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="inputName"
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </Form.Group>
            </Col>

            <Col>
              <Form.Group>
                <label htmlFor="inputSurname">Surname (*):</label>
                <input
                  {...register("surname", {
                    required: { value: true, message: "Surname is required" },
                    minLength: { value: 3, message: "Minimum length is 3" },
                  })}
                  type="text"
                  className={`form-control ${errors.surname ? "is-invalid" : ""}`}
                  id="inputSurname"
                />
                {errors.surname && (
                  <div className="invalid-feedback">
                    {errors.surname.message}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Form.Group>
            <label htmlFor="inputEmail">Email address (*):</label>
            <input
              {...register("email", {
                required: { value: true, message: "Email is required" },
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              id="inputEmail"
              aria-describedby="emailHelp"
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </Form.Group>

          <Form.Group className="mt-2">
            <label htmlFor="inputOrcidId">
              <img
                height="16px"
                className="mb-1 me-1"
                src={logoOrcid}
                alt="orcid-id logo"
              />
              ORCID id:
            </label>
            <input
              {...register("orcid_id", {
                pattern: {
                  value: /^(\d{4}-){3}\d{3}(\d|X)$/,
                  message: "Invalid ORCID id",
                },
              })}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              type="orcid_id"
              className={`form-control ${errors.orcid_id ? "is-invalid" : ""}`}
              id="inputOrcidId"
              aria-describedby="emailHelp"
            />
            {errors.orcid_id && (
              <div className="invalid-feedback">{errors.orcid_id.message}</div>
            )}
          </Form.Group>

          <Form.Group className="mt-2">
            <button
              id="submit-button"
              type="submit"
              className="btn btn-light border-black"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/profile");
              }}
              className="btn btn-dark mx-3"
            >
              Cancel
            </button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}
