import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from "./redux/store";
import { Toaster } from "react-hot-toast";


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Toaster position="top-right" />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
