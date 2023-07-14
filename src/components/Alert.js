import React from "react";

function Alert({ type, message }) {

    return (
        <div class={`alert alert-${type} alert-dismissible`} role="alert">
            <div>{message}</div>
        </div>
    );
}

export { Alert };