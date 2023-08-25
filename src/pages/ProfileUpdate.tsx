import { useContext, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Form, Col, Row } from "react-bootstrap";
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Client from "../api/client";
import { AxiosError } from 'axios';
import { UserAPI } from '../api';

type FormData = {
  name: string;
  surname: string;
  email: string;
};

export default function ProfileUpdate() {
  const { keycloak, registered } = useContext(AuthContext)!;
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const navigate = useNavigate();

  const { data: profileData } = UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered }
  );

  useEffect(() => {
    if (profileData) {
      setValue("name", profileData.name);
      setValue("surname", profileData.surname);
      setValue("email", profileData.email);
    }
  }, [setValue, profileData]);
  
  const onSubmit = handleSubmit(async data => {
    console.log(data);
      try {
        const response = await Client(keycloak.token).put<any>(`/users/profile`,data);
        console.log(response);
        if (response.status === 200) {
          // if all good go back to profile
          navigate("/profile");
        }
        else {
          console.log(response.status)
        }
      } catch (error) {
        const err = error as AxiosError;
        if (err.response?.status === 409) {
          return true;
        }
        else {
          return false;
        }
      }
    
  });



  return (
    <div>
      <h3 className="cat-view-heading">update personal details</h3>
    <Form onSubmit={onSubmit}>
      <Row className="mb-2">
        <Col>
          <Form.Group>
            <label htmlFor="inputName">Name:</label>
            <input {...register("name",{ required: true, minLength: 3 })} type="text" className="form-control" id="inputName" />
            <small id="nameHelp" className="form-text text-muted">Enter your first name. <span className="text-danger">(required)</span></small>
          </Form.Group>
        </Col>
        
        <Col>
          <Form.Group>
            <label htmlFor="inputSurname">Surname:</label>
            <input  {...register("surname",{ required: true, minLength: 3 })} type="text" className="form-control" id="inputSurname" />
            <small id="surnameHelp" className="form-text text-muted">Enter your last name. <span className="text-danger">(required)</span></small>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group>
        <label htmlFor="inputEmail">Email address:</label>
        <input  {...register("email",{ required: true, minLength: 3 })} type="email" className="form-control" id="inputEmail" aria-describedby="emailHelp" />
        <small id="emailHelp" className="form-text text-muted">Please enter a valid email address. <span className="text-danger">(required)</span></small>
      </Form.Group>
      <Form.Group className="mt-2">
        <button type="submit" className="btn btn-light border-black">Submit</button>
        <button type="button"
          onClick={() => {
            navigate("/profile");
          }}
          className="btn btn-dark mx-3">
          Cancel
        </button>
      </Form.Group>

    </Form>
    
    </div>
  );
}