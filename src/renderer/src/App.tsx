import { RouterProvider, createHashRouter } from "react-router-dom";
import DefaultLayout from "./layouts/Default";
import HomePage from "./pages/Home";

const router = createHashRouter([
  {
    path: "/",
    Component: DefaultLayout,
    children: [{ path: "/", Component: HomePage }],
  },
]);

function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
