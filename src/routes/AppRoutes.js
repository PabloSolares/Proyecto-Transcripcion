import React from "react";
import {  Route, Routes } from "react-router-dom";
import { Inicio } from "../ui/Inicio";

export const AppRoutes = () => {
    return (
      <div id="content">
  
        {/* <NavBar /> */}
        <Routes>
          <Route path="/" element={<Inicio />} />
        </Routes>
  
      </div>

    );
};
