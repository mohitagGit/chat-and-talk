import React from "react";
import { Link } from "react-router-dom";

const BackToHomeButton = ({ link }) => {
  const backLink = link ? link : "/chats";
  return (
    <div>
      <Link
        style={{
          textDecoration: "underline",
          fontSize: "15px",
          color: "teal",
          fontWeight: "600",
        }}
        to={backLink}
      >
        Back
      </Link>
    </div>
  );
};

export default BackToHomeButton;
