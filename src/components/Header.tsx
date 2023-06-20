import { NavLink } from "react-router-dom";

function Header() {
    return (
        <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                <svg className="bi me-2" width="40" height="32"><use href="#bootstrap" xlinkHref="#bootstrap"></use></svg>
                <span className="fs-4">fc4e-cat-ui</span>
            </a>

            <ul className="nav nav-pills">
                <li className="nav-item nav-link">
                    <NavLink
                        to="/"
                        className={({ isActive, isPending }) =>
                            isPending ? "nav-link pending " : isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li className="nav-item nav-link">
                    <NavLink
                        to="/about"
                        className={({ isActive, isPending }) =>
                            isPending ? "nav-link pending" : isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        About
                    </NavLink>
                </li>
            </ul>
        </header>
    );
}

export default Header;