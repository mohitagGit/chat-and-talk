import React from "react";
import { Link } from "react-router-dom";

const BackToHomeButton = () => {
  return (
    <div
      style={{
        textAlign: "left",
      }}
    >
      <Link
        style={{
          paddingLeft: "10px",
          textDecoration: "underline",
          fontSize: "15px",
          color: "teal",
          fontWeight: "600",
        }}
        to="/chats"
      >
        Back
      </Link>
    </div>
  );
};

export default BackToHomeButton;
