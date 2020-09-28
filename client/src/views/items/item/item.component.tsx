import React from "react";

export default function ItemsItem(props: any) {
  return <div>A single item: {props.match.params.slug}</div>;
}
