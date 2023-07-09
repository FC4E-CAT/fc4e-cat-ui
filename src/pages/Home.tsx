import { useContext } from 'react';
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Home() {
  const { keycloak, registered } = useContext(AuthContext)!;
  const { data } = UserAPI.useGetUsers(
    { size: 10, page: 1, sortBy: "asc", token: keycloak?.token, isRegistered: registered },
  );
  console.log(data);
  return (
    <div className="page-center">
      <h2>Welcome to Compliance Assesment Tool</h2>
    </div>
  );
}

export default Home;
