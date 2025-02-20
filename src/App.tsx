import { Othello } from "./components/Othello";
import { OthelloContextProvider } from "./components/OthelloContextProvider";

function App() {
  return (
    <>
      <div>
        <OthelloContextProvider>
          <Othello />
        </OthelloContextProvider>
      </div>
    </>
  );
}

export default App;
