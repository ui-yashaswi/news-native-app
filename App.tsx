import React from "react";
import { StatusBar } from "expo-status-bar";
import NewsApp from "./NewsApp";

const App: React.FC = () => {
  return (
    <>
      <StatusBar style="auto" />
      <NewsApp />
    </>
  );
};

export default App;
