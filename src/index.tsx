import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import impl from "@finos/perspective";

declare global {
  interface Window {
    perspective: typeof impl; // This is how the perspective type is exported (for some reason)
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
