import React from "react";
import { ErrorBoundary } from "react-error-boundary";

function ControllerError() {
  return <h1>Error accured *e4, trying again</h1>;
}

const TouchPad = () => {
  return (
    <div>
      <h1>Touch pad</h1>
    </div>
  );
};

export default function ControllCard() {
  return (
    <ErrorBoundary fallback={<ControllerError />}>
      <TouchPad />
    </ErrorBoundary>
  );
}
