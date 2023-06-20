import { createContext, useState } from "react";
import RegisterComponent from "./components/Register";

const LibContext = createContext();

function App() {
  const [selectedLib, setSelectedLib] = useState('face-api')

  return (
      <LibContext.Provider value={{selectedLib, setSelectedLib}}>
        <RegisterComponent />
      </LibContext.Provider>
  );
}

export default App;
export { LibContext }
