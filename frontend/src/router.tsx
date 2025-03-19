import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import { OthelloPage } from "./pages/OthelloPage";
import { EntryPage } from "./pages/EntryPage";
import { ErrorPage } from "./pages/ErrorPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route path="" element={<EntryPage />} />
      <Route path="othello" element={<OthelloPage />} />
    </Route>
  )
);

export const Routes = () => <RouterProvider router={router} />;
