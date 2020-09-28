import React from "react";
import Login from "./views/login/login.component";
import ItemsIndex from "./views/items/index.component";
import ItemsItem from "./views/items/item/item.component";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

export default function Routes() {
  return (
    <div>
      <Route path="/" exact component={Login} />
      <Route path="/items" exact component={ItemsIndex} />
      <Route path="/items/:slug" exact component={ItemsItem} />
    </div>
  );
}
