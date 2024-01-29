# fc4e-cat-ui

The Compliance Assessment Toolkit will support the EOSC PID policy with services to encode, record, and query compliance with the policy. To do so, a wide range of compliance requirements ( TRUST, FAIR, PID Policy, Reproducibility, GDPR, Licences) will be evaluated as use cases for definition of a conceptual model. At the same time, vocabularies, concepts, and designs are intended to be re-usable for other compliance needs: TRUST, FAIR, POSI, CARE, Data Commons, etc. This will be followed by a supporting service specification (the framework), accompanied by development and testing of operational services for PID Policy Compliance monitoring. Though primarily aimed at machine-actionable operations, the API-based services will be complemented by user interfaces to broaden its use.

## Configuration

Before running make sure to configure appropriatelly the `src/keycloak.json` file and the `src/config.json`.

This component refers to the User Interfaces based on the APIs that support the use of the APIs within websites and applications.

## Development / Deployment process

This project was bootstrapped with [Vite](https://vitejs.dev/guide/).

**Available Scripts**

You can run:

- `npm run dev` . Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- `npm run build`. Builds the app for production to the `build` folder.It correctly bundles React in production mode and optimizes the build for the best performance.
