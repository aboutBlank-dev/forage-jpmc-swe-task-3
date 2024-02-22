import React, { Component } from "react";
import { Table, TableData } from "@finos/perspective";
import { ServerRespond } from "./DataStreamer";
import { DataManipulator } from "./DataManipulator";
import "./Graph.css";

interface IProps {
  data: ServerRespond[];
}
/**
 * I am unsure where I should explain my reasoning, I will do it all in this comment which hopefully is okay.
 *
 * First of all, I'd like to say that I have learnt a bit about stocks
 * in the process of researching for this exercise, namely "Pairs Trading" and "Convergence Trading"
 * which I found very interesting. So, thank you =)
 *
 * ## I have made a few assumptions:
 * 1. I am expected to use the perspective modules provided by JPMorgan Chase and not the ones from finos.org (which leaves me quite confused as to why the links in resources point to https://perspective.finos.org/)
 * 2. The historical average of the ratio between the two stocks is 1. If I had more time, was I supposed to get that information from the server(12-month average)?
 *
 * ## Changes I made (outside of the ones required by the exercise):
 * 1. Using material-dark theme for the graph and background (personal preference I guess, but for me it's easier on the eyes when staring for a long time.)
 * 2. Made the request made to the python server async, so that the UI doesn't freeze while waiting for the response(more responsive).
 * 3. Made the upper and lower bound be +-5% just so that the ratio actually crosses it at some point(based on test data)
 * 4. Made the graph have a red outline "animation" when the ratio crosses the upper or lower bound.
 *   4.1 This outline disappears when the ratio is back within the bounds. (As the trading oppurtunity is gone)
 *   4.2 I added this since the user might have many different monitors and make it easier/faster to spot in their peripheral vision.
 */

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  async componentDidMount() {
    // Get element from the DOM.
    const elem = (document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown) as PerspectiveViewerElement;

    const schema = {
      price_abc: "float",
      price_def: "float",
      ratio: "float",
      timestamp: "date",
      upper_bound: "float",
      lower_bound: "float",
      trigger_alert: "float",
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = await window.perspective.worker().table(schema);
    }

    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute("view", "y_line");
      elem.setAttribute("row-pivots", '["timestamp"]'); //Maps timestamp to the x-axis
      elem.setAttribute(
        "columns",
        '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'
      );
      elem.setAttribute(
        "aggregates",
        JSON.stringify({
          price_abc: "avg",
          price_def: "avg",
          ratio: "avg",
          timestamp: "distinct count",
          upper_bound: "avg",
          lower_bound: "avg",
          trigger_alert: "avg",
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      const row = DataManipulator.generateRow(this.props.data);
      const elem = (document.getElementsByTagName(
        "perspective-viewer"
      )[0] as unknown) as PerspectiveViewerElement;
      elem.classList.toggle("ratio-alert", row.trigger_alert !== undefined); //Add/Remove ratio-alert class if ratio is above/below the upper/lower bound

      this.table.update(([row] as unknown) as TableData);
    }
  }
}

export default Graph;
